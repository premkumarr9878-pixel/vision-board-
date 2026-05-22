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
}

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
  currentUser
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
          className="fixed inset-0 bg-slate-950/50 dark:bg-slate-950/75 backdrop-blur-md"
          id="details-backdrop"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 180 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_50px_-12px_rgba(0,0,0,0.55)] overflow-hidden flex flex-col max-h-[90vh]"
          id="details-modal-container"
        >
          {/* Header Banner Background */}
          <div className="relative h-44 sm:h-52 bg-slate-100 shrink-0 select-none">
            {idea.banner ? (
              <img 
                src={idea.banner} 
                alt={idea.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-80" />
            )}
            {/* Absolute close and share */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                id="share-details-btn"
                onClick={handleShare}
                className="p-2 bg-white/95 hover:bg-white text-gray-700 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
                title="Copy Link to Idea"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                id="close-details-btn"
                onClick={onClose}
                className="p-2 bg-white/95 hover:bg-white text-gray-700 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
                title="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Notification alert for copy */}
            {showShareNotification && (
              <div className="absolute top-16 right-4 px-3.5 py-1.5 bg-gray-950 text-white text-[11px] rounded-lg shadow-sm flex items-center space-x-1 animate-fade-in font-medium">
                <Check className="h-3.5 w-3.5 text-green-400" />
                <span>Link copied to clipboard!</span>
              </div>
            )}
            
            {/* Logo overlay */}
            <div className="absolute -bottom-8 left-6 sm:left-8 w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl border border-gray-100 shadow-md select-none overflow-hidden">
              {idea.logo && (idea.logo.startsWith('data:image/') || idea.logo.startsWith('http')) ? (
                <img src={idea.logo} alt={idea.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                idea.logo
              )}
            </div>
          </div>

          {/* Modal Body (Scrollable contents) */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-10" id="details-modal-scrollable">
            {/* Meta Row: Title and Main Tags */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-950 dark:text-white tracking-tight" id="idea-details-title">
                  {idea.name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-350 border border-blue-100 dark:border-blue-900/30">
                    {idea.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 uppercase tracking-tight font-mono">
                    STAGE: {idea.progressStage === 'JUST IDEA NOW' || idea.progressStage === 'IDEATION' ? 'Ideation' : idea.progressStage}
                  </span>
                  {idea.isPublic ? (
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-350 border border-emerald-100 dark:border-emerald-900/30 uppercase tracking-tight font-mono flex items-center space-x-1 shadow-2xs hover:scale-105 transition-all">
                      <Globe className="h-3 w-3 text-emerald-605 text-emerald-555" />
                      <span>🌐 Public Live Pitch</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-350 border border-amber-200 dark:border-amber-900/30 uppercase tracking-tight font-mono flex items-center space-x-1 shadow-2xs hover:scale-105 transition-all">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                      <span>🔒 Private Draft (Workspace only)</span>
                    </span>
                  )}
                </div>
              </div>
              
              {/* Like / Interaction Counters */}
              <div className="flex items-center space-x-3 sm:self-start">
                <button
                  id="like-details-modal-btn"
                  onClick={onLike}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border flex items-center space-x-1.5 transition-all select-none cursor-pointer ${
                    isLikedByUser
                      ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLikedByUser ? 'fill-current text-red-500' : ''}`} />
                  <span>{idea.likes} Likes</span>
                </button>
              </div>
            </div>

            {/* ADVANCED MATURITY STEPPER (Answers 'Kaisa idea hai, kis level pe hai!') */}
            <div className="mb-8 bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200 p-5 rounded-2xl select-none" id="details-stage-stepper">
              <div className="flex items-center justify-between mb-3">
                <span className="block text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400">
                  Concept Maturity Roadmap
                </span>
                <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded px-2 py-0.5">
                  ACTIVE PHASE
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-2 relative mt-1">
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
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm border transition-all ${
                          isCurrent 
                            ? 'bg-blue-600 text-white border-blue-500 ring-4 ring-blue-550/10 ring-blue-500/15' 
                            : isPassed 
                              ? 'bg-emerald-500 text-white border-emerald-400' 
                              : 'bg-white text-slate-400 border-slate-250 border-slate-200'
                        }`}>
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        {idx < 3 && (
                          <div className={`hidden sm:block flex-1 h-0.5 mx-2 ${
                            isPassed ? 'bg-emerald-550 bg-emerald-500' : 'bg-slate-200'
                          }`} />
                        )}
                      </div>
                      <span className={`text-[11px] font-bold mt-2 leading-tight ${
                        isCurrent ? 'text-blue-600' : isPassed ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {st.label}
                      </span>
                      <span className="hidden sm:block text-[9px] text-slate-450 text-slate-400 mt-0.5 leading-tight">{st.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid Layout: Main Columns & Side Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8" id="details-columns-grid">
              
              {/* Left Column: Extensive Product Info */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Description */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 font-mono tracking-wider mb-2.5 flex items-center space-x-1.5 uppercase select-none">
                    <BrainCircuit className="h-4 w-4 text-blue-600" />
                    <span>The Innovation Concept</span>
                  </h3>
                  <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-2xs">
                    <p className="text-gray-750 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {idea.description}
                    </p>
                  </div>
                </div>

                {/* Bento Grid layout for Problem and Strategy details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* 2. Problem Solved */}
                  <div className="p-5 bg-orange-50/40 border border-orange-100 rounded-2xl space-y-2">
                    <h3 className="text-xs font-bold text-orange-700 font-mono tracking-wider flex items-center space-x-1.5 uppercase select-none">
                      <ClipboardList className="h-4 w-4 shrink-0" />
                      <span>Pain Point / Problem</span>
                    </h3>
                    <p className="text-slate-705 text-slate-700 text-xs leading-relaxed">
                      {idea.problemSolved}
                    </p>
                  </div>

                  {/* 3. Why it works in market */}
                  <div className="p-5 bg-blue-50/30 border border-blue-100 rounded-2xl space-y-2">
                    <h3 className="text-xs font-bold text-blue-700 font-mono tracking-wider flex items-center space-x-1.5 uppercase select-none">
                      <Globe className="h-4 w-4 shrink-0" />
                      <span>Market Edge</span>
                    </h3>
                    <p className="text-slate-705 text-slate-700 text-xs leading-relaxed">
                      {idea.whyThisWorks}
                    </p>
                  </div>

                </div>

                {/* 4. Target Audience */}
                <div className="p-5 bg-indigo-50/30 border border-indigo-100 rounded-2xl space-y-2">
                  <h3 className="text-xs font-bold text-indigo-700 font-mono tracking-wider flex items-center space-x-1.5 uppercase select-none">
                    <Users className="h-4 w-4 shrink-0" />
                    <span>User Persona (Target Audience)</span>
                  </h3>
                  <p className="text-slate-705 text-slate-700 text-xs leading-relaxed">
                    {idea.targetAudience}
                  </p>
                </div>

                {/* Modern Status Indicators Checkboxes */}
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="text-xs font-bold text-gray-400 font-mono uppercase tracking-wider mb-3 select-none">Engagement Requirements</h4>
                  <div className="grid grid-cols-2 gap-3" id="active-requirements-toggles">
                    <div className={`p-4 rounded-2xl border flex items-center space-x-3 transition-colors select-none ${
                      idea.needCollaboration 
                        ? 'bg-blue-50/40 border-blue-100 text-blue-900' 
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}>
                      <Users className="h-5 w-5 text-blue-600 shrink-0" />
                      <div>
                        <span className="block text-xs font-bold leading-tight">Co-founder Wanted</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5">
                          {idea.needCollaboration ? `Active recruitment` : 'Team complete'}
                        </span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border flex items-center space-x-3 transition-colors select-none ${
                      idea.needFunding 
                        ? 'bg-amber-50/45 border-amber-100 text-amber-900' 
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}>
                      <CircleDollarSign className="h-5 w-5 text-amber-600 shrink-0" />
                      <div>
                        <span className="block text-xs font-bold leading-tight">Funding Target</span>
                        <span className="block text-[10px] text-gray-500 mt-0.5">
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
                <div className="space-y-2.5">
                  {idea.needCollaboration && (
                    <button
                      id="collaboration-action-btn"
                      onClick={onCollaborationClick}
                      className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-950 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-955 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 select-none cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>Request Collaboration</span>
                    </button>
                  )}

                  {idea.needFunding && (
                    <button
                      id="funding-action-btn"
                      onClick={onFundingClick}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold tracking-wide transition-all shadow-[0_4px_12px_rgba(59,130,246,0.18)] hover:-translate-y-0.5 select-none cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <CircleDollarSign className="h-3.5 w-3.5" />
                      <span>Express Funding Interest</span>
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* SUGGESTION / COMMENT SYSTEM FORUM */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8" id="details-suggestions-section">
              <div className="flex items-center justify-between mb-4 select-none">
                <h3 className="font-display font-bold text-lg text-slate-950 dark:text-white flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span>Suggestions Forum</span>
                  <span className="text-xs bg-slate-150/70 dark:bg-slate-850 text-slate-705 dark:text-slate-350 rounded-full px-2 py-0.5 font-bold">
                    {suggestions.length}
                  </span>
                </h3>
              </div>

              {/* Suggestions List */}
              <div className="space-y-4 mb-6" id="suggestions-list-container">
                {suggestions.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-950/25 border border-slate-200/50 dark:border-slate-850 p-4 rounded-xl text-center select-none leading-relaxed">
                    No suggestions yet. Be the first to give feedback or build suggestion inputs!
                  </p>
                ) : (
                  suggestions.map((s) => (
                    <div key={s.id} className="p-4 border border-slate-150/50 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 rounded-2xl flex items-start space-x-3 shadow-2xs">
                      <div className="w-8 h-8 rounded-full border border-slate-100 dark:border-slate-800 overflow-hidden select-none shrink-0">
                        <img src={s.authorAvatar} alt={s.authorName} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-xs text-slate-950 dark:text-white">{s.authorName}</span>
                          <span className="text-[10px] text-slate-400">{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-650 dark:text-slate-350 text-xs leading-normal mt-1 whitespace-pre-wrap">
                          {s.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Suggestion Input */}
              <form onSubmit={handleSuggestionSubmit} className="space-y-3 p-4 bg-slate-50/50 border border-slate-150 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-100 shrink-0 select-none hidden sm:block">
                    <img 
                      src={currentUser ? currentUser.avatar : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80"} 
                      alt={currentUser ? currentUser.name : "Guest Avatar"} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <textarea
                      id="suggestion-textarea"
                      rows={2}
                      value={newSuggestion}
                      onChange={(e) => setNewSuggestion(e.target.value)}
                      placeholder={currentUser ? "Add a constructive suggestion or co-founder pitch..." : "Share feedback, suggestions or co-founder interest instantly..."}
                      className="w-full py-2 px-3 border border-gray-200 rounded-xl text-xs placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-slate-100">
                  {!currentUser ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 select-none">
                      <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Post as Guest:</span>
                      <input
                        type="text"
                        placeholder="Your Name (Optional)"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="py-1 px-2.5 border border-slate-200 bg-white rounded-lg text-[11px] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 max-w-[150px] font-semibold text-slate-700"
                        id="guest-name-suggestion-input"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 select-none">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-medium text-slate-500">Posting as authenticated founder: <strong className="text-slate-700">{currentUser.name}</strong></span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 justify-end">
                    <button
                      id="submit-suggestion-btn"
                      type="submit"
                      className="py-1.5 px-4 bg-gray-950 hover:bg-gray-900 text-white rounded-lg text-xs font-semibold select-none cursor-pointer tracking-wide"
                    >
                      Post Suggestion
                    </button>
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
