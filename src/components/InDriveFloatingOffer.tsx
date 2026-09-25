import React, { useState, useEffect } from 'react';
import { Clock, Check, X, ShieldCheck, MapPin, DollarSign, User, Sparkles, MessageCircle, Bike, Car } from 'lucide-react';
import { Ride } from '../types';

export interface FloatingOfferData {
  id: string;
  senderName: string;
  senderAvatar: string;
  rating: number;
  reviewsCount: number;
  role: 'driver' | 'passenger';
  vehicle: string;
  plateNumber?: string;
  from: string;
  to: string;
  pickupHotspot?: string;
  originalPrice: number;
  offeredPrice: number;
  seats: number;
  vehicleType: 'car' | 'bike';
  note?: string;
}

interface InDriveFloatingOfferProps {
  offer: FloatingOfferData | null;
  onAccept: (offer: FloatingOfferData) => void;
  onDecline: (offer: FloatingOfferData) => void;
  onCounterBack?: (offer: FloatingOfferData) => void;
}

export const InDriveFloatingOffer: React.FC<InDriveFloatingOfferProps> = ({
  offer,
  onAccept,
  onDecline,
  onCounterBack,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (!offer) return;
    setSecondsLeft(60);

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
  }, [offer]);

  useEffect(() => {
    if (offer && secondsLeft === 0) {
      onDecline(offer);
    }
  }, [secondsLeft, offer, onDecline]);

  if (!offer) return null;

  const isBike = offer.vehicleType === 'bike';
  const progressPercent = (secondsLeft / 60) * 100;
  const isDiscount = offer.offeredPrice < offer.originalPrice;
  const priceDiff = Math.abs(offer.offeredPrice - offer.originalPrice);

  return (
    <div className="fixed top-3 left-3 right-3 z-50 max-w-md mx-auto animate-in fade-in slide-in-from-top duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border-2 border-slate-700 overflow-hidden relative backdrop-blur-md">
        
        {/* Top 60-second timer progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-slate-400 via-blue-500 to-rose-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Header Header & Timer Badge */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-ping" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> inDrive Live Counter Offer
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-800 text-amber-300 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border border-slate-700">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}s</span>
          </div>
        </div>

        {/* Person Posted Information */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 flex items-center justify-center text-white font-extrabold text-sm shadow-md shrink-0 border border-blue-500/30">
            {offer.senderAvatar || 'IN'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h4 className="font-bold text-sm text-white truncate flex items-center gap-1">
                {offer.senderName}
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 inline shrink-0" />
              </h4>
              <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-full border border-slate-700">
                ★ {offer.rating} ({offer.reviewsCount})
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5 flex items-center gap-1">
              {isBike ? <Bike className="w-3 h-3 text-orange-400" /> : <Car className="w-3 h-3 text-blue-400" />}
              <span>{offer.vehicle}</span>
              {offer.plateNumber && (
                <span className="bg-slate-800 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">
                  {offer.plateNumber}
                </span>
              )}
            </p>

            <p className="text-[11px] text-slate-300 mt-1 font-semibold truncate">
              🛣️ {offer.from} ➔ {offer.to}
            </p>

            {offer.pickupHotspot && (
              <p className="text-[10px] text-slate-200 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700 inline-block mt-1">
                📍 Hotspot: {offer.pickupHotspot}
              </p>
            )}
          </div>
        </div>

        {/* Price Difference & Bidding Badge */}
        <div className="mt-3 bg-slate-800/90 rounded-xl p-2.5 border border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
              Offered Fare Rate (Per Seat)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white">₨ {offer.offeredPrice}</span>
              <span className="text-xs font-bold text-slate-300">/ seat</span>
              <span className="text-xs text-slate-400 line-through">₨ {offer.originalPrice}</span>
            </div>
          </div>

          <div className="text-right">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isDiscount ? 'bg-slate-700 text-blue-300 border border-slate-600' : 'bg-slate-700 text-amber-300 border border-slate-600'
            }`}>
              {isDiscount ? `Save ₨ ${priceDiff}` : `+₨ ${priceDiff} Counter`}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
              For {offer.seats} {isBike ? 'pillion seat' : 'vacant seat'}
            </span>
          </div>
        </div>

        {/* Note / Comment if provided */}
        {offer.note && (
          <p className="text-[11px] text-slate-300 italic mt-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
            "{offer.note}"
          </p>
        )}

        {/* Action Buttons: Accept / Decline / Counter */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => onDecline(offer)}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition active:scale-98 cursor-pointer"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>Decline</span>
          </button>

          <button
            onClick={() => onAccept(offer)}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg transition active:scale-98 cursor-pointer border border-blue-900"
          >
            <Check className="w-4 h-4 text-white" />
            <span>Accept ₨ {offer.offeredPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
