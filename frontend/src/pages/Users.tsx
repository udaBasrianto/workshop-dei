import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, X, UserCog } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

export default function Users() {
    const { success, error } = useNotification();
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [form, setForm] = useState<any>({});

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [filterRole, setFilterRole] = useState('');

    const fetchData = () => api.get('/users').then((res) => setUsers(res.data || []));
    useEffect(() => { fetchData(); }, []);

    const filtered = users.filter((u) => {
        const matchesSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = filterRole ? u.role === filterRole : true;
        return matchesSearch && matchesRole;
    });

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(filtered.map(u => u.id));
        else setSelectedIds([]);
    };

    const handleSelect = (id: number) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Hapus ${selectedIds.length} user yang dipilih?`)) return;
        try {
            await Promise.all(selectedIds.map(id => api.delete(`/users/${id}`)));
            fetchData();
            setSelectedIds([]);
            success('Data user berhasil dihapus');
        } catch {
            error('Gagal menghapus beberapa data');
        }
    };

    const openModal = (item?: any) => { setEditItem(item || null); setForm(item ? { ...item, password: '' } : { role: 'kasir' }); setShowModal(true); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editItem) {
                await api.put(`/users/${editItem.id}`, form);
            } else {
                await api.post('/users', form);
            }
            setShowModal(false);
            fetchData();
            success('Data user berhasil disimpan');
        } catch {
            error('Gagal menyimpan');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus user ini?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchData();
            success('User berhasil dihapus');
        } catch {
            error('Gagal menghapus');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><UserCog className="w-6 h-6 text-cyan-500" /> Manajemen User</h1>
                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 hover:bg-red-100"
                        >
                            <Trash2 className="w-5 h-5" /> Hapus ({selectedIds.length})
                        </button>
                    )}
                    <button onClick={() => openModal()} className="px-4 py-2 bg-cyan-500 text-white rounded-lg flex items-center gap-2 hover:bg-cyan-600"><Plus className="w-5 h-5" /> Tambah User</button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Cari user..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg" />
                </div>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                >
                    <option value="">Semua Role</option>
                    <option value="admin">Admin</option>
                    <option value="kasir">Kasir</option>
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
                                    className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                />
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nama</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filtered.map((u) => (
                            <tr key={u.id} className={`hover:bg-gray-50 ${selectedIds.includes(u.id) ? 'bg-cyan-50' : ''}`}>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(u.id)}
                                        onChange={() => handleSelect(u.id)}
                                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                                    />
                                </td>
                                <td className="px-4 py-3 text-gray-800">{u.name}</td>
                                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => openModal(u)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold">{editItem ? 'Edit' : 'Tambah'} User</h2><button onClick={() => setShowModal(false)} className="text-gray-400"><X className="w-5 h-5" /></button></div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama</label><input type="text" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Password {editItem && '(kosongkan jika tidak diubah)'}</label><input type="password" value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} {...(!editItem && { required: true })} className="w-full px-3 py-2 border border-gray-200 rounded-lg" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><select value={form.role || 'kasir'} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg"><option value="kasir">Kasir</option><option value="admin">Admin</option></select></div>
                            <div className="flex gap-3"><button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg">Batal</button><button type="submit" className="flex-1 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600">Simpan</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
