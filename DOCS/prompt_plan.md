Below is the implementation plan structured per your requirements, followed by the `todo.md` checklist.

---

## High-Level Blueprint
1. **Activity Infrastructure** – add storage, types, and services for logging and syncing events.
2. **Config & Settings** – create activity config file, loader, and admin UI for editing.
3. **Sync Worker & Diagnostics** – implement background sender, connectivity hooks, and diagnostics view.
4. **UI Instrumentation & Schema Support** – instrument warehouse flows to log events, ensure Constructor schemas stay compatible.
5. **Testing & Deployment Integration** – cover unit/integration tests, Dexie migration, Vite proxy/config updates.

---

## Phases & Atomic Steps

### Phase 1 – Activity Data Layer
- **Step 1.1**: Extend Dexie schema for `activityEvents`.
- **Step 1.2**: Add TypeScript types/enums for activity payloads.
- **Step 1.3**: Implement ActivityLogger service (`logEvent`).

### Phase 2 – Config Management
- **Step 2.1**: Create `config/activity.json` defaults + loader.
- **Step 2.2**: Add admin settings UI for activity config.

### Phase 3 – Sync Worker & Diagnostics
- **Step 3.1**: Implement ActivitySync service (batch sender + retry).
- **Step 3.2**: Hook sync service into connectivity lifecycle.
- **Step 3.3**: Build diagnostics widget/page for queue stats.

### Phase 4 – UI Instrumentation & Schema Support
- **Step 4.1**: Instrument core flows (receiving, placement, picking, etc.) to log actions/errors.
- **Step 4.2**: Ensure Constructor schema loader handles activity requirements (version/meta fallback).

### Phase 5 – Testing & Deployment
- **Step 5.1**: Add targeted unit/integration tests (logger, sync, config).
- **Step 5.2**: Update Dexie migration/versioning and Vite proxy/config docs.

---

## Code-Generation Prompts per Step

### Step 1.1 – Dexie schema
```
[Step 1.1] Extend Dexie schema for activity tracking.

Files:
- src/services/db.ts (add new table definition `activityEvents` with fields {id, eventType, timestamp, payload, status, retryCount, lastError, createdAt}).
- src/types/activity.ts (new file) defining interfaces for stored events.

Tests:
- Add/extend unit test (e.g., src/services/__tests__/db.test.ts) verifying schema version bump and ability to insert/select an ActivityEvent (use Dexie’s in-memory adapter).

After implementing, wire this into the existing system.
```

### Step 1.2 – Types & enums
```
[Step 1.2] Define activity event enums/types.

Files:
- src/types/activity.ts (from Step 1.1) add enums EventType, EventStatus, payload interfaces (base + specific ones for receiving/picking/errors).
- Ensure exports are used by future steps (ActivityLogger).

Tests:
- Add type-focused test or TS assertion file (e.g., src/types/__tests__/activity.types.test.ts) ensuring discriminated unions compile.
- Optional: use tsd or expectType utility.

wire this into the existing system.
```

### Step 1.3 – ActivityLogger service
```
[Step 1.3] Implement ActivityLogger.

Files:
- src/services/activityLogger.ts (new): expose `logEvent(eventType, data)` that builds payload, writes to Dexie `activityEvents`, returns stored record.
- src/services/db.ts: export helper for accessing `activityEvents`.
- src/utils/index.ts (if needed) add helper for timestamps/uuid.

Tests:
- src/services/__tests__/activityLogger.test.ts using Dexie mock: verify successful insert, failure handling (Dexie error fallback to console + in-memory array).

wire this into the existing system.
```

### Step 2.1 – Activity config loader
```
[Step 2.1] Activity config file + loader.

Files:
- config/activity.json (defaults: baseUrl, batchSize, retry, categories).
- src/services/activityConfig.ts: load JSON, merge with defaults, expose get/set with validation.
- src/services/configService.ts: register activity config accessors.

Tests:
- src/services/__tests__/activityConfig.test.ts verifying validation (URL format, numeric bounds) and persistence.

wire this into the existing system.
```

### Step 2.2 – Admin settings UI
```
[Step 2.2] Admin UI for activity config.

Files:
- src/pages/Settings.tsx (or new ActivitySettings component) add section for activity config (URL, batch size, retry intervals, checkboxes for categories).
- src/hooks/useActivityConfig.ts (optional) to wrap loader/save.

Tests:
- Component test (React Testing Library) ensuring form loads existing config, validates, and triggers save.

wire this into the existing system.
```

### Step 3.1 – ActivitySync service
```
[Step 3.1] Implement ActivitySync batch sender.

Files:
- src/services/activitySync.ts: functions `syncPendingEvents`, `scheduleRetry`, uses Axios (new activityApi client or extend api.ts) to POST batching with config.
- src/services/activityLogger.ts: update statuses when sync completes.
- src/types/activity.ts: add status transitions.

Tests:
- src/services/__tests__/activitySync.test.ts mocking Axios; scenarios: success (queued events deleted), network failure (retry scheduled), permanent failure (status=error, stored lastError).

wire this into the existing system.
```

### Step 3.2 – Connectivity hook integration
```
[Step 3.2] Invoke ActivitySync on connectivity changes.

Files:
- src/hooks/useSync.ts or new hook `useActivitySync.ts` subscribing to online/offline (navigator.onLine, existing offline storage hook) and calling `syncPendingEvents`.
- Integrate hook in top-level component (e.g., src/App.tsx) or Layout effect.

Tests:
- Hook test mocking navigator.onLine and verifying sync called once per transition using jest fake timers.

wire this into the existing system.
```

### Step 3.3 – Diagnostics UI
```
[Step 3.3] Diagnostics widget for activity queue.

Files:
- src/pages/Diagnostics.tsx: add section showing queue length, last sync time, last error.
- src/services/activityLogger.ts: expose helpers to read stats.

Tests:
- Component test verifying data renders, fallback state when queue empty.

wire this into the existing system.
```

### Step 4.1 – Instrument core flows
```
[Step 4.1] Instrument receiving/placement/picking/etc.

Files:
- src/pages/Receiving.tsx, Placement.tsx, Picking.tsx, Shipment.tsx, Inventory.tsx: when major actions occur (scan, quantity change, doc completion, errors), call ActivityLogger.logEvent with appropriate payloads.
- src/pages/Login.tsx/AuthContext: log login/logout events.
- src/utils/feedback.ts: ensure errors pass to logger.

Tests:
- Add integration tests per module (or shared test) mocking ActivityLogger to confirm it’s invoked with expected parameters when actions triggered.

wire this into the existing system.
```

### Step 4.2 – Constructor schema compatibility
```
[Step 4.2] Ensure schema loader supports activity metadata.

Files:
- src/services/schemaLoader.ts & src/components/DynamicGridInterface.tsx: extend schema definition with version/meta, fallback logic when schema lacks activity instrumentation.
- Provide warning log and fallback to default UI.

Tests:
- Schema loader test verifying fallback triggers when schema version mismatch.
- Dynamic interface test verifying operations still call ActivityLogger.

wire this into the existing system.
```

### Step 5.1 – Comprehensive tests
```
[Step 5.1] Add final unit/integration tests.

Files:
- Consolidate tests for ActivityLogger, Sync, Config, Instrumentation.
- Optionally add MSW-based integration verifying network requests.

wire this into the existing system.
```

### Step 5.2 – Deployment integration
```
[Step 5.2] Dexie migration & Vite proxy updates.

Files:
- src/services/db.ts: bump version, add migration for existing stores.
- DOCS/README or deployment doc: describe activity config file, Vite proxy adjustments for Activity API.
- vite.config.ts: add proxy entry if needed.

Tests:
- Manual migration test (script) or automated Dexie migration test ensuring old db upgrades.

wire this into the existing system.
```

---

## `todo.md`

```markdown
# TODO – Activity Tracking & Interface Flexibility

## Phase 1 – Activity Data Layer
- [ ] 1.1 Extend Dexie schema with `activityEvents` table.
- [ ] 1.2 Define activity event types/enums.
- [ ] 1.3 Implement ActivityLogger service.

## Phase 2 – Config Management
- [ ] 2.1 Add `config/activity.json` + loader/service.
- [ ] 2.2 Build admin UI for editing activity config.

## Phase 3 – Sync & Diagnostics
- [ ] 3.1 Implement ActivitySync batch sender.
- [ ] 3.2 Hook sync into connectivity lifecycle.
- [ ] 3.3 Add diagnostics section for activity queue.

## Phase 4 – UI Instrumentation & Schema Support
- [ ] 4.1 Instrument receiving/placement/picking/etc. to log events.
- [ ] 4.2 Extend schema loader for Constructor compatibility.

## Phase 5 – Testing & Deployment
- [ ] 5.1 Add comprehensive unit/integration tests.
- [ ] 5.2 Update Dexie migration, Vite proxy, and docs.
```