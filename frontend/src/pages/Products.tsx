import { useEffect, useState, useRef } from 'react';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, getMaterials, getLabors, getOverheads, createMaterial, createLabor, createOverhead, updateMaterial, updateLabor, updateOverhead, deleteMaterial, deleteLabor, deleteOverhead, uploadImage } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Plus, Edit, Trash2, Search, X, Image, Eye } from 'lucide-react';

interface ProductsProps {
    type?: 'materials' | 'labors' | 'overheads';
}

export default function Products({ type }: ProductsProps) {
    const { success, error } = useNotification();
    const [items, setItems] = useState<any[]>([]);
    const [_categories, setCategories] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [form, setForm] = useState<any>({
        type: 'production',
        product_materials: [],
        product_labors: []
    });
    const [viewItem, setViewItem] = useState<any>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [allMaterials, setAllMaterials] = useState<any[]>([]);
    const [allLabors, setAllLabors] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const title = type === 'materials' ? 'Bahan Baku' : type === 'labors' ? 'Tenaga Kerja' : type === 'overheads' ? 'Overhead' : 'Produk';

    const fetchData = () => {
        if (type === 'materials') getMaterials().then((res) => setItems(res.data || []));
        else if (type === 'labors') getLabors().then((res) => setItems(res.data || []));
        else if (type === 'overheads') getOverheads().then((res) => setItems(res.data || []));
        else {
            getProducts().then((res) => setItems(res.data || []));
            getCategories().then((res) => setCategories(res.data || []));
            getMaterials().then((res) => setAllMaterials(res.data || []));
            getLabors().then((res) => setAllLabors(res.data || []));
        }
    };

    useEffect(() => { fetchData(); }, [type]);

    const calculateHPP = (updatedForm: any) => {
        if (updatedForm.type !== 'production') return updatedForm.buy_price || 0;

        const materialTotal = (updatedForm.product_materials || []).reduce((acc: number, pm: any) => {
            const material = allMaterials.find(m => m.id === pm.material_id);
            return acc + (material?.price || 0) * (pm.quantity || 0);
        }, 0);

        const laborTotal = (updatedForm.product_labors || []).reduce((acc: number, pl: any) => {
            const labor = allLabors.find(l => l.id === pl.labor_id);
            return acc + (labor?.rate || 0) * (pl.hours || 0);
        }, 0);

        return materialTotal + laborTotal;
    };

    const updateCalculatedPrice = (updatedForm: any) => {
        const hpp = calculateHPP(updatedForm);
        const margin = updatedForm.profit_margin || 0;
        const price = hpp + (hpp * (margin / 100));
        setForm({ ...updatedForm, buy_price: hpp, price });
    };

    const filteredItems = items.filter((i) => {
        const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory ? i.category_id === Number(filterCategory) : true;
        return matchesSearch && matchesCategory;
    });

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(filteredItems.map(i => i.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Hapus ${selectedIds.length} item yang dipilih?`)) return;
        try {
            const promises = selectedIds.map(id => {
                if (type === 'materials') return deleteMaterial(id);
                else if (type === 'labors') return deleteLabor(id);
                else if (type === 'overheads') return deleteOverhead(id);
                else return deleteProduct(id);
            });
            await Promise.all(promises);
            fetchData();
            setSelectedIds([]);
            success('Data berhasil dihapus');
        } catch (err) {
            error('Gagal menghapus beberapa data');
        }
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    const openModal = (item?: any) => {
        setEditItem(item || null);
        const baseForm = item ? {
            ...item,
            expired_at: item.expired_at ? item.expired_at.split('T')[0] : '',
            product_materials: item.product_materials || [],
            product_labors: item.product_labors || [],
            images: item.images || []
        } : {
            type: 'production',
            price: 0,
            buy_price: 0,
            profit_margin: 0,
            product_materials: [],
            product_labors: [],
            images: []
        };
        setForm(baseForm);
        setImagePreview(item?.image || null);
        setShowModal(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const uploadPromises = Array.from(files).map(file => uploadImage(file));
            const responses = await Promise.all(uploadPromises);
            const urls = responses.map(res => res.data.url);
            
            const currentImages = form.images || [];
            const newImages = urls.map(url => ({ url }));
            
            // Set main image if not set, or update if it's the first upload
            let mainImage = form.image;
            if (!mainImage && urls.length > 0) {
                mainImage = urls[0];
            }

            const updatedImages = [...currentImages, ...newImages];
            setForm({ 
                ...form, 
                image: mainImage,
                images: updatedImages
            });
            
            // Update preview to show the main image
            setImagePreview(mainImage);
            
            success(`${urls.length} gambar berhasil diunggah`);
        } catch (err) {
            error('Gagal upload gambar');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...(form.images || [])];
        const removed = newImages.splice(index, 1);
        
        // If we removed the main image, update it
        let mainImage = form.image;
        if (removed[0].url === mainImage) {
            mainImage = newImages.length > 0 ? newImages[0].url : '';
        }
        
        setForm({ ...form, images: newImages, image: mainImage });
        setImagePreview(mainImage || null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitForm = { ...form };
            // Ensure IDs are numbers
            if (submitForm.category_id) submitForm.category_id = Number(submitForm.category_id);
            
            // Format expired_at to ISO string if present
            if (submitForm.expired_at) {
                submitForm.expired_at = new Date(submitForm.expired_at).toISOString();
            } else {
                submitForm.expired_at = null;
            }

            if (type === 'materials') {
                editItem ? await updateMaterial(editItem.id, submitForm) : await createMaterial(submitForm);
            } else if (type === 'labors') {
                editItem ? await updateLabor(editItem.id, submitForm) : await createLabor(submitForm);
            } else if (type === 'overheads') {
                editItem ? await updateOverhead(editItem.id, submitForm) : await createOverhead(submitForm);
            } else {
                editItem ? await updateProduct(editItem.id, submitForm) : await createProduct(submitForm);
            }
            setShowModal(false);
            setImagePreview(null);
            fetchData();
            success('Data berhasil disimpan');
        } catch (err) {
            error('Gagal menyimpan data');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus item ini?')) return;
        try {
            if (type === 'materials') await deleteMaterial(id);
            else if (type === 'labors') await deleteLabor(id);
            else if (type === 'overheads') await deleteOverhead(id);
            else await deleteProduct(id);
            fetchData();
            success('Data berhasil dihapus');
        } catch (err) {
            error('Gagal menghapus');
        }
    };

    const addMaterialRow = () => {
        const newMaterials = [...(form.product_materials || []), { material_id: 0, quantity: 0 }];
        setForm({ ...form, product_materials: newMaterials });
    };

    const removeMaterialRow = (index: number) => {
        const newMaterials = form.product_materials.filter((_: any, i: number) => i !== index);
        const updatedForm = { ...form, product_materials: newMaterials };
        updateCalculatedPrice(updatedForm);
    };

    const updateMaterialRow = (index: number, field: string, value: any) => {
        const newMaterials = [...form.product_materials];
        newMaterials[index] = { ...newMaterials[index], [field]: Number(value) };
        const updatedForm = { ...form, product_materials: newMaterials };
        updateCalculatedPrice(updatedForm);
    };

    const addLaborRow = () => {
        const newLabors = [...(form.product_labors || []), { labor_id: 0, hours: 0 }];
        setForm({ ...form, product_labors: newLabors });
    };

    const removeLaborRow = (index: number) => {
        const newLabors = form.product_labors.filter((_: any, i: number) => i !== index);
        const updatedForm = { ...form, product_labors: newLabors };
        updateCalculatedPrice(updatedForm);
    };

    const updateLaborRow = (index: number, field: string, value: any) => {
        const newLabors = [...form.product_labors];
        newLabors[index] = { ...newLabors[index], [field]: Number(value) };
        const updatedForm = { ...form, product_labors: newLabors };
        updateCalculatedPrice(updatedForm);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <div className="flex items-center gap-3">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 hover:bg-red-100"
                        >
                            <Trash2 className="w-5 h-5" /> Hapus ({selectedIds.length})
                        </button>
                    )}
                    <button onClick={() => openModal()} className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600">
                        <Plus className="w-5 h-5" /> Tambah
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                {!type && (
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="">Semua Kategori</option>
                        {_categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 w-12">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={filteredItems.length > 0 && selectedIds.length === filteredItems.length}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </th>
                            {!type && <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Gambar</th>}
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Nama</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">{type === 'labors' ? 'Tarif/Jam' : type === 'overheads' ? 'Biaya' : 'Harga'}</th>
                            {type === 'overheads' && <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Periode</th>}
                            {!type && <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Stok</th>}
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className={`hover:bg-gray-50 ${selectedIds.includes(item.id) ? 'bg-blue-50' : ''}`}>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => handleSelect(item.id)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </td>
                                {!type && (
                                    <td className="px-4 py-3">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-12 h-12 object-cover rounded-lg bg-gray-100"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    target.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center ${item.image ? 'hidden' : ''}`}>
                                            <Image className="w-6 h-6 text-gray-400" />
                                        </div>
                                    </td>
                                )}
                                <td className="px-4 py-3 text-gray-800">{item.name}</td>
                                <td className="px-4 py-3 text-gray-600">{formatCurrency(item.price || item.rate || item.cost || 0)}</td>
                                {type === 'overheads' && <td className="px-4 py-3 text-gray-600"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{item.period_type === 'hourly' ? 'Per Jam' : item.period_type === 'daily' ? 'Per Hari' : 'Per Bulan'}</span></td>}
                                {!type && <td className="px-4 py-3 text-gray-600">{item.production_capacity}</td>}
                                <td className="px-4 py-3 text-right">
                                    <button
                                        onClick={() => {
                                            setViewItem(item);
                                            setActiveImage(item.image);
                                        }}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                                        title="Lihat Detail"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => openModal(item)}
                                        className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
                                        <span className="font-medium capitalize">{viewItem.type}</span>
                                        
                                        <span className="text-gray-500">Barcode</span>
                                        <span className="font-medium">{viewItem.barcode || '-'}</span>
                                        
                                        <span className="text-gray-500">Min. Stok</span>
                                        <span className="font-medium">{viewItem.min_stock} {viewItem.unit}</span>
                                        
                                        <span className="text-gray-500">Kadaluarsa</span>
                                        <span className={`font-medium ${viewItem.expired_at ? 'text-red-600' : ''}`}>
                                            {viewItem.expired_at ? new Date(viewItem.expired_at).toLocaleDateString('id-ID') : '-'}
                                        </span>
                                    </div>
                                </div>

                                {viewItem.type === 'production' && (
                                    <>
                                        <div className="space-y-3">
                                            <h3 className="font-semibold text-gray-800 border-b pb-2">Analisis Keuangan</h3>
                                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                                <span className="text-gray-500">Harga Pokok (HPP)</span>
                                                <span className="font-medium">{formatCurrency(viewItem.buy_price)}</span>
                                                
                                                <span className="text-gray-500">Margin Profit</span>
                                                <span className="font-medium text-green-600">{viewItem.profit_margin}%</span>
                                                
                                                <span className="text-gray-500">Estimasi Profit</span>
                                                <span className="font-medium text-green-600">{formatCurrency(viewItem.price - viewItem.buy_price)} / unit</span>
                                            </div>
                                        </div>

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
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">{editItem ? 'Edit' : 'Tambah'} {title}</h2>
                            <button onClick={() => { setShowModal(false); setImagePreview(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    {/* Image Upload - Only for Products */}
                                    {!type && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Produk</label>
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors"
                                            >
                                                <div className="py-4">
                                                    <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">Klik untuk upload gambar (bisa banyak)</p>
                                                </div>
                                                {uploading && <p className="text-sm text-blue-500 mt-2">Mengupload...</p>}
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleImageUpload}
                                            />
                                            
                                            {/* Image Preview Grid */}
                                            {form.images && form.images.length > 0 && (
                                                <div className="mt-4 grid grid-cols-4 gap-4">
                                                    {form.images.map((img: any, idx: number) => (
                                                        <div key={idx} className="relative group">
                                                            <img 
                                                                src={img.url} 
                                                                alt={`Product ${idx}`} 
                                                                className={`w-full h-24 object-cover rounded-lg border-2 ${form.image === img.url ? 'border-blue-500' : 'border-gray-200'}`}
                                                                onClick={() => {
                                                                    setForm({...form, image: img.url});
                                                                    setImagePreview(img.url);
                                                                }}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeImage(idx);
                                                                }}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                            {form.image === img.url && (
                                                                <span className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs text-center py-1 rounded-b-lg">
                                                                    Utama
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                                        <input type="text" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                                    </div>

                                    {!type && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Merk (Opsional)</label>
                                            <input type="text" value={form.brand || ''} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg" placeholder="Contoh: Indofood, Unilever" />
                                        </div>
                                    )}

                                    {!type && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Produk</label>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => updateCalculatedPrice({ ...form, type: 'production' })}
                                                    className={`flex-1 py-2 rounded-lg border ${form.type === 'production' ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-50 border-gray-200'}`}
                                                >
                                                    Produksi
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateCalculatedPrice({ ...form, type: 'ready' })}
                                                    className={`flex-1 py-2 rounded-lg border ${form.type === 'ready' ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-50 border-gray-200'}`}
                                                >
                                                    Produk Jadi
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{type === 'labors' ? 'Tarif/Jam' : type === 'overheads' ? 'Biaya' : 'Harga Jual'}</label>
                                        <input
                                            type="number"
                                            value={form.price || form.rate || form.cost || ''}
                                            onChange={(e) => {
                                                const price = Number(e.target.value);
                                                const buyPrice = form.buy_price || 0;
                                                const margin = buyPrice > 0 ? ((price - buyPrice) / buyPrice) * 100 : 0;
                                                setForm({
                                                    ...form,
                                                    price,
                                                    profit_margin: parseFloat(margin.toFixed(2)),
                                                    [type === 'labors' ? 'rate' : type === 'overheads' ? 'cost' : 'price']: price
                                                });
                                            }}
                                            required
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    {!type && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">HPP (Modal)</label>
                                                <input
                                                    type="number"
                                                    value={form.buy_price || ''}
                                                    readOnly={form.type === 'production'}
                                                    onChange={(e) => {
                                                        const buyPrice = Number(e.target.value);
                                                        const margin = form.profit_margin || 0;
                                                        const price = buyPrice + (buyPrice * (margin / 100));
                                                        setForm({ ...form, buy_price: buyPrice, price });
                                                    }}
                                                    className={`w-full px-3 py-2 border border-gray-200 rounded-lg outline-none ${form.type === 'production' ? 'bg-gray-100' : 'focus:ring-2 focus:ring-blue-500'}`}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Margin (%)</label>
                                                <input
                                                    type="number"
                                                    value={form.profit_margin || ''}
                                                    onChange={(e) => {
                                                        const margin = Number(e.target.value);
                                                        const buyPrice = form.buy_price || 0;
                                                        const price = buyPrice + (buyPrice * (margin / 100));
                                                        setForm({ ...form, profit_margin: margin, price });
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {form.type === 'production' && !type && (
                                        <>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-semibold text-gray-700">Komposisi Bahan</label>
                                                    <button type="button" onClick={addMaterialRow} className="text-xs text-blue-500 hover:underline">+ Tambah Bahan</button>
                                                </div>
                                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                                    {(form.product_materials || []).map((pm: any, idx: number) => (
                                                        <div key={idx} className="flex gap-2 items-center">
                                                            <select
                                                                value={pm.material_id}
                                                                onChange={(e) => updateMaterialRow(idx, 'material_id', e.target.value)}
                                                                className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                                                            >
                                                                <option value="0">Pilih Bahan</option>
                                                                {allMaterials.map(m => <option key={m.id} value={m.id}>{m.name} ({formatCurrency(m.price)}/{m.unit})</option>)}
                                                            </select>
                                                            <input
                                                                type="number"
                                                                placeholder="Qty"
                                                                value={pm.quantity || ''}
                                                                onChange={(e) => updateMaterialRow(idx, 'quantity', e.target.value)}
                                                                className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                                                            />
                                                            <button type="button" onClick={() => removeMaterialRow(idx)} className="text-red-500"><X className="w-4 h-4" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-semibold text-gray-700">Tenaga Kerja</label>
                                                    <button type="button" onClick={addLaborRow} className="text-xs text-blue-500 hover:underline">+ Tambah Jasa</button>
                                                </div>
                                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                                    {(form.product_labors || []).map((pl: any, idx: number) => (
                                                        <div key={idx} className="flex gap-2 items-center">
                                                            <select
                                                                value={pl.labor_id}
                                                                onChange={(e) => updateLaborRow(idx, 'labor_id', e.target.value)}
                                                                className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                                                            >
                                                                <option value="0">Pilih Jasa</option>
                                                                {allLabors.map(l => <option key={l.id} value={l.id}>{l.name} ({formatCurrency(l.rate)}/jam)</option>)}
                                                            </select>
                                                            <input
                                                                type="number"
                                                                placeholder="Jam"
                                                                value={pl.hours || ''}
                                                                onChange={(e) => updateLaborRow(idx, 'hours', e.target.value)}
                                                                className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                                                            />
                                                            <button type="button" onClick={() => removeLaborRow(idx)} className="text-red-500"><X className="w-4 h-4" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {!type && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                            <select
                                                value={form.category_id || ''}
                                                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                            >
                                                <option value="">Tanpa Kategori</option>
                                                {_categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    {!type && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Stok/Kapasitas Produksi</label>
                                            <input type="number" value={form.production_capacity || ''} onChange={(e) => setForm({ ...form, production_capacity: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                                        </div>
                                    )}

                                    {!type && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kadaluarsa</label>
                                            <input type="date" value={form.expired_at || ''} onChange={(e) => setForm({ ...form, expired_at: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => { setShowModal(false); setImagePreview(null); }} className="flex-1 py-2.5 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
                                <button type="submit" disabled={uploading} className="flex-1 py-2.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50">
                                    {uploading ? 'Mengupload...' : 'Simpan Data'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
