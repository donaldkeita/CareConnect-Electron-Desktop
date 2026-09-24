export interface CareConnectDesktopApi {
  platform: NodeJS.Platform;
  getAppVersion(): Promise<string>;
}
