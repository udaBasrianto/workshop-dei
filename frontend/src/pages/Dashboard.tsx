import { useEffect, useState } from 'react';
import { getDashboardStats, getSalesTrend, getTopProducts, getLowStock, getExpiringProducts } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, DollarSign, Calendar } from 'lucide-react';

interface Stats {
    total_products: number;
    total_transactions: number;
    total_revenue: number;
    total_customers: number;
    today_revenue: number;
    today_transactions: number;
    low_stock_products: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [salesTrend, setSalesTrend] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [lowStock, setLowStock] = useState<any[]>([]);
    const [expiringProducts, setExpiringProducts] = useState<any[]>([]);

    useEffect(() => {
        getDashboardStats().then((res) => setStats(res.data));
        getSalesTrend(7).then((res) => setSalesTrend(res.data || []));
        getTopProducts().then((res) => setTopProducts(res.data || []));
        getLowStock().then((res) => setLowStock(res.data || []));
        getExpiringProducts().then((res) => setExpiringProducts(res.data || []));
    }, []);

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    const statCards = [
        { label: 'Total Produk', value: stats?.total_products || 0, icon: Package, color: 'from-blue-500 to-blue-600' },
        { label: 'Total Transaksi', value: stats?.total_transactions || 0, icon: ShoppingCart, color: 'from-green-500 to-green-600' },
        { label: 'Total Pelanggan', value: stats?.total_customers || 0, icon: Users, color: 'from-purple-500 to-purple-600' },
        { label: 'Pendapatan Hari Ini', value: formatCurrency(stats?.today_revenue || 0), icon: DollarSign, color: 'from-amber-500 to-orange-500' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">{card.label}</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color}`}>
                                <card.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                        Trend Penjualan (7 Hari)
                    </h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={salesTrend}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                            <Area type="monotone" dataKey="amount" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAmount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-green-500" />
                        Produk Terlaris
                    </h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={topProducts.slice(0, 5)} layout="vertical">
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis dataKey="product_name" type="category" width={100} tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Bar dataKey="total_sold" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStock.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <h2 className="text-lg font-semibold text-amber-800 mb-3 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Stok Rendah ({lowStock.length} produk)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {lowStock.slice(0, 8).map((p: any) => (
                            <div key={p.id} className="bg-white rounded-lg p-3 border border-amber-200">
                                <p className="font-medium text-gray-800 truncate">{p.name}</p>
                                <p className="text-sm text-amber-600">Stok: {p.production_capacity}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Expiring Products Alert */}
            {expiringProducts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <h2 className="text-lg font-semibold text-red-800 mb-3 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Produk Kadaluarsa / Mendekati Kadaluarsa ({expiringProducts.length} produk)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {expiringProducts.slice(0, 8).map((p: any) => (
                            <div key={p.id} className="bg-white rounded-lg p-3 border border-red-200">
                                <p className="font-medium text-gray-800 truncate">{p.name}</p>
                                <p className="text-sm text-red-600">
                                    Exp: {new Date(p.expired_at).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
