import React, { useState } from 'react';
import { X, CheckCircle2, Star, ShieldCheck, Wallet, ArrowRight, Download, Receipt } from 'lucide-react';
import { Ride, UserPaymentMethod } from '../types';

interface RideCheckoutModalProps {
  ride: Ride | null;
  isOpen: boolean;
  paymentMethods: UserPaymentMethod[];
  onClose: () => void;
  onCompletePayment: (rideId: number, rating: number, comment: string) => void;
  onOpenAddPaymentMethod: () => void;
  onToast: (msg: string) => void;
}

export const RideCheckoutModal: React.FC<RideCheckoutModalProps> = ({
  ride,
  isOpen,
  paymentMethods,
  onClose,
  onCompletePayment,
  onOpenAddPaymentMethod,
  onToast
}) => {
  const [selectedPmId, setSelectedPmId] = useState<string>(
    paymentMethods.find(p => p.isDefault)?.id || paymentMethods[0]?.id || ''
  );
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  if (!isOpen || !ride) return null;

  const selectedPm = paymentMethods.find(p => p.id === selectedPmId) || paymentMethods[0];

  const handlePayNow = () => {
    if (!selectedPm) {
      onToast('Please select or add a payment method first.');
      return;
    }
    const txId = 'PS-TX-' + Math.floor(100000 + Math.random() * 900000);
    setTransactionId(txId);
    setIsPaidSuccess(true);
    onToast(`Payment of ₨ ${ride.price} successful via ${selectedPm.title}!`);
  };

  const handleFinish = () => {
    onCompletePayment(ride.id, rating, comment);
    setIsPaidSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {isPaidSuccess ? 'Ride Receipt & Rating' : 'Ride Settlement'}
            </h3>
            <p className="text-xs text-slate-500">Non-commercial cost-sharing fare</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isPaidSuccess ? (
          <div className="space-y-4">
            {/* Fare summary box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Driver</span>
                <span className="font-bold text-slate-800">{ride.driver} ({ride.vehicle})</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Route</span>
                <span className="font-semibold text-slate-700 truncate max-w-[180px]">{ride.from} → {ride.to}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-700">Cost Share Fare</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900">₨ {ride.price} <span className="text-xs font-bold text-slate-500">/ seat</span></span>
                  <p className="text-[10px] text-slate-400">1 seat reserved</p>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Select Payment Method</label>
                <button
                  type="button"
                  onClick={onOpenAddPaymentMethod}
                  className="text-xs text-slate-800 font-bold hover:underline cursor-pointer"
                >
                  + Add EasyPaisa / JazzCash
                </button>
              </div>

              <div className="space-y-2">
                {paymentMethods.map((pm) => {
                  const isSelected = pm.id === selectedPmId;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setSelectedPmId(pm.id)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-slate-900 bg-slate-100 text-slate-900 shadow-2xs font-semibold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white">
                          {pm.type === 'easypaisa' ? 'EP' : pm.type === 'jazzcash' ? 'JC' : 'CARD'}
                        </div>
                        <div>
                          <p className="text-xs font-bold">{pm.title}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{pm.accountNumberOrMaskedCard}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-2 text-xs text-slate-800 font-medium">
              <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0" />
              <span>Automatic settlement upon pressing 'Pay & Complete Ride'</span>
            </div>

            <button
              type="button"
              onClick={handlePayNow}
              className="w-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold py-3.5 rounded-2xl shadow-lg transition text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer border border-blue-900"
            >
              Pay ₨ {ride.price} / seat & Complete Ride <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Receipt & Rating Form */
          <div className="space-y-4">
            {/* Digital Receipt */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2 shadow-inner">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white flex items-center justify-center mx-auto shadow-md">
                <Receipt className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Payment Confirmed!</h4>
              <p className="text-2xl font-black text-slate-900">₨ {ride.price}</p>
              <p className="text-[11px] text-slate-600">
                Paid to {ride.driver} via <strong>{selectedPm?.title}</strong>
              </p>
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-0.5">
                <p>Transaction ID: <span className="font-mono font-bold text-slate-800">{transactionId}</span></p>
                <p>Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {/* Rate & Review Colleague */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800">Rate your ride experience with {ride.driver}</label>
              <div className="flex justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1 hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a brief review for your colleague (e.g. punctual, smooth driving, great AC)..."
                rows={3}
                className="w-full bg-slate-100 rounded-2xl p-3 text-xs outline-none border border-slate-200 font-medium text-slate-900"
              />
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold py-3.5 rounded-2xl shadow-lg transition text-xs sm:text-sm cursor-pointer border border-blue-900"
            >
              Submit Review & Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
