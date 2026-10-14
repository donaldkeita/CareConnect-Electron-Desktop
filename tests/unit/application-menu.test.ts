import { describe, expect, it } from "vitest";
import { createApplicationMenuTemplate } from "../../src/main/application-menu";

describe("application menu", () => {
  it("defines Windows keyboard mnemonics for each documented menu", () => {
    const labels = createApplicationMenuTemplate().map((item) => item.label);
    expect(labels).toEqual(["&File", "&Edit", "&View", "&Window"]);
  });
});
