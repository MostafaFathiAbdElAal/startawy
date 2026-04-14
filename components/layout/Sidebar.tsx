'use client';

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import Image from "next/image";
import {
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  FileText,
  Calendar,
  User,
  MessageCircle,
  LogOut,
  BarChart3,
  Users,
  DollarSign,
  Clock,
  Lightbulb,
  Package,
  UserCheck,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Headset,
} from "lucide-react";

interface SidebarProps {
  userRole?: "FOUNDER" | "CONSULTANT" | "ADMIN";
  userEmail?: string;
}

export function Sidebar({ userRole: rawRole = "FOUNDER", userEmail }: SidebarProps) {
  const userRole = rawRole || "FOUNDER";
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isOwner = userEmail === process.env.NEXT_PUBLIC_OWNER_EMAIL;

  const founderMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: TrendingUp, label: "Budget Analysis", path: "/budget-analysis" },
    { icon: MessageSquare, label: "StartBot", path: "/ai-chatbot" },
    { icon: FileText, label: "Startawy Library", path: "/startawy-library" },
    { icon: Calendar, label: "Book Consultant", path: "/book-consultant" },
    { icon: BarChart3, label: "My Sessions", path: "/my-sessions" },
    { icon: Package, label: "My Startawy Plan", path: "/my-plan" },
    { icon: Receipt, label: "My Payments", path: "/my-payments" },
    { icon: MessageCircle, label: "Feedback", path: "/feedback" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const consultantMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/consultant/dashboard" },
    { icon: Calendar, label: "My Sessions", path: "/consultant/sessions" },
    { icon: Users, label: "My Clients", path: "/consultant/clients" },
    { icon: DollarSign, label: "My Earnings", path: "/consultant/earnings" },
    { icon: Lightbulb, label: "Recommendations", path: "/consultant/recommendations" },
    { icon: FileText, label: "Follow-Up Plans", path: "/consultant/follow-up-plans" },
    { icon: Clock, label: "Availability Schedule", path: "/consultant/availability" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
    { icon: UserCheck, label: "Manage Founders", path: "/admin/founders" },
    { icon: Users, label: "Manage Consultants", path: "/admin/consultants" },
    { icon: FileText, label: "Manage Reports", path: "/admin/reports" },
    { icon: Package, label: "Manage Packages", path: "/admin/packages" },
    { icon: MessageCircle, label: "Review Feedback", path: "/admin/feedback" },
    { icon: Headset, label: "Support Chat", path: "/admin/support" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
    ...(isOwner ? [{ icon: ShieldCheck, label: "Manage Admins", path: "/admin/manage-admins" }] : []),
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const menuItems = [
    ...(userRole?.toUpperCase() === "CONSULTANT" ? consultantMenuItems :
       userRole?.toUpperCase() === "ADMIN" ? adminMenuItems :
       founderMenuItems),
    // If owner, also show ONLY UNIQUE admin items (to avoid duplicates like Profile/Dashboard)
    ...(isOwner && userRole?.toUpperCase() !== "ADMIN" 
      ? adminMenuItems.filter(item => !["Dashboard", "Profile"].includes(item.label))
      : [])
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {isMobileOpen ? <X className="w-6 h-6 text-gray-700 dark:text-gray-200" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-30 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`
          fixed lg:sticky top-0 inset-y-0 left-0 z-40
          transition-[width,transform] duration-300 ease-in-out
          ${isCollapsed ? "w-20" : "w-64"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Desktop Collapse Button - Floating on Edge */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-4 top-10 z-50 items-center justify-center w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all text-gray-600 dark:text-gray-400 group"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 group-hover:text-teal-500 transition-colors" />
          ) : (
            <ChevronLeft className="w-4 h-4 group-hover:text-teal-500 transition-colors" />
          )}
        </button>

        {/* Sidebar Interior */}
        <aside
          className={`
            w-full h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col
            overflow-hidden
          `}
        >
          {/* Logo */}
          <div className={`h-[85px] px-[30px] border-b border-gray-100 dark:border-gray-800/50 flex items-center shrink-0`}>
            <Link href="/dashboard" className="flex items-center gap-3 active:scale-95 transition-transform overflow-hidden">
              <div className="relative w-5 h-5 shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="Startawy Logo" 
                  fill 
                  className="object-contain"
                  priority
                />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold bg-linear-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent whitespace-nowrap animate-in fade-in duration-500 px-1">
                  Startawy
                </span>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <li key={item.path} className="px-3 relative">
                    <Link
                      href={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`
                        flex items-center gap-3 py-3 transition-all duration-500 rounded-2xl group/item relative overflow-hidden
                        ${isCollapsed ? "justify-center px-0" : "px-4"}
                        ${active
                          ? "bg-teal-500/10 dark:bg-teal-400/10 text-teal-600 dark:text-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.2)] border border-teal-500/20 backdrop-blur-md"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-teal-600 dark:hover:text-teal-400"
                        }
                      `}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {/* Interactive Hover Glow */}
                      {!active && (
                        <div className="absolute inset-0 bg-linear-to-r from-teal-500/0 via-teal-500/5 to-teal-500/0 -translate-x-full group-hover/item:translate-x-full transition-transform duration-1000" />
                      )}

                      <div className={`
                        relative flex items-center justify-center transition-all duration-500
                        ${active ? "scale-110 rotate-[5deg]" : "group-hover/item:scale-110 group-hover/item:text-teal-500"}
                      `}>
                        <Icon className={`w-5 h-5 shrink-0 transition-all ${active ? "stroke-[2.5px] drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]" : "stroke-[1.8px]"}`} />
                        
                        {/* Active Indicator Line */}
                        {active && (
                          <div className="absolute -left-3 w-1 h-5 bg-emerald-600 dark:bg-emerald-500 rounded-full animate-in zoom-in slide-in-from-left-2 duration-500 shadow-[2px_0_12px_rgba(16,185,129,0.4)]" />
                        )}
                      </div>

                      {!isCollapsed && (
                        <span className={`
                          font-bold text-[13px] tracking-tight whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-500
                          ${active ? "text-slate-900 dark:text-white" : "group-hover/item:translate-x-1 transition-transform"}
                        `}>
                          {item.label}
                        </span>
                      )}

                      {/* Subtle Active Sheen */}
                      {active && (
                        <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent pointer-events-none" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout - Stay at bottom */}
          <div className="p-0 mt-auto border-t border-gray-200 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900 z-10">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className={`w-full flex items-center gap-3 px-[30px] py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden`}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className={`w-5 h-5 shrink-0 ${isPending ? "animate-pulse" : ""}`} />
              {!isCollapsed && <span className="font-medium whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">{isPending ? "Logging out..." : "Logout"}</span>}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
