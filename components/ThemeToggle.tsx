'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 w-9 h-9" aria-label="Toggle theme" />
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all duration-300 group"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 group-hover:rotate-45" />
            ) : (
                <Moon className="w-5 h-5 text-slate-600 transition-transform duration-300 group-hover:-rotate-12" />
            )}
        </button>
    );
}
