<x-filament-panels::page class="h-full">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full items-start">
        {{-- Left Column: Products --}}
        <div class="lg:col-span-2 flex flex-col gap-6">
            {{-- Header / Filter Bar --}}
            <div class="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div class="flex gap-2 overflow-x-auto no-scrollbar">
                    <button class="px-4 py-2 bg-lime-400 text-black font-bold rounded-full text-sm shadow-sm transition hover:bg-lime-500">
                        All Product <span class="bg-white/30 px-2 py-0.5 rounded-full text-xs ml-1">{{ $this->products->count() }}</span>
                    </button>
                    {{-- Placeholders for future categories --}}
                    <button class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                        Favorit
                    </button>
                </div>
                <div class="w-full md:w-64">
                    <x-filament::input.wrapper class="rounded-full bg-gray-50 dark:bg-gray-800 border-none">
                        <x-filament::input
                            wire:model.live.debounce.500ms="search"
                            type="search"
                            placeholder="Search..."
                            class="border-none bg-transparent focus:ring-0"
                        />
                    </x-filament::input.wrapper>
                </div>
            </div>

            {{-- Product Grid --}}
            <div class="grid grid-cols-2 md:grid-cols-3 gap-6">
                @forelse($this->products as $product)
                    <div class="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group flex flex-col h-full {{ $product->production_capacity <= 0 ? 'opacity-75 grayscale' : '' }}">
                        {{-- Image & Badge --}}
                        <div class="aspect-[4/3] bg-gray-50 dark:bg-gray-800 rounded-xl mb-4 relative overflow-hidden">
                            <span class="absolute top-2 left-2 {{ $product->production_capacity > 0 ? 'bg-black/80' : 'bg-red-600' }} text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm z-10">
                                {{ $product->production_capacity > 0 ? $product->production_capacity . ' Stock' : 'Out of Stock' }}
                            </span>
                            @if($product->image)
                                <img src="{{ \Illuminate\Support\Facades\Storage::url($product->image) }}" alt="{{ $product->name }}" class="w-full h-full object-cover {{ $product->production_capacity > 0 ? 'group-hover:scale-105' : '' }} transition-transform duration-500">
                            @else
                                <div class="flex items-center justify-center h-full text-gray-300">
                                    <x-heroicon-o-photo class="w-12 h-12" />
                                </div>
                            @endif
                        </div>

                        {{-- Details --}}
                        <div class="flex-1 flex flex-col">
                            <h3 class="font-bold text-gray-900 dark:text-white text-base leading-tight mb-1 line-clamp-2">
                                {{ $product->name }}
                            </h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                                {{ $product->description ?? 'No description available' }}
                            </p>
                            
                            <div class="flex items-center gap-1 mb-3">
                                <x-heroicon-m-archive-box class="w-3 h-3 {{ $product->production_capacity > 0 ? 'text-gray-500' : 'text-red-500' }}" />
                                <span class="text-xs font-medium {{ $product->production_capacity > 0 ? 'text-gray-600 dark:text-gray-400' : 'text-red-500' }}">
                                    Stok: {{ $product->production_capacity }}
                                </span>
                            </div>
                            
                            <div class="mt-auto flex flex-col gap-3">
                                <div class="font-bold text-lg text-gray-900 dark:text-white">
                                    Rp {{ number_format($product->calculateSellingPrice(), 0, ',', '.') }}
                                </div>
                                <button 
                                    wire:click="addToCart({{ $product->id }})" 
                                    @if($product->production_capacity <= 0) disabled @endif
                                    class="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2
                                    {{ $product->production_capacity > 0 ? 'hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black' : 'bg-gray-100 text-gray-400 cursor-not-allowed' }}">
                                    @if($product->production_capacity > 0)
                                        <x-heroicon-m-plus class="w-4 h-4" />
                                        Add to Cart
                                    @else
                                        <x-heroicon-m-no-symbol class="w-4 h-4" />
                                        Habis
                                    @endif
                                </button>
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="col-span-full py-12 flex flex-col items-center justify-center text-gray-400">
                        <x-heroicon-o-face-frown class="w-16 h-16 mb-4 opacity-50" />
                        <p class="text-lg font-medium">No products found</p>
                    </div>
                @endforelse
            </div>
        </div>

        {{-- Right Column: Detailed Transaction (Cart) --}}
        <div class="lg:col-span-1 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-[calc(100vh-2rem)] sticky top-4">
            <div class="flex justify-between items-center mb-6">
                <h2 class="font-bold text-xl text-gray-900 dark:text-white">Detail Transaction</h2>
                @if(count($cart) > 0)
                    <button wire:click="$set('cart', [])" class="text-red-500 text-xs font-semibold hover:text-red-600 flex items-center gap-1 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg transition">
                        <x-heroicon-o-trash class="w-3 h-3" />
                        Reset
                    </button>
                @endif
            </div>

            {{-- Cart Items List --}}
            <div class="flex-1 overflow-y-auto -mx-2 px-2 space-y-4 mb-6 custom-scrollbar">
                @forelse($cart as $id => $item)
                    <div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl flex gap-3 group relative border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                        {{-- Item Image --}}
                        <div class="w-16 h-16 bg-white dark:bg-gray-800 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100 dark:border-gray-700">
                             @if($item['image'])
                                <img src="{{ \Illuminate\Support\Facades\Storage::url($item['image']) }}" class="w-full h-full object-cover">
                            @else
                                <div class="w-full h-full flex items-center justify-center text-gray-300">
                                    <x-heroicon-o-cube class="w-6 h-6" />
                                </div>
                            @endif
                        </div>

                        {{-- Item Details --}}
                        <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                                <h4 class="font-bold text-sm text-gray-900 dark:text-white truncate pr-6">{{ $item['name'] }}</h4>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Unit</p>
                            </div>
                            
                            <div class="flex items-center justify-between mt-2">
                                {{-- Qty Control --}}
                                <div class="flex items-center gap-3">
                                    <button wire:click="updateQuantity({{ $id }}, {{ $item['quantity'] - 1 }})" class="w-6 h-6 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 hover:text-black hover:border-gray-300 transition text-xs font-bold">-</button>
                                    <span class="font-bold text-sm w-4 text-center">{{ sprintf('%02d', $item['quantity']) }}</span>
                                    <button wire:click="updateQuantity({{ $id }}, {{ $item['quantity'] + 1 }})" class="w-6 h-6 rounded-full bg-lime-400 text-black shadow-sm shadow-lime-200 flex items-center justify-center hover:bg-lime-500 transition text-xs font-bold">+</button>
                                </div>
                                <div class="font-bold text-sm text-gray-900 dark:text-white">
                                    Rp {{ number_format($item['price'] * $item['quantity'], 0, ',', '.') }}
                                </div>
                            </div>
                        </div>

                        {{-- Quick Remove --}}
                        <button wire:click="removeFromCart({{ $id }})" class="absolute top-2 right-2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-100 dark:border-gray-700 flex items-center justify-center transition shadow-sm">
                            <x-heroicon-m-trash class="w-3 h-3" />
                        </button>
                    </div>
                @empty
                    <div class="flex flex-col items-center justify-center h-48 text-gray-400 text-center">
                        <div class="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                            <x-heroicon-o-shopping-cart class="w-8 h-8 opacity-40" />
                        </div>
                        <p class="text-sm font-medium">Cart is empty</p>
                        <p class="text-xs text-gray-500 mt-1">Select products to start</p>
                    </div>
                @endforelse
            </div>

            {{-- Summary Section --}}
            <div class="pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 space-y-4">
                {{-- Customer Selector --}}
                <div class="space-y-2">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer Info</label>
                    <select wire:model.live="customerId" class="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-lime-500 focus:border-lime-500">
                        <option value="">-- Pilih Pelanggan (Umum) --</option>
                        @foreach(\App\Models\Customer::all() as $customer)
                            <option value="{{ $customer->id }}">
                                {{ $customer->name }} ({{ $customer->points }} Poin)
                            </option>
                        @endforeach
                    </select>
                </div>

                <div class="space-y-2">
                    <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>Sub-Total</span>
                        <span class="font-medium text-gray-900 dark:text-white">Rp {{ number_format($total, 0, ',', '.') }}</span>
                    </div>
                    {{-- Tax or others --}}
                    {{-- <div class="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>Tax (11%)</span>
                        <span class="font-medium text-gray-900 dark:text-white">Rp ...</span>
                    </div> --}}
                    
                    <div class="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                        <span>Total Payment</span>
                        <span>Rp {{ number_format($total, 0, ',', '.') }}</span>
                    </div>
                </div>

                <div class="space-y-3 pt-2">
                    {{-- Payment Method Selector --}}
                    <div class="space-y-2">
                        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Method</label>
                        <select wire:model="paymentMethod" class="w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-sm font-medium focus:ring-lime-500 focus:border-lime-500">
                            <option value="cash">💵 Cash / Tunai</option>
                            <option value="transfer">🏦 Bank Transfer</option>
                            <option value="qris">📱 QRIS</option>
                        </select>
                    </div>

                    <button wire:click="checkout" class="w-full bg-lime-400 hover:bg-lime-500 text-black font-bold py-4 rounded-2xl shadow-lg shadow-lime-200 dark:shadow-none transition-all transform hover:scale-[1.01] active:scale-[0.99] text-base ">
                        Continue
                    </button>
                </div>
            </div>
        </div>
    </div>
</x-filament-panels::page>
