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
    <header className="w-full sticky top-0 z-40 bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl border-b border-slate-200/[0.45] dark:border-slate-800/[0.45] transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02),0_4px_6px_-2px_rgba(0,0,0,0.01)] dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Side: Brand Logo */}
        <div 
          onClick={onExploreClick} 
          className="flex items-center space-x-2.5 cursor-pointer select-none group"
          id="brand-logo-container"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/10">
            <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
          </div>
          <span 
            className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white"
            id="brand-name"
          >
            Vision<span className="text-blue-650">Board</span>
          </span>
        </div>

        {/* Center: Search Field */}
        <div className="hidden md:flex flex-1 max-w-md mx-8" id="search-input-container">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="header-search-bar"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search startup ideas...'
              className="w-full pl-9 pr-4 py-2 border border-slate-200/85 dark:border-slate-800/85 rounded-full text-sm placeholder-slate-400 bg-slate-50/50 dark:bg-slate-900/50 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-505 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200 hover:border-slate-300/80 dark:hover:border-slate-700/80 outline-none"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-3" id="header-actions">
          {/* View switcher */}
          <button
            id="toggle-view-btn"
            onClick={currentView === 'explore' ? onDashboardClick : onExploreClick}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-800 transition-all select-none cursor-pointer"
          >
            {currentView === 'explore' ? (
              <>
                <LayoutDashboard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Founder Hub</span>
                {!currentUser && (
                  <Lock className="h-3 w-3 text-amber-500 shrink-0" />
                )}
              </>
            ) : (
              <>
                <Compass className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Explore Ideas</span>
              </>
            )}
          </button>

          {/* Light / Dark Mode Toggle button option */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-405 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg transition-all cursor-pointer flex items-center justify-center shadow-2xs shrink-0 select-none"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 animate-[spin_8s_linear_infinite]" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
          </button>

          {/* Add Idea Button */}
          <button
            id="add-idea-header-btn"
            onClick={onAddIdeaClick}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-all select-none cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Idea</span>
          </button>

          {/* Profile / Auth Button */}
          {currentUser ? (
            <div className="flex items-center space-x-2" id="header-user-menu">
              <div 
                onClick={onDashboardClick}
                className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer hover:border-blue-500 transition-all select-none"
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
                className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-lg transition-colors select-none"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              id="auth-trigger-btn"
              onClick={onAuthClick}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg text-sm font-medium transition-all"
            >
              <User className="h-4 w-4 animate-pulse" />
              <span className="hidden xs:inline">Login / Sign Up</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile search bar (only visible under md screen width) */}
      <div className="md:hidden px-4 pb-3 border-b border-slate-200 dark:border-slate-850 flex" id="mobile-search-container">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            id="mobile-search-bar"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search startup ideas..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200/85 dark:border-slate-800/85 rounded-full text-sm placeholder-slate-400 bg-slate-50/50 dark:bg-slate-900/50 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-950 transition-all duration-200 outline-none"
          />
        </div>
      </div>
    </header>
  );
}
