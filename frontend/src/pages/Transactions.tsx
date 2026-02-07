import { useEffect, useState } from 'react';
import { getTransactions, deleteTransaction } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Trash2, Search, ShoppingCart, Eye } from 'lucide-react';

export default function Transactions() {
    const { success, error } = useNotification();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [viewItem, setViewItem] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [filterMethod, setFilterMethod] = useState('');

    const fetchData = () => getTransactions().then((res) => setTransactions(res.data || []));
    useEffect(() => { fetchData(); }, []);

    const filtered = transactions.filter((t) => {
        const matchesSearch = t.id.toString().includes(search) || t.customer?.name?.toLowerCase().includes(search.toLowerCase());
        const matchesMethod = filterMethod ? t.payment_method === filterMethod : true;
        return matchesSearch && matchesMethod;
    });

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(filtered.map(t => t.id));
        else setSelectedIds([]);
    };

    const handleSelect = (id: number) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Hapus ${selectedIds.length} transaksi yang dipilih? Stok akan dikembalikan.`)) return;
        try {
            await Promise.all(selectedIds.map(id => deleteTransaction(id)));
            fetchData();
            setSelectedIds([]);
            success('Transaksi berhasil dihapus');
        } catch {
            error('Gagal menghapus beberapa data');
        }
    };

    const formatCurrency = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
    const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus transaksi ini? Stok akan dikembalikan.')) return;
        try {
            await deleteTransaction(id);
            fetchData();
            success('Transaksi berhasil dihapus');
        } catch {
            error('Gagal menghapus');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><ShoppingCart className="w-6 h-6 text-green-500" /> Riwayat Transaksi</h1>
                {selectedIds.length > 0 && (
                    <button
                        onClick={handleBulkDelete}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 hover:bg-red-100"
                    >
                        <Trash2 className="w-5 h-5" /> Hapus ({selectedIds.length})
                    </button>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Cari ID atau pelanggan..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <select
                    value={filterMethod}
                    onChange={(e) => setFilterMethod(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                    <option value="">Semua Metode</option>
                    <option value="cash">Tunai</option>
                    <option value="qris">QRIS</option>
                    <option value="transfer">Transfer</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 w-12">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tanggal</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Pelanggan</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Metode</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Total</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map((t) => (
                            <tr key={t.id} className={`hover:bg-gray-50 ${selectedIds.includes(t.id) ? 'bg-green-50' : ''}`}>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(t.id)}
                                        onChange={() => handleSelect(t.id)}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                </td>
                                <td className="px-4 py-3 text-gray-600">#{t.id}</td>
                                <td className="px-4 py-3 text-gray-600">{formatDate(t.created_at)}</td>
                                <td className="px-4 py-3 text-gray-800">{t.customer?.name || '-'}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${t.payment_method === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{t.payment_method}</span></td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatCurrency(t.total_amount)}</td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => setViewItem(t)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {viewItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setViewItem(null)}>
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-semibold mb-4">Detail Transaksi #{viewItem.id}</h2>
                        <div className="space-y-2 mb-4"><p><span className="text-gray-500">Pelanggan:</span> {viewItem.customer?.name || '-'}</p><p><span className="text-gray-500">Metode:</span> {viewItem.payment_method}</p><p><span className="text-gray-500">Catatan:</span> {viewItem.notes || '-'}</p></div>
                        <table className="w-full text-sm"><thead><tr className="border-b"><th className="py-2 text-left">Produk</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Harga</th><th className="py-2 text-right">Subtotal</th></tr></thead><tbody>{viewItem.items?.map((i: any) => (<tr key={i.id} className="border-b"><td className="py-2">{i.product?.name}</td><td className="py-2 text-right">{i.quantity}</td><td className="py-2 text-right">{formatCurrency(i.unit_price)}</td><td className="py-2 text-right">{formatCurrency(i.subtotal)}</td></tr>))}</tbody></table>
                        <div className="mt-4 text-right text-lg font-bold text-blue-600">Total: {formatCurrency(viewItem.total_amount)}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
