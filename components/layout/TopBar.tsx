'use client';

import Link from "next/link";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

interface TopBarProps {
  userRole?: "FOUNDER" | "CONSULTANT" | "ADMIN";
  userName?: string;
  userEmail?: string;
  isVerified?: boolean;
}

export function TopBar({ userRole = "FOUNDER", userName = "User", userEmail, isVerified = true }: TopBarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "FOUNDER": return "Startup Founder";
      case "CONSULTANT": return "Financial Consultant";
      case "ADMIN": return "System Admin";
      default: return role;
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-teal-500 to-teal-600",
      "from-blue-500 to-blue-600",
      "from-indigo-500 to-indigo-600",
      "from-purple-500 to-purple-600",
      "from-emerald-500 to-emerald-600",
      "from-cyan-500 to-cyan-600",
      "from-sky-500 to-sky-600",
      "from-violet-500 to-violet-600",
    ];

    // Simple hash function to consistently pick a color based on name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : "U";

  const avatarGradient = getAvatarColor(userName || "User");

  return (
    <header className="h-[85px] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-[30px] transition-colors sticky top-0 z-30 overflow-hidden">
      <div className="flex items-center justify-between h-full">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl hidden md:block group">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-teal-500">
              <Search className="h-4 w-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50/50 dark:bg-gray-800/50 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 hover:bg-white dark:hover:bg-gray-800 outline-hidden hover:border-gray-300 dark:hover:border-gray-600"
              placeholder="Search for anything..."
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={mounted && resolvedTheme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {mounted && resolvedTheme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <Link href="/profile" className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors group">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 transition-colors">{userName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</div>
              <div className="text-[10px] uppercase font-bold text-teal-600/70">{getRoleLabel(userRole)}</div>
            </div>
            <div className="relative">
              <div className={`w-10 h-10 bg-linear-to-br ${avatarGradient} rounded-full flex items-center justify-center text-white font-semibold shadow-md transition-transform group-active:scale-95`}>
                {initials}
              </div>
              {!isVerified && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 border-2 border-white dark:border-gray-900 rounded-full shadow-sm" title="Verification Required"></span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
