import React, { useState } from 'react';
import { X, Heart, MessageSquare, Users, CircleDollarSign, ArrowRight, Share2, ClipboardList, BrainCircuit, Globe, Calendar, Check, Instagram, Facebook } from 'lucide-react';
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
  currentUser: FounderProfile | null;
  isCollaborationRequested?: boolean;
}

const SocialIcon = ({ type, url }: { type: 'instagram' | 'facebook' | 'website', url?: string }) => {
  if (!url) return null;
  
  const icons = {
    instagram: <Instagram className="h-5 w-5" />,
    facebook: <Facebook className="h-5 w-5" />,
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
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
          id="details-backdrop"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ type: 'spring', damping: 30, stiffness: 200 }}
          className="relative bg-white dark:bg-slate-950 w-full max-w-4xl rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
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
            <div className="absolute -bottom-8 left-6 sm:left-8 w-22 h-22 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-4xl border-4 border-white dark:border-slate-950 shadow-xl select-none overflow-hidden">
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
                <h1 className="font-display font-black text-4xl sm:text-5xl text-slate-950 dark:text-white tracking-tighter" id="idea-details-title">
                  {idea.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <span className="px-4 py-1.5 rounded-xl text-xs font-black bg-blue-600 text-white shadow-md">
                    {idea.category}
                  </span>
                  <span className="px-4 py-1.5 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-900 text-slate-950 dark:text-slate-100 uppercase tracking-widest font-mono border-2 border-slate-200 dark:border-slate-800 shadow-sm">
                    STAGE: {idea.progressStage === 'JUST IDEA NOW' || idea.progressStage === 'IDEATION' ? 'Ideation' : idea.progressStage}
                  </span>
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

            {/* ADVANCED MATURITY STEPPER (Answers 'Kaisa idea hai, kis level pe hai!') */}
            <div className="mb-12 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-3xl select-none shadow-sm" id="details-stage-stepper">
              <div className="flex items-center justify-between mb-6">
                <span className="block text-xs font-black font-mono tracking-widest uppercase text-slate-600 dark:text-slate-400">
                  Concept Maturity Roadmap
                </span>
                <span className="text-xs font-black font-mono text-blue-800 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-200 dark:border-blue-800 rounded-lg px-3 py-1.5 uppercase shadow-sm">
                  Active Phase
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-4 relative mt-2">
                {[
                  { key: 'IDEATION', label: '1. Ideation', desc: 'Concept logged' },
                  { key: 'RESEARCH', label: '2. Research', desc: 'Market analysis' },
                  { key: 'PROTOTYPE', label: '3. Prototype', desc: 'MVP active build' },
                  { key: 'SCALE', label: '4. Growth / Scale', desc: 'User acquisition' }
                ].map((st, idx) => {
                  // Normalize keys to support both formats dynamically
                  const currentNorm = (idea.progressStage === 'JUST IDEA NOW' || idea.progressStage === 'IDEATION') ? 'IDEATION' : (idea.progressStage === 'MVP BUILDING' ? 'PROTOTYPE' : idea.progressStage);
                  const isCurrent = currentNorm === st.key;
                  const stages = ['IDEATION', 'RESEARCH', 'PROTOTYPE', 'SCALE'];
                  const currentIdx = stages.indexOf(currentNorm);
                  const isPassed = currentIdx > idx;

                  return (
                    <div key={st.key} className="flex flex-col items-center sm:items-start text-center sm:text-left">
                      <div className="flex items-center w-full">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 shadow-lg border-2 transition-all ${
                          isCurrent 
                            ? 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-500/20 scale-110' 
                            : isPassed 
                              ? 'bg-emerald-600 text-white border-emerald-600' 
                              : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}>
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        {idx < 3 && (
                          <div className={`hidden sm:block flex-1 h-1.5 mx-3 rounded-full ${
                            isPassed ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                          }`} />
                        )}
                      </div>
                      <span className={`text-[13px] font-black mt-4 leading-tight uppercase tracking-tight ${
                        isCurrent ? 'text-blue-800 dark:text-blue-400' : isPassed ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-500'
                      }`}>
                        {st.label}
                      </span>
                      <span className="hidden sm:block text-[11px] font-bold text-slate-600 dark:text-slate-500 mt-1.5 leading-tight">{st.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid Layout: Main Columns & Side Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10" id="details-columns-grid">
              
              {/* Left Column: Extensive Product Info */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* 1. Description */}
                <div>
                  <h3 className="text-xs font-black text-slate-600 dark:text-slate-400 font-mono tracking-widest mb-4 flex items-center space-x-2.5 uppercase select-none">
                    <BrainCircuit className="h-5 w-5 text-blue-600 dark:text-blue-400 font-black" />
                    <span>The Innovation Concept</span>
                  </h3>
                  <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-md">
                    <p className="text-slate-950 dark:text-slate-100 text-[15px] font-bold leading-relaxed whitespace-pre-wrap">
                      {idea.description}
                    </p>
                  </div>
                </div>

                {/* Bento Grid layout for Problem and Strategy details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* 2. Problem Solved */}
                  <div className="p-6 bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-900/50 rounded-2xl space-y-3 shadow-sm">
                    <h3 className="text-xs font-black text-orange-800 dark:text-orange-400 font-mono tracking-widest flex items-center space-x-2 uppercase select-none">
                      <ClipboardList className="h-4 w-4 shrink-0 font-black" />
                      <span>Pain Point / Problem</span>
                    </h3>
                    <p className="text-slate-900 dark:text-slate-200 text-sm font-bold leading-relaxed">
                      {idea.problemSolved}
                    </p>
                  </div>

                  {/* 3. Why it works in market */}
                  <div className="p-6 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-3 shadow-sm">
                    <h3 className="text-xs font-black text-blue-800 dark:text-blue-400 font-mono tracking-widest flex items-center space-x-2 uppercase select-none">
                      <Globe className="h-4 w-4 shrink-0 font-black" />
                      <span>Market Edge</span>
                    </h3>
                    <p className="text-slate-900 dark:text-slate-200 text-sm font-bold leading-relaxed">
                      {idea.whyThisWorks}
                    </p>
                  </div>

                </div>

                {/* 4. Target Audience */}
                <div className="p-6 bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-900/50 rounded-2xl space-y-3 shadow-sm">
                  <h3 className="text-xs font-black text-indigo-800 dark:text-indigo-400 font-mono tracking-widest flex items-center space-x-2 uppercase select-none">
                    <Users className="h-4 w-4 shrink-0 font-black" />
                    <span>User Persona (Target Audience)</span>
                  </h3>
                  <p className="text-slate-900 dark:text-slate-200 text-sm font-bold leading-relaxed">
                    {idea.targetAudience}
                  </p>
                </div>

                {/* Modern Status Indicators Checkboxes */}
                <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-8">
                  <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 font-mono uppercase tracking-widest mb-4 select-none">Engagement Requirements</h4>
                  <div className="grid grid-cols-2 gap-4" id="active-requirements-toggles">
                    <div className={`p-5 rounded-2xl border-2 flex items-center space-x-4 transition-all select-none shadow-sm ${
                      idea.needCollaboration 
                        ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-800 text-blue-950 dark:text-blue-100' 
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-60'
                    }`}>
                      <Users className="h-6 w-6 text-blue-700 dark:text-blue-400 shrink-0 font-black" />
                      <div>
                        <span className="block text-sm font-black leading-tight uppercase tracking-tight">Co-founder Wanted</span>
                        <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase">
                          {idea.needCollaboration ? `Active recruitment` : 'Team complete'}
                        </span>
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl border-2 flex items-center space-x-4 transition-all select-none shadow-sm ${
                      idea.needFunding 
                        ? 'bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-100' 
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-60'
                    }`}>
                      <CircleDollarSign className="h-6 w-6 text-amber-700 dark:text-amber-400 shrink-0 font-black" />
                      <div>
                        <span className="block text-sm font-black leading-tight uppercase tracking-tight">Funding Target</span>
                        <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-1 uppercase">
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
                <div className="p-5 border border-slate-205/60 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900/40 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono tracking-wider uppercase select-none">Founder Profile</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 select-none">
                      <img 
                        src={idea.founderAvatar} 
                        alt={idea.founderName} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-950 dark:text-white select-all leading-tight">{idea.founderName}</h4>
                      <span className="inline-block mt-0.5 text-[10px] text-slate-500 font-medium">Concept Owner</span>
                    </div>
                  </div>

                  {/* Founder Social Links */}
                  {(idea.instagramUrl || idea.facebookUrl || idea.websiteUrl) && (
                    <div className="flex items-center gap-3 mb-6">
                      <SocialIcon type="instagram" url={idea.instagramUrl} />
                      <SocialIcon type="facebook" url={idea.facebookUrl} />
                      <SocialIcon type="website" url={idea.websiteUrl} />
                    </div>
                  )}

                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-normal">
                    This builder is seeking peer suggestions and active partnerships to bring their roadmap to fruition.
                  </p>

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
                  <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-3" id="sidebar-stats">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 dark:text-slate-500 font-medium select-none">Partners Bid:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/45 px-2 py-0.5 border border-slate-100 dark:border-slate-850 rounded">{idea.collaborationCount} joined</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 dark:text-slate-500 font-medium select-none">Fund Expressions:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/45 px-2 py-0.5 border border-slate-100 dark:border-slate-850 rounded">
                        {idea.needFunding ? `${idea.fundingInterestCount} bids` : 'Closed'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 dark:text-slate-500 font-medium select-none">Initiated On:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-400 flex items-center space-x-1 text-[11px]">
                        <Calendar className="h-3 w-3 text-slate-405 shrink-0" />
                        <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                </div>

                  {/* Actions Sidebar Buttons */}
                <div className="space-y-4">
                  {idea.needCollaboration && (
                    <button
                      id="collaboration-action-btn"
                      onClick={onCollaborationClick}
                      className={`w-full py-4 px-5 rounded-2xl text-sm font-black tracking-wide transition-all shadow-xl hover:-translate-y-0.5 select-none cursor-pointer flex items-center justify-center space-x-2 border-0 ${
                        isCollaborationRequested 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                          : 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100'
                      }`}
                    >
                      <Users className={`h-5 w-5 ${isCollaborationRequested ? 'text-white' : ''}`} />
                      <span>{isCollaborationRequested ? 'Collaboration Requested' : 'Request Collaboration'}</span>
                    </button>
                  )}

                  {idea.needFunding && (
                    <button
                      id="funding-action-btn"
                      onClick={onFundingClick}
                      className="w-full py-4 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black tracking-wide transition-all shadow-xl hover:-translate-y-0.5 select-none cursor-pointer flex items-center justify-center space-x-2 border-0"
                    >
                      <CircleDollarSign className="h-5 w-5" />
                      <span>Express Funding Interest</span>
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* SUGGESTION / COMMENT SYSTEM FORUM */}
            <div className="border-t-2 border-slate-200 dark:border-slate-800 pt-10" id="details-suggestions-section">
              <div className="flex items-center justify-between mb-6 px-1 select-none">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-600 border border-indigo-700 shadow-sm">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-display font-black text-base text-slate-900 dark:text-white uppercase tracking-tight">Suggestions Forum</h3>
                </div>
                <span className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-black font-mono text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 uppercase tracking-widest">
                  {suggestions.length} INPUTS
                </span>
              </div>

              {/* Suggestions List */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 mb-8 no-scrollbar" id="suggestions-list-container">
                {suggestions.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 select-none">
                    <MessageSquare className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700 mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-black uppercase tracking-tight">No suggestions yet. Be the first to give feedback!</p>
                  </div>
                ) : (
                  suggestions.map((s) => (
                    <div key={s.id} className="flex space-x-4 group" id={`suggestion-${s.id}`}>
                      <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 shadow-sm select-none">
                        <img src={s.authorAvatar} alt={s.authorName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl group-hover:border-blue-500 transition-colors shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{s.authorName}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black font-mono">{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed font-bold whitespace-pre-wrap">
                          {s.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Suggestion Input */}
              <form onSubmit={handleSuggestionSubmit} className="mt-10 pt-8 border-t-2 border-slate-200 dark:border-slate-800" id="suggestion-input-box">
                <div className="flex space-x-4">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm select-none hidden sm:flex">
                    <img 
                      src={currentUser ? currentUser.avatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80"} 
                      alt={currentUser ? currentUser.name : "Guest Avatar"} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <textarea
                      id="suggestion-textarea"
                      rows={3}
                      value={newSuggestion}
                      onChange={(e) => setNewSuggestion(e.target.value)}
                      placeholder={currentUser ? "Add a constructive suggestion or co-founder pitch..." : "Share feedback, suggestions or co-founder interest instantly..."}
                      className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500 dark:text-white transition-all resize-none placeholder-slate-400"
                    />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {!currentUser ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 select-none">
                          <span className="text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Post as Guest:</span>
                          <input
                            type="text"
                            placeholder="Your Name (Optional)"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="py-1.5 px-3 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 max-w-[180px]"
                            id="guest-name-suggestion-input"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 select-none">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">Posting as: <strong className="text-slate-700 dark:text-slate-200">{currentUser.name}</strong></span>
                        </div>
                      )}

                      <button
                        id="submit-suggestion-btn"
                        type="submit"
                        disabled={!newSuggestion.trim()}
                        className="inline-flex items-center justify-center px-6 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-black dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer shadow-md uppercase tracking-widest"
                      >
                        Post Suggestion
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
