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
  onAuthClick: () => void;
  onLogout: () => void;
  currentUser: FounderProfile | null;
  currentView: 'explore' | 'dashboard' | 'onboarding';
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
    label,
    primary = false 
  }: { 
    onClick: () => void; 
    active?: boolean; 
    icon: any; 
    label: string;
    primary?: boolean;
  }) => (
    <button
      onClick={() => {
        onClick();
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
        primary
          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 active:scale-95'
          : active
            ? 'bg-slate-100 dark:bg-slate-800 text-blue-600'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900'
      }`}
    >
      <Icon className={`h-4 w-4 ${primary ? 'animate-pulse' : ''}`} />
      <span>{label}</span>
    </button>
  );

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          
          {/* LOGO */}
          <div 
            onClick={onExploreClick}
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0 select-none"
          >
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black font-display text-slate-950 dark:text-white tracking-tighter hidden sm:block">
              Vision<span className="text-blue-600">Board</span>
            </span>
          </div>

          {/* SEARCH BAR (Desktop) */}
          {currentView === 'explore' && (
            <div className="hidden md:flex flex-1 max-w-md relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search ideas, founders, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-50 border-2 border-transparent focus:border-blue-600/20 dark:focus:border-blue-400/20 focus:bg-white dark:focus:bg-white rounded-2xl text-xs font-bold transition-all outline-none dark:text-black placeholder-slate-400"
              />
            </div>
          )}

          {/* NAVIGATION (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-2">
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
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2" />
            <NavButton 
              onClick={onAddIdeaClick} 
              primary 
              icon={Plus} 
              label="Add Idea" 
            />
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer border border-transparent hover:border-blue-600/10"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* User Profile / Auth */}
            <div className="hidden sm:block">
              {currentUser ? (
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
                      className={`h-10 w-10 rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${
                        isProfileOpen ? 'border-blue-600 ring-4 ring-blue-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-blue-600'
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
                          className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-[60]"
                        >
                          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-900 mb-1 xl:hidden">
                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{currentUser.name}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Founder</p>
                          </div>
                          
                          <button 
                            onClick={() => {
                              onLogout();
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center space-x-2 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all cursor-pointer group"
                          >
                            <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Sign Out Session</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="px-6 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-black rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-lg shadow-slate-900/10"
                >
                  Join VisionBoard
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
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

                <div className="space-y-2 flex-1">
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
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />
                  <NavButton 
                    onClick={onAddIdeaClick} 
                    primary 
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
