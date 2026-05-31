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
      whileHover={{ y: -6 }}
      className={`group relative rounded-[2.5rem] overflow-hidden flex flex-col justify-between h-full ${style.card} cursor-pointer`}
      id={`idea-card-${idea.id}`}
    >
      {/* Top Tag strip with subtle gradient indicator */}
      <div className="absolute top-0 right-0 flex z-30 select-none">
        <div className={`px-5 py-2 text-[10px] font-black tracking-widest rounded-bl-3xl select-none font-mono ${style.badge}`}>
          {style.badgeText}
        </div>
      </div>

      <div className={`p-6 sm:p-8 flex-1 flex flex-col`}>
        {/* TOP Section: Left logo, Middle title, Right founder avatar */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4 pr-10 select-none min-w-0">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F8FAFC] flex items-center justify-center text-2xl border border-[#E2E8F0] select-none shadow-sm transition-all duration-300 shrink-0 overflow-hidden group-hover:scale-105`}>
              {idea.logo && (idea.logo.startsWith('data:image/') || idea.logo.startsWith('http')) ? (
                <img src={idea.logo} alt={idea.name} className={`w-full h-full object-cover`} />
              ) : (
                <span>{idea.logo}</span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className={`font-display font-black text-lg sm:text-xl tracking-tight leading-tight transition-colors truncate uppercase ${style.title}`} id={`idea-card-title-${idea.id}`} dir="auto">
                {idea.name}
              </h3>
              <span className="inline-flex mt-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-[#F8FAFC] text-[#64748B] border border-[#CBD5E1]">
                {idea.category}
              </span>
            </div>
          </div>

          {/* Founder profile pill */}
          <div className="flex-shrink-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border-2 border-white overflow-hidden shadow-lg select-none transition-all duration-300 group-hover:scale-110`}>
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
        <p className={`text-[#334155] text-xs sm:text-[13px] font-medium leading-relaxed mb-8 line-clamp-3 select-none transition-all duration-300`} dir="auto">
          {idea.description}
        </p>

        {/* BOTTOM STATS SECTION */}
        <div className={`mt-auto pt-6 border-t border-[#F1F5F9] grid grid-cols-2 gap-4 text-center`} id={`card-stats-container-${idea.id}`}>
          <div className={`flex flex-col justify-center bg-[#F8FAFC]/50 p-3 rounded-2xl border border-[#E2E8F0] transition-colors group-hover:bg-white`}>
            <span className="block text-[8px] font-black font-mono uppercase tracking-widest text-[#64748B] mb-1">Views</span>
            <div className="flex items-center justify-center space-x-1.5">
              <Eye className="h-3.5 w-3.5 text-[#2563EB]" />
              <motion.span 
                key={idea.viewsCount}
                className="inline-block text-[11px] font-black text-[#0F172A] uppercase tracking-tight"
              >
                {(idea.viewsCount || 0).toLocaleString()}
              </motion.span>
            </div>
          </div>

          <div className={`flex flex-col justify-center bg-[#F8FAFC]/50 p-3 rounded-2xl border border-[#E2E8F0] transition-colors group-hover:bg-white`}>
            <span className="block text-[8px] font-black font-mono uppercase tracking-widest text-[#64748B] mb-1">Upvotes</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLikeClick();
              }}
              className={`mx-auto flex items-center justify-center space-x-1.5 text-[11px] font-black border-0 bg-transparent transition-all duration-150 cursor-pointer hover:scale-105 active:scale-95 ${
                isLikedByUser ? 'text-[#7C3AED]' : 'text-[#64748B] hover:text-[#7C3AED]'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 shrink-0 ${isLikedByUser ? 'fill-current' : ''}`} />
              <motion.span 
                key={idea.likes}
                 className={`text-[11px] font-black ${isLikedByUser ? 'text-[#7C3AED]' : 'text-[#0F172A]'}`}
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
