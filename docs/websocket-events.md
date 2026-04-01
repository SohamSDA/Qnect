# WebSocket Architecture and Event Guide

This document explains WebSockets in this project from fundamentals to implementation details.

## 0. Redis Foundation (Start Here)

Before understanding Redis usage in this project, understand what Redis is.

### 0.1 What is Redis?

Redis is an in-memory data store.

- In-memory means data is served from RAM, so reads/writes are very fast.
- It supports rich data structures (not only key-value strings).
- It is commonly used for cache, queues, rate limiting, session storage, and pub/sub.

Why Redis is fast:

- No heavy disk lookup on every request.
- Data structures are optimized for constant/logarithmic operations.

### 0.2 Redis vs MongoDB in this system

Think of this project as two layers:

- MongoDB: source of truth and durable record of tokens/queues/users.
- Redis: fast operational state for active queue ordering and now-serving pointer.

Redis is used to speed up "what is next right now" operations.

### 0.3 Redis data structures used here

This codebase uses two structures per queue:

1. Sorted Set (`ZSET`) for waiting tokens

- Key: `queue:<queueId>:tokens`
- Member: `tokenId`
- Score: `seq`
- Benefit: always pop smallest `seq` quickly (`zpopmin`).

2. String for currently served token

- Key: `queue:<queueId>:nowServing`
- Value: `tokenId`

### 0.4 Why Redis is needed in this queue project

Queue workloads are order-sensitive and frequent.

Typical operations:

- Add token to waiting line.
- Serve next smallest sequence token.
- Remove token when completed/skipped/cancelled.
- Read now-serving instantly for live UI.

Doing all of this from MongoDB alone would still work, but with higher latency and more repeated sorting/counting work under load. Redis optimizes these high-frequency operations.

### 0.5 How Redis is initialized and protected

Redis setup is in `backend/src/config/redis.ts`.

Important behavior:

- Lazy connection (`lazyConnect: true`): startup does not hard-crash if Redis is unavailable.
- Readiness state is tracked.
- On errors/disconnects, app logs warnings and falls back to MongoDB paths.

This is an intentional resiliency pattern: Redis accelerates the system, but does not become a single point of total failure.

### 0.6 Redis service layer in this project

Queue-specific Redis operations are encapsulated in `backend/src/modules/queue/services/redisQueue.service.ts`.

Core functions:

- `enqueueToken(queueId, tokenId, seq)` -> `ZADD`
- `popNextToken(queueId)` -> `ZPOPMIN`
- `getWaitingTokens(queueId)` -> `ZRANGE WITHSCORES`
- `setNowServing(queueId, tokenId|null)` -> `SET` or `DEL`
- `getNowServing(queueId)` -> `GET`
- `removeToken(queueId, tokenId)` -> `ZREM` (+ clear nowServing if needed)

### 0.7 Startup rebuild (Mongo -> Redis)

On backend startup, this project rebuilds active queue state in Redis using MongoDB:

- `rebuildRedisStateFromMongo()` is invoked from server bootstrap.
- Existing queue keys are cleared.
- Waiting tokens are loaded into sorted sets.
- Latest served token per queue is stored in `nowServing` key.

Why this is important:

- Redis can be treated as reconstructible operational state.
- If Redis restarts, active queue state can be repopulated.

### 0.8 Where Redis is updated in business logic

Redis updates happen alongside token status transitions.

Examples:

- Token generation adds waiting token to Redis queue (`enqueueToken`).
- Serving next token pops next waiting token and sets `nowServing`.
- Completing/skipping/cancelling removes token and clears/updates pointers.

This keeps Redis aligned with current active flow while MongoDB keeps durable history.

### 0.9 Redis failure behavior

If Redis is not ready:

- Redis helpers return fallback values.
- Services use MongoDB queries as fallback logic.
- WebSocket updates still continue, though potentially with less performance.

In short: degraded mode, not hard outage.

## 0B. Redis + WebSocket: How they work together

This is the core integration idea in your system.

1. A queue state mutation happens (join/serve/skip/expire/etc.).
2. Mutation handlers update MongoDB and attempt Redis active-state updates.
3. Handler calls `broadcastQueueUpdate(queueId)`.
4. Socket layer builds a fresh queue snapshot.
5. Snapshot builder first tries Redis for waiting list and now-serving pointer.
6. It enriches token details from MongoDB.
7. Socket emits `updateQueue` to room `queue:<queueId>`.

Meaning:

- Redis helps produce real-time snapshot quickly.
- WebSocket delivers that snapshot instantly to clients.

So Redis is the fast state engine, and WebSocket is the live delivery channel.

## 0C. Detailed flow example (Serve Next)

When operator serves next token:

1. Operator endpoint triggers service logic.
2. Service reads current `nowServing` from Redis if available.
3. Service finalizes previous served token and clears state.
4. Service pops next waiting token from Redis sorted set (`zpopmin`) when possible.
5. Service marks selected token as `SERVED` in MongoDB and sets expiry.
6. Service sets new `nowServing` in Redis.
7. Controller calls `broadcastQueueUpdate(queueId)`.
8. Socket snapshot function reads Redis waiting + now-serving quickly.
9. Socket emits `updateQueue` to all subscribed clients.

Net effect: low-latency serving flow with instant UI sync.

## 0D. Operational notes for Redis in this project

- Keep `REDIS_URL` configured in backend environment.
- Monitor logs for fallback warnings (`fallback to MongoDB`).
- If queue ordering looks stale after infra restart, verify startup rebuild executes.
- Redis keys are queue-scoped, so memory use scales with active waiting tokens.
- Periodic cleanup is naturally handled by removing/completing tokens and rebuild semantics.

## 0E. Why this design is good for Qnect

- Fast queue operations from Redis.
- Durable correctness from MongoDB.
- Instant propagation from WebSockets.
- Graceful degradation when Redis is unavailable.

This combination is a strong fit for a campus queue system where both correctness and real-time responsiveness matter.

## 1. What Is a WebSocket?

A WebSocket is a persistent, two-way connection between client and server.

- HTTP model: request -> response -> connection closed.
- WebSocket model: one connection stays open, both sides can send messages at any time.

Why this matters for queue systems:

- Queue state changes frequently (join, serve, skip, expire).
- Users need instant updates (kiosk screens, dashboards).
- Polling every few seconds is slower and more expensive.

In this codebase, Socket.IO is used on top of WebSocket to handle transport, reconnects, and event-based messaging.

## 2. Why WebSockets Are Used Here

WebSockets are used to push live queue updates immediately when queue state changes.

Without WebSockets:

- Frontend must poll REST endpoints repeatedly.
- Updates are delayed between polls.
- More backend load due to repeated requests.

With WebSockets:

- Backend emits `updateQueue` instantly after mutation.
- Clients subscribed to that queue receive the latest snapshot in real time.
- Kiosk and live views remain synchronized.

## 3. High-Level Architecture

### 3.1 Backend side

- HTTP server is created and shared with Socket.IO.
- Socket.IO server listens for client events (`subscribeQueue`, `unsubscribeQueue`, `joinQueue`).
- Backend groups clients by queue-specific rooms (`queue:<queueId>`).
- On state change, backend builds a fresh queue snapshot and emits to that room.

### 3.2 Frontend side

- A socket client connects to backend using `NEXT_PUBLIC_SOCKET_URL`.
- UI components subscribe to a queue room.
- Component listens for `updateQueue` and updates state.
- Reconnect logic re-subscribes rooms after connection loss.

## 4. Files and Responsibilities

## Backend

- `backend/src/server.ts`
  - Bootstraps database/redis/jobs.
  - Creates HTTP server and initializes Socket.IO.

- `backend/src/server/socket.ts`
  - Core Socket.IO server.
  - Defines server/client event contracts.
  - Handles connection lifecycle.
  - Handles subscribe/unsubscribe/join events.
  - Exposes `broadcastQueueUpdate(queueId)`.
  - Builds queue snapshot payload with DB + Redis state.

- `backend/src/cron/tokenExpiry.job.ts`
  - Periodically expires served tokens.
  - Triggers `broadcastQueueUpdate` for affected queues.

- `backend/src/modules/operator/operator.controller.ts`
  - After operator actions (serve/skip/recall/pause/resume/capacity update), broadcasts update.

- `backend/src/modules/updateUserStatus/userStatus.controller.ts`
  - After user status changes (join/leave/check-in flows), broadcasts update.

- `backend/src/modules/queue/queue.controller.ts`
  - After token and queue state mutations, broadcasts update.

## Frontend

- `frontend/lib/websocket.ts`
  - Main queue subscription helper used by kiosk.
  - Creates singleton socket.
  - Tracks subscribed queue IDs.
  - Re-subscribes automatically after reconnect.

- `frontend/components/kiosk/Kiosk.tsx`
  - Subscribes to one queue.
  - Consumes live `updateQueue` events.
  - Displays connection state and live queue data.

- `frontend/app/services/socket.ts`
  - Separate global socket instance.

- `frontend/app/hooks/useSocketToasts.ts`
  - Global listeners for toast notifications.

- `frontend/app/components/GlobalHooks.tsx`
  - Mounts global socket listeners once.

## 5. Event Contracts

### 5.1 Client -> Server events

- `subscribeQueue`
  - Payload: `{ queueId: string }`
  - Effect:
    - Socket joins room `queue:<queueId>`.
    - Server sends immediate initial `updateQueue` snapshot.

- `unsubscribeQueue`
  - Payload: `{ queueId: string }`
  - Effect:
    - Socket leaves room `queue:<queueId>`.

- `joinQueue`
  - Payload: `{ queueId: string }` + callback ack.
  - Effect:
    - Server tries token generation.
    - Ack returns success or error.
    - Emits `tokenGenerated` to requesting socket.
    - Broadcasts `updateQueue` to room.

Note: most current frontend queue joins are REST-based in user dashboard pages, but backend still supports socket-based `joinQueue`.

### 5.2 Server -> Client events

- `updateQueue`
  - Main real-time event.
  - Contains full snapshot:
    - Queue metadata (id, name, location, status, capacity, isFull, nextSequence)
    - Token list (id, seq, status, createdAt, optional expireAt)
    - Stats (waiting, active, completed)

- `tokenGenerated`
  - Sent to socket that triggered `joinQueue` socket event.
  - Contains generated token details.

- `error`
  - `{ message: string }`
  - Sent on validation/processing failures.

## 6. Queue Rooms and Targeted Broadcasting

Room naming convention:

- `queue:<queueId>`

Benefits:

- Only clients interested in one queue receive that queue's updates.
- Avoids noisy global broadcasts.
- Scales better with many queues.

Broadcast API:

- `broadcastQueueUpdate(queueId)`
  - Builds latest snapshot.
  - Emits only to `queue:<queueId>` room.

## 7. Snapshot Construction Logic

`getQueueSnapshot(queueId)` in socket server constructs the payload.

Data sources:

- Queue metadata from MongoDB `Queue` model.
- Waiting and now-serving references from Redis helpers when available.
- Token details from MongoDB `Token` model.

Token inclusion behavior:

- Includes waiting and served tokens.
- Also includes recently expired tokens (last ~30 minutes) so UI can reflect transitions.

Stats included:

- `totalWaiting`
- `totalActive`
- `totalCompleted` (count query)

## 8. Connection Lifecycle

### 8.1 Connect

- Client connects using Socket.IO URL.
- Backend logs socket id.

### 8.2 Subscribe

- Client emits `subscribeQueue`.
- Backend joins room and sends immediate `updateQueue`.

### 8.3 Real-time updates

- Any queue mutation path calls `broadcastQueueUpdate`.
- Room subscribers instantly receive fresh snapshot.

### 8.4 Disconnect and reconnect

- On disconnection, client side keeps reconnection enabled.
- On reconnect, `frontend/lib/websocket.ts` re-emits `subscribeQueue` for previously tracked queues.

## 9. Where Updates Originate (Mutation Sources)

Common broadcast triggers:

- Operator controls:
  - Serve next
  - Skip current
  - Recall current
  - Pause/resume queue
  - Update capacity

- User flows:
  - Join queue
  - Leave queue
  - Check-in confirmation

- Token admin actions:
  - Status changes
  - Extend token time
  - Mark no-show
  - Recall token

- Background job:
  - Token expiry cron (every 30 seconds)

## 10. Transport and CORS Configuration

Server transport config:

- Socket server allows `websocket` and `polling` transports.

Client transport config:

- `frontend/lib/websocket.ts`: forces `websocket` transport.
- `frontend/app/services/socket.ts`: allows `websocket` and `polling`.

Origin configuration:

- Backend CORS uses `FRONTEND_URL` (comma-separated allowed origins).
- Socket server also uses parsed `FRONTEND_URL` for Socket.IO CORS.

Frontend envs:

- `NEXT_PUBLIC_SOCKET_URL` should point to backend host.

## 11. Current Design Notes and Risks

There are currently two frontend socket client entry points:

- `frontend/lib/websocket.ts`
- `frontend/app/services/socket.ts`

Potential issue:

- Global toast listeners may not receive queue-room updates if that socket instance never subscribes to queue rooms.

Recommendation:

- Consolidate to a single socket client layer, or ensure both layers subscribe consistently.

## 12. Practical Debug Checklist

If live updates are not working:

1. Verify backend started Socket.IO initialization.
2. Verify `NEXT_PUBLIC_SOCKET_URL` points to correct backend.
3. Confirm CORS `FRONTEND_URL` includes current frontend origin.
4. Confirm client emitted `subscribeQueue` with correct queueId.
5. Confirm server log shows subscription and broadcast for that queue.
6. Confirm room name consistency: `queue:<queueId>`.
7. Confirm mutation path calls `broadcastQueueUpdate`.
8. Confirm no duplicate conflicting socket instances in frontend.

## 13. End-to-End Example Flow

Example: operator serves next token.

1. Operator clicks "Serve Next" on frontend.
2. Frontend sends REST request to operator endpoint.
3. Backend updates token states.
4. Controller calls `broadcastQueueUpdate(queueId)`.
5. Socket server builds latest snapshot.
6. Socket server emits `updateQueue` to `queue:<queueId>` room.
7. Kiosk/client subscribed to same queue updates UI instantly.

## 14. Summary

In this project:

- REST endpoints perform authoritative state changes.
- WebSockets distribute those changes in real time.
- Queue rooms keep updates targeted and scalable.
- Snapshot-based `updateQueue` event is the primary live data contract.

This pattern is the reason kiosks and queue dashboards can remain in sync with near-zero delay.
