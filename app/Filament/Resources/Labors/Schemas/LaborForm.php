<?php

namespace App\Filament\Resources\Labors\Schemas;

use Filament\Forms\Form;

class LaborForm
{
    public static function configure(Form $form): Form
    {
        return $form
            ->components([
                \Filament\Forms\Components\TextInput::make('role')
                    ->required()
                    ->maxLength(255),
                \Filament\Forms\Components\TextInput::make('rate')
                    ->required()
                    ->numeric()
                    ->prefix('Rp'),
            ]);
    }
}
