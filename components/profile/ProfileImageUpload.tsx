'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2, Upload, X, Check } from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { useToast } from '@/components/providers/ToastProvider';

interface ProfileImageUploadProps {
  currentImage?: string | null;
  userName: string;
}

export default function ProfileImageUpload({ currentImage, userName }: ProfileImageUploadProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate client-side
    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: 'error', title: 'File Too Large', message: 'Maximum size is 5MB' });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/user/profile-picture', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        showToast({ type: 'success', title: 'Photo Updated', message: 'Your profile picture has been updated successfully.' });
        setPreview(data.url);
        router.refresh(); // Update session/server components immediately
      } else {
        showToast({ type: 'error', title: 'Upload Failed', message: data.error || 'Failed to upload image' });
        setPreview(null);
      }
    } catch (error) {
      console.error('Upload Error:', error);
      showToast({ type: 'error', title: 'Error', message: 'An unexpected error occurred during upload.' });
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-6 mb-10">
      <div className="relative group">
        <div className="p-1 rounded-full bg-linear-to-r from-teal-500 to-emerald-500 animate-gradient-x shadow-2xl">
          <UserAvatar 
            name={userName} 
            image={preview || currentImage} 
            size="xl" 
          />
        </div>
        
        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full z-20 backdrop-blur-[2px]">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <button
            type="button"
            onClick={triggerUpload}
            className="absolute bottom-1 right-1 p-3 bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-800 text-teal-600 hover:text-teal-500 hover:scale-110 transition-all z-20 group/btn"
          >
            <Camera className="w-5 h-5" />
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Change Photo
            </div>
          </button>
        )}
      </div>

      <div className="text-center">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Profile Photo</h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[200px]">
          PNG, JPG or WEBP (Max. 5MB).<br />Recommended square ratio.
        </p>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />
    </div>
  );
}
