import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  Mail, 
  MessageCircle,
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { playArrivalChime, playSuccessChime } from '../lib/sound';
import { signInWithGoogle, saveOtpVerificationToFirestore, markOtpVerificationVerified } from '../lib/firebase';
import { apiUrl } from '../lib/api';

interface LoginScreenProps {
  onLogin: (credentials?: { method: 'whatsapp' | 'sms' | 'both' | 'email' | 'phone'; identifier: string }) => void;
  onToast: (msg: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onToast }) => {
  // Method tab: 'whatsapp' | 'sms' | 'email'
  const [authMethod, setAuthMethod] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');

  // Phone Inputs with smart persistence
  const [countryCode, setCountryCode] = useState('+92');
  const [operatorCode, setOperatorCode] = useState(() => {
    return localStorage.getItem('pathshare_last_op') || '323';
  });
  const [subscriberNumber, setSubscriberNumber] = useState(() => {
    return localStorage.getItem('pathshare_last_sub') || '2072251';
  });

  // Email Input
  const [emailAddress, setEmailAddress] = useState(() => {
    return localStorage.getItem('pathshare_last_email') || 'ameedtabish83@gmail.com';
  });

  // Flow State: false = ameed.surge.sh splash screen, true = OTP verification card
  const [showOtpFlow, setShowOtpFlow] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);

  // Email + Handset security controls
  const [sendHandsetCopy, setSendHandsetCopy] = useState(true);
  const [handsetDispatched, setHandsetDispatched] = useState(false);

  const operatorRef = useRef<HTMLInputElement>(null);
  const subscriberRef = useRef<HTMLInputElement>(null);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const fullPhoneNumber = `${countryCode} ${operatorCode} ${subscriberNumber}`.trim();
  const currentIdentifier = authMethod === 'email' ? emailAddress : fullPhoneNumber;

  // Resend timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, resendTimer]);

  // Google Sign-In with mandatory OTP / handset verification control
  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setVerificationError(null);
    try {
      const result = await signInWithGoogle();
      const resolvedEmail = result?.user?.email || emailAddress || 'ameedtabish83@gmail.com';
      setEmailAddress(resolvedEmail);
      setAuthMethod('email');
      localStorage.setItem('pathshare_last_email', resolvedEmail);

      // Trigger OTP dispatch to email and handset
      onToast(`Google account connected (${resolvedEmail}). Dispatching verification code...`);

      let data: any = null;
      try {
        const response = await fetch(apiUrl('/api/auth/send-otp'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target: resolvedEmail,
            channel: 'email',
            handset: sendHandsetCopy ? fullPhoneNumber : undefined,
          }),
        });
        if (response.ok) {
          data = await response.json();
        }
      } catch (e) {
        console.warn('Backend server unavailable (e.g. Surge static deployment), switching to static fallback:', e);
      }

      // Static hosting fallback (for Surge.sh, GitHub Pages, etc.)
      if (!data || !data.success) {
        const fallbackCode = Math.floor(1000 + Math.random() * 9000).toString();
        sessionStorage.setItem(`pathshare_otp_${resolvedEmail}`, fallbackCode);
        saveOtpVerificationToFirestore(resolvedEmail, fallbackCode, 'email').catch(() => {});
        data = {
          success: true,
          code: fallbackCode,
          handsetDispatched: false,
          message: `Verification code: ${fallbackCode} (Offline/Surge Ready)`,
        };
      }

      if (data.success) {
        setOtpSent(true);
        setResendTimer(60);
        setOtpCode(['', '', '', '']);
        if (data.handsetDispatched) setHandsetDispatched(true);
        playArrivalChime();
        onToast(data.message || `Verification code sent to ${resolvedEmail}`);

        setTimeout(() => {
          inputRefs[0].current?.focus();
        }, 150);
      } else {
        onToast(data.error || 'Failed to dispatch verification code. Please enter email below.');
      }
    } catch (err: any) {
      console.warn('Google sign in popup closed or cancelled:', err);
      setAuthMethod('email');
      onToast('Google authentication cancelled. Please enter your email below.');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handlePhonePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').trim();
    let digits = paste.replace(/[^0-9]/g, '');
    
    if (digits.startsWith('92') && digits.length >= 12) {
      digits = digits.slice(2);
    }
    if (digits.startsWith('0')) {
      digits = digits.slice(1);
    }

    if (digits.length >= 3) {
      setOperatorCode(digits.slice(0, 3));
      setSubscriberNumber(digits.slice(3, 10));
      subscriberRef.current?.focus();
    } else {
      setOperatorCode(digits);
    }
  };

  const handleOperatorChange = (val: string) => {
    let clean = val.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = clean.slice(1);
    clean = clean.slice(0, 3);
    setOperatorCode(clean);
    if (clean.length === 3) {
      subscriberRef.current?.focus();
    }
  };

  const handleSubscriberChange = (val: string) => {
    const clean = val.replace(/[^0-9]/g, '').slice(0, 7);
    setSubscriberNumber(clean);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if ((authMethod === 'whatsapp' || authMethod === 'sms') && (!operatorCode || !subscriberNumber)) {
      onToast('Please enter your complete phone number');
      return;
    }
    if (authMethod === 'email' && !emailAddress.trim()) {
      onToast('Please enter a valid email address');
      return;
    }

    if (operatorCode) localStorage.setItem('pathshare_last_op', operatorCode);
    if (subscriberNumber) localStorage.setItem('pathshare_last_sub', subscriberNumber);
    if (emailAddress) localStorage.setItem('pathshare_last_email', emailAddress.trim());

    setIsSending(true);
    setVerificationError(null);
    setHandsetDispatched(false);

    let data: any = null;
    try {
      const response = await fetch(apiUrl('/api/auth/send-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: currentIdentifier,
          channel: authMethod,
          handset: authMethod === 'email' && sendHandsetCopy ? fullPhoneNumber : undefined,
        }),
      });
      if (response.ok) {
        data = await response.json();
      } else {
        const errData = await response.json().catch(() => null);
        data = { success: false, error: errData?.error || 'Failed to dispatch verification code.' };
      }
    } catch (e) {
      console.warn('Backend server unavailable:', e);
      data = { success: false, error: 'Cannot connect to authentication server. Please check your network connection.' };
    }

    if (data?.success) {
      setOtpSent(true);
      setResendTimer(60);
      setOtpCode(['', '', '', '']);
      if (data.handsetDispatched) setHandsetDispatched(true);
      playArrivalChime();
      onToast(data.message || `Verification code sent to ${currentIdentifier}`);

      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 150);
    } else {
      const errMsg = data?.error || `Failed to send verification code. Please check your ${authMethod === 'email' ? 'email' : 'number'}.`;
      setVerificationError(errMsg);
      onToast(errMsg);
    }
    setIsSending(false);
  };

  const handleVerifyOtp = async (e?: React.FormEvent, codeToVerify?: string) => {
    if (e) e.preventDefault();
    const entered = codeToVerify || otpCode.join('');

    if (!entered || entered.length !== 4) {
      setVerificationError(`Please enter all 4 digits received via ${authMethod === 'email' ? 'email or handset' : 'WhatsApp'}.`);
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    let verified = false;
    let data: any = null;

    try {
      const response = await fetch(apiUrl('/api/auth/verify-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: currentIdentifier,
          code: entered,
        }),
      });

      if (response.ok) {
        data = await response.json();
        if (data.verified) verified = true;
      }
    } catch {
      // Network failure
    }

    if (verified) {
      playSuccessChime();
      markOtpVerificationVerified(currentIdentifier, entered);
      onToast('Verification successful! Welcome to PathShare.');
      onLogin({
        method: authMethod,
        identifier: currentIdentifier,
      });
    } else {
      const errorMsg = data?.error || `Incorrect verification code. Please check ${authMethod === 'email' ? 'your email inbox or handset message' : 'your WhatsApp'}.`;
      setVerificationError(errorMsg);
      onToast(errorMsg);
    }
    setIsVerifying(false);
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(-1);
    const newCode = [...otpCode];
    newCode[index] = cleanVal;
    setOtpCode(newCode);
    setVerificationError(null);

    if (cleanVal && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (newCode.every((d) => d !== '')) {
      handleVerifyOtp(undefined, newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePasteOtp = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '').slice(0, 4);
    if (pasteData.length === 4) {
      setOtpCode(pasteData.split(''));
      handleVerifyOtp(undefined, pasteData);
    }
  };

  const handleWhatsAppContinue = () => {
    setAuthMethod('whatsapp');
    setShowOtpFlow(true);
    setOtpSent(false);
    setVerificationError(null);
  };

  // 1. SPLASH / LOGIN matching ameed.surge.sh
  if (!showOtpFlow) {
    return (
      <div id="screen-login" className="min-h-screen bg-gradient-to-br from-sky-600 to-indigo-700 text-white flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur shadow-lg">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">PathShare</h1>
          <p className="text-sky-100 mt-2 text-sm">
            Share your empty seats.<br />
            Not a taxi — just people going your way.
          </p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <button
            id="login-btn-whatsapp"
            type="button"
            onClick={handleWhatsAppContinue}
            className="w-full bg-white text-sky-700 hover:bg-sky-50 font-semibold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Continue with WhatsApp</span>
          </button>

          <button
            id="login-btn-otp"
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setShowOtpFlow(true);
              setOtpSent(false);
              setVerificationError(null);
            }}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
          >
            <Mail className="w-5 h-5" />
            <span>Email / Phone OTP</span>
          </button>
        </div>

        <p className="text-xs text-sky-200 mt-8 text-center max-w-xs">
          Non-commercial cost-sharing only. Drivers must not use this as a taxi service.
        </p>
      </div>
    );
  }

  // 2. OTP FLOW VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-600 to-indigo-700 text-slate-800 flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans">
      
      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 my-auto">
        
        {/* Back navigation */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              setShowOtpFlow(false);
              setOtpSent(false);
            }}
            className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-800 font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Splash</span>
          </button>

          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Verification
          </span>
        </div>
        
        {!otpSent ? (
          <>
            {/* Google 1-Click Login */}
            <button
              id="google-signin-btn"
              type="button"
              disabled={isGoogleSigningIn}
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs flex items-center justify-center gap-3 transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isGoogleSigningIn ? (
                <>
                  <RefreshCw className="w-4 h-4 text-slate-700 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.41 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.59 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Subtle Divider */}
            <div className="flex items-center gap-3 my-1">
              <span className="flex-1 border-t border-slate-200"></span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">or sign in with</span>
              <span className="flex-1 border-t border-slate-200"></span>
            </div>

            {/* Switcher with WhatsApp, SMS, Email in Sky Blue tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              {/* WhatsApp Button */}
              <button
                id="login-tab-whatsapp"
                type="button"
                onClick={() => setAuthMethod('whatsapp')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  authMethod === 'whatsapp'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              {/* SMS Button */}
              <button
                id="login-tab-sms"
                type="button"
                onClick={() => setAuthMethod('sms')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  authMethod === 'sms'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>SMS</span>
              </button>

              {/* Email Button */}
              <button
                id="login-tab-email"
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  authMethod === 'email'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendOtp} className="space-y-4">
              {authMethod === 'whatsapp' || authMethod === 'sms' ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-700">
                      {authMethod === 'whatsapp' ? 'WhatsApp Phone Number' : 'Mobile Number for SMS'}
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {authMethod === 'whatsapp' ? 'Instant WhatsApp OTP' : 'Cellular SMS OTP'}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2" onPaste={handlePhonePaste}>
                    {/* Country Code */}
                    <div className="col-span-3">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full bg-slate-50 text-slate-800 font-bold rounded-xl px-1.5 py-2.5 text-xs outline-none border border-slate-200 focus:border-slate-800 focus:bg-white transition text-center cursor-pointer"
                      >
                        <option value="+92">🇵🇰 +92</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+966">🇸🇦 +966</option>
                      </select>
                    </div>

                    {/* Network Code */}
                    <div className="col-span-3">
                      <input
                        ref={operatorRef}
                        type="tel"
                        maxLength={3}
                        value={operatorCode}
                        onChange={(e) => handleOperatorChange(e.target.value)}
                        placeholder="300"
                        className="w-full bg-slate-50 text-slate-900 font-mono font-bold placeholder-slate-400 text-center rounded-xl px-2 py-2.5 text-sm outline-none border border-slate-200 focus:border-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-100 transition"
                        required
                      />
                    </div>

                    {/* Subscriber Number */}
                    <div className="col-span-6">
                      <input
                        ref={subscriberRef}
                        type="tel"
                        maxLength={7}
                        value={subscriberNumber}
                        onChange={(e) => handleSubscriberChange(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !subscriberNumber) {
                            operatorRef.current?.focus();
                          }
                        }}
                        placeholder="9876543"
                        className="w-full bg-slate-50 text-slate-900 font-mono font-bold placeholder-slate-400 rounded-xl px-3 py-2.5 text-sm outline-none border border-slate-200 focus:border-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-100 transition tracking-wider"
                        required
                      />
                    </div>
                  </div>

                  {/* Business Sender vs Recipient Detection */}
                  {operatorCode === '301' && subscriberNumber === '3519491' && (
                    <div className="mt-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Important:</span> <strong>0301-3519491</strong> is your official <strong>PathShare Business Sender</strong>. WhatsApp Cloud API blocks a number from sending messages to itself. 
                        Please enter your <strong>personal phone number</strong> to receive the WhatsApp OTP!
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {authMethod === 'whatsapp' 
                      ? 'We will deliver a 4-digit security code directly via WhatsApp from +92 301 3519491.'
                      : 'We will deliver a 4-digit security code via standard SMS.'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700">
                        Work or Personal Email
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        Email OTP Verification
                      </span>
                    </div>
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-slate-50 text-slate-900 font-medium placeholder-slate-400 rounded-xl px-3.5 py-2.5 text-sm outline-none border border-slate-200 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition"
                      required
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      We will deliver a 4-digit verification security code to this address.
                    </p>
                  </div>

                  {/* Handset verification alert option */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sendHandsetCopy}
                        onChange={(e) => setSendHandsetCopy(e.target.checked)}
                        className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                      />
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                        <span>Send copy to handset via WhatsApp</span>
                      </div>
                    </label>
                    {sendHandsetCopy && (
                      <div className="text-[11px] text-slate-600 pl-6 flex items-center justify-between">
                        <span>Handset: <strong className="font-mono text-slate-800">{fullPhoneNumber}</strong></span>
                        <span className="text-[10px] text-sky-700 bg-sky-100 font-bold px-1.5 py-0.5 rounded">WhatsApp Alert</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button styled with Sky Blue */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Sending {authMethod === 'whatsapp' ? 'WhatsApp' : authMethod === 'sms' ? 'SMS' : 'Email'} Code...</span>
                  </>
                ) : (
                  <>
                    {authMethod === 'whatsapp' && <MessageCircle className="w-4 h-4 text-white" />}
                    {authMethod === 'sms' && <MessageSquare className="w-4 h-4 text-white" />}
                    {authMethod === 'email' && <Mail className="w-4 h-4 text-white" />}
                    <span>
                      {authMethod === 'whatsapp'
                        ? 'Send OTP via WhatsApp'
                        : authMethod === 'sms'
                        ? 'Send OTP via SMS'
                        : sendHandsetCopy
                        ? 'Send Email OTP & Handset Alert'
                        : 'Send Verification Code'}
                    </span>
                    <ArrowRight className="w-4 h-4 ml-1 text-white" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Step 2: Verification View */
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  {authMethod === 'whatsapp' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      <MessageCircle className="w-3 h-3 text-sky-600" /> WhatsApp
                    </span>
                  )}
                  {authMethod === 'sms' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      <MessageSquare className="w-3 h-3 text-sky-600" /> SMS
                    </span>
                  )}
                  {authMethod === 'email' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                      <Mail className="w-3 h-3 text-sky-600" /> Email
                    </span>
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Verification
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900 font-mono">
                  {currentIdentifier}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtpCode(['', '', '', '']);
                }}
                className="text-xs text-slate-700 hover:text-slate-900 font-bold cursor-pointer bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition"
              >
                Change
              </button>
            </div>

            {/* Delivery Notice */}
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                {authMethod === 'email' ? (
                  <Mail className="w-5 h-5 text-white" />
                ) : authMethod === 'sms' ? (
                  <MessageSquare className="w-5 h-5 text-white" />
                ) : (
                  <MessageCircle className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="text-xs text-slate-700 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {authMethod === 'email' ? 'Check Your Email Inbox' : authMethod === 'sms' ? 'Check Your SMS' : 'Check Your WhatsApp'}
                  </span>
                  <span className="font-mono text-[10px] text-sky-700 bg-sky-100 font-bold px-1.5 py-0.5 rounded">
                    {authMethod === 'email' ? 'Inbox OTP' : '+92 301 3519491'}
                  </span>
                </div>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {authMethod === 'email'
                    ? `We've sent a 4-digit security code to ${emailAddress}. Please enter it below to confirm your identity.`
                    : authMethod === 'sms'
                    ? 'We have delivered a 4-digit security code via standard SMS.'
                    : "We've dispatched a 4-digit verification code to your WhatsApp (+92 301 3519491)."}
                </p>
                {authMethod === 'email' && handsetDispatched && (
                  <div className="mt-2 pt-2 border-t border-sky-200/60 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Security code also delivered to your handset via WhatsApp ({fullPhoneNumber}).</span>
                  </div>
                )}
              </div>
            </div>

            {verificationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{verificationError}</span>
              </div>
            )}

            {/* 4 Digit Inputs */}
            <div>
              <label className="text-xs font-bold text-slate-700 block text-center mb-2">
                Enter 4-Digit Code
              </label>
              <div 
                className="flex justify-center gap-2.5"
                onPaste={handlePasteOtp}
              >
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    ref={inputRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={otpCode[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-xl font-bold text-slate-900 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 outline-none transition"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-600/30 transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Verify & Enter PathShare</span>
                </>
              )}
            </button>

            {/* Resend Action */}
            <div className="text-center text-xs text-slate-500 pt-1 space-y-1.5">
              {resendTimer > 0 ? (
                <div>Resend code in <strong className="text-slate-800">{resendTimer}s</strong></div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="text-sky-700 hover:text-sky-900 hover:underline font-bold cursor-pointer"
                  >
                    Resend via {authMethod === 'email' ? 'Email' : authMethod === 'sms' ? 'SMS' : 'WhatsApp'}
                  </button>

                  {authMethod === 'email' && (
                    <>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMethod('whatsapp');
                          setOtpSent(false);
                        }}
                        className="text-slate-700 hover:text-slate-900 hover:underline font-bold cursor-pointer"
                      >
                        Switch to WhatsApp OTP
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Clean Trust Footer */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 py-4">
        <ShieldCheck className="w-4 h-4 text-slate-700" />
        <span>Verified Community Carpool</span>
      </div>

    </div>
  );
};
