# Dezz Hats & Millinery - E-Commerce Platform

A bespoke luxury headwear, fascinators, and traditional African headpiece (Auto Gele) e-commerce web application.

Built with **React 19**, **TanStack Start**, **TanStack Router**, **Vite**, **Tailwind CSS v4**, **DaisyUI v5**, and powered by a hardened **PocketBase v0.40+** backend with **Backblaze B2 S3 Object Storage**.

---

## 🚀 Key Architecture & Features

### 1. Storefront & Catalog
- **Artisanal Millinery Showcase**: High-resolution image galleries with Backblaze B2 S3 storage for fascinators, top hats, and hand-embroidered auto geles.
- **Cart Space Budgeting**: Dynamic packaging capacity calculation ensuring fragile headwear is budgeted accurately for delivery.
- **Secure Payments**: Paystack Inline checkout integration with automated webhook verification (`POST /paystack/webhook`) and cron reconciliation.

### 2. Logistics & Delivery Verification Subsystem
- **Logistics Collection**: Dedicated couriers (`bolt`, `glovo`, `gigl`) registered with unique confirmation codes.
- **In-Transit Enforcement**: Orders cannot be moved to `in-transit` unless an active logistics provider is assigned.
- **Safe Handover Protocol**: Orders cannot be marked `delivered` without entering a 4-digit confirmation code that matches the assigned courier's code.
- **Customer Tracking UI**: Customers receive a bold, copyable **Delivery Safety Code** on their order page (`/profile/orders/$orderId`) to share with the rider upon arrival.
- **Admin Dispatch Control**: Admins manage courier assignments and perform code verification directly from the order detail dashboard (`/admin/dashboard/orders/$orderId`).

---

## 🛠️ Tech Stack

- **Frontend**:
  - React 19 + TypeScript
  - TanStack Start (SSR / Streaming) & TanStack Router (File-based routing)
  - TanStack Query (Server state management)
  - Tailwind CSS v4 + DaisyUI v5 (Design system & glassmorphic UI)
  - Lucide React (Icons) & Sonner (Toast notifications)
- **Backend (`hats_db`)**:
  - PocketBase `v0.40.2` (Go SQLite backend)
  - Goja JavaScript runtime hooks (`pb_hooks/`)
  - Backblaze B2 S3 Storage integration for all media
  - Automated database migrations (`pb_migrations/`)

---

## 📦 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed.
- PocketBase running on `http://127.0.0.1:8090` (see `hats_db/run.sh`).

### Installation

```bash
# Install frontend dependencies
bun install

# Start development server on port 3000
bun run dev
```

### Production Build

```bash
# Build client and server bundles
bun run build

# Preview production build
bun run preview
```

---

## 📂 Project Structure

```
hats/
├── src/
│   ├── client/                  # PocketBase client & SSR initialization
│   ├── components/              # Shared header, navigation & layouts
│   ├── routes/
│   │   ├── admin/dashboard/     # Admin orders, products, logistics management
│   │   │   └── orders.$orderId.tsx # Admin order fulfillment & dispatch control
│   │   ├── profile/orders/      # Customer order tracking & delivery safety code
│   │   │   └── $orderId.tsx     # Order status stepper & live dispatch card
│   │   └── store/               # Storefront, catalog, cart & checkout
│   └── styles.css               # Tailwind CSS v4 & theme variables
├── pocketbase-types.ts          # Auto-generated PocketBase TypeScript types
└── package.json
```

---

## 🔒 Security & Safe Handover Workflow

1. **Order Creation**: Order is initiated via Paystack checkout with status `pending`.
2. **Atelier Preparation**: Order is moved to `processing` during millinery crafting.
3. **Dispatch & Logistics**:
   - Admin assigns a courier (`bolt`, `glovo`, `gigl`) with a generated 4-digit code.
   - Status transitions to `in-transit`.
   - Customer sees the confirmation code on their profile order page.
4. **Delivery Handover**:
   - Customer shares the 4-digit code with the courier upon receiving the package.
   - Admin/rider inputs the code to confirm delivery.
   - Backend verifies that `code === logistics.code` before updating status to `delivered`.
