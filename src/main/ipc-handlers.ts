import type { IpcMain } from "electron";
import { IPC_CHANNELS } from "../shared/ipc";

export function registerIpcHandlers(
  ipcMain: Pick<IpcMain, "handle">,
  getAppVersion: () => string,
): void {
  ipcMain.handle(IPC_CHANNELS.getAppVersion, getAppVersion);
}
