import React, { useState } from 'react';
import { X, Heart, MessageSquare, Users, CircleDollarSign, ArrowRight, Share2, ClipboardList, BrainCircuit, Globe, Calendar, Check, Instagram, Facebook, Handshake, Coins, UserCircle, Lightbulb, ExternalLink, Twitter } from 'lucide-react';
import { StartupIdea, Suggestion, FounderProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface IdeaDetailsModalProps {
  idea: StartupIdea;
  isOpen: boolean;
  onClose: () => void;
  onLike: () => void;
  isLikedByUser: boolean;
  suggestions: Suggestion[];
  onAddSuggestion: (content: string, guestName?: string) => void;
  onCollaborationClick: () => void;
  onFundingClick: () => void;
  onFounderProfileClick: (founderId: string) => void;
  currentUser: FounderProfile | null;
  isCollaborationRequested?: boolean;
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
  suggestions,
  onAddSuggestion,
  onCollaborationClick,
  onFundingClick,
  onFounderProfileClick = () => {},
  currentUser,
  isCollaborationRequested = false
}: IdeaDetailsModalProps) {
  const [newSuggestion, setNewSuggestion] = useState('');
  const [guestName, setGuestName] = useState('');
  const [showShareNotification, setShowShareNotification] = useState(false);

  if (!isOpen) return null;

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;
    onAddSuggestion(newSuggestion, guestName || undefined);
    setNewSuggestion('');
    setGuestName('');
  };

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
                className="p-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer border border-slate-200"
                title="Copy Link to Idea"
              >
                <Share2 className="h-4 w-4 font-black" />
              </button>
              <button
                id="close-details-btn"
                onClick={onClose}
                className="p-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer border border-slate-200"
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
            <div className="absolute -bottom-8 left-6 sm:left-8 w-22 h-22 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-4xl border-4 border-white dark:border-950 shadow-xl select-none overflow-hidden">
              {idea.logo && (idea.logo.startsWith('data:image/') || idea.logo.startsWith('http')) ? (
                <img src={idea.logo} alt={idea.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                idea.logo
              )}
            </div>
          </div>

          {/* Modal Body (Scrollable contents) */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 pt-14" id="details-modal-scrollable">
            {/* Meta Row: Title and Main Tags */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
              <div>
                <h1 className="font-display font-black text-4xl sm:text-5xl text-slate-950 dark:text-white tracking-tighter" id="idea-details-title" dir="auto">
                  {idea.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <span className="px-4 py-1.5 rounded-xl text-xs font-black bg-blue-600 text-white shadow-md">
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
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 shadow-sm ${stageClass}`}>
                        {stageLabel}
                      </span>
                    );
                  })()}

                  {idea.isPublic ? (
                    <span className="px-4 py-1.5 rounded-xl text-xs font-black bg-emerald-100 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-900 uppercase tracking-widest font-mono flex items-center space-x-2 shadow-sm">
                      <Globe className="h-4 w-4" />
                      <span>Public Live Pitch</span>
                    </span>
                  ) : (
                    <span className="px-4 py-1.5 rounded-xl text-xs font-black bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-900 uppercase tracking-widest font-mono flex items-center space-x-2 shadow-sm">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-600 animate-pulse" />
                      <span>Private Draft</span>
                    </span>
                  )}
                </div>
              </div>
              
              {/* Like / Interaction Counters */}
              <div className="flex items-center space-x-4 sm:self-start">
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
                  <span>{idea.likes} Likes</span>
                </button>
              </div>
            </div>

            {/* Grid Layout: Main Columns & Side Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10" id="details-columns-grid">
              
              {/* Left Column: Extensive Product Info */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* 1. Description */}
                <div className="group">
                  <h3 className="text-[11px] font-black text-slate-600 dark:text-slate-400 font-mono tracking-widest mb-4 flex items-center space-x-2.5 uppercase select-none">
                    <div className="p-1.5 rounded-lg bg-blue-600/15 dark:bg-blue-400/15">
                      <BrainCircuit className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                    </div>
                    <span>The Innovation Concept</span>
                  </h3>
                  <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-7 sm:p-10 rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_10px_50px_-10px_rgba(0,0,0,0.08)] hover:border-slate-300 dark:hover:border-slate-700 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600/40 group-hover:bg-blue-600/60 transition-colors" />
                    <p className="text-slate-950 dark:text-slate-100 text-[16px] font-bold leading-[1.7] whitespace-pre-wrap font-sans multilingual-text" dir="auto">
                      {idea.description}
                    </p>
                  </div>
                </div>

                {/* Bento Grid layout for Problem and Strategy details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  
                  {/* 2. Problem Solved */}
                  <div className="p-7 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-900/40 rounded-[1.5rem] space-y-4 shadow-sm hover:shadow-md transition-all group">
                    <h3 className="text-[10px] font-black text-orange-900 dark:text-orange-400 font-mono tracking-widest flex items-center space-x-2 uppercase select-none">
                      <div className="p-1.5 rounded-lg bg-orange-200/50 dark:bg-orange-900/50">
                        <ClipboardList className="h-3.5 w-3.5 shrink-0" />
                      </div>
                      <span>Pain Point / Problem</span>
                    </h3>
                    <p className="text-slate-900 dark:text-slate-200 text-[14px] font-bold leading-relaxed multilingual-text" dir="auto">
                      {idea.problemSolved}
                    </p>
                  </div>

                  {/* 3. Why it works in market */}
                  <div className="p-7 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/40 rounded-[1.5rem] space-y-4 shadow-sm hover:shadow-md transition-all group">
                    <h3 className="text-[10px] font-black text-blue-900 dark:text-blue-400 font-mono tracking-widest flex items-center space-x-2 uppercase select-none">
                      <div className="p-1.5 rounded-lg bg-blue-200/50 dark:bg-blue-900/50">
                        <Globe className="h-3.5 w-3.5 shrink-0" />
                      </div>
                      <span>Market Edge</span>
                    </h3>
                    <p className="text-slate-900 dark:text-slate-200 text-[14px] font-bold leading-relaxed multilingual-text" dir="auto">
                      {idea.whyThisWorks}
                    </p>
                  </div>

                </div>

                {/* 4. Target Audience */}
                <div className="p-7 bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/40 rounded-[1.5rem] space-y-4 shadow-sm hover:shadow-md transition-all group">
                  <h3 className="text-[10px] font-black text-indigo-900 dark:text-indigo-400 font-mono tracking-widest flex items-center space-x-2 uppercase select-none">
                    <div className="p-1.5 rounded-lg bg-indigo-200/50 dark:bg-indigo-900/50">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                    </div>
                    <span>User Persona (Target Audience)</span>
                  </h3>
                  <p className="text-slate-900 dark:text-slate-200 text-[14px] font-bold leading-relaxed multilingual-text" dir="auto">
                    {idea.targetAudience}
                  </p>
                </div>

                {/* Modern Status Indicators Checkboxes */}
                <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-8">
                  <h4 className="text-xs font-black text-slate-600 dark:text-slate-400 font-mono uppercase tracking-widest mb-4 select-none">Engagement Requirements</h4>
                  <div className="grid grid-cols-2 gap-4" id="active-requirements-toggles">
                    <div className={`p-5 rounded-2xl border-2 flex items-center space-x-4 transition-all select-none shadow-sm ${
                      idea.needCollaboration 
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-700 text-blue-950 dark:text-blue-50' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500'
                    }`}>
                      <Users className={`h-6 w-6 shrink-0 font-black ${idea.needCollaboration ? 'text-blue-700 dark:text-blue-400' : 'text-slate-400'}`} />
                      <div>
                        <span className="block text-sm font-black leading-tight uppercase tracking-tight">Co-founder Wanted</span>
                        <span className={`block text-[11px] font-bold mt-1 uppercase ${idea.needCollaboration ? 'text-blue-800 dark:text-blue-300' : 'text-slate-500'}`}>
                          {idea.needCollaboration ? `Active recruitment` : 'Team complete'}
                        </span>
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl border-2 flex items-center space-x-4 transition-all select-none shadow-sm ${
                      idea.needFunding 
                        ? 'bg-amber-100 dark:bg-amber-900 border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-50' 
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500'
                    }`}>
                      <CircleDollarSign className={`h-6 w-6 shrink-0 font-black ${idea.needFunding ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'}`} />
                      <div>
                        <span className="block text-sm font-black leading-tight uppercase tracking-tight">Funding Target</span>
                        <span className={`block text-[11px] font-bold mt-1 uppercase ${idea.needFunding ? 'text-amber-800 dark:text-amber-300' : 'text-slate-500'}`}>
                          {idea.needFunding ? `Seeking investors` : 'No capital requests'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Founder Sidebar Details */}
              <div className="space-y-6">
                
                {/* Founder Info box */}
                <div 
                  onClick={() => typeof onFounderProfileClick === 'function' && onFounderProfileClick(idea.founderId)}
                  className="p-5 border-2 border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-4 shadow-sm cursor-pointer hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-lg transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 bg-blue-600/10 text-blue-600 rounded-bl-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-3 w-3" />
                  </div>

                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase select-none group-hover:text-blue-600">Know About Founder</h3>
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tight opacity-0 group-hover:opacity-100 transition-opacity">View Profile</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 select-none group-hover:scale-105 transition-transform">
                        <img 
                          src={idea.founderAvatar} 
                          alt={idea.founderName} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h4 className="font-display font-black text-sm text-slate-950 dark:text-white select-all leading-tight group-hover:text-blue-600">{idea.founderName}</h4>
                        <span className="inline-block mt-0.5 text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-tight">Concept Owner</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
                      <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 group-hover:text-blue-600 transition-colors">Click to View Profile</span>
                    </div>
                  </div>
                </div>

                {/* Founder social outreach handles */}
                {(idea.instagramUrl || idea.facebookUrl || idea.websiteUrl) && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="block text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400 dark:text-slate-500 mb-2">Connect with Founder</span>
                    <div className="flex flex-col gap-2 bg-slate-50/50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-200/10 dark:border-slate-800/80">
                      {idea.websiteUrl && (
                        <a
                          href={idea.websiteUrl.startsWith('http') ? idea.websiteUrl : `https://${idea.websiteUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-750 dark:hover:text-blue-350 font-semibold transition-colors"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          <span className="truncate">Official Website</span>
                        </a>
                      )}
                      {idea.instagramUrl && (
                        <a
                          href={idea.instagramUrl.startsWith('http') ? idea.instagramUrl : `https://${idea.instagramUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-xs text-pink-600 dark:text-pink-400 hover:text-pink-850 dark:hover:text-pink-350 font-semibold transition-colors"
                        >
                          <Instagram className="h-3.5 w-3.5" />
                          <span className="truncate">Instagram</span>
                        </a>
                      )}
                      {idea.facebookUrl && (
                        <a
                          href={idea.facebookUrl.startsWith('http') ? idea.facebookUrl : `https://${idea.facebookUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-xs text-blue-800 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-semibold transition-colors"
                        >
                          <Facebook className="h-3.5 w-3.5" />
                          <span className="truncate">Facebook Profile</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Sidebar stats */}
                <div className="space-y-2.5 border-t-2 border-slate-100 dark:border-slate-800 pt-3" id="sidebar-stats">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-bold select-none uppercase tracking-tight text-[10px]">Partners Bid:</span>
                    <span className="font-black text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 border-2 border-slate-200 dark:border-slate-800 rounded-lg">{idea.collaborationCount} joined</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-bold select-none uppercase tracking-tight text-[10px]">Fund Expressions:</span>
                    <span className="font-black text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-950 px-2 py-0.5 border-2 border-slate-200 dark:border-slate-800 rounded-lg">
                      {idea.needFunding ? `${idea.fundingInterestCount} bids` : 'Closed'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-bold select-none uppercase tracking-tight text-[10px]">Initiated On:</span>
                    <span className="font-black text-slate-900 dark:text-slate-300 flex items-center space-x-1 text-[11px]">
                      <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>

                {/* Actions Sidebar Buttons */}
                {currentUser?.id !== idea.founderId && (
                  <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {idea.seeking_collaboration && (
                      <button
                        id="collaboration-action-btn"
                        onClick={onCollaborationClick}
                        className={`w-full py-3.5 px-5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all select-none cursor-pointer flex items-center justify-center space-x-2 border-2 ${
                          isCollaborationRequested 
                            ? 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700' 
                            : 'bg-transparent border-emerald-600/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                        }`}
                      >
                        <Handshake className="h-4 w-4" />
                        <span>{isCollaborationRequested ? 'Request Sent' : 'Request Collaboration'}</span>
                      </button>
                    )}

                    {idea.seeking_funding && (
                      <button
                        id="funding-action-btn"
                        onClick={onFundingClick}
                        className="w-full py-3.5 px-5 bg-transparent border-2 border-orange-600/30 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all select-none cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <Coins className="h-4 w-4" />
                        <span>Express Funding Interest</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SUGGESTION / COMMENT SYSTEM FORUM */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-5" id="details-suggestions-section">
              <div className="flex items-center justify-between mb-3 px-1 select-none">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-blue-600/10 dark:bg-blue-400/10">
                    <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-display font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">Suggestion Forum</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-[9px] font-black font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 uppercase tracking-widest">
                    {suggestions.length} {suggestions.length === 1 ? 'Input' : 'Inputs'}
                  </span>
                </div>
              </div>

              {/* Suggestions List */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 mb-4 no-scrollbar custom-scrollbar" id="suggestions-list-container">
                {suggestions.length === 0 ? (
                  <div className="py-8 text-center bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-800 select-none">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mx-auto mb-2.5 shadow-sm border-2 border-slate-200 dark:border-slate-700">
                      <Lightbulb className="h-7 w-7 text-blue-600 animate-pulse" />
                    </div>
                    <p className="text-[11px] font-black text-slate-950 dark:text-white uppercase tracking-tight">No suggestions yet</p>
                    <p className="text-[9px] text-slate-600 dark:text-slate-400 font-bold mt-0.5">Be the first to help the founder refine this vision!</p>
                  </div>
                ) : (
                  suggestions.map((s) => (
                    <div key={s.id} className="flex items-start space-x-4 group relative pl-4 animate-in fade-in slide-in-from-bottom-2 duration-300" id={`suggestion-${s.id}`}>
                      {/* Interaction marker */}
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-y-0 group-hover:scale-y-100" />
                      
                      <div className="w-10 h-10 rounded-xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 shadow-sm select-none mt-1">
                        <img src={s.authorAvatar} alt={s.authorName} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-4 rounded-xl group-hover:border-blue-400 dark:group-hover:border-blue-700 transition-all shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-tight">{s.authorName}</span>
                            {s.authorName === idea.founderName && (
                              <span className="px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest shadow-sm">Founder</span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold font-mono">{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap" dir="auto">
                          {s.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Suggestion Input */}
              <form onSubmit={handleSuggestionSubmit} className="mt-2 pt-4 border-t-2 border-slate-100 dark:border-slate-800" id="suggestion-input-box">
                <div className="mb-2.5 pl-1 text-center sm:text-left">
                  <h4 className="text-[10px] font-black text-slate-600 dark:text-slate-400 tracking-tight uppercase bg-slate-100 dark:bg-slate-800 inline-block px-2.5 py-1 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                    Type your suggestion about this startup idea and help the founder improve it.
                  </h4>
                </div>
                <div className="flex space-x-3">
                  <div className="w-10 h-10 rounded-xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm select-none hidden sm:flex">
                    <img src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} alt="User" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="relative group">
                      <textarea
                        id="suggestion-textarea"
                        rows={2}
                        value={newSuggestion}
                        onChange={(e) => setNewSuggestion(e.target.value)}
                        dir="auto"
                        placeholder="Drop a constructive suggestion or feature idea..."
                        className="w-full py-3 px-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-500 dark:text-white transition-all resize-none placeholder-slate-500 leading-relaxed shadow-sm"
                      />
                      <div className="absolute bottom-2.5 right-3.5 flex items-center space-x-2">
                        <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{newSuggestion.length} chars</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-2 select-none bg-emerald-100 dark:bg-emerald-900 px-3 py-1.5 rounded-full border-2 border-emerald-200 dark:border-emerald-800 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[9px] font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-tight">Logged in: <strong className="ml-1">{currentUser?.name || 'Guest'}</strong></span>
                      </div>
                      <button
                        id="submit-suggestion-btn"
                        type="submit"
                        disabled={!newSuggestion.trim()}
                        className="inline-flex items-center justify-center px-8 py-2.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer shadow-lg hover:shadow-slate-500/40 dark:hover:shadow-white/20 active:scale-95 uppercase tracking-widest border-0"
                      >
                        Publish Suggestion
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
