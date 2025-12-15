<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Forms\Form;

class ProductForm
{
    public static function configure(Form $form): Form
    {
        return $form
            ->components([
                Section::make('Product Details')
                    ->columns(3)
                    ->schema([
                        Select::make('type')
                            ->options([
                                'manufactured' => 'Produksi Sendiri',
                                'resale' => 'Beli Jadi (Reseller)',
                            ])
                            ->required()
                            ->default('manufactured')
                            ->live()
                            ->afterStateUpdated(fn (Set $set) => $set('production_capacity', 1)),
                        
                        Select::make('category_id')
                            ->relationship('category', 'name')
                            ->searchable()
                            ->preload()
                            ->createOptionForm([
                                TextInput::make('name')
                                    ->required()
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(fn (string $operation, $state, Set $set) => $set('slug', \Illuminate\Support\Str::slug($state))),
                                TextInput::make('slug')
                                    ->required(),
                            ])
                            ->required(),

                        TextInput::make('name')
                            ->required()
                            ->columnSpan(2),

                        Select::make('unit')
                            ->label('Satuan')
                            ->options([
                                'pcs' => 'Pcs',
                                'box' => 'Box',
                                'liter' => 'Liter',
                                'kg' => 'Kilogram',
                                'gr' => 'Gram',
                                'pack' => 'Pack',
                                'lusin' => 'Lusin',
                                'kodi' => 'Kodi',
                                'rim' => 'Rim',
                                'botol' => 'Botol',
                                'can' => 'Kaleng',
                            ])
                            ->required()
                            ->default('pcs')
                            ->searchable()
                            ->createOptionForm([
                                TextInput::make('unit')
                                    ->label('Satuan Baru')
                                    ->required(),
                            ])
                            ->createOptionUsing(function (array $data) {
                                return $data['unit'];
                            }),
                        
                        // Fields for Resale
                        TextInput::make('buy_price')
                            ->label('Harga Modal (Beli)')
                            ->numeric()
                            ->prefix('Rp')
                            ->visible(fn (Get $get) => $get('type') === 'resale')
                            ->required(fn (Get $get) => $get('type') === 'resale')
                            ->live(),

                        TextInput::make('price')
                            ->label('Harga Jual (Manual)')
                            ->numeric()
                            ->prefix('Rp')
                            ->visible(fn (Get $get) => $get('type') === 'resale')
                            ->required(fn (Get $get) => $get('type') === 'resale'),
                        
                        TextInput::make('stock')
                            ->label('Stok Awal')
                            ->numeric()
                            ->default(0)
                            ->visible(fn (Get $get) => $get('type') === 'resale'),

                        // Fields for Manufactured
                        TextInput::make('profit_margin')
                            ->numeric()
                            ->default(30)
                            ->suffix('%')
                            ->required()
                            ->visible(fn (Get $get) => $get('type') === 'manufactured')
                            ->live(), 

                        TextInput::make('production_capacity')
                            ->numeric()
                            ->default(100)
                            ->required()
                            ->visible(fn (Get $get) => $get('type') === 'manufactured')
                            ->live(),

                        \Filament\Forms\Components\FileUpload::make('image')
                            ->image()
                            ->disk('public')
                            ->directory('products')
                            ->visibility('public')
                            ->columnSpanFull(),
                    ]),

                Section::make('Cost Components')
                    ->description('Komponen biaya untuk produk yang diproduksi sendiri.')
                    ->visible(fn (Get $get) => $get('type') === 'manufactured')
                    ->schema([
                        Repeater::make('productMaterials')
                            ->relationship()
                            ->schema([
                                Select::make('material_id')
                                    ->relationship('material', 'item')
                                    ->required()
                                    ->searchable()
                                    ->preload()
                                    ->live()
                                    ->afterStateUpdated(function ($state, Set $set) {
                                        $price = \App\Models\Material::find($state)?->price ?? 0;
                                        $set('unit_price', $price);
                                    }),
                                TextInput::make('unit_price')
                                    ->disabled()
                                    ->dehydrated(false)
                                    ->numeric()
                                    ->prefix('Rp'),
                                TextInput::make('quantity')
                                    ->numeric()
                                    ->default(1)
                                    ->required()
                                    ->live(),
                            ])
                            ->columns(3)
                            ->live(), 

                        Repeater::make('productLabors')
                            ->relationship()
                            ->schema([
                                Select::make('labor_id')
                                    ->relationship('labor', 'role')
                                    ->required()
                                    ->searchable()
                                    ->preload()
                                    ->live()
                                    ->afterStateUpdated(function ($state, Set $set) {
                                        $rate = \App\Models\Labor::find($state)?->rate ?? 0;
                                        $set('hourly_rate', $rate);
                                    }),
                                TextInput::make('hourly_rate')
                                    ->disabled()
                                    ->dehydrated(false)
                                    ->numeric()
                                    ->prefix('Rp'),
                                TextInput::make('hours')
                                    ->numeric()
                                    ->default(1)
                                    ->required()
                                    ->live(),
                            ])
                            ->columns(3)
                            ->live(),
                    ]),

                Section::make('Summary & Pricing')
                    ->visible(fn (Get $get) => $get('type') === 'manufactured')
                    ->schema([
                        Placeholder::make('total_material_cost')
                            ->content(function (Get $get) {
                                $materials = collect($get('productMaterials'));
                                $total = $materials->reduce(function ($carry, $item) {
                                    $price = (float) (\App\Models\Material::find($item['material_id'] ?? null)?->price ?? 0);
                                    return $carry + ($price * (float) ($item['quantity'] ?? 0));
                                }, 0);
                                return 'Rp ' . number_format($total, 0, ',', '.');
                            }),
                        Placeholder::make('total_labor_cost')
                            ->content(function (Get $get) {
                                $labors = collect($get('productLabors'));
                                $total = $labors->reduce(function ($carry, $item) {
                                    $rate = (float) (\App\Models\Labor::find($item['labor_id'] ?? null)?->rate ?? 0);
                                    return $carry + ($rate * (float) ($item['hours'] ?? 0));
                                }, 0);
                                return 'Rp ' . number_format($total, 0, ',', '.');
                            }),
                        Placeholder::make('overhead_cost_unit')
                            ->label('Overhead Cost (Per Unit)')
                            ->content(function (Get $get) {
                                $capacity = (float) $get('production_capacity') ?: 1;
                                $totalOverhead = \App\Models\Overhead::sum('cost');
                                $perUnit = $totalOverhead / $capacity;
                                return 'Rp ' . number_format($perUnit, 0, ',', '.');
                            }),
                        Placeholder::make('hpp')
                            ->label('HPP (Harga Pokok Produksi)')
                            ->content(function (Get $get) {
                                // Materials
                                $materials = collect($get('productMaterials'));
                                $matCost = $materials->reduce(function ($carry, $item) {
                                    $price = (float) (\App\Models\Material::find($item['material_id'] ?? null)?->price ?? 0);
                                    return $carry + ($price * (float) ($item['quantity'] ?? 0));
                                }, 0);

                                // Labor
                                $labors = collect($get('productLabors'));
                                $labCost = $labors->reduce(function ($carry, $item) {
                                    $rate = (float) (\App\Models\Labor::find($item['labor_id'] ?? null)?->rate ?? 0);
                                    return $carry + ($rate * (float) ($item['hours'] ?? 0));
                                }, 0);

                                // Overhead
                                $capacity = (float) $get('production_capacity') ?: 1;
                                $totalOverhead = \App\Models\Overhead::sum('cost');
                                $overheadUnit = $totalOverhead / $capacity;

                                $hpp = $matCost + $labCost + $overheadUnit;
                                return 'Rp ' . number_format($hpp, 0, ',', '.');
                            }),
                        Placeholder::make('selling_price_recommendation')
                            ->label('Recommended Selling Price')
                            ->content(function (Get $get) {
                                // Re-calc HPP (duplicate logic, but standard for stateless placeholder)
                                $materials = collect($get('productMaterials'));
                                $matCost = $materials->reduce(function ($carry, $item) {
                                    $price = (float) (\App\Models\Material::find($item['material_id'] ?? null)?->price ?? 0);
                                    return $carry + ($price * (float) ($item['quantity'] ?? 0));
                                }, 0);

                                $labors = collect($get('productLabors'));
                                $labCost = $labors->reduce(function ($carry, $item) {
                                    $rate = (float) (\App\Models\Labor::find($item['labor_id'] ?? null)?->rate ?? 0);
                                    return $carry + ($rate * (float) ($item['hours'] ?? 0));
                                }, 0);

                                $capacity = (float) $get('production_capacity') ?: 1;
                                $totalOverhead = \App\Models\Overhead::sum('cost');
                                $overheadUnit = $totalOverhead / $capacity;

                                $hpp = $matCost + $labCost + $overheadUnit;
                                
                                // Profit
                                $margin = (float) $get('profit_margin') ?: 0;
                                $profit = $hpp * ($margin / 100);
                                $price = $hpp + $profit;

                                return 'Rp ' . number_format($price, 0, ',', '.') . ' (Profit: Rp ' . number_format($profit, 0, ',', '.') . ')';
                            })
                            ->columnSpanFull(),
                    ])
                    ->columns(2),
            ]);
    }
}
