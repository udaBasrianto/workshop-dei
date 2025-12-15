<?php

namespace App\Filament\Resources\Overheads\Schemas;

use Filament\Forms\Form;

class OverheadForm
{
    public static function configure(Form $form): Form
    {
        return $form
            ->components([
                \Filament\Forms\Components\TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                \Filament\Forms\Components\TextInput::make('cost')
                    ->required()
                    ->numeric()
                    ->prefix('Rp'),
            ]);
    }
}
