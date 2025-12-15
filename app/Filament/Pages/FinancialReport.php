<?php

namespace App\Filament\Pages;

use Filament\Pages\Page;

class FinancialReport extends Page
{
    // Traits removed as we are using manual Blade/Livewire implementation
    
    protected static ?string $title = 'Laporan Arus Kas';
    protected static ?string $navigationLabel = 'Laporan Transaksi';
    
    protected static ?string $navigationIcon = 'heroicon-o-presentation-chart-line';

    public ?string $startDate = null;
    public ?string $endDate = null;
    
    public function mount()
    {
        $this->startDate = now()->startOfMonth()->format('Y-m-d');
        $this->endDate = now()->endOfMonth()->format('Y-m-d');
    }
    
    public function getStatsProperty()
    {
        $query = \App\Models\Transaction::query()
            ->whereDate('created_at', '>=', $this->startDate)
            ->whereDate('created_at', '<=', $this->endDate);

        $totalRevenue = $query->sum('total_amount');
        $totalTransactions = $query->count();
        $cashIncome = (clone $query)->where('payment_method', 'cash')->sum('total_amount');
        $transferIncome = (clone $query)->where('payment_method', 'transfer')->sum('total_amount');
        $qrisIncome = (clone $query)->where('payment_method', 'qris')->sum('total_amount');
        
        // Expense Calculation (Mockup using Product HPP if available or simplified)
        // For real Cash Flow, we should subtract costs. 
        // We can sum item quantity * item HPP (need to store HPP in transaction_items or calculate from products)
        // Since we don't have historical HPP stored, we estimate current HPP.
        
        $items = \App\Models\TransactionItem::whereHas('transaction', function($q) {
             $q->whereDate('created_at', '>=', $this->startDate)
               ->whereDate('created_at', '<=', $this->endDate);
        })->with('product')->get();
        
        $totalHpp = $items->sum(function($item) {
             return $item->quantity * ($item->product->calculateHpp() ?? 0);
        });
        
        $expenses = \App\Models\Expense::query()
            ->whereDate('transaction_date', '>=', $this->startDate)
            ->whereDate('transaction_date', '<=', $this->endDate)
            ->sum('amount');
        
        $netProfit = $totalRevenue - $totalHpp - $expenses;

        return [
            'total_revenue' => $totalRevenue,
            'total_transactions' => $totalTransactions,
            'cash_income' => $cashIncome,
            'transfer_income' => $transferIncome,
            'qris_income' => $qrisIncome,
            'total_hpp' => $totalHpp,
            'total_expenses' => $expenses,
            'net_profit' => $netProfit
        ];
    }

    public function filter()
    {
        // Explicitly refresh the component (Livewire does this automatically on property change, but this method handles the form submit)
    }
    
    protected static string $view = 'filament.pages.financial-report';
}
