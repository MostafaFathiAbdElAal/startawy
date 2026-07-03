'use client';

import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { UserCheck, Upload, CheckCircle2 } from 'lucide-react';
import PhoneInput from './ui/PhoneInput';
import DateInput from './ui/DateInput';
import { useToast } from '@/components/providers/ToastProvider';

const CompleteProfileSchema = Yup.object().shape({
  name: Yup.string()
    .required('Full Name is required')
    .min(3, 'Name is too short'),
  phone: Yup.string()
    .required('Phone number is required')
    .min(8, 'Invalid phone number'),
  nationalId: Yup.string()
    .length(14, 'National ID must be exactly 14 digits')
    .matches(/^\d+$/, 'National ID must contain only digits')
    .required('National ID is required'),
  nationalIdFront: Yup.string().required('National ID Front Image is required'),
  nationalIdBack: Yup.string().required('National ID Back Image is required'),
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
  foundingDate: Yup.date().optional(),
  specialization: Yup.string().when('role', {
    is: 'CONSULTANT',
    then: (schema) => schema.required('Specialization/Title is required'),
    otherwise: (schema) => schema.optional(),
  }),
  yearsOfExp: Yup.number().when('role', {
    is: 'CONSULTANT',
    then: (schema) => schema.min(0, 'Must be positive').required('Years of experience is required'),
    otherwise: (schema) => schema.optional(),
  }),
  sessionRate: Yup.number().when('role', {
    is: 'CONSULTANT',
    then: (schema) => schema.min(10, 'Minimum price is $10').required('Session rate is required'),
    otherwise: (schema) => schema.optional(),
  }),
  bio: Yup.string().when('role', {
    is: 'CONSULTANT',
    then: (schema) => schema.min(50, 'Bio should be at least 50 characters').required('Bio is required'),
    otherwise: (schema) => schema.optional(),
  }),
  expertise: Yup.array().of(Yup.string()).when('role', {
    is: 'CONSULTANT',
    then: (schema) => schema.min(1, 'Add at least one expertise tag').required(),
    otherwise: (schema) => schema.optional(),
  }),
  availability: Yup.string().when('role', {
    is: 'CONSULTANT',
    then: (schema) => schema.required('Availability is required'),
    otherwise: (schema) => schema.optional(),
  }),
  certificate: Yup.string().when('role', {
    is: 'CONSULTANT',
    then: (schema) => schema.required('Professional certificate is required'),
    otherwise: (schema) => schema.optional(),
  }),
});

interface CompleteProfileFormProps {
    initialUser?: {
        name?: string | null;
        phone?: string | null;
        nationalId?: string | null;
        nationalIdFront?: string | null;
        nationalIdBack?: string | null;
        type?: string | null;
        founder?: {
            businessName?: string | null;
            businessSector?: string | null;
            foundingDate?: string | Date | null;
        } | null;
        consultant?: {
            specialization?: string | null;
            yearsOfExp?: number | null;
            availability?: string | null;
            sessionRate?: number | null;
            bio?: string | null;
            expertise?: string | null;
            certificate?: string | null;
        } | null;
    } | null;
}

export default function CompleteProfileForm({ initialUser }: CompleteProfileFormProps) {
    const [serverError, setServerError] = useState<string | null>(null);
    const [currentTag, setCurrentTag] = useState('');
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
            name: initialUser?.name || '',
            phone: initialUser?.phone || '',
            nationalId: initialUser?.nationalId || '',
            nationalIdFront: initialUser?.nationalIdFront ? 'selected' : '',
            nationalIdBack: initialUser?.nationalIdBack ? 'selected' : '',
            role: (initialUser?.type || 'FOUNDER') as 'FOUNDER' | 'CONSULTANT',
            businessName: initialUser?.founder?.businessName || '',
            businessSector: initialUser?.founder?.businessSector || '',
            foundingDate: initialUser?.founder?.foundingDate
                ? new Date(initialUser.founder.foundingDate).toISOString().split('T')[0]
                : '',
            specialization: initialUser?.consultant?.specialization || '',
            yearsOfExp: initialUser?.consultant?.yearsOfExp || 0,
            availability: initialUser?.consultant?.availability || '',
            sessionRate: initialUser?.consultant?.sessionRate || 150,
            bio: initialUser?.consultant?.bio || '',
            expertise: initialUser?.consultant?.expertise
                ? initialUser.consultant.expertise.split(';')
                : [] as string[],
            certificate: initialUser?.consultant?.certificate ? 'selected' : '',
        },
        validationSchema: CompleteProfileSchema,
        onSubmit: async (values, { setSubmitting }) => {
            setServerError(null);

            const hasFront = idFrontFile || (initialUser?.nationalIdFront && initialUser.nationalIdFront !== 'selected');
            const hasBack = idBackFile || (initialUser?.nationalIdBack && initialUser.nationalIdBack !== 'selected');
            const hasCert = values.role !== 'CONSULTANT' || certificateFile || (initialUser?.consultant?.certificate && initialUser.consultant.certificate !== 'selected');

            if (!hasFront || !hasBack || !hasCert) {
                setServerError('Please select all required documents.');
                setSubmitting(false);
                return;
            }

            setUploading(true);
            try {
                const frontUrl = idFrontFile ? await uploadFileDirect(idFrontFile) : initialUser?.nationalIdFront;
                const backUrl = idBackFile ? await uploadFileDirect(idBackFile) : initialUser?.nationalIdBack;
                const certUrl = certificateFile ? await uploadFileDirect(certificateFile) : initialUser?.consultant?.certificate;

                const payload = {
                    ...values,
                    nationalIdFront: frontUrl,
                    nationalIdBack: backUrl,
                    certificate: certUrl || undefined,
                };

                const response = await fetch('/api/auth/complete-profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();

                if (!response.ok) {
                    setServerError(result.error || 'Something went wrong');
                } else {
                    router.refresh(); // Invalidate server components cache
                    router.push('/dashboard');
                }
            } catch (err: unknown) {
                const errMsg = err instanceof Error ? err.message : 'Network error. Please try again.';
                setServerError(errMsg);
            } finally {
                setUploading(false);
                setSubmitting(false);
            }
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
                {/* Full Name */}
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                        name="name"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.name}
                        className={`auth-input px-5 py-4 ${formik.touched.name && formik.errors.name ? 'auth-input-error' : ''}`}
                        placeholder="Your full name"
                    />
                    {formik.touched.name && formik.errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold uppercase tracking-tight">{formik.errors.name}</p>}
                </div>
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
                                ) : initialUser?.nationalIdFront ? (
                                    <div className="flex flex-col items-center text-center">
                                        <CheckCircle2 className="w-6 h-6 text-teal-500 mb-1" />
                                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold truncate max-w-full">Existing Front Card</span>
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
                                ) : initialUser?.nationalIdBack ? (
                                    <div className="flex flex-col items-center text-center">
                                        <CheckCircle2 className="w-6 h-6 text-teal-500 mb-1" />
                                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold truncate max-w-full">Existing Back Card</span>
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

                {/* Role */}
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">I am a...</label>
                    <div className="relative auth-field">
                        <div className="auth-icon">
                            <UserCheck className="h-5 w-5" />
                        </div>
                        <select
                            name="role"
                            onChange={formik.handleChange}
                            value={formik.values.role}
                            disabled={!!initialUser?.type}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
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
                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Specialization/Title</label>
                                <input
                                    name="specialization"
                                    type="text"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.specialization}
                                    className={`auth-input px-5 py-4 ${formik.touched.specialization && formik.errors.specialization ? 'auth-input-error' : ''}`}
                                    placeholder="e.g. Senior Financial Advisor"
                                />
                                {formik.touched.specialization && formik.errors.specialization && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formik.errors.specialization}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Years of Exp</label>
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
                                    <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Session Rate ($)</label>
                                    <input
                                        name="sessionRate"
                                        type="number"
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        value={formik.values.sessionRate}
                                        className={`auth-input px-5 py-4 ${formik.touched.sessionRate && formik.errors.sessionRate ? 'auth-input-error' : ''}`}
                                    />
                                    {formik.touched.sessionRate && formik.errors.sessionRate && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formik.errors.sessionRate}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Expertise Tags (Press Enter)</label>
                                <div className={`auth-input p-2 flex flex-wrap gap-2 min-h-[56px] focus-within:ring-2 focus-within:ring-teal-500 ${formik.touched.expertise && formik.errors.expertise ? 'border-red-500' : ''}`}>
                                    {formik.values.expertise.map((tag, index) => (
                                        <span key={index} className="px-3 py-1 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-bold flex items-center gap-1 group">
                                            {tag}
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    const newTags = [...formik.values.expertise];
                                                    newTags.splice(index, 1);
                                                    formik.setFieldValue('expertise', newTags);
                                                }}
                                                className="hover:text-teal-900 dark:hover:text-teal-100"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={currentTag}
                                        onChange={(e) => setCurrentTag(e.target.value)}
                                        onKeyDown={(e) => {
                                            if ((e.key === 'Enter' || e.key === ',') && currentTag.trim()) {
                                                e.preventDefault();
                                                const tag = currentTag.trim().replace(',', '');
                                                if (!formik.values.expertise.includes(tag)) {
                                                    formik.setFieldValue('expertise', [...formik.values.expertise, tag]);
                                                }
                                                setCurrentTag('');
                                            }
                                        }}
                                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white min-w-[120px] px-2"
                                        placeholder={formik.values.expertise.length === 0 ? "e.g. Budgeting, Tax" : ""}
                                    />
                                </div>
                                {formik.touched.expertise && formik.errors.expertise && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formik.errors.expertise as string}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Professional Bio</label>
                                <textarea
                                    name="bio"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.bio}
                                    rows={4}
                                    className={`auth-input px-5 py-4 min-h-[120px] resize-none ${formik.touched.bio && formik.errors.bio ? 'auth-input-error' : ''}`}
                                    placeholder="Tell founders about your experience and how you can help..."
                                />
                                {formik.touched.bio && formik.errors.bio && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{formik.errors.bio}</p>}
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
                                        ) : initialUser?.consultant?.certificate ? (
                                            <div className="flex flex-col items-center text-center">
                                                <CheckCircle2 className="w-8 h-8 text-teal-500 mb-1" />
                                                <span className="text-xs text-teal-600 dark:text-teal-400 font-bold truncate max-w-full">Existing Certificate</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-center">
                                                <Upload className="w-8 h-8 text-slate-400 mb-1" />
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Upload Certificate (PDF or Image)</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                                {formik.touched.certificate && formik.errors.certificate && <p className="text-red-500 text-xs mt-1 font-bold">{formik.errors.certificate}</p>}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={formik.isSubmitting || uploading}
                    className="w-full bg-linear-to-r from-teal-500 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-teal-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {uploading ? 'Uploading Docs...' : formik.isSubmitting ? 'Saving...' : 'Finish Setup'}
                </button>
            </form>
        </div>
    );
}
