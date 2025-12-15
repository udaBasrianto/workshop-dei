<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use App\Models\Transaction;
use Flowframe\Trend\Trend;
use Flowframe\Trend\TrendValue;

class TransactionTrendChart extends ChartWidget
{
    protected static ?string $heading = 'Transaction Trend (30 Days)';
    
    protected static ?int $sort = 2;

    protected function getData(): array
    {
        $data = Trend::model(Transaction::class)
            ->between(
                start: now()->subDays(30),
                end: now(),
            )
            ->perDay()
            ->sum('total_amount'); // Showing revenue trend

        return [
            'datasets' => [
                [
                    'label' => 'Revenue (Rp)',
                    'data' => $data->map(fn (TrendValue $value) => $value->aggregate),
                    'fill' => true,
                    'borderColor' => '#4ade80',
                    'backgroundColor' => 'rgba(74, 222, 128, 0.1)',
                ],
            ],
            'labels' => $data->map(fn (TrendValue $value) => $value->date),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
