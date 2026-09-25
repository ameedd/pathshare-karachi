import React from 'react';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';
import { ScreenId } from '../types';

interface BottomNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  unreadChatsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  unreadChatsCount = 1
}) => {
  if (currentScreen === 'login' || currentScreen === 'chat') {
    return null;
  }

  const navItems = [
    { id: 'home' as ScreenId, label: 'Home', icon: Home },
    { id: 'search' as ScreenId, label: 'Find Ride', icon: Search },
    { id: 'post' as ScreenId, label: 'Post', icon: PlusCircle, isHighlight: true },
    { id: 'messages' as ScreenId, label: 'Chats', icon: MessageCircle, badge: unreadChatsCount },
    { id: 'profile' as ScreenId, label: 'Profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-slate-200 backdrop-blur-md flex justify-around items-center h-16 z-50 shadow-lg max-w-md mx-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentScreen === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full text-xs relative transition-colors cursor-pointer ${
              isActive ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            {item.isHighlight ? (
              <div className="flex flex-col items-center">
                <PlusCircle className="w-6 h-6 mb-0.5 text-sky-500" />
                <span>{item.label}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-1.5 bg-sky-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {item.badge}
                  </span>
                ) : null}
                <span>{item.label}</span>
              </div>
            )}
            {isActive && (
              <span className="absolute bottom-0 w-8 h-1 bg-sky-600 rounded-t-full shadow-xs" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
