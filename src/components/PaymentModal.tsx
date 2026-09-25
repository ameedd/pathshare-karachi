import React, { useState } from 'react';
import { X, Smartphone, CreditCard, CheckCircle2, Lock, Plus } from 'lucide-react';
import { UserPaymentMethod, PaymentMethodType } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPaymentMethod: (pm: UserPaymentMethod) => void;
  onToast: (msg: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onAddPaymentMethod,
  onToast
}) => {
  const [selectedType, setSelectedType] = useState<PaymentMethodType>('easypaisa');
  const [accountTitle, setAccountTitle] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [raastIban, setRaastIban] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedType === 'easypaisa' || selectedType === 'jazzcash') {
      if (!mobileNumber.trim() || mobileNumber.length < 10) {
        onToast('Please enter a valid mobile number.');
        return;
      }
      const title = selectedType === 'easypaisa' ? 'EasyPaisa Wallet' : 'JazzCash Account';
      const newPm: UserPaymentMethod = {
        id: 'pm-' + Date.now(),
        type: selectedType,
        title: title,
        accountNumberOrMaskedCard: mobileNumber.trim(),
        isDefault: false
      };
      onAddPaymentMethod(newPm);
      onToast(`${title} added successfully!`);
    } else if (selectedType === 'card') {
      // In compliance with PCI-DSS standard 3.2, raw PAN and CVV are never captured or handled directly in client DOM.
      // Debit/Credit card tokenization requires an external certified gateway checkout.
      onToast('Card payment is tokenized via certified PCI-DSS gateway at ride checkout.');
      const newPm: UserPaymentMethod = {
        id: 'pm-' + Date.now(),
        type: 'card',
        title: 'PCI-DSS Verified Card Gateway',
        accountNumberOrMaskedCard: 'Hosted Gateway Checkout (Stripe/Safepay)',
        isDefault: false
      };
      onAddPaymentMethod(newPm);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Add Payment Method</h3>
            <p className="text-xs text-slate-500">Tentative mobile wallets & card options</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Type Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedType('easypaisa')}
            className={`p-3 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              selectedType === 'easypaisa'
                ? 'border-blue-900 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white shadow-md font-bold'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
              selectedType === 'easypaisa' ? 'bg-white/20 text-white' : 'bg-slate-900 text-white'
            }`}>
              EP
            </div>
            <span className="text-xs">EasyPaisa</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('jazzcash')}
            className={`p-3 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              selectedType === 'jazzcash'
                ? 'border-blue-900 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white shadow-md font-bold'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
              selectedType === 'jazzcash' ? 'bg-white/20 text-white' : 'bg-slate-900 text-white'
            }`}>
              JC
            </div>
            <span className="text-xs">JazzCash</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('card')}
            className={`p-3 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
              selectedType === 'card'
                ? 'border-blue-900 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white shadow-md font-bold'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
            }`}
          >
            <CreditCard className={`w-6 h-6 ${selectedType === 'card' ? 'text-white' : 'text-slate-800'}`} />
            <span className="text-xs">Card</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2">
          {selectedType === 'easypaisa' && (
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs text-slate-800 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Smartphone className="w-4 h-4 text-slate-800" /> EasyPaisa Mobile Wallet
              </p>
              <p className="text-[11px] text-slate-600">
                Automatic cost-share fare deduction upon completing a ride.
              </p>
            </div>
          )}

          {selectedType === 'jazzcash' && (
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs text-slate-800 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Smartphone className="w-4 h-4 text-slate-800" /> JazzCash Mobile Wallet
              </p>
              <p className="text-[11px] text-slate-600">
                Facilitates instant mobile wallet payment for your daily commute.
              </p>
            </div>
          )}

          {(selectedType === 'easypaisa' || selectedType === 'jazzcash') && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700">Account Title (Name)</label>
                <input
                  type="text"
                  placeholder="e.g. Hamza Farooq"
                  value={accountTitle}
                  onChange={(e) => setAccountTitle(e.target.value)}
                  className="mt-1 w-full bg-slate-100 rounded-xl px-3 py-2.5 text-xs font-medium outline-none border border-slate-200 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Mobile Wallet Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 0300 9876543"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="mt-1 w-full bg-slate-100 rounded-xl px-3 py-2.5 text-xs font-medium outline-none border border-slate-200 text-slate-900"
                  required
                />
              </div>
            </>
          )}

          {selectedType === 'card' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2.5">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>PCI-DSS Level 1 Banking Compliance</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                PathShare strictly adheres to PCI-DSS standards: <span className="font-semibold text-slate-800">raw card numbers and CVV security codes are never stored on our servers or entered in uncertified forms</span>.
              </p>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-700">
                💳 Credit & Debit cards (Visa / Mastercard / PayPak) are tokenized through a certified hosted checkout window (Stripe / Safepay) during ride completion.
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-[11px]">
              <Lock className="w-3.5 h-3.5 text-slate-800" /> 256-Bit TLS Encrypted
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold py-3 rounded-xl shadow-md transition text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer border border-blue-900"
          >
            <Plus className="w-4 h-4" /> Save Payment Method
          </button>
        </form>
      </div>
    </div>
  );
};
