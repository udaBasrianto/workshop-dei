import { useState, useEffect } from 'react';
import { getProducts, getCategories, getCustomers, checkout } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Loader2, Package, X, Users, Eye, Image } from 'lucide-react';

interface CartItem {
    product_id: number;
    name: string;
    unit_price: number;
    quantity: number;
    max_stock: number;
    image?: string;
}

export default function POS() {
    const { success, error, warning } = useNotification();
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [notes, setNotes] = useState('');
    const [cashReceived, setCashReceived] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [showCartMobile, setShowCartMobile] = useState(false);
    const [viewItem, setViewItem] = useState<any>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    const playBeep = () => {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime); // 1000Hz beep
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1); // 100ms duration
    };

    useEffect(() => {
        getProducts().then((res) => setProducts(res.data || []));
        getCategories().then((res) => setCategories(res.data || []));
        getCustomers().then((res) => setCustomers(res.data || []));
    }, []);

    const filteredProducts = products.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = !selectedCategory || p.category_id === selectedCategory;
        return matchSearch && matchCategory;
    });

    const addToCart = (product: any) => {
        playBeep();
        const existing = cart.find((c) => c.product_id === product.id);
        const stock = product.production_capacity;

        if (existing) {
            if (existing.quantity >= stock) return warning('Stok tidak mencukupi');
            setCart(cart.map((c) => (c.product_id === product.id ? { ...c, quantity: c.quantity + 1 } : c)));
        } else {
            setCart([
                ...cart,
                {
                    product_id: product.id,
                    name: product.name,
                    unit_price: product.price || 0,
                    quantity: 1,
                    max_stock: stock,
                    image: product.image,
                },
            ]);
        }
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(
            cart
                .map((c) => {
                    if (c.product_id === productId) {
                        const newQty = c.quantity + delta;
                        if (newQty <= 0) return null;
                        if (newQty > c.max_stock) return c;
                        return { ...c, quantity: newQty };
                    }
                    return c;
                })
                .filter(Boolean) as CartItem[]
        );
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter((c) => c.product_id !== productId));
    };

    const total = cart.reduce((sum, c) => sum + c.unit_price * c.quantity, 0);
    const change = cashReceived - total;

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    const handleCheckout = async () => {
        if (cart.length === 0) return warning('Keranjang kosong');
        if (paymentMethod === 'cash' && cashReceived < total) return warning('Uang tunai kurang dari total tagihan');
        
        setLoading(true);

        try {
            await checkout({
                customer_id: customerId,
                payment_method: paymentMethod,
                cash_received: paymentMethod === 'cash' ? cashReceived : 0,
                change_amount: paymentMethod === 'cash' ? change : 0,
                notes,
                items: cart.map((c) => ({
                    product_id: c.product_id,
                    quantity: c.quantity,
                    unit_price: c.unit_price,
                })),
            });
            success('Transaksi berhasil!');
            setCart([]);
            setNotes('');
            setCashReceived(0);
            setCustomerId(null);
            setShowCartMobile(false);
            getProducts().then((res) => setProducts(res.data || []));
        } catch (err: any) {
            error(err.response?.data?.error || 'Checkout gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative h-full flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
            {/* Products Grid */}
            <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${showCartMobile ? 'hidden lg:flex' : 'flex'}`}>
                <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0 px-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                        />
                    </div>
                    <select
                        value={selectedCategory || ''}
                        onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 px-1">
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 pb-24 lg:pb-6">
                        {filteredProducts.map((p) => (
                            <button
                                key={p.id}
                                onClick={() => addToCart(p)}
                                disabled={p.production_capacity <= 0}
                                className="group bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 hover:border-blue-400 hover:shadow-xl transition-all text-left disabled:opacity-50 relative overflow-hidden"
                            >
                                {p.image ? (
                                    <div className="aspect-square w-full mb-3 overflow-hidden rounded-xl bg-gray-50">
                                        <img src={p.image?.startsWith('/uploads/') ? p.image : `/uploads/${p.image}`} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    </div>
                                ) : (
                                    <div className="aspect-square w-full mb-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                                        <Package className="w-8 h-8 text-gray-300" />
                                    </div>
                                )}
                                <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate mb-1">{p.name}</h3>
                                <div className="flex items-center justify-between">
                                    <p className="text-blue-600 font-bold text-sm sm:text-base">{formatCurrency(p.price || 0)}</p>
                                    <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-medium ${p.production_capacity < 5 ? 'text-red-500' : 'text-gray-500'}`}>
                                        <Package className="w-3.5 h-3.5" />
                                        {p.production_capacity}
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setViewItem(p);
                                            setActiveImage(p.image);
                                        }}
                                        className="p-1.5 bg-white text-gray-600 rounded-lg shadow-lg hover:bg-gray-50"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <div className="p-1.5 bg-blue-500 text-white rounded-lg shadow-lg">
                                        <Plus className="w-4 h-4" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Section */}
            <div className={`
                ${showCartMobile ? 'flex fixed inset-0 z-50 bg-white' : 'hidden lg:flex'} 
                lg:relative lg:w-96 lg:bg-white lg:rounded-2xl lg:border lg:border-gray-100 flex-col shadow-2xl lg:shadow-sm min-h-0
            `}>
                <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        Keranjang
                        <span className="text-sm font-normal text-gray-400 ml-1">({cart.length})</span>
                    </h2>
                    <button
                        onClick={() => setShowCartMobile(false)}
                        className="lg:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50 lg:bg-white custom-scrollbar min-h-0">
                    {cart.map((item) => (
                        <div key={item.product_id} className="flex items-center gap-4 p-3 bg-white border border-gray-100 lg:bg-gray-50 lg:border-none rounded-xl shadow-sm lg:shadow-none">
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                                <p className="text-xs text-blue-600 font-medium">{formatCurrency(item.unit_price)}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    onClick={() => updateQuantity(item.product_id, -1)}
                                    className="p-1.5 hover:bg-white lg:hover:bg-gray-200 text-gray-500 rounded-lg border border-gray-100 lg:border-none transition-colors"
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-bold text-gray-700">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.product_id, 1)}
                                    className="p-1.5 hover:bg-white lg:hover:bg-gray-200 text-gray-500 rounded-lg border border-gray-100 lg:border-none transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => removeFromCart(item.product_id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {cart.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <ShoppingCart className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="font-medium">Keranjang masih kosong</p>
                        </div>
                    )}
                </div>

                <div className="p-4 sm:p-6 border-t border-gray-100 space-y-4 bg-white shrink-0">
                    <div className="space-y-3">
                        <div className="relative">
                            <select
                                value={customerId || ''}
                                onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : null)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none pr-10"
                            >
                                <option value="">Pelanggan (opsional)</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <Users className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
                            <button
                                onClick={() => setPaymentMethod('cash')}
                                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${paymentMethod === 'cash'
                                    ? 'bg-white text-green-600 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                <Banknote className="w-4 h-4" /> Tunai
                            </button>
                            <button
                                onClick={() => setPaymentMethod('transfer')}
                                className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-all ${paymentMethod === 'transfer'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                <CreditCard className="w-4 h-4" /> Transfer
                            </button>
                        </div>
                    </div>

                    {paymentMethod === 'cash' && (
                        <div className="space-y-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Uang Diterima</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={cashReceived || ''}
                                        onChange={(e) => setCashReceived(Number(e.target.value))}
                                        className="w-full pl-10 pr-4 py-2 bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-blue-200 border-dashed">
                                <span className="text-sm font-semibold text-gray-600">Kembalian</span>
                                <span className={`font-bold text-lg ${change < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                    {formatCurrency(change)}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between py-2">
                        <span className="text-gray-500 font-medium text-sm">Total Tagihan</span>
                        <span className="text-xl font-black text-blue-600">{formatCurrency(total)}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={loading || cart.length === 0}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                <span>Bayar Sekarang</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile View Cart FAB */}
            {cart.length > 0 && !showCartMobile && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full px-6 lg:hidden z-40 animate-in fade-in slide-in-from-bottom-4">
                    <button
                        onClick={() => setShowCartMobile(true)}
                        className="w-full bg-blue-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-2xl ring-4 ring-white"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <ShoppingCart className="w-6 h-6" />
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                                    {cart.reduce((sum, i) => sum + i.quantity, 0)}
                                </span>
                            </div>
                            <span className="font-bold">Lihat Keranjang</span>
                        </div>
                        <span className="font-black text-lg">{formatCurrency(total)}</span>
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            {viewItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewItem(null)}>
                    <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{viewItem.name}</h2>
                                <p className="text-gray-500">#{viewItem.id} • {viewItem.category?.name || 'Tanpa Kategori'}</p>
                            </div>
                            <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Images */}
                            <div className="space-y-4">
                                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                    {activeImage ? (
                                        <img src={activeImage} alt={viewItem.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Image className="w-16 h-16" />
                                        </div>
                                    )}
                                </div>
                                {/* Thumbnails */}
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {viewItem.image && (
                                        <button 
                                            onClick={() => setActiveImage(viewItem.image)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${activeImage === viewItem.image ? 'border-blue-500' : 'border-gray-200'}`}
                                        >
                                            <img src={viewItem.image} alt="Main" className="w-full h-full object-cover" />
                                        </button>
                                    )}
                                    {viewItem.images?.map((img: any, idx: number) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setActiveImage(img.url)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${activeImage === img.url ? 'border-blue-500' : 'border-gray-200'}`}
                                        >
                                            <img src={img.url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column: Details */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-1">Harga Jual</p>
                                        <p className="text-xl font-bold text-gray-800">{formatCurrency(viewItem.price)}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500 mb-1">Stok</p>
                                        <p className="text-xl font-bold text-gray-800">{viewItem.production_capacity || 0} {viewItem.unit}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-semibold text-gray-800 border-b pb-2">Informasi Produk</h3>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <span className="text-gray-500">Tipe Produk</span>
                                        <span className="font-medium capitalize">{viewItem.type || 'Standard'}</span>
                                        
                                        <span className="text-gray-500">Barcode</span>
                                        <span className="font-medium">{viewItem.barcode || '-'}</span>
                                        
                                        <span className="text-gray-500">Min. Stok</span>
                                        <span className="font-medium">{viewItem.min_stock || 0}</span>
                                        
                                        <span className="text-gray-500">Kadaluarsa</span>
                                        <span className={`font-medium ${viewItem.expired_at ? 'text-red-600' : ''}`}>
                                            {viewItem.expired_at ? new Date(viewItem.expired_at).toLocaleDateString('id-ID') : '-'}
                                        </span>
                                    </div>
                                </div>

                                {viewItem.type === 'production' && (
                                    <div className="space-y-3">
                                        <h3 className="font-semibold text-gray-800 border-b pb-2">Komposisi</h3>
                                        
                                        {/* Materials */}
                                        {viewItem.product_materials?.length > 0 && (
                                            <div className="mb-2">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Bahan Baku</p>
                                                <ul className="text-sm space-y-1">
                                                    {viewItem.product_materials.map((pm: any) => (
                                                        <li key={pm.id} className="flex justify-between">
                                                            <span>{pm.material?.name}</span>
                                                            <span className="text-gray-500">{pm.quantity} {pm.material?.unit}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {/* Labors */}
                                        {viewItem.product_labors?.length > 0 && (
                                            <div className="mb-2">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Tenaga Kerja</p>
                                                <ul className="text-sm space-y-1">
                                                    {viewItem.product_labors.map((pl: any) => (
                                                        <li key={pl.id} className="flex justify-between">
                                                            <span>{pl.labor?.name}</span>
                                                            <span className="text-gray-500">{pl.hours} Jam</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {/* Overheads */}
                                        {viewItem.product_overheads?.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Overhead</p>
                                                <ul className="text-sm space-y-1">
                                                    {viewItem.product_overheads.map((po: any) => (
                                                        <li key={po.id} className="flex justify-between">
                                                            <span>{po.overhead?.name}</span>
                                                            <span className="text-gray-500">{formatCurrency(po.amount)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
