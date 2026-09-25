import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Lock, Eye, PhoneCall, AlertTriangle, X, Share2 } from 'lucide-react';

interface SafetyDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  actionText?: string;
}

export const SafetyDisclaimerModal: React.FC<SafetyDisclaimerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Commuter Safety & Anti-Theft Disclaimer",
  actionText = "I Understand & Confirm Request"
}) => {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleProceed = () => {
    if (!agreed) return;
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 shadow-2xl border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto text-white">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-950/70 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-amber-300 font-medium">Important Security & Safety Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Content */}
        <div className="space-y-3">
          {/* Platform Status Disclaimer */}
          <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-2xl text-xs text-slate-300 space-y-1">
            <p className="font-bold text-white flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-400" /> Peer-to-Peer Non-Commercial Ride Share
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              PathShare is a non-commercial commute cost-sharing community connecting verified colleagues. Commuters participate voluntarily at their own mutual responsibility.
            </p>
          </div>

          {/* Safety & Theft Precaution Guidelines */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Mandatory Security Steps:</p>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
              <Eye className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-300">1. Verify CNIC & Vehicle Plate</p>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  Always inspect the driver's/passenger's Office Badge or CNIC card and match vehicle license plate before boarding or handing over parcels.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/20 flex items-start gap-2.5">
              <Share2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-300">2. Share Live Location</p>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  Share your live route & rider info via WhatsApp with family or emergency contacts during trip transit.
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/20 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-300">3. Valuables & Theft Caution</p>
                <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                  Keep mobile phones, cash, and laptop bags secured. Avoid displaying high-value items during late night or isolated routes. PathShare is not liable for personal property loss or security incidents.
                </p>
              </div>
            </div>
          </div>

          {/* Helpline Emergency Box */}
          <div className="p-3 bg-slate-950/90 rounded-2xl flex items-center justify-between text-xs border border-slate-800">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <div>
                <p className="font-bold text-slate-200">Emergency Police Helpline</p>
                <p className="text-[10px] text-slate-400">Madadgar Police: 15 | Rangers: 1101</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/80 border border-rose-500/30 px-2 py-0.5 rounded-lg">15</span>
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 bg-slate-950 border-slate-700 rounded focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs text-slate-300 font-medium leading-tight">
              I have read, understood, and agree to abide by PathShare's Safety, Verification, and Anti-Theft Guidelines.
            </span>
          </label>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={!agreed}
          onClick={handleProceed}
          className={`w-full font-bold py-3.5 rounded-2xl shadow-md transition text-xs sm:text-sm flex items-center justify-center gap-2 ${
            agreed
              ? 'bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white shadow-blue-950/80 border border-blue-500/40 cursor-pointer active:scale-98'
              : 'bg-slate-800/80 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-blue-300" /> {actionText}
        </button>
      </div>
    </div>
  );
};
