<?php

namespace App\Filament\Pages;

use App\Models\AppSetting;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Colors\Color;

class Settings extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static string $view = 'filament.pages.settings';
    
    protected static ?string $navigationLabel = 'Pengaturan Tema';
    
    protected static ?int $sort = 100;

    public ?array $data = [];

    public function mount(): void
    {
        $settings = AppSetting::firstOrCreate([
            // Default values handled by DB, but good to ensure one row exists
        ], [
            'brand_name' => 'DeiStok',
            'theme_color' => 'Sky',
            'font_family' => 'Outfit',
        ]);

        $this->form->fill($settings->toArray());
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make('Tampilan Aplikasi')
                    ->description('Sesuaikan tampilan aplikasi sesuai keinginan Anda.')
                    ->schema([
                        TextInput::make('brand_name')
                            ->label('Nama Aplikasi')
                            ->required(),
                        
                        Select::make('theme_color')
                            ->label('Warna Tema Utama')
                            ->options([
                                'Amber' => 'Amber',
                                'Blue' => 'Blue',
                                'Cyan' => 'Cyan',
                                'Emerald' => 'Emerald',
                                'Gray' => 'Gray',
                                'Green' => 'Green', 
                                'Indigo' => 'Indigo',
                                'Lime' => 'Lime',
                                'Neutral' => 'Neutral',
                                'Orange' => 'Orange',
                                'Pink' => 'Pink',
                                'Purple' => 'Purple',
                                'Red' => 'Red',
                                'Rose' => 'Rose',
                                'Sky' => 'Sky',
                                'Slate' => 'Slate',
                                'Stone' => 'Stone',
                                'Teal' => 'Teal',
                                'Violet' => 'Violet',
                                'Yellow' => 'Yellow',
                                'Zinc' => 'Zinc',
                            ])
                            ->required()
                            ->searchable(),

                        Select::make('font_family')
                            ->label('Font Aplikasi')
                            ->options([
                                'Outfit' => 'Outfit (Modern)',
                                'Inter' => 'Inter (Clean)',
                                'Roboto' => 'Roboto (Standard)',
                                'Poppins' => 'Poppins (Geometric)',
                            ])
                            ->required(),
                    ])->columns(2),

                Section::make('Login Page')
                    ->description('Kustomisasi tampilan halaman login.')
                    ->schema([
                        \Filament\Forms\Components\FileUpload::make('login_background')
                            ->label('Background Login')
                            ->image()
                            ->disk('public')
                            ->directory('login-backgrounds')
                            ->visibility('public')
                            ->maxSize(2048)
                            ->imageEditor()
                            ->imageEditorAspectRatios([
                                null,
                                '16:9',
                                '4:3',
                                '1:1',
                            ])
                            ->helperText('Upload gambar untuk background halaman login. Maksimal 2MB. Rekomendasi: 1920x1080px')
                            ->columnSpanFull(),
                    ]),
            ])
            ->statePath('data');
    }

    public function submit(): void
    {
        $data = $this->form->getState();
        
        $settings = AppSetting::first();
        if ($settings) {
            $settings->update($data);
        } else {
            AppSetting::create($data);
        }

        Notification::make()
            ->success()
            ->title('Pengaturan berhasil disimpan')
            ->body('Silakan refresh halaman untuk melihat perubahan.')
            ->send();
    }
}
