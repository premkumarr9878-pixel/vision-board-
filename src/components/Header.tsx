import React from 'react';
import { Search, Plus, User, Star, LogOut, LayoutDashboard, Compass, Lock, Sun, Moon } from 'lucide-react';
import { FounderProfile } from '../types';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAddIdeaClick: () => void;
  onDashboardClick: () => void;
  onExploreClick: () => void;
  onAuthClick: () => void;
  currentUser: FounderProfile | null;
  onLogout: () => void;
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
  currentUser,
  onLogout,
  currentView,
  theme,
  toggleTheme
}: HeaderProps) {
  return (
    <header className="w-full sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-slate-300 dark:border-slate-800 transition-all duration-300 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Brand Logo */}
        <div 
          onClick={onExploreClick} 
          className="flex items-center space-x-2.5 cursor-pointer select-none group"
          id="brand-logo-container"
        >
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-all shadow-md">
            <div className="w-4.5 h-4.5 bg-white rounded-sm rotate-45"></div>
          </div>
          <span 
            className="font-display font-black text-2xl tracking-tighter text-slate-950 dark:text-white"
            id="brand-name"
          >
            Vision<span className="text-blue-600">Board</span>
          </span>
        </div>

        {/* Center: Search Field */}
        <div className="hidden md:flex flex-1 max-w-md mx-8" id="search-input-container">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-950 dark:text-slate-400 font-black" />
            </div>
            <input
              id="header-search-bar"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search startup ideas...'
              className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-500 bg-white dark:bg-slate-900 text-slate-950 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-500 transition-all duration-200 outline-none font-bold shadow-sm"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3" id="header-actions">
          {/* View switcher */}
          <button
            id="toggle-view-btn"
            onClick={currentView === 'explore' ? onDashboardClick : onExploreClick}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-black text-slate-950 dark:text-slate-50 hover:bg-slate-50 dark:hover:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 transition-all select-none cursor-pointer shadow-md active:scale-95"
          >
            {currentView === 'explore' ? (
              <>
                <LayoutDashboard className="h-4 w-4 text-blue-600 font-black" />
                <span className="hidden sm:inline">Founder Hub</span>
                {!currentUser && (
                  <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                )}
              </>
            ) : (
              <>
                <Compass className="h-4 w-4 text-blue-600 font-black" />
                <span className="hidden sm:inline">Explore Ideas</span>
              </>
            )}
          </button>

          {/* Light / Dark Mode Toggle button option */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg transition-all cursor-pointer flex items-center justify-center shadow-sm shrink-0 select-none"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-700" />
            )}
          </button>

          {/* Add Idea Button */}
          <button
            id="add-idea-header-btn"
            onClick={onAddIdeaClick}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-black transition-all select-none cursor-pointer shrink-0 shadow-md shadow-blue-500/20"
          >
            <Plus className="h-4 w-4 font-black" />
            <span className="hidden sm:inline">Add Idea</span>
          </button>

          {/* Profile / Auth Button */}
          {currentUser ? (
            <div className="flex items-center space-x-2" id="header-user-menu">
              <div 
                onClick={onDashboardClick}
                className="w-9 h-9 rounded-full border-2 border-slate-300 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-blue-600 transition-all select-none shadow-sm"
                title="View Dashboard"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <button
                id="logout-btn"
                onClick={onLogout}
                className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors select-none"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              id="auth-trigger-btn"
              onClick={onAuthClick}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-black transition-all shadow-sm"
            >
              <User className="h-4 w-4" />
              <span className="hidden xs:inline">Login / Sign Up</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile search bar (only visible under md screen width) */}
      <div className="md:hidden px-4 pb-3 border-b border-slate-200 dark:border-slate-800 flex" id="mobile-search-container">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500 font-bold" />
          </div>
          <input
            id="mobile-search-bar"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search startup ideas..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm placeholder-slate-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all duration-200 outline-none font-medium"
          />
        </div>
      </div>
    </header>
  );
}
