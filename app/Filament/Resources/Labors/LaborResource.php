<?php

namespace App\Filament\Resources\Labors;

use App\Filament\Resources\Labors\Pages\CreateLabor;
use App\Filament\Resources\Labors\Pages\EditLabor;
use App\Filament\Resources\Labors\Pages\ListLabors;
use App\Filament\Resources\Labors\Schemas\LaborForm;
use App\Filament\Resources\Labors\Tables\LaborsTable;
use App\Models\Labor;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Forms\Form;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class LaborResource extends Resource
{
    protected static ?string $model = Labor::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationGroup = 'Produksi';
    protected static ?int $sort = 2;
    
    protected static ?string $navigationLabel = 'Tenaga Kerja';
    
    protected static ?string $modelLabel = 'Tenaga Kerja';

    protected static ?string $pluralModelLabel = 'Tenaga Kerja';

    protected static ?string $recordTitleAttribute = 'role';

    public static function form(Form $form): Form
    {
        return LaborForm::configure($form);
    }

    public static function table(Table $table): Table
    {
        return LaborsTable::configure($table);
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
            'index' => ListLabors::route('/'),
            'create' => CreateLabor::route('/create'),
            'edit' => EditLabor::route('/{record}/edit'),
        ];
    }
}
