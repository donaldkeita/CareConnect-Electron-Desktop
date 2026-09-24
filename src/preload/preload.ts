import { contextBridge, ipcRenderer } from "electron";
import type { CareConnectDesktopApi } from "../shared/desktop-api";
import { IPC_CHANNELS } from "../shared/ipc";

const desktopApi: CareConnectDesktopApi = {
  platform: process.platform,
  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.getAppVersion),
};

contextBridge.exposeInMainWorld("careConnectDesktop", desktopApi);
