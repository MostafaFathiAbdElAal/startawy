'use client';

import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Phone, Key, Lock, CheckCircle2, ArrowRight, ArrowLeft, Loader2, User, Clock, AlertCircle } from 'lucide-react';
import { sendPasswordResetOTP, resetPassword, verifyOTP } from '../app/actions/auth';
import Link from 'next/link';
import PhoneInput from './ui/PhoneInput';
import OTPInput from './ui/OTPInput';

const steps = [
    { title: 'Identify', icon: Phone },
    { title: 'Verify', icon: Key },
    { title: 'Reset', icon: Lock },
];

export default function ForgotPasswordForm() {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [identifiedUser, setIdentifiedUser] = useState<{ name: string; email: string } | null>(null);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        if (currentStep === 1 && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [currentStep, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResendOTP = async () => {
        if (loading || timeLeft > 0) return;
        setLoading(true);
        setError(null);
        formik.setFieldValue('otp', ''); // Clear the old OTP field
        const res = await sendPasswordResetOTP(formik.values.phone);
        if (res.success) {
            setTimeLeft(300); // Start a new 5-minute timer immediately
        } else {
            setError(res.error || 'Failed to resend OTP');
        }
        setLoading(false);
    };

    const formik = useFormik({
        initialValues: {
            phone: '',
            otp: '',
            newPassword: '',
            confirmPassword: '',
        },
        validateOnChange: false, // Disable real-time validation
        validateOnBlur: false,   // Disable blur validation
        validationSchema: Yup.object({
            phone: Yup.string()
                .required('Phone number is required')
                .min(8, 'Invalid phone number'),
            otp: currentStep === 1 ? Yup.string()
                .required('OTP is required')
                .length(6, 'Must be 6 digits') : Yup.string(),
            newPassword: currentStep === 2 ? Yup.string()
                .required('Required')
                .min(8, 'Min 8 characters') : Yup.string(),
            confirmPassword: currentStep === 2 ? Yup.string()
                .oneOf([Yup.ref('newPassword')], 'Passwords must match')
                .required('Required') : Yup.string(),
        }),
        onSubmit: async (values) => {
            setError(null);
            setLoading(true);

            if (currentStep === 0) {
                // Step 1: Send OTP
                const res = await sendPasswordResetOTP(values.phone);
                if (res.success && res.user) {
                    setIdentifiedUser(res.user);
                    // Use remaining time from server if it exists, otherwise start fresh 5 mins
                    const remaining = (res as { remainingSeconds?: number }).remainingSeconds;
                    setTimeLeft(remaining || 300);
                    setCurrentStep(1);
                } else {
                    setError(res.error || 'Failed to send OTP');
                }
            } else if (currentStep === 1) {
                // Step 2: Validate OTP on server before moving to step 3
                const res = await verifyOTP(values.phone, values.otp);
                if (res.success) {
                    setCurrentStep(2);
                } else {
                    setError(res.error || 'Invalid OTP code');
                }
            } else if (currentStep === 2) {
                // Step 3: Reset Password
                const res = await resetPassword(values.phone, values.otp, values.newPassword);
                if (res.success) {
                    setSuccess(true);
                } else {
                    setError(res.error || 'Failed to reset password');
                }
            }
            setLoading(false);
        },
    });

    const handleOTPChange = (val: string) => {
        formik.setFieldValue('otp', val);
        // Clear errors as soon as user types
        if (formik.errors.otp) {
            formik.setFieldError('otp', undefined);
        }
        if (error) {
            setError(null);
        }
    };

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 mb-6 font-bold">
                    <CheckCircle2 size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 font-bold">
                    Your password has been successfully updated. You can now log in with your new password.
                </p>
                <Link 
                    href="/login" 
                    className="w-full flex justify-center py-3 px-4 rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition-colors font-bold shadow-lg shadow-teal-500/20"
                >
                    Back to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-12 relative px-4">
                {/* Connection Lines */}
                <div className="absolute top-5 left-8 right-8 h-[2px] bg-gray-200 dark:bg-gray-800 -z-10">
                    <div 
                        className="h-full bg-teal-600 transition-all duration-500" 
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isActive = idx === currentStep;
                    const isCompleted = idx < currentStep;

                    return (
                        <div key={idx} className="flex flex-col items-center">
                            <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isActive 
                                        ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30 scale-110' 
                                        : isCompleted 
                                            ? 'bg-teal-500 text-white' 
                                            : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-400'
                                }`}
                            >
                                {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                            </div>
                            <span className={`text-[10px] uppercase tracking-wider mt-2 font-bold ${
                                isActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-gray-600'
                            }`}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center font-bold animate-in fade-in slide-in-from-top-2">
                        {error.includes('not verified') ? (
                            <div className="flex flex-col items-center gap-2">
                                <AlertCircle size={20} className="text-red-500" />
                                <span>{error}</span>
                                <Link href="/profile" className="text-teal-600 underline text-xs mt-1">Go to Profile to Verify</Link>
                            </div>
                        ) : error}
                    </div>
                )}

                {/* Step 1: Phone */}
                {currentStep === 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Enter Phone Number</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">We will send a 6-digit OTP to your WhatsApp.</p>
                        </div>
                        <div className="auth-field">
                            <label className="auth-label font-bold text-gray-700 dark:text-gray-100">Phone Number</label>
                            <PhoneInput 
                                value={formik.values.phone}
                                onChange={(val) => formik.setFieldValue('phone', val)}
                                error={!!(formik.touched.phone && formik.errors.phone)}
                            />
                            {formik.touched.phone && formik.errors.phone && (
                                <p className="text-red-500 text-xs mt-1 font-bold">{formik.errors.phone}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: OTP */}
                {currentStep === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Verify Your Phone</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enter the code sent to {formik.values.phone}</p>
                        </div>

                        {identifiedUser && (
                            <div className="flex items-center gap-3 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center text-teal-600">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-teal-700 dark:text-teal-400 font-bold">Account found!</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{identifiedUser.name}</p>
                                    <p className="text-[10px] text-gray-500">{identifiedUser.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="auth-field">
                            <div className="flex justify-between items-center mb-1">
                                <label className="auth-label font-bold text-gray-700 dark:text-gray-100">OTP Code</label>
                                <div className={`flex items-center gap-1.5 text-xs font-bold ${timeLeft === 0 ? 'text-red-500' : 'text-teal-600 dark:text-teal-400'} animate-pulse`}>
                                    <Clock size={12} />
                                    <span>{formatTime(timeLeft)}</span>
                                </div>
                            </div>
                            
                            <OTPInput 
                                value={formik.values.otp}
                                onChange={handleOTPChange}
                                length={6}
                                error={!!(formik.errors.otp)}
                            />
                            
                            {formik.touched.otp && formik.errors.otp && (
                                <p className="text-red-500 text-xs mt-2 text-center font-bold">{formik.errors.otp}</p>
                            )}

                            <div className="mt-6 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Didn&apos;t receive code?{' '}
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={timeLeft > 0 || loading}
                                        className={`font-black underline transition-colors ${
                                            timeLeft > 0 
                                                ? 'text-gray-400 cursor-not-allowed' 
                                                : 'text-teal-600 hover:text-teal-700 dark:text-teal-400'
                                        }`}
                                    >
                                        Resend now
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: New Password */}
                {currentStep === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Set New Password</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Create a strong password for your account.</p>
                        </div>
                        <div className="auth-field">
                            <label className="auth-label font-bold text-gray-700 dark:text-gray-100">New Password</label>
                            <div className="relative">
                                <div className="auth-icon">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className={`auth-input auth-input-icon ${formik.touched.newPassword && formik.errors.newPassword ? 'auth-input-error' : ''}`}
                                    {...formik.getFieldProps('newPassword')}
                                />
                            </div>
                            {formik.touched.newPassword && formik.errors.newPassword && (
                                <p className="text-red-500 text-xs mt-1 font-bold">{formik.errors.newPassword}</p>
                            )}
                        </div>
                        <div className="auth-field">
                            <label className="auth-label font-bold text-gray-700 dark:text-gray-100">Confirm Password</label>
                            <div className="relative">
                                <div className="auth-icon">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    className={`auth-input auth-input-icon ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'auth-input-error' : ''}`}
                                    {...formik.getFieldProps('confirmPassword')}
                                />
                            </div>
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1 font-bold">{formik.errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pt-4">
                    {currentStep > 0 && (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(currentStep - 1)}
                            className="flex-1 py-3 px-4 rounded-xl text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-bold flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={18} />
                            Back
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-2 py-3 px-4 rounded-xl text-white bg-teal-600 hover:bg-teal-700 transition-all font-bold shadow-lg shadow-teal-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                {currentStep === 2 ? 'Reset Password' : 'Continue'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>

                <div className="text-center pt-6">
                    <Link 
                        href="/login" 
                        className="text-sm font-bold text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={14} />
                        Back to Login
                    </Link>
                </div>
            </form>
        </div>
    );
}
