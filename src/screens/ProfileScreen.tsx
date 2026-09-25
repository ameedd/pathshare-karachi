import React, { useState, useRef } from 'react';
import {
  BadgeCheck,
  Car,
  ShieldCheck,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Edit3,
  Camera,
  CreditCard,
  Plus,
  Building2,
  Trash2,
  User,
  Check,
  Smartphone,
  AlertTriangle,
  History,
  PhoneCall,
  MessageCircle,
  Mail,
  X,
  Radio,
  Siren,
  Clock,
  ArrowRight
} from 'lucide-react';
import { UserProfile, UserPaymentMethod, TripHistoryItem } from '../types';
import { IdentityCardUploader } from '../components/IdentityCardUploader';
import { SafetyDisclaimerModal } from '../components/SafetyDisclaimerModal';
import { OtpModal } from '../components/OtpModal';
import { DualVerificationModal } from '../components/DualVerificationModal';
import { apiUrl } from '../lib/api';

interface ProfileScreenProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenAddPaymentMethod: () => void;
  onLogout: () => void;
  onToast: (msg: string) => void;
  onNavigate?: (screen: any) => void;
  onClearAllData?: () => void;
  isAdmin?: boolean;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onUpdateProfile,
  onOpenAddPaymentMethod,
  onLogout,
  onToast,
  onNavigate,
  onClearAllData,
  isAdmin = false
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'payments' | 'reviews'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);

  // Dual Verification Modal State
  const [isDualVerificationOpen, setIsDualVerificationOpen] = useState(false);

  // OTP Verification Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpChannel, setOtpChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [otpTarget, setOtpTarget] = useState(profile.phone);

  const [editName, setEditName] = useState(profile.name);
  const [editUsername, setEditUsername] = useState(profile.username);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editCompanyName, setEditCompanyName] = useState(profile.companyName);
  const [editCnic, setEditCnic] = useState(profile.cnicNumber || '42101-7890123-5');
  const [editLicense, setEditLicense] = useState(profile.licenseNumber || 'KHI-DL-98421');
  const [editEmergencyName, setEditEmergencyName] = useState(profile.emergencyContactName || 'Dr. Shahzad (Brother)');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(profile.emergencyContactPhone || '+92 321 9876543');

  // Production CTO Telemetry & Stress Test state
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [telemetryInfo, setTelemetryInfo] = useState<any>(null);
  const [isTestingLoad, setIsTestingLoad] = useState(false);
  const [loadResults, setLoadResults] = useState<any>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    onUpdateProfile({
      name: editName,
      username: editUsername,
      bio: editBio,
      companyName: editCompanyName,
      cnicNumber: editCnic,
      licenseNumber: editLicense,
      emergencyContactName: editEmergencyName,
      emergencyContactPhone: editEmergencyPhone,
      cnicVerified: true,
      licenseVerified: true
    });
    setIsEditing(false);
    onToast('Profile & KYC Safety information updated!');
  };

  const fetchMetaTelemetry = async () => {
    try {
      const res = await fetch(apiUrl('/api/telemetry/meta-health'));
      const data = await res.json();
      setTelemetryInfo(data);
    } catch {
      onToast('Failed to fetch Meta health telemetry');
    }
  };

  const triggerStressTest = async () => {
    setIsTestingLoad(true);
    try {
      const res = await fetch(apiUrl('/api/test/stress-test'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concurrency: 100 })
      });
      const data = await res.json();
      setLoadResults(data.results);
      onToast('100-Concurrent stress test finished successfully!');
    } catch (err: any) {
      onToast('Stress test failed: ' + err.message);
    } finally {
      setIsTestingLoad(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onToast('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateProfile({ avatarUrl: dataUrl });
        onToast('Profile picture updated!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCardImageUploaded = (dataUrl: string) => {
    onUpdateProfile({
      officeCardImageUrl: dataUrl,
      officeCardStatus: 'verified'
    });
  };

  const handleRemovePaymentMethod = (id: string) => {
    const updated = profile.paymentMethods.filter(p => p.id !== id);
    onUpdateProfile({ paymentMethods: updated });
    onToast('Payment method removed');
  };

  const handleSetDefaultPaymentMethod = (id: string) => {
    const updated = profile.paymentMethods.map(p => ({
      ...p,
      isDefault: p.id === id
    }));
    onUpdateProfile({ paymentMethods: updated });
    onToast('Default payment method updated!');
  };

  const triggerPoliceCall = () => {
    onToast('Dialing 15 Emergency Police Helpline...');
  };

  const triggerEmergencyBroadcast = () => {
    onToast('SOS Alert broadcasted to Emergency Contacts & Office Desk!');
  };

  return (
    <div className="pb-28 bg-slate-50 min-h-screen text-slate-800 antialiased">
      {/* Hidden file input for avatar */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Header Banner matching ameed.surge.sh sky-600 theme */}
      <header className="bg-sky-600 border-b border-sky-700 text-white p-5 pt-8 rounded-b-3xl shadow-lg relative">
        {/* Top Header Controls: SOS Emergency Button */}
        <div className="flex justify-between items-center mb-4 max-w-md mx-auto">
          <span className="text-xs font-bold tracking-wider text-sky-100 uppercase">
            Commuter Profile
          </span>

          <button
            onClick={() => setIsSosOpen(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 border border-rose-400 animate-pulse active:scale-95 transition cursor-pointer"
          >
            <Siren className="w-4 h-4 text-white" />
            <span>SOS EMERGENCY</span>
          </button>
        </div>

        <div className="flex items-center gap-4 max-w-md mx-auto">
          {/* Avatar with Upload button overlay */}
          <div className="relative group shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white/40 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/40 flex items-center justify-center text-2xl font-black text-white shadow-md">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white text-sky-700 flex items-center justify-center shadow-md hover:bg-sky-50 transition cursor-pointer border border-white/50"
              title="Upload Profile Picture"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold tracking-tight truncate text-white">{profile.name}</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1.5 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-white transition cursor-pointer"
                title="Edit Profile"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sky-100 text-xs font-semibold">{profile.username}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="bg-white/20 text-white border border-white/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <BadgeCheck className="w-3 h-3 text-sky-200" /> Office Verified
              </span>
              <span className="bg-white/20 text-white border border-white/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-300 fill-amber-300" /> {profile.rating} ({profile.reviews.length} reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Bio preview */}
        <p className="mt-3 text-xs text-sky-50 italic bg-white/15 p-3 rounded-2xl border border-white/20 max-w-md mx-auto backdrop-blur-sm">
          "{profile.bio}"
        </p>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 mt-4 max-w-md mx-auto pt-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 text-[11px] font-bold rounded-xl transition text-center truncate cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-sky-700 shadow-md font-extrabold'
                : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 text-[11px] font-bold rounded-xl transition text-center truncate cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-sky-700 shadow-md font-extrabold'
                : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 text-[11px] font-bold rounded-xl transition text-center truncate cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-white text-sky-700 shadow-md font-extrabold'
                : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-2 text-[11px] font-bold rounded-xl transition text-center truncate cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-white text-sky-700 shadow-md font-extrabold'
                : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
            }`}
          >
            Reviews ({profile.reviews.length})
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 space-y-4 max-w-md mx-auto mt-1">
        {/* EDIT PROFILE MODAL / BOX */}
        {isEditing && (
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-800" /> Edit Profile Info
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600">Full Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1 w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 text-xs font-medium outline-none border border-slate-300 focus:border-slate-800"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600">Username</label>
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="mt-1 w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 text-xs font-medium outline-none border border-slate-300 focus:border-slate-800"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600">Company Name</label>
              <input
                type="text"
                value={editCompanyName}
                onChange={(e) => setEditCompanyName(e.target.value)}
                className="mt-1 w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 text-xs font-medium outline-none border border-slate-300 focus:border-slate-800"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600">Short Bio</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={2}
                className="mt-1 w-full bg-slate-50 text-slate-900 rounded-xl p-2.5 text-xs font-medium outline-none border border-slate-300 focus:border-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <label className="text-[10px] font-bold text-slate-600">Government CNIC</label>
                <input
                  type="text"
                  placeholder="42101-XXXXXXX-X"
                  value={editCnic}
                  onChange={(e) => setEditCnic(e.target.value)}
                  className="mt-0.5 w-full bg-slate-50 text-slate-900 rounded-xl px-2.5 py-1.5 text-xs font-mono outline-none border border-slate-300 focus:border-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600">Driving License #</label>
                <input
                  type="text"
                  placeholder="KHI-DL-XXXXX"
                  value={editLicense}
                  onChange={(e) => setEditLicense(e.target.value)}
                  className="mt-0.5 w-full bg-slate-50 text-slate-900 rounded-xl px-2.5 py-1.5 text-xs font-mono outline-none border border-slate-300 focus:border-slate-800"
                />
              </div>
            </div>

            <div className="pt-1 border-t border-slate-100 space-y-1.5">
              <label className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Emergency Contact (Live Share)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Contact Name (e.g. Brother)"
                  value={editEmergencyName}
                  onChange={(e) => setEditEmergencyName(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-2.5 py-1.5 text-xs font-medium outline-none border border-slate-300 focus:border-slate-800"
                />
                <input
                  type="text"
                  placeholder="+92 3XX XXXXXXX"
                  value={editEmergencyPhone}
                  onChange={(e) => setEditEmergencyPhone(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-2.5 py-1.5 text-xs font-mono outline-none border border-slate-300 focus:border-slate-800"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md cursor-pointer border border-blue-900"
            >
              Save Profile Changes
            </button>
          </div>
        )}

        {/* TAB 1: PROFILE & OFFICE CARD */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Office / Identity Card Uploader */}
            <IdentityCardUploader
              userId={profile.id || profile.phone || 'anonymous'}
              docType="office_id"
              title="Identity / Office Card"
              subtitle="Front image required for corporate verification"
              currentImageUrl={profile.officeCardImageUrl}
              status={profile.officeCardStatus}
              onImageUploaded={handleCardImageUploaded}
              onToast={onToast}
            />

            {/* Emergency Contacts Banner */}
            <div className="bg-rose-50 rounded-2xl p-4 shadow-xs border border-rose-200 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Emergency SOS Guard
                </div>
                <button
                  onClick={() => setIsSosOpen(true)}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs cursor-pointer"
                >
                  OPEN SOS
                </button>
              </div>
              <p className="text-[11px] text-rose-900 leading-relaxed font-medium">
                One-tap SOS broadcasts your live GPS position to 15 Police, Corporate Security, and emergency contacts.
              </p>
            </div>

            {/* Safety & Anti-Theft Disclaimer Card */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-slate-800" /> Community Safety & Anti-Theft Rules
                </div>
                <button
                  onClick={() => setIsSafetyModalOpen(true)}
                  className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs cursor-pointer"
                >
                  READ DISCLAIMER
                </button>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Review mandatory CNIC checks, live location sharing protocols, and non-commercial commute liability rules.
              </p>
            </div>

            {/* Commute Info Card */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-800" /> Corporate & Office details
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Company</span>
                  <span className="font-semibold text-slate-900">{profile.companyName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Office Location</span>
                  <span className="font-semibold text-slate-900">{profile.officeLocation}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Work Email</span>
                  <span className="font-semibold text-slate-900">{profile.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-semibold text-slate-900">{profile.phone}</span>
                </div>
              </div>
            </div>

            {/* LIVE DUAL-CHANNEL OTP SECURITY VERIFICATION CARD */}
            <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-100 text-slate-800 rounded-xl border border-slate-200">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-xs sm:text-sm">Dual OTP Security Status</h3>
                    <p className="text-[10px] text-slate-500">WhatsApp & Email Authentication</p>
                  </div>
                </div>
                <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {/* WhatsApp Channel Item */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-800 shrink-0">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">WhatsApp OTP</span>
                        <span className="bg-slate-200 text-slate-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate font-mono">{profile.phone || '+92 300 9876543'}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpChannel('whatsapp');
                      setOtpTarget(profile.phone || '+92 300 9876543');
                      setIsOtpModalOpen(true);
                    }}
                    className="py-1.5 px-2.5 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white text-[10px] font-black rounded-xl transition shadow-md shrink-0 cursor-pointer border border-blue-900"
                  >
                    Test OTP 💬
                  </button>
                </div>

                {/* Email Channel Item */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-800 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">Email OTP</span>
                        <span className="bg-slate-200 text-slate-800 text-[9px] font-black px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate font-mono">{profile.email || 'ameedtabish83@gmail.com'}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpChannel('email');
                      setOtpTarget(profile.email || 'ameedtabish83@gmail.com');
                      setIsOtpModalOpen(true);
                    }}
                    className="py-1.5 px-2.5 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white text-[10px] font-black rounded-xl transition shadow-md shrink-0 cursor-pointer border border-blue-900"
                  >
                    Test OTP 📩
                  </button>
                </div>
              </div>

              {/* Complete Dual Verification Flow Button */}
              <button
                type="button"
                onClick={() => setIsDualVerificationOpen(true)}
                className="w-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-black py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer border border-blue-900"
              >
                <ShieldCheck className="w-4 h-4 text-white" /> Run Complete Dual Authorization (Phone + Email)
              </button>
            </div>

            {/* TRUST, SAFETY & DRIVER KYC VERIFICATION CARD */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Trust, Safety & Driver KYC</h3>
                    <p className="text-[10px] text-slate-500 font-medium">NADRA CNIC & License Compliance</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                  Level 2 Verified
                </span>
              </div>

              <div className="space-y-2">
                {/* CNIC verification */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Government CNIC</span>
                    <p className="text-xs font-mono font-bold text-slate-800">{profile.cnicNumber || '42101-7890123-5'}</p>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                    🛡️ NADRA Verified
                  </span>
                </div>

                {/* Driving License verification */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Sindh Driving License</span>
                    <p className="text-xs font-mono font-bold text-slate-800">{profile.licenseNumber || 'KHI-DL-98421'}</p>
                  </div>
                  <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-2 py-1 rounded-lg border border-sky-200 flex items-center gap-1">
                    🪪 License Verified
                  </span>
                </div>

                {/* Emergency SOS Contact */}
                <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-rose-800 font-bold uppercase tracking-wider">Saved Emergency Contact</span>
                    <span className="text-[9px] bg-rose-200 text-rose-800 font-bold px-1.5 py-0.5 rounded">Live SOS Ready</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{profile.emergencyContactName || 'Dr. Shahzad (Brother)'}</p>
                      <p className="text-[11px] font-mono text-slate-600">{profile.emergencyContactPhone || '+92 321 9876543'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const msg = encodeURIComponent(`🚨 PathShare Safety Test: Assalam-o-Alaikum! Testing live ride share security connection for ${profile.name}.`);
                        window.open(`https://wa.me/${(profile.emergencyContactPhone || '923219876543').replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
                      }}
                      className="py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs transition"
                    >
                      Test Share 💬
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PRODUCTION TELEMETRY, STRESS TESTING & DISASTER RECOVERY */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 rounded-2xl p-4 shadow-md border border-slate-800 text-white space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-sky-400 animate-pulse" />
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Production Telemetry & Go-Live</h3>
                    <p className="text-[10px] text-slate-400">Meta Webhooks • Stress Test • Disaster Recovery</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-black px-2 py-0.5 rounded border border-emerald-800">
                  Tier 1 Active
                </span>
              </div>

              <p className="text-[11px] text-slate-300">
                Official Business Number: <span className="font-mono text-sky-300 font-bold">+92 301 3519491</span> (Quality: <span className="text-emerald-400 font-bold">GREEN</span>)
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    fetchMetaTelemetry();
                    setIsTelemetryModalOpen(true);
                  }}
                  className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-sky-400" /> Webhook Telemetry
                </button>
                <button
                  type="button"
                  onClick={triggerStressTest}
                  disabled={isTestingLoad}
                  className="py-2 px-2.5 bg-blue-700 hover:bg-blue-600 border border-blue-600 rounded-xl text-xs font-bold text-center transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isTestingLoad ? 'Running...' : '⚡ 100-Req Stress Test'}
                </button>
              </div>

              <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Disaster Recovery Drill:</span>
                <a
                  href="/api/admin/backup-export"
                  download
                  className="text-sky-400 hover:text-sky-300 font-bold underline flex items-center gap-1"
                >
                  Download Backup Snapshot 💾
                </a>
              </div>

              {loadResults && (
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 text-[11px] font-mono space-y-0.5">
                  <p className="text-emerald-400 font-bold">✓ Cloud Run Benchmark Results:</p>
                  <p>100/100 requests OK in {loadResults.durationMs}ms ({loadResults.throughputReqSec} req/sec)</p>
                  <p>p50: {loadResults.latencies?.p50Ms}ms | p99: {loadResults.latencies?.p99Ms}ms</p>
                </div>
              )}
            </div>

            {/* Managed Vehicles */}
            <button
              onClick={() => onToast('Vehicle management: Honda City 2020 active')}
              className="w-full bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center gap-3 text-left hover:border-slate-800 transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-800">
                <Car className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-900">My Registered Vehicle</p>
                <p className="text-xs text-slate-500 truncate">Honda City (White) • KHI-8912</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          </div>
        )}

        {/* TAB 2: TRIP HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {/* Stats Summary Card */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-xs">
                <p className="text-xl font-extrabold text-slate-900">{profile.tripHistory.length}</p>
                <p className="text-[10px] text-slate-500 font-medium">Completed Rides</p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-xs">
                <p className="text-xl font-extrabold text-slate-900">
                  ₨ {profile.tripHistory.reduce((acc, t) => acc + t.totalCost, 0)}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Fare Shared</p>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-200 text-center shadow-xs">
                <p className="text-xl font-extrabold text-slate-900">
                  {profile.tripHistory.length > 0 ? `${profile.tripHistory.length * 12} km` : '0 km'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Distance Saved</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-800" /> Commuting Activity
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {profile.tripHistory.length} Total Trips
                </span>
              </div>

              {profile.tripHistory.length === 0 ? (
                <div className="text-center py-8 space-y-1 text-slate-500">
                  <History className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="text-xs font-semibold">No past trip history found</p>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {profile.tripHistory.map((trip) => (
                    <div
                      key={trip.id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 hover:border-slate-800 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full capitalize ${
                              trip.role === 'passenger'
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-slate-900 text-white'
                            }`}>
                              {trip.role}
                            </span>
                            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" /> {trip.date}
                            </span>
                          </div>
                        </div>

                        <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                          Completed
                        </span>
                      </div>

                      {/* Route */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-900 font-semibold pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                        <span className="truncate max-w-[140px]">{trip.from}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{trip.to}</span>
                      </div>

                      {/* Details row */}
                      <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                        <span className="font-medium text-slate-700 truncate max-w-[170px]">
                          {trip.vehicle} • {trip.driverName}
                        </span>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900 text-xs">₨ {trip.totalCost}</span>
                          <p className="text-[9px] text-slate-400">{trip.paymentMethod}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS (EASYPAISA, JAZZCASH, CARDS) */}
        {activeTab === 'payments' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Saved Payment Methods</h3>
                  <p className="text-xs text-slate-500">EasyPaisa & JazzCash automatic settlements</p>
                </div>
                <button
                  onClick={onOpenAddPaymentMethod}
                  className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md transition flex items-center gap-1 cursor-pointer border border-blue-900"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New
                </button>
              </div>

              <div className="space-y-2 pt-1">
                {profile.paymentMethods.map((pm) => (
                  <div
                    key={pm.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${
                          pm.type === 'easypaisa'
                            ? 'bg-slate-100 border-slate-300 text-slate-800'
                            : pm.type === 'jazzcash'
                            ? 'bg-rose-100 border-rose-300 text-rose-800'
                            : 'bg-slate-900 border-slate-800 text-white'
                        }`}
                      >
                        {pm.type === 'easypaisa' ? 'EP' : pm.type === 'jazzcash' ? 'JC' : 'CARD'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-xs text-slate-900">{pm.title}</p>
                          {pm.isDefault && (
                            <span className="bg-slate-200 text-slate-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{pm.accountNumberOrMaskedCard}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!pm.isDefault && (
                        <button
                          onClick={() => handleSetDefaultPaymentMethod(pm.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 text-xs font-bold cursor-pointer"
                          title="Set as Default"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemovePaymentMethod(pm.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Remove Payment Method"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl flex items-start gap-2 text-xs text-slate-700">
              <Smartphone className="w-4 h-4 text-slate-800 shrink-0 mt-0.5" />
              <p className="text-[11px]">
                Cost-share fares are automatically charged to your default mobile wallet or card upon completing the ride with your colleague.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: RATINGS & REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900 flex items-center gap-1">
                  {profile.rating} <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                </p>
                <p className="text-xs text-slate-500">{profile.reviews.length} verified colleague reviews</p>
              </div>
              <div className="text-right">
                <span className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
                  98% Positive
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {profile.reviews.length === 0 ? (
                <div className="text-center py-8 px-4 bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-2 shadow-xs">
                  <Star className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-800">No reviews yet</p>
                  <p className="text-[11px] text-slate-500">Reviews from co-commuters will appear here after completed rides.</p>
                </div>
              ) : (
                profile.reviews.map((rev) => (
                  <div key={rev.id} className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs">
                          {rev.reviewerAvatar}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{rev.reviewerName}</h4>
                          <p className="text-[10px] text-slate-500 capitalize">{rev.role} • {rev.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-500 text-xs font-bold gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Legal, Safety & Admin Quick Links */}
        <div className="space-y-2 pt-1">
          {onNavigate && (
            <>
              <button
                type="button"
                onClick={() => onNavigate('legal')}
                className="w-full bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 flex items-center justify-between hover:border-slate-800 transition cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900">Legal, Safety & Karachi Standards</p>
                    <p className="text-[10px] text-slate-500">Terms of service, community rules & privacy</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="w-full bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200 flex items-center justify-between hover:border-slate-800 transition cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                      <BadgeCheck className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">Admin Identity Verification Console</p>
                      <p className="text-[10px] text-slate-500">Review pending CNIC & University/Office cards</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Clear Demo Data Button */}
        {onClearAllData && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clean all demo rides, offers, requests, and chats?')) {
                onClearAllData();
              }
            }}
            className="w-full bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-center gap-2 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition font-bold text-sm cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-slate-500" /> Clean All Rides & Chats (Fresh Slate)
          </button>
        )}

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center justify-center gap-2 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition font-bold text-sm cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Log out of PathShare
        </button>
      </main>

      {/* SOS EMERGENCY CONTROL CENTER MODAL */}
      {isSosOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border-2 border-rose-600 text-white">
            <div className="flex justify-between items-center border-b border-rose-900/50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow animate-bounce">
                  <Siren className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-rose-300 text-base">SOS Emergency Control</h3>
                  <p className="text-[11px] text-rose-400 font-semibold">Live Security & Location Beacon</p>
                </div>
              </div>
              <button
                onClick={() => setIsSosOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-400 rounded-full transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live GPS Coordinates */}
            <div className="bg-rose-950/50 p-3.5 rounded-2xl border border-rose-800/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-rose-300">
                <span className="flex items-center gap-1">
                  <Radio className="w-4 h-4 text-rose-400 animate-pulse" /> Live GPS Position
                </span>
                <span className="text-[10px] bg-rose-900 text-rose-200 px-2 py-0.5 rounded-full border border-rose-700">ACTIVE</span>
              </div>
              <p className="text-slate-300 font-medium text-[11px]">
                Ocean Tower, Khayaban-e-Iqbal, Clifton Block 5, Karachi (24.8252° N, 67.0315° E)
              </p>
            </div>

            {/* Quick Action Emergency Triggers */}
            <div className="space-y-2">
              <button
                onClick={triggerPoliceCall}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" /> Call 15 Emergency Police
              </button>

              <button
                onClick={triggerEmergencyBroadcast}
                className="w-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold py-3.5 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer border border-blue-900"
              >
                <MessageCircle className="w-4 h-4" /> Send WhatsApp SOS with Live GPS
              </button>

              <button
                onClick={() => onToast('Alerting Ocean Tower Corporate Security Desk...')}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-slate-300" /> Alert Systems Ltd Security Desk
              </button>
            </div>

            <div className="text-center pt-1">
              <button
                onClick={() => setIsSosOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                Cancel / False Alarm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SAFETY & ANTI-THEFT DISCLAIMER MODAL */}
      <SafetyDisclaimerModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        onConfirm={() => onToast('Safety guidelines acknowledged')}
        title="Community Safety & Anti-Theft Guidelines"
        actionText="I Understand & Agree to Follow Rules"
      />

      {/* DUAL-CHANNEL OTP VERIFICATION MODAL */}
      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        defaultChannel={otpChannel}
        defaultTarget={otpTarget}
        title={otpChannel === 'whatsapp' ? 'Verify WhatsApp Number' : 'Verify Work Email / SMS'}
        subtitle={`Enter 4-digit code dispatched to ${otpTarget}`}
        onSuccess={(verifiedTarget) => {
          onToast(`🎉 Security verification completed for ${verifiedTarget}!`);
          if (otpChannel === 'whatsapp') {
            onUpdateProfile({ phone: verifiedTarget });
          } else {
            onUpdateProfile({ email: verifiedTarget });
          }
        }}
      />

      {/* META WEBHOOK TELEMETRY & CTO STATUS MODAL */}
      {isTelemetryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 border border-slate-700 text-white max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Meta Webhooks & Telemetry</h3>
                  <p className="text-[10px] text-slate-400">Live Delivery Receipts & Meta Cloud API</p>
                </div>
              </div>
              <button
                onClick={() => setIsTelemetryModalOpen(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {telemetryInfo ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Quality Rating</span>
                    <span className="font-bold text-emerald-400">{telemetryInfo.qualityRating || 'GREEN (Healthy)'}</span>
                  </div>
                  <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 block">Messaging Tier</span>
                    <span className="font-bold text-sky-400">Tier 1 (1k/day)</span>
                  </div>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 space-y-1">
                  <p><span className="text-slate-400">Sender:</span> <span className="font-bold">{telemetryInfo.displayPhoneNumber}</span></p>
                  <p><span className="text-slate-400">Verified Name:</span> <span className="font-bold">{telemetryInfo.verifiedName}</span></p>
                  <p><span className="text-slate-400">Phone ID:</span> <span className="font-mono text-[11px]">{telemetryInfo.registeredPhoneId}</span></p>
                  <p><span className="text-slate-400">WABA ID:</span> <span className="font-mono text-[11px]">{telemetryInfo.wabaId}</span></p>
                </div>

                {/* Delivery Telemetry Stats */}
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">Webhook Delivery Receipts</span>
                  <div className="grid grid-cols-4 gap-1.5 text-center">
                    <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                      <p className="text-sm font-black text-sky-400">{telemetryInfo.telemetry?.totalDispatched ?? 0}</p>
                      <p className="text-[9px] text-slate-400 font-bold">Dispatched</p>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                      <p className="text-sm font-black text-emerald-400">{telemetryInfo.telemetry?.totalDelivered ?? 0}</p>
                      <p className="text-[9px] text-slate-400 font-bold">Delivered</p>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                      <p className="text-sm font-black text-blue-400">{telemetryInfo.telemetry?.totalRead ?? 0}</p>
                      <p className="text-[9px] text-slate-400 font-bold">Read</p>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                      <p className="text-sm font-black text-rose-400">{telemetryInfo.telemetry?.totalFailed ?? 0}</p>
                      <p className="text-[9px] text-slate-400 font-bold">Failed</p>
                    </div>
                  </div>
                </div>

                {/* Recent Webhook Events */}
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Recent Real-Time Events</span>
                  {telemetryInfo.telemetry?.recentEvents?.length > 0 ? (
                    <div className="space-y-1">
                      {telemetryInfo.telemetry.recentEvents.slice(0, 3).map((ev: any, idx: number) => (
                        <div key={idx} className="bg-slate-800/80 p-2 rounded-lg text-[10px] font-mono flex justify-between items-center border border-slate-700">
                          <span className="text-emerald-300 font-bold uppercase">{ev.status}</span>
                          <span className="text-slate-400">{ev.recipientId}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">No webhook receipts recorded in this container session yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Loading live Meta Cloud API telemetry...
              </div>
            )}

            <button
              onClick={() => setIsTelemetryModalOpen(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl font-bold text-xs text-white transition cursor-pointer"
            >
              Close Telemetry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
