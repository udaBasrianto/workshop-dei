<?php

namespace App\Filament\Widgets;

use App\Models\Material;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;

class LowStockMaterials extends BaseWidget
{
    protected static ?int $sort = 2;
    protected int | string | array $columnSpan = 'full';
    protected static ?string $heading = 'Stok Bahan Menipis';

    public function table(Table $table): Table
    {
        return $table
            ->query(
                Material::query()
                    ->orderBy('stock', 'asc')
                    ->limit(10)
            )
            ->columns([
                Tables\Columns\TextColumn::make('item')
                    ->label('Nama Bahan')
                    ->searchable(),
                Tables\Columns\TextColumn::make('stock')
                    ->label('Stok Saat Ini')
                    ->badge()
                    ->color(fn (string $state): string => match (true) {
                        (float)$state <= 0 => 'danger',
                        (float)$state < 20 => 'warning',
                        default => 'success',
                    }),
                Tables\Columns\TextColumn::make('unit')
                    ->label('Satuan'),
                Tables\Columns\TextColumn::make('price')
                    ->label('Harga/Unit')
                    ->money('IDR'),
            ])
            ->paginated(false);
    }
}
