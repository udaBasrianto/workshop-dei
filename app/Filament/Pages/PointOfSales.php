<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

class PointOfSales extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-shopping-cart';

    protected static string $view = 'filament.pages.point-of-sales';
    
    protected static ?string $navigationLabel = 'POS (Kasir)';
    
    protected static ?string $title = 'Point of Sales';

    public $search = '';
    public $cart = [];
    public $total = 0;
    
    // Payment form
    public $paymentMethod = 'cash';
    public $notes = '';
    public $customerId = null;

    public function mount()
    {
        $this->cart = [];
    }

    public function getProductsProperty()
    {
        return \App\Models\Product::query()
            ->where('name', 'like', '%' . $this->search . '%')
            ->latest()
            ->get();
    }

    public function addToCart($productId)
    {
        $product = \App\Models\Product::find($productId);
        if (!$product) return;

        $currentQty = $this->cart[$productId]['quantity'] ?? 0;
        $stock = $product->production_capacity;

        if ($currentQty + 1 > $stock) {
            \Filament\Notifications\Notification::make()
                ->title('Stok tidak mencukupi')
                ->body("Stok hanya tersedia: $stock")
                ->warning()
                ->send();
            return;
        }

        if (isset($this->cart[$productId])) {
            $this->cart[$productId]['quantity']++;
        } else {
            // Calculate selling price dynamically
            $price = $product->calculateSellingPrice();

            $this->cart[$productId] = [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $price, 
                'quantity' => 1,
                'image' => $product->image,
                'max_stock' => $stock, // Store max stock for UI constraints
            ];
        }
        $this->calculateTotal();
    }
    
    public function updateQuantity($productId, $qty)
    {
        if (isset($this->cart[$productId])) {
            $qty = max(1, (int) $qty);
            $product = \App\Models\Product::find($productId);
            $stock = $product ? $product->production_capacity : $this->cart[$productId]['max_stock'];

            if ($qty > $stock) {
                $qty = $stock;
                 \Filament\Notifications\Notification::make()
                    ->title('Stok Maksimal Tercapai')
                    ->body("Maksimal stok tersedia: $stock")
                    ->warning()
                    ->send();
            }

            $this->cart[$productId]['quantity'] = $qty;
            $this->calculateTotal();
        }
    }
    
    public function updatePrice($productId, $price)
    {
        if (isset($this->cart[$productId])) {
            $this->cart[$productId]['price'] = (float) $price;
            $this->calculateTotal();
        }
    }

    public function removeFromCart($productId)
    {
        unset($this->cart[$productId]);
        $this->calculateTotal();
    }

    public function calculateTotal()
    {
        $this->total = collect($this->cart)->sum(function($item) {
            return $item['price'] * $item['quantity'];
        });
    }

    public function checkout()
    {
        if (empty($this->cart)) {
            \Filament\Notifications\Notification::make()
                ->title('Keranjang kosong')
                ->danger()
                ->send();
            return;
        }

        \Illuminate\Support\Facades\DB::transaction(function () {
            $transaction = \App\Models\Transaction::create([
                'user_id' => auth()->id(),
                'customer_id' => $this->customerId,
                'total_amount' => $this->total,
                'payment_method' => $this->paymentMethod,
                'payment_status' => 'paid',
                'notes' => $this->notes,
                'created_at' => now(),
            ]);

            foreach ($this->cart as $item) {
                \App\Models\TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'subtotal' => $item['price'] * $item['quantity'],
                ]);
            }

            // Award points if customer is selected
            if ($this->customerId && $this->total >= 100000) {
                $customer = \App\Models\Customer::find($this->customerId);
                if ($customer) {
                    $points = floor($this->total / 100000);
                    $customer->increment('points', $points);
                }
            }
        });

        $this->cart = [];
        $this->total = 0;
        $this->notes = '';
        $this->paymentMethod = 'cash';
        $this->customerId = null;

        \Filament\Notifications\Notification::make()
            ->title('Transaksi Berhasil')
            ->success()
            ->send();
    }
}
