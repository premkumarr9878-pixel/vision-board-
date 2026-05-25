import React, { useState, useEffect } from 'react';
import { Search, Plus, User, LogOut, LayoutDashboard, Globe, Moon, Sun, Menu, X, Rocket } from 'lucide-react';
import { FounderProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddIdeaClick: () => void;
  onDashboardClick: () => void;
  onExploreClick: () => void;
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
          ? 'bg-slate-100/95 dark:bg-slate-800/95 text-blue-600 border-blue-600/30 shadow-md scale-[1.02]'
          : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white/95 dark:hover:bg-slate-900/95'
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
          ? 'py-1.5 bg-white/98 dark:bg-slate-950/98 backdrop-blur-md border-b-2 border-slate-200 dark:border-slate-800 shadow-sm' 
          : 'py-2 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          
          {/* LOGO */}
          <div 
            onClick={onExploreClick}
            className="flex items-center cursor-pointer group shrink-0 select-none relative"
          >
            <div className="flex items-center space-x-3 transition-all duration-500 ease-out group-hover:scale-[1.02] group-active:scale-95">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/10 border-2 border-white/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Rocket className="h-6 w-6 text-white transform rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-500" />
              </div>
              <div className="flex items-baseline tracking-tighter">
                <span className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">Vision</span>
                <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Board</span>
              </div>
              {/* Premium Glow Effect on Hover */}
              <div className="absolute -inset-2 bg-blue-600/0 group-hover:bg-blue-600/5 blur-2xl rounded-full transition-all duration-500 -z-10" />
            </div>
          </div>

          {/* SEARCH BAR (Desktop) - REMOVED AS REQUESTED IN PREVIOUS STEPS AND REDUNDANT NOW */}

          {/* NAVIGATION (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-3">
            <div className="flex items-center space-x-2.5 px-5 py-2.5 bg-blue-500/20 dark:bg-blue-400/20 text-blue-700 dark:text-blue-400 text-[13px] font-black font-mono uppercase tracking-widest rounded-2xl border-2 border-blue-500/40 shadow-md select-none group">
              <Rocket className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 fill-current animate-pulse group-hover:scale-110 transition-transform" />
              <span>Sandbox 2.0 Live</span>
            </div>
            <NavButton 
              onClick={onExploreClick} 
              active={currentView === 'explore'} 
              icon={Globe} 
              label="Explore" 
            />
            <NavButton 
              onClick={onDashboardClick} 
              active={currentView === 'dashboard'} 
              icon={LayoutDashboard} 
              label="Founder Hub" 
            />
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer border-2 border-slate-200 dark:border-slate-800 hover:border-blue-600/20 shadow-xs"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* User Profile / Auth */}
            <div className="hidden sm:block">
              {currentUser && (
                <div className="flex items-center space-x-3 pl-2">
                  <div className="text-right hidden xl:block select-none">
                    <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight" dir="auto">{currentUser.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Founder</p>
                  </div>
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProfileOpen(!isProfileOpen);
                      }}
                      className={`h-11 w-11 rounded-2xl border-2 overflow-hidden cursor-pointer transition-all shadow-sm ${
                        isProfileOpen ? 'border-blue-600 ring-4 ring-blue-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-blue-600'
                      }`}
                    >
                      <img src={currentUser.avatar} alt="Profile" className="h-full w-full object-cover" />
                    </button>
                    
                    {/* Dropdown menu */}
                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-[60]"
                        >
                          <div className="px-3 py-2 border-b-2 border-slate-100 dark:border-slate-900 mb-1 xl:hidden">
                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{currentUser.name}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Founder</p>
                          </div>
                          
                          <div className="px-3 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                            <span>{currentUser.email}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
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
                    onClick={onExploreClick} 
                    active={currentView === 'explore'} 
                    icon={Globe} 
                    label="Explore Ideas" 
                  />
                  <NavButton 
                    onClick={onDashboardClick} 
                    active={currentView === 'dashboard'} 
                    icon={LayoutDashboard} 
                    label="Founder Hub" 
                  />
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-6" />
                  <NavButton 
                    onClick={onAddIdeaClick} 
                    icon={Plus} 
                    label="Publish Idea" 
                  />
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  {currentUser ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 px-2">
                        <img src={currentUser.avatar} alt="Avatar" className="h-10 w-10 rounded-xl border-2 border-slate-100 dark:border-slate-800" />
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight" dir="auto">{currentUser.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Founder Session</p>
                        </div>
                      </div>
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
