# Architecture

CareConnect Desktop uses Electron's process isolation model:

- The **main process** owns application lifecycle, windows, native integrations,
  and privileged operations.
- The **preload process** exposes a deliberately small, typed API through
  `contextBridge`.
- The **renderer process** hosts the React application and has no direct Node.js
  or Electron access.
- The **shared directory** contains contracts that cross process boundaries. It
  must not contain environment-specific implementation code.

Feature folders, routing, state management, storage, networking, and the visual
system are intentionally deferred until application requirements are defined.
