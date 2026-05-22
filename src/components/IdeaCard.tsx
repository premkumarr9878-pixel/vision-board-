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
          card: 'border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl',
          badge: 'bg-emerald-600 text-white border-l border-b border-emerald-700 shadow-sm',
          badgeText: 'TRENDING',
          title: 'text-slate-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
        };
      case 'weekly':
        return {
          card: 'border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl',
          badge: 'bg-purple-600 text-white border-l border-b border-purple-700 shadow-sm',
          badgeText: 'WEEKLY BEST',
          title: 'text-slate-950 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400'
        };
      case 'recent':
      default:
        return {
          card: 'border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-xl',
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
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`group relative rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between h-full shadow-sm ${style.card}`}
      id={`idea-card-${idea.id}`}
    >
      {/* Top Tag strip with subtle gradient indicator */}
      <div className="absolute top-0 right-0 flex z-10 select-none">
        <div className={`px-3 py-1 text-[10px] font-black tracking-widest rounded-bl-xl select-none font-mono ${style.badge}`}>
          {style.badgeText}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* TOP Section: Left logo, Middle title, Right founder avatar */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3.5 pr-14 select-none">
            <div className="w-13 h-13 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-2xl border-2 border-slate-200 dark:border-slate-700 select-none shadow-md group-hover:scale-105 transition-all duration-300 shrink-0 overflow-hidden">
              {idea.logo && (idea.logo.startsWith('data:image/') || idea.logo.startsWith('http')) ? (
                <img src={idea.logo} alt={idea.name} className="w-full h-full object-cover" />
              ) : (
                idea.logo
              )}
            </div>
            <div className="min-w-0">
              <h3 className={`font-display font-black text-lg tracking-tight leading-tight transition-colors truncate ${style.title}`} id={`card-title-${idea.id}`}>
                {idea.name}
              </h3>
              <span className="inline-flex mt-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                {idea.category}
              </span>
            </div>
          </div>

          {/* Founder profile pill */}
          <div className="flex-shrink-0 flex items-center" title={`Founder: ${idea.founderName}`}>
            <div className="w-9 h-9 rounded-full border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-md select-none group-hover:border-blue-600 transition-all duration-300">
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
        <p className="text-slate-950 dark:text-slate-100 text-[13.5px] font-bold leading-relaxed mb-6 line-clamp-3 select-none">
          {idea.description}
        </p>

        {/* BOTTOM STATS SECTION */}
        <div className="mt-auto pt-5 border-t-2 border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-center" id={`card-stats-${idea.id}`}>
          <div className="flex flex-col justify-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-900 shadow-sm">
            <span className="block text-[10px] font-black font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1.5">Stage</span>
            <span className="inline-block text-xs font-black text-blue-800 dark:text-blue-400 uppercase tracking-tight truncate font-mono">
              {idea.progressStage === 'JUST IDEA NOW' ? 'Just Idea' : idea.progressStage === 'IDEATION' ? 'Ideation' : idea.progressStage === 'MVP BUILDING' ? 'MVP' : idea.progressStage === 'PROTOTYPE' ? 'Prototype' : 'Scale'}
            </span>
          </div>

          <div className="flex flex-col justify-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-900 shadow-sm">
            <span className="block text-[10px] font-black font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-1.5">Likes</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLikeClick();
              }}
              className={`mx-auto flex items-center justify-center space-x-1.5 cursor-pointer text-xs font-black border-0 bg-transparent transition-all duration-150 hover:scale-110 active:scale-95 ${
                isLikedByUser ? 'text-red-600' : 'text-slate-600 hover:text-red-600'
              }`}
              id="like-card-btn-${idea.id}"
            >
              <Heart className={`h-4 w-4 shrink-0 ${isLikedByUser ? 'fill-current' : ''}`} />
              <span className="text-xs font-black text-slate-950 dark:text-white">{idea.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
