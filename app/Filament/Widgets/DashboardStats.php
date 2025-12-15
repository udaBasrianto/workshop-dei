<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use App\Models\Transaction;

class DashboardStats extends BaseWidget
{
    protected function getStats(): array
    {
        $startOfMonth = now()->startOfMonth();
        $endOfMonth = now()->endOfMonth();

        // 1. Total Revenue (Omset) This Month
        $revenue = Transaction::whereBetween('created_at', [$startOfMonth, $endOfMonth])
            ->sum('total_amount');

        // 2. Total HPP (Estimated from current product costs for sold items) This Month
        // Note: For perfect accuracy, HPP should be stored in transaction_items at time of sale.
        // Here we calculate based on sold items * current product HPP.
        $hpp = \App\Models\TransactionItem::whereHas('transaction', function ($query) use ($startOfMonth, $endOfMonth) {
                $query->whereBetween('created_at', [$startOfMonth, $endOfMonth]);
            })
            ->get()
            ->sum(function ($item) {
                 return ($item->product->calculateHpp() ?? 0) * $item->quantity;
            });

        // 3. Total Expenses (Pengeluaran Operasional) This Month
        $expenses = \App\Models\Expense::whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        // 4. Net Profit (Laba Bersih)
        $netProfit = $revenue - $hpp - $expenses;

        return [
            Stat::make('Omset Bulan Ini', 'Rp ' . number_format($revenue, 0, ',', '.'))
                ->description('Total penjualan kotor')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('primary'),

            Stat::make('Laba Bersih Bulan Ini', 'Rp ' . number_format($netProfit, 0, ',', '.'))
                ->description('Omset - HPP - Beban')
                ->descriptionIcon('heroicon-m-presentation-chart-line')
                ->color($netProfit >= 0 ? 'success' : 'danger'),

            Stat::make('Pengeluaran Bulan Ini', 'Rp ' . number_format($expenses, 0, ',', '.'))
                ->description('Biaya Operasional')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('danger'),
        ];
    }
}
