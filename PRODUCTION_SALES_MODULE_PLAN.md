# Production, Sales & Complaints Module — Full Plan

**Client:** Fatima Engineering Works / Fischer Brand
**Source:** Literature for development of production and sales interaction module.docx
**Scope:** Two end-to-end modules — B2B Sales Orders + Complaints Management
**Last updated:** March 2026

---

## What the Client Has Today

Salespersons visit dealers across Pakistan, collect orders verbally, then send them to WhatsApp groups (one for in-city, one for out-of-city). A production team reads the group and manually writes orders into a paper register, then starts manufacturing. Complaints come in by phone or word-of-mouth. Problems:

- Orders get skipped or lost in chat
- No order detail, no audit trail
- No visibility into what's been produced vs. what's been ordered
- No tracking of who sold what, in which city, for which dealer
- No complaints tracking system
- No reporting for management

---

## The Two Modules at a Glance

```
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│   MODULE 1: SALES & ORDERS      │   │   MODULE 2: COMPLAINTS           │
│                                 │   │                                 │
│ Salesperson visits dealer →     │   │ Complaint from:                 │
│ opens app → punches order →     │   │  • Online customer (has order)  │
│ production sees it live         │   │  • Offline customer (no order,  │
│                                 │   │    bought from market/dealer)   │
│ Tracks: pending → producing     │   │  • Dealer (B2B batch issue)     │
│         → ready → delivered     │   │                                 │
│                                 │   │ Filed by: salesperson in field  │
│ Reports: sales by person, city, │   │  or admin staff by phone        │
│  SKU trends, production gaps    │   │                                 │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## User Roles — Five Types

| Role | Who | What They Can Do |
|------|-----|-----------------|
| `salesperson` | Field staff, on phone | Place B2B orders, file complaints, view own records only |
| `production_manager` | Factory/office, desktop | View production dashboard, update order status & inventory |
| `complaints_manager` | Office staff | View all complaints, assign them, update status, add comments |
| `admin` | IT / senior staff | Full access to all modules + settings |
| `director` | Senior management | View-only dashboards + all reports + exports |

> **Key constraint:** A salesperson logs in and sees only two things — "New Order" and "New Complaint" (plus their own history). Nothing else. No production numbers. No other salesperson's data.

---

---

# MODULE 1 — B2B SALES & ORDERS

---

## The Core Architecture — Two Separate Inventories

The website already has an online e-commerce shop with its own inventory. A salesperson might take a dealer order for 100 units of the same product. **These must never interfere with each other.**

| | Online Shop Stock | B2B / Dealer Order |
|---|---|---|
| **What it is** | Finished goods ready to ship to retail customers today | Manufacturing demand — goods that need to be built |
| **Who orders** | A retail customer on the website | A salesman on behalf of a dealer |
| **What happens** | Stock is reserved/decremented | A production job is created. Nothing is decremented. |
| **Where goods come from** | The warehouse | The factory floor |

---

## Territory & City Model

Each salesperson is assigned to one or more cities. This enables:
- Reports filtered by city/region
- Automatic city tagging on orders they submit
- Demographic sales breakdowns for the director

```
Salesperson: Ali Hassan
├─ Assigned cities: Lahore, Gujranwala, Sialkot
└─ When he files an order → city is selected from his assigned list
```

Cities come from the existing Pakistan cities list already in the codebase (`frontend/src/data/pakistanCities.ts`). No new city database needed — just a `salesperson_cities` pivot table.

---

## Screen Design — Salesperson (Mobile-First)

The salesperson is sitting inside a dealer's shop, using their phone. The UI must be fast, tap-friendly, and require zero training.

### Bottom tab bar (only 3 tabs):
```
[  + New Order  ]  [  My Orders  ]  [  + Complaint  ]
```

### New Order Form:
```
┌─────────────────────────────────────┐
│  New Order                          │
│                                     │
│  Dealer Name         [____________] │
│  City                [Lahore     ▼] │  ← only their assigned cities
│  Brand               [Fischer    ▼] │  ← Fischer / OEM / ODM
│                                     │
│  ┌─ Products ────────────────────┐  │
│  │  Search SKU or product name   │  │
│  │  ┌──────────────────────────┐ │  │
│  │  │ FKH-101 Kitchen Hood 90cm│ │  │
│  │  │ Qty: [−] 10 [+]          │ │  │
│  │  │ Note: [_______________]  │ │  │
│  │  └──────────────────────────┘ │  │
│  │  [+ Add Another Product]      │  │
│  └───────────────────────────────┘  │
│                                     │
│  Order Remarks  [________________]  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │       SUBMIT ORDER          │    │  ← large green button
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### My Orders List:
Each card shows: date, dealer name, city, item count, status badge (Pending / In Production / Ready / Delivered). Tap to expand — shows all line items.

---

## Screen Design — Production Manager (Desktop)

### Top KPI Cards (4 cards):
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Pending B2B  │ │ Units to     │ │ SKUs with    │ │ Delivered    │
│ Orders       │ │ Manufacture  │ │ Shortage     │ │ Today        │
│     12       │ │    1,247     │ │      7       │ │      3       │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### SKU Aggregation Table (the bird's-eye view):
Sorted by gap descending — most urgent first. Red row = shortfall exists.

| SKU | Product | Ordered | In Stock | In Production | Gap | Action |
|-----|---------|:-------:|:--------:|:-------------:|:---:|--------|
| WAC-103 | Water Cooler | 200 | 5 | 30 | **165** 🔴 | Update Stock |
| FKH-101 | Kitchen Hood | 100 | 10 | 50 | **40** 🔴 | Update Stock |
| FKB-201 | Built-in Hob | 60 | 60 | 0 | **0** ✅ | Update Stock |

"Update Stock" button opens an inline edit modal — production manager types new quantity_available and quantity_in_production.

### Pending Orders List (below the table):
All orders from all salespersons. Each row shows: date, salesperson name, dealer, city, item count. Status dropdown to move: `pending → in_production → ready → delivered`. Set delivery estimate date per order. Expand to see line items.

---

## Screen Design — Director / Reports

Full reporting suite (Phase 2):
- Units sold per salesperson (filterable by date range, month, city)
- Sales breakdown by city/region — map or bar chart
- Month-wise sales trends per SKU
- Dead inventory (SKUs with no B2B orders in 60+ days)
- Shelf life per SKU (estimated time to move remaining stock)
- Estimated delivery time per order (vs. actual)
- Reconciliation: orders received vs. goods produced vs. delivered
- Orders success ratio (placed → delivered without cancellation)
- Export all reports to Excel or PDF

---

## Data Model — Module 1

### `salesperson_cities` (pivot)
| Column | Type | Notes |
|--------|------|-------|
| user_id | FK → users | the salesperson |
| city | string | city name from Pakistan cities list |

### `b2b_orders`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| order_number | string unique | auto-generated e.g. ORD-2026-00142 |
| salesperson_id | FK → users | who submitted it |
| dealer_name | string | free text |
| city | string | from salesperson's assigned cities |
| brand_name | enum | Fischer, OEM, ODM |
| status | enum | pending, in_production, ready, delivered, cancelled |
| delivery_estimate | date | nullable, set by production manager |
| remarks | text | optional |
| created_at / updated_at | timestamps | |

### `b2b_order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| b2b_order_id | FK → b2b_orders | |
| product_id | FK → products | nullable (SKU may not be in shop yet) |
| sku | string | always stored |
| product_name | string | stored at time of order |
| quantity | int | units ordered |
| notes | text | per-item notes |

### `production_inventory`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| product_id | FK → products | nullable |
| sku | string unique | |
| product_name | string | |
| quantity_available | int | finished, ready to dispatch |
| quantity_in_production | int | currently being manufactured |
| last_updated_by | FK → users | for audit trail |
| updated_at / created_at | timestamps | |

> **This table is 100% independent of `products.stock_quantity` (online shop inventory). Never joined or mixed.**

---

---

# MODULE 2 — COMPLAINTS MANAGEMENT

---

## The Critical Design Problem — Offline Complainants

This is the hardest design challenge in the entire project.

**The scenario:** A customer in Multan bought a Fischer water cooler from a local shop six months ago. It's now broken. The Fischer salesperson visits the local shop, and the shopkeeper says "one of my customers has a problem." The customer has:
- No Fischer website account
- No online order
- No order ID
- Just a broken product and a purchase receipt from a physical shop

**How do we take their complaint in the app?**

The answer: A complaint does NOT require a website order. Complaints are a completely standalone system. Every complaint has a **complainant profile** — which can be one of three types:

```
Complainant Types
├── online_customer   → Has a website account + order ID. Complaint links to that order.
├── offline_customer  → No website account. Complaint is standalone. We capture their
│                       name, phone, city, where they bought from, and what product.
└── dealer            → B2B complaint about a batch (e.g., "50 units arrived defective").
                        Links to a b2b_order if one exists, or standalone.
```

**Complaint Sources (who filed it):**
- `salesperson` — field rep filed it during a visit (most common for offline)
- `admin_staff` — office person filed it after receiving a phone call
- `self` — (Phase 2) customer filed it themselves on the website

---

## Complaint Lifecycle

```
OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED
         │
         └─ assigned_to (complaints_manager or technician)
```

- **OPEN**: Just filed. No one has acted on it yet.
- **ASSIGNED**: A complaints manager has assigned it to someone.
- **IN_PROGRESS**: The assignee is actively working on it (visiting, calling, replacing).
- **RESOLVED**: The issue has been fixed. Resolution notes added.
- **CLOSED**: Confirmed resolved after follow-up. Case is closed.

Every status change is logged with a timestamp and the user who made the change (audit trail).

---

## Screen Design — Salesperson (Mobile-First)

### New Complaint Form:

```
┌─────────────────────────────────────────────────────┐
│  New Complaint                                      │
│                                                     │
│  Who is complaining?                                │
│  ○ Online Customer (has website account)            │
│  ● Offline Customer (bought from shop/dealer)       │
│  ○ Dealer (B2B batch complaint)                     │
│                                                     │
│  ── IF OFFLINE CUSTOMER ──────────────────────────  │
│  Customer Name       [_______________________]      │
│  Phone Number        [_______________________]      │
│  City                [Lahore               ▼]       │
│                                                     │
│  ── Product Info ─────────────────────────────────  │
│  Search Product      [Fischer Water Cooler... 🔍]   │
│  (can't find it?)    [Enter SKU manually ___]       │
│  Approx. Purchase    [Month ▼] [Year ▼]             │
│  Purchased From      [Dealer / Market / Other ▼]    │
│  Dealer/Shop Name    [_______________________]      │
│  Serial Number       [_____________] (optional)     │
│                                                     │
│  ── The Complaint ─────────────────────────────────  │
│  Category            [Product Defect         ▼]     │
│                       (Defect / Delivery / Missing  │
│                        / Installation / Warranty)   │
│  Description         [_______________________]      │
│                       [_______________________]     │
│  Photos              [📷 Attach Photos (max 4)]     │
│                                                     │
│  ┌───────────────────────────────────────────┐      │
│  │            SUBMIT COMPLAINT               │      │
│  └───────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

After submission: The app shows a **Complaint Reference Number** (e.g., CPL-2026-00089). Salesperson reads it out to the customer so they can track it.

### IF ONLINE CUSTOMER is selected:
- Search by customer email or phone → pulls their account
- Optionally link to a specific order
- Product info pre-fills from the order

### IF DEALER is selected:
- Dealer name field
- Optionally link to an existing B2B order number
- Complaint could be about a full batch (quantity field: "how many units are defective")

---

## Screen Design — Complaints Manager (Desktop)

### All Complaints List:
```
┌─────────────────────────────────────────────────────────────────────┐
│  Complaints           [All Status ▼] [All Category ▼] [City ▼]     │
│                       [Search by reference/name/phone...]          │
├──────────────┬──────────────┬───────────┬───────────┬─────────────  │
│ Reference    │ Complainant  │ Product   │ Category  │ Status        │
├──────────────┼──────────────┼───────────┼───────────┼─────────────  │
│ CPL-2026-089 │ Ahmed (Offline│ WAC-103  │ Defect    │ OPEN 🔴      │
│              │ Lahore)      │           │           │               │
│ CPL-2026-088 │ Sara K.      │ FKH-101  │ Warranty  │ IN_PROGRESS 🟡│
│              │ (Online)     │           │           │               │
└─────────────────────────────────────────────────────────────────────┘
```

### Complaint Detail View:
```
┌─────────────────────────────────────────────────────────────────────┐
│  CPL-2026-089   |   Product Defect   |   🔴 OPEN                   │
│                                                                     │
│  ── Complainant ────────────────────────────────────────────────    │
│  Ahmed Raza   •   0300-1234567   •   Lahore                        │
│  Offline customer — bought from Al-Hassan Electronics, Lahore      │
│  Purchase: ~August 2025                                             │
│                                                                     │
│  ── Product ────────────────────────────────────────────────────    │
│  WAC-103 — Fischer Water Cooler 30L                                 │
│  Serial: FW-2025-1193 (if provided)                                │
│                                                                     │
│  ── Description ────────────────────────────────────────────────   │
│  "The cooling is not working after 6 months. Makes noise."         │
│  Photos: [IMG_1] [IMG_2]                                            │
│                                                                     │
│  ── Filed By ───────────────────────────────────────────────────   │
│  Ali Hassan (Salesperson) — 2026-03-02 10:45 AM                    │
│                                                                     │
│  ── Actions ────────────────────────────────────────────────────   │
│  Assign to: [Select staff member ▼]  [ASSIGN]                      │
│  Status:    [OPEN ▼]                 [UPDATE STATUS]               │
│                                                                     │
│  ── Activity ───────────────────────────────────────────────────   │
│  [Add a comment or note...]                           [ADD]        │
│                                                                     │
│  2026-03-02 10:45 — Filed by Ali Hassan (Salesperson)              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Offline Complaint Tracking — Customer-Facing

A key usability feature: Even an offline customer (who has no website account) can check their complaint status by visiting the Fischer website and entering their reference number.

A new public page at `/track-complaint` (no login required):
```
┌─────────────────────────────────────┐
│  Track Your Complaint               │
│                                     │
│  Enter Reference Number:            │
│  [CPL-2026-00089] [TRACK]           │
│                                     │
│  ── Result ──────────────────────── │
│  CPL-2026-089 — Water Cooler Defect │
│  Status: IN PROGRESS                │
│  Filed: 2 March 2026                │
│  Last updated: 3 March 2026         │
│  "Technician visit scheduled"       │
└─────────────────────────────────────┘
```

This lets the salesperson hand the customer a reference number during the visit, and the customer can check progress without needing any account.

---

## Data Model — Module 2

### `complaints`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| complaint_number | string unique | auto-generated e.g. CPL-2026-00089 |
| complainant_type | enum | online_customer, offline_customer, dealer |
| customer_id | FK → users nullable | if online_customer |
| online_order_id | FK → orders nullable | if linked to website order |
| b2b_order_id | FK → b2b_orders nullable | if linked to B2B order |
| complainant_name | string | always stored (for offline or as copy for online) |
| complainant_phone | string | |
| complainant_city | string | |
| dealer_purchased_from | string nullable | shop/dealer name for offline customers |
| purchase_channel | enum | website, dealer, retailer, market, other |
| approx_purchase_month | tinyint nullable | 1–12 |
| approx_purchase_year | smallint nullable | |
| product_id | FK → products nullable | if matched to a product in system |
| sku_manual | string nullable | if typed manually (not found in system) |
| product_name_manual | string nullable | |
| serial_number | string nullable | |
| complaint_category | enum | defect, delivery, missing_item, installation, warranty, other |
| description | text | |
| status | enum | open, assigned, in_progress, resolved, closed |
| assigned_to | FK → users nullable | complaints manager or technician |
| resolved_at | timestamp nullable | |
| resolution_notes | text nullable | |
| filed_by_id | FK → users | salesperson or admin staff who filed it |
| filed_by_type | enum | salesperson, admin_staff, self |
| created_at / updated_at | timestamps | |

### `complaint_attachments`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| complaint_id | FK → complaints | |
| file_path | string | stored in storage/app/public/complaints/ |
| file_name | string | |
| uploaded_by | FK → users | |
| created_at | timestamp | |

### `complaint_activity_log`
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| complaint_id | FK → complaints | |
| user_id | FK → users | who made the action |
| action_type | enum | status_change, assignment, comment, note |
| old_status | string nullable | for status_change |
| new_status | string nullable | for status_change |
| body | text nullable | comment text |
| created_at | timestamp | |

---

---

# SHARED INFRASTRUCTURE

---

## Dark / Light Mode

Both modules must be fully dark and light mode supported. The existing admin panel already has dark mode via Tailwind's `dark:` prefix and a theme toggle in the top bar. All new pages follow the same pattern — every Tailwind class is paired with a `dark:` variant.

Colors to use (consistent with existing admin):
- **Light mode**: bg-white, bg-gray-50, bg-gray-100 cards, text-gray-900
- **Dark mode**: dark:bg-gray-900, dark:bg-gray-800 cards, dark:text-gray-100
- **Status badges**: use semantic colors (red/yellow/green/blue) with dark variants
- **Salesperson mobile view**: same theme toggle in header, default to system preference

---

## Notification System (Phase 2)

After Phase 1 is live:
- Production manager gets in-app notification when a new B2B order arrives
- Complaints manager gets in-app notification when a new complaint is filed
- Salesperson gets in-app notification when their order status changes (e.g., "Ready for delivery")
- Director gets daily summary notification

Implementation: Laravel database notifications + frontend polling or WebSocket (decide at Phase 2 start).

---

## Auto-generated Reference Numbers

Both modules need unique, human-readable reference numbers (not raw database IDs):
- **Orders**: `ORD-2026-00142` — year + sequential number padded to 5 digits
- **Complaints**: `CPL-2026-00089` — same pattern

Generated in the model's `creating` event:
```php
static::creating(function ($model) {
    $year = date('Y');
    $last = static::whereYear('created_at', $year)->max('id') ?? 0;
    $model->order_number = "ORD-{$year}-" . str_pad($last + 1, 5, '0', STR_PAD_LEFT);
});
```

---

---

# FULL FILE INVENTORY

---

## Backend (Laravel)

### Migrations
| File | Creates |
|------|---------|
| `..._create_salesperson_cities_table.php` | Territory pivot table |
| `..._create_b2b_orders_table.php` | B2B orders |
| `..._create_b2b_order_items_table.php` | B2B order line items |
| `..._create_production_inventory_table.php` | Factory stock (separate from shop) |
| `..._create_complaints_table.php` | Complaints |
| `..._create_complaint_attachments_table.php` | Complaint photos/files |
| `..._create_complaint_activity_log_table.php` | Audit trail for complaints |
| `..._add_role_to_users_table.php` | Add salesperson/production_manager/complaints_manager roles |

### Models
| File | Represents |
|------|-----------|
| `backend/app/Models/B2bOrder.php` | |
| `backend/app/Models/B2bOrderItem.php` | |
| `backend/app/Models/ProductionInventory.php` | |
| `backend/app/Models/Complaint.php` | |
| `backend/app/Models/ComplaintAttachment.php` | |
| `backend/app/Models/ComplaintActivityLog.php` | |

### Controllers
| File | Routes served |
|------|--------------|
| `backend/app/Http/Controllers/Api/Production/SalesOrderController.php` | CRUD for B2B orders |
| `backend/app/Http/Controllers/Api/Production/ProductionDashboardController.php` | SKU aggregation, KPI cards |
| `backend/app/Http/Controllers/Api/Production/ProductionInventoryController.php` | Factory inventory management |
| `backend/app/Http/Controllers/Api/Complaints/ComplaintController.php` | Full complaints CRUD |
| `backend/app/Http/Controllers/Api/Complaints/ComplaintPublicController.php` | Public tracking by reference number |

### Form Requests
| File | Validates |
|------|-----------|
| `backend/app/Http/Requests/StoreB2BOrderRequest.php` | New order from salesperson |
| `backend/app/Http/Requests/StoreComplaintRequest.php` | New complaint (all types) |
| `backend/app/Http/Requests/UpdateComplaintStatusRequest.php` | Status + assignment updates |

### Route Files
| File | Action |
|------|--------|
| `backend/routes/api/production.php` | **Create** — all Module 1 routes |
| `backend/routes/api/complaints.php` | **Create** — all Module 2 routes |
| `backend/routes/api.php` | **Modify** — include both new files |

---

## Frontend (React / TypeScript)

### Types
| File | Exports |
|------|---------|
| `frontend/src/types/b2b.ts` | B2bOrder, B2bOrderItem, ProductionInventoryItem |
| `frontend/src/types/complaints.ts` | Complaint, ComplaintActivity, ComplaintAttachment, enums |

### API Layer
| File | Calls |
|------|-------|
| `frontend/src/api/b2b.ts` | All B2B order endpoints |
| `frontend/src/api/complaints.ts` | All complaint endpoints |

### Salesperson Pages (mobile-first)
| File | Screen |
|------|--------|
| `frontend/src/pages/admin/sales-portal/index.tsx` | Salesperson home (tabs: new order / my orders / new complaint) |
| `frontend/src/pages/admin/sales-portal/NewOrderForm.tsx` | New B2B order form |
| `frontend/src/pages/admin/sales-portal/MyOrders.tsx` | Their submitted orders |
| `frontend/src/pages/admin/sales-portal/NewComplaintForm.tsx` | New complaint form (all complainant types) |
| `frontend/src/pages/admin/sales-portal/MyComplaints.tsx` | Their submitted complaints |

### Production Manager Pages
| File | Screen |
|------|--------|
| `frontend/src/pages/admin/production/index.tsx` | Production dashboard (KPI + SKU aggregation + orders list) |
| `frontend/src/pages/admin/production/inventory.tsx` | Factory inventory management |

### Complaints Manager Pages
| File | Screen |
|------|--------|
| `frontend/src/pages/admin/complaints/index.tsx` | All complaints list (filterable) |
| `frontend/src/pages/admin/complaints/[id].tsx` | Complaint detail + activity log + actions |

### Director / Reports Pages (Phase 2)
| File | Screen |
|------|--------|
| `frontend/src/pages/admin/reports/sales.tsx` | Salesperson performance reports |
| `frontend/src/pages/admin/reports/production.tsx` | Production reconciliation |
| `frontend/src/pages/admin/reports/complaints.tsx` | Complaint trends and resolution rates |

### Public Page
| File | Screen |
|------|--------|
| `frontend/src/pages/track-complaint/index.tsx` | Public complaint tracker (no login) |

### Modified Files
| File | Change |
|------|--------|
| `frontend/src/pages/admin/AdminLayout.tsx` | Add Production + Complaints sidebar sections |
| `frontend/src/App.tsx` | Add all new routes |
| `frontend/src/pages/admin/Dashboard.tsx` | Add B2B + complaints summary widgets |

---

---

# ROLLOUT PLAN

---

## Phase 1 — Core (Build First)

**Week 1: Database & Backend**
1. Run 8 migrations — all new tables
2. Create 6 models with relationships
3. Add new roles to `users` table
4. SalesOrderController — index, store, show, updateStatus
5. ProductionDashboardController — dashboard aggregation query (cross-join b2b_orders + production_inventory)
6. ComplaintController — index, store, show, updateStatus, addComment, uploadAttachment
7. ComplaintPublicController — track by reference number (no auth)
8. Form requests + validation rules
9. Route files registered

**Week 2: Salesperson UI (mobile-first)**
1. New Order form — product search, quantity steppers, city selector
2. My Orders list — status badges, expandable rows
3. New Complaint form — complainant type switcher, all field variants
4. My Complaints list
5. Auto-generated reference number display on success
6. Full dark/light mode support

**Week 3: Production Manager + Complaints Manager UI**
1. Production dashboard — 4 KPI cards, SKU aggregation table (color-coded gaps), orders list with status dropdown + delivery date
2. Factory inventory management — inline editable table
3. Complaints list — filters, search, status badges
4. Complaint detail — activity log, assignment, status update, photo viewer
5. Full dark/light mode support

**Week 4: Integration & Polish**
1. Admin sidebar — add Production and Complaints menu groups with role-based visibility
2. Admin dashboard — add summary widgets for B2B orders and complaints
3. Public complaint tracker page at `/track-complaint`
4. Role-based middleware enforcement (backend)
5. Frontend permission checks in AdminLayout (hide menu items based on role)
6. End-to-end testing of all three roles

---

## Phase 2 — Reports & Notifications (After Phase 1 is live for 2–4 weeks)

1. Salesperson performance reports (per-person, date/month, city)
2. Regional/demographic sales map
3. SKU trends over time
4. Dead inventory + shelf life tracker
5. Delivery time estimation vs. actual (compliance tracking)
6. Order reconciliation report (ordered vs. produced vs. delivered)
7. Complaints resolution rate by category and by assignee
8. Export all reports to Excel and PDF
9. In-app notification system (new order → production manager, new complaint → complaints manager, status change → salesperson)

---

---

# KEY DESIGN RULES

1. **B2B orders never touch `products.stock_quantity`** — the two inventories are completely independent
2. **Salesperson sees only their own data** — role-enforced both in backend middleware and frontend routing
3. **Complaints do not require a website order** — offline customers are first-class citizens
4. **Every complaint gets a reference number** — so salesperson can hand it to the customer on the spot
5. **Public complaint tracker needs no login** — reference number is the only key
6. **Salesperson mobile UI has large tap targets** — minimum 48px, no tiny dropdowns
7. **Production dashboard sorts by urgency by default** — biggest gap (shortfall) at the top
8. **All new pages support dark and light mode** — every Tailwind class paired with dark: variant
9. **Auto-generated reference numbers use year prefix** — ORD-2026-XXXXX and CPL-2026-XXXXX
10. **Activity log is append-only** — never edit or delete history entries

---

*End of plan. Both modules are designed for integration within the existing admin panel at `/admin/*`. Same auth, same sidebar, same styling. No separate portal needed.*
