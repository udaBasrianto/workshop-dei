import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getSettings } from '../services/api';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Tag,
    Users,
    Wallet,
    Settings,
    LogOut,
    Menu,
    X,
    Layers,
    Hammer,
    Factory,
    ClipboardList,
    UserCog,
    FileText,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/pos', label: 'POS (Kasir)', icon: ShoppingCart },
    { to: '/products', label: 'Produk', icon: Package },
    { to: '/categories', label: 'Kategori', icon: Tag },
    { to: '/materials', label: 'Bahan Baku', icon: Layers },
    { to: '/labors', label: 'Tenaga Kerja', icon: Hammer },
    { to: '/overheads', label: 'Overhead', icon: Factory },
    { to: '/customers', label: 'Pelanggan', icon: Users },
    { to: '/expenses', label: 'Pengeluaran', icon: Wallet },
    { to: '/transactions', label: 'Transaksi', icon: ShoppingCart },
    { to: '/stock-opname', label: 'Stock Opname', icon: ClipboardList },
    { to: '/reports', label: 'Laporan', icon: FileText },
    { to: '/users', label: 'Kelola User', icon: UserCog },
    { to: '/settings', label: 'Pengaturan', icon: Settings },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const { themeColor } = useTheme();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [settings, setSettings] = useState<any>({});

    useEffect(() => {
        getSettings().then((res) => setSettings(res.data || {}));
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getThemeColorClass = (color: string) => {
        const colors: Record<string, string> = {
            'Sky': 'bg-sky-500',
            'Indigo': 'bg-indigo-500',
            'Red': 'bg-red-500',
            'Green': 'bg-green-500',
            'Amber': 'bg-amber-500',
        };
        return colors[color] || 'bg-sky-500';
    };

    // Use themeColor from context
    const themeClass = getThemeColorClass(themeColor);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform lg:translate-x-0 lg:static flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
                    <div className="flex items-center">
                        <div className={`${themeClass} rounded-lg overflow-hidden flex items-center justify-center shadow-lg shadow-blue-500/20`}>
                            {settings.logo_path ? (
                                <img src={settings.logo_path} alt="Logo" className="w-10 h-10 object-contain bg-white" />
                            ) : (
                                <div className="p-2">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                            )}
                        </div>
                        <span className="ml-3 text-xl font-bold text-white tracking-tight">{settings.brand_name || 'DeiStok'}</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? `${themeClass} text-white shadow-lg shadow-blue-500/25`
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className={`w-5 h-5 mr-3 transition-colors ${themeClass.includes('500') ? 'group-hover:text-white' : ''}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Footer - User Info */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm shrink-0">
                    <div className="flex items-center mb-4 p-2 rounded-xl bg-slate-800/40">
                        <div className={`w-10 h-10 ${themeClass} rounded-lg flex items-center justify-center text-white font-bold shadow-inner`}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                            <p className="text-slate-500 text-xs capitalize">{user?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-medium text-sm">Keluar</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <header className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center lg:hidden sticky top-0 z-30 shrink-0">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-500 hover:text-gray-800 p-1">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="ml-4 font-bold text-gray-900">{settings.brand_name || 'DeiStok'}</span>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto overflow-x-hidden min-h-0 relative bg-gray-50/50">
                    <div className="max-w-7xl mx-auto h-full">
                        <Outlet />
                    </div>
                </main>
            </div>

        </div>
    );
}

