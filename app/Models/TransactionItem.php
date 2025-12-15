<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionItem extends Model
{
    protected $guarded = [];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    protected static function booted()
    {
        static::created(function ($item) {
            $item->deductStock();
        });

        static::updated(function ($item) {
            // Handle Product Change
            if ($item->isDirty('product_id')) {
                $oldProductId = $item->getOriginal('product_id');
                $oldQuantity = $item->getOriginal('quantity');
                static::restoreStockForProduct($oldProductId, $oldQuantity);
                $item->deductStock();
            } 
            // Handle Quantity Change only
            elseif ($item->isDirty('quantity')) {
                $oldQuantity = $item->getOriginal('quantity');
                $newQuantity = $item->quantity;
                $diff = $newQuantity - $oldQuantity;
                $item->adjustStockDifference($diff);
            }
        });

        static::deleted(function ($item) {
            $item->restoreStock();
        });
    }

    public function deductStock()
    {
        $product = $this->product;
        if (!$product) return;

        if ($product->type === 'resale') {
            $product->decrement('stock', $this->quantity);
        } else {
            foreach ($product->productMaterials as $pm) {
                if ($pm->material) {
                    $amount = $pm->quantity * $this->quantity;
                    $pm->material->decrement('stock', $amount);
                }
            }
        }
    }

    public function restoreStock()
    {
        $product = $this->product;
        if (!$product) return;

        if ($product->type === 'resale') {
            $product->increment('stock', $this->quantity);
        } else {
            foreach ($product->productMaterials as $pm) {
                if ($pm->material) {
                    $amount = $pm->quantity * $this->quantity;
                    $pm->material->increment('stock', $amount);
                }
            }
        }
    }

    public function adjustStockDifference($diff)
    {
        $product = $this->product;
        if (!$product) return;

        if ($product->type === 'resale') {
            if ($diff > 0) {
                $product->decrement('stock', $diff);
            } else {
                $product->increment('stock', abs($diff));
            }
        } else {
            foreach ($product->productMaterials as $pm) {
                if ($pm->material) {
                    $amount = $pm->quantity * abs($diff);
                    if ($diff > 0) {
                        $pm->material->decrement('stock', $amount);
                    } else {
                        $pm->material->increment('stock', $amount);
                    }
                }
            }
        }
    }

    public static function restoreStockForProduct($productId, $quantity)
    {
        $product = Product::find($productId);
        if (!$product) return;

        if ($product->type === 'resale') {
            $product->increment('stock', $quantity);
        } else {
            foreach ($product->productMaterials as $pm) {
                if ($pm->material) {
                    $amount = $pm->quantity * $quantity;
                    $pm->material->increment('stock', $amount);
                }
            }
        }
    }
}
