import React from 'react';
import { Heart, MessageSquare, Users, CircleDollarSign, Compass, Star, Lock, ShieldAlert, EyeOff, UserRoundSearch, Eye } from 'lucide-react';
import { StartupIdea } from '../types';
import { motion } from 'framer-motion';

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
  // Custom styles matching Geometric Balance theme card layouts
  const getRowStyleClasses = () => {
    const commonStyles = {
      card: 'bg-white border border-[#E2E8F0] shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition-all duration-250 ease-in-out',
      title: 'text-[#0F172A] font-display font-black tracking-tight group-hover:text-[#2563EB] transition-colors'
    };

    switch (rowStyle) {
      case 'trending':
        return {
          ...commonStyles,
          badge: 'premium-gradient text-white shadow-sm',
          badgeText: 'TRENDING',
          card: `${commonStyles.card} hover:shadow-[0_20px_45px_rgba(16,185,129,0.12)] hover:border-emerald-200/50`
        };
      case 'weekly':
        return {
          ...commonStyles,
          badge: 'premium-gradient text-white shadow-sm',
          badgeText: 'WEEKLY BEST',
          card: `${commonStyles.card} hover:shadow-[0_20px_45px_rgba(168,85,247,0.12)] hover:border-purple-200/50`
        };
      case 'recent':
      default:
        return {
          ...commonStyles,
          badge: 'bg-[#020617] text-white shadow-sm',
          badgeText: 'RECENTLY ADDED',
          card: `${commonStyles.card} hover:shadow-[0_20px_45px_rgba(70,90,255,0.15)] hover:border-[#2563EB]/20`
        };
    }
  };

  const style = getRowStyleClasses();

  return (
    <motion.div
      onClick={onCardClick}
      whileHover={{ y: -4 }}
      className={`group relative rounded-[1.5rem] overflow-hidden flex flex-col justify-between h-full ${style.card} cursor-pointer`}
      id={`idea-card-${idea.id}`}
    >
      {/* Top Tag strip with subtle gradient indicator */}
      <div className="absolute top-0 right-0 flex z-30 select-none">
        <div className={`px-3 py-1 text-[8px] font-black tracking-widest rounded-bl-xl select-none font-mono ${style.badge}`}>
          {style.badgeText}
        </div>
      </div>

      <div className={`p-4 sm:p-5 flex-1 flex flex-col`}>
        {/* TOP Section: Left logo, Middle title, Right founder avatar */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 pr-10 select-none min-w-0">
            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white flex items-center justify-center text-lg sm:text-xl border border-slate-100 select-none shadow-sm transition-all duration-300 shrink-0 overflow-hidden group-hover:scale-105`}>
              {idea.logo && (idea.logo.startsWith('data:image/') || idea.logo.startsWith('http')) ? (
                <img src={idea.logo} alt={idea.name} className={`w-full h-full object-cover`} />
              ) : (
                <span>{idea.logo}</span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className={`font-display font-black text-sm sm:text-base tracking-tight leading-tight transition-colors truncate uppercase ${style.title}`} id={`idea-card-title-${idea.id}`} dir="auto">
                {idea.name}
              </h3>
              <span className="inline-flex mt-0.5 px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                {idea.category}
              </span>
            </div>
          </div>

          {/* Founder profile pill */}
          <div className="flex-shrink-0 flex flex-col items-end space-y-1">
            <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-1.5 py-0.5 rounded-md">Recently Added</div>
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white overflow-hidden shadow-lg select-none transition-all duration-300 group-hover:scale-110`}>
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
        <p className={`text-[#334155] text-[11px] sm:text-xs font-medium leading-relaxed mb-4 line-clamp-2 select-none transition-all duration-300`} dir="auto">
          {idea.description}
        </p>

        {/* BOTTOM STATS SECTION */}
        <div className={`mt-auto pt-3 border-t border-slate-50 grid grid-cols-2 gap-3 text-center`} id={`card-stats-container-${idea.id}`}>
          <div className={`flex flex-col items-center justify-center bg-white p-2 sm:p-2.5 rounded-[14px] border border-slate-100 shadow-sm transition-all hover:shadow-md hover:bg-slate-50/50 group/stat`}>
            <div className="flex items-center space-x-1.5 mb-1">
              <Eye className="h-3.5 w-3.5 text-[#2563EB]" />
              <motion.span 
                key={idea.viewsCount}
                className="text-[12px] sm:text-[14px] font-black text-[#0F172A] tracking-tight"
              >
                {(idea.viewsCount || 0).toLocaleString()}
              </motion.span>
            </div>
            <span className="block text-[7px] sm:text-[8px] font-black font-mono uppercase tracking-[0.15em] text-[#94A3B8]">Views</span>
          </div>

          <div className={`flex flex-col items-center justify-center bg-white p-2 sm:p-2.5 rounded-[14px] border border-slate-100 shadow-sm transition-all hover:shadow-md hover:bg-slate-50/50 group/stat`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLikeClick();
              }}
              className={`flex items-center space-x-1.5 mb-1 border-0 bg-transparent transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95`}
            >
              <Heart className={`h-3.5 w-3.5 shrink-0 ${isLikedByUser ? 'text-[#7C3AED] fill-current' : 'text-[#64748B]'}`} />
              <motion.span 
                key={idea.likes}
                 className={`text-[12px] sm:text-[14px] font-black ${isLikedByUser ? 'text-[#7C3AED]' : 'text-[#0F172A]'}`}
               >
                 {(idea.likes || 0).toLocaleString()}
               </motion.span>
            </button>
            <span className="block text-[7px] sm:text-[8px] font-black font-mono uppercase tracking-[0.15em] text-[#94A3B8]">Upvotes</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
