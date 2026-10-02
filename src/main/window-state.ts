import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { BrowserWindow, Rectangle } from "electron";

export interface PersistedWindowState extends Rectangle {
  isMaximized: boolean;
}

const DEFAULT_BOUNDS: Rectangle = { x: 0, y: 0, width: 1200, height: 800 };
const MIN_WIDTH = 800;
const MIN_HEIGHT = 600;
const MIN_VISIBLE_AREA = 100;

const defaultWindowState = (displayWorkAreas: Rectangle[]): PersistedWindowState => {
  const primaryWorkArea = displayWorkAreas[0];
  if (!primaryWorkArea) return { ...DEFAULT_BOUNDS, isMaximized: false };

  return {
    x: primaryWorkArea.x + Math.max(0, Math.round((primaryWorkArea.width - DEFAULT_BOUNDS.width) / 2)),
    y: primaryWorkArea.y + Math.max(0, Math.round((primaryWorkArea.height - DEFAULT_BOUNDS.height) / 2)),
    width: DEFAULT_BOUNDS.width,
    height: DEFAULT_BOUNDS.height,
    isMaximized: false,
  };
};

const isFiniteInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && Number.isInteger(value);

const intersectsDisplay = (bounds: Rectangle, workArea: Rectangle): boolean => {
  const overlapWidth = Math.max(
    0,
    Math.min(bounds.x + bounds.width, workArea.x + workArea.width) -
      Math.max(bounds.x, workArea.x),
  );
  const overlapHeight = Math.max(
    0,
    Math.min(bounds.y + bounds.height, workArea.y + workArea.height) -
      Math.max(bounds.y, workArea.y),
  );

  return overlapWidth >= MIN_VISIBLE_AREA && overlapHeight >= MIN_VISIBLE_AREA;
};

export const normalizeWindowState = (
  candidate: unknown,
  displayWorkAreas: Rectangle[],
): PersistedWindowState => {
  if (!candidate || typeof candidate !== "object") {
    return defaultWindowState(displayWorkAreas);
  }

  const value = candidate as Partial<PersistedWindowState>;
  const hasValidBounds =
    isFiniteInteger(value.x) &&
    isFiniteInteger(value.y) &&
    isFiniteInteger(value.width) &&
    isFiniteInteger(value.height) &&
    value.width >= MIN_WIDTH &&
    value.height >= MIN_HEIGHT;

  if (!hasValidBounds) {
    return defaultWindowState(displayWorkAreas);
  }

  const bounds: Rectangle = {
    x: value.x as number,
    y: value.y as number,
    width: value.width as number,
    height: value.height as number,
  };

  if (!displayWorkAreas.some((workArea) => intersectsDisplay(bounds, workArea))) {
    return { ...defaultWindowState(displayWorkAreas), isMaximized: Boolean(value.isMaximized) };
  }

  return { ...bounds, isMaximized: Boolean(value.isMaximized) };
};

export const loadWindowState = (
  stateFile: string,
  displayWorkAreas: Rectangle[],
): PersistedWindowState => {
  try {
    return normalizeWindowState(
      JSON.parse(readFileSync(stateFile, "utf8")) as unknown,
      displayWorkAreas,
    );
  } catch {
    return normalizeWindowState(undefined, displayWorkAreas);
  }
};

export const trackWindowState = (
  window: BrowserWindow,
  stateFile: string,
): (() => void) => {
  let saveTimer: NodeJS.Timeout | undefined;

  const save = () => {
    if (window.isDestroyed()) return;

    const state: PersistedWindowState = {
      ...window.getNormalBounds(),
      isMaximized: window.isMaximized(),
    };

    try {
      mkdirSync(path.dirname(stateFile), { recursive: true });
      writeFileSync(stateFile, JSON.stringify(state), "utf8");
    } catch (error) {
      console.warn("Unable to persist CareConnect window state.", error);
    }
  };

  const scheduleSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 250);
    saveTimer.unref();
  };

  window.on("move", scheduleSave);
  window.on("resize", scheduleSave);
  window.on("maximize", scheduleSave);
  window.on("unmaximize", scheduleSave);
  window.on("close", save);

  return save;
};
