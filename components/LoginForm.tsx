'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import { LoginSchema } from '../lib/validations';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import GoogleLoginButton from './GoogleLoginButton';

// Reusable input class builder
const inputCls = (hasError: boolean) =>
    `auth-input auth-input-icon${hasError ? ' auth-input-error' : ''}`;

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get('registered');

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: LoginSchema,
        onSubmit: async (values, { setSubmitting }) => {
            setServerError(null);
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                });

                const result = await response.json();

                if (!response.ok) {
                    setServerError(result.error || 'Invalid credentials');
                } else {
                    router.refresh();
                    router.push('/dashboard');
                }
            } catch {
                setServerError('Network error. Please try again.');
            }
            setSubmitting(false);
        },
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h2>
                <p className="text-gray-600 dark:text-gray-400">Sign in to your Startawy account</p>
            </div>

            {registered && !serverError && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl border border-green-100 dark:border-green-900/30 text-sm text-center font-medium">
                    Account created successfully! Please sign in.
                </div>
            )}

            {serverError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 text-sm text-center font-medium">
                    {serverError}
                </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                    <label className="auth-label text-gray-700 dark:text-gray-100 font-bold">Email Address</label>
                    <div className="relative auth-field">
                        <div className="auth-icon">
                            <Mail className="h-5 w-5" />
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            className={inputCls(!!(formik.touched.email && formik.errors.email))}
                            placeholder="your@example.com"
                        />
                    </div>
                    {formik.touched.email && formik.errors.email && <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="auth-label text-gray-700 dark:text-gray-100 font-bold" style={{ marginBottom: 0 }}>Password</label>
                    </div>
                    <div className="relative auth-field">
                        <div className="auth-icon">
                            <Lock className="h-5 w-5" />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            className={`${inputCls(!!(formik.touched.password && formik.errors.password))} auth-input-action`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="auth-action-btn"
                        >
                            {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                    </div>
                    {formik.touched.password && formik.errors.password && <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>}
                    <div className="flex justify-end mt-2">
                        <Link 
                            href="/forgot-password" 
                            className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="w-full bg-linear-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {formik.isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                    </div>
                </div>
            </div>

            {/* Social Login */}
            <div className="flex flex-col items-center">
                <GoogleLoginButton mode="login" />
            </div>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-700">
                    Sign up
                </Link>
            </p>

            <div className="mt-4 text-center">
                <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
