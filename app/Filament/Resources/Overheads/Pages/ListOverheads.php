<?php

namespace App\Filament\Resources\Overheads\Pages;

use App\Filament\Resources\Overheads\OverheadResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListOverheads extends ListRecords
{
    protected static string $resource = OverheadResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
