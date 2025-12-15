<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\AppSetting;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display printable receipt
     */
    public function receipt(Transaction $transaction)
    {
        $settings = AppSetting::first();
        
        return view('pdf.receipt', [
            'transaction' => $transaction->load(['items.product', 'user', 'customer']),
            'settings' => $settings,
        ]);
    }

    /**
     * Download receipt as PDF
     */
    public function pdf(Transaction $transaction)
    {
        $settings = AppSetting::first();
        
        $pdf = Pdf::loadView('pdf.receipt', [
            'transaction' => $transaction->load(['items.product', 'user', 'customer']),
            'settings' => $settings,
        ]);
        
        $pdf->setPaper([0, 0, 226.77, 566.93], 'portrait'); // 80mm x 200mm thermal paper
        
        return $pdf->download('struk-' . $transaction->id . '.pdf');
    }
}
