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
      whileHover={{ y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`group relative rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between h-full shadow-[0_2px_12px_rgba(0,0,0,0.02)] ${style.card}`}
      id={`idea-card-${idea.id}`}
    >
      {/* Top Tag strip with subtle gradient indicator */}
      <div className="absolute top-0 right-0 flex z-10 select-none">
        <div className={`px-4 py-1.5 text-[9px] font-black tracking-widest rounded-bl-2xl select-none font-mono ${style.badge}`}>
          {style.badgeText}
        </div>
      </div>

      <div className="p-6 sm:p-8 flex-1 flex flex-col">
        {/* TOP Section: Left logo, Middle title, Right founder avatar */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 pr-12 select-none">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-3xl border-2 border-slate-100 dark:border-slate-700 select-none shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shrink-0 overflow-hidden">
              {idea.logo && (idea.logo.startsWith('data:image/') || idea.logo.startsWith('http')) ? (
                <img src={idea.logo} alt={idea.name} className="w-full h-full object-cover" />
              ) : (
                idea.logo
              )}
            </div>
            <div className="min-w-0">
              <h3 className={`font-display font-black text-xl tracking-tight leading-tight transition-colors truncate uppercase ${style.title}`} id={`card-title-${idea.id}`} dir="auto">
                {idea.name}
              </h3>
              <span className="inline-flex mt-2 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                {idea.category}
              </span>
            </div>
          </div>

          {/* Founder profile pill */}
          <div className="flex-shrink-0" title={`Founder: ${idea.founderName}`}>
            <div className="w-10 h-10 rounded-2xl border-2 border-white dark:border-slate-800 overflow-hidden shadow-xl select-none group-hover:border-blue-600 transition-all duration-300">
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
        <p className="text-slate-700 dark:text-slate-300 text-sm font-bold leading-relaxed mb-8 line-clamp-3 select-none multilingual-text" dir="auto">
          {idea.description}
        </p>

        {/* BOTTOM STATS SECTION */}
        <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-center" id={`card-stats-${idea.id}`}>
          <div className="flex flex-col justify-center bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
            <span className="block text-[8px] font-black font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Status Stage</span>
            <span className="inline-block text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-tight truncate">
              {idea.progressStage === 'JUST IDEA NOW' ? 'Just Idea' : idea.progressStage === 'IDEATION' ? 'Ideation' : idea.progressStage === 'MVP BUILDING' ? 'MVP' : idea.progressStage === 'PROTOTYPE' ? 'Prototype' : 'Scale'}
            </span>
          </div>

          <div className="flex flex-col justify-center bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
            <span className="block text-[8px] font-black font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Peer Upvotes</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLikeClick();
              }}
              className={`mx-auto flex items-center justify-center space-x-1.5 cursor-pointer text-xs font-black border-0 bg-transparent transition-all duration-150 hover:scale-110 active:scale-95 ${
                isLikedByUser ? 'text-red-600' : 'text-slate-500 hover:text-red-600'
              }`}
              id="like-card-btn-${idea.id}"
            >
              <Heart className={`h-4 w-4 shrink-0 ${isLikedByUser ? 'fill-current' : ''}`} />
              <span className={`text-[10px] font-black ${isLikedByUser ? 'text-red-600' : 'text-slate-800 dark:text-slate-200'}`}>{idea.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
