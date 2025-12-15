<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ExpenseResource\Pages;
use App\Filament\Resources\ExpenseResource\RelationManagers;
use App\Models\Expense;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ExpenseResource extends Resource
{
    protected static ?string $model = Expense::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';
    protected static ?string $navigationGroup = 'Keuangan';
    protected static ?string $navigationLabel = 'Pengeluaran';
    protected static ?int $sort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\DatePicker::make('transaction_date')
                    ->label('Tanggal')
                    ->required()
                    ->default(now()),
                Forms\Components\TextInput::make('name')
                    ->label('Nama Pengeluaran')
                    ->required()
                    ->maxLength(255),
                Forms\Components\Select::make('category')
                    ->label('Kategori')
                    ->options([
                        'operational' => 'Operasional',
                        'salary' => 'Gaji Karyawan',
                        'rent' => 'Sewa Tempat',
                        'maintenance' => 'Perawatan/Maintenance',
                        'buying_goods' => 'Pembelian Barang',
                        'other' => 'Lainnya',
                    ])
                    ->required(),
                Forms\Components\TextInput::make('amount')
                    ->label('Jumlah Biaya')
                    ->numeric()
                    ->prefix('Rp')
                    ->required(),
                Forms\Components\Textarea::make('notes')
                    ->label('Catatan')
                    ->columnSpanFull(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('transaction_date')
                    ->label('Tanggal')
                    ->date()
                    ->sortable(),
                Tables\Columns\TextColumn::make('name')
                    ->label('Nama')
                    ->searchable(),
                Tables\Columns\TextColumn::make('category')
                    ->label('Kategori')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'operational' => 'Operasional',
                        'salary' => 'Gaji',
                        'rent' => 'Sewa',
                        'maintenance' => 'Perawatan',
                        'buying_goods' => 'Beli Barang',
                        'other' => 'Lainnya',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'operational' => 'info',
                        'salary' => 'warning',
                        'buying_goods' => 'primary',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('amount')
                    ->label('Jumlah')
                    ->numeric()
                    ->prefix('Rp ')
                    ->sortable()
                    ->summarize(Tables\Columns\Summarizers\Sum::make()->label('Total')),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('transaction_date', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('category')
                    ->options([
                        'operational' => 'Operasional',
                        'salary' => 'Gaji Karyawan',
                        'rent' => 'Sewa Tempat',
                        'maintenance' => 'Perawatan',
                        'buying_goods' => 'Pembelian Barang',
                        'other' => 'Lainnya',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListExpenses::route('/'),
            'create' => Pages\CreateExpense::route('/create'),
            'edit' => Pages\EditExpense::route('/{record}/edit'),
        ];
    }
}
