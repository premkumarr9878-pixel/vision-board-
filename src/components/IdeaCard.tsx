import React from 'react';
import { Heart, MessageSquare, Users, CircleDollarSign, Compass, Star, Lock, ShieldAlert, EyeOff, UserRoundSearch, Eye } from 'lucide-react';
import { StartupIdea } from '../types';
import { motion } from 'framer-motion';

// Custom Incognito Icon Component to match user request
const IncognitoIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10s10-4.477 10-10A10 10 0 0 0 12 2z" fill="currentColor" fillOpacity="0.05" />
    <path d="M2 12h20" />
    <path d="M6 12v-1a6 6 0 0 1 12 0v1" />
    <circle cx="9" cy="17" r="2.5" />
    <circle cx="15" cy="17" r="2.5" />
    <path d="M11.5 17h1" />
    <path d="M12 2 L12 8" strokeOpacity="0.2" />
    <path d="M3 10 L6 12" strokeOpacity="0.2" />
    <path d="M21 10 L18 12" strokeOpacity="0.2" />
  </svg>
);

interface IdeaCardProps {
  key?: string;
  idea: StartupIdea;
  onCardClick: () => void;
  onLikeClick: () => void;
  isLikedByUser: boolean;
  rowStyle?: 'trending' | 'recent' | 'weekly';
  isOwner?: boolean;
}

export default function IdeaCard({
  idea,
  onCardClick,
  onLikeClick,
  isLikedByUser,
  rowStyle = 'recent',
  isOwner = false
}: IdeaCardProps) {
  const isPrivate = idea.visibility === 'private';
  const isProtected = isPrivate && !isOwner;
  
  // Custom styles matching Geometric Balance theme card layouts
  const getRowStyleClasses = () => {
    switch (rowStyle) {
      case 'trending':
        return {
          card: 'border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_20px_40px_-12px_rgba(16,185,129,0.2)]',
          badge: 'bg-emerald-600 text-white border-l border-b border-emerald-700 shadow-sm',
          badgeText: 'TRENDING',
          title: 'text-slate-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
        };
      case 'weekly':
        return {
          card: 'border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500/50 dark:hover:border-purple-500/50 hover:shadow-[0_20px_40px_-12px_rgba(168,85,247,0.15)] dark:hover:shadow-[0_20px_40px_-12px_rgba(168,85,247,0.2)]',
          badge: 'bg-purple-600 text-white border-l border-b border-purple-700 shadow-sm',
          badgeText: 'WEEKLY BEST',
          title: 'text-slate-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400'
        };
      case 'recent':
      default:
        return {
          card: 'border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-600/50 dark:hover:border-blue-500/50 hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.15)] dark:hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.2)]',
          badge: 'bg-slate-900 text-white border-l border-b border-slate-950 shadow-sm',
          badgeText: 'RECENTLY ADDED',
          title: 'text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
        };
    }
  };

  const style = getRowStyleClasses();

  return (
    <motion.div
      onClick={onCardClick}
      whileHover={isProtected ? {} : { y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`group relative rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between h-full shadow-[0_2px_12px_rgba(0,0,0,0.02)] ${style.card} ${isProtected ? 'cursor-not-allowed grayscale-[0.3]' : 'cursor-pointer'}`}
      id={`idea-card-${idea.id}`}
    >
      {/* Private/Protected Overlay Effect */}
      {isProtected && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <div className="opacity-[0.1] dark:opacity-[0.15] scale-[3.8] rotate-[-8deg] transition-transform duration-700 group-hover:scale-[4.2] group-hover:rotate-[-4deg]">
            <IncognitoIcon className="w-24 h-24 text-slate-900 dark:text-white" />
          </div>
          <div className="absolute inset-0 bg-slate-50/20 dark:bg-slate-950/20 backdrop-blur-[2px]" />
          
          {/* Centered Protected Label */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 dark:bg-slate-900/95 border-2 border-amber-500/20 px-5 py-3 rounded-2xl shadow-2xl scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 backdrop-blur-md">
            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center space-x-2.5">
              <IncognitoIcon className="w-4 h-4 text-amber-500" />
              <span>Private Vision</span>
            </span>
          </div>
        </div>
      )}

      {/* Top Tag strip with subtle gradient indicator */}
      <div className="absolute top-0 right-0 flex z-30 select-none">
        {isPrivate && (
          <div className="px-3 py-1.5 text-[8px] font-black tracking-widest bg-amber-500 text-white border-l border-b border-amber-600 rounded-bl-xl flex items-center space-x-1.5 shadow-sm">
            <IncognitoIcon className="h-3 w-3" />
            <span>PRIVATE</span>
          </div>
        )}
        <div className={`px-4 py-1.5 text-[9px] font-black tracking-widest rounded-bl-2xl select-none font-mono ${style.badge}`}>
          {style.badgeText}
        </div>
      </div>

      <div className={`p-4 sm:p-6 flex-1 flex flex-col transition-all duration-300 ${isProtected ? 'opacity-40 grayscale-[0.6] blur-[0.5px]' : ''}`}>
        {/* TOP Section: Left logo, Middle title, Right founder avatar */}
        <div className="flex items-start justify-between mb-4 sm:mb-5">
          <div className="flex items-center space-x-3 pr-10 select-none min-w-0">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-xl sm:text-2xl border border-slate-100 dark:border-slate-700 select-none shadow-sm transition-all duration-500 shrink-0 overflow-hidden ${isProtected ? '' : 'group-hover:scale-105'}`}>
              {idea.logo && (idea.logo.startsWith('data:image/') || idea.logo.startsWith('http')) ? (
                <img src={idea.logo} alt={idea.name} className={`w-full h-full object-cover ${isProtected ? 'blur-md opacity-50' : ''}`} />
              ) : (
                <span className={isProtected ? 'blur-sm opacity-50' : ''}>{idea.logo}</span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className={`font-display font-black text-base sm:text-lg tracking-tight leading-tight transition-colors truncate uppercase ${style.title} ${isProtected ? 'blur-[1px]' : ''}`} id={`idea-card-title-${idea.id}`} dir="auto">
                {idea.name}
              </h3>
              <span className="inline-flex mt-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {idea.category}
              </span>
            </div>
          </div>

          {/* Founder profile pill */}
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border border-white dark:border-slate-800 overflow-hidden shadow-md select-none transition-all duration-300 ${isProtected ? 'opacity-50 grayscale' : 'group-hover:border-blue-600'}`}>
              <img 
                src={idea.founderAvatar} 
                alt={idea.founderName} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>

        {/* MIDDLE: Description Text */}
        <p className={`text-slate-600 dark:text-slate-400 text-[11px] sm:text-xs font-bold leading-relaxed mb-4 sm:mb-6 line-clamp-3 select-none multilingual-text transition-all duration-300 ${isProtected ? 'blur-sm opacity-40' : ''}`} dir="auto">
          {isProtected ? "This startup vision is currently set to private. The full pitch, business model, and problem statement are protected by the founder." : idea.description}
        </p>

        {/* BOTTOM STATS SECTION */}
        <div className={`mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 sm:gap-3 text-center transition-all duration-300 ${isProtected ? 'opacity-50 grayscale blur-[0.5px]' : ''}`} id={`card-stats-container-${idea.id}`}>
          <div className={`flex flex-col justify-center bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors ${isProtected ? '' : 'group-hover:bg-white dark:group-hover:bg-slate-800'}`}>
            <span className="block text-[7px] font-black font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5">Views</span>
            <div className="flex items-center justify-center space-x-1">
              <Eye className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <motion.span 
                key={idea.viewsCount}
                className="inline-block text-[9px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-tight truncate"
              >
                {(idea.viewsCount || 0).toLocaleString()}
              </motion.span>
            </div>
          </div>

          <div className={`flex flex-col justify-center bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors ${isProtected ? '' : 'group-hover:bg-white dark:group-hover:bg-slate-800'}`}>
            <span className="block text-[7px] font-black font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5">Upvotes</span>
            <button
              onClick={(e) => {
                if (isProtected) return;
                e.stopPropagation();
                onLikeClick();
              }}
              className={`mx-auto flex items-center justify-center space-x-1 text-[10px] font-black border-0 bg-transparent transition-all duration-150 ${
                isProtected ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'
              } ${
                isLikedByUser ? 'text-red-600' : 'text-slate-500 hover:text-red-600'
              }`}
            >
              <Heart className={`h-3 w-3 shrink-0 ${isLikedByUser ? 'fill-current' : ''}`} />
              <motion.span 
                key={idea.likes}
                 className={`text-[9px] font-black ${isLikedByUser ? 'text-red-600' : 'text-slate-800 dark:text-slate-200'}`}
               >
                 {(idea.likes || 0).toLocaleString()}
               </motion.span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
