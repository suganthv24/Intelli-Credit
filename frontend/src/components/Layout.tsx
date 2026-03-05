import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard, Upload, Search, FileText,
    Brain, Bell, User, Home, GitBranch, MessageSquare,
} from 'lucide-react';
import { useCreditData } from '../hooks/useCreditData';

const navItems = [
    { to: '/client', icon: Home, label: 'Home' },
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/ingestor', icon: Upload, label: 'Data Ingestor' },
    { to: '/risk-intel', icon: Search, label: 'Risk Intel' },
    { to: '/pipeline', icon: GitBranch, label: 'Pipeline' },
    { to: '/cam-preview', icon: FileText, label: 'Reports' },
];

export const Layout: React.FC = () => {
    const { data } = useCreditData();
    const companyName = data?.borrower_details.name ?? '—';
    const gstin = data?.borrower_details.gstin ?? '—';

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[72px] flex flex-col items-center py-6 bg-navy-900/80 backdrop-blur-xl border-r border-white/[0.06] shrink-0">
                <div className="mb-8 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
                    <Brain className="w-5 h-5 text-white" />
                </div>

                <nav className="flex flex-col items-center gap-2 flex-1">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-white/10 text-emerald-400 shadow-lg shadow-emerald-500/10'
                                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5" />
                            <span className="absolute left-full ml-3 px-2.5 py-1 rounded-md bg-navy-800 border border-white/10 text-xs text-white whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl">
                                {label}
                            </span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-700 to-navy-600 flex items-center justify-center text-xs font-semibold text-slate-300 border border-white/10">
                        CM
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-14 flex items-center justify-between px-6 bg-navy-900/60 backdrop-blur-xl border-b border-white/[0.06] shrink-0">
                    <div className="flex items-center gap-3">
                        <h1 className="text-sm font-bold tracking-wide">
                            <span className="gradient-text">Intelli-Credit</span>
                        </h1>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                            AI Engine v2.4
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs text-slate-300">{companyName}</span>
                            <span className="text-[10px] text-slate-500">|</span>
                            <span className="text-[10px] text-slate-500">{gstin}</span>
                        </div>

                        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors">
                            <MessageSquare className="w-4 h-4" />
                        </button>

                        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-alert-500 border border-navy-900" />
                        </button>

                        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
                                <User className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="hidden md:block text-xs text-slate-300">Credit Officer</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
