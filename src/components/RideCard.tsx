import React from 'react';
import { BadgeCheck, ArrowRight, Car, Bike, Package, Clock, Users } from 'lucide-react';
import { Ride } from '../types';
import { getHotspotsWithTimings } from '../lib/routeEngine';

interface RideCardProps {
  ride: Ride;
  onClick: (ride: Ride) => void;
}

export const RideCard: React.FC<RideCardProps> = ({ ride, onClick }) => {
  const isBike = ride.type === 'bike';
  const isParcel = isBike && ride.serviceCategory === 'parcel';

  const seatText = isParcel
    ? '1 Parcel slot available'
    : isBike
    ? (ride.seats > 0 ? '1 pillion seat only' : 'No seat left')
    : `${ride.seats} seat${ride.seats > 1 ? 's' : ''} left`;

  const isPremium = ride.price > ride.basePrice;
  const perKmRate = ride.km > 0 ? (ride.price / ride.km).toFixed(1) : '0';

  const hotspotTimings = getHotspotsWithTimings(ride.time, ride.via || ['Main Junction'], ride.km);

  return (
    <div
      onClick={() => onClick(ride)}
      className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer active:scale-[0.99] text-slate-700"
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className={`w-11 h-11 rounded-full ${isParcel ? 'bg-sky-100 text-sky-700 border border-sky-200' : isBike ? 'bg-sky-100 text-sky-800 border border-sky-200' : 'bg-sky-600 text-white shadow-sm'} flex items-center justify-center font-bold text-sm shrink-0`}>
            {isParcel ? <Package className="w-5 h-5 text-sky-600" /> : ride.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-bold text-slate-900 text-sm">{ride.driver}</p>
              {ride.verified && <BadgeCheck className="w-4 h-4 text-sky-500 shrink-0" />}
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                isParcel
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : isBike
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-sky-50 text-sky-700 border border-sky-200'
              }`}>
                {isParcel ? '📦 Bike Parcel' : isBike ? '🏍️ Bike Ride' : '🚗 Carpool'}
              </span>
              {ride.ladiesOnly && (
                <span className="text-[10px] bg-pink-100 text-pink-700 font-extrabold px-2 py-0.5 rounded-full border border-pink-200 flex items-center gap-1 shadow-2xs">
                  🌸 Ladies Only
                </span>
              )}
              {ride.intercity && (
                <span className="text-[10px] bg-sky-100 text-sky-800 font-extrabold px-1.5 py-0.5 rounded-full border border-sky-200">
                  🛣️ Intercity
                </span>
              )}
              {ride.corridor && (
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-200">
                  ⚡ {ride.corridor}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="text-xs text-slate-500 font-medium">
                {ride.rating} ★ ({ride.reviews}) • {ride.vehicle} {ride.modelYear || ''} • {ride.color || ''}
              </span>
              {ride.cnicVerified && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5" title="NADRA CNIC Verified Driver">
                  🛡️ CNIC Verified
                </span>
              )}
              {ride.licenseVerified && (
                <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-1.5 py-0.5 rounded border border-sky-200 flex items-center gap-0.5" title="Valid Driving License Verified">
                  🪪 License Verified
                </span>
              )}
              {ride.plateNumber && (
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded border border-slate-200 tracking-wider">
                  {ride.plateNumber}
                </span>
              )}
              {isBike && ride.spareHelmetProvided && (
                <span className="text-[10px] bg-sky-50 text-sky-700 font-bold px-1.5 py-0.5 rounded border border-sky-200">
                  ⛑️ Extra Helmet
                </span>
              )}
            </div>
            {ride.pickupHotspot && (
              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                <p className="text-[11px] text-sky-800 font-semibold bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200 inline-flex items-center gap-1">
                  📍 <span className="font-bold">Hotspot:</span> {ride.pickupHotspot}
                </p>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-bold flex items-center gap-0.5">
                  ⏱️ 3-Min Pickup Rule
                </span>
              </div>
            )}
            {isParcel && (
              <p className="text-xs text-sky-800 font-medium mt-1 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 inline-block">
                {ride.parcelDescription || 'Envelope / Documents / Laptop Bag (Max 5kg)'}
              </p>
            )}
            {!isBike && (
              <p className="text-xs mt-1 space-x-1.5">
                {ride.ac ? <span className="text-sky-600 font-semibold">AC ✓</span> : <span className="text-slate-400">No AC</span>}
                {ride.heater && <span className="text-sky-700 font-semibold">· Heater ✓</span>}
              </p>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-lg font-black text-slate-900">₨ {ride.price}</p>
          <span className="text-xs font-bold text-slate-400 block">/ seat</span>
          <div className="flex flex-col items-end gap-1 mt-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isPremium ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-sky-50 text-sky-700 border border-sky-200'}`}>
              {isPremium ? 'Peak Surge' : 'Standard Share'}
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold border border-slate-200">
              ₨ {perKmRate}/km
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-700 flex-wrap font-medium">
        <span className="text-[11px] text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">From</span>
        <span className="font-bold text-slate-900">{ride.from}</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-[11px] text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">To</span>
        <span className="font-bold text-slate-900">{ride.to}</span>
      </div>

      <div className="mt-2.5 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Tentative route</p>
        <p className="text-xs text-slate-600 leading-snug font-medium mt-0.5">{ride.route || `${ride.from} → ${ride.to}`}</p>
      </div>

      {hotspotTimings && hotspotTimings.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 items-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Hotspot ETAs:</span>
          {hotspotTimings.map((spot, idx) => (
            <span key={idx} className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md border border-sky-200 font-bold flex items-center gap-1">
              📍 {spot.name} <span className="text-sky-600 font-medium">({spot.formattedEta})</span>
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
        <span className="font-medium text-slate-600 flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-sky-600" />
          {ride.time} • {ride.km} km • {seatText}
        </span>
        <span className="text-sky-600 font-bold flex items-center gap-0.5">
          View details <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
