import type { IpcMain } from "electron";
import type { CareConnectDesktopApi } from "../../src/shared/desktop-api";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IPC_CHANNELS } from "../../src/shared/ipc";
import { registerIpcHandlers } from "../../src/main/ipc-handlers";

const ipcHarness = vi.hoisted(() => ({
  exposedApi: null as unknown,
  handlers: new Map<string, (...args: any[]) => any>(),
}));

vi.mock("electron", () => ({
  contextBridge: {
    exposeInMainWorld: (_name: string, api: unknown) => {
      ipcHarness.exposedApi = api;
    },
  },
  ipcRenderer: {
    invoke: (channel: string, ...args: unknown[]) => {
      const handler = ipcHarness.handlers.get(channel);
      if (!handler) return Promise.reject(new Error(`No IPC handler for ${channel}`));
      return Promise.resolve(handler({}, ...args));
    },
  },
}));

describe("IPC channel contracts", () => {
  beforeEach(() => {
    ipcHarness.exposedApi = null;
    ipcHarness.handlers.clear();
    vi.resetModules();
  });

  it("uses namespaced, unique channel names", () => {
    const channels = Object.values(IPC_CHANNELS);

    expect(new Set(channels).size).toBe(channels.length);
    expect(channels.every((channel) => channel.includes(":"))).toBe(true);
  });

  it("routes a renderer version request through preload to the main handler", async () => {
    const ipcMain: Pick<IpcMain, "handle"> = {
      handle: (channel, listener) => {
        ipcHarness.handlers.set(channel, listener);
      },
    };
    registerIpcHandlers(ipcMain, () => "test-version");

    await import("../../src/preload/preload");

    expect(ipcHarness.exposedApi).not.toBeNull();
    const desktopApi = ipcHarness.exposedApi as CareConnectDesktopApi;
    expect(desktopApi.platform).toBe(process.platform);
    await expect(desktopApi.getAppVersion()).resolves.toBe("test-version");
  });
});
