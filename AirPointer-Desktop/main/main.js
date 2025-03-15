const { app, BrowserWindow, screen } = require("electron");
const serve = require("serve-handler");
const http = require("http");
const path = require("path");
const WebSocket = require("ws");
const { mouse, Point } = require("@nut-tree-fork/nut-js");
const os = require("os");
const { ipcMain } = require("electron");
const fs = require("fs");
const defaultConfigPath = path.join(__dirname,"..","config" ,"default_values_config.json");
const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, "utf-8"));

const CONFIG_PATH = path.join(app.getPath("userData"), "config.json");

// Function to read config from file
function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ port: defaultConfig.websocket.port, password: defaultConfig.websocket.password }, null, 2));
    return { port: defaultConfig.websocket.port, password: defaultConfig.websocket.password };
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH));
}

// Function to write config to file
function writeConfig(newConfig) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2));
}

const config = readConfig();

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address;
      }
    }
  }
  return "127.0.0.1";
}

const LOCAL_IP = getLocalIP();
let PORT = config.port;
let password = config.password;

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
    const server = http.createServer((req, res) => {
      return serve(req, res, {
        public: path.join(__dirname, "../out"),
        cleanUrls: true,
        rewrites: [{ source: "**", destination: "/index.html" }],
      });
    });
    server.listen(0, () => {
      const port = server.address().port;
      win.loadURL(`http://localhost:${port}`);
      console.log(`🚀 Dev Server started at http://localhost:${port}`);
    });
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.webContents.on("did-fail-load", () => {
      win.webContents.reloadIgnoringCache();
    });
  }
  return win;
};

let win = null;
app.on("ready", () => {
  win = createWindow();
  startWebSocket();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

let activeClient = null;
let wss = null;

function startWebSocket() {
  const mainWindow = win;
  wss = new WebSocket.Server({ port: PORT, host: LOCAL_IP });

  wss.on("connection", (ws) => {
    console.log("🔗 New WebSocket Client Connected!");
    if (activeClient) {
      ws.send("CONNECTION_REJECTED");
      ws.close();
      return;
    }
    activeClient = ws;
    let authenticated = false;

    ws.on("message", async (message) => {
      const decodedMessage = message.toString("utf8");

      if (!authenticated) {
        if (decodedMessage === password) {
          authenticated = true;
          ws.send("AUTH_SUCCESS");
          console.log("✅ Authentication Successful");
          mainWindow.webContents.send("websocket-status", {
            status: "Authenticated",
          });
        } else {
          ws.send("AUTH_FAILED");
          console.log("❌ Authentication Failed");
          ws.close();
        }
        return;
      }

      if (authenticated) {
        const data = JSON.parse(decodedMessage);
        console.log("📡 Received Data: ", data);
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
  if (wss) wss.close();
  startWebSocket();
}

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
  writeConfig({ port: config.newPort, password: config.newPassword });
  PORT = config.newPort;
  password = config.newPassword;
  restartWebSocket();
});

ipcMain.handle("get-config", () => {
  return readConfig();
});
