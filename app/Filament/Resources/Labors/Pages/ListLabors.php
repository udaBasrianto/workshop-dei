<?php

namespace App\Filament\Resources\Labors\Pages;

use App\Filament\Resources\Labors\LaborResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListLabors extends ListRecords
{
    protected static string $resource = LaborResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
