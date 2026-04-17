"use client";

import { useState } from "react";
import { Plus, UploadCloud, CheckCircle, Image as ImageIcon, FileText, Loader2, Link } from "lucide-react";

export default function AdminReportsPage() {
  const [formData, setFormData] = useState({
    title: "",
    industry: "Fintech",
    description: "",
    pages: "",
  });
  
  const [uploadedImage, setUploadedImage] = useState("");
  const [uploadedPdf, setUploadedPdf] = useState("");
  const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(prev => ({ ...prev, [type]: true }));
    setError("");

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/admin/reports/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      if (type === 'image') setUploadedImage(json.url);
      else setUploadedPdf(json.url);

    } catch (err: any) {
      setError(`Failed to upload ${type}: ${err.message}`);
    } finally {
      setIsUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedImage || !uploadedPdf) {
        setError("Please upload both a cover image and the report PDF first.");
        return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      // Logic: Save metadata and the PDF link (uploadedPdf) and Image (uploadedImage)
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            ...formData, 
            image: uploadedImage,
            link: uploadedPdf // Using 'link' field from schema for PDF URL
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to publish report");

      setSuccess(true);
      setFormData({ title: "", industry: "Fintech", description: "", pages: "" });
      setUploadedImage("");
      setUploadedPdf("");
    } catch (err: any) {
      setError(err.message || "Failed to publish report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-display">Library Content Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Publish professional market research to the Startawy Cloud Library.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-6xl">
        {/* Main Form */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100 dark:border-slate-800">
              <div className="w-12 h-12 bg-linear-to-br from-teal-500 to-teal-600 text-white rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Report</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Provide metadata and secure cloud assets.</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-900/50">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm border border-green-200 dark:border-green-900/50 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                Report published to Cloud successfully! It's now live in the Library.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Report Title</label>
                  <input
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    type="text"
                    placeholder="e.g. 2026 Fintech Growth Analysis"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all outline-none text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Industry Sector</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all outline-none text-gray-900 dark:text-white"
                  >
                    <option value="Fintech">Fintech</option>
                    <option value="SaaS">SaaS</option>
                    <option value="E-Commerce">E-Commerce</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="EdTech">EdTech</option>
                    <option value="GreenTech">GreenTech</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Executive Summary</label>
                <textarea
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the key value propositions of this report..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 transition-all outline-none resize-none text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Cover Image</label>
                  <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                      uploadedImage ? 'border-teal-500 bg-teal-50/10' : 'border-gray-200 dark:border-slate-800'
                  }`}>
                    {uploadedImage ? (
                        <div className="flex flex-col items-center gap-2">
                             <ImageIcon className="w-8 h-8 text-teal-500" />
                             <span className="text-xs font-bold text-teal-600">Image Ready</span>
                             <button type="button" onClick={() => setUploadedImage("")} className="text-[10px] text-red-500 underline">Remove</button>
                        </div>
                    ) : (
                        <>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleFileUpload(e, 'image')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={isUploading.image}
                            />
                            {isUploading.image ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                                    <span className="text-xs text-gray-500">Uploading to Cloud...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <UploadCloud className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Drop Cover Art</span>
                                </div>
                            )}
                        </>
                    )}
                  </div>
                </div>

                {/* PDF Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Full Report (PDF)</label>
                  <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                      uploadedPdf ? 'border-teal-500 bg-teal-50/10' : 'border-gray-200 dark:border-slate-800'
                  }`}>
                    {uploadedPdf ? (
                        <div className="flex flex-col items-center gap-2">
                             <FileText className="w-8 h-8 text-teal-500" />
                             <span className="text-xs font-bold text-teal-600">PDF Securely Hosted</span>
                             <button type="button" onClick={() => setUploadedPdf("")} className="text-[10px] text-red-500 underline">Remove</button>
                        </div>
                    ) : (
                        <>
                            <input 
                                type="file" 
                                accept="application/pdf" 
                                onChange={(e) => handleFileUpload(e, 'pdf')}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={isUploading.pdf}
                            />
                            {isUploading.pdf ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                                    <span className="text-xs text-gray-500">Processing Document...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <UploadCloud className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Upload PDF Asset</span>
                                </div>
                            )}
                        </>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircle className={`w-4 h-4 ${uploadedImage && uploadedPdf ? 'text-teal-500' : 'text-gray-300'}`} />
                    All assets verified
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading.image || isUploading.pdf}
                  className="inline-flex items-center gap-2 px-10 py-4 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-2xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg font-bold disabled:opacity-75 active:scale-95 translate-y-0 hover:-translate-y-1 duration-200"
                >
                  <Plus className="w-5 h-5" />
                  {isSubmitting ? "Publishing..." : "Finalize & Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview Card */}
        <div className="space-y-6">
           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-2">Live Preview</h3>
           <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden group border-b-4 border-b-teal-500">
                <div className="relative h-48 bg-gray-100 dark:bg-slate-800">
                    {uploadedImage ? (
                         <img src={uploadedImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : ( 
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                            <ImageIcon className="w-10 h-10 opacity-20" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Cover Art Hidden</span>
                        </div>
                    )}
                    <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-teal-600 text-white rounded-full text-[10px] font-bold uppercase">
                            {formData.industry}
                        </span>
                    </div>
                </div>
                <div className="p-6">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{formData.title || "Report Title Placeholder"}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed mb-4">
                        {formData.description || "The executive summary will appear here once you start typing..."}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                             <FileText className="w-3 h-3" />
                             {formData.pages || "0"} Pages
                        </div>
                        <div className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 ${uploadedPdf ? 'text-teal-600 bg-teal-50' : 'text-gray-400 bg-gray-50'}`}>
                             <Link className="w-3 h-3" />
                             PDF {uploadedPdf ? 'HOSTED' : 'MISSING'}
                        </div>
                    </div>
                </div>
           </div>
           
           <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-200 dark:border-amber-900/30">
                <h4 className="text-amber-800 dark:text-amber-400 font-bold text-sm mb-2 flex items-center gap-2">
                    <Link className="w-4 h-4" /> Cloud Storage Notice
                </h4>
                <p className="text-amber-700 dark:text-amber-500 text-[10px] leading-relaxed">
                    All reports and images are directly streamed to Cloudinary's secure servers. The database only stores the secure metadata and public links.
                </p>
           </div>
        </div>
      </div>
    </div>
  );
}
