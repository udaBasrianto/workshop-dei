<?php

namespace App\Observers;

use App\Models\TransactionItem;

class TransactionItemObserver
{
    /**
     * Handle the TransactionItem "created" event.
     */
    /**
     * Handle the TransactionItem "created" event.
     */
    public function created(TransactionItem $item): void
    {
        $product = $item->product;
        if ($product) {
            $product->decrement('production_capacity', $item->quantity);
        }
    }

    /**
     * Handle the TransactionItem "updated" event.
     */
    public function updated(TransactionItem $item): void
    {
        if ($item->isDirty('quantity')) {
            $diff = $item->quantity - $item->getOriginal('quantity');
            $product = $item->product;
            if ($product) {
                // If quantity increased (positive diff), decrement stock.
                // If quantity decreased (negative diff), increment stock.
                $product->decrement('production_capacity', $diff);
            }
        }
    }

    /**
     * Handle the TransactionItem "deleted" event.
     */
    public function deleted(TransactionItem $item): void
    {
        $product = $item->product;
        if ($product) {
            $product->increment('production_capacity', $item->quantity);
        }
    }

    /**
     * Handle the TransactionItem "restored" event.
     */
    public function restored(TransactionItem $transactionItem): void
    {
        //
    }

    /**
     * Handle the TransactionItem "force deleted" event.
     */
    public function forceDeleted(TransactionItem $transactionItem): void
    {
        //
    }
}
