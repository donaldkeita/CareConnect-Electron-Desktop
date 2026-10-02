# CareConnect Electron Desktop

Desktop implementation of the CareConnect application, scaffolded with Electron,
React, TypeScript, Vite, and Electron Forge.

The current application includes the CareConnect desktop shell, accessible
navigation, overview, appointments, medications, and messages views. Window
size, position, and maximized state are restored between sessions. Feature
workflows currently use display-only fixture data and will be connected in later
milestones.

## Prerequisites

- A currently supported Node.js LTS release
- npm

## Development

```bash
npm install
npm start
```

## Validation

```bash
npm run typecheck
npm test
```

## Packaging

Create an unpacked application:

```bash
npm run package
```

Create a platform-specific distributable:

```bash
npm run make
```

Generated artifacts are written to `out/`.

## Project structure

```text
assets/              Packaging resources such as application icons
docs/                Architecture and contributor documentation
src/main/            Electron main process and privileged IPC handlers
src/preload/         Context-isolated bridge exposed to the renderer
src/renderer/        React application running in the browser context
src/shared/          Types and contracts shared across process boundaries
tests/e2e/           Future packaged-application end-to-end tests
tests/unit/          Future isolated unit tests
```

The renderer must not import Electron or Node.js APIs directly. Privileged
operations belong in the main process and must be exposed through a narrow,
typed preload API.

## Project documentation

- [Architecture](docs/architecture.md)
- [Accessibility plan](docs/accessibility-plan.md)
- [Keyboard shortcuts](docs/keyboard-shortcuts.md)
