import React from 'react';
import { BadgeCheck, Bell, MapPin, Search, ChevronRight, Route as RouteIcon, Navigation, Clock, Sparkles, Trash2 } from 'lucide-react';
import { Ride, RideRequest, ScreenId, UserProfile } from '../types';
import { RideCard } from '../components/RideCard';
import { getRouteDetails, getHotspotsWithTimings } from '../lib/routeEngine';
import { FARE_CONFIG } from '../lib/fareEngine';

interface HomeScreenProps {
  rides: Ride[];
  requests: RideRequest[];
  userProfile?: UserProfile;
  homeDestination: string;
  onSetHomeDestination: (dest: string) => void;
  onNavigate: (screen: ScreenId) => void;
  onSelectRide: (ride: Ride) => void;
  onDeleteRide?: (rideId: number) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  rides,
  requests,
  userProfile,
  homeDestination,
  onSetHomeDestination,
  onNavigate,
  onSelectRide,
  onDeleteRide
}) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const pendingRequestsCount = requests.filter(r => r.status === 'pending').length;

  const currentRouteDetails = getRouteDetails(homeDestination);

  // Dynamic Corridor Matching for Home Feed
  const cleanDestination = homeDestination.toLowerCase().replace(', karachi', '').trim();
  const matchedRides = React.useMemo(() => {
    const directMatches = rides.filter(r => {
      const toMatch = r.to.toLowerCase();
      const routeMatch = r.route.toLowerCase();
      const viaMatch = r.via?.some(v => v.toLowerCase().includes(cleanDestination));
      return toMatch.includes(cleanDestination) || routeMatch.includes(cleanDestination) || viaMatch;
    });

    return directMatches.length > 0 ? directMatches : rides;
  }, [rides, cleanDestination]);

  const hasDirectCorridorMatch = rides.some(r => 
    r.to.toLowerCase().includes(cleanDestination) || 
    r.route.toLowerCase().includes(cleanDestination) ||
    r.via?.some(v => v.toLowerCase().includes(cleanDestination))
  );

  // Filter rides where current user is the driver
  const myDriverRides = rides.filter(r => 
    r.driver.toLowerCase() === 'you' || 
    (userProfile?.name && r.driver.toLowerCase().includes(userProfile.name.toLowerCase()))
  );

  return (
    <div className="pb-24 bg-slate-50 min-h-screen text-slate-800 antialiased">
      {/* Header matching ameed.surge.sh */}
      <header className="bg-sky-600 text-white p-4 pt-8 rounded-b-3xl shadow-lg border-b border-sky-700">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sky-100 text-xs font-medium">{greeting}</p>
            <h2 className="text-xl font-bold tracking-tight text-white">{userProfile?.name || 'You (Commuter)'}</h2>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <button
              onClick={() => onNavigate('profile')}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition text-xs font-bold shrink-0 text-white border border-white/30"
              title="View Account / Sign Out"
            >
              ID
            </button>
          </div>
        </div>

        {/* Destination Quick Selector & Dynamic En-Route Waypoints */}
        <div className="mt-4 bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 space-y-2.5 shadow-md">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-white mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-sky-100 font-medium">Heading home to</p>
              <p className="font-bold text-sm truncate text-white">{homeDestination}</p>
            </div>
            <button
              onClick={() => onNavigate('search')}
              className="bg-white hover:bg-sky-50 text-sky-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" /> Find Ride
            </button>
          </div>

          {/* En-Route Major Stopover Waypoints */}
          <div className="pt-2 border-t border-white/20">
            <div className="flex items-center gap-1 text-[11px] text-sky-100 mb-1.5 font-medium">
              <Navigation className="w-3.5 h-3.5 text-white" />
              <span>Filter Home feed by destination:</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => onSetHomeDestination('DHA Phase 6, Karachi')}
                className={`text-[11px] px-3 py-1 rounded-lg transition flex items-center gap-1 font-medium cursor-pointer ${
                  homeDestination.includes('Phase 6') ? 'bg-white text-sky-700 font-bold shadow-md' : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                }`}
              >
                <span>Phase 6</span>
              </button>
              <button
                onClick={() => onSetHomeDestination('DHA Phase 8, Karachi')}
                className={`text-[11px] px-3 py-1 rounded-lg transition flex items-center gap-1 font-medium cursor-pointer ${
                  homeDestination.includes('Phase 8') ? 'bg-white text-sky-700 font-bold shadow-md' : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                }`}
              >
                <span>Phase 8</span>
              </button>
              <button
                onClick={() => onSetHomeDestination('Clifton, Karachi')}
                className={`text-[11px] px-3 py-1 rounded-lg transition flex items-center gap-1 font-medium cursor-pointer ${
                  homeDestination.includes('Clifton') ? 'bg-white text-sky-700 font-bold shadow-md' : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                }`}
              >
                <span>Clifton</span>
              </button>
              <button
                onClick={() => onSetHomeDestination('PECHS Block 6, Karachi')}
                className={`text-[11px] px-3 py-1 rounded-lg transition flex items-center gap-1 font-medium cursor-pointer ${
                  homeDestination.includes('PECHS') ? 'bg-white text-sky-700 font-bold shadow-md' : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                }`}
              >
                <span>PECHS</span>
              </button>
              <button
                onClick={() => onSetHomeDestination('Gulshan-e-Iqbal, Karachi')}
                className={`text-[11px] px-3 py-1 rounded-lg transition flex items-center gap-1 font-medium cursor-pointer ${
                  homeDestination.includes('Gulshan') ? 'bg-white text-sky-700 font-bold shadow-md' : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                }`}
              >
                <span>Gulshan</span>
              </button>
            </div>

            {/* Dynamic Full Path Line */}
            <div className="mt-2 text-xs bg-black/20 backdrop-blur-sm rounded-lg p-2 text-white flex items-center gap-1.5 border border-white/20">
              <RouteIcon className="w-3.5 h-3.5 text-sky-200 shrink-0" />
              <span className="truncate"><strong>Corridor Path:</strong> {currentRouteDetails.fullPath}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-5 max-w-md mx-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 text-center">
            <p className="text-2xl font-extrabold text-slate-900">{userProfile?.tripHistory?.length || 0}</p>
            <p className="text-[11px] text-slate-500 font-medium">Rides shared</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 text-center">
            <p className="text-2xl font-extrabold text-slate-900">
              ₨ {(userProfile?.tripHistory || []).reduce((acc, t) => acc + (t.totalCost || 0), 0)}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Cost saved</p>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 text-center">
            <p className="text-2xl font-extrabold text-amber-500">
              {userProfile?.rating ? `${userProfile.rating} ★` : '5.0 ★'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Rating</p>
          </div>
        </div>

        {/* Pending Requests Banner */}
        {pendingRequestsCount > 0 && (
          <button
            onClick={() => onNavigate('requests')}
            className="w-full bg-white border-2 border-slate-300 rounded-2xl p-3.5 flex items-center gap-3 text-left shadow-xs hover:border-sky-600 transition cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md shadow-sky-600/30">
              {pendingRequestsCount}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm">{pendingRequestsCount} pending ride requests</p>
              <p className="text-xs text-slate-600 truncate">Tap here → Accept or Decline incoming passenger seat requests</p>
            </div>
            <span className="text-slate-900 font-bold text-xs flex items-center shrink-0">
              View <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        )}

        {/* Driver Active Live Posts */}
        <section>
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="font-bold text-slate-900 text-sm">Your active posts (You as Driver)</h3>
            <span className="text-xs text-slate-500">{myDriverRides.length} active</span>
          </div>

          {myDriverRides.length > 0 ? (
            <div className="space-y-3">
              {myDriverRides.map(myRide => (
                <div key={myRide.id} className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{myRide.from} → {myRide.to}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">Today • ⚡ {myRide.time} • {myRide.seats} seat(s) left • {myRide.vehicle} ({myRide.type})</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-slate-100 text-slate-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-slate-200 inline-block">
                        Active
                      </span>
                      <div className="mt-1">
                        <span className="text-base font-extrabold text-slate-900">₨ {myRide.price || 350}</span>
                        <span className="text-[11px] text-slate-500 font-medium block">/ seat</span>
                      </div>
                    </div>
                  </div>

                  {/* Hotspots mapped */}
                  {myRide.pickupHotspot && (
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                        <span className="truncate"><strong>Hotspot:</strong> {myRide.pickupHotspot}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded shrink-0">
                        💺 Cost-share
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => onNavigate('post')}
                      className="flex-1 text-xs font-semibold border border-slate-300 py-2 rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition cursor-pointer"
                    >
                      Post another
                    </button>
                    <button
                      onClick={() => onNavigate('requests')}
                      className="flex-1 text-xs font-bold bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white py-2 rounded-xl hover:from-blue-600 hover:to-slate-900 transition cursor-pointer shadow-md shadow-blue-950/20 border border-blue-900"
                    >
                      Requests ({pendingRequestsCount})
                    </button>
                    {onDeleteRide && (
                      <button
                        onClick={() => onDeleteRide(myRide.id)}
                        className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
                        title="Delete this posted ride"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-4 text-center border border-dashed border-slate-300">
              <p className="text-xs text-slate-500 font-medium">You haven't published a ride today as a driver.</p>
              <button
                onClick={() => onNavigate('post')}
                className="mt-2 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white text-xs font-bold px-4 py-2 rounded-xl hover:from-blue-600 hover:to-slate-900 transition shadow-md shadow-blue-950/20 cursor-pointer border border-blue-900"
              >
                + Post a Ride (Offer Seats)
              </button>
            </div>
          )}
        </section>

        {/* Safety & Precaution Notice Banner */}
        <section className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex justify-between items-center text-slate-800">
            <span className="font-extrabold text-xs flex items-center gap-1.5 text-slate-900">
              <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse" />
              🛡️ Commuter Safety & Anti-Theft Protocol
            </span>
            <button
              onClick={() => onNavigate('profile')}
              className="text-[10px] bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white font-bold px-2.5 py-1 rounded-md transition cursor-pointer"
            >
              Read Rules
            </button>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug font-medium">
            PathShare matches commuters on verified corridors. Always verify CNIC/Office ID & start ride using your 4-digit PIN.
          </p>
        </section>

        {/* Evening Homebound Rides List Filtered by Location */}
        <section>
          <div className="flex justify-between items-center mb-2.5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Rides toward {homeDestination.split(',')[0]}
              </h3>
              <p className="text-[11px] text-slate-500">
                {hasDirectCorridorMatch ? '📍 Filtered strictly by your corridor' : 'Showing all active city corridors'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('search')}
              className="text-slate-900 text-xs font-bold hover:underline cursor-pointer"
            >
              Search all ({rides.length})
            </button>
          </div>
          <div className="space-y-3">
            {matchedRides.length === 0 ? (
              <div className="bg-white rounded-2xl p-7 text-center border border-slate-200/80 shadow-xs space-y-3">
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto border border-sky-100">
                  <RouteIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">No Rides Posted Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto font-medium">
                    Be the first to offer a seat or share your daily commute route on PathShare!
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => onNavigate('post')}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                  >
                    + Post a Ride
                  </button>
                  <button
                    onClick={() => onNavigate('search')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Find Rides
                  </button>
                </div>
              </div>
            ) : (
              matchedRides.slice(0, 5).map((ride) => (
                <RideCard key={ride.id} ride={ride} onClick={onSelectRide} />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
