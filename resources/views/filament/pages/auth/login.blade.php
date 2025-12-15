<x-filament-panels::page.simple>
    @php
        $settings = \App\Models\AppSetting::first();
        $loginBackground = $settings?->login_background;
    @endphp

    @if($loginBackground)
        <style>
            /* Background fullscreen di luar container */
            body {
                background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('{{ \Illuminate\Support\Facades\Storage::url($loginBackground) }}');
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                background-attachment: fixed;
            }
            
            /* Container login jadi transparan blur (glassmorphism) */
            .fi-simple-main {
                background: rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 1.5rem;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            }
            
            /* Dark mode */
            @media (prefers-color-scheme: dark) {
                .fi-simple-main {
                    background: rgba(17, 24, 39, 0.2) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
            }
            
            /* Pastikan text tetap terbaca */
            .fi-simple-main * {
                color: inherit;
            }
        </style>
    @endif

    <x-filament-panels::form wire:submit="authenticate">
        {{ $this->form }}

        <x-filament-panels::form.actions
            :actions="$this->getCachedFormActions()"
            :full-width="$this->hasFullWidthFormActions()"
        />
    </x-filament-panels::form>
</x-filament-panels::page.simple>
