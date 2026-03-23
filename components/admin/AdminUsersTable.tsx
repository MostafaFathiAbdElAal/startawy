"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Filter, Edit, Trash2, Eye, UserX, UserCheck, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type UserData = {
  id: number;
  name: string;
  email: string;
  company?: string;
  specialty?: string;
  plan?: string;
  status: string;
  joinedDate: string;
  sessions?: number;
  revenue?: string;
  rating?: number;
};

type AdminUsersTableProps = {
  data: UserData[];
  roleType: "Founder" | "Consultant";
};

export function AdminUsersTable({ data, roleType }: AdminUsersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [contextFilter, setContextFilter] = useState("All");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterPanel(false);
      }
    }
    if (showFilterPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterPanel]);

  const filteredData = useMemo(() => {
    return data.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      
      const matchesContext = contextFilter === "All" || 
        (roleType === "Founder" ? u.plan === contextFilter : u.specialty === contextFilter);

      return matchesSearch && matchesStatus && matchesContext;
    });
  }, [data, searchTerm, statusFilter, contextFilter, roleType]);

  const uniqueContextValues = useMemo(() => {
    const values = data.map(u => roleType === "Founder" ? u.plan : u.specialty).filter(Boolean) as string[];
    return Array.from(new Set(values));
  }, [data, roleType]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden text-left min-h-[400px]">
      {/* Toolbar */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${roleType.toLowerCase()}s by name or email...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 dark:text-white outline-none"
            />
          </div>
          
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center gap-2 px-6 py-3 border rounded-lg transition-all font-medium shrink-0 ${
                showFilterPanel || statusFilter !== "All" || contextFilter !== "All"
                  ? "bg-teal-50 dark:bg-teal-900/20 border-teal-500 text-teal-600 dark:text-teal-400"
                  : "border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {(statusFilter !== "All" || contextFilter !== "All") && (
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
              )}
              {showFilterPanel ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
            </button>

            <AnimatePresence>
              {showFilterPanel && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 z-50 p-6 origin-top-right"
                >
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Account Status</label>
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm text-gray-900 dark:text-white outline-none cursor-pointer"
                      >
                        <option value="All">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING">Pending</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                        {roleType === "Founder" ? "Subscription Plan" : "Consultant Specialty"}
                      </label>
                      <select 
                        value={contextFilter}
                        onChange={(e) => setContextFilter(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm text-gray-900 dark:text-white outline-none cursor-pointer"
                      >
                        <option value="All">All {roleType === "Founder" ? "Plans" : "Specialties"}</option>
                        {uniqueContextValues.map(val => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                      <button 
                        onClick={() => {
                          setStatusFilter("All");
                          setContextFilter("All");
                        }}
                        className="text-xs text-gray-500 hover:text-red-500 font-medium transition-colors"
                      >
                        Clear Filters
                      </button>
                      <button 
                        onClick={() => setShowFilterPanel(false)}
                        className="px-4 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold hover:bg-teal-600 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
              {roleType === "Founder" && <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>}
              {roleType === "Consultant" && <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Specialty</th>}
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
            {filteredData.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex flex-col items-center justify-center font-bold text-sm shrink-0">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                
                {roleType === "Founder" && (
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.plan === "Premium"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                        : "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400"
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                )}

                {roleType === "Consultant" && (
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {user.specialty || "General"}
                  </td>
                )}

                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                    user.status === "ACTIVE"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}>
                    {user.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {user.joinedDate}
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    {user.status === "ACTIVE" ? (
                      <button className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors" title="Suspend User">
                        <UserX className="w-4 h-4" />
                      </button>
                    ) : (
                      <button className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Activate User">
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  No {roleType.toLowerCase()}s found matching &quot;{searchTerm}&quot;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
