'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import { RegisterSchema } from '../lib/validations';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, User, UserCheck, Upload, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GoogleLoginButton from './GoogleLoginButton';
import PhoneInput from './ui/PhoneInput';
import DateInput from './ui/DateInput';
import { useToast } from './providers/ToastProvider';

// Reusable input class builder
const inputCls = (hasError: boolean) =>
    `auth-input auth-input-icon${hasError ? ' auth-input-error' : ''}`;

const inputClsNoIcon = (hasError: boolean) =>
    `auth-input${hasError ? ' auth-input-error' : ''}`;

export default function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
    const [idBackFile, setIdBackFile] = useState<File | null>(null);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limit size to 10MB
        if (file.size > 10 * 1024 * 1024) {
            showToast({ type: 'error', title: 'File Too Large', message: 'Maximum size is 10MB' });
            return;
        }

        if (fieldName === 'nationalIdFront') {
            setIdFrontFile(file);
            formik.setFieldValue('nationalIdFront', 'selected');
        } else if (fieldName === 'nationalIdBack') {
            setIdBackFile(file);
            formik.setFieldValue('nationalIdBack', 'selected');
        } else if (fieldName === 'certificate') {
            setCertificateFile(file);
            formik.setFieldValue('certificate', 'selected');
        }
    };

    const uploadFileDirect = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/user/upload-doc', {
            method: 'POST',
            body: formData,
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || 'Failed to upload document');
        }
        return data.url;
    };

    const formik = useFormik({
        initialValues: {
            fullName: '',
            role: '' as '' | 'FOUNDER' | 'CONSULTANT',
            email: '',
            phone: '',
            nationalId: '',
            nationalIdFront: '',
            nationalIdBack: '',
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
            certificate: '',
        },
        validationSchema: RegisterSchema,
        onSubmit: async (values, { setSubmitting }) => {
            setServerError(null);

            if (!idFrontFile || !idBackFile || (values.role === 'CONSULTANT' && !certificateFile)) {
                setServerError('Please select all required documents.');
                setSubmitting(false);
                return;
            }

            setUploading(true);
            try {
                const uploadPromises = [
                    uploadFileDirect(idFrontFile),
                    uploadFileDirect(idBackFile)
                ];

                if (values.role === 'CONSULTANT' && certificateFile) {
                    uploadPromises.push(uploadFileDirect(certificateFile));
                }

                const [frontUrl, backUrl, certUrl] = await Promise.all(uploadPromises);

                const payload = {
                    ...values,
                    nationalIdFront: frontUrl,
                    nationalIdBack: backUrl,
                    certificate: certUrl || undefined,
                };

                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();

                if (!response.ok) {
                    const errMsg = result.error || 'Something went wrong';
                    setServerError(errMsg);
                    showToast({ type: 'error', title: 'Registration Failed', message: errMsg });
                } else {
                    showToast({ 
                        type: 'success', 
                        title: 'Account Created', 
                        message: 'Welcome to Startawy! Your account has been created successfully.' 
                    });
                    router.refresh();
                    router.push('/login?registered=true');
                }
            } catch (err: unknown) {
                const errMsg = err instanceof Error ? err.message : 'Network error. Please try again.';
                setServerError(errMsg);
                showToast({ type: 'error', title: 'Error', message: errMsg });
                console.error(err);
            } finally {
                setUploading(false);
                setSubmitting(false);
            }
        },
    });

    const handleGoogleClick = () => {
        setServerError(null);
        formik.setErrors({});
        formik.setTouched({}, false);

        const fieldsToValidate = ['role', 'phone', 'nationalId', 'nationalIdFront', 'nationalIdBack'];

        if (formik.values.role === 'FOUNDER') {
            fieldsToValidate.push('businessName', 'businessSector', 'foundingDate');
        } else if (formik.values.role === 'CONSULTANT') {
            fieldsToValidate.push('specialization', 'yearsOfExp', 'availability', 'certificate');
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

    const uploadFilesForGoogle = async () => {
        if (!idFrontFile || !idBackFile || (formik.values.role === 'CONSULTANT' && !certificateFile)) {
            return null;
        }
        try {
            const uploadPromises = [
                uploadFileDirect(idFrontFile),
                uploadFileDirect(idBackFile)
            ];

            if (formik.values.role === 'CONSULTANT' && certificateFile) {
                uploadPromises.push(uploadFileDirect(certificateFile));
            }

            const [frontUrl, backUrl, certUrl] = await Promise.all(uploadPromises);
            return {
                frontUrl,
                backUrl,
                certUrl: certUrl || undefined,
            };
        } catch (err) {
            console.error(err);
            return null;
        }
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
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Professional Certificate</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        onChange={(e) => handleFileChange(e, 'certificate')}
                                        className="hidden"
                                        id="certificateInput"
                                    />
                                    <label
                                        htmlFor="certificateInput"
                                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                            certificateFile ? 'border-teal-500 bg-teal-50/20 dark:bg-teal-900/10' : 'border-slate-200 dark:border-slate-800'
                                        }`}
                                    >
                                        {certificateFile ? (
                                            <div className="flex flex-col items-center text-center">
                                                <CheckCircle2 className="w-8 h-8 text-teal-500 mb-1" />
                                                <span className="text-xs text-teal-600 dark:text-teal-400 font-bold truncate max-w-full">{certificateFile.name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-center">
                                                <Upload className="w-8 h-8 text-slate-400 mb-1" />
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Upload Certificate (PDF or Image)</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                                {formik.touched.certificate && formik.errors.certificate && <p className="text-red-500 text-xs mt-1 font-bold">{formik.errors.certificate as string}</p>}
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

                {/* National ID */}
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">National ID</label>
                    <input
                        name="nationalId"
                        type="text"
                        maxLength={14}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.nationalId}
                        className={`auth-input px-5 py-4 ${formik.touched.nationalId && formik.errors.nationalId ? 'auth-input-error' : ''}`}
                        placeholder="14-digit National ID"
                    />
                    {formik.touched.nationalId && formik.errors.nationalId && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-tight">{formik.errors.nationalId}</p>}
                </div>

                {/* National ID Front and Back Images */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">ID Front Image</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => handleFileChange(e, 'nationalIdFront')}
                                className="hidden"
                                id="nationalIdFrontInput"
                            />
                            <label
                                htmlFor="nationalIdFrontInput"
                                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                    idFrontFile ? 'border-teal-500 bg-teal-50/20 dark:bg-teal-900/10' : 'border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                {idFrontFile ? (
                                    <div className="flex flex-col items-center text-center">
                                        <CheckCircle2 className="w-6 h-6 text-teal-500 mb-1" />
                                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold truncate max-w-full">{idFrontFile.name}</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center">
                                        <Upload className="w-6 h-6 text-slate-400 mb-1" />
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Upload Front</span>
                                    </div>
                                )}
                            </label>
                        </div>
                        {formik.touched.nationalIdFront && formik.errors.nationalIdFront && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formik.errors.nationalIdFront}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">ID Back Image</label>
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => handleFileChange(e, 'nationalIdBack')}
                                className="hidden"
                                id="nationalIdBackInput"
                            />
                            <label
                                htmlFor="nationalIdBackInput"
                                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                    idBackFile ? 'border-teal-500 bg-teal-50/20 dark:bg-teal-900/10' : 'border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                {idBackFile ? (
                                    <div className="flex flex-col items-center text-center">
                                        <CheckCircle2 className="w-6 h-6 text-teal-500 mb-1" />
                                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold truncate max-w-full">{idBackFile.name}</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center">
                                        <Upload className="w-6 h-6 text-slate-400 mb-1" />
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Upload Back</span>
                                    </div>
                                )}
                            </label>
                        </div>
                        {formik.touched.nationalIdBack && formik.errors.nationalIdBack && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formik.errors.nationalIdBack}</p>}
                    </div>
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
                    disabled={formik.isSubmitting || uploading}
                    className="w-full bg-linear-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {uploading ? 'Uploading Docs...' : formik.isSubmitting ? 'Creating Account...' : 'Create Account'}
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
                    uploadFiles={uploadFilesForGoogle}
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
