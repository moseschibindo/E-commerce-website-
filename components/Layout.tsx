
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'shop' | 'chat' | 'profile' | 'admin';
  setActiveTab: (tab: 'shop' | 'chat' | 'profile' | 'admin') => void;
  user: User | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, user }) => {
  return (
    <div className="h-screen flex flex-col app-bg-gradient overflow-hidden">
      {/* Header */}
      <header className="flex-none z-[60] glass-effect border-b border-indigo-100/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div 
            className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform" 
            onClick={() => setActiveTab('shop')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">H</div>
            <span className="text-xl font-bold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-purple-700">HarMarket</span>
          </div>
          
          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
               <button 
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'admin' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  }`}
               >
                  Admin
               </button>
            )}
            {!user && (
              <button 
                onClick={() => setActiveTab('profile')}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-slate-200"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative no-scrollbar scroll-smooth antialiased overscroll-contain">
        <div className="max-w-7xl mx-auto w-full min-h-full flex flex-col">
          {children}
          <div className="h-28 flex-none" />
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-none glass-effect border-t border-indigo-100/50 px-6 py-2.5 z-[60] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <NavButton 
            active={activeTab === 'shop'} 
            onClick={() => setActiveTab('shop')} 
            label="Shop" 
            icon={<ShopIcon />} 
          />
          <NavButton 
            active={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')} 
            label="AI Chat" 
            icon={<ChatIcon />} 
          />
          <NavButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            label={user ? "Profile" : "Account"} 
            icon={<ProfileIcon />} 
          />
        </div>
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all duration-300 py-1.5 px-3 rounded-2xl ${
      active ? 'text-indigo-600' : 'text-slate-400'
    }`}
  >
    <div className={`p-2 rounded-xl transition-all duration-300 ${active ? 'bg-indigo-50 scale-110' : 'hover:bg-slate-100/50'}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${active ? 'opacity-100' : 'opacity-60'}`}>
      {label}
    </span>
  </button>
);

const ShopIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
);
const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
);
const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);

export default Layout;
