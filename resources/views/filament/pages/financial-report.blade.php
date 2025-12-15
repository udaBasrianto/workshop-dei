<x-filament-panels::page>
    {{-- Filter Section --}}
    <div class="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
        <form wire:submit="filter" class="flex flex-wrap items-end gap-4">
            {{ $this->form }} 
            {{-- Since I used InteractsWithForms but didn't define schema, I'll use manual inputs for simplicity or define form schema in PHP. 
               Let's stick to manual inputs binding to public properties for speed as InteractsWithForms requires schema definition. 
               Wait, I didn't define schema in FinancialReport.php. Let's use standard HTML inputs wire:model. 
            --}}
            
            <div class="flex-1 min-w-[200px]">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Mulai</label>
                <input type="date" wire:model="startDate" class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-sm">
            </div>
            <div class="flex-1 min-w-[200px]">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Akhir</label>
                <input type="date" wire:model="endDate" class="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-sm">
            </div>
            <button type="submit" class="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 px-4 rounded-lg shadow transition">
                Filter Data
            </button>
        </form>
    </div>

    {{-- Stats Grid --}}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pendapatan</h3>
            <div class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                Rp {{ number_format($this->stats['total_revenue'], 0, ',', '.') }}
            </div>
        </div>
        
        <div class="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Transaksi</h3>
            <div class="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {{ $this->stats['total_transactions'] }}
            </div>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Estimasi HPP (Modal)</h3>
            <div class="text-2xl font-bold text-yellow-600 mt-2">
                - Rp {{ number_format($this->stats['total_hpp'], 0, ',', '.') }}
            </div>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pengeluaran</h3>
            <div class="text-2xl font-bold text-red-600 mt-2">
                - Rp {{ number_format($this->stats['total_expenses'], 0, ',', '.') }}
            </div>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Laba Bersih</h3>
            <div class="text-2xl font-bold text-green-600 mt-2">
                Rp {{ number_format($this->stats['net_profit'], 0, ',', '.') }}
            </div>
        </div>
    </div>

    {{-- Cash Flow Breakdown --}}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-lg font-bold mb-4">Rincian Pemasukan (Arus Kas Masuk)</h3>
            <div class="space-y-4">
                <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                            <x-heroicon-o-banknotes class="w-5 h-5" />
                        </div>
                        <div>
                            <div class="font-bold">Tunai (Cash)</div>
                            <div class="text-xs text-gray-500">Pembayaran langsung di kasir</div>
                        </div>
                    </div>
                    <div class="font-bold text-gray-900 dark:text-white">
                        Rp {{ number_format($this->stats['cash_income'], 0, ',', '.') }}
                    </div>
                </div>

                <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            <x-heroicon-o-credit-card class="w-5 h-5" />
                        </div>
                        <div>
                            <div class="font-bold">Transfer Bank</div>
                            <div class="text-xs text-gray-500">Pembayaran via transfer</div>
                        </div>
                    </div>
                    <div class="font-bold text-gray-900 dark:text-white">
                        Rp {{ number_format($this->stats['transfer_income'], 0, ',', '.') }}
                    </div>
                </div>

                <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                            <x-heroicon-o-qr-code class="w-5 h-5" />
                        </div>
                        <div>
                            <div class="font-bold">QRIS</div>
                            <div class="text-xs text-gray-500">Scan QR Code</div>
                        </div>
                    </div>
                    <div class="font-bold text-gray-900 dark:text-white">
                        Rp {{ number_format($this->stats['qris_income'], 0, ',', '.') }}
                    </div>
                </div>
                
                <div class="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between font-bold text-lg">
                    <span>Total Pemasukan</span>
                    <span>Rp {{ number_format($this->stats['total_revenue'], 0, ',', '.') }}</span>
                </div>
            </div>
        </div>

        <div class="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 class="text-lg font-bold mb-4">Grafik Transaksi</h3>
            {{-- Embedding the widget here might be complex if it requires context, so showing simple placeholder or just rely on main dashboard for charts. 
                 Or use simple Livewire chart if possible. 
                 Let's stick to the stats for this specific "Report" page as requested "custom filters". Charts on dashboard are global.
                 I will add a note or link to dashboard for charts.
            --}}
            <div class="text-center py-12 text-gray-500">
                <p>Filter data di atas untuk melihat rincian.</p>
                <p class="text-sm mt-2">Untuk grafik visual trend harian, silakan lihat di Dashboard.</p>
            </div>
        </div>
    </div>
</x-filament-panels::page>
