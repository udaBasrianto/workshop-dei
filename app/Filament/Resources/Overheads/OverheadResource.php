<?php

namespace App\Filament\Resources\Overheads;

use App\Filament\Resources\Overheads\Pages\CreateOverhead;
use App\Filament\Resources\Overheads\Pages\EditOverhead;
use App\Filament\Resources\Overheads\Pages\ListOverheads;
use App\Filament\Resources\Overheads\Schemas\OverheadForm;
use App\Filament\Resources\Overheads\Tables\OverheadsTable;
use App\Models\Overhead;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Forms\Form;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class OverheadResource extends Resource
{
    protected static ?string $model = Overhead::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';
    protected static ?string $navigationGroup = 'Produksi';
    protected static ?int $sort = 3;
    
    protected static ?string $navigationLabel = 'Biaya Operasional';
    
    protected static ?string $modelLabel = 'Biaya Operasional';

    protected static ?string $pluralModelLabel = 'Biaya Operasional';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Form $form): Form
    {
        return OverheadForm::configure($form);
    }

    public static function table(Table $table): Table
    {
        return OverheadsTable::configure($table);
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
            'index' => ListOverheads::route('/'),
            'create' => CreateOverhead::route('/create'),
            'edit' => EditOverhead::route('/{record}/edit'),
        ];
    }
}
