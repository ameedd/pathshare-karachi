import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Video, ShieldAlert, Send, Paperclip, MapPin, Navigation, Compass, CheckCircle2, Key, Car, Bike, Sparkles, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import { ChatThread, ChatMessage } from '../types';
import { MapView } from '../components/MapView';

interface MessagesScreenProps {
  threads: ChatThread[];
  activeThread: ChatThread | null;
  onSelectThread: (thread: ChatThread | null) => void;
  onSendMessage: (threadId: number, text: string) => void;
  onToast: (msg: string) => void;
  onBack: () => void;
  onShootArrival?: (rideOrThread: any) => void;
  onTriggerArrivalModal?: (data: any) => void;
  onDeleteChat?: (chatId: number) => void;
  onClearAllChats?: () => void;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({
  threads,
  activeThread,
  onSelectThread,
  onSendMessage,
  onToast,
  onBack,
  onShootArrival,
  onTriggerArrivalModal,
  onDeleteChat,
  onClearAllChats
}) => {
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const handleSend = (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || !activeThread) return;
    onSendMessage(activeThread.id, textToSend);
    setInputText('');
    setShowAttachMenu(false);
  };

  const handleShareLocation = () => {
    if (!activeThread) return;
    const hotspot = activeThread.pickupHotspot || activeThread.from || 'Hassan Square, Gulshan-e-Iqbal, Karachi';
    const dest = activeThread.to || 'DHA Phase 6, Karachi';
    const locationMsg = `📍 Live Pickup Spot: ${hotspot} (En route to ${dest})`;
    onSendMessage(activeThread.id, locationMsg);
    onToast('Shared live Karachi pickup spot map in chat!');
    setShowAttachMenu(false);
  };

  const handleShootDriverArrival = () => {
    if (!activeThread) return;
    const hotspot = activeThread.pickupHotspot || activeThread.from || 'Pickup Hotspot Gate';
    const arrivalMsg = `🚨 DRIVER HAS ARRIVED AT HOTSPOT: ${hotspot}\n⏰ 3-Minute Departure Countdown Active!\nPlease reach and board vehicle (${activeThread.plateNumber || 'KHI-7890'}) within 3 minutes.`;
    onSendMessage(activeThread.id, arrivalMsg);
    onToast('Shot "I Have Arrived" alert to passenger with 3-min timer!');
    if (onShootArrival) {
      onShootArrival({
        id: activeThread.id,
        driver: activeThread.participantName,
        avatar: activeThread.participantAvatar,
        rating: activeThread.rating,
        vehicle: activeThread.vehicle || 'Honda City',
        plateNumber: activeThread.plateNumber || 'KHI-7890',
        from: activeThread.from || 'Karachi',
        to: activeThread.to || 'Destination',
        pickupHotspot: hotspot,
        price: activeThread.fare || 250,
        startPin: activeThread.startPin || '4892'
      });
    }
  };

  const handleShootDriverComing = () => {
    if (!activeThread) return;
    const hotspot = activeThread.pickupHotspot || activeThread.from || 'Pickup Hotspot';
    const comingMsg = `🚗 I AM COMING: En route to hotspot (${hotspot})! Estimated arrival in 2-3 minutes. Please get ready!`;
    onSendMessage(activeThread.id, comingMsg);
    onToast('Broadcasted "I Am Coming" status to passenger!');
  };

  const openWhatsApp = () => {
    const phoneNumber = '923001234567';
    const msgText = encodeURIComponent(
      `Hi ${activeThread?.participantName || 'commuter'}, I am contacting you regarding our PathShare commute route (${activeThread?.from || 'Pickup'} ➔ ${activeThread?.to || 'Destination'}). Are you ready for pickup?`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${msgText}`, '_blank');
    onToast('Opening direct WhatsApp link with pre-filled message!');
  };

  const startVideoCall = () => {
    onToast('Starting in-app WebRTC video call simulator…');
  };

  const triggerSOS = () => {
    onToast('SOS Emergency: Sharing live location with emergency contacts via WhatsApp!');
  };

  // Helper to detect if a chat message is a Location/Map message
  const isLocationMessage = (msg: ChatMessage) => {
    return (
      !!msg.mapData ||
      msg.text.includes('📍') ||
      msg.text.toLowerCase().includes('pickup spot') ||
      msg.text.toLowerCase().includes('route map') ||
      msg.text.toLowerCase().includes('live pickup')
    );
  };

  // Helper to detect if message is an Arrival alert
  const isArrivalMessage = (msg: ChatMessage) => {
    const txt = msg.text.toLowerCase();
    return txt.includes('driver has arrived') || txt.includes('i have arrived') || txt.includes('3-minute departure countdown');
  };

  // Quick reply options for commuter and driver coordination
  const quickReplies = [
    { label: '🎯 I Have Arrived (3-Min)', action: handleShootDriverArrival },
    { label: '🚗 I Am Coming', action: handleShootDriverComing },
    { label: '🚶 On My Way', text: "I'm heading out to the pickup hotspot right now! 🚶" },
    { label: '📍 Share Pickup Spot', action: handleShareLocation },
    { label: '⏱️ 5 Mins Away', text: 'Arriving at the pickup spot in 5 minutes! ⏱️' },
    { label: '✅ Boarded Vehicle', text: "I have boarded the car. Ready for departure! 👍" }
  ];

  // If inside an active thread
  if (activeThread) {
    const vehicleInfo = activeThread.vehicle || (activeThread.plateNumber ? `Vehicle (${activeThread.plateNumber})` : null);

    return (
      <div className="flex flex-col h-screen bg-slate-50 text-slate-800 max-w-md mx-auto relative antialiased">
        {/* Chat Thread Header */}
        <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b border-slate-800 p-3 flex items-center gap-3 sticky top-0 z-20 shadow-xl text-white">
          <button onClick={() => onSelectThread(null)} className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full transition cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 border border-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md">
            {activeThread.participantAvatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-white truncate flex items-center gap-1">
              {activeThread.participantName}
              {activeThread.verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-300 inline shrink-0" />}
            </p>
            <p className="text-[11px] text-slate-300 truncate font-medium">
              {vehicleInfo ? `${vehicleInfo} • ` : ''}
              <span className="text-slate-200 font-semibold">{activeThread.rating} ★ Verified</span>
            </p>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={openWhatsApp}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-slate-200 transition shadow-xs cursor-pointer"
              title="Open WhatsApp Chat"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={startVideoCall}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-slate-200 transition shadow-xs cursor-pointer"
              title="Video Call"
            >
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={triggerSOS}
              className="p-2 bg-rose-900/80 hover:bg-rose-800 border border-rose-700 rounded-full text-rose-200 transition shadow-xs cursor-pointer"
              title="SOS Emergency"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Route / Trip Bar Banner if route is known */}
        {(activeThread.from || activeThread.to) && (
          <div className="bg-slate-900 text-white px-3.5 py-1.5 flex items-center justify-between text-[11px] border-b border-slate-800 shadow-xs">
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-bold text-slate-300">Route:</span>
              <span className="truncate text-slate-200">{activeThread.from || 'Karachi'} ➔ {activeThread.to || 'Destination'}</span>
            </div>
            {activeThread.startPin && (
              <span className="bg-slate-800 text-slate-200 border border-slate-700 px-2 py-0.5 rounded font-mono font-bold shrink-0">
                PIN: {activeThread.startPin}
              </span>
            )}
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pb-32">
          {activeThread.messages.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-200 border border-slate-300 text-slate-800 flex items-center justify-center mx-auto text-2xl font-bold">
                {activeThread.participantAvatar}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Chat with {activeThread.participantName}</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Coordinate your live Karachi pickup spot, timings, and verify ride credentials safely.
                </p>
              </div>
              <button
                onClick={handleShareLocation}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer border border-blue-900"
              >
                <MapPin className="w-4 h-4" /> Share Live Karachi Pickup Spot
              </button>
            </div>
          ) : (
            activeThread.messages.map((msg) => {
              if (msg.sender === 'system') {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="text-[11px] bg-slate-100 text-slate-800 border border-slate-200 px-3.5 py-1 rounded-full font-bold shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-slate-700 shrink-0" />
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isUser = msg.sender === 'user';
              const isLoc = isLocationMessage(msg);
              const isArr = isArrivalMessage(msg);

              // Extract coordinates/locations for map
              const fromLoc = msg.mapData?.fromLocation || activeThread.pickupHotspot || activeThread.from || 'Hassan Square, Gulshan-e-Iqbal, Karachi';
              const toLoc = msg.mapData?.toLocation || activeThread.to || 'DHA Phase 6, Karachi';
              const hotspotName = msg.mapData?.pickupHotspot || activeThread.pickupHotspot || fromLoc;
              const fareRate = msg.mapData?.fare || activeThread.fare;
              const pinCode = msg.mapData?.pin || activeThread.startPin;
              const vehicleDetail = msg.mapData?.vehicle || activeThread.vehicle;

              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-xs ${
                      isArr
                        ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white font-medium border-2 border-slate-800'
                        : isUser
                        ? 'bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white rounded-tr-xs font-medium border border-blue-900'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs font-medium'
                    }`}
                  >
                    {isArr && (
                      <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-white/20">
                        <Car className="w-4 h-4 text-slate-300 animate-bounce" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                          Hotspot Arrival Alert (3-Min Policy)
                        </span>
                      </div>
                    )}

                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                    {/* Interactive Hotspot Arrival Card */}
                    {isArr && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900 text-white space-y-2 border border-slate-700">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-slate-200 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-300" /> 3:00 Countdown Active
                          </span>
                          <span className="bg-slate-800 text-white text-[10px] font-black px-2 py-0.5 rounded-md border border-slate-600">
                            Board Fast!
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              handleSend("🚶 I'm heading out to the hotspot right now! Please wait 1 minute.");
                              onToast("Notified driver you are on the way!");
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1 shadow-xs transition cursor-pointer border border-slate-700"
                          >
                            <span>I'm Coming Now 🚶</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (onTriggerArrivalModal) {
                                onTriggerArrivalModal({
                                  rideId: activeThread.id,
                                  driverName: activeThread.participantName,
                                  driverAvatar: activeThread.participantAvatar,
                                  driverRating: activeThread.rating,
                                  vehicle: activeThread.vehicle || 'Honda City',
                                  plateNumber: activeThread.plateNumber || 'KHI-7890',
                                  pickupHotspot: hotspotName,
                                  price: activeThread.fare || 250,
                                  startPin: activeThread.startPin || '4892'
                                });
                              }
                            }}
                            className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white font-bold py-1.5 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1 shadow-xs transition cursor-pointer border border-blue-900"
                          >
                            <span>View 3-Min Popup ⏰</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* If message is a shared location or ride route, render embedded Leaflet Map Card */}
                    {isLoc && !isArr && (
                      <div className="mt-2.5 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                        <MapView
                          fromLocation={fromLoc}
                          toLocation={toLoc}
                          height="h-[150px]"
                          showControls={false}
                        />
                        <div className="p-2.5 bg-white text-slate-800 space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 flex items-center gap-1 truncate">
                              <MapPin className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                              <span className="truncate">{hotspotName}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => onToast(`Navigating to ${hotspotName} via Google Maps…`)}
                              className="bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white font-bold px-2 py-0.5 rounded text-[10px] shrink-0 cursor-pointer border border-blue-900"
                            >
                              Directions 🗺️
                            </button>
                          </div>

                          {(vehicleDetail || fareRate || pinCode) && (
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 flex-wrap text-[10px] text-slate-600">
                              {vehicleDetail && (
                                <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-medium">
                                  🚗 {vehicleDetail}
                                </span>
                              )}
                              {fareRate && (
                                <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-bold">
                                  ₨ {fareRate} / seat
                                </span>
                              )}
                              {pinCode && (
                                <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-800 font-mono font-bold">
                                  🔑 PIN: {pinCode}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <span className={`text-[9px] block text-right mt-1.5 ${isUser ? 'text-slate-300' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Quick Reply Pills */}
        <div className="absolute bottom-16 left-0 right-0 px-3 py-1.5 bg-white/95 backdrop-blur-md border-t border-slate-200 flex gap-1.5 overflow-x-auto no-scrollbar z-10">
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (qr.action) qr.action();
                else if (qr.text) handleSend(qr.text);
              }}
              className="text-[11px] font-bold bg-slate-100 text-slate-700 hover:text-white hover:bg-slate-900 border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap shadow-xs transition shrink-0 cursor-pointer"
            >
              {qr.label}
            </button>
          ))}
        </div>

        {/* Attachment Options Menu */}
        {showAttachMenu && (
          <div className="absolute bottom-28 left-4 right-4 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-150 z-20">
            <button
              onClick={handleShareLocation}
              className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white rounded-xl px-3 py-2 text-xs font-bold transition shadow-xs cursor-pointer border border-blue-900"
            >
              <MapPin className="w-4 h-4 text-white" />
              <span>📍 Share Live Pickup Spot</span>
            </button>
            <button
              onClick={() => {
                onToast('Sending CNIC / Student Card verification snapshot in chat…');
                setShowAttachMenu(false);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold transition cursor-pointer"
            >
              <span>📄 Verification Doc</span>
            </button>
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="bg-white border-t border-slate-200 p-3 flex gap-2 items-center absolute bottom-0 left-0 right-0 z-20">
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`p-2 rounded-full transition cursor-pointer ${showAttachMenu ? 'bg-slate-200 text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
            title="Attach Location or File"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 bg-slate-100 text-slate-900 rounded-full px-4 py-2.5 text-xs sm:text-sm outline-none border border-slate-300 focus:border-slate-800 font-medium placeholder-slate-400"
          />
          <button
            onClick={() => handleSend()}
            className="p-2.5 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 hover:from-blue-600 hover:to-slate-900 text-white rounded-full transition shadow-xs cursor-pointer border border-blue-900"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Otherwise, render list of chat threads
  return (
    <div className="pb-24 bg-slate-50 min-h-screen text-slate-800 antialiased">
      <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 border-b border-slate-800 p-4 sticky top-0 z-20 shadow-xl flex items-center justify-between text-white">
        <div>
          <h2 className="text-lg font-bold text-white">Messages</h2>
          <p className="text-xs text-slate-300 font-medium">Coordinate pickup points with your carpool partners</p>
        </div>
        <div className="flex items-center gap-2">
          {threads.length > 0 && onClearAllChats && (
            <button
              onClick={onClearAllChats}
              className="text-xs text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-900/80 px-2.5 py-1 rounded-lg border border-rose-800 cursor-pointer transition flex items-center gap-1 shrink-0"
              title="Clear all chats"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
          <button
            onClick={onBack}
            className="text-xs text-white font-bold bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 px-2.5 py-1 rounded-lg border border-blue-600 hover:from-blue-600 hover:to-slate-900 cursor-pointer transition shadow-xs"
          >
            Home ➔
          </button>
        </div>
      </header>

      <div className="divide-y divide-slate-100 max-w-md mx-auto bg-white border-b border-slate-200 shadow-xs">
        {threads.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-sm">No Active Conversations</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              When you book a ride or accept a passenger request, chats will appear here.
            </p>
          </div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => onSelectThread(thread)}
              className="p-4 flex gap-3 items-center cursor-pointer hover:bg-slate-50 transition"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 border border-blue-700 flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-xs">
                {thread.participantAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-slate-900 text-sm truncate flex items-center gap-1">
                    {thread.participantName}
                    {thread.verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 inline shrink-0" />}
                  </p>
                  <p className="text-[10px] text-slate-400 shrink-0 font-medium">{thread.timeAgo}</p>
                </div>
                <p className="text-xs text-slate-600 truncate mt-0.5 font-medium flex items-center gap-1">
                  {thread.lastMessage.includes('📍') && <MapPin className="w-3 h-3 text-slate-800 shrink-0" />}
                  <span className="truncate">{thread.lastMessage}</span>
                </p>
                {(thread.from || thread.to) && (
                  <p className="text-[10px] text-slate-700 font-semibold truncate mt-1">
                    🛣️ {thread.from} ➔ {thread.to}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {thread.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-gradient-to-r from-blue-700 via-blue-800 to-slate-950 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                    {thread.unreadCount}
                  </span>
                )}
                {onDeleteChat && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(thread.id);
                    }}
                    className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
