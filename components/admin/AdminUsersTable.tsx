"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, Filter, Edit, Trash2, Eye, UserX, UserCheck, ChevronDown, ChevronUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/providers/ToastProvider";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

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
  yearsOfExp?: number;
  sessionRate?: number;
  image?: string;
  businessSector?: string;
  phone?: string;
};

type AdminUsersTableProps = {
  data: UserData[];
  roleType: "Founder" | "Consultant";
};

export function AdminUsersTable({ data, roleType }: AdminUsersTableProps) {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserData[]>(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [contextFilter, setContextFilter] = useState("All");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [previewingUser, setPreviewingUser] = useState<UserData | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [editFormData, setEditFormData] = useState({ 
    name: "", 
    email: "", 
    specialization: "", 
    yearsOfExp: "",
    businessName: "",
    businessSector: "",
    phone: ""
  });
  const filterRef = useRef<HTMLDivElement>(null);

  // Synchronize internal state when props change (initial load)
  useEffect(() => {
    setUsers(data);
  }, [data]);

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    const id = userToDelete.id;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const result = await res.json();
      
      if (result.success) {
        setUsers(users.filter(u => u.id !== id));
        showToast({
          type: "success",
          title: "User Deleted",
          message: `${userToDelete.name} has been permanently removed.`
        });
        setUserToDelete(null);
      } else {
        showToast({
          type: "error",
          title: "Delete Failed",
          message: result.error || "Failed to remove user account."
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to connect to the server for deletion."
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const nextSuspended = currentStatus === "ACTIVE"; // If active, we suspend
    
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSuspended: nextSuspended })
      });
      const result = await res.json();
      
      if (result.success) {
        setUsers(users.map(u => u.id === id ? { 
          ...u, 
          status: nextSuspended ? "SUSPENDED" : "ACTIVE" 
        } : u));
        showToast({
          type: "success",
          title: "Status Updated",
          message: `User account is now ${nextSuspended ? 'Suspended' : 'Active'}.`
        });
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: result.error || "Failed to toggle user status."
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Failed to reach server for status update."
      });
    } finally {
      setProcessingId(null);
    }
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setProcessingId(editingUser.id);

    // Basic Client Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^[0-9]{8,15}$/; // Flexible: 8-15 digits

    if (!editFormData.name.trim() || editFormData.name.length < 3) {
      showToast({ type: "error", title: "Invalid Name", message: "Name must be at least 3 characters." });
      setProcessingId(null);
      return;
    }
    if (!emailRegex.test(editFormData.email)) {
      showToast({ type: "error", title: "Invalid Email", message: "Please enter a valid email address." });
      setProcessingId(null);
      return;
    }
    if (editFormData.phone && !phoneRegex.test(editFormData.phone)) {
      showToast({ type: "error", title: "Invalid Phone", message: "Phone must be 8-15 digits (e.g. 2010...)." });
      setProcessingId(null);
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: editFormData.name, 
          email: editFormData.email,
          phone: editFormData.phone,
          ...(roleType === "Consultant" && {
            specialization: editFormData.specialization,
            yearsOfExp: editFormData.yearsOfExp ? Number(editFormData.yearsOfExp) : undefined
          }),
          ...(roleType === "Founder" && {
            businessName: editFormData.businessName,
            businessSector: editFormData.businessSector
          })
        }),
      });
      const result = await res.json();
      
      if (result.success) {
        setUsers(users.map(u => u.id === editingUser.id ? { 
          ...u, 
          name: editFormData.name, 
          email: editFormData.email,
          phone: editFormData.phone,
          ...(roleType === "Consultant" && {
            specialty: editFormData.specialization,
            yearsOfExp: editFormData.yearsOfExp ? Number(editFormData.yearsOfExp) : undefined
          }),
          ...(roleType === "Founder" && {
            company: editFormData.businessName,
            businessSector: editFormData.businessSector
          })
        } : u));
        showToast({
          type: "success",
          title: "Profile Updated",
          message: "User details have been successfully changed."
        });
        setEditingUser(null);
      } else {
        showToast({
          type: "error",
          title: "Update Failed",
          message: result.error || "Failed to save profile changes."
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network Error",
        message: "Network issues prevented saving changes."
      });
    } finally {
      setProcessingId(null);
    }
  };

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
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      
      const matchesContext = contextFilter === "All" || 
        (roleType === "Founder" ? u.plan === contextFilter : u.specialty === contextFilter);

      return matchesSearch && matchesStatus && matchesContext;
    });
  }, [users, searchTerm, statusFilter, contextFilter, roleType]);

  const uniqueContextValues = useMemo(() => {
    const values = users.map(u => roleType === "Founder" ? u.plan : u.specialty).filter(Boolean) as string[];
    return Array.from(new Set(values));
  }, [users, roleType]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden text-left min-h-[400px]">
      {/* Toolbar */}
      <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="flex flex-col xl:flex-row gap-6 items-center">
          <div className="flex-1 relative w-full group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <input
              type="text"
              placeholder={`Search ${roleType.toLowerCase()}s by name or email...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
          
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center gap-3 px-8 py-3.5 border rounded-2xl transition-all font-bold tracking-tight shrink-0 ${
                showFilterPanel || statusFilter !== "All" || contextFilter !== "All"
                  ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20"
                  : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm"
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {(statusFilter !== "All" || contextFilter !== "All") && (
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
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
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">User Details</th>
              {roleType === "Founder" && <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center border-b border-slate-100 dark:border-slate-800">Subscription</th>}
              {roleType === "Consultant" && <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center border-b border-slate-100 dark:border-slate-800">Specialization</th>}
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center border-b border-slate-100 dark:border-slate-800">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-center border-b border-slate-100 dark:border-slate-800">Member Since</th>
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] text-right border-b border-slate-100 dark:border-slate-800">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {filteredData.map((user) => (
              <tr key={user.id} className="group hover:bg-teal-50/30 dark:hover:bg-teal-500/5 transition-all duration-300">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className={`relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm border-2 border-white dark:border-slate-800 group-hover:border-teal-500/20 transition-colors ${!user.image ? 'bg-slate-100 dark:bg-slate-800' : ''}`}>
                      {user.image ? (
                        <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-teal-600 dark:text-teal-400 font-black">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors uppercase tracking-tight">{user.name}</p>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                
                {roleType === "Founder" && (
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      user.plan === "Premium"
                        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50"
                        : "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800/50"
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                )}
 
                {roleType === "Consultant" && (
                  <td className="px-8 py-5 text-center">
                    <span className="px-4 py-1.5 rounded-xl text-[10px] font-black bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-slate-700/50">
                      {user.specialty || "General"}
                    </span>
                  </td>
                )}
 
                <td className="px-8 py-5 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    user.status === "ACTIVE"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800/50"
                      : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === "ACTIVE" ? 'bg-green-500' : 'bg-rose-500'}`} />
                    {user.status}
                  </span>
                </td>
 
                <td className="px-8 py-5 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{user.joinedDate}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Verified</span>
                  </div>
                </td>

                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      onClick={() => setPreviewingUser(user)}
                      className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl transition-all"
                      title="Edit Profile"
                      onClick={() => {
                        setEditingUser(user);
                        setEditFormData({ 
                          name: user.name, 
                          email: user.email,
                          specialization: user.specialty || "",
                          yearsOfExp: user.yearsOfExp?.toString() || "",
                          businessName: user.company || "",
                          businessSector: user.businessSector || "",
                          phone: user.phone || ""
                        });
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      disabled={processingId === user.id}
                      className={`p-2.5 rounded-xl transition-all ${
                        user.status === "ACTIVE" 
                          ? "text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20" 
                          : "text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      }`}
                      title={user.status === "ACTIVE" ? "Suspend Account" : "Activate Account"}
                    >
                      {processingId === user.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                      ) : user.status === "ACTIVE" ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <UserCheck className="w-4 h-4" />
                      )}
                    </button>
 
                    <button 
                      onClick={() => setUserToDelete(user)}
                      disabled={processingId === user.id}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                      title="Delete Permanently"
                    >
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

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit User Profile</h2>
                <button onClick={() => setEditingUser(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={submitEdit} className="p-6 space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email" required
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone Number</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>

                {roleType === "Founder" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Business Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                        value={editFormData.businessName}
                        onChange={(e) => setEditFormData({ ...editFormData, businessName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Industry / Sector</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                        value={editFormData.businessSector}
                        onChange={(e) => setEditFormData({ ...editFormData, businessSector: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {roleType === "Consultant" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Specialization</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                        value={editFormData.specialization}
                        onChange={(e) => setEditFormData({ ...editFormData, specialization: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Years of Exp</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-900 dark:text-white"
                        value={editFormData.yearsOfExp}
                        onChange={(e) => setEditFormData({ ...editFormData, yearsOfExp: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={processingId === editingUser.id} className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors flex justify-center items-center">
                    {processingId === editingUser.id ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview User Modal */}
      <AnimatePresence>
        {previewingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPreviewingUser(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Profile Details</h2>
                <button onClick={() => setPreviewingUser(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 text-left">
                <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                  <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center font-bold text-2xl shrink-0 overflow-hidden">
                    {previewingUser.image ? (
                      <img src={previewingUser.image} alt={previewingUser.name} className="w-full h-full object-cover" />
                    ) : (
                      previewingUser.name ? previewingUser.name.charAt(0).toUpperCase() : "U"
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{previewingUser.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{previewingUser.email}</p>
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                      previewingUser.status === "ACTIVE"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                    }`}>
                      {previewingUser.status}
                    </span>
                    {previewingUser.phone && (
                      <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                        📞 {previewingUser.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Joined Date</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{previewingUser.joinedDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Platform Role</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{roleType}</p>
                  </div>
                  {roleType === "Founder" && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subscription Plan</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{previewingUser.plan || "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Business Name</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{previewingUser.company || "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Industry / Sector</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{previewingUser.businessSector || "N/A"}</p>
                      </div>
                    </>
                  )}
                  {roleType === "Consultant" && (
                    <>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Specialization</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{previewingUser.specialty || "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Experience</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{previewingUser.yearsOfExp ? `${previewingUser.yearsOfExp} Years` : "N/A"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Session Rate</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">${previewingUser.sessionRate || "150"}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button onClick={() => setPreviewingUser(null)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Confirm User Deletion"
        message={`Are you sure you want to permanently delete ${userToDelete?.name}? This action cannot be undone and all associated data will be lost.`}
        confirmLabel="Delete User"
        cancelLabel="Keep User"
        isProcessing={processingId === userToDelete?.id}
        variant="danger"
      />
    </div>
  );
}
