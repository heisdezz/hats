# Project Handover & Architecture Spec

This document details the exact state of the backend (`hats_db`) and frontend (`hats`) applications, completed hardening, logistics verification, and next steps for subsequent AI agents or developers.

---

## 1. Environment & Architecture Overview

- **Backend Workspace**: `/home/destiny/Documents/projects/hats_db`
  - Engine: PocketBase **v0.40.2** with TypeScript hooks (`pb_hooks/`) and migrations (`pb_migrations/`).
  - Storage: **Backblaze B2 S3 Object Storage** (`bucket: hats-db`, `endpoint: https://s3.us-east-005.backblazeb2.com`).
  - Dev Server: Running at `http://127.0.0.1:8090` using `./run.sh` or `./pocketbase serve --dev`.
  - Superuser: `desto4q@gmail.com` (`oghenemaro8`).

- **Frontend Workspace**: `/home/destiny/Documents/projects/hats`
  - Framework: React 19, TanStack Start / TanStack Router, Vite v8, Tailwind CSS v4, DaisyUI v5.
  - Port: Runs on port `3000` via `bun run dev`.

---

## 2. Backend Hardening & Features (`hats_db`)

### Storage & Backblaze B2 S3 Setup
- Credentials from `hats_key.ts` configured via migration `1786840000_setup_b2_s3.js`.
- Seeded hat products (`hats_1`, `hats_2`, `hats_3`) with visual descriptions, colors, and direct S3 uploads via migration `1786841000_seed_hats.js`.
- Legacy local files synced to Backblaze B2 S3 via migration `1786842000_sync_black_hat.js`.

### Logistics & Delivery Code Validation Subsystem
- **Collections**:
  - `logistics`: Fields `name` (text), `provider` (bolt | glovo | gigl), `code` (number).
  - `user_orders`: Added relation `logisitics` (refs `logistics`) and `code` (number).
- **Enforced Backend Hooks** (`pb_hooks/orders.pb.ts` & `pb_hooks/utils.js`):
  1. `in-transit`: Throws `400 Bad Request` if `logisitics` is not set or references a missing record.
  2. `delivered`: Throws `400 Bad Request` if `code` is missing or does not match `logistics.code`.

---

## 3. Frontend UI Components & Pages (`hats`)

### Admin Order Management
- **Page**: `src/routes/admin/dashboard/orders.$orderId.tsx`
  - Added `logisitics` relation expansion.
  - Stepper click handlers validate logistics assignment and prompt code entry.
- **Component**: `src/routes/admin/dashboard/-components/orders/LogisticsManager.tsx`
  - Displays assigned courier details (Bolt, Glovo, GIGL badges, dispatcher name, security code).
  - Modal with tabs to assign existing couriers or register a new courier dispatch with random code generation.
  - Delivery verification modal with numeric code input and auto-fill helper.

### Customer Order Tracking
- **Page**: `src/routes/profile/orders/$orderId.tsx`
  - Added `logisitics` relation expansion.
  - Enhanced layout displaying live dispatch status.
- **Component**: `src/routes/profile/-components/OrderDeliveryCard.tsx`
  - **In Transit**: Displays active pulse banner, courier info, and prominent **Delivery Safety Code** with one-click copy button.
  - **Customer Handover Confirmation**: Allows customers to directly complete delivery by inputting their 4-digit delivery security code (with autofill helper) to confirm order receipt.
  - **Delivered**: Displays verified handover badge and verified delivery code.
  - **Pending / Processing**: Displays atelier preparation timeline and shipping guarantees.

---

## 4. Build Verification

- Frontend builds cleanly via `bun run --cwd /home/destiny/Documents/projects/hats build` with zero TypeScript or bundler errors.
- Backend verified healthy at `http://127.0.0.1:8090` with full integration test pass.
