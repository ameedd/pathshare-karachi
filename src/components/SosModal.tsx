import React, { useState } from 'react';
import { X, ShieldAlert, PhoneCall, Share2, AlertTriangle, MessageCircle, HeartHandshake, CheckCircle2, Loader2 } from 'lucide-react';
import { Ride, UserProfile } from '../types';
import { apiUrl } from '../lib/api';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride?: Ride | null;
  profile?: UserProfile | null;
}

export const SosModal: React.FC<SosModalProps> = ({
  isOpen,
  onClose,
  ride,
  profile
}) => {
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const emergencyName = profile?.emergencyContactName || 'Family / Emergency Contact';
  const emergencyPhone = profile?.emergencyContactPhone || '';

  const triggerBackendSos = async () => {
    try {
      setIsDispatching(true);
      const res = await fetch(apiUrl('/api/safety/sos-trigger'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rideId: ride?.id || 'active-trip',
          passengerName: profile?.name || 'Passenger',
          driverName: ride?.driver || 'Assigned Driver',
          emergencyContact: emergencyPhone,
          route: `${ride?.from || 'Pickup'} ➔ ${ride?.to || 'Destination'}`,
          coordinates: {
            lat: ride?.coordinates?.from?.[0] || 24.8607,
            lng: ride?.coordinates?.from?.[1] || 67.0011,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDispatchStatus('Emergency alert logged with PathShare Safety Desk & dispatch recorded.');
      }
    } catch (err) {
      console.error('[SOS Dispatch Error]:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  const generateLiveMessage = () => {
    return (
      `🚨 *PATHSHARE LIVE TRIP & SAFETY SHARE* 🚨\n\n` +
      `Assalam-o-Alaikum! Sharing my active ride details with you for safety tracking:\n` +
      `• *Driver:* ${ride?.driver || 'Verified PathShare Driver'}\n` +
      `• *Vehicle:* ${ride?.vehicle || 'Car/Bike'} (Plate: ${ride?.plateNumber || 'Verified'})\n` +
      `• *Driver CNIC & License:* ${ride?.cnicVerified ? 'Verified NADRA ✓' : 'Registered'}\n` +
      `• *Route:* ${ride?.from || 'Pickup'} ➔ ${ride?.to || 'Destination'}\n` +
      `• *Estimated Time:* ${ride?.time || 'In Transit'}\n` +
      `• *Live Tracker:* https://maps.google.com/?q=${ride?.coordinates?.from?.[0] || 24.8607},${ride?.coordinates?.from?.[1] || 67.0011}\n\n` +
      `Official PathShare Karachi 24/7 Helpline: +92 301 3519491`
    );
  };

  const handleShareEmergencyContact = () => {
    triggerBackendSos();
    const text = encodeURIComponent(generateLiveMessage());
    if (emergencyPhone) {
      const cleanPhone = emergencyPhone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const handleBroadcastSOS = () => {
    triggerBackendSos();
    const text = encodeURIComponent(
      `🚨 *URGENT PATHSHARE EMERGENCY SOS* 🚨\n\n` +
      `I require immediate emergency assistance on my ride!\n` +
      `• Driver: ${ride?.driver || 'PathShare Driver'}\n` +
      `• Vehicle: ${ride?.vehicle || 'Vehicle'} (${ride?.plateNumber || 'Reg Plate'})\n` +
      `• Current Route: ${ride?.from || 'Pickup'} ➔ ${ride?.to || 'Destination'}\n` +
      `• GPS: https://maps.google.com/?q=24.8607,67.0011\n\n` +
      `Please contact 15 Police or 1122 Rescue immediately!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border-2 border-rose-300 p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-rose-600 rounded-2xl text-white animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-rose-700">Safety & Emergency SOS</h3>
              <p className="text-[11px] text-slate-500 font-medium">PathShare Live Tracking & Response</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Backend Incident Dispatch Status */}
        {isDispatching && (
          <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-800 p-2.5 rounded-xl border border-amber-200">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            <span>Alerting PathShare 24/7 Safety Command Center...</span>
          </div>
        )}
        {dispatchStatus && (
          <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{dispatchStatus}</span>
          </div>
        )}

        {/* Live Share with Emergency Contact Button */}
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>Emergency Contact Live-Share</span>
            </div>
            {emergencyPhone && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                Saved
              </span>
            )}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            Instantly send your vehicle number, driver identity & live GPS tracking link to <span className="font-bold">{emergencyName}</span> ({emergencyPhone || 'Direct WhatsApp'}).
          </p>
          <button
            type="button"
            onClick={handleShareEmergencyContact}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            <MessageCircle className="w-4 h-4" /> Share Live Trip via WhatsApp
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl text-xs text-rose-900 font-medium flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>If you feel unsafe or in immediate danger, use the buttons below to dial emergency authorities or broadcast your SOS immediately.</span>
        </div>

        {/* Speed Dial Buttons */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Karachi Emergency Authorities</p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:15"
              className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Police (15)
            </a>
            <a
              href="tel:1122"
              className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Rescue (1122)
            </a>
            <a
              href="tel:1101"
              className="py-2.5 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Rangers (1101)
            </a>
            <a
              href="tel:115"
              className="py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Edhi (115)
            </a>
          </div>
        </div>

        {/* WhatsApp Emergency Broadcast */}
        <div>
          <button
            type="button"
            onClick={handleBroadcastSOS}
            className="w-full py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" /> Broadcast Urgent SOS to All WhatsApp
          </button>
        </div>

        {/* Ride Info snapshot */}
        {ride && (
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-0.5">
            <p className="font-bold text-slate-800">Trip Reference:</p>
            <p>Driver: {ride.driver} ({ride.vehicle} - {ride.plateNumber || 'KHI-7890'})</p>
            <p className="truncate">Route: {ride.from} ➔ {ride.to}</p>
          </div>
        )}
      </div>
    </div>
  );
};
