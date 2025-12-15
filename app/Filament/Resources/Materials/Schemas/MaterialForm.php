<?php

namespace App\Filament\Resources\Materials\Schemas;

use Filament\Forms\Form;

class MaterialForm
{
    public static function configure(Form $form): Form
    {
        return $form
            ->components([
                \Filament\Forms\Components\TextInput::make('item')
                    ->required()
                    ->maxLength(255),
                \Filament\Forms\Components\TextInput::make('unit')
                    ->required()
                    ->maxLength(255),
                \Filament\Forms\Components\TextInput::make('price')
                    ->required()
                    ->numeric()
                    ->prefix('Rp'),
                \Filament\Forms\Components\TextInput::make('stock')
                    ->required()
                    ->numeric()
                    ->default(0),
                \Filament\Forms\Components\FileUpload::make('image')
                    ->image()
                    ->directory('materials')
                    ->visibility('public'),
            ]);
    }
}
