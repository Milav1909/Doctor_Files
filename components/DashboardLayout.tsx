'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from '@/components/ThemeToggle';
import { Building2, LogOut, Menu } from 'lucide-react';

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
        patient: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
        doctor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
        admin: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800'
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
                    className="fixed inset-0 bg-gray-900/30 dark:bg-black/50 backdrop-blur-sm z-40 md:hidden"
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
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-[var(--text-primary)] text-sm">Doctor Files</h1>
                                <p className="text-[11px] text-[var(--text-muted)]">{roleLabels[role]} Portal</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-4 overflow-y-auto">
                        <p className="px-5 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Menu</p>
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
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user?.name}</p>
                                <p className="text-[11px] text-[var(--text-muted)] truncate">{user?.email}</p>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="w-full py-2 px-3 text-sm text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-h-screen md:ml-0 flex flex-col">
                {/* Top header bar */}
                <header className="sticky top-0 z-30 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
                    <div className="flex items-center justify-between px-6 py-3">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg md:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Role badge (desktop) */}
                        <div className="hidden md:flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-medium ${roleLightColors[role]}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${roleColors[role]}`} />
                                {roleLabels[role]} Dashboard
                            </span>
                        </div>

                        {/* Center title on mobile */}
                        <span className="font-semibold text-[var(--text-primary)] text-sm md:hidden">{roleLabels[role]} Dashboard</span>

                        {/* Right side - user info + theme toggle */}
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-medium text-[var(--text-primary)]">{user?.name}</p>
                                <p className="text-[11px] text-[var(--text-muted)]">{user?.email}</p>
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
