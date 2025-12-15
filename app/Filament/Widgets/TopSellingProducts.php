<?php

namespace App\Filament\Widgets;

use App\Models\TransactionItem;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class TopSellingProducts extends ChartWidget
{
    protected static ?string $heading = 'Produk Terlaris Bulan Ini';
    protected static ?int $sort = 4;

    protected function getData(): array
    {
        // Get top 5 selling products this month
        $data = TransactionItem::select('product_id', DB::raw('sum(quantity) as total_qty'))
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->with('product')
            ->get();

        return [
            'datasets' => [
                [
                    'label' => 'Terjual (Unit)',
                    'data' => $data->map(fn ($item) => $item->total_qty),
                    'backgroundColor' => ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                ],
            ],
            'labels' => $data->map(fn ($item) => $item->product->name ?? 'Unknown'),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
