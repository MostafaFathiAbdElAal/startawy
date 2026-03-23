'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
        if (typeof window !== 'undefined') {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
    }, []);

    const toggleTheme = () => {
        const nextDark = !isDarkMode;
        setIsDarkMode(nextDark);
        if (nextDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    if (!mounted) {
        return (
            <button
                type="button"
                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 transition-colors shadow-sm"
                title="Toggle Theme"
            >
                <Moon className="w-5 h-5 opacity-0" />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors shadow-sm"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
    );
}
