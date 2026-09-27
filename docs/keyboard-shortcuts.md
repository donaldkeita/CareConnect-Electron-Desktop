# CareConnect Desktop Keyboard Shortcuts

## Purpose and status

This document supplements the [accessibility plan](accessibility-plan.md) and proposes the keyboard navigation and action shortcuts for
CareConnect Desktop.  These keyboard shortcuts should be taken as the implementation and testing baseline for application
menus, tooltips, help content, and keyboard-only workflows.

The shortcuts follow standard HTML, ARIA Authoring Practices, Electron, and
desktop-platform conventions. A shortcut must not replace the standard keyboard
operation of a native control or conflict with an operating-system, browser,
screen-reader, or VoiceOver command.  Shortcuts should also not interfere with normal use of the application
that occurs using a combination of keyboard, mouse, or other interactive hardware.

## Key notation and platform conventions

| Notation | Windows and Linux | macOS |
| --- | --- | --- |
| `Primary` | `Ctrl` | `Command` (`Cmd` or `⌘`) |
| `Alt` | `Alt` | `Option` (`⌥`) |
| `Shift` | `Shift` | `Shift` (`⇧`) |
| `Enter` | `Enter` | `Return` or `Enter` |

Documentation shown inside the application should display the actual shortcut
for the current platform. For example, Save appears as `Ctrl+S` on Windows and
Linux and as `Cmd+S` on macOS. Menu accelerators should use Electron's
platform-aware `CommandOrControl` form where the behavior is equivalent.

## Navigation shortcuts

These keys provide navigation without requiring a modifier.

| Shortcut | Context | Proposed behavior |
| --- | --- | --- |
| `Tab` | Application-wide | Move focus to the next interactive element in logical reading order. |
| `Shift+Tab` | Application-wide | Move focus to the previous interactive element. |
| `Enter` | Link, primary action, selected menu item | Follow the link or activate the action. In a multiline field, insert a new line instead. |
| `Space` | Button, checkbox, toggle | Activate a button or toggle the focused control. In a scrollable non-control region, retain native page-scroll behavior. |
| `Up Arrow` / `Down Arrow` | Menu, listbox, radio group, vertical tabs, grid | Move within the current composite widget according to its ARIA pattern. |
| `Left Arrow` / `Right Arrow` | Horizontal tabs, menu bar, radio group, grid | Move within the current composite widget according to its ARIA pattern. |
| `Home` / `End` | Supported list, menu, tab set, or grid | Move to the first or last item in the current widget. In an editable field, retain native text behavior. |
| `Page Up` / `Page Down` | Long list, grid, or scrollable view | Move or scroll by one visible page when the component supports paging. |
| `Escape` | Menu, popover, dialog, or temporary mode | Close or cancel the current dismissible layer and restore focus to its opener. Never silently discard entered data. |
| `Alt+Left Arrow` | View history | Return to the previous CareConnect view when view history exists. |
| `Alt+Right Arrow` | View history | Move forward in CareConnect view history when available. |
| `Tab` from the window start | Repeated navigation | Reveal and reach the **Skip to main content** link before repeated navigation items. |

Arrow keys must not move focus between ordinary standalone controls. They are
reserved for established composite widgets, scrolling, caret movement, and
other native behaviors. Components must never create a keyboard trap.

## Action shortcuts

`Primary` means `Ctrl` on Windows and Linux and `Cmd` on macOS.

| Action | Windows and Linux | macOS | Notes |
| --- | --- | --- | --- |
| Save | `Ctrl+S` | `Cmd+S` | Save the current editable record. Disabled when there are no savable changes. |
| Undo | `Ctrl+Z` | `Cmd+Z` | Use native field history while focus is in a text editor; otherwise undo the most recent supported application change. |
| Redo | `Ctrl+Y` | `Cmd+Shift+Z` | Follow the dominant convention on each platform. |
| Find in current view | `Ctrl+F` | `Cmd+F` | Open CareConnect's find interface for the current view. |
| New record | `Ctrl+N` | `Cmd+N` | Start a new record only where the current role and view support creation. |
| Print | `Ctrl+P` | `Cmd+P` | Open the standard print flow for printable content. |
| Select all | `Ctrl+A` | `Cmd+A` | Retain native behavior in editable fields; otherwise select all items only in a collection that supports selection. |
| Copy | `Ctrl+C` | `Cmd+C` | Retain native clipboard behavior. |
| Cut | `Ctrl+X` | `Cmd+X` | Retain native clipboard behavior in editable content. |
| Paste | `Ctrl+V` | `Cmd+V` | Retain native clipboard behavior in editable content. |
| Close current window or dialog | `Alt+F4` | `Cmd+W` | Use the platform window convention; prompt before losing unsaved work. |
| Open keyboard-shortcut help | `Ctrl+/` | `Cmd+/` | Open a searchable shortcut reference. This binding must be rechecked against assistive technology before release. |
| Zoom in | `Ctrl++` | `Cmd++` | Use the Electron application-menu zoom role. Support the main keyboard `+` key and platform-standard equivalent. |
| Zoom out | `Ctrl+-` | `Cmd+-` | Use the Electron application-menu zoom role. |
| Actual size | `Ctrl+0` | `Cmd+0` | Reset application zoom to 100%. |

Save and other application actions must also remain available as visible,
keyboard-focusable controls. Shortcuts are accelerators, not the only way to
perform an action. Destructive actions intentionally have no global single-step
shortcut.

## Forms, dialogs, and data views

| Shortcut | Proposed behavior |
| --- | --- |
| `Enter` | Submit a simple single-line form only when that behavior is clear and no multiline field has focus. |
| `Ctrl+Enter` / `Cmd+Enter` | Submit or send in a multiline composition workflow when the shortcut is displayed beside the action. |
| `Escape` | Close a dismissible dialog or popover. If changes would be lost, show a confirmation instead. |
| `Tab` / `Shift+Tab` in a modal | Move through controls within the modal; focus must remain contained until it closes. |
| Arrow keys in a data grid | Move one cell in the indicated direction when the grid owns focus. |
| `Home` / `End` in a data grid | Move to the first or last cell in the current row. |
| `Ctrl+Home` / `Cmd+Home` in a data grid | Move to the first cell in the grid. |
| `Ctrl+End` / `Cmd+End` in a data grid | Move to the last populated cell in the grid. |
| `Enter` or `F2` in an editable grid | Enter cell-edit mode. |
| `Escape` in an editable grid | Cancel the current cell edit and return to grid navigation. |

Widget-specific instructions should be announced through an accessible
description when the expected keys are not obvious. Editable controls always
retain their native caret, selection, and text-editing shortcuts.

## Conflict-avoidance rules

Any proposed shortcut should pass the following litmus tests:

1. Do not register system-wide shortcuts. Shortcuts apply only while CareConnect
   is the active application.
2. Do not override operating-system reserved combinations, including Windows
   key combinations such as, `Alt+Tab`, `Ctrl+Alt+Delete`, `Cmd+Tab`, `Cmd+Space`, and
   `Cmd+Option+Escape`.
3. Do not assign common assistive-technology command prefixes, especially
   Insert/Caps Lock combinations used by NVDA and `Control+Option` combinations
   used by VoiceOver.
4. Preserve platform editing, clipboard, menu, window, and zoom conventions.
5. Preserve native control behavior when a field or widget consumes the same
   key. A global action must not fire while the user is typing or operating a
   composite widget.
6. Avoid unmodified letter and number shortcuts. They interfere with typing,
   screen-reader quick navigation, and international input methods.
7. Do not depend on function keys alone for essential actions because laptops
   and operating systems may reserve them. Every action must have a visible
   alternative.
8. Verify proposed bindings with current Windows, macOS, NVDA, and VoiceOver
   releases before each production release. Remove or remap any detected
   conflict before shipping.

## Implementation requirements

- Define application-level shortcuts in one shared registry so menus, tooltips,
  help content, tests, and the printable card cannot drift apart.
- Use Electron menu roles for standard actions such as copy, paste, undo, redo,
  and zoom when a role exists.
- Scope shortcuts to the narrowest relevant view and disable unavailable
  actions rather than accepting a keypress that has no visible result.
- Announce the result of asynchronous actions such as Save through a concise
  status message without moving focus.
- Show shortcuts in application menus and on buttons or tooltips where useful.
- Allow future user remapping only after conflict detection and an accessible
  reset-to-default mechanism are available.
- Account for non-US keyboard layouts and do not identify a shortcut solely by
  a physical key position.

## Acceptance tests

- Test every shortcut on Windows and macOS in the packaged Electron app.
- Confirm Linux bindings where Linux is a supported release target.
- Test while focus is in single-line fields, multiline fields, menus, dialogs,
  lists, tabs, and data grids to ensure that native keystrokes win when needed.
- Confirm that Save, navigation, zoom, and dialog behavior match the visible
  menu labels and help text.
- Run NVDA checks on Windows and VoiceOver checks on macOS, including browse or
  Quick Nav modes, to ensure shortcuts neither conflict nor trigger unexpectedly.
- Test at 100%, 125%, 150%, and 200% zoom and with Windows High Contrast and
  macOS Increase Contrast enabled.
- Confirm focus remains visible, is restored after a dismissed layer, and never
  becomes trapped or lost.

---

## Printable keyboard reference card

**CareConnect Desktop — Keyboard Reference**

`Primary` = `Ctrl` on Windows/Linux · `Cmd` on macOS

### Move around

| Keys | Result |
| --- | --- |
| `Tab` / `Shift+Tab` | Next / previous control |
| Arrow keys | Move within menus, tabs, lists, radio groups, and grids |
| `Home` / `End` | First / last item in a supported widget |
| `Alt+Left` / `Alt+Right` | Previous / next CareConnect view |
| `Enter` | Open or activate |
| `Space` | Activate button or toggle selection |
| `Escape` | Close or cancel the current layer |

### Common actions

| Keys | Result |
| --- | --- |
| `Primary+S` | Save |
| `Primary+Z` | Undo |
| `Ctrl+Y` (Windows/Linux) / `Cmd+Shift+Z` (Mac) | Redo |
| `Primary+F` | Find in current view |
| `Primary+N` | New record, where available |
| `Primary+P` | Print |
| `Primary+/` | Keyboard-shortcut help |
| `Primary++` / `Primary+-` | Zoom in / out |
| `Primary+0` | Actual size (100%) |

### Editing

| Keys | Result |
| --- | --- |
| `Primary+A` | Select all |
| `Primary+C` | Copy |
| `Primary+X` | Cut |
| `Primary+V` | Paste |
| `Ctrl+Enter` / `Cmd+Enter` | Submit from a multiline editor when shown |

All commands are also available through visible controls or application menus.
If a shortcut behaves differently in the focused field or widget, its native
editing or navigation behavior takes priority.
