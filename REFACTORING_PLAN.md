# Fischer E-commerce Full App Refactoring Plan

> Created: 2026-02-22
> Status: **COMPLETE** (2026-02-22) — all 5 phases executed, build passes (zero TS errors), 280 routes verified

## Context

The codebase has grown organically and many files exceed 1000+ lines. Business logic lives in fat controllers instead of services. Types are duplicated across 14+ files. Shared data (city lists, payment methods) is copy-pasted. The goal is a clean, maintainable codebase where no file exceeds ~1000 lines, the backend follows proper MVC+Service pattern, and all dead code is removed.

---

## Phase 1: Foundation — Shared Types, Utilities & Dead Code Removal

### 1A. Create shared frontend types (`frontend/src/types/`)

- `types/product.ts` — unified `Product`, `ProductImage`, `Review` interfaces
  - Currently duplicated in 14 files: `Home.tsx`, `Shop.tsx`, `Category.tsx`, `ProductDetail.tsx`, `KitchenExperience.tsx`, `ProductCard.tsx`, `QuickViewModal.tsx`, `ProductsMegaMenu.tsx`, `KitchenLineArt/index.tsx`, `KitchenLineArt/ProductPopup.tsx`, `admin/BundleForm.tsx`, `admin/ProductEdit.tsx`, `admin/Products.tsx`, `Sale.tsx`
- `types/order.ts` — `Order`, `OrderItem`, `ShippingMethod`, `Address` interfaces
- `types/index.ts` — barrel export

Then update all 14+ files to `import { Product } from '@/types'` and delete inline interface blocks.

### 1B. Create shared data constants (`frontend/src/data/`)

- `data/pakistanCities.ts` — extract from `Checkout.tsx` (53 cities, most complete list)
  - Remove duplicates from: `Checkout.tsx`, `DealerRegister.tsx` (only 12 cities), `ServiceRequest.tsx`, `account/Addresses.tsx`
- `data/paymentMethods.ts` — extract from `Checkout.tsx`

### 1C. Remove dead code

- Remove `updateItemQuantity` wrapper from `stores/cartStore.ts` (lines 153-155) — it just calls `updateQuantity`
- Move `rollup` from `dependencies` to `devDependencies` in `package.json`
- Run TypeScript strict check to find unused imports across all files
- Verify `react-hook-form` is actually used — if not, remove it

### 1D. Backend: Create Form Request classes

Extract inline validation into dedicated request classes:

| Request Class | Extract From |
|---|---|
| `PlaceOrderRequest` | `CheckoutController::placeOrder()` |
| `AddToCartRequest` | `CartController::add()` |
| `StoreBundleRequest` | `Admin\BundleController::store()` |
| `UpdateBundleRequest` | `Admin\BundleController::update()` |
| `StoreServiceRequestRequest` | `ServiceRequestController::store()` |
| `DealerRegisterRequest` | `DealerController::register()` |

---

## Phase 2: Backend Service Layer (MVC Refactoring)

Extract business logic from fat controllers into services. Controllers become thin HTTP orchestrators.

### 2A. `CartService` (`app/Services/CartService.php`, ~80 lines)

Extract from `CartController` (lines 194-272):
- `getCart(Request)` — currently duplicated in `CartController`, `CheckoutController`, `BundleController`
- `getOrCreateCart(Request)` — duplicated in `CartController`, `BundleController`
- `formatCart(Cart)` — cart response formatting

Inject into: `CartController`, `CheckoutController`, `BundleController`

### 2B. `OrderCreationService` (`app/Services/OrderCreationService.php`, ~200 lines)

Extract from `CheckoutController::placeOrder()` (lines 102-351, ~190 lines of logic):
- `validateStock(Cart)`
- `calculateTotals(Cart, array)`
- `createOrder(User, Cart, totals, data)`
- `createOrderItems(Order, Cart)`
- `handleCouponUsage(Cart, Order, User, discount)`
- `handleLoyaltyPoints(Order, User, pointsUsed, total)`
- `sendOrderNotifications(Order, User)`
- `handlePayment(Order, method, Request)`

`CheckoutController::placeOrder()` shrinks to ~30 lines.

### 2C. `HomepageDataService` (`app/Services/HomepageDataService.php`, ~150 lines)

Extract from `HomeController` (477 lines):
- `getHomePageData()` — aggregates 10+ data sources
- `getDynamicData()` / `getLegacyData()`
- Individual section fetchers (categories, products, banners, testimonials, etc.)

`HomeController` shrinks to ~30 lines.

### 2D. `BundleManagementService` (`app/Services/BundleManagementService.php`, ~200 lines)

Extract from `Admin\BundleController` (689 lines, 19 methods):
- Slot CRUD: `addSlot`, `updateSlot`, `removeSlot`, `reorderSlots`
- Item CRUD: `addItem`, `removeItem`, `updateItem`
- Image management: `uploadImages`, `deleteImage`, `reorderImages`

Controller keeps only HTTP methods: `index`, `show`, `store`, `update`, `destroy`.

### 2E. `HomepageContentService` (`app/Services/HomepageContentService.php`, ~180 lines)

Extract from `Admin\HomepageController` (620 lines, 20 methods):
- Section management: `updateSection`, `reorderSections`, `toggleSection`
- Content CRUD: `updateStats`, `updateFeatures`, `updateTestimonials`
- Banner management: `storeBanner`, `updateBanner`, `deleteBanner`
- Client/media management

---

## Phase 3: Frontend Large File Splits

Every file over ~500 lines gets split. No file should exceed ~1000 lines.

### 3A. Split `index.css` (1,340 lines)

```
frontend/src/styles/
  base.css            (~95 lines)   — @tailwind directives, CSS variables
  components.css      (~180 lines)  — buttons, inputs, cards, badges
  product-card.css    (~190 lines)  — product card styles
  layout.css          (~80 lines)   — skeleton, glass, gradients
  utilities.css       (~100 lines)  — line-clamp, text-gradient, glows
  responsive.css      (~85 lines)   — mobile/tablet fixes, safe area
  effects.css         (~150 lines)  — scrollbar, shadows, animations
  animations.css      (~200 lines)  — advanced animations, 3D, mobile typography
  index.css           (~20 lines)   — barrel @import file
```

### 3B. Split `admin/Settings.tsx` (1,450 lines → 9 tab components)

```
frontend/src/pages/admin/settings/
  index.tsx                    (~100 lines)  — tab navigation, data fetching
  GeneralSettingsTab.tsx       (~120 lines)
  AppearanceSettingsTab.tsx    (~120 lines)
  PaymentSettingsTab.tsx       (~180 lines)
  ShippingSettingsTab.tsx      (~80 lines)
  EmailSettingsTab.tsx         (~100 lines)
  SeoSettingsTab.tsx           (~100 lines)
  NotificationSettingsTab.tsx  (~60 lines)
  LoyaltySettingsTab.tsx       (~80 lines)
  SocialSettingsTab.tsx        (~80 lines)
  useSettingsData.ts           (~40 lines)
```

### 3C. Split `Home.tsx` (1,188 lines)

Extract into `frontend/src/pages/Home/`:
- `AnimatedCounter.tsx` (~50 lines) — lines 45-121
- `types.ts` (~80 lines) — all homepage interfaces
- `defaults.ts` (~70 lines) — `defaultStats`, `defaultFeatures`, `iconMap`
- `CategoriesSection.tsx` (~120 lines)
- `TestimonialsSection.tsx` (~100 lines)
- `BundlesSection.tsx` (~80 lines)

`Home.tsx` becomes orchestrator (~300 lines).

### 3D. Split `admin/BundleForm.tsx` (1,158 lines → 6 tab components)

```
frontend/src/pages/admin/bundle-form/
  index.tsx               (~150 lines) — form wrapper, tab nav, submit
  BasicInfoTab.tsx         (~150 lines)
  ProductsTab.tsx          (~200 lines)
  PricingTab.tsx           (~100 lines)
  DisplayTab.tsx           (~100 lines)
  MediaTab.tsx             (~150 lines)
  SeoTab.tsx               (~80 lines)
  ProductSearchModal.tsx   (~120 lines)
  useBundleForm.ts         (~80 lines)
```

### 3E. Split `ProductDetail.tsx` (1,088 lines)

```
frontend/src/pages/product-detail/
  index.tsx             (~200 lines) — page, data fetching, SEO
  ImageGallery.tsx      (~200 lines) — image carousel, zoom, thumbnails
  ProductInfo.tsx       (~200 lines) — title, price, variants, add to cart
  ProductTabs.tsx       (~100 lines) — description, specs, warranty tabs
  ReviewsSection.tsx    (~200 lines) — reviews list, rating summary
  RelatedProducts.tsx   (~80 lines)
```

### 3F. Split `KitchenSVG.tsx` (1,643 lines)

- `svg/kitchen-paths.ts` (~1,200 lines) — raw SVG path data as exported constants (data file, acceptable size)
- `KitchenSVG.tsx` (~400 lines) — component logic, hotspots, interactions

### 3G. Split remaining 500-900 line files

| File | Lines | Target Structure |
|---|---|---|
| `Checkout.tsx` | 918 | `pages/checkout/` → `index`, `ShippingForm`, `PaymentStep`, `OrderSummary`, `useCheckout` |
| `Cart.tsx` | 738 | `pages/cart/` → `index`, `CartItemRow`, `CartSummary`, `EmptyCart` |
| `Shop.tsx` | 721 | `pages/shop/` → `index`, `FilterSidebar`, `ProductGrid`, `SortDropdown` |
| `admin/OrderDetail.tsx` | 791 | `pages/admin/order-detail/` → `index`, `OrderHeader`, `OrderItems`, `CustomerInfo`, `StatusTimeline` |
| `ServiceRequest.tsx` | 779 | `pages/service-request/` → `index`, `ServiceForm`, `ProductLookup` |
| `BundleDetail.tsx` | 708 | `pages/bundle-detail/` → `index`, `BundleConfig`, `BundlePricing`, `BundleGallery` |
| `KitchenExperience.tsx` | 687 | `pages/kitchen-experience/` → `index`, `ExperienceViewer`, `ProductOverlay` |
| `ScrollReveal.tsx` | 624 | `components/effects/` → `ScrollReveal`, `StaggerAnimation`, `HoverEffects`, `ParallaxSection`, `CounterAnimation`, index barrel |
| `BundleQuickView.tsx` | 624 | Split into `BundleQuickView` (~250), `BundleSlotSelector` (~200), `BundlePriceSummary` (~100) |
| `ProductCard.tsx` | 557 | Extract `ProductCardImage` (~100), `ProductCardActions` (~80), keep `ProductCard` (~350) |
| `admin/ProductEdit.tsx` | 752 | `pages/admin/product-edit/` → `index`, `BasicInfoTab`, `MediaTab`, `VariantsTab`, `SeoTab` |
| `DealerRegister.tsx` | 530 | Extract `DealerForm` component (~350), keep page wrapper (~150) |
| `OrderSuccess.tsx` | 503 | Extract `ConfettiEffect` (~80), `OrderSummaryCard` (~200), keep page (~200) |

---

## Phase 4: Route Organization & API Layer

### 4A. Split `routes/api.php` (418 lines)

```
backend/routes/
  api.php          (~30 lines)  — includes sub-route files
  api/public.php   (~80 lines)  — public routes
  api/auth.php     (~30 lines)  — login, register, password reset
  api/customer.php (~50 lines)  — account, orders, wishlist, addresses
  api/admin.php    (~120 lines) — all admin routes
  api/cart.php     (~20 lines)  — cart and checkout
```

### 4B. Split `frontend/src/api/bundles.ts` (559 lines)

```
frontend/src/api/
  bundles.ts        (~300 lines) — public bundle hooks
  bundles.types.ts  (~100 lines) — bundle type definitions
  bundles.admin.ts  (~160 lines) — admin bundle hooks
```

---

## Phase 5: Final Polish

- Run `npx depcheck` to catch any remaining unused dependencies
- Run full TypeScript strict build to verify no broken imports
- Test all pages manually (customer flow, admin flow, checkout flow)
- Update `MEMORY.md` with new architecture conventions

---

## Verification Plan

After each phase:
1. `cd frontend && npm run build` — verify no TypeScript/build errors
2. `cd backend && php artisan route:list` — verify all routes still resolve
3. Manual smoke test: browse homepage, shop, product detail, add to cart, checkout
4. Admin smoke test: dashboard, products, orders, settings, bundles
5. Run any existing tests: `php artisan test`

---

## Execution Order

```
Phase 1 (Foundation) ──┬──> Phase 2 (Backend Services)
                       └──> Phase 3 (Frontend Splits) ──> Phase 4B (API split)

                                    ──> Phase 4A (Route split)

                               └──> Phase 5 (Polish)
```

Phases 2 and 3 can run in parallel. Each sub-step is independently committable and deployable.
