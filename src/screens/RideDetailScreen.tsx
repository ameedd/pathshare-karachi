import React, { useState } from 'react';
import { ArrowLeft, BadgeCheck, Check, MessageCircle, MapPin, Clock, Info, ShieldAlert, AlertTriangle, ShieldCheck, Share2, Compass, Luggage, DollarSign, Lock, Bell, Sparkles, Navigation, Phone } from 'lucide-react';
import { Ride, UserProfile } from '../types';
import { MapView } from '../components/MapView';
import { SafetyDisclaimerModal } from '../components/SafetyDisclaimerModal';
import { BidModal } from '../components/BidModal';
import { SosModal } from '../components/SosModal';
import { OtpModal } from '../components/OtpModal';
import { WakeUpCallModal } from '../components/WakeUpCallModal';
import { DriverHotspotControl } from '../components/DriverHotspotControl';
import { HotspotArrivalData } from '../types';
import { getRouteDetails, getHotspotsWithTimings } from '../lib/routeEngine';

interface RideDetailScreenProps {
  ride: Ride;
  profile?: UserProfile;
  onBack: () => void;
  onRequestSeat: (ride: Ride) => void;
  onMessageDriver: (ride: Ride) => void;
  onCompleteRide?: (ride: Ride) => void;
  onShootArrival?: (ride: Ride) => void;
  onShootComing?: (ride: Ride) => void;
  onTriggerArrivalModal?: (data: HotspotArrivalData) => void;
  arrivalData?: HotspotArrivalData | null;
}

export const RideDetailScreen: React.FC<RideDetailScreenProps> = ({
  ride,
  profile,
  onBack,
  onRequestSeat,
  onMessageDriver,
  onCompleteRide,
  onShootArrival,
  onShootComing,
  onTriggerArrivalModal,
  arrivalData
}) => {
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isWakeUpModalOpen, setIsWakeUpModalOpen] = useState(false);
  const [wakeUpMins, setWakeUpMins] = useState<10 | 5>(10);
  
  const [currentFare, setCurrentFare] = useState(ride.price);
  const [hasCounterOffered, setHasCounterOffered] = useState(false);

  const routeInfo = getRouteDetails(ride.to);
  const waypoints = ride.via && ride.via.length > 0 ? ride.via : routeInfo.waypoints;
  const hotspotTimings = getHotspotsWithTimings(ride.time, waypoints, ride.km);

  const isBike = ride.type === 'bike';
  const isParcel = isBike && ride.serviceCategory === 'parcel';
  const perKmRate = ride.km > 0 ? (currentFare / ride.km).toFixed(1) : '0';

  const isDriver = Boolean(profile?.name && ride.driver && profile.name.toLowerCase() === ride.driver.toLowerCase());
  const isBookedPassenger = Boolean(onCompleteRide || (profile?.name && ride.bookedPassengers?.includes(profile.name)));
  const isAuthorized = isDriver || isBookedPassenger;

  const displayPlate = isAuthorized 
    ? (ride.plateNumber || 'KHI-7890') 
    : (ride.plateNumber ? `${ride.plateNumber.slice(0, 3)}-*** (Confirmed riders)` : 'Verified Plate');

  const shareRideWhatsApp = () => {
    const text = encodeURIComponent(
      `🚗 *PathShare Ride Offer*\n` +
      `• *Driver:* ${ride.driver}\n` +
      `• *Route:* ${ride.from} ➔ ${ride.to}\n` +
      `• *Time:* ${ride.time}\n` +
      `• *Cost Share:* ₨ ${currentFare} (₨ ${perKmRate}/km)\n` +
      `• *Vehicle:* ${ride.vehicle} (${displayPlate})\n` +
      (ride.pickupHotspot ? `• *Hotspot:* ${ride.pickupHotspot}\n` : '') +
      `\nInterested in carpooling together? Reply on PathShare!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const callDriver = () => {
    if (!isAuthorized) {
      alert('Direct phone calling is unlocked once your seat is confirmed. Please use in-app chat to coordinate with the driver.');
      return;
    }
    const phone = ride.driverPhone || '+923001234567';
    window.location.href = `tel:${phone}`;
  };

  const seatText = isParcel
    ? '1 Parcel slot available'
    : isBike
    ? (ride.seats > 0 ? '1 pillion seat available' : 'No seat left')
    : `${ride.seats} seat${ride.seats > 1 ? 's' : ''} available`;

  const handleSeatRequestClick = () => {
    setIsSafetyModalOpen(true);
  };

  const handleConfirmSafetyAndProceed = () => {
    onRequestSeat({ ...ride, price: currentFare });
  };

  const handleBiddingSuccess = (acceptedFare: number) => {
    setCurrentFare(acceptedFare);
    setHasCounterOffered(true);
  };

  return (
    <div className="pb-24 bg-slate-50 min-h-screen text-slate-800 antialiased">
      <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b border-slate-800 p-4 sticky top-0 z-20 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full transition cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-white">Ride details</h2>
        </div>

        {/* SOS Emergency Shield Button */}
        <button
          onClick={() => setIsSosModalOpen(true)}
          className="bg-rose-950/80 hover:bg-rose-900 text-rose-300 font-bold px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition border border-rose-800/80 shadow-md cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>SOS</span>
        </button>
      </header>

      <main className="p-4 space-y-4 max-w-md mx-auto">
        {/* Driver Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200">
          <div className="flex gap-3 items-center">
            <div className={`w-14 h-14 rounded-full ${isBike ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-slate-900 text-white'} flex items-center justify-center text-xl font-bold shrink-0 shadow-xs`}>
              {ride.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-bold text-lg text-slate-900">{ride.driver}</p>
                {ride.verified && <BadgeCheck className="w-5 h-5 text-slate-900 shrink-0" />}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isBike ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                  {isBike ? 'Bike' : 'Car'}
                </span>
                {ride.intercity && (
                  <span className="text-[10px] bg-slate-900 text-white font-extrabold px-2 py-0.5 rounded-full">
                    🛣️ Intercity
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{ride.rating} ★ • {ride.reviews} reviews verified</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <p className="text-xs font-semibold text-slate-700">
                  {ride.vehicle} {ride.modelYear || ''} • {ride.color || ''}
                </p>
                <span className="text-[11px] bg-slate-100 text-slate-800 font-extrabold px-2 py-0.5 rounded-lg border border-slate-200 tracking-wider">
                  🏷️ {displayPlate}
                </span>
              </div>

              {/* Trust & Safety Badges */}
              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                {ride.cnicVerified && (
                  <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                    🛡️ NADRA CNIC Verified
                  </span>
                )}
                {ride.licenseVerified && (
                  <span className="text-[11px] bg-sky-50 text-sky-800 font-bold px-2 py-0.5 rounded-lg border border-sky-200 flex items-center gap-1">
                    🪪 Sindh License Verified
                  </span>
                )}
                {ride.ladiesOnly && (
                  <span className="text-[11px] bg-pink-100 text-pink-700 font-extrabold px-2 py-0.5 rounded-lg border border-pink-200 flex items-center gap-1 shadow-2xs">
                    🌸 Women-Only Carpool
                  </span>
                )}
              </div>
              {!isBike && (
                <div className="flex gap-1.5 mt-1.5">
                  {ride.ac && <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] px-2 py-0.5 rounded-full font-semibold">AC Available</span>}
                  {ride.heater && <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] px-2 py-0.5 rounded-full font-semibold">Heater</span>}
                </div>
              )}
              {isBike && ride.spareHelmetProvided && (
                <p className="text-xs text-slate-700 font-medium mt-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                  ⛑️ Driver Provides Spare Helmet (Safety Standard)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Hotspot Banner */}
        {ride.pickupHotspot && (
          <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-2.5 shadow-xs">
            <Compass className="w-5 h-5 text-slate-800 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Recommended Meeting Hotspot</p>
              <p className="text-xs font-semibold text-slate-900">{ride.pickupHotspot}</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-800 font-extrabold px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
              3-Min Rule
            </span>
          </div>
        )}

        {/* DRIVER HOTSPOT ARRIVAL CONTROLS */}
        <DriverHotspotControl
          ride={ride}
          onShootComing={(r) => {
            if (onShootComing) onShootComing(r);
          }}
          onShootArrival={(r) => {
            if (onShootArrival) onShootArrival(r);
          }}
          onPreviewRiderModal={(r) => {
            if (onTriggerArrivalModal) {
              onTriggerArrivalModal({
                rideId: r.id,
                driverName: r.driver,
                driverAvatar: r.avatar,
                driverRating: r.rating,
                driverPhone: r.driverPhone,
                vehicle: r.vehicle,
                plateNumber: r.plateNumber || 'KHI-7890',
                color: r.color,
                pickupHotspot: r.pickupHotspot || r.from,
                price: r.price,
                timestamp: 'Just now',
                departureSecondsRemaining: 180,
                status: 'arrived'
              });
            }
          }}
          arrivalData={arrivalData}
        />

        {/* Intercity Luggage Policy */}
        {ride.intercity && (
          <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-2.5 shadow-xs">
            <Luggage className="w-5 h-5 text-slate-800 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Intercity Luggage Policy</p>
              <p className="text-xs font-semibold text-slate-900">{ride.luggageAllowance || '🧳 1 Handbag / Laptop bag per seat allowed'}</p>
            </div>
          </div>
        )}

        {/* Start PIN Banner - Confidential to confirmed participants */}
        <div className="bg-white text-slate-900 p-3.5 rounded-2xl flex items-center justify-between border border-slate-200 shadow-xs">
          {isAuthorized ? (
            <>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-sm">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Trip Verification PIN</p>
                  <p className="text-sm font-mono font-extrabold text-slate-900 tracking-widest">
                    {ride.startPin || '4892'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOtpModalOpen(true)}
                className="text-xs bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shadow-md border border-blue-900"
              >
                Verify OTP
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center font-bold text-sm">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Trip Verification PIN</p>
                  <p className="text-xs text-slate-500 font-medium">
                    🔒 Dispatched to confirmed passenger upon booking
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
                Booking Required
              </span>
            </div>
          )}
        </div>

        {/* WAKE-UP CALL ALARMS POPUP BANNER (10m & 5m) */}
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white flex items-center justify-center font-bold">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                  Wake-Up Call Notifications
                  <Sparkles className="w-3.5 h-3.5 text-slate-800" />
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Get ready reminders mapped to your route departure</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => {
                setWakeUpMins(10);
                setIsWakeUpModalOpen(true);
              }}
              className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-black text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition active:scale-98 cursor-pointer border border-blue-900"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Test 10-Min Call ⏰</span>
            </button>

            <button
              onClick={() => {
                setWakeUpMins(5);
                setIsWakeUpModalOpen(true);
              }}
              className="bg-slate-800 hover:bg-slate-900 text-white font-black text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition active:scale-98 cursor-pointer border border-slate-700"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-slate-300" />
              <span>Test 05-Min Call 🚨</span>
            </button>
          </div>
        </div>

        {/* Route Timeline & Mapped Hotspots Departure Schedule */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <p className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-slate-800" /> Route Hotspots Mapped Schedule
            </p>
            <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full border border-slate-200">
              Live ETAs
            </span>
          </div>

          {/* Departure Point */}
          <div className="flex items-start gap-3 pt-1">
            <div className="flex flex-col items-center pt-1">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-900 ring-4 ring-slate-100" />
              <div className="w-0.5 h-12 bg-slate-200" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Start Departure</p>
              <p className="font-bold text-sm text-slate-900">{ride.from}</p>
              <p className="text-[11px] text-slate-700 font-extrabold mt-0.5">⚡ Leaving: {ride.time}</p>
            </div>
          </div>

          {/* Mapped Intermediate Hotspots with Calculated Arrival Times */}
          {hotspotTimings.map((spot, idx) => (
            <div key={idx} className="flex items-start gap-3 pl-0.5">
              <div className="flex flex-col items-center pt-1">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-700 ring-2 ring-slate-200" />
                <div className="w-0.5 h-12 bg-slate-200" />
              </div>
              <div className="flex-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    📍 {spot.name}
                  </p>
                  <span className="text-[10px] font-black bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                    ETA: {spot.formattedEta} (+{spot.minutesFromStart}m)
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Hotspot Stopover #{idx + 1}
                </p>
              </div>
            </div>
          ))}

          {/* Destination Point */}
          <div className="flex items-start gap-3 pt-1">
            <div className="flex flex-col items-center pt-1">
              <div className="w-3.5 h-3.5 rounded-full bg-slate-900 ring-4 ring-slate-100" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">Destination Drop-Off</p>
              <p className="font-bold text-sm text-slate-900">{ride.to}</p>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Distance: {ride.km} km</p>
            </div>
          </div>
        </div>

        {/* Map View */}
        <MapView
          fromLocation={ride.from}
          toLocation={ride.to}
          waypoints={waypoints}
          fromCoords={ride.coordinates?.from}
          toCoords={ride.coordinates?.to}
          routeText={ride.route}
        />

        {/* Pricing Card & inDrive Bidding Option */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Cost-share fare (per seat)</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-extrabold text-slate-900">₨ {currentFare} <span className="text-sm font-bold text-slate-500">/ seat</span></p>
                {hasCounterOffered && (
                  <span className="text-[10px] bg-slate-100 text-slate-800 font-extrabold px-2 py-0.5 rounded-full border border-slate-200">
                    Agreed Offer
                  </span>
                )}
              </div>
            </div>

            {/* inDrive Counter Offer Button */}
            <button
              onClick={() => setIsBidModalOpen(true)}
              className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl transition flex items-center gap-1 shadow-md cursor-pointer border border-blue-900"
            >
              <DollarSign className="w-3.5 h-3.5 text-white" />
              <span>Counter Offer</span>
            </button>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Per KM Rate:</span>
              <span className="text-sm font-extrabold text-slate-900">₨ {perKmRate} / km</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">{ride.km} km distance</span>
          </div>

          {/* Accepted Payments */}
          {ride.paymentMethodsAccepted && (
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Accepted Payments</span>
              <div className="flex flex-wrap gap-1.5">
                {ride.paymentMethodsAccepted.map((pm, idx) => (
                  <span key={idx} className="text-xs bg-slate-100 text-slate-800 font-semibold px-2.5 py-0.5 rounded-lg border border-slate-200">
                    {pm}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={callDriver}
              className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              title="Call Driver via Phone"
            >
              <Phone className="w-4 h-4 text-slate-800" /> Call
            </button>
            <button
              onClick={() => onMessageDriver(ride)}
              className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-slate-800" /> Chat
            </button>
            <button
              onClick={handleSeatRequestClick}
              className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-98 cursor-pointer border border-blue-900"
            >
              <Check className="w-4 h-4" /> Request
            </button>
          </div>

          <button
            onClick={shareRideWhatsApp}
            className="w-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <Share2 className="w-4 h-4 text-slate-700" /> Share Ride Details on WhatsApp
          </button>

          {onCompleteRide && (
            <button
              onClick={() => onCompleteRide(ride)}
              className="w-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-98 cursor-pointer border border-blue-900"
            >
              <Check className="w-4 h-4" /> Complete Ride & Pay ₨ {currentFare} / seat
            </button>
          )}
        </div>

        {/* Modals */}
        <SafetyDisclaimerModal
          isOpen={isSafetyModalOpen}
          onClose={() => setIsSafetyModalOpen(false)}
          onConfirm={handleConfirmSafetyAndProceed}
        />

        <BidModal
          isOpen={isBidModalOpen}
          ride={ride}
          onClose={() => setIsBidModalOpen(false)}
          onSubmitBid={(rideId, fare) => {
            setCurrentFare(fare);
            setHasCounterOffered(true);
            setIsBidModalOpen(false);
          }}
        />

        <SosModal
          isOpen={isSosModalOpen}
          onClose={() => setIsSosModalOpen(false)}
          ride={ride}
          profile={profile}
        />

        <OtpModal
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          onVerifySuccess={() => {
            setIsOtpModalOpen(false);
          }}
          targetText="Ride Start Verification"
        />

        <WakeUpCallModal
          isOpen={isWakeUpModalOpen}
          minutesLeft={wakeUpMins}
          ride={ride}
          onClose={() => setIsWakeUpModalOpen(false)}
        />
      </main>
    </div>
  );
};
