'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
    children: ReactNode;
    role: 'patient' | 'doctor' | 'admin';
    navItems: { href: string; label: string; icon: ReactNode }[];
}

export default function DashboardLayout({ children, role, navItems }: DashboardLayoutProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const roleColors = {
        patient: 'from-emerald-500 to-teal-500',
        doctor: 'from-sky-500 to-blue-500',
        admin: 'from-violet-500 to-purple-500'
    };

    return (
        <div className="min-h-screen flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar w-64 fixed md:relative h-screen z-50 md:translate-x-0 transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-slate-800">
                        <Link href={`/${role}`} className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center shadow-lg`}>
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="font-bold text-white">Doctor Files</h1>
                                <p className="text-xs text-slate-400 capitalize">{role} Portal</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-6 overflow-y-auto">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User info */}
                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColors[role]} flex items-center justify-center`}>
                                <span className="text-white font-semibold">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${roleColors[user?.role || role]} text-white font-medium capitalize`}>
                                        {user?.role || role}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="w-full py-2.5 px-4 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-h-screen md:ml-0">
                {/* Mobile header */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 glass-card rounded-none">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-slate-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <span className="font-semibold text-white capitalize">{role} Dashboard</span>
                    <div className="w-8" />
                </header>

                {/* Page content */}
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
