import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { getSettings, login as apiLogin } from '../services/api';
import { Loader2, Package } from 'lucide-react';

export default function Login() {
    const { success, error: toastError } = useNotification();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [brandName, setBrandName] = useState('DeiStok');
    const [logoPath, setLogoPath] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        getSettings()
            .then((res) => {
                setBrandName(res.data?.brand_name || 'DeiStok');
                setLogoPath(res.data?.logo_path || null);
            })
            .catch(() => {
            });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await apiLogin(email, password);
            login(res.data.token, res.data.user);
            success(`Selamat datang kembali, ${res.data.user.name}!`);
            navigate('/');
        } catch (err: any) {
            toastError(err.response?.data?.error || 'Login gagal, periksa kembali email dan password Anda');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
                    <div className="flex items-center justify-center mb-8">
                        <div className="bg-blue-500 p-3 rounded-xl overflow-hidden flex items-center justify-center">
                            {logoPath ? (
                                <img src={logoPath} alt="Logo" className="w-8 h-8 object-contain bg-white rounded" />
                            ) : (
                                <Package className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-white ml-3">{brandName}</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="admin@deistok.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
