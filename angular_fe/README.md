# Platform Documentation

Angular 18 · SSR · Material · NgRx · WebSocket · OpenLayers · TypeDoc

Full-stack marketplace frontend built with Angular 18, featuring server-side rendering, real-time communication, interactive maps, and auto-generated documentation.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Setup](#project-setup)
- [NPM SSL Configuration](#npm-ssl-configuration)
- [Scripts](#scripts)
- [Project Configuration](#project-configuration)
- [SSR Server](#ssr-server)
- [Bootstrap Files](#bootstrap-files)
- [Documentation with TypeDoc](#documentation-with-typedoc)
- [JSDoc Best Practices](#jsdoc-best-practices)
- [Architecture Overview: Module Dependency Graph](#architecture-overview-module-dependency-graph)
- [Testing Setup](#testing-setup)
- [Angular Build Instructions](#angular-build-instructions)

---

## Tech Stack

### Core — Angular 18

| Package                             | Version  | Purpose                                                         |
| ----------------------------------- | -------- | --------------------------------------------------------------- |
| `@angular/core`                     | ^18.2.13 | Core framework                                                  |
| `@angular/common`                   | ^18.2.0  | Common directives and pipes (`NgIf`, `NgFor`, `DatePipe`, etc.) |
| `@angular/forms`                    | ^18.2.0  | Reactive forms and template-driven forms                        |
| `@angular/router`                   | ^18.2.0  | Client-side routing and navigation                              |
| `@angular/animations`               | ^18.2.0  | Animation engine for transitions and effects                    |
| `@angular/platform-browser`         | ^18.2.0  | Browser-specific rendering                                      |
| `@angular/platform-browser-dynamic` | ^18.2.0  | JIT compilation for the browser                                 |
| `@angular/compiler`                 | ^18.2.0  | Angular template compiler                                       |
| `zone.js`                           | ~0.14.10 | Async change detection — required by Angular                    |
| `rxjs`                              | ~7.8.0   | Reactive programming — Observables, operators, streams          |
| `tslib`                             | ^2.3.0   | TypeScript runtime helpers                                      |

---

### UI — Angular Material + PrimeNG

| Package             | Version   | Purpose                                                                    |
| ------------------- | --------- | -------------------------------------------------------------------------- |
| `@angular/material` | ^18.2.7   | Google Material Design components (dialogs, tables, inputs, buttons, etc.) |
| `primeng` | 17.18.10 | Rich UI component library (DataTable, Calendar, Dropdown, etc.) |
| `primeicons`        | ^7.0.0    | Icon set used by PrimeNG components                                        |
| `bootstrap`         | ^5.3.3    | CSS utility framework for layout and responsive grid                       |
| `popper.js`         | ^1.16.1   | Tooltip and popover positioning — used by Bootstrap                        |

---

### Icons

| Package                                 | Version | Purpose                                         |
| --------------------------------------- | ------- | ----------------------------------------------- |
| `@fortawesome/angular-fontawesome`      | ^0.15.0 | Angular component wrapper for FontAwesome icons |
| `@fortawesome/fontawesome-svg-core`     | ^6.6.0  | Core SVG engine for FontAwesome                 |
| `@fortawesome/fontawesome-common-types` | ^6.6.0  | Shared TypeScript types for FontAwesome         |
| `@fortawesome/fontawesome-free`         | ^6.6.0  | Free icon set (solid, regular, brands)          |
| `@fortawesome/free-solid-svg-icons`     | ^6.6.0  | Solid style icons (most commonly used)          |
| `@fortawesome/free-brands-svg-icons`    | ^6.7.2  | Brand logos (Google, GitHub, etc.)              |

---

### Server-Side Rendering (SSR)

| Package                    | Version  | Purpose                                          |
| -------------------------- | -------- | ------------------------------------------------ |
| `@angular/ssr`             | ^18.2.7  | Angular Universal SSR integration for Angular 18 |
| `@angular/platform-server` | ^18.2.0  | Server-side rendering platform                   |
| `@angular/build`           | ^18.2.13 | Angular build system (esbuild-based)             |
| `express`                  | ^4.18.2  | Node.js HTTP server that serves the SSR app      |

> The SSR server entry point is `dist/angular_fe/server/server.mjs`.  
> Run it with: `node dist/angular_fe/server/server.mjs`

---

### Authentication

| Package              | Version | Purpose                                                                                                               |
| -------------------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| `@auth0/angular-jwt` | ^5.2.0  | Automatically attaches JWT tokens to HTTP requests via an `HttpInterceptor`. Handles token decoding and expiry checks |
| `gapi-script`        | ^1.2.0  | Google API client loader — used for Google OAuth login integration                                                    |
| `ngx-cookie-service` | ^18.0.0 | Read/write browser cookies. Used to persist auth tokens and session data                                              |

---

### Internationalization (i18n)

| Package                      | Version | Purpose                                                                                             |
| ---------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `@ngx-translate/core`        | ^17.0.0 | Runtime translation system — loads JSON translation files and provides `translate` pipe and service |
| `@ngx-translate/http-loader` | ^17.0.0 | HTTP loader for ngx-translate — fetches translation files from `/assets/i18n/`                      |
| `iso-639-1`                  | ^3.1.5  | ISO 639-1 language codes and names (e.g. `en → English`, `it → Italian`)                            |
| `world-countries`            | ^5.1.0  | Full dataset of world countries with ISO codes, names and metadata                                  |
| `currency-codes`             | ^2.2.0  | ISO 4217 currency codes dataset (e.g. `USD`, `EUR`)                                                 |
| `currency-symbol-map`        | ^5.1.0  | Maps currency codes to symbols (e.g. `EUR → €`, `USD → $`)                                          |

---

### Real-Time Communication — WebSocket

| Package                | Version | Purpose                                                                                |
| ---------------------- | ------- | -------------------------------------------------------------------------------------- |
| `@stomp/stompjs`       | ^7.2.0  | Modern STOMP protocol client over WebSocket — connects to Spring Boot's `/ws` endpoint |
| `stompjs`              | ^2.3.3  | Legacy STOMP client (kept for compatibility)                                           |
| `sockjs-client`        | ^1.6.1  | WebSocket fallback transport — used when native WebSocket is unavailable               |
| `sockjs`               | ^0.3.24 | Server-compatible SockJS library                                                       |
| `@types/sockjs-client` | ^1.5.4  | TypeScript types for sockjs-client                                                     |

> Used for real-time notifications, chat, and live updates between users.

---

### Maps — OpenLayers

| Package | Version | Purpose                                                                                                                                                                                                                       |
| ------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ol`    | ^10.8.0 | Full-featured open-source maps library. Used to display interactive maps with custom markers for appointment locations and product addresses. Renders OSM tiles with `TileLayer`, `VectorLayer`, and custom SVG `Icon` styles |

---

### Charts

| Package    | Version | Purpose                                                                                                                     |
| ---------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| `chart.js` | ^4.5.0  | Canvas-based charting library. Used via PrimeNG's chart components for revenue graphs, statistics dashboards, and analytics |

---

### UI Extras

| Package       | Version  | Purpose                                                                                                                                                                 |
| ------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sweetalert2` | ^11.25.0 | Beautiful, accessible popup dialogs — replaces native `alert()`, `confirm()`, `prompt()`. Used for confirmations, form inputs inside modals, and success/error feedback |
| `swiper`      | ^12.1.2  | Touch-friendly slider/carousel component. Used for product image galleries and featured listings                                                                        |
| `postcss`     | ^8.5.3   | CSS post-processor — used internally by the Angular build pipeline                                                                                                      |

---

### Internal Library

| Package         | Purpose                                                                                                                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `my-lib-inside` | Local Angular library (`file:../my-lib/projects/my-lib-inside`) containing shared components, directives and utilities used across the app (empty states, form layouts, tree lists, table layouts, etc.) |

---

### Dev Dependencies

| Package                         | Version  | Purpose                                                     |
| ------------------------------- | -------- | ----------------------------------------------------------- |
| `@angular/cli`                  | ^18.2.13 | Angular CLI — `ng serve`, `ng build`, `ng generate`         |
| `@angular-devkit/build-angular` | ^18.2.13 | Build system integration                                    |
| `@angular/compiler-cli`         | ^18.2.13 | AOT compiler for production builds                          |
| `typescript`                    | ~5.5.2   | TypeScript compiler                                         |
| `typedoc`                       | ^0.28.17 | Generates HTML documentation from TypeScript JSDoc comments |
| `typedoc-rhineai-theme`         | ^1.2.0   | Custom dark theme for TypeDoc                               |
| `dotenv-cli`                    | ^11.0.0  | Loads `.env` files for npm scripts (used for `start:fritz`) |
| `jasmine-core`                  | ~5.2.0   | Unit testing framework                                      |
| `karma`                         | ~6.4.0   | Test runner for browser-based tests                         |
| `karma-chrome-launcher`         | ~3.2.0   | Launches Chrome for Karma tests                             |
| `karma-coverage`                | ~2.2.0   | Code coverage reporting                                     |
| `karma-jasmine`                 | ~5.1.0   | Karma adapter for Jasmine test framework                    |
| `karma-jasmine-html-reporter`   | ~2.1.0   | Live HTML report of test results in the browser             |
| `@types/express`                | ^4.17.17 | TypeScript types for Express                                |
| `@types/jasmine`                | ~5.1.0   | TypeScript types for Jasmine                                |
| `@types/node`                   | ^18.18.0 | TypeScript types for Node.js                                |
---

### Overrides

| Package    | Overridden with       | Purpose                                                                 |
| ---------- | --------------------- | ----------------------------------------------------------------------- |
| `beasties` | `0.3.4`               | Pins beasties to a specific version to avoid build compatibility issues |
| `critters` | `npm:beasties@0.3.4`  | Replaces deprecated `critters` package with `beasties`                 |

---

## Project Setup

### 1. Create the project

```bash
ng new angular_fe --routing=true --style=scss
```

### 2. Install all dependencies
```bash
# Angular Material
ng add @angular/material@^18.2.7

# FontAwesome
npm install @fortawesome/angular-fontawesome@^0.15.0 @fortawesome/fontawesome-svg-core@^6.6.0 @fortawesome/fontawesome-common-types@^6.6.0 @fortawesome/fontawesome-free@^6.6.0 @fortawesome/free-solid-svg-icons@^6.6.0 @fortawesome/free-brands-svg-icons@^6.7.2

# i18n
npm install @ngx-translate/core@^17.0.0 @ngx-translate/http-loader@^17.0.0

# Auth
npm install @auth0/angular-jwt@^5.2.0 gapi-script@^1.2.0 ngx-cookie-service@^18.0.0

# Real-time
npm install @stomp/stompjs@^7.2.0 stompjs@^2.3.3 sockjs-client@^1.6.1 sockjs@^0.3.24 @types/sockjs-client@^1.5.4

# Maps
npm install ol@^10.8.0

# UI extras
npm install bootstrap@^5.3.3 popper.js@^1.16.1 sweetalert2@^11.25.0 swiper@^12.1.2 primeng@17.18.10 primeicons@^7.0.0 chart.js@^4.5.0 postcss@^8.5.3

# i18n data
npm install iso-639-1@^3.1.5 world-countries@^5.1.0 currency-codes@^2.2.0 currency-symbol-map@^5.1.0

# Local library
npm install ../my-lib/dist/my-lib-inside

# Dev tools
npm install --save-dev typedoc@^0.28.17 typedoc-rhineai-theme@^1.2.0 dotenv-cli@^11.0.0
```

### 3. Check versions
```bash
# Angular CLI
ng version

# Node.js
node --version

# npm
npm --version

# TypeScript
npx tsc --version

# Check installed packages
npm list --depth=0
```

### 4. Clear caches
```bash
# Angular cache
rmdir /s /q .angular\cache

# Angular CLI cache
ng cache clean

# npm cache
npm cache clean --force
```
---

## NPM SSL Configuration

Useful when behind a corporate proxy with self-signed certificates.

| Command                           | Description                         |
| --------------------------------- | ----------------------------------- |
| `npm config get strict-ssl`       | Check current SSL validation status |
| `npm config set strict-ssl false` | Disable SSL validation              |
| `npm config set strict-ssl true`  | Re-enable SSL validation            |

> Always re-enable SSL after completing installations.

---

## Scripts

| Script                   | Command                                                                 | Description                                      |
|--------------------------|-------------------------------------------------------------------------|--------------------------------------------------|
| `start`                  | `ng serve --configuration development --open`                          | Start dev server and open browser                |
| `start:fritz` | `dotenv -e .env.local -- ng serve --configuration development --allowed-hosts localhost,%FRITZ_HOST% --open` | Start dev server for local network/Google access using FRITZ_HOST |
| `build`                  | `ng build`                                                             | Production build                                 |
| `watch`                  | `ng build --watch --configuration development`                         | Dev build with file watching                     |
| `test`                   | `ng test`                                                              | Run unit tests with Karma                        |
| `serve:ssr:angular_fe`   | `node dist/angular_fe/server/server.mjs`                               | Serve the SSR build                              |
| `docs`                   | `rmdir /s /q docs & typedoc`                                           | Clean and rebuild documentation                  |
| `docs:watch`             | `typedoc --watch`                                                      | Rebuild docs on file changes                     |
| `docs:open`              | `start docs/index.html`                                                | Open docs in browser directly                    |
| `docs:serve`             | `npx http-server docs -p 8090`                                         | Serve docs on http://localhost:8090              |
| `clean`                | `ng cache clean`                                                                                              | Clear Angular CLI cache                                           |

---

## Project Configuration

### tsconfig.json

TypeScript compiler configuration with strict mode enabled and path mapping for Angular modules and local paths.

```json
{
  "compileOnSave": false,
  "compilerOptions": {
    "outDir": "./dist/out-tsc",
    "strict": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": false,
    "experimentalDecorators": true,
    "moduleResolution": "bundler",
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": [
      "ES2022",
      "dom"
    ],
    "types": [
      "jasmine"
    ],
    "paths": {
      "*": ["./*"],
      "@angular/*": [
        "./node_modules/@angular/*"
      ]
    },
    "preserveSymlinks": true
  },
  "angularCompilerOptions": {
    "enableI18nLegacyMessageIdFormat": false,
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

| Option                               | Purpose                                                                |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `strict: true`                       | Enables all strict type checks                                         |
| `noImplicitOverride`                 | Forces explicit `override` keyword on method overrides                 |
| `noPropertyAccessFromIndexSignature` | Prevents `obj.prop` when type uses index signature                     |
| `noImplicitReturns`                  | All code paths in a function must return a value                       |
| `noFallthroughCasesInSwitch`         | Prevents accidental switch case fallthrough                            |
| `skipLibCheck`                       | Skips type checking of `.d.ts` files in `node_modules`                 |
| `isolatedModules`                    | Each file must be independently transformable (required by esbuild)    |
| `esModuleInterop`                    | Allows default imports from CommonJS modules                           |
| `experimentalDecorators`             | Enables Angular decorators (`@Component`, `@Injectable`, etc.)         |
| `moduleResolution: bundler`          | Modern resolution mode compatible with esbuild/Vite                    |
| `target: ES2022`                     | Compiles to modern JavaScript with native class fields and async/await |
| `types: ["jasmine"]`                 | Includes Jasmine type definitions for unit tests                       |
| `preserveSymlinks: true`             | Resolves modules using symlink paths (useful with `npm link`)          |
| `paths`                              | Maps `*` to local paths and `@angular/*` to `node_modules`            |
| `compileOnSave: false`               | Disables automatic recompilation on file save in IDEs                  |

---

### angular.json highlights

Key configuration decisions in `angular.json`:

| Setting                       | Value                                                               | Purpose                                                                             |
| ----------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `changeDetection`             | `OnPush`                                                            | Default change detection strategy for all generated components — better performance |
| `style`                       | `scss`                                                              | Default stylesheet format                                                           |
| `inlineStyleLanguage`         | `scss`                                                              | Allows SCSS in `styles` array of component decorators                               |
| `host`                        | `0.0.0.0`                                                           | Dev server accessible from LAN (not just localhost)                                 |
| `port`                        | `4200`                                                              | Default dev server port                                                             |
| `hmr`                         | `true` (dev)                                                        | Hot Module Replacement in development                                               |
| `prerender`                   | `discoverRoutes: false`                                             | Pre-rendering enabled but routes discovered manually, not automatically             |
| `allowedCommonJsDependencies` | `["ol", "lerc", "iso-639-1", "currency-codes", "currency-symbol-map", "sockjs-client"]` | Suppresses CommonJS warnings for these dependencies             |
| `prebundle.exclude`           | `["my-lib-inside"]`                                                 | Excludes local library from esbuild pre-bundling (required for symlinked libs)      |
| `polyfills`                   | `zone.js`, `zone.js/testing`, `@angular/localize/init`             | Required Angular polyfills including i18n support                                   |
| `sourceMap`                   | `true` (dev only)                                                   | Source maps enabled in development, disabled in production                          |                         |

Global styles loaded in order:
```
@angular/material/prebuilt-themes/indigo-pink.css  ← Material theme
src/styles.scss                                     ← App global styles
bootstrap/dist/css/bootstrap.min.css               ← Bootstrap CSS
@fortawesome/fontawesome-free/css/all.css          ← FontAwesome icons
primeng/resources/themes/lara-light-blue/theme.css ← PrimeNG theme
primeng/resources/primeng.min.css                  ← PrimeNG base
primeicons/primeicons.css                          ← PrimeIcons
ol/ol.css                                          ← OpenLayers map styles
```

---

## SSR Server

The SSR server is built with **Express** and uses Angular's `CommonEngine` to render pages server-side.

### server.ts
```typescript
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { environment } from 'src/app/environments/environment';

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine({
    bootstrap,
    providers: [{ provide: APP_BASE_HREF, useValue: '' }],
  });

  // Middleware
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));

  // Static files
  server.get(
    '*.*',
    express.static(browserDistFolder, {
      maxAge: environment.production ? '1y' : '0',
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      },
    }),
  );

  // SSR catch-all — Angular renders every route
  server.get('*', (req, res, next) => {
    commonEngine
      .render({
        documentFilePath: indexHtml,
        url: req.originalUrl,
        publicPath: browserDistFolder,
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}
```
| Feature             | Detail                                                        |
| ------------------- | ------------------------------------------------------------- |
| Static file caching | `max-age: 1y` in production, `0` in development              |
| ETag / Last-Modified| Enabled for static files — allows conditional requests       |
| HTML caching        | `no-cache, no-store, must-revalidate` for `.html` files       |
| Middleware          | `express.json()` and `express.urlencoded()` for request parsing |
| `APP_BASE_HREF`     | Set to `''` via `CommonEngine` providers                      |
| Port                | `process.env.PORT` or `4000`                                  |
| Entry point         | `dist/angular_fe/server/server.mjs`                           |

Run the SSR server:
```bash
node dist/angular_fe/server/server.mjs
```

---

## Bootstrap Files

### main.ts — Browser bootstrap

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { appConfig } from "./app/app.config";
import { AppComponent } from "./app/app.component";

(window as any).global = window; // Required by some CommonJS dependencies (e.g. SockJS)

bootstrapApplication(AppComponent, appConfig).catch(function (err) {
  console.error(err);
});
```

> `(window as any).global = window` is a compatibility shim required by SockJS and some other CommonJS packages that expect a Node.js-like `global` object in the browser.

### main.server.ts — SSR bootstrap

```typescript
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { config } from "./app/app.config.server";
import { enableProdMode } from "@angular/core";
import { environment } from "./app/environments/environment";

if (environment.production) {
  enableProdMode();
}

export default function bootstrap() {
  return bootstrapApplication(AppComponent, config);
}
```

> The server bootstrap uses a separate `app.config.server.ts` that merges the base `appConfig` with server-specific providers (e.g. `provideServerRendering()`).

---

## Documentation with TypeDoc

This project uses **TypeDoc** to auto-generate HTML documentation from TypeScript JSDoc comments.

### Build and serve

```bash
# Build
npx typedoc

# Serve locally
npx http-server docs -p 8090
```

Then open **http://localhost:8090** in your browser.

### What gets documented

- **Components** — All Angular components with inputs, outputs and lifecycle hooks
- **Services** — All injectable services with method signatures
- **Interfaces** — TypeScript interfaces and type definitions
- **Pipes** — Custom pipes and their transform logic
- **Utils** — Utility functions and helpers

---

## JSDoc Best Practices

```typescript
/**
 * Brief description of what this does.
 *
 * @description Longer explanation if needed
 * @param paramName - What this parameter represents
 * @returns Description of the return value
 * @throws {Error} When this can throw
 * @example
 * // Basic usage
 * const result = service.method('value');
 */
```

## Architecture Overview: Module Dependency Graph

This document provides a complete visual representation of the application's internal architecture, illustrating **all import-based dependencies** between TypeScript modules. The diagram is automatically generated from the source code and offers a clear view of module coupling across the entire codebase.

> **Note:** GitHub's native Mermaid renderer does not support custom CSS classes (`:::component`, `:::service`, etc.). To view the diagram with full color coding, copy the content from the generated file and paste it into the [Mermaid Live Editor](https://mermaid.live/).

![Dependency Graph](./graphs/full-import-graph.svg)

### Color Legend

| Color        | Category                            |
| ------------ | ----------------------------------- |
| Blue         | Angular Components (`@Component`)   |
| Green        | Injectable Services (`@Injectable`) |
| Yellow       | Utilities and Helper Functions      |
| Teal         | Constants and Configuration         |
| Purple       | Data Models and DTOs                |
| Pink         | TypeScript Interfaces               |
| Orange       | Enumerations                        |
| Green-Gray   | Guards (`canActivate`)              |
| Red          | Angular Pipes (`@Pipe`)             |
| Gray         | Angular Directives (`@Directive`)   |
| Orange-Brown | External Dependencies               |

### What's Included

The generated graph captures **every import relationship** across the `src/app` directory, excluding:

- Test files (`.spec.ts`, `.test.ts`)
- Configuration files (`app.config.server.ts`, `app.config.ts`, `app.routes.ts`)

All TypeScript files are categorized based on their content:

- **Components** – Classes decorated with `@Component`
- **Services** – Classes decorated with `@Injectable`
- **Utilities** – Files containing exported functions
- **Constants** – Files containing exported constants
- **Models** – Data model classes
- **Interfaces** – TypeScript interfaces
- **Enums** – TypeScript enumerations
- **Guards** – Route guards implementing `canActivate`
- **Pipes** – Classes decorated with `@Pipe`
- **Directives** – Classes decorated with `@Directive`

### Generating the Diagram

The diagram is generated by scanning all TypeScript files in `src/app` and extracting import statements. The process is fully automated and can be run locally.

#### Prerequisites

- **Node.js** installed (v18 or higher)
- **VS Code** or any terminal with Node.js access

Open a terminal in VS Code (`Ctrl + \` `` `) and navigate to the project root:

````bash
cd ...\angular_fe

#### Commands

| Action | Command |
|--------|---------|
| Remove existing graphs folder | `rmdir /s /q graphs` |
| Generate a new diagram | `node generate-mermaid-graph.mjs` |

#### Step-by-Step Instructions

1. Open **VS Code** and ensure you are in the project root directory
2. Open the integrated terminal (`Ctrl + \` `` `)
3. Delete the existing graphs folder (if any):

   ```bash
   rmdir /s /q graphs

4. Generate the updated dependency graph:

  ```bash
  node generate-mermaid-graph.mjs

5. The script will display statistics and save the diagram to `graphs/full-import-graph.md`.
   Example output:

   ```text
   Scanning...
   Done: ...\angular_fe\graphs\full-import-graph.md

   Statistics:
      Total files: 156
      Total connections: 284
      Valid connections: 267
      Skipped connections: 17

   By category:
      component: 26
      service: 22
      util: 23
      constant: 8
      model: 7
      interface: 59
      enum: 8
      guard: 0
      pipe: 2
      directive: 0

   ### Troubleshooting

| Issue | Solution |
|-------|---------|
| node is not recognized | Install Node.js from [nodejs.org](https://nodejs.org) |
| Cannot find module | Ensure you are in the correct project root directory |
| Graph does not render in GitHub | GitHub does not support custom CSS classes. Use [Mermaid Live Editor](https://mermaid.live/) |

### Viewing the Diagram

To view the fully styled diagram with color coding:

```text
Open graphs/full-import-graph.md in VS Code or any text editor.

Copy the entire Mermaid code block (the content between ```mermaid and ```).

Paste it into the Mermaid Live Editor.

The diagram will render with the full color scheme.
````

---
## Testing Setup

Unit tests are executed using:
- **Karma v6.4.4** as the test runner
- **Jasmine v4.6.1** as the testing framework

Tests run in a browser environment and are configured via Angular CLI.

### Test Commands

| Command | Description | When to use | Terminal location |
|---------|-------------|-------------|-------------------|
| `ng test` | Runs all unit tests and keeps watching for file changes | During development, to see tests re-run automatically as you edit code | Project root directory (angular_fe/) |
| `ng test --watch=false` | Runs all tests once and exits | Before committing code, after major changes, or in CI/CD pipelines | Project root directory (angular_fe/) |
| `ng test --include='**/cart.component.spec.ts'` | Runs only the specified test file and keeps watching for changes | When actively developing/debugging a single component or service | Project root directory (angular_fe/) |
| `ng test --include='**/cart.component.spec.ts' --watch=false` | Runs only the specified test file once and exits | When debugging a single component or service before commit or in CI/CD pipelines | Project root directory (angular_fe/) |

---

## Angular Build Instructions

Below are the commands to build and run the Angular frontend with SSR (Server-Side Rendering) for production.

| Command | Description |
|---------|-------------|
| `rmdir /s /q dist` (Windows) / `rm -rf dist` (Linux/macOS) | Remove the existing `dist` folder completely. |
| `rd /s /q .angular` (Windows) / `rm -rf .angular` (Linux/macOS) | Remove the `.angular` cache folder to force a clean rebuild. |
| `ng build --configuration=production` | Build the Angular application in production mode with SSR. |
| `node dist/angular_fe/server/server.mjs` | Start the production server with the compiled bundle. |

### Quick copy-paste for **Windows (CMD/PowerShell)**:

```bash
rmdir /s /q dist
rd /s /q .angular
ng build --configuration=production
node dist/angular_fe/server/server.mjs
```

### Quick copy-paste for Linux / macOS:

```bash
rm -rf dist
rm -rf .angular
ng build --configuration=production
node dist/angular_fe/server/server.mjs
```

> 📌 **Note:** Make sure you have installed dependencies with `npm install` before running the build.

---

