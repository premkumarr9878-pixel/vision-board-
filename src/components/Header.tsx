import React, { useState, useEffect } from 'react';
import { Search, Plus, User, LogOut, LayoutDashboard, Globe, Moon, Sun, Menu, X, Rocket } from 'lucide-react';
import { FounderProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddIdeaClick: () => void;
  onDashboardClick: () => void;
  onExploreClick: () => void;
  onAuthClick: () => void;
  onLogout: () => void;
  currentUser: FounderProfile | null;
  currentView: 'explore' | 'dashboard';
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  onAddIdeaClick,
  onDashboardClick,
  onExploreClick,
  onAuthClick,
  onLogout,
  currentUser,
  currentView,
  theme,
  toggleTheme
}: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClick = () => setIsProfileOpen(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isProfileOpen]);

  const NavButton = ({ 
    onClick, 
    active, 
    icon: Icon, 
    label
  }: { 
    onClick: () => void; 
    active?: boolean; 
    icon: any; 
    label: string;
  }) => (
    <button
      onClick={() => {
        onClick();
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 px-7 py-3 rounded-xl text-[13px] font-black transition-all cursor-pointer border ${
        active
          ? 'bg-[#020617] text-white border-[#020617] shadow-lg scale-[1.02]'
          : 'bg-white text-[#334155] hover:text-[#0F172A] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-2 bg-white/95 border-b border-[#E2E8F0] shadow-[0_4px_20px_-10px_rgba(15,23,42,0.05)] backdrop-blur-md' 
          : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* LOGO & THEME TOGGLE */}
          <div className="flex items-center space-x-4">
            <div 
              onClick={onExploreClick}
              className="flex items-center cursor-pointer group shrink-0 select-none"
            >
              <div className="flex items-center space-x-3 transition-all duration-300 group-hover:scale-[1.01] active:scale-95">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] via-[#4F46E5] to-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                  <Rocket className="h-5 w-5 text-white transform rotate-45" />
                </div>
                <span className="font-display font-black text-2xl tracking-tighter text-[#0F172A]">
                  Vision<span className="text-[#2563EB]">Board</span>
                </span>
              </div>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-blue-600/20"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onAddIdeaClick}
              className="hidden sm:flex items-center space-x-2 px-6 py-2.5 bg-[#020617] text-white rounded-xl text-[13px] font-black hover:bg-[#0F172A] transition-all shadow-lg active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Launch Idea</span>
            </button>

            {currentUser ? (
              <div className="relative">
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden z-50"
                    >
                      <div className="p-4 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <p className="text-xs font-black text-[#64748B] uppercase tracking-widest mb-1">Founder Profile</p>
                        <p className="font-bold text-[#0F172A] truncate">{currentUser.name}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={onDashboardClick}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold text-[#334155] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          <span>Founder Hub</span>
                        </button>
                        <button
                          onClick={onLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center space-x-2 px-6 py-2.5 bg-[#020617] text-white rounded-xl text-[13px] font-black hover:bg-[#0F172A] transition-all shadow-lg active:scale-95"
              >
                <User className="h-4 w-4" />
                <span>Founder Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/20 dark:bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[280px] bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 z-50 lg:hidden p-6 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-lg font-black font-display text-slate-950 dark:text-white">Menu</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900">
                    <X className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-3 flex-1">
                  <NavButton 
                    onClick={onAddIdeaClick} 
                    icon={Plus} 
                    label="Publish Idea" 
                  />
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  {currentUser ? (
                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          onLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-black rounded-xl transition-all"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onAuthClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-black rounded-xl shadow-lg"
                    >
                      Join the Network
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
