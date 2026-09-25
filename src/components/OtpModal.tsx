import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  MessageSquare, 
  Mail, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Info,
  Smartphone,
  Share2
} from 'lucide-react';
import { playArrivalChime, playSuccessChime } from '../lib/sound';
import { apiUrl } from '../lib/api';

export interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (verifiedTarget: string) => void;
  onVerifySuccess?: () => void;
  title?: string;
  subtitle?: string;
  defaultChannel?: 'both' | 'whatsapp' | 'sms' | 'email';
  defaultTarget?: string;
  targetText?: string;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onVerifySuccess,
  title = 'Verify Security OTP',
  subtitle = 'WhatsApp & SMS Simultaneous Broadcast',
  defaultChannel = 'both',
  defaultTarget,
  targetText
}) => {
  const getSavedTarget = () => {
    if (defaultTarget && defaultTarget !== '+92 300 9876543') return defaultTarget;
    const op = localStorage.getItem('pathshare_last_op') || '323';
    const sub = localStorage.getItem('pathshare_last_sub') || '2072251';
    return `+92 ${op} ${sub}`;
  };

  const [channel, setChannel] = useState<'both' | 'whatsapp' | 'sms' | 'email'>(defaultChannel);
  const [target, setTarget] = useState(getSavedTarget);
  const [digits, setDigits] = useState<string[]>(['', '', '', '']);
  const [isSent, setIsSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dispatchedReal, setDispatchedReal] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      const activeChannel: 'both' | 'whatsapp' | 'sms' | 'email' = (defaultChannel as 'both' | 'whatsapp' | 'sms' | 'email') || 'both';
      const resolvedTarget = getSavedTarget();
      setTarget(resolvedTarget);
      setChannel(activeChannel);
      handleSendOtp(resolvedTarget, activeChannel);
    } else {
      setIsSent(false);
      setDigits(['', '', '', '']);
      setError(null);
    }
  }, [isOpen, defaultTarget, defaultChannel]);

  useEffect(() => {
    let interval: any;
    if (isSent && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isSent, timer]);

  const handleSendOtp = async (targetVal: string, ch: 'both' | 'whatsapp' | 'sms' | 'email') => {
    if (!targetVal.trim()) {
      setError('Please enter a valid phone number or email address.');
      return;
    }
    setError(null);
    setIsSending(true);

    try {
      const res = await fetch(apiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: targetVal, channel: ch }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchedReal(true);
      } else {
        setError(data.error || 'Failed to dispatch verification code. Please check the phone number.');
      }
    } catch {
      setError('Failed to reach verification gateway. Please check your internet connection.');
    } finally {
      setIsSending(false);
      setIsSent(true);
      setTimer(60);
      setDigits(['', '', '', '']);
      playArrivalChime();
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 150);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);
    setError(null);

    if (cleanVal && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (newDigits.every((d) => d !== '')) {
      const enteredCode = newDigits.join('');
      verifyCode(enteredCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '').slice(0, 4);
    if (pasteData.length === 4) {
      const split = pasteData.split('');
      setDigits(split);
      verifyCode(pasteData);
    }
  };

  const verifyCode = async (code: string) => {
    if (!code || code.length !== 4) {
      setError('Please enter all 4 digits received on WhatsApp.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch(apiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, code }),
      });
      const data = await res.json();

      if (res.ok && data.verified) {
        playSuccessChime();
        if (onSuccess) onSuccess(target);
        if (onVerifySuccess) onVerifySuccess();
        onClose();
      } else {
        setError(data.error || 'Incorrect OTP code. Please check your WhatsApp.');
      }
    } catch {
      setError('Failed to connect to verification server. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 rounded-3xl shadow-2xl border border-slate-800 p-5 space-y-4 text-white animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-950/70 border border-blue-500/30 rounded-2xl text-blue-400 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">{title}</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {targetText || subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channel Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950/90 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setChannel('both');
              handleSendOtp(target, 'both');
            }}
            className={`flex items-center justify-center gap-1 py-2 text-[11px] font-black rounded-xl transition cursor-pointer ${
              channel === 'both' ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white shadow-xs border border-blue-600' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3 h-3 text-blue-300" /> Both (WA+SMS)
          </button>

          <button
            type="button"
            onClick={() => {
              setChannel('whatsapp');
              handleSendOtp(target, 'whatsapp');
            }}
            className={`flex items-center justify-center gap-1 py-2 text-[11px] font-black rounded-xl transition cursor-pointer ${
              channel === 'whatsapp' ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white shadow-xs border border-blue-600' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3 h-3 text-blue-300" /> WhatsApp
          </button>

          <button
            type="button"
            onClick={() => {
              setChannel('sms');
              handleSendOtp(target, 'sms');
            }}
            className={`flex items-center justify-center gap-1 py-2 text-[11px] font-black rounded-xl transition cursor-pointer ${
              channel === 'sms' ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white shadow-xs border border-blue-600' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3 h-3 text-blue-300" /> SMS Only
          </button>
        </div>

        {/* WhatsApp Verification Notice Card */}
        <div className="p-3.5 rounded-2xl border text-left bg-slate-900/90 border-slate-800 text-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-blue-300">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              WhatsApp OTP Verification
            </span>
            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
              +92 301 3519491
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            A genuine 4-digit verification code has been dispatched to your WhatsApp. Please enter the security code below.
          </p>
        </div>

        {/* Target Input */}
        <div>
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wide">
            Mobile Number (Receives WhatsApp & SMS)
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="+92 300 9876543"
              className="w-full bg-slate-950/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 border border-slate-700 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              disabled={isSending}
              onClick={() => handleSendOtp(target, channel)}
              className="px-3 py-2 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white rounded-xl text-xs font-black transition shrink-0 disabled:opacity-50 cursor-pointer border border-blue-900"
            >
              {isSending ? '...' : 'Resend'}
            </button>
          </div>
        </div>

        {/* 4-Digit Input Boxes */}
        <div>
          <label className="text-xs font-black text-slate-300 block text-center mb-2">
            Enter 4-Digit Code (from WhatsApp or SMS)
          </label>
          <div 
            className="flex justify-center gap-2.5"
            onPaste={handlePasteOtp}
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-12 text-center text-lg font-black text-white bg-slate-950/80 rounded-xl border-2 border-slate-700 focus:border-blue-500 focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none transition shadow-xs"
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="text-xs font-bold text-rose-400 text-center flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </p>
        )}

        {/* Verification Status / Countdown */}
        <div className="flex justify-between items-center text-xs text-slate-400 pt-1 border-t border-slate-800">
          <span>
            {timer > 0 ? (
              <span className="font-semibold text-slate-300">Resend in {timer}s</span>
            ) : (
              <button
                type="button"
                onClick={() => handleSendOtp(target, channel)}
                className="text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Resend Both
              </button>
            )}
          </span>

          <span className="text-[10px] font-bold text-slate-400">PathShare Dual-Sync</span>
        </div>

        {/* Verify Button */}
        <button
          type="button"
          disabled={isVerifying}
          onClick={() => {
            const entered = digits.join('');
            verifyCode(entered);
          }}
          className="w-full py-3 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white rounded-xl font-black text-xs transition shadow-md border border-blue-900 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-blue-300" /> Apply Code & Verify ➔
            </>
          )}
        </button>
      </div>
    </div>
  );
};
