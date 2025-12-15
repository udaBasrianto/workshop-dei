<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk Transaksi #{{ $transaction->id }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            padding: 20px;
            max-width: 300px;
            margin: 0 auto;
        }
        .receipt {
            border: 1px dashed #000;
            padding: 15px;
        }
        .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
        }
        .brand-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .transaction-info {
            margin-bottom: 15px;
            font-size: 10px;
        }
        .transaction-info div {
            margin-bottom: 3px;
        }
        .items {
            margin-bottom: 15px;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
        }
        .item {
            margin-bottom: 8px;
        }
        .item-name {
            font-weight: bold;
        }
        .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
        }
        .totals {
            margin-bottom: 15px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        .total-row.grand {
            font-weight: bold;
            font-size: 14px;
            border-top: 1px dashed #000;
            padding-top: 5px;
            margin-top: 5px;
        }
        .footer {
            text-align: center;
            font-size: 10px;
            border-top: 1px dashed #000;
            padding-top: 10px;
        }
        @media print {
            body {
                padding: 0;
            }
            .receipt {
                border: none;
            }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <div class="brand-name">{{ $settings?->brand_name ?? 'DeiStok' }}</div>
            <div style="font-size: 10px;">Terima kasih atas kunjungan Anda</div>
        </div>

        <div class="transaction-info">
            <div><strong>No. Transaksi:</strong> #{{ $transaction->id }}</div>
            <div><strong>Tanggal:</strong> {{ $transaction->created_at->format('d/m/Y H:i') }}</div>
            <div><strong>Kasir:</strong> {{ $transaction->user->name }}</div>
            @if($transaction->customer)
            <div><strong>Pelanggan:</strong> {{ $transaction->customer->name }}</div>
            @endif
        </div>

        <div class="items">
            @foreach($transaction->items as $item)
            <div class="item">
                <div class="item-name">{{ $item->product->name }}</div>
                <div class="item-details">
                    <span>{{ $item->quantity }} x Rp {{ number_format($item->unit_price, 0, ',', '.') }}</span>
                    <span>Rp {{ number_format($item->subtotal, 0, ',', '.') }}</span>
                </div>
            </div>
            @endforeach
        </div>

        <div class="totals">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>Rp {{ number_format($transaction->total_amount, 0, ',', '.') }}</span>
            </div>
            <div class="total-row grand">
                <span>TOTAL:</span>
                <span>Rp {{ number_format($transaction->total_amount, 0, ',', '.') }}</span>
            </div>
            <div class="total-row" style="margin-top: 10px; font-size: 10px;">
                <span>Metode Bayar:</span>
                <span>{{ match($transaction->payment_method) {
                    'cash' => 'Tunai',
                    'transfer' => 'Transfer',
                    'qris' => 'QRIS',
                    default => $transaction->payment_method
                } }}</span>
            </div>
        </div>

        <div class="footer">
            <div style="margin-bottom: 5px;">Barang yang sudah dibeli tidak dapat dikembalikan</div>
            <div>{{ now()->format('d/m/Y H:i:s') }}</div>
        </div>
    </div>

    <script>
        // Auto print when opened
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>
