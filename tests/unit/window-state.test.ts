import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { BrowserWindow, Rectangle } from "electron";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadWindowState, normalizeWindowState, trackWindowState } from "../../src/main/window-state";

const primaryDisplay = { x: 0, y: 0, width: 1920, height: 1040 };

describe("window state", () => {
  let temporaryDirectory: string;

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "careconnect-window-state-"));
  });

  afterEach(async () => {
    vi.useRealTimers();
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  it("keeps valid visible bounds and maximized state", () => {
    expect(
      normalizeWindowState(
        { x: 120, y: 80, width: 1280, height: 760, isMaximized: true },
        [primaryDisplay],
      ),
    ).toEqual({ x: 120, y: 80, width: 1280, height: 760, isMaximized: true });
  });

  it("falls back when saved values are malformed or too small", () => {
    expect(normalizeWindowState({ x: "bad", width: 300 }, [primaryDisplay])).toEqual({
      x: 360,
      y: 120,
      width: 1200,
      height: 800,
      isMaximized: false,
    });
  });

  it("recovers an off-screen window after a display is disconnected", () => {
    expect(
      normalizeWindowState(
        { x: 2500, y: 100, width: 1200, height: 800, isMaximized: false },
        [primaryDisplay],
      ),
    ).toEqual({ x: 360, y: 120, width: 1200, height: 800, isMaximized: false });
  });

  it("accepts a window that remains meaningfully visible on a secondary display", () => {
    const state = { x: 2000, y: 40, width: 1000, height: 700, isMaximized: false };
    expect(
      normalizeWindowState(state, [primaryDisplay, { x: 1920, y: 0, width: 1920, height: 1040 }]),
    ).toEqual(state);
  });

  it("loads persisted bounds and falls back when the state file is missing or invalid", async () => {
    const stateFile = path.join(temporaryDirectory, "window-state.json");
    const savedState = { x: 120, y: 80, width: 1280, height: 760, isMaximized: true };
    const { writeFile } = await import("node:fs/promises");

    await writeFile(stateFile, JSON.stringify(savedState));
    expect(loadWindowState(stateFile, [primaryDisplay])).toEqual(savedState);

    await writeFile(stateFile, "{invalid json");
    expect(loadWindowState(stateFile, [primaryDisplay])).toEqual({
      x: 360,
      y: 120,
      width: 1200,
      height: 800,
      isMaximized: false,
    });
    expect(loadWindowState(path.join(temporaryDirectory, "missing.json"), [primaryDisplay])).toEqual({
      x: 360,
      y: 120,
      width: 1200,
      height: 800,
      isMaximized: false,
    });
  });

  it("debounces move and resize events before persisting normal bounds", async () => {
    vi.useFakeTimers();
    const stateFile = path.join(temporaryDirectory, "nested", "window-state.json");
    const bounds: Rectangle = { x: 140, y: 90, width: 1300, height: 850 };
    let destroyed = false;
    const listeners = new Map<string, () => void>();
    const window = {
      isDestroyed: () => destroyed,
      getNormalBounds: () => bounds,
      isMaximized: () => false,
      on: (event: string, listener: () => void) => {
        listeners.set(event, listener);
      },
    } as unknown as BrowserWindow;

    trackWindowState(window, stateFile);
    listeners.get("move")?.();
    await vi.advanceTimersByTimeAsync(200);
    listeners.get("resize")?.();
    await vi.advanceTimersByTimeAsync(249);
    await expect(readFile(stateFile, "utf8")).rejects.toThrow();

    await vi.advanceTimersByTimeAsync(1);
    expect(JSON.parse(await readFile(stateFile, "utf8"))).toEqual({
      ...bounds,
      isMaximized: false,
    });

    destroyed = true;
    listeners.get("move")?.();
    await vi.advanceTimersByTimeAsync(250);
    expect(JSON.parse(await readFile(stateFile, "utf8"))).toEqual({
      ...bounds,
      isMaximized: false,
    });
  });

  it("persists immediately on close and when the returned save callback is called", async () => {
    const stateFile = path.join(temporaryDirectory, "window-state.json");
    const bounds: Rectangle = { x: 100, y: 80, width: 1200, height: 800 };
    let maximized = true;
    const listeners = new Map<string, () => void>();
    const window = {
      isDestroyed: () => false,
      getNormalBounds: () => bounds,
      isMaximized: () => maximized,
      on: (event: string, listener: () => void) => {
        listeners.set(event, listener);
      },
    } as unknown as BrowserWindow;

    const save = trackWindowState(window, stateFile);
    listeners.get("close")?.();
    expect(JSON.parse(await readFile(stateFile, "utf8"))).toEqual({
      ...bounds,
      isMaximized: true,
    });

    maximized = false;
    save();
    expect(JSON.parse(await readFile(stateFile, "utf8"))).toEqual({
      ...bounds,
      isMaximized: false,
    });
  });
});
