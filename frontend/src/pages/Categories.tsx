import React, { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus, Edit, Trash2, Search, X, Tag } from 'lucide-react';

export default function Categories() {
    const { success, error } = useNotification();
    const [categories, setCategories] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [form, setForm] = useState<any>({});
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const fetchData = () => getCategories().then((res) => setCategories(res.data || []));
    
    useEffect(() => { fetchData(); }, []);

    const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(filtered.map(c => c.id));
        else setSelectedIds([]);
    };

    const handleSelect = (id: number) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Hapus ${selectedIds.length} kategori yang dipilih?`)) return;
        try {
            await Promise.all(selectedIds.map(id => deleteCategory(id)));
            fetchData();
            setSelectedIds([]);
            success('Data kategori berhasil dihapus');
        } catch {
            error('Gagal menghapus beberapa data');
        }
    };

    const openModal = (item?: any) => { 
        setEditItem(item || null); 
        setForm(item || { name: '' }); 
        setShowModal(true); 
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            editItem ? await updateCategory(editItem.id, form) : await createCategory(form);
            setShowModal(false);
            fetchData();
            success('Data kategori berhasil disimpan');
        } catch {
            error('Gagal menyimpan');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus kategori ini?')) return;
        try {
            await deleteCategory(id);
            fetchData();
            success('Kategori berhasil dihapus');
        } catch {
            error('Gagal menghapus');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Tag className="w-6 h-6 text-purple-500" /> Kategori
                </h1>
                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 hover:bg-red-100"
                        >
                            <Trash2 className="w-5 h-5" /> Hapus ({selectedIds.length})
                        </button>
                    )}
                    <button onClick={() => openModal()} className="px-4 py-2 bg-purple-500 text-white rounded-lg flex items-center gap-2 hover:bg-purple-600">
                        <Plus className="w-5 h-5" /> Tambah
                    </button>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Cari kategori..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg" 
                />
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
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nama</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Slug</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                    Belum ada kategori
                                </td>
                            </tr>
                        ) : (
                            filtered.map((c) => (
                                <tr key={c.id} className={`hover:bg-gray-50 ${selectedIds.includes(c.id) ? 'bg-purple-50' : ''}`}>
                                    <td className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(c.id)}
                                            onChange={() => handleSelect(c.id)}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-gray-800 font-medium">{c.name}</td>
                                    <td className="px-4 py-3 text-gray-600">{c.slug}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openModal(c)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                {editItem ? 'Edit' : 'Tambah'} Kategori
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                                <input 
                                    type="text" 
                                    value={form.name} 
                                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                                    required 
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                                    placeholder="Contoh: Makanan, Minuman, Elektronik"
                                />
                            </div>
                            
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)} 
                                    className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
