// src/polyfills-global.ts
// Definisce global e process per librerie legacy come sockjs-client
(window as any).global = window;
(window as any).process = { env: { DEBUG: undefined } };