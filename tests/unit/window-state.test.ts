import { describe, expect, it } from "vitest";
import { normalizeWindowState } from "../../src/main/window-state";

const primaryDisplay = { x: 0, y: 0, width: 1920, height: 1040 };

describe("window state", () => {
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
});
