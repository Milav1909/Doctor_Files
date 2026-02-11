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

    const roleColors: Record<string, string> = {
        patient: 'bg-emerald-500',
        doctor: 'bg-blue-500',
        admin: 'bg-violet-500'
    };

    const roleLightColors: Record<string, string> = {
        patient: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        doctor: 'bg-blue-50 text-blue-700 border-blue-200',
        admin: 'bg-violet-50 text-violet-700 border-violet-200'
    };

    const roleLabels: Record<string, string> = {
        patient: 'Patient',
        doctor: 'Doctor',
        admin: 'Admin'
    };

    return (
        <div className="min-h-screen flex bg-[var(--bg-body)]">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar w-60 fixed md:relative h-screen z-50 md:translate-x-0 transition-transform flex-shrink-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="px-5 py-5 border-b border-[var(--border-color)]">
                        <Link href={`/${role}`} className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${roleColors[role]} flex items-center justify-center shadow-sm`}>
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900 text-sm">Doctor Files</h1>
                                <p className="text-[11px] text-gray-500">{roleLabels[role]} Portal</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-4 overflow-y-auto">
                        <p className="px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Menu</p>
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
                    <div className="p-4 border-t border-[var(--border-color)]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-9 h-9 rounded-full ${roleColors[role]} flex items-center justify-center flex-shrink-0`}>
                                <span className="text-white font-semibold text-sm">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                                <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="w-full py-2 px-3 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
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
            <main className="flex-1 min-h-screen md:ml-0 flex flex-col">
                {/* Top header bar */}
                <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[var(--border-color)]">
                    <div className="flex items-center justify-between px-6 py-3">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 text-gray-500 hover:text-gray-900 rounded-lg md:hidden"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Role badge (desktop) */}
                        <div className="hidden md:flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-medium ${roleLightColors[role]}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${roleColors[role]}`} />
                                {roleLabels[role]} Dashboard
                            </span>
                        </div>

                        {/* Center title on mobile */}
                        <span className="font-semibold text-gray-900 text-sm md:hidden">{roleLabels[role]} Dashboard</span>

                        {/* Right side - user info */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                <p className="text-[11px] text-gray-500">{user?.email}</p>
                            </div>
                            <div className={`w-8 h-8 rounded-full ${roleColors[role]} flex items-center justify-center`}>
                                <span className="text-white font-semibold text-xs">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="p-6 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
