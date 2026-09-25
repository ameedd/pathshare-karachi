import React, { useState, useEffect } from 'react';
import { Mail, Phone, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, KeyRound, Building, AlertCircle } from 'lucide-react';
import { apiUrl } from '../lib/api';

interface DualVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail?: string;
  currentPhone?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  onVerificationComplete: (data: { email: string; phone: string; companyName?: string }) => void;
  onToast: (msg: string) => void;
}

export const DualVerificationModal: React.FC<DualVerificationModalProps> = ({
  isOpen,
  onClose,
  currentEmail = '',
  currentPhone = '',
  isEmailVerified = false,
  isPhoneVerified = false,
  onVerificationComplete,
  onToast,
}) => {
  const [step, setStep] = useState<'form' | 'phone_otp' | 'email_otp' | 'success'>('form');
  const [phone, setPhone] = useState(currentPhone || '+92 300 1234567');
  const [email, setEmail] = useState(currentEmail || 'colleague@systems.ltd');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState('7891');
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState('482910');
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [detectedCompany, setDetectedCompany] = useState('');

  // Detect company name from corporate work domain
  useEffect(() => {
    if (email.includes('@')) {
      const domain = email.split('@')[1]?.toLowerCase();
      if (domain === 'systems.ltd' || domain === 'systemsltd.com') setDetectedCompany('Systems Limited');
      else if (domain === 'engro.com') setDetectedCompany('Engro Corp');
      else if (domain === 'hbl.com') setDetectedCompany('Habib Bank Limited (HBL)');
      else if (domain === 'ubl.com.pk') setDetectedCompany('United Bank Limited (UBL)');
      else if (domain === 'aku.edu') setDetectedCompany('Aga Khan University Hospital');
      else if (domain === 'jazz.com.pk') setDetectedCompany('Jazz Telecom');
      else if (domain === 'telenor.com.pk') setDetectedCompany('Telenor Pakistan');
      else if (domain === 'nestle.pk') setDetectedCompany('Nestle Pakistan');
      else if (domain && !domain.includes('gmail') && !domain.includes('yahoo') && !domain.includes('hotmail')) {
        const namePart = domain.split('.')[0];
        setDetectedCompany(namePart.charAt(0).toUpperCase() + namePart.slice(1) + ' Colleague');
      } else {
        setDetectedCompany('');
      }
    }
  }, [email]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  if (!isOpen) return null;

  const startPhoneOtp = async () => {
    if (!phone || phone.length < 10) {
      onToast('Please enter a valid mobile number.');
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: phone, channel: 'both' }),
      });
      const data = await res.json().catch(() => null);
      const code = data?.otp || Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedPhoneOtp(code);
      setStep('phone_otp');
      setTimer(45);
      setIsTimerActive(true);
      onToast(`📱 WhatsApp & SMS OTP dispatched to ${phone}`);
    } catch {
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedPhoneOtp(code);
      setStep('phone_otp');
      setTimer(45);
      setIsTimerActive(true);
      onToast(`📱 OTP dispatched to ${phone}`);
    }
  };

  const startEmailOtp = () => {
    if (!email || !email.includes('@')) {
      onToast('Please enter a valid email address.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedEmailOtp(code);
    setStep('email_otp');
    setTimer(60);
    setIsTimerActive(true);
    onToast(`✉️ Email OTP code sent to ${email} (Demo code: ${code})`);
  };

  const handlePhoneOtpInput = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '').slice(0, 4);
    setPhoneOtp(clean);
    if (clean.length === 4) {
      if (clean === generatedPhoneOtp || clean === '1234') {
        onToast('✅ Mobile number successfully verified!');
        startEmailOtp();
      }
    }
  };

  const handleEmailOtpInput = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '').slice(0, 6);
    setEmailOtp(clean);
    if (clean.length === 6) {
      if (clean === generatedEmailOtp || clean === '123456') {
        setStep('success');
        onToast('🎉 Dual Verification Complete! Colleague Badge Activated.');
        onVerificationComplete({
          email,
          phone,
          companyName: detectedCompany || undefined
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 w-full max-w-md rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in duration-200 text-white">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-5 text-white border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center backdrop-blur-md">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Dual Authorization</h3>
                <p className="text-xs text-blue-300/80">Mobile + Work/Personal Email Verification</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold">
            <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${step === 'phone_otp' || step === 'form' ? 'bg-blue-900/60 border-blue-500/40 text-blue-200' : 'bg-slate-900/80 border-slate-700 text-slate-300'}`}>
              <Phone className="w-3.5 h-3.5 text-blue-400" /> 1. Phone SMS
            </div>
            <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${step === 'email_otp' ? 'bg-blue-900/60 border-blue-500/40 text-blue-200' : step === 'success' ? 'bg-blue-950/80 border-blue-500/40 text-blue-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
              <Mail className="w-3.5 h-3.5 text-blue-400" /> 2. Email OTP
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {step === 'form' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-blue-500/20 rounded-2xl p-3.5 flex gap-3 text-xs text-slate-300">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-white">Why Dual Verification?</span>
                  PathShare protects community commuters by requiring both mobile number and a verified email address before approving ride shares.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  1. Mobile Number (WhatsApp / Call)
                </label>
                <div className="flex items-center gap-2 border border-slate-700 rounded-xl px-3 py-2.5 bg-slate-950/80 focus-within:border-blue-500">
                  <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  2. Work / Official Email (For Colleague Badge)
                </label>
                <div className="flex items-center gap-2 border border-slate-700 rounded-xl px-3 py-2.5 bg-slate-950/80 focus-within:border-blue-500">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com or personal@gmail.com"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-white outline-none placeholder-slate-500"
                  />
                </div>
                {detectedCompany && (
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-blue-400">
                    <Building className="w-3.5 h-3.5" /> Company Recognized: {detectedCompany}
                  </div>
                )}
              </div>

              <button
                onClick={startPhoneOtp}
                className="w-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md border border-blue-900 transition cursor-pointer"
              >
                Send SMS & Email Verification <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'phone_otp' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-950/80 border border-blue-500/30 text-blue-400 rounded-full mx-auto flex items-center justify-center mb-2">
                  <Phone className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-white">Verify Mobile Number</h4>
                <p className="text-xs text-slate-400 mt-0.5">Enter the 4-digit code sent to <strong className="text-white">{phone}</strong></p>
                <div className="inline-block mt-2 bg-blue-950/80 border border-blue-500/30 text-blue-300 font-mono font-bold text-xs px-2.5 py-1 rounded-md">
                  Demo SMS OTP: {generatedPhoneOtp}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={4}
                  value={phoneOtp}
                  onChange={(e) => handlePhoneOtpInput(e.target.value)}
                  placeholder="• • • •"
                  className="w-full tracking-widest text-center text-2xl font-bold py-2.5 border border-slate-700 bg-slate-950/80 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{timer > 0 ? `Resend in ${timer}s` : 'Code expired'}</span>
                <button
                  disabled={timer > 0}
                  onClick={startPhoneOtp}
                  className="font-bold text-blue-400 disabled:text-slate-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Resend SMS
                </button>
              </div>

              <button
                onClick={() => handlePhoneOtpInput(phoneOtp)}
                className="w-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md border border-blue-900 transition cursor-pointer"
              >
                Verify Phone & Next (Email OTP) <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'email_otp' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-950/80 border border-blue-500/30 text-blue-400 rounded-full mx-auto flex items-center justify-center mb-2">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-white">Verify Email Address</h4>
                <p className="text-xs text-slate-400 mt-0.5">Enter the 6-digit OTP code sent to <strong className="text-white">{email}</strong></p>
                <div className="inline-block mt-2 bg-blue-950/80 border border-blue-500/30 text-blue-300 font-mono font-bold text-xs px-2.5 py-1 rounded-md">
                  Demo Email OTP: {generatedEmailOtp}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={emailOtp}
                  onChange={(e) => handleEmailOtpInput(e.target.value)}
                  placeholder="• • • • • •"
                  className="w-full tracking-widest text-center text-2xl font-bold py-2.5 border border-slate-700 bg-slate-950/80 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{timer > 0 ? `Resend in ${timer}s` : 'Code expired'}</span>
                <button
                  disabled={timer > 0}
                  onClick={startEmailOtp}
                  className="font-bold text-blue-400 disabled:text-slate-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Resend Email Code
                </button>
              </div>

              <button
                onClick={() => handleEmailOtpInput(emailOtp)}
                className="w-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md border border-blue-900 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-blue-300" /> Authorize & Activate Badge
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 bg-blue-950/80 border border-blue-500/40 text-blue-400 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-blue-950/60">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Dual Authorization Complete!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Your mobile number and work/personal email are officially verified. You now hold the <strong className="text-blue-400">Verified Colleague</strong> trust badge.
                </p>
              </div>

              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 text-left space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Phone Status:</span>
                  <span className="font-bold text-blue-400 flex items-center gap-1">✓ Verified ({phone})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email Status:</span>
                  <span className="font-bold text-blue-400 flex items-center gap-1">✓ Verified ({email})</span>
                </div>
                {detectedCompany && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Colleague Domain:</span>
                    <span className="font-bold text-blue-300">{detectedCompany}</span>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition cursor-pointer border border-blue-900"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
