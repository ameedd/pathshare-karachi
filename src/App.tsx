import React, { useState, useEffect } from 'react';
import { ScreenId, Ride, RideRequest, ChatThread, ChatMessage, UserProfile, UserPaymentMethod } from './types';
import { initialRides, initialRequests, initialChats, initialProfile } from './data/mockData';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { PaymentModal } from './components/PaymentModal';
import { RideCheckoutModal } from './components/RideCheckoutModal';
import { InDriveFloatingOffer, FloatingOfferData } from './components/InDriveFloatingOffer';
import { WakeUpCallModal } from './components/WakeUpCallModal';
import { HotspotArrivalModal } from './components/HotspotArrivalModal';
import { HotspotArrivalData } from './types';
import {
  auth,
  ensureAuthUser,
  syncUserProfile,
  updateUserProfileInDb,
  saveTripToHistoryInDb,
  subscribeToRides,
  publishRideToDb,
  deleteRideFromDb,
  subscribeToRequests,
  saveRequestToDb,
  updateRequestInDb,
  deleteRequestFromDb,
  subscribeToChats,
  saveChatToDb,
  deleteChatFromDb,
  addMessageToChatInDb,
  requestSeatTransactional,
  acceptSeatRequestTransactional,
  clearAllRidesAndChatsFromDb
} from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { SearchScreen } from './screens/SearchScreen';
import { PostRideScreen } from './screens/PostRideScreen';
import { RideDetailScreen } from './screens/RideDetailScreen';
import { RequestsScreen } from './screens/RequestsScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { AdminReviewScreen } from './screens/AdminReviewScreen';
import { LegalScreen } from './screens/LegalScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('login');
  const [rides, setRides] = useState<Ride[]>([]);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(initialProfile);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [hasAdminClaim, setHasAdminClaim] = useState(false);
  
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [homeDestination, setHomeDestination] = useState<string>('DHA Phase 6, Karachi');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Strictly enforce server-verified admin: token custom claim or designated admin email
  const isAdmin = hasAdminClaim || userProfile.email === 'admin@pathshare.pk';

  // Floating inDrive counter offer state
  const [activeFloatingOffer, setActiveFloatingOffer] = useState<FloatingOfferData | null>(null);

  const handleLogin = (credentials?: { method: 'whatsapp' | 'sms' | 'both' | 'email' | 'phone'; identifier: string }) => {
    localStorage.setItem('pathshare_logged_in', 'true');
    if (credentials) {
      localStorage.setItem('pathshare_auth_method', credentials.method);
      localStorage.setItem('pathshare_auth_id', credentials.identifier);

      setUserProfile((prev) => {
        const updated = {
          ...prev,
          phone: (credentials.method === 'whatsapp' || credentials.method === 'sms' || credentials.method === 'both' || credentials.method === 'phone') ? credentials.identifier : prev.phone,
          email: credentials.method === 'email' ? credentials.identifier : prev.email
        };
        if (firebaseUid) {
          updateUserProfileInDb(firebaseUid, updated).catch(console.error);
        }
        return updated;
      });
    }

    setCurrentScreen('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('pathshare_logged_in');
    setCurrentScreen('login');
    showToast('Signed out successfully.');
  };

  const handleClearAllData = async () => {
    try {
      await clearAllRidesAndChatsFromDb();
      setRides([]);
      setRequests([]);
      setChats([]);
      setSelectedThread(null);
      setSelectedRide(null);
      showToast('All demo rides, offers, and chats removed. App is clean!');
    } catch (err) {
      console.error(err);
      showToast('Error cleaning database');
    }
  };

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [checkoutRide, setCheckoutRide] = useState<Ride | null>(null);
  const [isWakeUpModalOpen, setIsWakeUpModalOpen] = useState(false);
  const [wakeUpMins, setWakeUpMins] = useState<10 | 5>(10);
  const [wakeUpRide, setWakeUpRide] = useState<Ride | null>(null);

  // Hotspot Arrival State (Driver shoots arrival -> 3-minute popup to rider)
  const [activeArrivalData, setActiveArrivalData] = useState<HotspotArrivalData | null>(null);
  const [isArrivalModalOpen, setIsArrivalModalOpen] = useState(false);

  const handleShootArrival = (ride: any) => {
    const rideId = ride.id || (ride.rideId ? Number(ride.rideId) : Date.now());
    const driverName = ride.driver || ride.driverName || ride.name || 'Your Driver';
    const driverAvatar = ride.avatar || ride.driverAvatar || 'DR';
    const driverRating = ride.rating || 4.9;
    const vehicle = ride.vehicle || 'Honda City (White)';
    const plateNumber = ride.plateNumber || 'KHI-7890';
    const pickupHotspot = ride.pickupHotspot || ride.from || `${ride.from || 'Pickup'} Main Gate`;
    const price = ride.price || ride.fare || 250;
    const startPin = ride.startPin || ride.otp || '4892';

    const arrivalPayload: HotspotArrivalData = {
      rideId,
      driverName,
      driverAvatar,
      driverRating,
      vehicle,
      plateNumber,
      pickupHotspot,
      startPin,
      price,
      timestamp: 'Just now',
      departureSecondsRemaining: 180,
      status: 'arrived'
    };

    setActiveArrivalData(arrivalPayload);
    setIsArrivalModalOpen(true);
    showToast(`🚨 Shot "I Have Arrived!" alert. 3-minute departure countdown started!`);

    // Post to chat thread
    const arrivalMsgText = `🚨 DRIVER HAS ARRIVED AT HOTSPOT: ${pickupHotspot}\n⏰ 3-Minute Departure Countdown Active!\nPlease reach and board vehicle (${plateNumber}) within 3 minutes.`;
    
    let thread = chats.find(c => c.participantName === driverName || (ride.name && c.participantName === ride.name));
    if (thread) {
      const newMsg: ChatMessage = {
        id: Date.now(),
        sender: 'system',
        text: arrivalMsgText,
        timestamp: 'Just now'
      };
      const updated = {
        ...thread,
        lastMessage: `🚨 Driver Arrived at ${pickupHotspot} (3m timer)`,
        messages: [...thread.messages, newMsg]
      };
      setChats(prev => prev.map(c => c.id === thread!.id ? updated : c));
      addMessageToChatInDb(thread.id, newMsg, updated).catch(console.error);
    }
  };

  const handleShootComing = (ride: any) => {
    const pickupHotspot = ride.pickupHotspot || ride.from || 'Pickup Hotspot Gate';
    showToast(`🚗 Broadcasted "I Am Coming" status to passengers en route to ${pickupHotspot}!`);

    let thread = chats.find(c => c.participantName === (ride.driver || ride.name));
    if (thread) {
      const comingMsg: ChatMessage = {
        id: Date.now(),
        sender: 'system',
        text: `🚗 DRIVER EN ROUTE: "I am coming to ${pickupHotspot} (ETA ~2-3 mins). Please get ready!"`,
        timestamp: 'Just now'
      };
      const updated = {
        ...thread,
        lastMessage: `🚗 Driver en route to ${pickupHotspot}`,
        messages: [...thread.messages, comingMsg]
      };
      setChats(prev => prev.map(c => c.id === thread!.id ? updated : c));
      addMessageToChatInDb(thread.id, comingMsg, updated).catch(console.error);
    }
  };

  const handleRiderAcknowledgeComing = (rideId: number, note?: string) => {
    setActiveArrivalData(prev => prev ? { ...prev, status: 'rider_acknowledged', riderNote: note } : null);
    showToast(`Driver notified: You are on your way to the hotspot! 🚶`);

    if (activeArrivalData) {
      let thread = chats.find(c => c.participantName === activeArrivalData.driverName);
      if (thread) {
        const ackMsg: ChatMessage = {
          id: Date.now(),
          sender: 'user',
          text: `🚶 Passenger: ${note || "I'm heading out to the vehicle right now! Please wait 1 minute."}`,
          timestamp: 'Just now'
        };
        const updated = {
          ...thread,
          lastMessage: `🚶 Passenger heading to hotspot`,
          messages: [...thread.messages, ackMsg]
        };
        setChats(prev => prev.map(c => c.id === thread!.id ? updated : c));
        addMessageToChatInDb(thread.id, ackMsg, updated).catch(console.error);
      }
    }
  };

  const handleRiderConfirmBoarded = (rideId: number) => {
    setActiveArrivalData(prev => prev ? { ...prev, status: 'boarded' } : null);
    showToast(`Welcome aboard! Trip start confirmed. Have a safe ride.`);

    if (activeArrivalData) {
      let thread = chats.find(c => c.participantName === activeArrivalData.driverName);
      if (thread) {
        const boardMsg: ChatMessage = {
          id: Date.now(),
          sender: 'system',
          text: `✅ Passenger Boarded: Start PIN verified. Ride in progress!`,
          timestamp: 'Just now'
        };
        const updated = {
          ...thread,
          lastMessage: `✅ Passenger Boarded`,
          messages: [...thread.messages, boardMsg]
        };
        setChats(prev => prev.map(c => c.id === thread!.id ? updated : c));
        addMessageToChatInDb(thread.id, boardMsg, updated).catch(console.error);
      }
    }
  };

  // Initialize Firebase User and Sync with Firestore
  useEffect(() => {
    // Purge any legacy client-side localStorage admin bypass
    try {
      localStorage.removeItem('pathshare_is_admin');
    } catch {}

    // Real Firebase Auth state listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUid(user.uid);
        try {
          const tokenResult = await user.getIdTokenResult();
          setHasAdminClaim(Boolean(tokenResult.claims.admin));
        } catch {
          setHasAdminClaim(false);
        }

        const synced = await syncUserProfile(user.uid, userProfile);
        setUserProfile(synced);
      } else {
        setHasAdminClaim(false);
      }
    });

    ensureAuthUser()
      .then(async (user) => {
        setFirebaseUid(user.uid);
        try {
          const tokenResult = await user.getIdTokenResult();
          setHasAdminClaim(Boolean(tokenResult.claims.admin));
        } catch {}
        const synced = await syncUserProfile(user.uid, userProfile);
        setUserProfile(synced);
      })
      .catch((err) => {
        console.warn('Firebase init warning:', err);
      });

    // Real-time Firestore Subscriptions for Rides, Requests, and Chats
    const unsubscribeRides = subscribeToRides((cloudRides) => {
      setRides(cloudRides || []);
    });

    const unsubscribeRequests = subscribeToRequests((cloudRequests) => {
      setRequests(cloudRequests || []);
    });

    const unsubscribeChats = subscribeToChats((cloudChats) => {
      setChats(cloudChats || []);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeRides();
      unsubscribeRequests();
      unsubscribeChats();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const next = { ...prev, ...updated };
      if (firebaseUid) {
        updateUserProfileInDb(firebaseUid, updated).catch(console.error);
      }
      return next;
    });
  };

  const handleAddPaymentMethod = (pm: UserPaymentMethod) => {
    setUserProfile(prev => {
      const newMethods = [pm, ...prev.paymentMethods];
      const next = { ...prev, paymentMethods: newMethods };
      if (firebaseUid) {
        updateUserProfileInDb(firebaseUid, { paymentMethods: newMethods }).catch(console.error);
      }
      return next;
    });
  };

  const handleOpenCheckout = (ride: Ride) => {
    setCheckoutRide(ride);
  };

  const handleCompletePayment = (rideId: number, rating: number, comment: string) => {
    showToast('Ride completed & payment settled!');
    setRides(prev =>
      prev.map(r => (r.id === rideId ? { ...r, status: 'completed' as const } : r))
    );

    if (checkoutRide) {
      const defaultPm = userProfile.paymentMethods.find(p => p.isDefault) || userProfile.paymentMethods[0];
      const newTripItem = {
        id: `th-${Date.now()}`,
        date: 'Just now',
        from: checkoutRide.from,
        to: checkoutRide.to,
        driverName: checkoutRide.driver,
        vehicle: checkoutRide.vehicle,
        vehicleType: checkoutRide.type,
        seats: 1,
        totalCost: checkoutRide.price,
        paymentMethod: defaultPm ? defaultPm.title : 'EasyPaisa Wallet',
        status: 'completed' as const,
        role: 'passenger' as const
      };

      const newTripHistory = [newTripItem, ...userProfile.tripHistory];
      const newReviews = comment.trim()
        ? [
            {
              id: Date.now(),
              reviewerName: 'You (Passenger)',
              reviewerAvatar: 'YOU',
              rating,
              date: 'Just now',
              comment: comment.trim(),
              role: 'passenger' as const
            },
            ...userProfile.reviews
          ]
        : userProfile.reviews;

      setUserProfile(prev => ({
        ...prev,
        tripHistory: newTripHistory,
        reviews: newReviews
      }));

      if (firebaseUid) {
        saveTripToHistoryInDb(firebaseUid, newTripItem).catch(console.error);
        updateUserProfileInDb(firebaseUid, {
          tripHistory: newTripHistory,
          reviews: newReviews
        }).catch(console.error);
      }
    } else if (comment.trim()) {
      const newReview = {
        id: Date.now(),
        reviewerName: 'You (Passenger)',
        reviewerAvatar: 'YOU',
        rating,
        date: 'Just now',
        comment: comment.trim(),
        role: 'passenger' as const
      };
      setUserProfile(prev => ({
        ...prev,
        reviews: [newReview, ...prev.reviews]
      }));
    }

    setCheckoutRide(null);
  };


  // Publish a new live ride
  const handlePublishRide = (newRideData: Partial<Ride>) => {
    const newRide: Ride = {
      id: Date.now(),
      type: newRideData.type || 'car',
      driver: newRideData.driver || 'You (Driver)',
      gender: 'male',
      rating: 5.0,
      reviews: 1,
      verified: true,
      from: newRideData.from || 'Office',
      to: newRideData.to || 'Home',
      time: newRideData.time || '19:30',
      seats: newRideData.seats || 2,
      basePrice: newRideData.basePrice || 450,
      price: newRideData.price || 450,
      km: newRideData.km || 12,
      vehicle: newRideData.vehicle || 'Honda City',
      modelYear: newRideData.modelYear || '2021',
      color: newRideData.color || 'White',
      ac: newRideData.ac ?? true,
      heater: newRideData.heater ?? false,
      prefs: newRideData.prefs || ['No smoking'],
      avatar: 'YOU',
      route: newRideData.route || `${newRideData.from} → ${newRideData.to}`,
      via: newRideData.via || ['Sea View'],
      coordinates: newRideData.coordinates || {
        from: [24.8252, 67.0315],
        to: [24.8028, 67.0673]
      }
    };

    setRides(prev => [newRide, ...prev]);
    publishRideToDb(newRide).catch(console.error);
    showToast(`Ride published! ${newRide.vehicle} to ${newRide.to} at ₨ ${newRide.price}/seat.`);
    setCurrentScreen('home');
  };

  // Handle seat request from passenger side
  const handleRequestSeat = async (ride: Ride) => {
    if (ride.seats <= 0) {
      showToast('⚠️ Sorry, all seats on this ride have been booked!');
      return;
    }

    showToast(`Requesting seat on ${ride.driver}'s ride...`);

    const newReq: RideRequest = {
      id: Date.now(),
      rideId: ride.id,
      name: userProfile.name || 'You (Passenger)',
      avatar: userProfile.avatarUrl || 'YOU',
      rating: userProfile.rating || 4.9,
      verified: userProfile.officeCardStatus === 'verified',
      seatsWanted: 1,
      pickup: ride.pickupHotspot || ride.from,
      rideLabel: ride.route,
      timeAgo: 'Just now',
      gender: 'male',
      status: 'pending',
      farePerSeat: ride.price
    };

    // Atomic seat validation & transaction
    const txResult = await requestSeatTransactional(ride.id, newReq);
    if (!txResult.success) {
      showToast(`⚠️ ${txResult.error || 'Seat no longer available.'}`);
      return;
    }

    const generatedPin = txResult.rideOtp || ride.startPin || '4892';
    showToast(`Seat requested! Trip Start PIN: ${generatedPin}`);
    setRequests(prev => [newReq, ...prev]);
  };

  // Accept request from driver side
  const handleAcceptRequest = async (id: number) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;

    const matchedRide = rides.find(r => r.id === req.rideId || r.route === req.rideLabel);
    const rideId = matchedRide?.id || req.rideId;

    const result = await acceptSeatRequestTransactional(id, rideId);
    if (!result.success) {
      showToast(`⚠️ ${result.error || 'Failed to accept request.'}`);
      return;
    }

    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'accepted' as const } : r))
    );

    if (rideId) {
      setRides(prev =>
        prev.map(r => r.id === rideId ? { ...r, seats: Math.max(0, r.seats - (req.seatsWanted || 1)) } : r)
      );
    }

    showToast('Request accepted! Chat unlocked with passenger.');

    if (req) {
      const pinCode = req.otp || '6192';
      const toLoc = req.rideLabel.includes('→') ? req.rideLabel.split('→')[1].trim() : 'DHA Phase 8, Karachi';
      let thread = chats.find(c => c.participantName === req.name);
      
      const mapMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: 'driver',
        text: `📍 Live Pickup Spot: ${req.pickup} (Route: ${req.rideLabel})`,
        timestamp: 'Just now',
        mapData: {
          fromLocation: req.pickup,
          toLocation: toLoc,
          pickupHotspot: req.pickup,
          fare: req.farePerSeat || 300,
          pin: pinCode
        }
      };

      if (!thread) {
        thread = {
          id: Date.now(),
          participantName: req.name,
          participantAvatar: req.avatar,
          rating: req.rating,
          verified: req.verified,
          from: req.pickup,
          to: toLoc,
          route: req.rideLabel,
          pickupHotspot: req.pickup,
          fare: req.farePerSeat || 300,
          startPin: pinCode,
          lastMessage: `Seat Request Accepted: ${req.seatsWanted} seat(s)`,
          timeAgo: 'Just now',
          unreadCount: 0,
          messages: [
            {
              id: 1,
              sender: 'system',
              text: `Seat Request Accepted: ${req.seatsWanted} seat(s) • ₨ ${req.farePerSeat || 300} • PIN: ${pinCode}`,
              timestamp: 'Just now'
            }
          ]
        };
        setChats(prev => [thread!, ...prev]);
        saveChatToDb(thread).catch(console.error);
      }
    }
  };

  // Decline request
  const handleDeclineRequest = (id: number) => {
    setRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: 'declined' as const } : r))
    );
    updateRequestInDb(id, { status: 'declined' }).catch(console.error);
    showToast('Ride request declined.');
  };

  // Delete posted ride
  const handleDeleteRide = (rideId: number) => {
    setRides(prev => prev.filter(r => r.id !== rideId));
    deleteRideFromDb(rideId).catch(console.error);
    showToast('Posted ride deleted.');
  };

  // Delete ride request
  const handleDeleteRequest = (requestId: number) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
    deleteRequestFromDb(requestId).catch(console.error);
    showToast('Ride request removed.');
  };

  // Clear all ride requests
  const handleClearAllRequests = () => {
    requests.forEach(r => {
      deleteRequestFromDb(r.id).catch(console.error);
    });
    setRequests([]);
    showToast('All ride requests cleared.');
  };

  // Delete chat thread
  const handleDeleteChat = (chatId: number) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (selectedThread?.id === chatId) {
      setSelectedThread(null);
    }
    deleteChatFromDb(chatId).catch(console.error);
    showToast('Conversation deleted.');
  };

  // Clear all chat threads
  const handleClearAllChats = () => {
    chats.forEach(c => {
      deleteChatFromDb(c.id).catch(console.error);
    });
    setChats([]);
    setSelectedThread(null);
    showToast('All conversations cleared.');
  };

  // Send message in chat thread
  const handleSendMessage = (threadId: number, text: string) => {
    const threadToUpdate = chats.find(c => c.id === threadId);
    if (!threadToUpdate) return;

    const isLoc = text.includes('📍') || text.toLowerCase().includes('pickup spot');
    const newMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mapData: isLoc
        ? {
            fromLocation: threadToUpdate.pickupHotspot || threadToUpdate.from || 'Hassan Square, Gulshan-e-Iqbal, Karachi',
            toLocation: threadToUpdate.to || 'DHA Phase 6, Karachi',
            pickupHotspot: threadToUpdate.pickupHotspot || threadToUpdate.from,
            fare: threadToUpdate.fare,
            pin: threadToUpdate.startPin,
            vehicle: threadToUpdate.vehicle
          }
        : undefined
    };

    addMessageToChatInDb(threadId, newMsg, threadToUpdate).catch(console.error);

    const updatedThread = {
      ...threadToUpdate,
      lastMessage: text,
      timeAgo: 'Just now',
      messages: [...threadToUpdate.messages, newMsg]
    };
    setSelectedThread(updatedThread);
    setChats(prev => prev.map(c => c.id === threadId ? updatedThread : c));
  };

  // Open detail screen
  const handleSelectRide = (ride: Ride) => {
    setSelectedRide(ride);
    setCurrentScreen('detail');
  };

  const handleMessageDriverFromDetail = (ride: Ride) => {
    let thread = chats.find(c => c.participantName === ride.driver);
    if (!thread) {
      const pinCode = ride.startPin || '4892';
      const initialUserMsg: ChatMessage = {
        id: Date.now(),
        sender: 'user',
        text: `Hi ${ride.driver}, is your ride to ${ride.to} available? I would like to join from ${ride.pickupHotspot || ride.from}.`,
        timestamp: 'Just now'
      };

      thread = {
        id: Date.now(),
        participantName: ride.driver,
        participantAvatar: ride.avatar,
        rating: ride.rating,
        verified: ride.verified,
        from: ride.from,
        to: ride.to,
        route: ride.route,
        vehicle: ride.vehicle,
        plateNumber: ride.plateNumber,
        pickupHotspot: ride.pickupHotspot || ride.from,
        fare: ride.price,
        startPin: pinCode,
        lastMessage: initialUserMsg.text,
        timeAgo: 'Just now',
        unreadCount: 0,
        messages: [initialUserMsg]
      };
      setChats(prev => [thread!, ...prev]);
      saveChatToDb(thread).catch(console.error);
    }
    setSelectedThread(thread);
    setCurrentScreen('messages');
  };

  const unreadChatsCount = chats.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {currentScreen === 'login' && (
        <LoginScreen onLogin={handleLogin} onToast={showToast} />
      )}

      {currentScreen === 'home' && (
        <HomeScreen
          rides={rides}
          requests={requests}
          userProfile={userProfile}
          homeDestination={homeDestination}
          onSetHomeDestination={(dest) => {
            setHomeDestination(dest);
            showToast(`Commute corridor updated to ${dest}`);
          }}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onSelectRide={handleSelectRide}
          onDeleteRide={handleDeleteRide}
        />
      )}

      {currentScreen === 'search' && (
        <SearchScreen
          rides={rides}
          homeDestination={homeDestination}
          onSetHomeDestination={(dest) => {
            setHomeDestination(dest);
          }}
          onSelectRide={handleSelectRide}
          onToast={showToast}
        />
      )}

      {currentScreen === 'post' && (
        <PostRideScreen
          onPublishRide={handlePublishRide}
          onToast={showToast}
        />
      )}

      {currentScreen === 'detail' && selectedRide && (
        <RideDetailScreen
          ride={selectedRide}
          profile={userProfile}
          onBack={() => setCurrentScreen('search')}
          onRequestSeat={handleRequestSeat}
          onMessageDriver={handleMessageDriverFromDetail}
          onCompleteRide={handleOpenCheckout}
          onShootArrival={handleShootArrival}
          onShootComing={handleShootComing}
          onTriggerArrivalModal={(data) => {
            setActiveArrivalData(data);
            setIsArrivalModalOpen(true);
          }}
          arrivalData={activeArrivalData}
        />
      )}

      {currentScreen === 'requests' && (
        <RequestsScreen
          requests={requests}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
          onBack={() => setCurrentScreen('home')}
          onDeleteRequest={handleDeleteRequest}
          onClearAllRequests={handleClearAllRequests}
          onShootArrival={(req) => {
            handleShootArrival({
              id: req.rideId || req.id,
              driver: 'You (Driver)',
              driverName: 'You (Driver)',
              vehicle: 'Honda City (White)',
              plateNumber: 'KHI-7890',
              from: req.pickup,
              pickupHotspot: req.pickup,
              price: req.farePerSeat || 300,
              otp: req.otp || '6192',
              name: req.name
            });
          }}
          onMessagePassenger={(req) => {
            let thread = chats.find(c => c.participantName === req.name);
            if (thread) {
              setSelectedThread(thread);
            }
            setCurrentScreen('messages');
          }}
        />
      )}

      {currentScreen === 'messages' && (
        <MessagesScreen
          threads={chats}
          activeThread={selectedThread}
          onSelectThread={(thread) => setSelectedThread(thread)}
          onSendMessage={handleSendMessage}
          onToast={showToast}
          onBack={() => setCurrentScreen('home')}
          onShootArrival={handleShootArrival}
          onTriggerArrivalModal={(data) => {
            setActiveArrivalData(data);
            setIsArrivalModalOpen(true);
          }}
          onDeleteChat={handleDeleteChat}
          onClearAllChats={handleClearAllChats}
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen
          profile={userProfile}
          isAdmin={isAdmin}
          onUpdateProfile={handleUpdateProfile}
          onOpenAddPaymentMethod={() => setIsPaymentModalOpen(true)}
          onLogout={handleLogout}
          onToast={showToast}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onClearAllData={handleClearAllData}
        />
      )}

      {currentScreen === 'admin' && (
        isAdmin ? (
          <AdminReviewScreen
            onBack={() => setCurrentScreen('profile')}
            onToast={showToast}
          />
        ) : (
          <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center font-bold text-2xl shadow-xl">
              🛡️
            </div>
            <h2 className="text-lg font-bold">Admin Privileges Required</h2>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Access to the Identity Verification Console requires verified server-side claims or designated administrator credentials.
            </p>
            <button
              type="button"
              onClick={() => setCurrentScreen('profile')}
              className="px-4 py-2 bg-blue-600 rounded-xl font-bold text-xs text-white hover:bg-blue-500 cursor-pointer transition shadow-md"
            >
              Return to Profile
            </button>
          </div>
        )
      )}

      {currentScreen === 'legal' && (
        <LegalScreen
          onBack={() => setCurrentScreen('profile')}
        />
      )}

      {/* Floating inDrive Counter Offer (1 Minute Live Popup) */}
      <InDriveFloatingOffer
        offer={activeFloatingOffer}
        onAccept={(accepted) => {
          showToast(`Accepted offer of ₨ ${accepted.offeredPrice} from ${accepted.senderName}!`);
          const pinCode = '8392';
          const newThread: ChatThread = {
            id: Date.now(),
            participantName: accepted.senderName,
            participantAvatar: accepted.senderAvatar,
            rating: accepted.rating,
            verified: true,
            from: accepted.from,
            to: accepted.to,
            route: `${accepted.from} ➔ ${accepted.to}`,
            vehicle: accepted.vehicle,
            plateNumber: accepted.plateNumber,
            pickupHotspot: accepted.pickupHotspot,
            fare: accepted.offeredPrice,
            startPin: pinCode,
            lastMessage: `📍 Live Route Map: ${accepted.pickupHotspot || accepted.from}`,
            timeAgo: 'Just now',
            unreadCount: 0,
            messages: [
              {
                id: 1,
                sender: 'system',
                text: `Counter Offer Accepted: ₨ ${accepted.offeredPrice} • Vehicle: ${accepted.vehicle} • PIN: ${pinCode}`,
                timestamp: 'Just now'
              },
              {
                id: 2,
                sender: 'driver',
                text: `Deal confirmed at ₨ ${accepted.offeredPrice}! Here is our live Karachi pickup spot on the map:`,
                timestamp: 'Just now'
              },
              {
                id: 3,
                sender: 'driver',
                text: `📍 Live Pickup Spot: ${accepted.pickupHotspot || accepted.from} (En route to ${accepted.to})`,
                timestamp: 'Just now',
                mapData: {
                  fromLocation: accepted.from,
                  toLocation: accepted.to,
                  pickupHotspot: accepted.pickupHotspot || accepted.from,
                  fare: accepted.offeredPrice,
                  pin: pinCode,
                  vehicle: `${accepted.vehicle} (${accepted.plateNumber || 'Verified'})`
                }
              },
              {
                id: 4,
                sender: 'user',
                text: `Offer accepted! I'll be waiting at ${accepted.pickupHotspot || accepted.from}.`,
                timestamp: 'Just now'
              }
            ]
          };
          setChats(prev => [newThread, ...prev.filter(c => c.participantName !== accepted.senderName)]);
          saveChatToDb(newThread).catch(console.error);
          setSelectedThread(newThread);
          setActiveFloatingOffer(null);
          setCurrentScreen('messages');
        }}
        onDecline={(declined) => {
          showToast(`Declined offer of ₨ ${declined.offeredPrice}.`);
          setActiveFloatingOffer(null);
        }}
      />

      {/* Hotspot Arrival Modal (3-Minute Countdown Policy Popup) */}
      <HotspotArrivalModal
        data={activeArrivalData}
        isOpen={isArrivalModalOpen}
        onClose={() => setIsArrivalModalOpen(false)}
        onAcknowledgeComing={handleRiderAcknowledgeComing}
        onConfirmBoarded={handleRiderConfirmBoarded}
        onOpenChat={(rideId) => {
          setIsArrivalModalOpen(false);
          if (activeArrivalData) {
            let thread = chats.find(c => c.participantName === activeArrivalData.driverName);
            if (thread) {
              setSelectedThread(thread);
            }
          }
          setCurrentScreen('messages');
        }}
      />

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onAddPaymentMethod={handleAddPaymentMethod}
        onToast={showToast}
      />

      <RideCheckoutModal
        ride={checkoutRide}
        isOpen={!!checkoutRide}
        paymentMethods={userProfile.paymentMethods}
        onClose={() => setCheckoutRide(null)}
        onCompletePayment={handleCompletePayment}
        onOpenAddPaymentMethod={() => setIsPaymentModalOpen(true)}
        onToast={showToast}
      />

      <WakeUpCallModal
        isOpen={isWakeUpModalOpen}
        minutesLeft={wakeUpMins}
        ride={wakeUpRide || rides[0] || null}
        onClose={() => setIsWakeUpModalOpen(false)}
        onConfirmReady={() => {
          showToast(wakeUpMins === 10 ? 'Marked: Ready to depart!' : 'Marked: Heading to hotspot!');
        }}
      />

      <BottomNav
        currentScreen={currentScreen}
        onNavigate={(screen) => {
          if (screen === 'messages') setSelectedThread(null);
          setCurrentScreen(screen);
        }}
        unreadChatsCount={unreadChatsCount}
      />
    </div>
  );
}
