const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
  send: (channel, args) => {
    ipcRenderer.send(channel, args);
  },
  invoke: (channel, args) => {
    return ipcRenderer.invoke(channel, args); // Support for ipcMain.handle()
  },
});
