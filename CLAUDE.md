# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack CRUD application demonstrating **distributed multi-user edit locking** via WebSockets. Angular 18 frontend with Material UI, Node.js/Express backend with file-based JSON storage, and custom WebSocket servers for real-time lock coordination.

## Commands

### Frontend (Angular)
```bash
npm install          # Install dependencies
npm start            # Dev server on http://localhost:4200
npm run build        # Production build (output: dist/ang14-material-ui-crud/)
npm test             # Run Karma/Jasmine tests in Chrome
```

### Backend (Node.js)
```bash
cd node-server
npm install          # Install dependencies
npm run start        # Start server (REST on :3000, Chat WS on :8081, Lock WS on :9074)
npm run indev        # Start with nodemon (auto-restart on changes)
```

Both frontend and backend must be running simultaneously for the app to function.

### Angular CLI
```bash
ng generate component <name>
ng generate service <name>
```

## Architecture

### Frontend (`src/app/`)

**Routing** (`app-routing.module.ts`): CRUD routes for students and products entities, plus edit-panel, combo (view/edit), chat, and client-ID routes.

**Services:**
- `StudentsService` / `ProductsService` — HTTP CRUD against `/api/students` and `/api/products`
- `EditLockerClientWsService` — WebSocket client (port 9074) for the edit locking protocol. Uses RxJS Subject (`genericMessageSubject`) for message passing. Message types: subscribe, unsubscribe, acquireLock, releaseLock, lock, ping/pong
- `WsClientService` — WebSocket client (port 8081) for chat demo
- `GetIdServiceService` — Fetches unique client ID from `/api/getClientId` (MD5 hash of request headers)
- `IntervalRunnerService` — Manages periodic ping intervals to keep WebSocket connections alive

**Key Component — `EditPanelComponent`:**
This is the core of the locking system. It uses `ng-template` content projection with `#view` and `#edit` template refs to toggle between view/edit modes. On init, it subscribes to the lock server; on edit, it acquires a lock; on destroy, it releases and unsubscribes. Other clients receive real-time lock status updates.

**Combo Components** (`StudentsComboComponent`, `ProductsComboComponent`): Wrap view and edit templates inside `EditPanelComponent` for the lock-aware editing flow.

**HTTP Interceptor** (`NoCacheHeadersInterceptor`): Adds Cache-Control/Pragma headers to all requests to prevent browser caching.

### Backend (`node-server/`)

**`server.js`** contains three servers:
1. **Express REST API** (port 3000) — CRUD endpoints for students/products, client ID generation
2. **Chat WebSocket** (port 8081) — Simple echo/broadcast chat
3. **EditLockerWebSocketServer** (port 9074) — The locking server. Maintains a `HashMap` of subscribed clients and a `lockHeldBy` field tracking the current lock holder. Broadcasts lock state changes to all subscribers. Runs a 5-second interval notifier.

**Data storage:** File-based JSON (`db-students.json`, `db-products.json`), read/written via `utils.js`.

**`node-server/` uses ES modules** (`"type": "module"` in its package.json).

### Edit Locking Protocol

1. Client calls `/api/getClientId` to get a stable identifier
2. Client connects to WS on port 9074 and sends `subscribe` with its clientId
3. To edit: client sends `acquireLock` → server sets `lockHeldBy`, broadcasts `lock` to all subscribers
4. Other clients see the resource as locked (editing disabled, tooltip shows locker identity)
5. When done: client sends `releaseLock` → server clears `lockHeldBy`, broadcasts unlock
6. Periodic ping/pong keeps connections alive (3-second client interval)

## Key Ports

| Port | Service |
|------|---------|
| 4200 | Angular dev server |
| 3000 | Express REST API |
| 8081 | Chat WebSocket server |
| 9074 | Edit locker WebSocket server |
