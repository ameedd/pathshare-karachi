import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  Send, 
  Compass, 
  ShieldCheck, 
  Car, 
  Sparkles,
  RefreshCw,
  Eye,
  Plus
} from 'lucide-react';
import { Ride, HotspotArrivalData } from '../types';

interface DriverHotspotControlProps {
  ride: Ride;
  onShootArrival: (ride: Ride) => void;
  onShootComing: (ride: Ride) => void;
  onPreviewRiderModal?: (ride: Ride) => void;
  onConfirmBoarded?: (ride: Ride) => void;
  arrivalData?: HotspotArrivalData | null;
}

export const DriverHotspotControl: React.FC<DriverHotspotControlProps> = ({
  ride,
  onShootArrival,
  onShootComing,
  onPreviewRiderModal,
  onConfirmBoarded,
  arrivalData
}) => {
  const [driverStage, setDriverStage] = useState<'idle' | 'coming' | 'arrived' | 'boarded'>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(180);
  const [riderStatusText, setRiderStatusText] = useState<string>('Pending passenger response');

  const hotspot = ride.pickupHotspot || `${ride.from} Main Gate`;

  useEffect(() => {
    if (arrivalData && arrivalData.rideId === ride.id) {
      if (arrivalData.status === 'coming') {
        setDriverStage('coming');
      } else if (arrivalData.status === 'arrived' || arrivalData.status === 'rider_acknowledged') {
        setDriverStage('arrived');
        if (arrivalData.status === 'rider_acknowledged') {
          setRiderStatusText('Passenger Acknowledged: "Coming now! 🚶"');
        }
      } else if (arrivalData.status === 'boarded') {
        setDriverStage('boarded');
        setRiderStatusText('Passenger Boarded ✅');
      }
    }
  }, [arrivalData, ride.id]);

  // Driver 3-minute wait countdown
  useEffect(() => {
    if (driverStage !== 'arrived' || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [driverStage, secondsRemaining]);

  const handleSendComing = () => {
    setDriverStage('coming');
    onShootComing(ride);
  };

  const handleSendArrived = () => {
    setDriverStage('arrived');
    setSecondsRemaining(180);
    setRiderStatusText('Alert shot to passenger. 3-minute wait started.');
    onShootArrival(ride);
  };

  const handleExtendWait = () => {
    setSecondsRemaining(prev => prev + 60);
  };

  const handleBoarded = () => {
    setDriverStage('boarded');
    setRiderStatusText('All passengers boarded! Have a safe commute.');
    if (onConfirmBoarded) onConfirmBoarded(ride);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div 
      id={`driver-hotspot-panel-${ride.id}`}
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-slate-700/80 space-y-3.5"
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-sky-300">
                Driver Hotspot Arrival Control
              </span>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 font-extrabold px-1.5 py-0.2 rounded border border-sky-500/30">
                Every Car Offer
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium truncate max-w-[240px]">
              📍 {hotspot}
            </p>
          </div>
        </div>

        {onPreviewRiderModal && (
          <button
            type="button"
            onClick={() => onPreviewRiderModal(ride)}
            className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-slate-600 transition"
            title="Preview how the 3-minute popup appears to the rider"
          >
            <Eye className="w-3 h-3 text-amber-400" />
            <span>Preview Pop-Up</span>
          </button>
        )}
      </div>

      {/* Stage-Based Interface */}
      {driverStage === 'idle' && (
        <div className="space-y-2.5">
          <p className="text-xs text-slate-300 leading-relaxed">
            As driver of this carpool route, let passengers know you are coming, and shoot the <strong className="text-amber-300 font-bold">"I Have Arrived"</strong> alert with the strict <strong className="text-sky-300 font-bold">3-Minute Pickup Policy</strong>.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              id={`driver-shoot-coming-${ride.id}`}
              type="button"
              onClick={handleSendComing}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-sky-500/40 transition active:scale-98"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>1. Shoot "I Am Coming"</span>
            </button>

            <button
              id={`driver-shoot-arrived-${ride.id}`}
              type="button"
              onClick={handleSendArrived}
              className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-98"
            >
              <Car className="w-3.5 h-3.5" />
              <span>2. Shoot "I Have Arrived!" 🎯</span>
            </button>
          </div>
        </div>
      )}

      {driverStage === 'coming' && (
        <div className="space-y-3 bg-sky-950/50 p-3.5 rounded-2xl border border-sky-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
              <span className="text-xs font-black text-sky-200 uppercase tracking-wide">
                Status: En Route to Hotspot
              </span>
            </div>
            <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-md">
              ETA: ~3 mins
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Passengers have been notified you are coming to <strong className="text-white">{hotspot}</strong>.
          </p>

          <button
            id={`driver-confirm-arrived-${ride.id}`}
            type="button"
            onClick={handleSendArrived}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-98"
          >
            <Car className="w-4 h-4" />
            <span>I Have Reached the Hotspot! (Shoot Arrival Alert) 🎯</span>
          </button>
        </div>
      )}

      {driverStage === 'arrived' && (
        <div className="space-y-3 bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wide">
                At Hotspot: 3-Min Departure Timer
              </span>
            </div>
            <span className={`text-base font-black font-mono px-2.5 py-0.5 rounded-lg border ${
              secondsRemaining < 60 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {formattedTime}
            </span>
          </div>

          {/* Passenger Feedback Status */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-200 font-semibold truncate">{riderStatusText}</span>
            </div>
            <button
              onClick={handleExtendWait}
              className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-sky-300 px-2 py-1 rounded-md border border-slate-600 transition flex items-center gap-0.5 shrink-0"
              title="Add 1 extra minute of wait time"
            >
              <Plus className="w-3 h-3" /> 1m
            </button>
          </div>

          {/* Departure Policy Warning */}
          <p className="text-[11px] text-slate-400 leading-snug">
            {secondsRemaining > 0 ? (
              <span>
                ⏰ 3-minute grace period active. After 3 minutes, you may depart to maintain the commute schedule for other riders.
              </span>
            ) : (
              <span className="text-rose-400 font-bold">
                ⚠️ 3-Minute Window Ended. You may now depart or call passenger if nearby.
              </span>
            )}
          </p>

          {/* Driver Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                window.open(`https://wa.me/?text=I%20am%20waiting%20at%20the%20pickup%20hotspot%20${encodeURIComponent(hotspot)}!`, '_blank');
              }}
              className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Passenger</span>
            </button>

            <button
              id={`driver-confirm-boarded-btn-${ride.id}`}
              type="button"
              onClick={handleBoarded}
              className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-98"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Passenger Boarded ✅</span>
            </button>
          </div>
        </div>
      )}

      {driverStage === 'boarded' && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Passenger Boarded Successfully</span>
          </div>
          <p className="text-xs text-slate-300">
            Commute in progress from <strong className="text-white">{ride.from}</strong> ➔ <strong className="text-white">{ride.to}</strong>.
          </p>
          <button
            type="button"
            onClick={() => setDriverStage('idle')}
            className="text-[11px] text-slate-400 hover:text-slate-200 font-bold underline block mt-1"
          >
            Reset Hotspot Status
          </button>
        </div>
      )}
    </div>
  );
};
