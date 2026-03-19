# Angular Multi-Edit Locking

A full-stack demonstration of **distributed multi-user edit locking** using WebSockets. When multiple users view the same resource, only one can edit at a time — all others see real-time lock status updates and are blocked from editing until the lock is released.

Built with Angular 18, Angular Material, Node.js/Express, and the `ws` WebSocket library.

## How It Works

The application manages two sample entity types (Students and Products) with full CRUD operations. The core feature is the **edit locking mechanism**:

1. Each browser client receives a unique identifier (MD5 hash derived from request headers) via the `/api/getClientId` endpoint.
2. When a user navigates to a resource's combo (view/edit) page, the Angular client subscribes to the **Edit Locker WebSocket Server** with its client ID.
3. When the user clicks the edit icon, the client sends an `acquireLock` message. The server records the lock holder and broadcasts the lock state to all other subscribed clients.
4. Other clients see the edit icon disabled with a tooltip indicating who holds the lock. Attempting to edit shows a modal message.
5. When the editing user switches back to view mode (or navigates away), a `releaseLock` message is sent and all clients are notified that editing is available again.
6. A periodic ping/pong heartbeat (every 3 seconds) keeps WebSocket connections alive.

### The `EditPanelComponent`

This reusable component is the heart of the locking UI. It uses Angular's `ng-template` content projection — consuming components provide `#view` and `#edit` template refs, and `EditPanelComponent` handles toggling between them based on lock state:

```html
<app-edit-panel>
  <ng-template #view>
    <app-view-student></app-view-student>
  </ng-template>
  <ng-template #edit>
    <app-edit-student></app-edit-student>
  </ng-template>
</app-edit-panel>
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 18, Angular Material 18, RxJS 7 |
| Backend | Node.js, Express 4 |
| WebSockets | `ws` library |
| Data Storage | File-based JSON (`db-students.json`, `db-products.json`) |
| Testing | Karma, Jasmine |

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd node-server
npm install
```

### Running the Application

Both the frontend and backend must be running simultaneously.

**Terminal 1 — Backend:**

```bash
cd node-server
npm run start
```

This starts three servers:
- **Express REST API** on port 3000
- **Chat WebSocket server** on port 8081
- **Edit Locker WebSocket server** on port 9074

For development with auto-restart on file changes:

```bash
cd node-server
npm run indev
```

**Terminal 2 — Frontend:**

```bash
npm start
```

The Angular dev server starts at [http://localhost:4200](http://localhost:4200).

### Testing the Lock

1. Open [http://localhost:4200](http://localhost:4200) in two separate browser windows (or different browsers).
2. Click the link icon on a student or product row to open the combo (view/edit) page in both windows.
3. In one window, click the edit icon to acquire the lock.
4. In the other window, observe the edit icon become disabled with a tooltip showing that the resource is locked.
5. Switch back to view mode in the first window to release the lock.

## Project Structure

```
├── src/                         # Angular frontend
│   └── app/
│       ├── all-data/            # Home view — lists students and products
│       ├── add-student/         # Create student form
│       ├── add-product/         # Create product form
│       ├── edit-student/        # Edit student form
│       ├── edit-product/        # Edit product form
│       ├── view-student/        # Read-only student view
│       ├── view-product/        # Read-only product view
│       ├── edit-panel/          # Lock-aware view/edit toggle component
│       ├── students-combo/      # Student view+edit wrapped in edit-panel
│       ├── product-combo/       # Product view+edit wrapped in edit-panel
│       ├── chat/                # WebSocket chat demo
│       ├── get-client-id/       # Client ID retrieval component/service
│       ├── students.service.ts  # HTTP CRUD for students
│       ├── products.service.ts  # HTTP CRUD for products
│       ├── edit-locker-client-ws.service.ts  # WebSocket client for locking
│       ├── ws-client.service.ts              # WebSocket client for chat
│       └── interval-runner.service.ts        # Ping interval manager
│
└── node-server/                 # Node.js backend
    ├── server.js                # Express app + Chat WS + Edit Locker WS
    ├── utils.js                 # JSON file read/write helpers
    ├── middleware/
    │   └── logger.js            # Request logging
    ├── db-students.json         # Student data (file-based DB)
    └── db-products.json         # Product data (file-based DB)
```

## API Endpoints

### REST (port 3000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | List all students |
| GET | `/api/students/:id` | Get student by ID |
| POST | `/api/students` | Create a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create a product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| GET | `/api/getClientId` | Get unique client identifier |

### WebSocket — Edit Locker (port 9074)

| Message Type | Direction | Description |
|-------------|-----------|-------------|
| `subscribe` | Client -> Server | Register for lock notifications |
| `unsubscribe` | Client -> Server | Deregister |
| `acquireLock` | Client -> Server | Request edit lock |
| `releaseLock` | Client -> Server | Release edit lock |
| `ping` | Client -> Server | Heartbeat |
| `subscribed` | Server -> Client | Subscription confirmed |
| `unsubscribed` | Server -> Client | Unsubscription confirmed |
| `lockAcquired` | Server -> Client | Lock granted to requester |
| `lockReleased` | Server -> Client | Lock released confirmation |
| `lock` | Server -> Client | Lock state broadcast to all subscribers |
| `pong` | Server -> Client | Heartbeat response |

## Known Limitations

- Lock acquisition currently assumes success on the client side (no failure handling for race conditions).
- No timeout-based lock expiry — if a client disconnects without releasing, the lock remains until the server detects the closed connection.
- Client ID is derived from HTTP headers, so multiple tabs in the same browser share one identity.
- Data is stored in flat JSON files, not suitable for production use.

## License

MIT — Copyright 2023, Raoul Marc Schmidiger
