'use client';

import { Bell, Search, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import UserAvatar from "@/components/ui/UserAvatar";
import LinkNext from "next/link";

interface TopBarProps {
  userRole?: "FOUNDER" | "CONSULTANT" | "ADMIN";
  userName?: string;
  userEmail?: string;
  isVerified?: boolean;
}

export function TopBar({ userRole: rawRole = "FOUNDER", userName = "User", userEmail, isVerified = true }: TopBarProps) {
  const userRole = rawRole || "FOUNDER";
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const getRoleLabel = (role: string) => {
    const normalizedRole = role?.toUpperCase();
    switch (normalizedRole) {
      case "FOUNDER": return "Startup Founder";
      case "CONSULTANT": return "Financial Consultant";
      case "ADMIN": return "System Admin";
      default: return role;
    }
  };

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
          <LinkNext href="/profile" className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors group">
            <UserAvatar
              name={userName || 'User'}
              size="md"
              isVerified={isVerified}
            />
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 transition-colors">{userName}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</div>
              <div className="text-[10px] uppercase font-bold text-teal-600/70">{getRoleLabel(userRole)}</div>
            </div>
          </LinkNext>
        </div>
      </div>
    </header>
  );
}
