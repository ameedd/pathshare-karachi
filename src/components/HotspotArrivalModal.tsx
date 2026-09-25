import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Phone, 
  Compass, 
  Lock, 
  X, 
  AlertTriangle, 
  Navigation, 
  Send, 
  Sparkles,
  MessageCircle,
  Car
} from 'lucide-react';
import { HotspotArrivalData } from '../types';
import { playArrivalChime } from '../lib/sound';

interface HotspotArrivalModalProps {
  isOpen: boolean;
  data: HotspotArrivalData | null;
  onClose: () => void;
  onAcknowledgeComing: (rideId: number, note?: string) => void;
  onConfirmBoarded: (rideId: number) => void;
  onOpenChat?: (rideId: number) => void;
}

export const HotspotArrivalModal: React.FC<HotspotArrivalModalProps> = ({
  isOpen,
  data,
  onClose,
  onAcknowledgeComing,
  onConfirmBoarded,
  onOpenChat
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(180); // 3 minutes = 180s
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  // Play chime and initialize 3-minute timer when opened
  useEffect(() => {
    if (isOpen && data) {
      setSecondsLeft(data.departureSecondsRemaining || 180);
      setHasAcknowledged(data.status === 'rider_acknowledged');
      playArrivalChime();
    }
  }, [isOpen, data]);

  // Active 3-minute countdown ticker
  useEffect(() => {
    if (!isOpen || secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, secondsLeft]);

  if (!isOpen || !data) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = Math.max(0, Math.min(100, (secondsLeft / 180) * 100));

  // Determine urgency theme based on remaining seconds
  const isUrgent = secondsLeft < 60;
  const isWarning = secondsLeft < 120 && secondsLeft >= 60;
  const isExpired = secondsLeft === 0;

  const handleAcknowledge = () => {
    setHasAcknowledged(true);
    onAcknowledgeComing(data.rideId, customNote || "I'm heading to the hotspot right now! Please wait 1 minute.");
  };

  const handleBoarded = () => {
    onConfirmBoarded(data.rideId);
    onClose();
  };

  const openWhatsApp = () => {
    const phone = data.driverPhone || '923001234567';
    const text = encodeURIComponent(
      `Hi ${data.driverName}! I received your arrival alert at ${data.pickupHotspot}. I am walking to your car (${data.plateNumber}) right now!`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="hotspot-arrival-popup"
        className={`w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border-2 text-slate-900 transition-all bg-white ${
          isExpired
            ? 'border-rose-600'
            : isUrgent
            ? 'border-rose-500 ring-4 ring-rose-500/20 animate-pulse'
            : isWarning
            ? 'border-amber-400 ring-4 ring-amber-400/20'
            : 'border-slate-800 ring-4 ring-slate-900/10'
        }`}
      >
        {/* Header Alert Badge & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
              isExpired
                ? 'bg-rose-600'
                : isUrgent
                ? 'bg-rose-600 animate-bounce'
                : isWarning
                ? 'bg-amber-500 animate-pulse'
                : 'bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950'
            }`}>
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[11px] font-black uppercase tracking-wider block ${
                isExpired
                  ? 'text-rose-600'
                  : isUrgent
                  ? 'text-rose-700 font-extrabold'
                  : isWarning
                  ? 'text-amber-800'
                  : 'text-slate-900'
              }`}>
                {isExpired ? '⏳ Departure Time Expired' : '🚨 Driver Has Arrived!'}
              </span>
              <p className="text-xs font-extrabold text-slate-900">
                {isExpired ? 'Driver departing hotspot' : 'Waiting at pickup meeting spot'}
              </p>
            </div>
          </div>

          <button
            id="close-arrival-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full transition text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-Minute Departure Countdown Hero Widget */}
        <div className={`my-3.5 p-4 rounded-2xl border text-center relative overflow-hidden ${
          isExpired
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : isUrgent
            ? 'bg-rose-50 border-rose-200 text-rose-950'
            : isWarning
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-slate-100 border-slate-200 text-slate-900'
        }`}>
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                isExpired ? 'bg-rose-600' : isUrgent ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-slate-900'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] font-black uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Departure Countdown (3-Minute Rule)</span>
          </p>

          <div className="flex items-center justify-center gap-2 my-1">
            <span className={`text-4xl font-black font-mono tracking-wider ${
              isExpired ? 'text-rose-600' : isUrgent ? 'text-rose-600 animate-pulse' : isWarning ? 'text-amber-600' : 'text-slate-900'
            }`}>
              {formattedTime}
            </span>
          </div>

          <p className="text-xs font-semibold px-2 mt-1 leading-snug">
            {isExpired ? (
              <span className="text-rose-700 font-bold">
                ⚠️ The 3-minute grace period has passed. Driver may have departed to stay on schedule.
              </span>
            ) : isUrgent ? (
              <span className="text-rose-800 font-extrabold">
                ⚡ Less than 1 minute remaining! Please board now or driver will be gone.
              </span>
            ) : (
              <span>
                Driver will wait <strong>3 minutes</strong> at the meeting spot before departing.
              </span>
            )}
          </p>
        </div>

        {/* Hotspot & Driver Details Card */}
        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 space-y-2.5 mb-3.5">
          {/* Meeting Point Hotspot */}
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-slate-200 text-slate-800 shrink-0 mt-0.5">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pickup Hotspot Meeting Point</p>
              <p className="text-sm font-extrabold text-slate-900 truncate">
                {data.pickupHotspot}
              </p>
            </div>
          </div>

          {/* Driver & Vehicle */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white flex items-center justify-center font-bold text-xs">
                {data.driverAvatar}
              </div>
              <div>
                <p className="text-xs font-bold flex items-center gap-1">
                  {data.driverName}
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                </p>
                <p className="text-[11px] text-slate-500">
                  {data.vehicle} {data.color ? `• ${data.color}` : ''}
                </p>
              </div>
            </div>

            {/* License Plate Badge */}
            <div className="text-right">
              <span className="text-xs bg-slate-900 text-amber-300 font-black px-2.5 py-1 rounded-lg border border-slate-800 shadow-2xs tracking-wider inline-block">
                {data.plateNumber}
              </span>
            </div>
          </div>

          {/* Verification PIN Code */}
          {data.startPin && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                <Lock className="w-3.5 h-3.5 text-slate-800" />
                <span>Show PIN to Driver:</span>
              </div>
              <span className="font-mono font-black text-sm bg-slate-900 text-white px-2.5 py-0.5 rounded-lg tracking-widest">
                {data.startPin}
              </span>
            </div>
          )}
        </div>

        {/* Rider Status Badge after Acknowledging */}
        {hasAcknowledged && (
          <div className="mb-3 p-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-900 flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-slate-800 shrink-0" />
            <span>Driver notified: You are on the way to the hotspot! 🚶</span>
          </div>
        )}

        {/* Custom quick note input (optional) */}
        {showNoteInput && !hasAcknowledged && (
          <div className="mb-3 flex items-center gap-1.5">
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Coming down elevator / Wearing blue shirt..."
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-800"
            />
            <button
              onClick={handleAcknowledge}
              className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white p-2 rounded-xl text-xs font-bold hover:from-blue-600 hover:to-slate-900 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!hasAcknowledged ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                id="rider-heading-out-btn"
                type="button"
                onClick={handleAcknowledge}
                className="py-3 px-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition active:scale-98 border border-blue-900"
              >
                <Navigation className="w-4 h-4" />
                <span>I'm Coming Now! 🚶</span>
              </button>

              <button
                id="rider-boarded-btn"
                type="button"
                onClick={handleBoarded}
                className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition active:scale-98 border border-slate-800"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Have Boarded ✅</span>
              </button>
            </div>
          ) : (
            <button
              id="rider-confirm-boarded-btn"
              type="button"
              onClick={handleBoarded}
              className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98 border border-blue-900"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Confirm Boarded & Start Commute 🚗</span>
            </button>
          )}

          {/* Secondary Action Row: WhatsApp & In-App Chat */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={openWhatsApp}
              className="py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-slate-700" />
              <span>WhatsApp Driver</span>
            </button>

            {onOpenChat ? (
              <button
                type="button"
                onClick={() => {
                  onOpenChat(data.rideId);
                  onClose();
                }}
                className="py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-slate-700" />
                <span>In-App Chat</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-200 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                <span>Add Quick Note</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
