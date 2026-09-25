import React from 'react';
import { ArrowLeft, BadgeCheck, Check, X, MessageCircle, Car, Compass, Phone, Share2, Trash2 } from 'lucide-react';
import { RideRequest } from '../types';

interface RequestsScreenProps {
  requests: RideRequest[];
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
  onBack: () => void;
  onMessagePassenger: (req: RideRequest) => void;
  onShootArrival?: (req: RideRequest) => void;
  onDeleteRequest?: (id: number) => void;
  onClearAllRequests?: () => void;
}

export const RequestsScreen: React.FC<RequestsScreenProps> = ({
  requests,
  onAccept,
  onDecline,
  onBack,
  onMessagePassenger,
  onShootArrival,
  onDeleteRequest,
  onClearAllRequests
}) => {
  const callPassenger = (req: RideRequest) => {
    const phone = req.phone || '+923009876543';
    window.location.href = `tel:${phone}`;
  };

  const whatsAppPassenger = (req: RideRequest) => {
    const phone = (req.phone || '923009876543').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(`👋 Hi ${req.name}, I accepted your PathShare carpool request for ${req.rideLabel}. Pickup at ${req.pickup}.`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };
  return (
    <div className="pb-24 bg-slate-50 min-h-screen text-slate-800 antialiased">
      <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b border-slate-800 p-4 sticky top-0 z-20 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full transition cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">Ride requests</h2>
            <p className="text-xs text-slate-400">Passengers wanting to join your posted commute routes</p>
          </div>
        </div>
        {requests.length > 0 && onClearAllRequests && (
          <button
            onClick={onClearAllRequests}
            className="text-xs text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-900/80 px-2.5 py-1 rounded-lg border border-rose-800 cursor-pointer transition flex items-center gap-1 shrink-0"
            title="Clear all requests"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>
        )}
      </header>

      <main className="p-4 space-y-3 max-w-md mx-auto">
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200 space-y-2 shadow-xs">
            <p className="font-semibold text-sm text-slate-800">No requests right now</p>
            <p className="text-xs text-slate-500">When commuters along your route request a seat, they will show up here.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              className={`bg-white rounded-2xl p-4 shadow-xs border transition ${
                req.status === 'accepted'
                  ? 'border-slate-800 bg-slate-50'
                  : req.status === 'declined'
                  ? 'border-slate-200 opacity-60'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex gap-3 items-start">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-sm shrink-0">
                  {req.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="font-bold text-slate-900 text-sm">{req.name}</p>
                      {req.verified && <BadgeCheck className="w-4 h-4 text-blue-600 shrink-0" />}
                      <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded font-medium">
                        {req.gender}
                      </span>
                    </div>
                    {onDeleteRequest && (
                      <button
                        onClick={() => onDeleteRequest(req.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete request"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {req.rating} ★ • Wants {req.seatsWanted} seat{req.seatsWanted > 1 ? 's' : ''}
                  </p>

                  <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">{req.rideLabel}</p>
                    <p className="text-xs text-slate-700 font-medium">
                      <span className="text-slate-400">Pickup point:</span> {req.pickup}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Requested {req.timeAgo}</p>
                </div>
              </div>

              {req.status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onDecline(req.id)}
                    className="flex-1 border border-slate-300 hover:bg-slate-100 py-2.5 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 cursor-pointer transition shadow-xs"
                  >
                    <X className="w-3.5 h-3.5 text-rose-500" /> Decline
                  </button>
                  <button
                    onClick={() => onAccept(req.id)}
                    className="flex-1 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1 cursor-pointer border border-blue-900 transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                </div>
              )}

              {req.status === 'accepted' && (
                <div className="mt-3 pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                      Accepted ✓
                    </span>

                    {onShootArrival && (
                      <button
                        onClick={() => onShootArrival(req)}
                        className="text-[11px] font-black bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-md transition cursor-pointer border border-blue-900"
                        title="Alert passenger you have arrived at the hotspot (3-min countdown)"
                      >
                        <Car className="w-3.5 h-3.5" /> Shoot "Arrived" 🎯
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      onClick={() => callPassenger(req)}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition border border-slate-200 cursor-pointer shadow-xs"
                      title="Direct Phone Call"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-700" />
                      <span>Call</span>
                    </button>

                    <button
                      onClick={() => whatsAppPassenger(req)}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition border border-slate-200 cursor-pointer shadow-xs"
                      title="WhatsApp Direct Chat"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-700" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => onMessagePassenger(req)}
                      className="py-1.5 px-2 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition border border-blue-900 cursor-pointer shadow-md"
                      title="In-App Chat"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-slate-200" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              )}

              {req.status === 'declined' && (
                <div className="mt-2 text-xs text-slate-400 italic">
                  Request declined
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
};
