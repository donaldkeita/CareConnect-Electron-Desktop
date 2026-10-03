import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

Object.defineProperty(window, "careConnectDesktop", {
  configurable: true,
  value: {
    platform: "win32",
    getAppVersion: () => Promise.resolve("0.1.0"),
  },
});

Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
  configurable: true,
  value(this: HTMLDialogElement) {
    this.open = true;
  },
});

Object.defineProperty(HTMLDialogElement.prototype, "close", {
  configurable: true,
  value(this: HTMLDialogElement) {
    this.open = false;
  },
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});
