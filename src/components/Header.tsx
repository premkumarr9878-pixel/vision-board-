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
      className={`flex items-center space-x-3 px-7 py-3.5 rounded-2xl text-[13px] font-black transition-all cursor-pointer border-2 ${
        active
          ? 'bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 border-blue-600/40 shadow-md scale-[1.02]'
          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-2 bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md' 
          : 'py-3 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm'
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
              <div className="flex items-center space-x-2.5 transition-all duration-300 group-hover:scale-[1.01] active:scale-95">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md border border-white/20">
                  <Rocket className="h-5 w-5 text-white transform rotate-45" />
                </div>
                <div className="flex items-baseline tracking-tight">
                  <span className="text-lg font-black text-slate-950 dark:text-white">Vision</span>
                  <span className="text-lg font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Board</span>
                </div>
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
            {/* RIGHT ACTIONS REMOVED BY USER REQUEST */}
            <div className="flex items-center">
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
