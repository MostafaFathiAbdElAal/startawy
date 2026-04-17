'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import { RegisterSchema } from '../lib/validations';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, User, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from './GoogleLoginButton';
import PhoneInput from './ui/PhoneInput';
import DateInput from './ui/DateInput';

// Reusable input class builder
const inputCls = (hasError: boolean) =>
    `auth-input auth-input-icon${hasError ? ' auth-input-error' : ''}`;

const inputClsNoIcon = (hasError: boolean) =>
    `auth-input${hasError ? ' auth-input-error' : ''}`;

export default function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            fullName: '',
            role: '' as '' | 'FOUNDER' | 'CONSULTANT',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            // Founder
            businessName: '',
            businessSector: '',
            foundingDate: '',
            // Consultant
            specialization: '',
            yearsOfExp: 0,
            availability: '',
        },
        validationSchema: RegisterSchema,
        onSubmit: async (values, { setSubmitting }) => {
            setServerError(null);
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                });

                const result = await response.json();

                if (!response.ok) {
                    setServerError(result.error || 'Something went wrong');
                } else {
                    router.refresh();
                    router.push('/login?registered=true');
                }
            } catch (err) {
                setServerError('Network error. Please try again.');
                console.error(err);
            }
            setSubmitting(false);
        },
    });

    const handleGoogleClick = () => {
        setServerError(null);
        formik.setErrors({});
        formik.setTouched({}, false);

        const fieldsToValidate = ['role', 'phone'];

        if (formik.values.role === 'FOUNDER') {
            fieldsToValidate.push('businessName', 'businessSector', 'foundingDate');
        } else if (formik.values.role === 'CONSULTANT') {
            fieldsToValidate.push('specialization', 'yearsOfExp', 'availability');
        }

        fieldsToValidate.forEach(field => formik.setFieldTouched(field, true));

        const familiesErrors = formik.errors as Record<string, unknown>;
        const familiesValues = formik.values as Record<string, unknown>;

        const hasErrors = fieldsToValidate.some(field => {
            const error = familiesErrors[field];
            const value = familiesValues[field];
            return !!error || !value;
        });

        if (hasErrors) {
            setServerError("Please fill in all required fields (Role, Phone, and specific details) before continuing with Google.");
            return false;
        }

        return true;
    };

    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[32px] shadow-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 max-w-[520px] mx-auto relative">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h2>
                <p className="text-gray-600 dark:text-gray-400">Join Startawy today</p>
            </div>

            {serverError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 text-sm text-center font-medium">
                    {serverError}
                </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                    <label className="auth-label font-bold text-gray-700 dark:text-gray-100">Full Name</label>
                    <div className="relative auth-field">
                        <div className="auth-icon">
                            <User className="h-5 w-5" />
                        </div>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.fullName}
                            className={inputCls(!!(formik.touched.fullName && formik.errors.fullName))}
                            placeholder="John Doe"
                        />
                    </div>
                    {formik.touched.fullName && formik.errors.fullName && <p className="text-red-500 text-xs mt-1">{formik.errors.fullName}</p>}
                </div>

                {/* Role */}
                <div>
                    <label className="auth-label font-bold text-gray-700 dark:text-gray-100">Role</label>
                    <div className="relative auth-field">
                        <div className="auth-icon">
                            <UserCheck className="h-5 w-5" />
                        </div>
                        <select
                            id="role"
                            name="role"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.role}
                            className={`${inputCls(!!(formik.touched.role && formik.errors.role))} pr-10 appearance-none cursor-pointer`}
                        >
                            <option value="">Select your role</option>
                            <option value="FOUNDER">Startup Founder</option>
                            <option value="CONSULTANT">Consultant</option>
                        </select>
                        <div className="absolute top-0 bottom-0 right-0 pr-4 flex items-center pointer-events-none" style={{ zIndex: 3 }}>
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    {formik.touched.role && formik.errors.role && <p className="text-red-500 text-xs mt-1">{formik.errors.role as string}</p>}
                </div>

                {/* Dynamic Fields Section */}
                <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* FOUNDER FIELDS */}
                    {formik.values.role === 'FOUNDER' && (
                        <>
                            <div>
                                <label className="auth-label">Business Name</label>
                                <input
                                    name="businessName"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.businessName}
                                    className={inputClsNoIcon(!!(formik.touched.businessName && formik.errors.businessName))}
                                    placeholder="Company Name"
                                />
                                {formik.touched.businessName && formik.errors.businessName && <p className="text-red-500 text-xs mt-1">{formik.errors.businessName as string}</p>}
                            </div>
                            <div>
                                <label className="auth-label">Business Sector</label>
                                <input
                                    name="businessSector"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.businessSector}
                                    className={inputClsNoIcon(!!(formik.touched.businessSector && formik.errors.businessSector))}
                                    placeholder="e.g. Technology, Health"
                                />
                                {formik.touched.businessSector && formik.errors.businessSector && <p className="text-red-500 text-xs mt-1">{formik.errors.businessSector as string}</p>}
                            </div>
                             <div>
                                 <label className="auth-label">Founding Date</label>
                                 <DateInput 
                                     value={formik.values.foundingDate}
                                     onChange={(val: string) => formik.setFieldValue('foundingDate', val)}
                                     error={!!(formik.touched.foundingDate && formik.errors.foundingDate)}
                                     disableFuture={true}
                                 />
                                 {formik.touched.foundingDate && formik.errors.foundingDate && <p className="text-red-500 text-xs mt-1">{formik.errors.foundingDate as string}</p>}
                             </div>
                        </>
                    )}

                    {/* CONSULTANT FIELDS */}
                    {formik.values.role === 'CONSULTANT' && (
                        <>
                            <div>
                                <label className="auth-label">Specialization</label>
                                <input
                                    name="specialization"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.specialization}
                                    className={inputClsNoIcon(!!(formik.touched.specialization && formik.errors.specialization))}
                                    placeholder="e.g. Financial Consultant"
                                />
                                {formik.touched.specialization && formik.errors.specialization && <p className="text-red-500 text-xs mt-1">{formik.errors.specialization as string}</p>}
                            </div>
                            <div>
                                <label className="auth-label">Years of Experience</label>
                                <input
                                    name="yearsOfExp"
                                    type="number"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.yearsOfExp}
                                    className={inputClsNoIcon(!!(formik.touched.yearsOfExp && formik.errors.yearsOfExp))}
                                />
                                {formik.touched.yearsOfExp && formik.errors.yearsOfExp && <p className="text-red-500 text-xs mt-1">{formik.errors.yearsOfExp as string}</p>}
                            </div>
                            <div>
                                <label className="auth-label">Availability</label>
                                <input
                                    name="availability"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.availability}
                                    className={inputClsNoIcon(!!(formik.touched.availability && formik.errors.availability))}
                                    placeholder="e.g. 9AM - 5PM"
                                />
                                {formik.touched.availability && formik.errors.availability && <p className="text-red-500 text-xs mt-1">{formik.errors.availability as string}</p>}
                            </div>
                        </>
                    )}

                </div>

                {/* Email */}
                <div>
                    <label className="auth-label font-bold text-gray-700 dark:text-gray-100">Email Address</label>
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
                    {formik.touched.email && formik.errors.email && <p className="text-red-500 text-xs mt-1">{formik.errors.email as string}</p>}
                </div>

                {/* Phone */}
                <div>
                    <label className="auth-label font-bold text-gray-700 dark:text-gray-100">Phone Number</label>
                    <div className="auth-field">
                        <PhoneInput 
                            value={formik.values.phone}
                            onChange={(val) => formik.setFieldValue('phone', val)}
                            error={!!(formik.touched.phone && formik.errors.phone)}
                        />
                    </div>
                    {formik.touched.phone && formik.errors.phone && <p className="text-red-500 text-xs mt-1 font-bold">{formik.errors.phone as string}</p>}
                </div>

                {/* Password */}
                <div>
                    <label className="auth-label font-bold text-gray-700 dark:text-gray-100">Password</label>
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
                    {formik.touched.password && formik.errors.password && <p className="text-red-500 text-xs mt-1">{formik.errors.password as string}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                    <label className="auth-label font-bold text-gray-700 dark:text-gray-100">Confirm Password</label>
                    <div className="relative auth-field">
                        <div className="auth-icon">
                            <Lock className="h-5 w-5" />
                        </div>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.confirmPassword}
                            className={`${inputCls(!!(formik.touched.confirmPassword && formik.errors.confirmPassword))} auth-input-action`}
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="auth-action-btn"
                        >
                            {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        </button>
                    </div>
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formik.errors.confirmPassword as string}</p>}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    onClick={() => setServerError(null)}
                    disabled={formik.isSubmitting}
                    className="w-full bg-linear-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {formik.isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or sign up with</span>
                    </div>
                </div>
            </div>

            {/* Social Login */}
            <div className="flex flex-col items-center">
                <GoogleLoginButton
                    mode="register"
                    onBeforeClick={handleGoogleClick}
                    extraData={formik.values}
                />
            </div>

            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700">
                    Sign in
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
