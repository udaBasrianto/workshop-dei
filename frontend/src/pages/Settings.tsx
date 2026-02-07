import { useEffect, useState, useRef } from 'react';
import { getSettings, updateSettings, uploadImage } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { Settings as SettingsIcon, Save, Loader2, Upload, Image as ImageIcon } from 'lucide-react';

export default function Settings() {
    const { refreshSettings } = useTheme();
    const { success, error } = useNotification();
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        getSettings().then((res) => {
            setSettings(res.data || {});
            setLogoPreview(res.data?.logo_path || null);
        });
    }, []);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        // Upload to server
        setUploading(true);
        try {
            const res = await uploadImage(file, 'settings');
            setSettings({ ...settings, logo_path: res.data.url });
            success('Logo berhasil diunggah');
        } catch (err) {
            error('Gagal upload logo');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateSettings(settings);
            // Call refreshSettings to update the theme globally
            await refreshSettings();
            success('Pengaturan berhasil disimpan!');
        } catch {
            error('Gagal menyimpan');
        } finally {
            setLoading(false);
        }
    };

    const colors = ['Sky', 'Indigo', 'Red', 'Green', 'Amber'];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <SettingsIcon className="w-6 h-6 text-gray-500" /> Pengaturan Toko
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Logo Section */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
                        <label className="block text-sm font-medium text-gray-700 mb-4">Logo Toko</label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative group cursor-pointer"
                        >
                            {logoPreview ? (
                                <div className="relative w-32 h-32 mx-auto">
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain rounded-lg border border-gray-100" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white text-xs">
                                        Ganti Logo
                                    </div>
                                </div>
                            ) : (
                                <div className="w-32 h-32 mx-auto bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center group-hover:border-blue-400 transition-colors">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-xs text-gray-500 text-center px-2">Klik untuk upload logo</span>
                                </div>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                </div>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                        />
                        <p className="mt-4 text-xs text-gray-400 leading-relaxed">
                            Rekomendasi ukuran 512x512px.<br />Format PNG, JPG, atau WEBP.
                        </p>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <h3 className="text-sm font-semibold text-blue-800 mb-1 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" /> Tips Branding
                        </h3>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            Gunakan nama toko yang unik dan logo yang kontras untuk memperkuat identitas brand Anda di struk dan dashboard.
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="md:col-span-2 bg-white rounded-xl border border-gray-100 p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko / Brand</label>
                            <input
                                type="text"
                                value={settings.brand_name || ''}
                                onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                                placeholder="Contoh: Toko Berkah Jaya"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon / WhatsApp</label>
                            <input
                                type="text"
                                value={settings.store_phone || ''}
                                onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                                placeholder="0812xxxx"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Aksen Warna Tema</label>
                            <select
                                value={settings.theme_color || 'Sky'}
                                onChange={(e) => setSettings({ ...settings, theme_color: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {colors.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap Toko</label>
                            <textarea
                                value={settings.store_address || ''}
                                onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                                rows={2}
                                placeholder="Jl. Raya Utama No. 123..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pesan Footer Struk</label>
                            <textarea
                                value={settings.receipt_footer || ''}
                                onChange={(e) => setSettings({ ...settings, receipt_footer: e.target.value })}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Terima kasih sudah berbelanja! Barang yang sudah dibeli tidak dapat ditukar."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Simpan Semua Pengaturan</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
