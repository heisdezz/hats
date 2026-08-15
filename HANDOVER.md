# Project Handover & Architecture Spec

This document details the exact state of the backend (`hats_db`) and frontend (`hats`) applications, completed hardening and UI work, and next steps for subsequent AI agents or developers.

---

## 1. Environment & Architecture Overview

- **Backend Workspace**: `/home/destiny/Documents/projects/hats_db`
  - Engine: PocketBase v0.26+ with TypeScript hooks (`pb_hooks/`) and migrations (`pb_migrations/`).
  - Dev Server: Running at `http://127.0.0.1:8090` using `env $(cat .env) ./pocketbase serve --dev`.
  - Public Webhook URL: `https://rabii.duckdns.org/paystack/webhook` (Proxied via Caddy on DigitalOcean VPS `167.172.60.237` over SSH reverse tunnel).

- **Frontend Workspace**: `/home/destiny/Documents/projects/hats`
  - Framework: React 19, TanStack Start / TanStack Router, Vite v8, Tailwind CSS v4, DaisyUI v5.
  - Port: Runs on port `3000` via `bun run dev`.

---

## 2. Backend Hardening Summary (`hats_db`)

1. **Secret Management (Phase 0)**:
   - Paystack secret key stored in `.env` (`PAYSTACK_SECRET=sk_test_...`).
   - Hooks (`pb_hooks/utils.js`) load the secret via `$os.getenv("PAYSTACK_SECRET")` and refuse execution if missing.

2. **Schema & Security Hardening (Phase 1)**:
   - Migration `1755100000_payments_hardening.js` applied.
   - Added `amount_kobo` field to `checkout_sessions`.
   - Added `user` relation field to `order_items`.
   - Updated collection access rules:
     - `user_orders`: `@request.auth.id != '' && user = @request.auth.id`
     - `order_items`: `@request.auth.id != '' && user = @request.auth.id`

3. **Integer Kobo Currency & Fulfillment (Phase 2)**:
   - All price math processed in integer kobo (`₦1 = 100 kobo`).
   - Order fulfillment (`utils.fulfill_order`) creates order snapshots in a single DB transaction and updates `cart_items` atomically.

4. **Webhooks & Cron Reconciliation (Phase 3)**:
   - Webhook route: `POST /paystack/webhook` verifies Paystack raw-body HMAC-SHA512 signature (`x-paystack-signature`).
   - Cron Job: Runs every 20 minutes (`cronAdd("reconcile_pending_checkout", "*/20 * * * *")`) to verify pending checkout sessions against Paystack API.

---

## 3. Frontend Completed UI Work (`hats`)

### Header Subsystem (`src/components/`)
- **[header.tsx](file:///home/destiny/Documents/projects/hats/src/components/header.tsx)**: Top shipping promo banner (`FREE SHIPPING on all Lagos orders above ₦150,000 🚚`), sticky glassmorphism header, responsive brand logo, search bar container, store buttons, and desktop sub-nav.
- **[AuthHeader.tsx](file:///home/destiny/Documents/projects/hats/src/components/AuthHeader.tsx)**: Authenticated state greeting user (`user?.username || user?.email`), direct links to `Profile` (`/profile`) and `My Orders` (`/profile/orders`), logout, and guest login/register links.
- **[StoreButtons.tsx](file:///home/destiny/Documents/projects/hats/src/components/StoreButtons.tsx)**: Live cart counter badge connected to `/cart/breakdown` endpoint, plus Wishlist button.
- **[SearchBar.tsx](file:///home/destiny/Documents/projects/hats/src/components/SearchBar.tsx)**: Glassmorphic input field with focus ring, clear text button, and URL query parameter sync.
- **[route.tsx](file:///home/destiny/Documents/projects/hats/src/routes/store/route.tsx)**: Mobile drawer layout with category links and mobile auth buttons.

### Homepage Components (`src/routes/store/`)
- **[index.tsx](file:///home/destiny/Documents/projects/hats/src/routes/store/index.tsx)**: Store home page layout with clean responsive vertical spacing.
- **[Hero.tsx](file:///home/destiny/Documents/projects/hats/src/routes/store/-components/Hero.tsx)** & **[Slider.tsx](file:///home/destiny/Documents/projects/hats/src/routes/store/-components/Slider.tsx)**: Hero carousel banner with primary CTAs, category sidebar, and mobile quick-pills.
- **[Categories.tsx](file:///home/destiny/Documents/projects/hats/src/routes/store/-components/Categories.tsx)**: Category sidebar card with group headers, badges, and hover depth.
- **[HatsGrid.tsx](file:///home/destiny/Documents/projects/hats/src/routes/store/-components/HatsGrid.tsx)** & **[JewleryGrid.tsx](file:///home/destiny/Documents/projects/hats/src/routes/store/-components/JewleryGrid.tsx)**: Product grid cards with image hover zoom, price tags in Naira (`₦`), quick-add buttons, and category hero banners.
- **[Features.tsx](file:///home/destiny/Documents/projects/hats/src/routes/store/-components/Features.tsx)**: Value proposition feature cards (Lagos delivery, Paystack security, artisanal millinery).
- **[CustomMade.tsx](file:///home/destiny/Documents/projects/hats/src/routes/store/-components/CustomMade.tsx)**: Bespoke studio showcase with custom order consultation CTA.
- **[FeedBacks.tsx](file:///home/destiny/Documents/projects/hats/src/routes/store/-components/FeedBacks.tsx)**: Verified buyer reviews with star ratings.
- **[WriteUp.tsx](file:///home/destiny/Documents/projects/hats/src/routes/store/-components/WriteUp.tsx)**: Luxury brand story section.

---

## 4. Build Verification

- **TypeScript & Vite Build**: Verified via `bun run build`. Compiled cleanly in 3.64s with zero errors.

---

## 5. Recommended Next Tasks

1. **Catalog Page (`/store/catalog`)**:
   - Wire up dynamic category and tag filtering from PocketBase `products` and `tags` collections.
2. **Cart & Checkout (`/store/cart`)**:
   - Connect checkout session creation to PocketBase custom endpoint `/cart/checkout` and launch Paystack Popup Inline JS.
3. **My Orders Page (`/profile/orders`)**:
   - Implement order list view fetching `user_orders` with expanded `order_items` for logged-in users.
