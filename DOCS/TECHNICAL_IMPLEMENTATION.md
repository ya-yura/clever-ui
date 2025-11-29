# 🛠 Technical Implementation Guide: Warehouse PWA

**Project:** Warehouse Management System (Склад-15 PWA)  
**Stack:** React 18, Vite, TypeScript, Tailwind CSS, IndexedDB (Dexie)

---

## 1. Architecture Overview

The application follows a **Offline-First** architecture.

### Key Components
1.  **UI Layer:** React Components (`src/components`, `src/pages`).
2.  **State Management:** React Context (`AuthContext`, `DocumentHeaderContext`) + Local State.
3.  **Data Layer:** 
    *   `src/services/api.ts` (REST/OData connectivity).
    *   `src/services/db.ts` (Local IndexedDB via Dexie).
    *   `src/hooks/useSync.ts` (Synchronization logic).
4.  **Hardware Integration:** 
    *   `useScanner.ts` (Keyboard emulation handling).
    *   `html5-qrcode` (Camera based scanning).

## 2. Offline & Synchronization

### Storage
We use **Dexie.js** as a wrapper around IndexedDB.
*   **Documents:** Stored in tables like `receivingDocuments`, `pickingDocuments`, etc.
*   **Lines:** Stored in relational tables `receivingLines`, etc., linked by `documentId`.

### Sync Queue
All mutations (add, update, delete) are captured by `useOfflineStorage` hook.
1.  Action is performed locally (Optimistic UI).
2.  Action payload is saved to `syncActions` table in IndexedDB.
3.  `useSync` hook monitors network status.
    *   If **Online**: Flushes queue to server.
    *   If **Offline**: Keeps actions until connection restores.

## 3. Module Implementations

### Receiving (`src/pages/Receiving.tsx`)
*   **Logic:** Validates scans against `receivingLines`.
*   **Status:** Lines move from `pending` → `partial` → `completed`.
*   **Features:** Over-plan warnings, Manual completion trigger.

### Picking (`src/pages/Picking.tsx`)
*   **Routing:** Sorts lines by `routeOrder`.
*   **Navigation:** Automatically suggests next `cellId` upon completion of current cell.

### Documents List (`src/pages/DocumentsByType.tsx`)
*   **Filtering:** Client-side filtering for performance.
*   **Caching:** Uses `odataCache` to store document lists to minimize network calls.

## 4. PWA Configuration

Configured in `vite.config.ts` using `vite-plugin-pwa`.
*   **Strategy:** `generateSW` (Simple caching).
*   **Manifest:** Includes icons, theme colors, and standalone display mode.
*   **Assets:** Caches fonts, icons, and build artifacts.

## 5. Build & Deploy

### Commands
```bash
npm install     # Dependencies
npm run dev     # Local server
npm run build   # Production build (dist/)
npm run preview # Test production build
```

### Requirements
*   Node.js 18+
*   Modern Browser (Chrome/Safari/Edge/iOS Safari) with Service Worker support.

---

## 6. Future Improvements

*   **Image Storage:** Implement `blob` storage in IndexedDB for photos.
*   **Push Notifications:** Integrate Firebase/WebPush for task assignments.
*   **Background Sync:** Use Service Worker Background Sync API for more robust queue flushing.

