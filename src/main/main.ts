import path from "node:path";
import { app, BrowserWindow, ipcMain, Menu, screen } from "electron";
import { createApplicationMenuTemplate } from "./application-menu";
import { registerIpcHandlers } from "./ipc-handlers";
import { loadWindowState, trackWindowState } from "./window-state";

const createMainWindow = (): BrowserWindow => {
  const stateFile = path.join(app.getPath("userData"), "window-state.json");
  const savedState = loadWindowState(
    stateFile,
    screen.getAllDisplays().map((display) => display.workArea),
  );
  const window = new BrowserWindow({
    x: savedState.x,
    y: savedState.y,
    width: savedState.width,
    height: savedState.height,
    minWidth: 800,
    minHeight: 600,
    show: false,
    backgroundColor: "#f2f6f8",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  trackWindowState(window, stateFile);
  if (savedState.isMaximized) window.maximize();

  window.once("ready-to-show", () => window.show());
  if (!app.isPackaged) {
    window.webContents.once("did-finish-load", () => {
      window.webContents.openDevTools();
    });
  }

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    void window.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  return window;
};

app.whenReady().then(() => {
  registerIpcHandlers(ipcMain, () => app.getVersion());
  Menu.setApplicationMenu(Menu.buildFromTemplate(createApplicationMenuTemplate()));
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
