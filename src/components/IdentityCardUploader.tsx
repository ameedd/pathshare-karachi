import React, { useRef, useState } from 'react';
import { Camera, Upload, CheckCircle2, AlertCircle, Building2, ShieldCheck, X, Loader2 } from 'lucide-react';
import { uploadVerificationDocument } from '../lib/storage';

interface IdentityCardUploaderProps {
  userId?: string;
  docType?: 'cnic_front' | 'cnic_back' | 'license' | 'student_id' | 'office_id';
  title?: string;
  subtitle?: string;
  currentImageUrl?: string;
  status: 'verified' | 'pending' | 'unverified';
  onImageUploaded: (url: string) => void;
  onToast: (msg: string) => void;
}

export const IdentityCardUploader: React.FC<IdentityCardUploaderProps> = ({
  userId = 'anonymous',
  docType = 'office_id',
  title = 'Identity / Office Card',
  subtitle = 'Front image required for corporate verification',
  currentImageUrl,
  status,
  onImageUploaded,
  onToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onToast('Please select a valid image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onToast('File size must be under 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      // Direct upload to Firebase Storage (/verifications/{userId}/{docType}_...)
      const { downloadUrl } = await uploadVerificationDocument(userId, file, docType);
      onImageUploaded(downloadUrl);
      onToast(`${title} uploaded successfully to Firebase Storage!`);
    } catch (err: any) {
      console.error('[IdentityCardUploader] Storage upload error:', err);
      // Local fallback
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onImageUploaded(result);
          onToast(`${title} saved locally.`);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl p-4 shadow-xl border border-slate-800 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-bold text-white text-sm">{title}</h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>

        {status === 'verified' && (
          <span className="bg-blue-950 text-blue-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-blue-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Verified
          </span>
        )}
        {status === 'pending' && (
          <span className="bg-amber-950/80 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-800/80">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Pending Review
          </span>
        )}
        {status === 'unverified' && (
          <span className="bg-rose-950/80 text-rose-300 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-rose-800/80">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Required
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {currentImageUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 group">
          <img
            src={currentImageUrl}
            alt={title}
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1 hover:bg-blue-500 cursor-pointer"
            >
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>{isUploading ? 'Uploading to Storage...' : 'Re-upload'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-800/80 hover:border-blue-500 bg-blue-950/30 hover:bg-blue-950/60 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2"
        >
          <div className="w-12 h-12 rounded-full bg-blue-950 text-blue-400 flex items-center justify-center shadow-md border border-blue-800">
            {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-blue-400" /> : <Camera className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-xs font-bold text-blue-300">
              {isUploading ? 'Uploading Document to Firebase Storage...' : `Upload Front of ${title}`}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click or drag image file (JPG, PNG, WebP &lt; 5MB)</p>
          </div>
          <span className="text-[10px] bg-slate-900 text-blue-300 border border-slate-800 px-2.5 py-1 rounded-full font-semibold shadow-md">
            Firebase Cloud Storage (RBAC Protected)
          </span>
        </div>
      )}

      <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start gap-2 text-xs text-slate-300">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          Office cards build trust among fellow commuters. Your card is strictly used to issue your <strong className="text-blue-300">Verified Office Member</strong> badge.
        </p>
      </div>
    </div>
  );
};
