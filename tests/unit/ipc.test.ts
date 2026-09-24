import { describe, expect, it } from "vitest";
import { IPC_CHANNELS } from "../../src/shared/ipc";

describe("IPC channel contracts", () => {
  it("uses namespaced, unique channel names", () => {
    const channels = Object.values(IPC_CHANNELS);

    expect(new Set(channels).size).toBe(channels.length);
    expect(channels.every((channel) => channel.includes(":"))).toBe(true);
  });
});
