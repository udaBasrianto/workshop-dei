<?php

namespace App\Filament\Resources\Labors\Pages;

use App\Filament\Resources\Labors\LaborResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditLabor extends EditRecord
{
    protected static string $resource = LaborResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
