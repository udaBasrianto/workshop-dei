<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;
use Filament\Widgets\AccountWidget;
use Filament\Widgets\FilamentInfoWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        $settings = null;
        try {
            $settings = \App\Models\AppSetting::first();
        } catch (\Exception $e) {
            // DB might not be ready during migration
        }

        $brandName = $settings?->brand_name ?? 'DeiStok';
        $themeColorName = $settings?->theme_color ?? 'Sky';
        $fontFamily = $settings?->font_family ?? 'Outfit';

        $colors = [
            'Amber' => Color::Amber,
            'Blue' => Color::Blue,
            'Cyan' => Color::Cyan,
            'Emerald' => Color::Emerald,
            'Gray' => Color::Gray,
            'Green' => Color::Green,
            'Indigo' => Color::Indigo,
            'Lime' => Color::Lime,
            'Neutral' => Color::Neutral,
            'Orange' => Color::Orange,
            'Pink' => Color::Pink,
            'Purple' => Color::Purple,
            'Red' => Color::Red,
            'Rose' => Color::Rose,
            'Sky' => Color::Sky,
            'Slate' => Color::Slate,
            'Stone' => Color::Stone,
            'Teal' => Color::Teal,
            'Violet' => Color::Violet,
            'Yellow' => Color::Yellow,
            'Zinc' => Color::Zinc,
        ];

        $primaryColor = $colors[$themeColorName] ?? Color::Sky;

        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login(\App\Filament\Pages\Auth\Login::class)
            ->colors([
                'primary' => $primaryColor,
                'gray' => Color::Slate,
            ])
            ->font($fontFamily)
            ->brandName($brandName)
            ->profile()
            ->passwordReset()
            ->darkMode(true)
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->widgets([
                AccountWidget::class,
                FilamentInfoWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
