<?php

namespace App\Filament\Resources\Overheads\Pages;

use App\Filament\Resources\Overheads\OverheadResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditOverhead extends EditRecord
{
    protected static string $resource = OverheadResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
