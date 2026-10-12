import type { MenuItemConstructorOptions } from "electron";

export function createApplicationMenuTemplate(): MenuItemConstructorOptions[] {
  return [
    {
      label: "&File",
      submenu: [
        { role: "close", label: "&Close Window" },
        { type: "separator" },
        { role: "quit", label: "E&xit CareConnect" },
      ],
    },
    {
      label: "&Edit",
      submenu: [
        { role: "undo" }, { role: "redo" }, { type: "separator" },
        { role: "cut" }, { role: "copy" }, { role: "paste" },
        { type: "separator" }, { role: "selectAll" },
      ],
    },
    {
      label: "&View",
      submenu: [
        { role: "reload" }, { role: "forceReload" }, { role: "toggleDevTools" },
        { type: "separator" }, { role: "resetZoom" }, { role: "zoomIn" }, { role: "zoomOut" },
        { type: "separator" }, { role: "togglefullscreen" },
      ],
    },
    {
      label: "&Window",
      submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "close" }],
    },
  ];
}
