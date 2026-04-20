'use client';

import { useState, useEffect } from 'react';
import { UserWithRelations } from '@/lib/types/user';
import { Mail, Phone, ShieldCheck, CheckCircle2, Loader2, AlertCircle, Lock, Smartphone, ChevronRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { sendVerificationOTP, verifyPhone } from '@/app/actions/auth';
import OTPInput from '@/components/ui/OTPInput';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/lib/hooks/useSocket';
import { useToast } from '@/components/providers/ToastProvider';

interface SecurityActionsProps {
  user: UserWithRelations;
}

interface WhatsAppMessage {
  from: string;
  body: string;
  timestamp: string;
}

export default function SecurityActions({ user: initialUser }: SecurityActionsProps) {
  const router = useRouter();
  const { socket, botStatus, otpEvent } = useSocket(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001');
  const { showToast } = useToast();
  const [user, setUser] = useState(initialUser);
  const [showOtpView, setShowOtpView] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', next: '', confirm: '' });
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  // Loading State
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePass, setDeletePass] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Visibility States
  const [showPass, setShowPass] = useState(false);
  const [showPassNew, setShowPassNew] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showDeletePass, setShowDeletePass] = useState(false);

  // Progressive transition effect
  useEffect(() => {
    setIsSwitching(true);
    const timer = setTimeout(() => setIsSwitching(false), 600);
    return () => clearTimeout(timer);
  }, [showPasswordModal, showDeleteModal, showOtpView]);

  const [val, setVal] = useState({
    length: false,
    upper: false,
    lower: false,
    special: false
  });

  useEffect(() => {
    const p = passForm.next;
    setVal({
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      special: /[\d@$!%*?&]/.test(p)
    });
  }, [passForm.next]);

  const isPassValid = Object.values(val).every(Boolean);

  // Sync state with props when server data changes
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // Listen for incoming bot messages
  useEffect(() => {
    if (socket) {
      socket.on('bot_message', (data: WhatsAppMessage) => {
        setMessages(prev => [data, ...prev].slice(0, 10)); // Keep last 10
      });
    }
  }, [socket]);

  const handleStartPhoneVerification = async () => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await sendVerificationOTP();
      if (res.success) {
        setShowOtpView(true);
      } else {
        setOtpError(res.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('[CLIENT] Request failed:', err);
      setOtpError('Request failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      const res = await verifyPhone(otpValue);
      if (res.success) {
        // Show Toast immediately — visible even after the OTP view closes
        showToast({
          type: 'success',
          title: 'Phone Verified',
          message: 'Your phone number has been verified successfully.',
        });
        setSuccess('Phone number verified successfully!');
        setUser({ ...user, isPhoneVerified: true });
        setShowOtpView(false);
        router.refresh();
      } else {
        const errMsg = res.error || 'Invalid verification code. Please try again.';
        setOtpError(errMsg);
        showToast({ type: 'error', title: 'Verification Failed', message: errMsg });
      }
    } catch (err) {
      console.error('[CLIENT] Verification failed:', err);
      const errMsg = 'Verification failed. Please try again.';
      setOtpError(errMsg);
      showToast({ type: 'error', title: 'Verification Failed', message: errMsg });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassError(null);
    if (!isPassValid) {
      setPassError("Password does not meet requirements");
      setPassLoading(false);
      return;
    }
    if (passForm.next !== passForm.confirm) {
      setPassError("Passwords do not match");
      setPassLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passForm.current,
          newPassword: passForm.next
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast({ type: 'success', title: 'Password Updated', message: 'Your password has been changed successfully.' });
        setSuccess('Password updated successfully!');
        setShowPasswordModal(false);
        setPassForm({ current: '', next: '', confirm: '' });
      } else {
        const errMsg = data.error || 'Failed to update password.';
        setPassError(errMsg);
        showToast({ type: 'error', title: 'Update Failed', message: errMsg });
      }
    } catch (err) {
      console.error('Password change error:', err);
      setPassError('An error occurred. Please try again.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      setTimeout(() => setIsConfirmingDelete(false), 4000);
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePass })
      });
      const data = await res.json();
      if (data.success) {
        showToast({ type: 'warning', title: 'Account Deleted', message: 'Your account has been permanently deleted. Redirecting...' });
        setSuccess('Account deleted successfully. Redirecting...');
        setTimeout(() => {
          router.push('/login');
          router.refresh();
        }, 2000);
      } else {
        const errMsg = data.error || 'Failed to delete account.';
        setDeleteError(errMsg);
        showToast({ type: 'error', title: 'Deletion Failed', message: errMsg });
      }
    } catch {
      setDeleteError('An error occurred. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">

      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl rounded-full" />

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-500" />
        Security & Verification
      </h3>

      {success && (
        <div className="mb-6 p-4 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-xl text-sm font-bold border border-teal-200 dark:border-teal-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-time Bot Status Indicator */}
        {!!botStatus && !user.isPhoneVerified && (
          <div className="md:col-span-2 mb-2">
            <div className={`flex items-center gap-3 p-4 rounded-2xl border transition-all duration-500 ${botStatus.ready
                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                : 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30'
              }`}>
              <div className={`w-3 h-3 rounded-full ${botStatus.ready ? 'bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-amber-500'}`} />
              <div className="flex-1">
                <p className={`text-[11px] font-black uppercase tracking-widest ${botStatus.ready ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {botStatus.ready ? 'WhatsApp System Online' : 'WhatsApp System Reconnecting...'}
                </p>
                <p className="text-[9px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {botStatus.ready ? 'Ready to deliver your secure verification codes instantly.' : 'Service temporarily unavailable. We are working on it.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Email Identification Card */}
        <div className={`p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-[28px] border border-slate-100 dark:border-slate-800/50 flex flex-col h-full hover:border-teal-500/20 transition-all group ${user.isEmailVerified ? 'border-emerald-500/20' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${user.isEmailVerified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <Mail className="w-6 h-6" />
            </div>
            {user.isEmailVerified && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          </div>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Email Identification</span>
          <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {user.email}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 mt-2 font-medium leading-relaxed">
            {user.isEmailVerified ? 'Your primary email is verified and secure' : 'Link your account to verify your identity'}
          </p>
          {user.isEmailVerified ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest mt-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span> Identity Validated
            </div>
          ) : (
            <div className="mt-auto">
              <GoogleLoginButton mode="login" />
            </div>
          )}
        </div>

        {/* Phone Verification Card */}
        <div className={`p-6 bg-slate-50/50 dark:bg-slate-800/20 rounded-[28px] border border-slate-100 dark:border-slate-800/50 flex flex-col h-full hover:border-teal-500/20 transition-all group overflow-hidden relative ${user.isPhoneVerified ? 'border-emerald-500/20' : ''}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${user.isPhoneVerified ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <Phone className="w-6 h-6" />
            </div>
            {user.isPhoneVerified && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Phone Number</span>
            {!user.isPhoneVerified && (
              <button
                onClick={() => router.push('?edit=true')}
                className="text-[10px] font-bold text-teal-500 hover:text-teal-600 underline uppercase tracking-tighter"
              >
                Change
              </button>
            )}
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
            {user.phone || 'No phone linked'}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-6 mt-2 font-medium leading-relaxed">
            {user.isPhoneVerified ? 'WhatsApp identification number verified' : 'Verify your number via WhatsApp OTP message'}
          </p>
          {user.isPhoneVerified ? (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest mt-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span> Verified Securely
            </div>
          ) : (
            <div className="mt-auto">
              <button
                onClick={handleStartPhoneVerification}
                disabled={otpLoading}
                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Verification'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 relative">
        <AnimatePresence>
          {isSwitching && (
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute top-0 left-0 h-1 bg-teal-500 z-20"
            />
          )}
        </AnimatePresence>

        <div className="min-h-[400px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {isInitialLoading ? (
              <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 animate-pulse">
                <div className="h-7 w-40 bg-slate-100 dark:bg-slate-800 rounded-lg mb-6" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-full flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
                        <div className="h-3 w-48 bg-slate-100 dark:bg-slate-800 rounded" />
                      </div>
                    </div>
                    <div className="w-4 h-4 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  </div>
                ))}
              </motion.div>
            ) : showPasswordModal ? (
              <motion.div key="password-form" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} transition={{ duration: 0.4 }} className="max-w-md mx-auto">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => { setShowPasswordModal(false); setPassError(null); }} className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-teal-500/50 group transition-all">
                    <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-teal-500" />
                  </button>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h3>
                </div>
                {passError && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold border border-red-100 dark:border-red-900/30">{passError}</div>}
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="relative">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                    <input type={showPass ? "text" : "password"} required autoComplete="new-password" value={passForm.current} onChange={(e) => setPassForm({ ...passForm, current: e.target.value })} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-teal-500/50 transition-all text-sm font-medium dark:text-white" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 bottom-4 p-1 text-slate-400 hover:text-teal-500">{showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
                    <input type={showPassNew ? "text" : "password"} required minLength={8} autoComplete="new-password" value={passForm.next} onChange={(e) => setPassForm({ ...passForm, next: e.target.value })} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-teal-500/50 transition-all text-sm font-medium dark:text-white" placeholder="Write your new password" />
                    <button type="button" onClick={() => setShowPassNew(!showPassNew)} className="absolute right-4 bottom-4 p-1 text-slate-400 hover:text-teal-500">{showPassNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    <div className="mt-4 grid grid-cols-2 gap-3 px-1">
                      {[{ key: 'length', label: '8+ Characters' }, { key: 'upper', label: 'Upper Case' }, { key: 'lower', label: 'Lower Case' }, { key: 'special', label: 'Number/Special' }].map((item) => (
                        <div key={item.key} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${val[item.key as keyof typeof val] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-tight ${val[item.key as keyof typeof val] ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-600'}`}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm New Password</label>
                    <input type={showConfirmPass ? "text" : "password"} required autoComplete="new-password" value={passForm.confirm} onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-teal-500/50 transition-all text-sm font-medium dark:text-white" placeholder="Repeat your new password" />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 bottom-4 p-1 text-slate-400 hover:text-teal-500">{showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  <button type="submit" disabled={passLoading || !isPassValid || passForm.next !== passForm.confirm} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[20px] font-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-3">
                    {passLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
                  </button>
                </form>
              </motion.div>
            ) : showDeleteModal ? (
              <motion.div key="delete-form" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} transition={{ duration: 0.4 }} className="max-w-md mx-auto">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => { setShowDeleteModal(false); setDeleteError(null); }} className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-red-500/50 group transition-all">
                    <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-red-500" />
                  </button>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Account</h3>
                </div>
                <div className="mb-8 p-5 bg-red-50 dark:bg-red-900/20 rounded-[24px] border border-red-100 dark:border-red-900/30 flex gap-4">
                  <div className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center shrink-0"><AlertCircle className="w-6 h-6" /></div>
                  <div><h4 className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">Fatal Action</h4><p className="text-[11px] font-medium text-red-500/80 leading-relaxed">This will permanently delete your profile, projects, and all data. Irreversible.</p></div>
                </div>
                {deleteError && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold border border-red-100">{deleteError}</div>}
                <form onSubmit={handleDeleteAccount} className="space-y-6">
                  <div className="relative">
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Confirm with Password</label>
                    <input type={showDeletePass ? "text" : "password"} required autoComplete="new-password" value={deletePass} onChange={(e) => setDeletePass(e.target.value)} className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-red-500/50 transition-all text-sm font-medium dark:text-white" placeholder="Enter password to confirm" />
                    <button type="button" onClick={() => setShowDeletePass(!showDeletePass)} className="absolute right-4 bottom-4 p-1 text-slate-400 hover:text-red-500">{showDeletePass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                  <button type="submit" disabled={deleteLoading || !deletePass} className={`w-full py-4 rounded-[20px] font-black hover:scale-[1.01] transition-all text-sm flex items-center justify-center gap-3 ${isConfirmingDelete ? "bg-red-700 text-white animate-pulse" : "bg-red-600 text-white"} disabled:opacity-50`}>
                    {deleteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : isConfirmingDelete ? "Destroy Account Now" : "Permanently Delete My Account"}
                  </button>
                </form>
              </motion.div>
            ) : showOtpView ? (
              <motion.div key="otp-form" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} transition={{ duration: 0.4 }} className="max-w-md mx-auto">
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => { setShowOtpView(false); setOtpError(null); }} className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-teal-500/50 group transition-all">
                    <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-teal-500" />
                  </button>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verify Phone</h3>
                </div>
                <div className="mb-0 p-6 bg-teal-50/50 dark:bg-teal-900/10 rounded-[28px] border border-teal-100 dark:border-teal-900/30 text-center relative overflow-hidden">
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-sm border border-teal-100 dark:border-teal-800 mb-4 text-teal-600"><Smartphone className="w-8 h-8" /></div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Check your WhatsApp</h4>
                    <p className="text-[11px] font-medium text-slate-500 max-w-[200px]">We&apos;ve sent a 6-digit secure code to your number.</p>
                  </div>
                </div>
                {!!otpEvent && <div className={`mb-6 p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest flex items-center justify-center transition-colors ${otpEvent.status === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : otpEvent.status === 'error' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-teal-500/10 text-teal-600 border-teal-500/20 animate-pulse'}`}>{otpEvent.message}</div>}
                {otpError && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold border border-red-100 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {otpError}</div>}
                <div className="space-y-8 flex flex-col items-center">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Enter Verification Code</label>
                  <OTPInput value={otpValue} onChange={setOtpValue} length={6} error={!!otpError} />
                  <button onClick={handleVerifyOtp} disabled={otpLoading || otpValue.length < 6} className="w-full py-4 bg-teal-600 text-white rounded-[20px] font-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-teal-500/20 disabled:opacity-50 flex items-center justify-center gap-3 text-sm">
                    {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Complete Verification</>}
                  </button>
                  <button onClick={handleStartPhoneVerification} disabled={otpLoading} className="text-[10px] font-black text-slate-400 hover:text-teal-600 uppercase tracking-widest transition-colors mb-4">Didn&apos;t get the code? <span className="underline decoration-slate-300">Resend</span></button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="actions-list" initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.4 }}>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  Security Actions
                  <span className="h-1 w-1 rounded-full bg-teal-500"></span>
                </h3>
                <div className="grid gap-4">
                  {!user.isPhoneVerified && (
                    <button onClick={handleStartPhoneVerification} className="w-full flex items-center justify-between p-5 bg-linear-to-r from-teal-500/10 to-teal-500/5 dark:from-teal-900/20 dark:to-teal-900/10 rounded-2xl border border-teal-500/20 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 transition-all group relative overflow-hidden">
                      <div className="absolute inset-0 bg-linear-to-r from-teal-500/0 via-teal-500/5 to-teal-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <div className="flex items-center gap-5 relative z-10 w-full">
                        <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-teal-200 dark:border-teal-800 shadow-sm text-teal-600 transition-transform group-hover:scale-110">
                          <Smartphone className="w-6 h-6 stroke-3 animate-pulse" />
                        </div>
                        <div className="text-left flex-1">
                          <span className="block text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Verify Phone Number</span>
                          <span className="text-xs font-medium text-teal-600/80 dark:text-teal-400/80">Secure your account via WhatsApp instantly</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <ChevronRight className="w-5 h-5 text-teal-600" />
                        </div>
                      </div>
                    </button>
                  )}

                  <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-teal-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none">
                    <div className="flex items-center gap-5 w-full">
                      <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-xs text-slate-500 group-hover:text-teal-500 transition-all group-hover:rotate-12 group-hover:scale-110">
                        <Lock className="w-6 h-6 stroke-3" />
                      </div>
                      <div className="text-left flex-1">
                        <span className="block text-base font-bold text-slate-900 dark:text-white">Change Password</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Regularly update your account credentials</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-all group-hover:translate-x-1" />
                    </div>
                  </button>

                  <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center justify-between p-5 bg-white dark:bg-red-900/5 rounded-2xl border border-red-50 dark:border-red-900/10 hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group">
                    <div className="flex items-center gap-5 w-full">
                      <div className="w-14 h-14 bg-red-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-red-100 dark:border-red-900/20 shadow-xs text-red-500 group-hover:text-red-600 group-hover:animate-shake">
                        <AlertCircle className="w-6 h-6 stroke-3" />
                      </div>
                      <div className="text-left flex-1">
                        <span className="block text-base font-bold text-red-600 dark:text-red-400">Delete Account</span>
                        <span className="text-xs font-medium text-red-400/70">Permanently and irreversibly remove all your data</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-red-300 group-hover:text-red-500 transition-all group-hover:translate-x-1" />
                    </div>
                  </button>

                  <div className="w-full flex items-center justify-between p-5 bg-slate-50/40 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-800 opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-5 w-full">
                      <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-xs text-slate-400">
                        <Smartphone className="w-6 h-6 stroke-3" />
                      </div>
                      <div className="text-left flex-1">
                        <span className="block text-base font-bold text-slate-400 dark:text-slate-500">Two-Factor Auth</span>
                        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 italic">Highly requested feature • Coming Soon</span>
                      </div>
                      <Lock className="w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="md:col-span-2 mt-4 p-4 bg-slate-950 rounded-[24px] border border-slate-800">
          <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Mail className="w-3 h-3" /> Incoming WhatsApp Responses</h5>
          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className="text-[11px] leading-relaxed">
                <span className="text-teal-500 font-bold">{m.from.split('@')[0]}: </span>
                <span className="text-slate-300 font-medium">{m.body}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
