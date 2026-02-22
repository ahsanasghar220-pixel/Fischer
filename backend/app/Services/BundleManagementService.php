<?php

namespace App\Services;

use App\Models\Bundle;
use App\Models\BundleSlot;
use App\Models\BundleItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BundleManagementService
{
    // -------------------------------------------------------------------------
    // Slot Management
    // -------------------------------------------------------------------------

    /**
     * Add a new slot to a configurable bundle.
     *
     * @param  Bundle  $bundle
     * @param  array   $data  Keys: name, description?, is_required?, min_selections?, max_selections?, products?
     * @return BundleSlot
     */
    public function addSlot(Bundle $bundle, array $data): BundleSlot
    {
        return DB::transaction(function () use ($bundle, $data) {
            $slot = $bundle->slots()->create([
                'name'           => $data['name'],
                'description'    => $data['description'] ?? null,
                'slot_order'     => $bundle->slots()->max('slot_order') + 1,
                'is_required'    => $data['is_required'] ?? true,
                'min_selections' => $data['min_selections'] ?? 1,
                'max_selections' => $data['max_selections'] ?? 1,
            ]);

            if (!empty($data['products'])) {
                foreach ($data['products'] as $productData) {
                    $slot->products()->create([
                        'product_id'     => $productData['product_id'],
                        'price_override' => $productData['price_override'] ?? null,
                    ]);
                }
            }

            return $slot;
        });
    }

    /**
     * Update an existing slot, optionally replacing its products.
     *
     * @param  BundleSlot  $slot
     * @param  array       $data  May include: name, description, slot_order, is_required,
     *                            min_selections, max_selections, products (null = no change)
     * @return BundleSlot
     */
    public function updateSlot(BundleSlot $slot, array $data): BundleSlot
    {
        return DB::transaction(function () use ($slot, $data) {
            $products = $data['products'] ?? null;
            unset($data['products']);

            $slot->update($data);

            // Replace products only when an explicit list is provided
            if ($products !== null) {
                $slot->products()->delete();
                foreach ($products as $productData) {
                    $slot->products()->create([
                        'product_id'     => $productData['product_id'],
                        'price_override' => $productData['price_override'] ?? null,
                    ]);
                }
            }

            return $slot->fresh()->load('products.product');
        });
    }

    /**
     * Delete a slot from a bundle.
     */
    public function removeSlot(BundleSlot $slot): void
    {
        $slot->delete();
    }

    // -------------------------------------------------------------------------
    // Item Management
    // -------------------------------------------------------------------------

    /**
     * Add a product as a fixed-bundle item.
     *
     * @param  Bundle  $bundle
     * @param  array   $data  Keys: product_id, quantity?, price_override?
     * @return BundleItem
     */
    public function addItem(Bundle $bundle, array $data): BundleItem
    {
        return $bundle->items()->create([
            'product_id'     => $data['product_id'],
            'quantity'       => $data['quantity'] ?? 1,
            'price_override' => $data['price_override'] ?? null,
            'sort_order'     => $bundle->items()->max('sort_order') + 1,
        ]);
    }

    /**
     * Update a bundle item's quantity, price override, or sort order.
     *
     * @param  BundleItem  $item
     * @param  array       $data  Keys: quantity?, price_override?, sort_order?
     * @return BundleItem
     */
    public function updateItem(BundleItem $item, array $data): BundleItem
    {
        $item->update($data);

        return $item->fresh()->load('product');
    }

    /**
     * Remove an item from a bundle.
     */
    public function removeItem(BundleItem $item): void
    {
        $item->delete();
    }

    // -------------------------------------------------------------------------
    // Image Management
    // -------------------------------------------------------------------------

    /**
     * Store uploaded image files and attach them to the bundle.
     *
     * @param  Bundle  $bundle
     * @param  \Illuminate\Http\UploadedFile[]  $files
     * @return \App\Models\BundleImage[]
     */
    public function uploadImages(Bundle $bundle, array $files): array
    {
        $uploaded = [];

        foreach ($files as $file) {
            $path        = $file->store('bundles', 'public');
            $bundleImage = $bundle->images()->create([
                'image'      => '/storage/' . $path,
                'is_primary' => $bundle->images()->count() === 0,
            ]);
            $uploaded[] = $bundleImage;
        }

        return $uploaded;
    }

    /**
     * Delete a bundle image from storage and from the database.
     *
     * @param  \App\Models\BundleImage  $image
     */
    public function deleteImage($image): void
    {
        $path = str_replace('/storage/', '', $image->image ?? '');
        if ($path) {
            Storage::disk('public')->delete($path);
        }

        $image->delete();
    }
}
