const { app, BrowserWindow, screen } = require("electron");
const serve = require("electron-serve");
const path = require("path");
const WebSocket = require("ws");
const { mouse, Point } = require("@nut-tree-fork/nut-js");
const os = require("os"); // Import OS module
const { ipcMain } = require("electron");
const Store = require("electron-store").default;

const store = new Store();
if (!store.has("port")) {
  store.set("port", 5000);
}
if (!store.has("password")) {
  store.set("password", "admin@1234");
}

function sendConfig() {
  const config = {
    port: store.get("port"),
    password: store.get("password"),
  };
  return config;
}

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address; // Return the first non-internal IPv4 address
      }
    }
  }
  return "127.0.0.1"; // Fallback to localhost
}

const LOCAL_IP = getLocalIP(); // Fetch local IP
let PORT = store.get("port");
let password = store.get("password");

const appServe = app.isPackaged
  ? serve({
      directory: path.join(__dirname, "../out"),
    })
  : null;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    resizable: false,
    autoHideMenuBar: true,
    icon: "./public/icon.png",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      devTools: false,
    },
  });

  if (app.isPackaged) {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", (e, code, desc) => {
      win.webContents.reloadIgnoringCache();
    });
  }

  return win; // Return the window instance
};

let win = null;
app.on("ready", () => {
  win = createWindow(); // Create the window and store the reference
  startWebSocket(); // Pass window instance to WebSocket function
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

let activeClient = null; // Store the active WebSocket client
let wss = null; // Store the WebSocket server instance

function startWebSocket() {
  const mainWindow = win; // Store reference to main window
  wss = new WebSocket.Server({ port: PORT, host: LOCAL_IP });

  wss.on("connection", (ws) => {
    // 🔴 If there's already an active connection, reject the new one
    if (activeClient) {
      console.log(
        "❌ Another client is already connected. Closing new connection.",
      );
      ws.send("CONNECTION_REJECTED");
      ws.close();
      return;
    }

    console.log("✅ WebSocket Client Connected!");
    activeClient = ws; // Store the new active client
    let authenticated = false;

    ws.on("message", async (message) => {
      const decodedMessage = message.toString("utf8");

      if (!authenticated) {
        if (decodedMessage === password) {
          authenticated = true;
          ws.send("AUTH_SUCCESS");
          if (mainWindow) {
            mainWindow.webContents.send("websocket-status", {
              status: "Authenticated",
            });
          }
          console.log("🔐 Authenticated!");
        } else {
          ws.send("AUTH_FAILED");
          console.log("❌ Invalid Password");
          ws.close(); // Close socket if authentication fails
        }
        return;
      }

      if (authenticated) {
        console.log("📩 Received: ", decodedMessage);
        const data = JSON.parse(decodedMessage);
        if (data.cmd === "DEVICE_INFO") {
          mainWindow.webContents.send("device-info", data);
        }

        if (data.cmd === "CONTROL_STATUS") {
          mainWindow.webContents.send("control-status", data);
        }

        if (data.cmd === "AIRMOUSE_STATUS") {
          mainWindow.webContents.send("airmouse-status", data);
        }

        if (data.cmd === "MOUSE_MOVE") {
          const currentPosition = await mouse.getPosition();
          const deltaX = data.x;
          const deltaY = data.y * -1;

          await mouse.move(
            new Point(currentPosition.x + deltaX, currentPosition.y - deltaY),
          );
        }

        if (data.cmd === "MOUSE_LEFT_CLICK") {
          await mouse.leftClick();
        }

        if (data.cmd === "RECENTER_MOUSE") {
          const primaryDisplay = screen.getPrimaryDisplay();
          const { width, height } = primaryDisplay.workAreaSize;

          const centerX = Math.floor(width / 2);
          const centerY = Math.floor(height / 2);

          await mouse.setPosition(new Point(centerX, centerY));
        }
      }
    });

    ws.on("close", () => {
      console.log("❌ WebSocket Client Disconnected");
      if (activeClient === ws) {
        activeClient = null; // Reset active client when it disconnects
      }

      // Notify Renderer Process on disconnect
      if (mainWindow) {
        mainWindow.webContents.send("websocket-status", {
          status: "Disconnected",
        });
      }
    });
  });

  console.log(`🚀 WebSocket server started at ws://${LOCAL_IP}:${PORT}`);
}

function restartWebSocket() {
  if (activeClient) {
    activeClient.close();
    activeClient = null;
  }
  wss.close();
  startWebSocket();
}

// ipcMain handlers (Registered once)
ipcMain.handle("get-server-info", () => {
  return { ip: LOCAL_IP, port: PORT, password: password };
});

ipcMain.handle("disconnect-client", () => {
  if (activeClient) {
    activeClient.close();
    activeClient = null;
  }
});

ipcMain.handle("update-config", (event, config) => {
  console.log("Received config:", config);
  store.set("port", config.newPort);
  store.set("password", config.newPassword);
  PORT = config.newPort;
  password = config.newPassword;
  restartWebSocket();
});

ipcMain.handle("get-config", (event) => {
  return { port: store.get("port"), password: store.get("password") };
});

module.exports = { startWebSocket };
