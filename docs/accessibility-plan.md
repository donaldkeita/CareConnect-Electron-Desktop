# CareConnect Desktop Accessibility Plan

## Purpose

CareConnect Desktop will be usable and navigable solely via keyboard interaction and with common desktop
assistive technologies. This will enhance the accessibility of the application and allow multiple user groups
to successfully use the application regardless of accessibility issues.

The implementation will target WCAG 2.2 Level AA. Where a platform convention
or a stronger criterion materially improves desktop use, the application should
adopt it as long as it does not create a conflict with another accessibility
need.

This plan applies to every screen, dialog, notification, data visualization,
workflow, and future feature in the Electron application. The user should be able to utilize the full
workflows and feature set of the desktop application using only a keyboard and/or standard desktop
accessibility technologies.

## Implementation principles

- Prefer native HTML elements before using ARIA. A native `button`, `input`,
  `select`, `table`, or link provides keyboard and accessibility behavior that
  a generic element does not.
- Use ARIA only to supply missing names, descriptions, relationships, states,
  or established composite-widget behavior.
- Do not communicate information using only color, position, shape, sound, or
  animation.
- Keep DOM order, visual order, reading order, and keyboard focus order aligned.
- Test the packaged Electron application in addition to browser-based component
  tests.

## 1. Keyboard-only navigation

### Requirements

Every application feature must be operable with a keyboard. A user must be able
to complete each workflow without a mouse, trackpad, touch screen, or simulated
pointer input.

- `Tab` and `Shift+Tab` move through interactive elements in a logical order.
- `Enter` activates links, primary actions, and controls where expected.
- `Space` activates buttons, checkboxes, and other controls following native
  desktop/web conventions.
- Arrow keys operate established composite widgets such as tabs, radio groups,
  menus, listboxes, grids, and sliders according to their applicable ARIA
  Authoring Practices pattern.
- `Escape` closes dismissible menus, popovers, and dialogs without discarding
  entered data unless the user confirms that action.
- Application menus expose platform-appropriate keyboard shortcuts. Shortcuts
  must not override assistive-technology or operating-system conventions.
- Repeated navigation includes a keyboard mechanism to move directly to the
  primary content, such as a visible-on-focus "Skip to main content" link.
- Custom controls are not added to the tab order unless they are interactive.
  Positive `tabIndex` values are prohibited.
- Disabled controls use native disabled behavior when the control truly cannot
  be used. Explanatory text must identify why an action is unavailable when the
  reason is not otherwise apparent.

### Dialog and focus behavior

- Opening a modal moves focus into it, normally to its heading, first field, or
  least destructive action depending on the task.
- Focus remains within a modal while it is open.
- Closing a modal returns focus to the control that opened it, or to the nearest
  logical control if the opener no longer exists.
- Destructive and irreversible actions require confirmation and must not use an
  unsafe action as the initial focused control.
- Route and major-view changes move focus to the new view's heading or main
  region so keyboard and screen-reader users receive equivalent context.
- No component may create a keyboard trap. Embedded content must document its
  exit keystroke when the standard `Tab` or `Escape` behavior is insufficient.

### Keyboard acceptance tests

For every feature, test in both forward and reverse focus order:

1. Start from the application menu or first focusable element.
2. Reach every action, field, disclosure, tab, and help affordance using only
   the keyboard.
3. Operate the feature and complete validation, confirmation, cancellation, and
   error-recovery paths.
4. Confirm that focus never becomes lost, hidden, trapped, or unexpectedly
   reset to the beginning of the application.
5. Repeat at 200% zoom and with Windows High Contrast enabled.

## 2. Visible focus indicators

### Requirements

- Every keyboard-focusable element displays a visible focus indicator whenever
  it receives keyboard focus.
- Default browser focus outlines must not be removed unless a tested replacement
  is supplied.
- The common focus treatment uses `:focus-visible` and is visually distinct
  from hover, selection, validation, and disabled states.
- Focus indicators must remain visible against both light and dark adjacent
  colors and must not be clipped by containers with `overflow: hidden`.
- Focus must remain visible when controls are inside scrolling regions. When
  focus moves offscreen, the application scrolls the focused element into view.
- Focus styling cannot rely only on `box-shadow`, because Windows forced-colors
  mode can suppress shadows. A real outline or border is required.

The initial design system should provide a shared rule similar to:

```css
:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}

@media (forced-colors: active) {
  :focus-visible {
    outline-color: Highlight;
    box-shadow: none;
  }
}
```

Component styles may adjust the geometry, but they may not silently suppress
the shared focus treatment.

### Focus acceptance tests

- Inspect every interactive component using keyboard navigation.
- Test light, dark, high-contrast, selected, error, and disabled-adjacent states.
- Confirm the indicator remains distinguishable at 100% and 200% zoom.
- Confirm no animation or transition temporarily makes the indicator disappear.

## 3. Screen-reader support

### Supported combinations

The primary supported combinations are:

- Windows: current NVDA with the Electron-bundled Chromium accessibility tree.
- macOS: current VoiceOver with the packaged Electron application.

Narrator may be used as an additional Windows check, but it does not replace
NVDA testing. Automated accessibility checks do not replace either manual
screen-reader pass.

### Semantic requirements

- Each window has a unique, meaningful document title.
- Each view has one primary heading and uses a logical heading hierarchy.
- Use landmarks such as `header`, `nav`, `main`, `aside`, and `footer` where
  appropriate. More than one landmark of the same kind must have a unique name.
- Every control has an accessible name. Visible labels are preferred; when an
  accessible name differs, it must still contain the visible label.
- Instructions, units, constraints, and errors are programmatically associated
  with their fields using native relationships or `aria-describedby`.
- Required, expanded, selected, pressed, checked, current, invalid, and busy
  states are exposed programmatically and updated when state changes.
- Icon-only actions have concise accessible names. Decorative icons and images
  are hidden from the accessibility tree.
- Meaningful images include useful alternative text. Charts and visualizations
  include a text summary and an accessible data alternative.
- Data tables use real table markup, captions or accessible names, and properly
  scoped headers.
- Status messages use an appropriate live region without stealing focus.
  Urgent alerts use assertive announcements sparingly.
- Loading states expose `aria-busy` and a meaningful status. Skeletons and
  spinners are not announced as unlabeled graphics.
- Changes of route, page, modal, validation summary, and asynchronous completion
  provide context through focus management and/or a concise announcement.

### NVDA interaction plan

Test using both browse mode and focus/forms mode:

- Navigate headings, landmarks, links, buttons, form controls, lists, and tables
  using NVDA quick-navigation keys.
- Confirm tab navigation and NVDA's reading order match the visual order.
- Verify each control's name, role, state, value, description, position, and
  keyboard instructions when applicable.
- Confirm dialogs are announced with their name and modal context and that
  background content is not exposed as active content.
- Confirm validation errors are announced once, remain discoverable afterward,
  and provide a path back to the invalid field.
- Confirm dynamic status updates are understandable and do not interrupt normal
  reading unnecessarily.

### VoiceOver interaction plan

Test with VoiceOver Quick Nav both enabled and disabled:

- Traverse the application with `Control+Option` navigation and by headings,
  landmarks, controls, links, tables, and form controls.
- Verify that groups and composite widgets can be entered and exited predictably.
- Confirm rotor categories contain the expected headings, links, controls, and
  landmarks.
- Confirm dialogs, errors, selected tabs, expanded disclosures, and live status
  changes are announced with equivalent information to NVDA.
- Confirm standard macOS menu and zoom commands remain available and correctly
  named.

## 4. High-contrast support

### Windows High Contrast / forced colors

- Allow Chromium to honor the user's forced palette. Do not globally disable
  forced-color adjustment.
- Use semantic native elements so Chromium can assign appropriate system colors.
- Use `@media (forced-colors: active)` only for targeted corrections where the
  automatic result loses meaning or boundaries.
- Prefer system color keywords such as `Canvas`, `CanvasText`, `ButtonFace`,
  `ButtonText`, `Highlight`, `HighlightText`, and `LinkText` in those corrections.
- Borders, text, or native state indicators must preserve information otherwise
  shown through backgrounds, gradients, shadows, or color alone.
- SVG icons use `currentColor` where appropriate. Selected, checked, error, and
  focus states remain perceivable when author colors and background images are
  removed.


### macOS Increase Contrast

- Respond to `@media (prefers-contrast: more)` by strengthening subtle borders,
  separators, focus treatments, text contrast, and control boundaries.
- Avoid translucent surfaces as the only separation between content regions.
- Preserve usability when Increase Contrast and Reduce Transparency are both
  enabled.
- The normal theme must already meet WCAG AA contrast; `prefers-contrast` is an
  enhancement rather than a repair for an otherwise failing palette.

### Contrast acceptance tests

- Windows: test at least one dark and one light High Contrast theme.
- macOS: test with Increase Contrast enabled, and again with Reduce Transparency
  also enabled.
- Verify focus, hover-independent affordances, selection, validation, disabled
  state, charts, icons, links, separators, and form boundaries.
- Confirm text meets a minimum 4.5:1 contrast ratio, large text meets 3:1, and
  essential component boundaries and graphical objects meet 3:1 in the normal
  theme.

## 5. Zoom and responsive reflow

### Requirements

- Provide standard application-menu commands for Zoom In, Zoom Out, and Actual
  Size using Electron's platform menu roles. Expected shortcuts include
  `Ctrl++`, `Ctrl+-`, and `Ctrl+0` on Windows and `Command++`, `Command+-`, and
  `Command+0` on macOS.
- Support at least 50% through 200% application zoom. Core workflows must remain
  usable at 200%.
- Do not block Chromium/Electron zoom or replace it with text-only scaling.
- Use responsive layouts, relative units, wrapping, and content-driven sizing.
  Avoid fixed heights for regions containing text or controls.
- Text must not be clipped, overlap other content, disappear, or require a
  pointer to reveal it.
- At narrow effective widths, navigation and multi-column layouts reflow into a
  usable compact arrangement.
- Horizontal scrolling is permitted only for content that genuinely requires a
  two-dimensional layout, such as a large data table. Page-level workflows must
  not require simultaneous horizontal and vertical scrolling.
- Dialogs fit within the available viewport and scroll their content while
  keeping headings and actions reachable by keyboard.
- Zoom preference should persist across application restarts unless product
  requirements explicitly call for session-only zoom.

### Zoom acceptance tests

Test every primary workflow at 100%, 125%, 150% and 200% zoom using:

- the minimum supported application window size;
- a common laptop display size;
- keyboard-only navigation;
- NVDA on Windows or VoiceOver on macOS; and
- both the normal and increased/high-contrast display setting.

Confirm that all content, validation messages, controls, dialogs, menus, and
notifications remain available and that focus is never placed under fixed or
sticky content.

## Verification strategy

### During implementation

- Add automated component tests for accessible names, roles, states, labels,
  descriptions, focus movement, and keyboard interaction.
- Add lint rules that flag common JSX accessibility defects.
- Add end-to-end keyboard tests for critical workflows in the packaged desktop
  application.
- Treat automated results as regression detection, not proof of conformity.

### Manual release matrix

| Platform | Assistive/display setting | Required checks                                            |
| --- | --- |------------------------------------------------------------|
| Windows | Keyboard only | All workflows, dialogs, menus, errors, and focus order     |
| Windows | NVDA | Reading order, names, roles, states, forms, tables, and live updates |
| Windows | High Contrast | Light and dark forced-color themes, including focus and validation |
| macOS | Keyboard navigation | Full Keyboard Access and all application workflows         |
| macOS | VoiceOver | Rotor, groups, forms, dialogs, tables, and live updates    |
| macOS | Increase Contrast | Boundaries, focus, states, and text at supported zoom levels |
| Both | Zoom | 100%, 125%, 150%, and 200% at minimum window size          |

## Definition of done

A feature is not complete until:

1. All functionality is operable using only the keyboard.
2. Keyboard focus is logical, managed correctly, and always visible.
3. Names, roles, values, states, relationships, errors, and updates are exposed
   correctly to NVDA and VoiceOver.
4. The feature remains understandable and operable in Windows High Contrast and
   macOS Increase Contrast modes.
5. The feature remains usable at 200% zoom.
6. Automated checks pass and the applicable manual checks are recorded.

## References

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Electron accessibility](https://www.electronjs.org/docs/latest/tutorial/accessibility)
- [Electron `webFrame` zoom APIs](https://www.electronjs.org/docs/latest/api/web-frame)
- [MDN: `forced-colors`](https://developer.mozilla.org/docs/Web/CSS/@media/forced-colors)
- [MDN: `prefers-contrast`](https://developer.mozilla.org/docs/Web/CSS/@media/prefers-contrast)
- [NVDA User Guide](https://download.nvaccess.org/documentation/userGuide.html)
- [VoiceOver User Guide for macOS](https://support.apple.com/guide/voiceover/welcome/mac)
