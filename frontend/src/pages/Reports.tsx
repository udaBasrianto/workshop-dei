import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { FileText, TrendingUp, DollarSign, Wallet, Package } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

export default function Reports() {
    const { error } = useNotification();
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [report, setReport] = useState<any>(null);
    const [monthlyData, setMonthlyData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const [fin, monthly] = await Promise.all([
                api.get(`/reports/financial?start_date=${startDate}&end_date=${endDate}`),
                api.get(`/reports/monthly?year=${new Date().getFullYear()}`)
            ]);
            setReport(fin.data);
            setMonthlyData(monthly.data || []);
        } catch {
            error('Gagal mengambil laporan');
        }
        setLoading(false);
    };

    const formatCurrency = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><FileText className="w-6 h-6 text-emerald-500" /> Laporan Keuangan</h1>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex flex-wrap gap-4 items-end">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg" /></div>
                    <button onClick={fetchReport} disabled={loading} className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50">{loading ? 'Loading...' : 'Generate'}</button>
                </div>
            </div>

            {report && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
                        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                            <div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Pendapatan</p><p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(report.total_revenue)}</p></div><div className="p-3 rounded-xl bg-green-100"><DollarSign className="w-6 h-6 text-green-600" /></div></div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                            <div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Modal (HPP)</p><p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(report.total_cogs)}</p></div><div className="p-3 rounded-xl bg-amber-100"><Package className="w-6 h-6 text-amber-600" /></div></div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                            <div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Pengeluaran</p><p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(report.total_expenses)}</p></div><div className="p-3 rounded-xl bg-red-100"><Wallet className="w-6 h-6 text-red-600" /></div></div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                            <div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Laba Kotor</p><p className={`text-2xl font-bold mt-1 ${report.gross_profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(report.gross_profit)}</p></div><div className="p-3 rounded-xl bg-blue-100"><TrendingUp className="w-6 h-6 text-blue-600" /></div></div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                            <div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Laba Bersih</p><p className={`text-2xl font-bold mt-1 ${report.net_profit >= 0 ? 'text-cyan-600' : 'text-red-600'}`}>{formatCurrency(report.net_profit)}</p></div><div className="p-3 rounded-xl bg-cyan-100"><TrendingUp className="w-6 h-6 text-cyan-600" /></div></div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tren Bulanan {new Date().getFullYear()}</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyData.map((d, i) => ({ ...d, name: months[i] }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(v) => `${v / 1000000}jt`} />
                                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" name="Pendapatan" stroke="#10b981" strokeWidth={2} />
                                <Line type="monotone" dataKey="cogs" name="Modal (HPP)" stroke="#f59e0b" strokeWidth={2} />
                                <Line type="monotone" dataKey="expenses" name="Biaya Operasional" stroke="#ef4444" strokeWidth={2} />
                                <Line type="monotone" dataKey="profit" name="Laba Bersih" stroke="#3b82f6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-5">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Perbandingan Bulanan</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyData.map((d, i) => ({ ...d, name: months[i] }))}>
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(v) => `${v / 1000000}jt`} />
                                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                                <Bar dataKey="revenue" name="Pendapatan" fill="#10b981" />
                                <Bar dataKey="expenses" name="Pengeluaran" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    );
}
