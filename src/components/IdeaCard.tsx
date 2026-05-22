import React from 'react';
import { Heart, MessageSquare, Users, CircleDollarSign, Compass, Star } from 'lucide-react';
import { StartupIdea } from '../types';
import { motion } from 'motion/react';

interface IdeaCardProps {
  key?: string;
  idea: StartupIdea;
  onCardClick: () => void;
  onLikeClick: () => void;
  isLikedByUser: boolean;
  rowStyle?: 'trending' | 'recent' | 'weekly';
}

export default function IdeaCard({
  idea,
  onCardClick,
  onLikeClick,
  isLikedByUser,
  rowStyle = 'recent'
}: IdeaCardProps) {
  
  // Custom styles matching Geometric Balance theme card layouts
  const getRowStyleClasses = () => {
    switch (rowStyle) {
      case 'trending':
        return {
          card: 'border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/75 hover:border-emerald-500/40 dark:hover:border-emerald-450/45 hover:shadow-[0_12px_30px_rgba(16,185,129,0.05)] dark:hover:shadow-[0_12px_30px_rgba(16,185,129,0.03)]',
          badge: 'bg-emerald-50/95 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-l border-b border-emerald-150/50 dark:border-emerald-900/30',
          badgeText: 'TRENDING',
          title: 'text-slate-900 dark:text-white group-hover:text-emerald-650 dark:group-hover:text-emerald-450'
        };
      case 'weekly':
        return {
          card: 'border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/75 hover:border-purple-500/40 dark:hover:border-purple-450/45 hover:shadow-[0_12px_30px_rgba(168,85,247,0.05)] dark:hover:shadow-[0_12px_30px_rgba(168,85,247,0.03)]',
          badge: 'bg-purple-50/95 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-l border-b border-purple-150/50 dark:border-purple-900/30',
          badgeText: 'WEEKLY BEST',
          title: 'text-slate-900 dark:text-white group-hover:text-purple-650 dark:group-hover:text-purple-450'
        };
      case 'recent':
      default:
        return {
          card: 'border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/75 hover:border-blue-500/40 dark:hover:border-blue-450/45 hover:shadow-[0_12px_30px_rgba(59,130,246,0.05)] dark:hover:shadow-[0_12px_30px_rgba(59,130,246,0.03)]',
          badge: 'bg-slate-100/90 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border-l border-b border-slate-200/50 dark:border-slate-700/30',
          badgeText: 'RECENTLY ADDED',
          title: 'text-slate-900 dark:text-white group-hover:text-blue-650 dark:group-hover:text-blue-450'
        };
    }
  };

  const style = getRowStyleClasses();

  return (
    <motion.div
      onClick={onCardClick}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      className={`group relative rounded-2xl border backdrop-blur-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between h-full shadow-[0_4px_16px_rgba(0,0,0,0.015)] ${style.card}`}
      id={`idea-card-${idea.id}`}
    >
      {/* Top Tag strip with subtle gradient indicator */}
      <div className="absolute top-0 right-0 flex z-10 select-none">
        <div className={`px-2.5 py-1 text-[9px] font-bold tracking-wider rounded-bl-xl select-none font-mono ${style.badge}`}>
          {style.badgeText}
        </div>
      </div>

      {/* TOP Section: Left logo, Middle title, Right founder avatar */}
      <div className="flex items-start justify-between mb-4 mt-1">
        <div className="flex items-center space-x-3.5 pr-14 select-none">
          <div className="w-10 h-10 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-center text-xl border border-slate-200/50 dark:border-slate-800 select-none shadow-2xs group-hover:scale-105 group-hover:border-blue-450/20 group-hover:bg-white dark:group-hover:bg-slate-800/90 transition-all duration-300 shrink-0 overflow-hidden">
            {idea.logo && (idea.logo.startsWith('data:image/') || idea.logo.startsWith('http')) ? (
              <img src={idea.logo} alt={idea.name} className="w-full h-full object-cover" />
            ) : (
              idea.logo
            )}
          </div>
          <div className="min-w-0">
            <h3 className={`font-display font-bold text-sm tracking-tight leading-tight transition-colors truncate ${style.title}`} id={`card-title-${idea.id}`}>
              {idea.name}
            </h3>
            <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-100/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/30">
              {idea.category}
            </span>
          </div>
        </div>

        {/* Founder profile pill */}
        <div className="flex-shrink-0 flex items-center" title={`Founder: ${idea.founderName}`}>
          <div className="w-6 h-6 rounded-full border border-white dark:border-slate-800 overflow-hidden shadow-xs select-none group-hover:ring-4 group-hover:ring-blue-500/15 dark:group-hover:ring-blue-400/10 group-hover:border-blue-500/70 transition-all duration-300">
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
      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-5 line-clamp-2 h-10 select-none">
        {idea.description}
      </p>

      {/* BOTTOM STATS SECTION: 2 columns matching the Geometric Balance design (Stage & Likes only) */}
      <div className="-mx-5 -mb-5 mt-auto bg-slate-50/60 dark:bg-slate-950/45 border-t border-slate-150/50 dark:border-slate-800/60 grid grid-cols-2 px-4 py-3 text-center" id={`card-stats-${idea.id}`}>
        <div className="flex flex-col justify-center">
          <span className="block text-[8px] sm:text-[9px] font-bold font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Stage</span>
          <span className="inline-block text-[10px] sm:text-xs font-bold mt-0.5 text-blue-600 dark:text-blue-400 uppercase tracking-tight truncate px-1 font-mono">
            {idea.progressStage === 'JUST IDEA NOW' ? 'Just Idea' : idea.progressStage === 'IDEATION' ? 'Ideation' : idea.progressStage === 'MVP BUILDING' ? 'MVP' : idea.progressStage === 'PROTOTYPE' ? 'Prototype' : 'Scale'}
          </span>
        </div>

        <div className="flex flex-col justify-center border-l border-slate-200/40 dark:border-slate-800/80">
          <span className="block text-[8px] sm:text-[9px] font-bold font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Likes</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLikeClick();
            }}
            className={`mx-auto flex items-center justify-center space-x-1.5 mt-0.5 cursor-pointer text-xs font-bold border-0 bg-transparent transition-all duration-150 hover:scale-110 active:scale-95 ${
              isLikedByUser ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
            }`}
            id={`like-card-btn-${idea.id}`}
          >
            <Heart className={`h-3.5 w-3.5 shrink-0 ${isLikedByUser ? 'fill-current' : ''}`} />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 group-hover:dark:text-white transition-colors">{idea.likes}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
