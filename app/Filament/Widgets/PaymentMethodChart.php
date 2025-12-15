<?php

namespace App\Filament\Widgets;

use Filament\Widgets\ChartWidget;
use App\Models\Transaction;

class PaymentMethodChart extends ChartWidget
{
    protected static ?string $heading = 'Payment Methods';
    
    protected static ?int $sort = 3;

    protected function getData(): array
    {
        $data = Transaction::query()
            ->selectRaw('payment_method, count(*) as count')
            ->groupBy('payment_method')
            ->pluck('count', 'payment_method');

        return [
            'datasets' => [
                [
                    'label' => 'Transactions',
                    'data' => $data->values(),
                    'backgroundColor' => [
                        '#4ade80', // green
                        '#60a5fa', // blue
                        '#facc15', // yellow
                    ], 
                ],
            ],
            'labels' => $data->keys()->map(fn($key) => ucfirst($key)),
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
