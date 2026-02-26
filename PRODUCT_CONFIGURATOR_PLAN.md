# Plan: Apple-Style Product Configurator + Image Migration + Attribute Admin

## Context

Currently the site has 4 placeholder/identical products with a very basic variant system — variants are just a flat list of buttons with a `name` field (e.g., "Small", "15L"). The database already has a full attribute+variant infrastructure (attributes, attribute_values, product_variants, product_variant_attribute_values tables) but the admin UI and frontend configurator never use it.

The goal is to build a full Apple-style product configurator where:
- Each product has attribute dimensions (e.g., Capacity: 15L / 25L / 35L, Color: White / Black)
- Selecting options dynamically updates price, compare_price, stock, and image
- Invalid/out-of-stock combinations are greyed out
- The admin can manage all of this from the dashboard
- Product images are migrated from `product images final/` (JPG) to WebP and placed in the correct folders

---

## Phase 1 — Image Conversion & Migration Script

### Goal
Convert the 71 high-res JPG images in `frontend/public/images/product images final/` to WebP and place them in `frontend/public/images/products/{category-slug}/`.

### Implementation
- **Script:** `scripts/convert-images.js` (Node.js using the `sharp` package)
- **Input:** `frontend/public/images/product images final/**/*.jpg`
- **Output:**
  - Primary image: 800×800px WebP, ~85% quality → `products/{category-slug}/{filename}.webp`
  - Thumbnail: 400×400px WebP, ~75% quality → `products/{category-slug}/{filename}-thumb.webp`
- **Category slug mapping** embedded in script:
  ```
  AirFryers/           → air-fryers/
  Blender/             → accessories/
  Cooking Ranges/      → cooking-ranges/
  Kitchen Hob/         → kitchen-hobs/
  Kitchen Hood/        → kitchen-hoods/
  Oven Toaster/        → oven-toasters/
  Water Dispensers/    → water-dispensers/
  water cooler/        → water-coolers/
  water heater all/    → water-heaters/
  ```
- After running, images are uploaded to products via the existing admin image manager.

---

## Phase 2 — Admin Attributes Management Page (NEW)

### Goal
Give the admin a UI to define global attribute types and values — the "dimensions" of the configurator (e.g., Capacity, Color, Wattage).

### Backend — already fully implemented:
- `AttributeController.php` — CRUD for attributes (name, type: select/color/button, sort_order)
- `AttributeValueController.php` — CRUD for values (value, color_code, sort_order)
- Routes already exist:
  - `GET/POST /api/admin/attributes`
  - `GET/PUT/DELETE /api/admin/attributes/{id}`
  - `GET/POST /api/admin/attributes/{id}/values`
  - `GET/PUT/DELETE /api/admin/values/{id}`

### Frontend — new files:
**`frontend/src/pages/admin/attributes/index.tsx`** — Main attributes page:
- Left panel: list of all attributes with their type badge
- Right panel: selected attribute's values list
- Inline create/edit/delete for both attributes and values
- Color picker for `color`-type attribute values
- Sort order drag handles
- Attribute types: `button` (pill selectors), `color` (color swatches), `select` (dropdown)

**Admin sidebar** — add "Attributes" link under the Products section.

---

## Phase 3 — Enhanced Admin Variants Tab (Configurator Builder)

### Goal
Rebuild `VariantsTab.tsx` to be a full Apple-style variant builder inside the product edit page.

### UX Flow (3-step process inside the tab):

**Step 1 — Assign Attributes**
- Multi-select checkboxes from global attributes list
- e.g., admin checks "Capacity" and "Color"
- Saves to `product_attributes` table (already exists in DB)
- New backend endpoint: `PUT /api/admin/products/{product}/attributes` (syncs attribute IDs)

**Step 2 — Generate Variant Matrix**
- "Generate Combinations" button
- System computes Cartesian product of all selected attribute values
- e.g., [15L, 25L] × [White, Black] → 4 combinations
- Renders as an editable grid:

```
| Combination   | SKU        | Price  | Orig. Price | Dealer Price | Stock | Active |
|---------------|------------|--------|-------------|--------------|-------|--------|
| 15L / White   | WH-15L-W   | 12,500 | 15,000      | 10,000       | 10    |  ✓    |
| 15L / Black   | WH-15L-B   | 12,500 | 15,000      | 10,000       | 8     |  ✓    |
| 25L / White   | WH-25L-W   | 18,500 | 22,000      | 15,000       | 5     |  ✓    |
| 25L / Black   | WH-25L-B   | 18,500 | 22,000      | 15,000       | 0     |  ✓    |
```

- Each row editable inline
- "Bulk set price" to set all variants at once
- Variant image uploader per row
- Existing variants pre-populated; new combinations added; removed combinations flagged

**Step 3 — Save (batch)**
- Single batch API call saves all variants

### Backend changes:
- `ProductVariantController.store()` / `update()` — accept `attribute_value_ids[]`, sync to `product_variant_attribute_values`
- New endpoint: `POST /api/admin/products/{product}/variants/batch` → `batchStore()` method — creates/updates/deletes the full matrix in one transaction
- New endpoint: `PUT /api/admin/products/{product}/attributes` — syncs product→attribute associations

---

## Phase 4 — Apple-Style Product Detail Configurator (Frontend)

### Goal
Replace the current flat variant button list in `ProductInfo.tsx` with a multi-dimensional Apple-style configurator.

### Backend API Change — `ProductController::show()`
Add a `configurator` block to the product show response:

```json
{
  "product": { "...all existing fields..." },
  "configurator": {
    "attributes": [
      {
        "id": 1, "name": "Capacity", "type": "button",
        "values": [
          {"id": 1, "value": "15L"},
          {"id": 2, "value": "25L"}
        ]
      },
      {
        "id": 2, "name": "Color", "type": "color",
        "values": [
          {"id": 3, "value": "White", "color_code": "#F5F5F7"},
          {"id": 4, "value": "Black", "color_code": "#1D1D1F"}
        ]
      }
    ],
    "variant_map": {
      "1,3": {"id": 101, "price": 12500, "compare_price": 15000, "sku": "WH-15L-W", "stock": 10, "image": "..."},
      "1,4": {"id": 102, "price": 12500, "compare_price": 15000, "sku": "WH-15L-B", "stock": 8, "image": "..."},
      "2,3": {"id": 103, "price": 18500, "compare_price": 22000, "sku": "WH-25L-W", "stock": 5, "image": "..."},
      "2,4": {"id": 104, "price": 18500, "compare_price": 22000, "sku": "WH-25L-B", "stock": 0, "image": "..."}
    }
  }
}
```

`variant_map` is keyed by comma-sorted attribute_value_ids — enables O(1) variant lookup from user selections.

### Frontend Configurator UX:

```
Capacity
  [ 15L ]  [ 25L ]  [ 35L ]  [ 50L ]

Color
  [● White]  [● Black]

Price: Rs. 12,500   ~~Rs. 15,000~~   (17% off)
✓ In Stock  (8 remaining)

[ Add to Cart ]
```

**Interaction rules:**
- No selection → Add to Cart disabled
- Selecting a value checks which remaining options are still valid
- Values that lead to no valid variant → greyed out (but still clickable to guide user)
- Values that lead to out-of-stock-only → shown with strikethrough
- All attributes selected → resolve `variant_map[sorted_ids_key]`
- Price/stock updates with CSS fade transition
- If variant has its own image → updates the main image gallery
- SKU shown below price

**New component:** `frontend/src/pages/product-detail/ProductConfigurator.tsx`
- Props: `configurator`, `baseProduct`, `onVariantSelect(variant | null)`
- State: `selectedValues: Record<attributeId, valueId>`
- Pure logic: resolves selected variant from variant_map key

### Updated TypeScript Types — `frontend/src/types/product.ts`:
```typescript
interface ConfiguratorAttribute {
  id: number
  name: string
  type: 'button' | 'color' | 'select'
  values: { id: number; value: string; color_code?: string }[]
}

interface ProductConfigurator {
  attributes: ConfiguratorAttribute[]
  variant_map: Record<string, {
    id: number
    price: number
    compare_price?: number
    sku: string
    stock: number
    image?: string
  }>
}
```

---

## Phase 5 — Product Seeder

### Global Attributes
| Attribute | Type | Values |
|-----------|------|--------|
| Type | `button` | Deluxe, Heavy Duty |
| Capacity | `button` | Per product (see below) |
| Gas Type | `button` | LPG, NG (Instant Gas only — same price, display-only) |

> **Pricing notes from images:**
> - **Printed prices** = MRP (listed as `compare_price` in DB)
> - **Handwritten red prices** = current actual prices (listed as `price` in DB)
> - Warranty: Deluxe = 2 Years tank leakage, Heavy Duty = 3 Years tank leakage

---

### Product 1 — Eco Watt (Dual Power) Electric Water Heater
- **Slug:** `eco-watt-electric-water-heater`
- **Attributes:** Type (Deluxe / Heavy Duty), Capacity (R-30, R-40, R-50, R-60, R-80)
- **Specs:** 800–2000 Watt Element
- **Warranty:** Deluxe = 2yr, Heavy Duty = 3yr

| Model | Type | Price | Inner Tank | Warranty |
|-------|------|-------|------------|---------|
| R-30 | Deluxe | 24,000 | 14 Gauge | 2 Years |
| R-40 | Deluxe | 26,000 | 14 Gauge | 2 Years |
| R-50 | Deluxe | 28,000 | 14 Gauge | 2 Years |
| R-60 | Deluxe | 30,000 | 14 Gauge | 2 Years |
| R-80 | Deluxe | 36,000 | 14 Gauge | 2 Years |
| R-30 | Heavy Duty | 26,000 | 10 Gauge | 3 Years |
| R-40 | Heavy Duty | 28,000 | 10 Gauge | 3 Years |
| R-50 | Heavy Duty | 31,000 | 10 Gauge | 3 Years |
| R-60 | Heavy Duty | 33,500 | 10 Gauge | 3 Years |
| R-80 | Heavy Duty | 40,000 | 10 Gauge | 3 Years |

**Total variants:** 10 ✅ CONFIRMED

---

### Product 2 — Fischer FAST Electric Water Heater
- **Slug:** `fischer-fast-electric-water-heater`
- **Attributes:** Type (Deluxe / Heavy Duty), Capacity (F-30 to F-200)
- **Specs:** Imported Glass Wool, Imported Incoloy Element, Capillary Thermostat

| Model | Type | Price | Notes |
|-------|------|-------|-------|
| F-30 | Deluxe | 21,000 | 30L, 2000W, Metal Body |
| F-40 | Deluxe | 22,000 | 40L, 2000W, Metal Body |
| F-50 | Deluxe | 23,500 | 50L, 2000W, Metal Body |
| F-60 | Deluxe | 24,500 | 60L, 2000W, Metal Body |
| F-80 | Deluxe | 28,000 | 80L, 2000W, Metal Body |
| F-100 | Deluxe | 40,000 | 100L, 2000W, Standing |
| F-140 | Deluxe | 46,000 | 140L, 1500W×2, Standing |
| F-200 | Deluxe | 54,000 | 200L, 2000W×2, Standing |
| F-30 | Heavy Duty | 23,500 | 30L, 2000W, Metal Body |
| F-40 | Heavy Duty | 25,000 | 40L, 2000W, Metal Body |
| F-50 | Heavy Duty | 26,500 | 50L, 2000W, Metal Body |
| F-60 | Heavy Duty | 29,000 | 60L, 2000W, Metal Body |
| F-80 | Heavy Duty | 34,000 | 80L, 2000W, Metal Body |
| F-100 | Heavy Duty | 48,000 | 100L, 2000W, Standing |
| F-140 | Heavy Duty | 57,000 | 140L, 1500W×2, Standing |
| F-200 | Heavy Duty | 67,000 | 200L, 2000W×2, Standing |

**Total variants:** 16 ✅ CONFIRMED (MRP = selling price, no discounts)

---

### Product 3 — Fischer Hybrid Electric+Gas Geyser
- **Slug:** `fischer-hybrid-electric-gas-geyser`
- **Attributes:** Type (Deluxe / Heavy Duty), Capacity (15G, 25G, 35G, 55G, 65G, 100G), Wattage
- **Specs:** Imported Gas Thermostat, Auto Ignition, Italian Electric Element
- **Wattage attribute confirmed as 3rd configurator dimension** ✅

**Wattage values per capacity:**
- 15G → 1500W×1 or 2000W×1
- 25G → 1500W×2 or 2000W×2
- 35G → 1500W×2 or 2000W×2
- 55G → 1500W×2 or 2000W×2
- 65G → 3000W×2 (Heavy Duty only)
- 100G → 2000W×4 (Heavy Duty only)

**Deluxe — 14/12 Inner Tank, 2yr:**
| Capacity | Wattage | MRP | Note |
|----------|---------|-----|------|
| 15G | 1500W×1 | 43,500 | ✅ |
| 15G | 2000W×1 | 48,500 | ✅ |
| 25G | 1500W×2 | 55,500 | ✅ |
| 25G | 2000W×2 | 64,000 | ✅ |
| 35G | 1500W×2 | — | admin to fill in |
| 35G | 2000W×2 | — | admin to fill in |
| 55G | 1500W×2 | — | admin to fill in |
| 55G | 2000W×2 | — | admin to fill in |

**Heavy Duty — 9/10 Inner Tank, 3yr:**
| Capacity | Wattage | MRP | Actual Price |
|----------|---------|-----|-------------|
| 15G | 1500W×1 | 50,500 | 40,400 |
| 15G | 2000W×1 | 58,000 | 46,400 |
| 25G | 1500W×2 | 69,000 | 55,200 |
| 25G | 2000W×2 | 81,000 | 64,800 |
| 35G | 1500W×2 | — | admin to fill in |
| 35G | 2000W×2 | — | admin to fill in |
| 55G | 1500W×2 | — | admin to fill in |
| 55G | 2000W×2 | — | admin to fill in |
| 65G | 3000W×2 | 90,000 | 72,000 |
| 100G | 2000W×4 | 150,000 | 120,000 |

**Total variants (seeded):** 16 (with 35G/55G rows seeded at Rs. 0 for admin to update)

---

### Product 4 — Fischer Gas Geyser
- **Slug:** `fischer-gas-geyser`
- **Attributes:** Type (Deluxe / Heavy Duty), Capacity

**Deluxe — 14/12 Inner Tank, 2yr:**
| Model | MRP | Actual Price (red) |
|-------|-----|-------------------|
| 15G | 39,500 | 31,600 |
| 25G | 44,000 | 35,200 |
| 35G | 47,500 | 38,000 |
| 55G | 55,000 | 44,000 |

**Heavy Duty — 9/10 Inner Tank, 3yr:**
| Model | MRP | Actual Price (red) |
|-------|-----|-------------------|
| 15G | 42,000 | 33,600 |
| 25G | 53,000 | 42,400 |
| 35G | 61,000 | 48,800 |
| 55G | 72,000 | 57,600 |
| 65G | 78,000 | 62,400 |
| 100G | 130,000 | 104,000 |

**Total variants:** 10

---

### Product 5 — Instant Gas Water Heater (100% Imported)
- **Slug:** `instant-gas-water-heater`
- **Attributes:** Capacity (6L, 8L, 10L), Gas Type (LPG / NG — same price)
- **Specs:** White paint front panel with LED, heavy duty copper heat exchanger

| Model | MRP (compare_price) | Price |
|-------|---------------------|-------|
| FWH-6L | 21,250 | 17,000 |
| FWH-8L | 28,125 | 22,500 |
| FWH-10L | 32,500 | 26,000 |

**Total variants:** 3 ✅ CONFIRMED (Gas Type is informational only, not a price variant)

---

### Product 6 — Instant cum Storage Electric Water Heater (FE Series)
- **Slug:** `instant-storage-electric-water-heater`
- **Attributes:** Capacity (FE-10, FE-15, FE-30)
- **Specs:** Pure ABS Body, Moulded Single Welded Galvanized Sheet Water Tank, Imported Incoloy Element, Capillary Thermostat
- **Warranty:** 2 Years Tank Leakage

| Model | Type | Price | Inner Tank | Warranty |
|-------|------|-------|------------|---------|
| FE-10 | Deluxe | 17,000 | 14 Gauge | 2 Years |
| FE-15 | Deluxe | 19,000 | 14 Gauge | 2 Years |
| FE-30 | Deluxe | 24,000 | 14 Gauge | 2 Years |
| FE-10 | Heavy Duty | — | 10 Gauge | 3 Years |
| FE-15 | Heavy Duty | — | 10 Gauge | 3 Years |
| FE-30 | Heavy Duty | — | 10 Gauge | 3 Years |

**Total variants:** 6 ✅ CONFIRMED (Heavy Duty prices to be filled by admin)

---

### ✅ All Product Data Confirmed

1. ~~Eco Watt Heavy Duty prices~~ ✅ 26K / 28K / 31K / 33.5K / 40K
2. ~~Fast Electric prices~~ ✅ MRP = selling price
3. ~~Hybrid Geyser wattage~~ ✅ 3rd configurator attribute
4. ~~Hybrid 35G/55G prices~~ → Seeded at Rs. 0, admin fills via dashboard
5. ~~Instant Gas actual prices~~ ✅ 17,000 / 22,500 / 26,000
6. ~~FE Series Heavy Duty~~ ✅ Exists (prices to be filled by admin)

### Admin-First Design Principle
> **Everything is manageable from the admin dashboard.**
> - Create / edit / delete attributes (e.g., add a "Color" attribute later)
> - Add / remove values per attribute (e.g., add a new capacity size)
> - Variant matrix auto-generates from attribute combinations
> - Prices, stock, SKUs all editable per variant from product edit page
> - No code changes needed to add new products, variants, or attribute types

---

Create:
- `backend/database/seeders/AttributeSeeder.php` — seeds global attributes (Type, Capacity, Gas Type)
- `backend/database/seeders/ProductPortfolioSeeder.php` — seeds all 6 products with variants and prices above

Run via:
```bash
php artisan db:seed --class=AttributeSeeder
php artisan db:seed --class=ProductPortfolioSeeder
```

---

## Files to Create / Modify

### New Files:
| File | Purpose |
|------|---------|
| `scripts/convert-images.js` | JPG → WebP conversion + migration |
| `frontend/src/pages/admin/attributes/index.tsx` | Attributes management page |
| `frontend/src/pages/product-detail/ProductConfigurator.tsx` | Apple-style configurator component |
| `backend/database/seeders/AttributeSeeder.php` | Seeds global attributes |
| `backend/database/seeders/ProductPortfolioSeeder.php` | Seeds real products |

### Modified Files:
| File | Change |
|------|--------|
| `backend/app/Http/Controllers/Api/Admin/ProductVariantController.php` | Add `attribute_value_ids`, `batchStore()` |
| `backend/app/Http/Controllers/Api/ProductController.php` | Add `configurator` block to `show()` |
| `backend/routes/api/admin.php` | Add batch variants + attributes sync routes |
| `frontend/src/pages/admin/product-edit/VariantsTab.tsx` | Full rebuild — 3-step configurator builder |
| `frontend/src/pages/product-detail/ProductInfo.tsx` | Replace flat buttons with ProductConfigurator |
| `frontend/src/types/product.ts` | Add Configurator types |
| Admin sidebar nav file | Add "Attributes" link |

---

## Existing Infrastructure to Reuse (No Changes Needed)

- `backend/app/Models/ProductVariant.php` — `attributeValues()` relationship, `getEffectivePrice()` already exists
- `backend/app/Models/Product.php` — `variants()`, `attributes()`, `getEffectivePrice($variantId)` all exist
- `backend/app/Http/Controllers/Api/Admin/AttributeController.php` — full CRUD already done
- `backend/app/Http/Controllers/Api/Admin/AttributeValueController.php` — full CRUD already done
- `backend/routes/api/admin.php` — attribute routes already registered
- DB tables: `attributes`, `attribute_values`, `product_variants`, `product_variant_attribute_values`, `product_attributes` — all exist
- Cart system — already passes `variant_id` to `addItem()` — no changes needed for checkout flow

---

## Verification Checklist

- [ ] Run `node scripts/convert-images.js` → WebP files appear in `products/` subdirs
- [ ] `/admin/attributes` page loads → create attribute "Capacity" (type: button) with values "15L", "25L", "35L"
- [ ] Product edit → Variants tab → assign "Capacity" → Generate → set prices → save
- [ ] Product detail page → capacity pills appear → click "25L" → price updates with animation
- [ ] "Add to Cart" sends correct `variant_id` → cart shows correct variant name + price
- [ ] Out-of-stock variants correctly greyed out / disabled in configurator
- [ ] Admin can update stock per variant → frontend reflects change immediately
