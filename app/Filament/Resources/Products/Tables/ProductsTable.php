<?php

namespace App\Filament\Resources\Products\Tables;

use Filament\Tables\Actions\BulkActionGroup;
use Filament\Tables\Actions\DeleteBulkAction;
use Filament\Tables\Actions\EditAction;
use Filament\Tables\Table;
use App\Models\Product;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                \Filament\Tables\Columns\ImageColumn::make('image')
                    ->disk('public')
                    ->circular(),
                \Filament\Tables\Columns\TextColumn::make('name')
                    ->searchable(),
                \Filament\Tables\Columns\TextColumn::make('category.name')
                    ->label('Kategori')
                    ->sortable()
                    ->searchable()
                    ->badge(),
                \Filament\Tables\Columns\TextColumn::make('stock')
                    ->label('Stok')
                    ->numeric()
                    ->sortable()
                    ->formatStateUsing(fn (string $state, Product $record): string => $state . ' ' . $record->unit)
                    ->color(fn (string $state): string => (int) $state <= 10 ? 'danger' : 'success'),
                \Filament\Tables\Columns\TextColumn::make('production_capacity')
                    ->label('Capacity/Month')
                    ->numeric()
                    ->sortable(),
                \Filament\Tables\Columns\TextColumn::make('profit_margin')
                    ->suffix('%')
                    ->numeric()
                    ->sortable(),
                \Filament\Tables\Columns\TextColumn::make('hpp')
                    ->label('HPP (Modal)')
                    ->prefix('Rp ')
                    ->state(function (Product $record): string {
                        return number_format($record->calculateHpp(), 0, ',', '.');
                    }),
                \Filament\Tables\Columns\TextColumn::make('selling_price')
                    ->label('Harga Jual')
                    ->prefix('Rp ')
                    ->state(function (Product $record): string {
                        return number_format($record->calculateSellingPrice(), 0, ',', '.');
                    }),
                \Filament\Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->actions([
                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
