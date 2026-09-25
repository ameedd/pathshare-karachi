import React, { useState } from 'react';
import { X, HandCoins, ArrowRight, Check, ShieldCheck, Banknote } from 'lucide-react';
import { Ride } from '../types';

interface BidModalProps {
  isOpen: boolean;
  ride: Ride | null;
  onClose: () => void;
  onSubmitBid: (rideId: number, fare: number, paymentMethod: string, notes?: string) => void;
}

export const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  ride,
  onClose,
  onSubmitBid
}) => {
  if (!isOpen || !ride) return null;

  const [counterFare, setCounterFare] = useState<number>(ride.price);
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [notes, setNotes] = useState<string>('Pick me up near main gate if possible');

  const perKmRate = ride.km > 0 ? (counterFare / ride.km).toFixed(1) : '0';

  const adjustFare = (delta: number) => {
    setCounterFare((prev) => Math.max(30, prev + delta));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitBid(ride.id, counterFare, paymentMethod, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-100 rounded-2xl text-amber-700">
              <HandCoins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Bargain & Offer Fare</h3>
              <p className="text-[11px] text-slate-500">inDrive-style counter offer bidding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ride Context */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-slate-700">{ride.driver}</span>
            <span className="text-slate-500 font-semibold">{ride.vehicle} ({ride.plateNumber || 'KHI-7890'})</span>
          </div>
          <p className="text-xs font-semibold text-slate-800 truncate">
            {ride.from} <ArrowRight className="w-3 h-3 inline mx-1 text-sky-500" /> {ride.to}
          </p>
          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
            <span>Posted Fare: <strong className="text-slate-800">₨ {ride.price}</strong></span>
            <span>Distance: <strong className="text-slate-800">{ride.km} km</strong></span>
          </div>
        </div>

        {/* Counter Offer Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block text-center mb-1">
              Your Counter Offer Price (PKR ₨ / seat)
            </label>

            <div className="flex items-center justify-center gap-3 bg-slate-100 p-3 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => adjustFare(-20)}
                className="w-9 h-9 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-base shadow-xs hover:bg-slate-50 active:scale-95 cursor-pointer"
              >
                -20
              </button>

              <div className="text-center px-3">
                <span className="text-2xl font-extrabold text-slate-900">₨ {counterFare} <span className="text-xs font-bold text-slate-500">/ seat</span></span>
                <span className="text-[10px] text-slate-600 block font-bold">₨ {perKmRate}/km</span>
              </div>

              <button
                type="button"
                onClick={() => adjustFare(+20)}
                className="w-9 h-9 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-base shadow-xs hover:bg-slate-50 active:scale-95 cursor-pointer"
              >
                +20
              </button>
            </div>

            {/* Quick Fare Presets */}
            <div className="flex gap-1.5 justify-center mt-2">
              <button
                type="button"
                onClick={() => setCounterFare(Math.max(30, ride.price - 50))}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
              >
                ₨ {ride.price - 50} (-50)
              </button>
              <button
                type="button"
                onClick={() => setCounterFare(ride.price)}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white border border-blue-900 cursor-pointer"
              >
                ₨ {ride.price} (Original)
              </button>
              <button
                type="button"
                onClick={() => setCounterFare(ride.price + 50)}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
              >
                ₨ {ride.price + 50} (+50)
              </button>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['Cash', 'JazzCash', 'EasyPaisa'].map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    paymentMethod === pm
                      ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white border-blue-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pm === 'Cash' ? '💵 Cash' : pm === 'JazzCash' ? '📱 JazzCash' : '💳 EasyPaisa'}
                </button>
              ))}
            </div>
          </div>

          {/* Special Pickup Note */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
              Pickup Note for Driver
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Waiting near main gate"
              className="w-full bg-slate-100 rounded-xl px-3 py-2 text-xs font-medium border border-slate-200 outline-none focus:border-slate-800 text-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white rounded-2xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer border border-blue-900"
          >
            <HandCoins className="w-4 h-4" /> Send Counter-Offer (₨ {counterFare} / seat)
          </button>
        </form>
      </div>
    </div>
  );
};
