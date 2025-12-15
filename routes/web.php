<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransactionController;

Route::get('/', function () {
    return view('welcome');
});

// Transaction Receipt Routes
Route::middleware(['auth'])->group(function () {
    Route::get('/transactions/{transaction}/receipt', [TransactionController::class, 'receipt'])
        ->name('transactions.receipt');
    Route::get('/transactions/{transaction}/pdf', [TransactionController::class, 'pdf'])
        ->name('transactions.pdf');
});
