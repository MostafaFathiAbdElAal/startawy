'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { UserCheck } from 'lucide-react';
import PhoneInput from './ui/PhoneInput';
import DateInput from './ui/DateInput';

const CompleteProfileSchema = Yup.object().shape({
  phone: Yup.string()
    .required('Phone number is required')
    .min(8, 'Invalid phone number'),
  role: Yup.string()
    .oneOf(['FOUNDER', 'CONSULTANT'], 'Invalid role selected')
    .required('Role is required'),
  businessName: Yup.string().when('role', {
    is: 'FOUNDER',
    then: (schema) => schema.required('Business Name is required'),
    otherwise: (schema) => schema.optional(),
  }),
  businessSector: Yup.string().when('role', {
    is: 'FOUNDER',
    then: (schema) => schema.required('Business Sector is required'),
    otherwise: (schema) => schema.optional(),
  }),
  foundingDate: Yup.date().when('role', {
    is: 'FOUNDER',
    then: (schema) => schema.required('Founding Date is required'),
    otherwise: (schema) => schema.optional(),
  }),
  specialization: Yup.string().when('role', {
    is: 'CONSULTANT',
    then: (schema) => schema.required('Specialization is required'),
    otherwise: (schema) => schema.optional(),
  }),
  yearsOfExp: Yup.number().when('role', {
    is: 'CONSULTANT',
    then: (schema) => schema.min(0, 'Must be positive').required('Years of experience is required'),
    otherwise: (schema) => schema.optional(),
  }),
  availability: Yup.string().when('role', {
    is: 'CONSULTANT',
    then: (schema) => schema.required('Availability is required'),
    otherwise: (schema) => schema.optional(),
  }),
});

export default function CompleteProfileForm() {
    const [serverError, setServerError] = useState<string | null>(null);
    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            phone: '',
            role: 'FOUNDER' as 'FOUNDER' | 'CONSULTANT',
            businessName: '',
            businessSector: '',
            foundingDate: '',
            specialization: '',
            yearsOfExp: 0,
            availability: '',
        },
        validationSchema: CompleteProfileSchema,
        onSubmit: async (values, { setSubmitting }) => {
            setServerError(null);
            try {
                const response = await fetch('/api/auth/complete-profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                });

                const result = await response.json();

                if (!response.ok) {
                    setServerError(result.error || 'Something went wrong');
                } else {
                    router.refresh(); // Invalidate server components cache
                    router.push('/dashboard');
                }
            } catch {
                setServerError('Network error. Please try again.');
            }
            setSubmitting(false);
        },
    });

    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[32px] shadow-2xl p-10 border border-slate-200 dark:border-slate-800 max-w-[520px] mx-auto relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl rounded-full" />
            
            <div className="text-center mb-10 relative">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Complete Your Profile</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tell us a bit more about you</p>
            </div>

            {serverError && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 text-sm text-center font-bold">
                    {serverError}
                </div>
            )}

            <form onSubmit={formik.handleSubmit} className="space-y-6 relative">
                {/* Phone Number */}
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="auth-field">
                        <PhoneInput 
                            value={formik.values.phone}
                            onChange={(val) => formik.setFieldValue('phone', val)}
                            error={!!(formik.touched.phone && formik.errors.phone)}
                        />
                    </div>
                    {formik.touched.phone && formik.errors.phone && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase tracking-tight ml-1">{formik.errors.phone}</p>}
                </div>

                {/* Role */}
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">I am a...</label>
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
                            className={`auth-input auth-input-icon pr-10 appearance-none cursor-pointer font-bold ${formik.touched.role && formik.errors.role ? 'auth-input-error' : ''}`}
                        >
                            <option value="FOUNDER">Startup Founder</option>
                            <option value="CONSULTANT">Consultant</option>
                        </select>
                        <div className="absolute top-0 bottom-0 right-0 pr-4 flex items-center pointer-events-none" style={{ zIndex: 4 }}>
                            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Dynamic Fields Section */}
                <div className="space-y-5">
                    {/* FOUNDER FIELDS */}
                    {formik.values.role === 'FOUNDER' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
                                <input
                                    name="businessName"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.businessName}
                                    className={`auth-input px-5 py-4 ${formik.touched.businessName && formik.errors.businessName ? 'auth-input-error' : ''}`}
                                    placeholder="Company Name"
                                />
                                {formik.touched.businessName && formik.errors.businessName && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formik.errors.businessName}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Business Sector</label>
                                <input
                                    name="businessSector"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.businessSector}
                                    className={`auth-input px-5 py-4 ${formik.touched.businessSector && formik.errors.businessSector ? 'auth-input-error' : ''}`}
                                    placeholder="e.g. Technology, Health"
                                />
                                {formik.touched.businessSector && formik.errors.businessSector && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formik.errors.businessSector}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Founding Date</label>
                                <DateInput 
                                    value={formik.values.foundingDate}
                                    onChange={(val) => formik.setFieldValue('foundingDate', val)}
                                    error={!!(formik.touched.foundingDate && formik.errors.foundingDate)}
                                    disableFuture={true}
                                />
                                {formik.touched.foundingDate && formik.errors.foundingDate && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formik.errors.foundingDate as string}</p>}
                            </div>
                        </div>
                    )}

                    {/* CONSULTANT FIELDS */}
                    {formik.values.role === 'CONSULTANT' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Specialization</label>
                                <input
                                    name="specialization"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.specialization}
                                    className={`auth-input px-5 py-4 ${formik.touched.specialization && formik.errors.specialization ? 'auth-input-error' : ''}`}
                                    placeholder="e.g. Financial Consultant"
                                />
                                {formik.touched.specialization && formik.errors.specialization && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formik.errors.specialization}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Years of Experience</label>
                                <input
                                    name="yearsOfExp"
                                    type="number"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.yearsOfExp}
                                    className={`auth-input px-5 py-4 ${formik.touched.yearsOfExp && formik.errors.yearsOfExp ? 'auth-input-error' : ''}`}
                                />
                                {formik.touched.yearsOfExp && formik.errors.yearsOfExp && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formik.errors.yearsOfExp}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Availability</label>
                                <input
                                    name="availability"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.availability}
                                    className={`auth-input px-5 py-4 ${formik.touched.availability && formik.errors.availability ? 'auth-input-error' : ''}`}
                                    placeholder="e.g. 9AM - 5PM"
                                />
                                {formik.touched.availability && formik.errors.availability && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formik.errors.availability}</p>}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="w-full bg-linear-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {formik.isSubmitting ? 'Saving...' : 'Finish Setup'}
                </button>
            </form>
        </div>
    );
}
