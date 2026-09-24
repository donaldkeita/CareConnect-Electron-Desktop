import type { CareConnectDesktopApi } from "../shared/desktop-api";

declare global {
  interface Window {
    careConnectDesktop: CareConnectDesktopApi;
  }
}

export {};
