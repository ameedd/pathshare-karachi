import React, { useState, useEffect } from 'react';
import { Bell, Clock, MapPin, CheckCircle2, ShieldCheck, Phone, Compass, User, Lock, X, AlertTriangle, Sparkles, Navigation } from 'lucide-react';
import { Ride } from '../types';

interface WakeUpCallModalProps {
  isOpen: boolean;
  minutesLeft: 10 | 5;
  ride: Ride | null;
  onClose: () => void;
  onConfirmReady?: () => void;
}

export const WakeUpCallModal: React.FC<WakeUpCallModalProps> = ({
  isOpen,
  minutesLeft,
  ride,
  onClose,
  onConfirmReady
}) => {
  const [snoozed, setSnoozed] = useState(false);
  const [activeTab, setActiveTab] = useState<10 | 5>(minutesLeft);

  useEffect(() => {
    setActiveTab(minutesLeft);
  }, [minutesLeft]);

  if (!isOpen || !ride) return null;

  const is10Min = activeTab === 10;

  const handleSnooze = () => {
    setSnoozed(true);
    setTimeout(() => {
      setSnoozed(false);
    }, 120000); // 2 minute snooze
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-md rounded-3xl p-5 shadow-2xl border-2 text-slate-900 transition-all ${
        is10Min 
          ? 'bg-gradient-to-b from-amber-50 via-white to-amber-50/40 border-amber-400' 
          : 'bg-gradient-to-b from-rose-50 via-white to-rose-50/40 border-rose-500'
      }`}>
        
        {/* Header Alert Badge & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
              is10Min ? 'bg-amber-500 animate-bounce' : 'bg-rose-600 animate-pulse'
            }`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[11px] font-black uppercase tracking-wider block ${
                is10Min ? 'text-amber-800' : 'text-rose-800'
              }`}>
                {is10Min ? '⏰ 10-Min Wake-Up Call' : '🚨 5-Min Final Call!'}
              </span>
              <p className="text-xs font-extrabold text-slate-800">
                {is10Min ? 'Get Ready to Depart!' : 'Head to Pickup Hotspot Now!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Minutes Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold my-3">
          <button
            type="button"
            onClick={() => setActiveTab(10)}
            className={`py-1.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 10
                ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white shadow-xs border border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>10-Min Alert</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(5)}
            className={`py-1.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 5
                ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white shadow-xs border border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>5-Min Final</span>
          </button>
        </div>

        {/* Dynamic Countdown Banner */}
        <div className={`p-3.5 rounded-2xl border mb-3 flex items-center justify-between ${
          is10Min ? 'bg-slate-100 border-slate-300 text-slate-950' : 'bg-rose-100/90 border-rose-300 text-rose-950'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-lg ${
              is10Min ? 'bg-slate-900 text-white' : 'bg-rose-600 text-white'
            }`}>
              {is10Min ? '10m' : '05m'}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wide">
                {is10Min ? 'Departure Window' : 'Arriving at Hotspot'}
              </p>
              <p className="text-xs font-medium">
                Scheduled for: <strong className="font-extrabold">{ride.time || '7:15 PM'}</strong>
              </p>
            </div>
          </div>

          <span className="text-[11px] font-extrabold bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
            {is10Min ? '🚶 Pack Laptop/Bag' : '📍 Walk to Spot'}
          </span>
        </div>

        {/* Ride & Driver Info Card */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white flex items-center justify-center font-bold text-xs">
                {ride.avatar || 'DR'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  {ride.driver}
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-800" />
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {ride.vehicle} • <span className="font-bold text-slate-700">{ride.plateNumber || 'KHI-7890'}</span>
                </p>
              </div>
            </div>

            <span className="text-[11px] font-black text-slate-900 bg-slate-200 px-2 py-0.5 rounded-lg border border-slate-300">
              ₨ {ride.price}
            </span>
          </div>

          {/* Pickup Hotspot */}
          <div className="pt-2 border-t border-slate-200/80 flex items-start gap-2">
            <Compass className="w-4 h-4 text-slate-800 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pickup Hotspot Meeting Point</p>
              <p className="text-xs font-bold text-slate-900">{ride.pickupHotspot || `${ride.from} Main Gate`}</p>
            </div>
          </div>

          {/* Show Verification PIN for 5-min alert */}
          {!is10Min && (
            <div className="bg-slate-900 text-white p-2.5 rounded-xl flex items-center justify-between border border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-300">Trip Start PIN:</span>
              </div>
              <span className="text-base font-mono font-black text-amber-300 tracking-widest bg-slate-800 px-2.5 py-0.5 rounded-lg">
                {ride.startPin || '4892'}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {is10Min ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSnooze}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200"
              >
                <span>Snooze 2m ⏱️</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onConfirmReady) onConfirmReady();
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-98 cursor-pointer border border-blue-900"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>I'm Getting Ready!</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  window.open(`https://wa.me/?text=Hi%20${ride.driver},%20I%20am%20heading%20to%20the%20hotspot%20at%20${ride.pickupHotspot}!`, '_blank');
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer border border-slate-800"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contact Driver</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onConfirmReady) onConfirmReady();
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-98 cursor-pointer border border-blue-900"
              >
                <Navigation className="w-4 h-4" />
                <span>I'm at Hotspot!</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
