import React, { useState } from 'react';
import { X, Heart, Users, Share2, ClipboardList, BrainCircuit, Globe, Calendar, Check, Instagram, Facebook, UserCircle, ExternalLink, Twitter, Target, Zap, Sparkles, Eye } from 'lucide-react';
import { StartupIdea, Suggestion, FounderProfile } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface IdeaDetailsModalProps {
  idea: StartupIdea;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
  isLikedByUser: boolean;
  onFounderProfileClick: (founderId: string) => void;
  currentUser: FounderProfile | null;
}

const SocialIcon = ({ type, url }: { type: 'instagram' | 'facebook' | 'twitter' | 'website', url?: string }) => {
  if (!url) return null;
  
  const icons = {
    instagram: <Instagram className="h-5 w-5" />,
    facebook: <Facebook className="h-5 w-5" />,
    twitter: <Twitter className="h-5 w-5" />,
    website: <Globe className="h-5 w-5" />
  };

  return (
    <a 
      href={url.startsWith('http') ? url : `https://${url}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="p-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600 transition-all shadow-sm"
      title={type.charAt(0).toUpperCase() + type.slice(1)}
    >
      {icons[type]}
    </a>
  );
};

export default function IdeaDetailsModal({
  idea,
  isOpen,
  onClose,
  onLike,
  isLikedByUser,
  onFounderProfileClick = () => {},
  currentUser
}: IdeaDetailsModalProps) {
  const [showShareNotification, setShowShareNotification] = useState(false);

  if (!isOpen) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareNotification(true);
    setTimeout(() => setShowShareNotification(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 dark:bg-slate-950/90 backdrop-blur-[2px]"
          id="details-backdrop"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: 'spring', damping: 30, stiffness: 200 }}
          className="relative bg-white dark:bg-slate-950 w-full max-w-4xl rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]"
          id="details-modal-container"
        >
          {/* Header Banner Background */}
          <div className="relative h-44 sm:h-52 bg-slate-200 dark:bg-slate-800 shrink-0 select-none">
            {idea.banner ? (
              <img 
                src={idea.banner} 
                alt={idea.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90" />
            )}
            {/* Absolute close and share */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                id="share-details-btn"
                onClick={handleShare}
                className="p-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer border border-slate-200 dark:border-slate-800"
                title="Copy Link to Idea"
              >
                <Share2 className="h-4 w-4 font-black" />
              </button>
              <button
                id="close-details-btn"
                onClick={onClose}
                className="p-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer border border-slate-200 dark:border-slate-800"
                title="Close"
              >
                <X className="h-4 w-4 font-black" />
              </button>
            </div>

            {/* Notification alert for copy */}
            {showShareNotification && (
              <div className="absolute top-16 right-4 px-3.5 py-1.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl flex items-center space-x-1 animate-fade-in font-black border border-slate-700">
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span>Link copied to clipboard!</span>
              </div>
            )}
            
            {/* Logo overlay */}
            <div className="absolute -bottom-8 left-6 sm:left-8 w-22 h-22 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-4xl border-4 border-white dark:border-slate-950 shadow-xl select-none overflow-hidden">
              {idea.logo && (idea.logo.startsWith('data:image/') || idea.logo.startsWith('http')) ? (
                <img src={idea.logo} alt={idea.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                idea.logo
              )}
            </div>
          </div>

          {/* Modal Body (Scrollable contents) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-950">
            <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
              
              {/* HERO SECTION: Title & Quick Stats */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 border-2 border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] space-y-8">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg shadow-blue-500/20">
                      {idea.category}
                    </span>
                    {/* Professional Stage Badge */}
                    {(() => {
                      let stageLabel = '';
                      let stageClass = '';
                      
                      switch (idea.progressStage) {
                        case 'JUST IDEA NOW':
                        case 'IDEATION':
                          stageLabel = 'Ideation';
                          stageClass = 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30';
                          break;
                        case 'RESEARCH':
                          stageLabel = 'Research';
                          stageClass = 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30';
                          break;
                        case 'MVP BUILDING':
                        case 'PROTOTYPE':
                          stageLabel = 'Prototype / MVP';
                          stageClass = 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30';
                          break;
                        case 'SCALE':
                          stageLabel = 'Growth / Scale';
                          stageClass = 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30';
                          break;
                        default:
                          stageLabel = idea.progressStage;
                          stageClass = 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30';
                      }
                      
                      return (
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 shadow-sm transition-all hover:border-blue-500/30 ${stageClass}`}>
                          {stageLabel}
                        </span>
                      );
                    })()}

                    <span className="px-4 py-1.5 rounded-xl text-xs font-black bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-900 uppercase tracking-widest font-mono flex items-center space-x-2 shadow-sm">
                      <Globe className="h-4 w-4" />
                      <span>Public Live Pitch</span>
                    </span>
                  </div>
                  <h1 className="font-display font-black text-4xl sm:text-5xl text-slate-950 dark:text-white tracking-tighter" id="idea-details-title" dir="auto">
                    {idea.name}
                  </h1>
                </div>
                
                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                        <Target className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Target Market</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {idea.targetAudience}
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Community Impact</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      High Growth Potential
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-3xl border-2 border-slate-100 dark:border-slate-800/50 group hover:border-amber-500/30 transition-all">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                        <Zap className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {idea.progressStage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    id="like-details-modal-btn"
                    onClick={onLike}
                    className={`px-6 py-3 rounded-2xl text-sm font-black border-2 flex items-center space-x-2.5 transition-all select-none cursor-pointer shadow-md active:scale-95 ${
                      isLikedByUser
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-950 dark:text-slate-200 hover:border-red-600 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isLikedByUser ? 'fill-current' : ''}`} />
                    <span>{(idea.likes || 0).toLocaleString()} Likes</span>
                  </button>
                </div>
              </div>

              {/* Grid Layout: Main Columns & Side Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="details-columns-grid">
                
                {/* Left Column: Extensive Product Info */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* 1. Description */}
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 border-2 border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] space-y-6 group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center space-x-3 border-b-2 border-slate-100 dark:border-slate-800 pb-5">
                      <div className="w-2 h-4 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">The Innovation Concept</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-base font-bold leading-[1.8] whitespace-pre-wrap font-sans multilingual-text" dir="auto">
                      {idea.description}
                    </p>
                  </div>

                  {/* Why it works & Problem solved Bento Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/10 rounded-[2rem] p-8 border-2 border-emerald-100 dark:border-emerald-900/30 space-y-4 group hover:shadow-lg hover:border-emerald-500/50 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-white dark:bg-emerald-900/50 rounded-2xl text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800/50">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-widest">Why it works</h4>
                      </div>
                      <p className="text-[13px] font-bold text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                        {idea.whyThisWorks}
                      </p>
                    </div>

                    <div className="bg-orange-50/50 dark:bg-orange-950/10 rounded-[2rem] p-8 border-2 border-orange-100 dark:border-orange-900/30 space-y-4 group hover:shadow-lg hover:border-orange-500/50 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-white dark:bg-orange-900/50 rounded-2xl text-orange-600 dark:text-orange-400 shadow-sm border border-orange-100 dark:border-orange-800/50">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <h4 className="text-xs font-black text-orange-900 dark:text-orange-100 uppercase tracking-widest">The Problem</h4>
                      </div>
                      <p className="text-[13px] font-bold text-orange-800/80 dark:text-orange-300/80 leading-relaxed">
                        {idea.problemSolved}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Founder Sidebar Details */}
                <div className="space-y-8">
                  
                  {/* Idea Stats Summary */}
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-2 border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] space-y-6">
                    <div className="flex items-center space-x-3 border-b-2 border-slate-100 dark:border-slate-800 pb-5">
                      <div className="w-1.5 h-3 bg-blue-600 rounded-full" />
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Engagement Stats</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-center">
                        <div className="flex items-center justify-center space-x-2 mb-1">
                          <Eye className="h-4 w-4 text-blue-600" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Views</span>
                        </div>
                        <p className="text-xl font-black text-slate-950 dark:text-white tracking-tighter">{(idea.viewsCount || 0).toLocaleString()}</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-center">
                        <div className="flex items-center justify-center space-x-2 mb-1">
                          <Heart className="h-4 w-4 text-red-600" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upvotes</span>
                        </div>
                        <p className="text-xl font-black text-slate-950 dark:text-white tracking-tighter">{(idea.likes || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Founder Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-2 border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] space-y-6 group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center space-x-3 border-b-2 border-slate-100 dark:border-slate-800 pb-5">
                      <div className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">The Founder</h3>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="relative group/avatar">
                        <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg group-hover/avatar:border-indigo-500 transition-colors">
                          {idea.founderAvatar ? (
                            <img src={idea.founderAvatar} alt={idea.founderName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <UserCircle className="h-10 w-10" />
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg border-2 border-white dark:border-slate-900">
                          <Check className="h-3 w-3" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{idea.founderName}</h4>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Concept Owner</p>
                      </div>

                      <div className="pt-4 w-full">
                        <button 
                          onClick={() => typeof onFounderProfileClick === 'function' && onFounderProfileClick(idea.founderId)}
                          className="w-full py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-xs font-black shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                        >
                          View Full Profile
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Connect & Outreach */}
                  {(idea.instagramUrl || idea.facebookUrl || idea.websiteUrl || idea.twitterUrl) && (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border-2 border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] space-y-6">
                      <div className="flex items-center space-x-3 border-b-2 border-slate-100 dark:border-slate-800 pb-5">
                        <div className="w-1.5 h-3 bg-amber-500 rounded-full" />
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Connect</h3>
                      </div>

                      <div className="flex flex-wrap gap-3 justify-center">
                        <SocialIcon type="website" url={idea.websiteUrl} />
                        <SocialIcon type="instagram" url={idea.instagramUrl} />
                        <SocialIcon type="facebook" url={idea.facebookUrl} />
                        <SocialIcon type="twitter" url={idea.twitterUrl} />
                      </div>
                    </div>
                  )}

                  {/* Sidebar stats */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight text-[10px]">Initiated On:</span>
                      <span className="font-black text-slate-900 dark:text-slate-300 flex items-center space-x-1.5 text-[11px]">
                        <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
