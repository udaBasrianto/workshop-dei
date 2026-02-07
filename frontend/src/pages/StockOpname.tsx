import { useEffect, useState } from 'react';
import { Plus, Check, Trash2, ClipboardList, Search } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

export default function StockOpname() {
    const { success, error } = useNotification();
    const [opnames, setOpnames] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const fetchData = () => {
        api.get('/stock-opnames').then((res) => setOpnames(res.data || []));
        api.get('/products').then((res) => setProducts(res.data || []));
    };
    useEffect(() => { fetchData(); }, []);

    const filtered = opnames.filter((o) => {
        const matchesSearch = o.notes?.toLowerCase().includes(search.toLowerCase()) || o.id.toString().includes(search);
        const matchesStatus = filterStatus ? o.status === filterStatus : true;
        return matchesSearch && matchesStatus;
    });

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(filtered.map(o => o.id));
        else setSelectedIds([]);
    };

    const handleSelect = (id: number) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Hapus ${selectedIds.length} stock opname yang dipilih?`)) return;
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/stock-opnames/${id}`)));
            fetchData();
            setSelectedIds([]);
            success('Stock opname berhasil dihapus');
        } catch {
            error('Gagal menghapus beberapa data');
        }
    };

    const openModal = () => {
        setItems(products.map((p) => ({ product_id: p.id, name: p.name, system_stock: p.production_capacity, actual_stock: p.production_capacity })));
        setShowModal(true);
    };

    const updateActualStock = (productId: number, value: number) => {
        setItems(items.map((i) => i.product_id === productId ? { ...i, actual_stock: value } : i));
    };

    const handleSubmit = async () => {
        try {
            await api.post('/stock-opnames', { date, notes, items: items.map((i) => ({ product_id: i.product_id, actual_stock: i.actual_stock })) });
            setShowModal(false);
            fetchData();
            success('Stock opname berhasil dibuat!');
        } catch {
            error('Gagal membuat stock opname');
        }
    };

    const approveOpname = async (id: number) => {
        if (!confirm('Approve stock opname ini? Stok produk akan diupdate.')) return;
        try {
            await api.post(`/stock-opnames/${id}/approve`);
            fetchData();
            success('Stock opname approved!');
        } catch {
            error('Gagal approve');
        }
    };

    const deleteOpname = async (id: number) => {
        if (!confirm('Hapus stock opname ini?')) return;
        try {
            await api.delete(`/stock-opnames/${id}`);
            fetchData();
            success('Stock opname berhasil dihapus');
        } catch {
            error('Gagal menghapus');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><ClipboardList className="w-6 h-6 text-indigo-500" /> Stock Opname</h1>
                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 hover:bg-red-100"
                        >
                            <Trash2 className="w-5 h-5" /> Hapus ({selectedIds.length})
                        </button>
                    )}
                    <button onClick={openModal} className="px-4 py-2 bg-indigo-500 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-600"><Plus className="w-5 h-5" /> Buat Opname</button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Cari ID atau catatan..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                    <option value="">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
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
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">ID</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tanggal</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Catatan</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Items</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map((o) => (
                            <tr key={o.id} className={`hover:bg-gray-50 ${selectedIds.includes(o.id) ? 'bg-indigo-50' : ''}`}>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(o.id)}
                                        onChange={() => handleSelect(o.id)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </td>
                                <td className="px-4 py-3 text-gray-600">#{o.id}</td>
                                <td className="px-4 py-3 text-gray-800">{o.date?.split('T')[0]}</td>
                                <td className="px-4 py-3 text-gray-600">{o.notes || '-'}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${o.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{o.status}</span></td>
                                <td className="px-4 py-3 text-gray-600">{o.items?.length || 0} produk</td>
                                <td className="px-4 py-3 text-right">
                                    {o.status === 'draft' && <button onClick={() => approveOpname(o.id)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg"><Check className="w-4 h-4" /></button>}
                                    <button onClick={() => deleteOpname(o.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto py-8">
                    <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
                        <h2 className="text-lg font-semibold mb-4">Buat Stock Opname</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label><input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Opname bulanan..." /></div>
                        </div>
                        <table className="w-full text-sm mb-4">
                            <thead><tr className="border-b"><th className="py-2 text-left">Produk</th><th className="py-2 text-right">Stok Sistem</th><th className="py-2 text-right">Stok Aktual</th><th className="py-2 text-right">Selisih</th></tr></thead>
                            <tbody>{items.map((i) => (<tr key={i.product_id} className="border-b"><td className="py-2">{i.name}</td><td className="py-2 text-right">{i.system_stock}</td><td className="py-2 text-right"><input type="number" value={i.actual_stock} onChange={(e) => updateActualStock(i.product_id, Number(e.target.value))} className="w-20 px-2 py-1 border border-gray-200 rounded text-right" /></td><td className={`py-2 text-right font-medium ${i.actual_stock - i.system_stock < 0 ? 'text-red-600' : i.actual_stock - i.system_stock > 0 ? 'text-green-600' : ''}`}>{i.actual_stock - i.system_stock}</td></tr>))}</tbody>
                        </table>
                        <div className="flex gap-3"><button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg">Batal</button><button onClick={handleSubmit} className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Simpan</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
