import { useEffect, useState } from 'react';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus, Edit, Trash2, Search, X, Wallet } from 'lucide-react';

export default function Expenses() {
    const { success, error } = useNotification();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [form, setForm] = useState<any>({});

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [filterCategory, setFilterCategory] = useState('');

    const fetchData = () => getExpenses().then((res) => setExpenses(res.data || []));
    useEffect(() => { fetchData(); }, []);

    const uniqueCategories = Array.from(new Set(expenses.map(e => e.category).filter(Boolean)));

    const filtered = expenses.filter((e) => {
        const matchesSearch = e.description?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory ? e.category === filterCategory : true;
        return matchesSearch && matchesCategory;
    });

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(filtered.map(e => e.id));
        else setSelectedIds([]);
    };

    const handleSelect = (id: number) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Hapus ${selectedIds.length} pengeluaran yang dipilih?`)) return;
        try {
            await Promise.all(selectedIds.map(id => deleteExpense(id)));
            fetchData();
            setSelectedIds([]);
            success('Data pengeluaran berhasil dihapus');
        } catch {
            error('Gagal menghapus beberapa data');
        }
    };

    const formatCurrency = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
    const total = filtered.reduce((sum, e) => sum + (e.amount || 0), 0);

    const openModal = (item?: any) => { setEditItem(item || null); setForm(item || { date: new Date().toISOString().split('T')[0] }); setShowModal(true); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            editItem ? await updateExpense(editItem.id, form) : await createExpense(form);
            setShowModal(false);
            fetchData();
            success('Pengeluaran berhasil disimpan');
        } catch {
            error('Gagal menyimpan');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus pengeluaran ini?')) return;
        try {
            await deleteExpense(id);
            fetchData();
            success('Pengeluaran berhasil dihapus');
        } catch {
            error('Gagal menghapus');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Wallet className="w-6 h-6 text-red-500" /> Pengeluaran</h1>
                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 hover:bg-red-100"
                        >
                            <Trash2 className="w-5 h-5" /> Hapus ({selectedIds.length})
                        </button>
                    )}
                    <button onClick={() => openModal()} className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2 hover:bg-red-600"><Plus className="w-5 h-5" /> Tambah</button>
                </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-red-800">Total Pengeluaran: <span className="font-bold">{formatCurrency(total)}</span></p></div>
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Cari pengeluaran..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                    <option value="">Semua Kategori</option>
                    {uniqueCategories.map((c: any) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
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
                                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Tanggal</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Deskripsi</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Kategori</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Jumlah</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map((e) => (
                            <tr key={e.id} className={`hover:bg-gray-50 ${selectedIds.includes(e.id) ? 'bg-red-50' : ''}`}>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(e.id)}
                                        onChange={() => handleSelect(e.id)}
                                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                </td>
                                <td className="px-4 py-3 text-gray-600">{e.date?.split('T')[0]}</td>
                                <td className="px-4 py-3 text-gray-800">{e.description}</td>
                                <td className="px-4 py-3 text-gray-600">{e.category || '-'}</td>
                                <td className="px-4 py-3 text-right text-red-600 font-semibold">{formatCurrency(e.amount)}</td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => openModal(e)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(e.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">{editItem ? 'Edit' : 'Tambah'} Pengeluaran</h2><button onClick={() => setShowModal(false)} className="text-gray-400"><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label><input type="date" value={form.date?.split('T')[0] || ''} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label><input type="text" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label><input type="text" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Operasional, Utilitas, dll" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label><input type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                            <div className="flex gap-3"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg">Batal</button><button type="submit" className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Simpan</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
