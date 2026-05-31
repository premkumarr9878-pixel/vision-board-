import React, { useState } from 'react';
import { LayoutDashboard, Users, CircleDollarSign, Plus, Lightbulb, Heart, MessageSquare, Clipboard, ExternalLink, RefreshCw, Check, Trash2, Edit3, Save, Eye, EyeOff, Lock, Globe, Mail, Phone, Calendar, UserCheck, UserX, MessageCircle, Clock, MoreVertical, ShieldCheck, XCircle } from 'lucide-react';
import { FounderProfile, StartupIdea, CollaborationRequest, FundingRequest, Suggestion, RequestStatus } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';

const StatusBadge = ({ status }: { status: RequestStatus }) => {
  const styles = {
    pending: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800',
    accepted: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    rejected: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    contacted: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${styles[status]}`}>
      {status}
    </span>
  );
};

interface DashboardViewProps {
  profile: FounderProfile;
  ideas: StartupIdea[];
  collabs: CollaborationRequest[];
  fundings: FundingRequest[];
  suggestions: Suggestion[];
  onUpdateProfile: (updated: FounderProfile) => void;
  onAddIdeaClick: () => void;
  onSelectIdea: (idea: StartupIdea) => void;
  onDeleteIdea: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onEditIdea?: (idea: StartupIdea) => void;
  onUpdateRequestStatus: (type: 'collaboration' | 'funding', requestId: string, status: RequestStatus) => void;
}

export default function DashboardView({
  profile,
  ideas,
  collabs,
  fundings,
  suggestions,
  onUpdateProfile,
  onAddIdeaClick,
  onSelectIdea,
  onDeleteIdea,
  onEditIdea,
  onUpdateRequestStatus
}: DashboardViewProps) {
  // Tabs inside Dashboard: Dashboard Overview / My Published Ideas / Inbox: Collaboration / Inbox: Funding / Edit Profile / Suggestions
  const [activeTab, setActiveTab] = useState<'overview' | 'ideas' | 'collabs' | 'funding' | 'profile' | 'suggestions'>('overview');
  const [ideasSubFilter, setIdeasSubFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Edit Profile States
  const [editName, setEditName] = useState(profile?.name || '');
  const [editBio, setEditBio] = useState(profile?.bio || '');
  const [editBuildingDesc, setEditBuildingDesc] = useState(profile?.buildingDesc || '');
  const [editAvatar, setEditAvatar] = useState(profile?.avatar || '');
  const [editStartupLogo, setEditStartupLogo] = useState(profile?.startupLogo || '');
  const [editGithub, setEditGithub] = useState(profile?.githubUrl || '');
  const [editTwitter, setEditTwitter] = useState(profile?.twitterUrl || '');
  const [editLinkedin, setEditLinkedin] = useState(profile?.linkedinUrl || '');
  const [editInstagram, setEditInstagram] = useState(profile?.instagramUrl || '');
  const [editFacebook, setEditFacebook] = useState(profile?.facebookUrl || '');
  const [editRole, setEditRole] = useState<'founder_hub' | 'vision_board'>(profile?.userRole || 'vision_board');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Add null check for profile
  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400 font-bold">Loading Founder Hub...</p>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter ideas owned by the current participant (logged-in user)
  const userIdeas = ideas.filter(idea => idea.founderId === profile.id);

  // Filter inbox submissions addressed to the currentUser's ideas
  const userIdeasIds = userIdeas.map(ui => ui.id);
  const userCollabs = collabs.filter(c => c.founderId === profile.id);
  const userFundings = fundings.filter(f => f.founderId === profile.id);
  const userSuggestions = (suggestions || []).filter(s => s.founderId === profile.id);

  // Compute calculated statistics
  const totalLikes = userIdeas.reduce((acc, curr) => acc + (curr.likes || 0), 0);
  const totalSuggestions = userSuggestions.length;
  const publicIdeasCount = userIdeas.length;
  const draftIdeasCount = userIdeas.filter(i => i.status === 'draft').length;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    
    // Simulate save without Supabase
    setTimeout(() => {
      onUpdateProfile({
        ...profile,
        name: editName,
        bio: editBio,
        buildingDesc: editBuildingDesc,
        avatar: editAvatar,
        startupLogo: editStartupLogo,
        githubUrl: editGithub,
        twitterUrl: editTwitter,
        linkedinUrl: editLinkedin,
        instagramUrl: editInstagram,
        facebookUrl: editFacebook,
        userRole: editRole
      });
      setIsSavingProfile(false);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 2000);
    }, 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="dashboard-main-view">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 select-none bg-white p-8 rounded-[2.5rem] border border-[#E2E8F0] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all group" id="dashboard-header-block">
        <div className="flex items-center space-x-6">
          <div className="flex -space-x-4 items-center">
            <div className="relative group/avatar">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-2xl shrink-0 z-10 relative group-hover/avatar:scale-105 transition-transform">
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
            {profile.startupLogo && (
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-2xl shrink-0 z-0 relative bg-slate-50 flex items-center justify-center p-2 group-hover:translate-x-2 transition-transform">
                <img src={profile.startupLogo} alt="Startup Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h1 className="font-display font-black text-3xl text-[#0F172A] tracking-tighter flex items-center space-x-3" dir="auto">
              <span>{profile.name}&apos;s Founder Hub</span>
            </h1>
            <p className="text-sm font-bold text-[#334155] max-w-lg leading-relaxed" dir="auto">
              {profile.bio || 'Manage ideas, screen co-founders pitches, and check fundraising letters.'}
            </p>
          </div>
        </div>

        <button
          id="dashboard-new-idea"
          onClick={onAddIdeaClick}
          className="inline-flex items-center justify-center space-x-2.5 px-8 py-4 bg-[#020617] text-white rounded-2xl font-black text-sm shadow-xl hover:bg-[#0F172A] transition-all active:scale-95 cursor-pointer self-start md:self-auto border-0"
        >
          <Plus className="h-5 w-5" />
          <span>Launch New Idea</span>
        </button>
      </div>

      {/* Dashboard Sub-navigation Tabs */}
      <div className="sticky top-[64px] z-30 bg-white dark:bg-slate-950 border-b-2 border-slate-200 dark:border-slate-800 overflow-x-auto select-none no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-10 shadow-sm" id="dashboard-tabs">
        <div className="flex max-w-7xl mx-auto py-5 items-center gap-2.5">
          {[
            { id: 'overview', label: 'Overview Statistics', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
            { id: 'ideas', label: `My Ideas (${userIdeas.length})`, icon: <Lightbulb className="w-3.5 h-3.5" /> },
            { id: 'profile', label: 'My Profile', icon: <UserCheck className="w-3.5 h-3.5" /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-db-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer whitespace-nowrap border-2 ${
                  isActive 
                    ? 'bg-slate-950 border-slate-950 text-white shadow-lg shadow-slate-950/20 dark:bg-white dark:border-white dark:text-slate-950 dark:shadow-white/10' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-950 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white'
                }`}
              >
                <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110 opacity-70'}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="tab-pill"
                    className="absolute inset-0 bg-slate-950 dark:bg-white rounded-xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER ACTIVE TAB BODY */}
      <div className="min-h-[400px]">
        {/* 1. OVERVIEW STATISTICS PANEL */}
        <div className={activeTab === 'overview' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'} id="overview-tab-content">
          <div className="space-y-12">
            {/* Main Idea Management Stats Header Banner */}
            <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-3xl select-none shadow-md" id="founderhub-ideas-update">
              <span className="block text-[11px] font-black font-mono uppercase tracking-widest text-slate-600 dark:text-slate-400 mb-2">FOUNDER HUB — IDEA MANAGEMENT SYSTEM</span>
              <h3 className="font-display font-black text-2xl text-slate-950 dark:text-white tracking-tight">Secure Idea Inventory Summary</h3>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-2">Check your visibility coverage, private drafts, and public campaign matrices instantly without page refresh.</p>
            </div>

          {/* Row 1: Idea visibility dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="idea-visibility-deck">
            
            {/* Total Ideas */}
            <div 
              onClick={() => { setActiveTab('ideas'); setIdeasSubFilter('all'); }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] flex flex-col justify-between cursor-pointer hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-xl transition-all select-none group"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-6">
                <span className="text-[10px] font-black font-mono uppercase tracking-widest">Total Ideas</span>
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 group-hover:scale-110 transition-transform shadow-sm">
                  <Lightbulb className="h-5 w-5" />
                </div>
              </div>
              <div>
                <span className="text-4xl font-black font-display text-slate-950 dark:text-white block tracking-tighter">{userIdeas.length}</span>
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 mt-1 block uppercase tracking-tight">Idea Inventory</span>
              </div>
            </div>

            {/* Public Ideas */}
            <div 
              onClick={() => { setActiveTab('ideas'); setIdeasSubFilter('public'); }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] flex flex-col justify-between cursor-pointer hover:border-emerald-600 dark:hover:border-emerald-500 hover:shadow-xl transition-all select-none group"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-6">
                <span className="text-[10px] font-black font-mono uppercase tracking-widest">Public Live</span>
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-sm">
                  <Globe className="h-5 w-5" />
                </div>
              </div>
              <div>
                <span className="text-4xl font-black font-display text-emerald-700 dark:text-emerald-400 block tracking-tighter">{publicIdeasCount}</span>
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 mt-1 block uppercase tracking-tight">Active Ideas</span>
              </div>
            </div>

            {/* Draft Ideas */}
            <div 
              onClick={() => { setActiveTab('ideas'); setIdeasSubFilter('draft'); }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] flex flex-col justify-between cursor-pointer hover:border-indigo-600 dark:hover:border-indigo-500 hover:shadow-xl transition-all select-none group"
            >
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-6">
                <span className="text-[10px] font-black font-mono uppercase tracking-widest">In Progress</span>
                <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-sm">
                  <Clipboard className="h-5 w-5" />
                </div>
              </div>
              <div>
                <span className="text-4xl font-black font-display text-indigo-700 dark:text-indigo-400 block tracking-tighter">
                  {draftIdeasCount}
                </span>
                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 mt-1 block uppercase tracking-tight">Building Stage</span>
              </div>
            </div>

          </div>

          {/* Peer Engagement statistics */}
          <div className="border-t-2 border-slate-100 dark:border-slate-900 pt-10" id="peer-engagement-row">
            <span className="block text-[11px] font-black font-mono tracking-widest uppercase text-slate-600 dark:text-slate-400 mb-6 select-none">Peer Interest & Feed Engagement</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="engagement-stats-deck">
              
              <div 
                onClick={() => setActiveTab('collabs')}
                className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] flex flex-col justify-between cursor-pointer hover:border-emerald-600 dark:hover:border-emerald-500 hover:shadow-xl transition-all select-none group"
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-4">
                  <span className="text-[10px] font-black font-mono uppercase tracking-widest">Partners</span>
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <span className="text-3xl font-black font-display text-slate-950 dark:text-white block tracking-tighter">{userCollabs.length}</span>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight">Active pitches</span>
              </div>

              <div 
                onClick={() => setActiveTab('funding')}
                className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] flex flex-col justify-between cursor-pointer hover:border-orange-600 dark:hover:border-orange-500 hover:shadow-xl transition-all select-none group"
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-4">
                  <span className="text-[10px] font-black font-mono uppercase tracking-widest">Funders</span>
                  <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 shadow-sm group-hover:scale-110 transition-transform">
                    <CircleDollarSign className="h-5 w-5" />
                  </div>
                </div>
                <span className="text-3xl font-black font-display text-slate-950 dark:text-white block tracking-tighter">{userFundings.length}</span>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight">Inquiries</span>
              </div>

              <div 
                onClick={() => { setActiveTab('ideas'); setIdeasSubFilter('all'); }}
                className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] flex flex-col justify-between cursor-pointer hover:border-red-600 dark:hover:border-red-500 hover:shadow-xl transition-all select-none group"
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-4">
                  <span className="text-[10px] font-black font-mono uppercase tracking-widest">Support</span>
                  <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 shadow-sm group-hover:scale-110 transition-transform">
                    <Heart className="h-5 w-5" />
                  </div>
                </div>
                <span className="text-3xl font-black font-display text-slate-950 dark:text-white block tracking-tighter">{totalLikes}</span>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight">Total upvotes</span>
              </div>

              <div 
                onClick={() => setActiveTab('suggestions')}
                className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] flex flex-col justify-between cursor-pointer hover:border-purple-600 dark:hover:border-purple-500 hover:shadow-xl transition-all select-none group"
              >
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-4">
                  <span className="text-[10px] font-black font-mono uppercase tracking-widest">Feedback</span>
                  <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 shadow-sm group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                </div>
                <span className="text-3xl font-black font-display text-slate-950 dark:text-white block tracking-tighter">{totalSuggestions}</span>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight">Constructive</span>
              </div>

            </div>
          </div>

          {/* Quick Info Alerts block */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-lower-overview">
            
            {/* Recent Inbox Summary */}
            <div className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl select-none shadow-sm">
              <h2 className="font-display font-black text-sm text-slate-950 dark:text-white border-b-2 border-slate-100 dark:border-slate-800 pb-3 mb-4 uppercase tracking-tight">Inbox Snapshots</h2>
              <div className="space-y-3.5">
                {userCollabs.length === 0 && userFundings.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center leading-relaxed font-bold">
                    No active requests. Make your ideas public and detailed to attract collaborators!
                  </p>
                ) : (
                  <>
                    {userCollabs.slice(0, 2).map(c => (
                      <div key={c.id} className="flex justify-between items-center text-xs p-3.5 border-2 border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
                        <div className="flex items-center gap-3">
                          <StatusBadge status={c.status} />
                          <div>
                            <span className="font-black text-slate-950 dark:text-white">{c.name}</span>
                            <span className="text-slate-600 dark:text-slate-400 ml-1">proposes to join</span>
                            <span className="font-black text-blue-700 dark:text-blue-400 ml-1 italic">“{c.ideaName}”</span>
                          </div>
                        </div>
                        <button onClick={() => setActiveTab('collabs')} className="text-blue-700 dark:text-blue-400 font-black hover:underline cursor-pointer">View</button>
                      </div>
                    ))}
                    {userFundings.slice(0, 2).map(f => (
                      <div key={f.id} className="flex justify-between items-center text-xs p-3.5 border-2 border-amber-100 dark:border-amber-900/40 rounded-xl bg-amber-50 dark:bg-amber-950/20">
                        <div className="flex items-center gap-3">
                          <StatusBadge status={f.status} />
                          <div>
                            <span className="font-black text-slate-950 dark:text-white">{f.name}</span>
                            <span className="text-slate-600 dark:text-slate-400 ml-1">submitted funding for</span>
                            <span className="font-black text-blue-700 dark:text-blue-400 ml-1 italic">“{f.ideaName}”</span>
                          </div>
                        </div>
                        <button onClick={() => setActiveTab('funding')} className="text-blue-700 dark:text-blue-400 font-black hover:underline cursor-pointer">View</button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Quick Profile Snapshot */}
            <div className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <h2 className="font-display font-black text-sm text-slate-950 dark:text-white pb-3 border-b-2 border-slate-100 dark:border-slate-800 select-none uppercase tracking-tight">Creator Card Verified</h2>
                <div className="flex flex-wrap gap-1.5 mt-4" id="verified-skills-preview">
                  {profile.skills.map(s => (
                    <span key={s} className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-xs mt-3 leading-relaxed font-bold">
                  Before publishing future ideas, maintaining an active founder biography helps collaborators match with you based on matching engineering, design, or business skills.
                </p>
              </div>
              <button
                id="edit-profile-overview-btn"
                onClick={() => setActiveTab('profile')}
                className="mt-4 text-xs font-black text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 self-start cursor-pointer hover:underline uppercase tracking-tight"
              >
                Configure credentials / links →
              </button>
            </div>

          </div>
        </div>
      </div>

        {/* 2. MY IDEAS GRID */}
        <div className={activeTab === 'ideas' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'} id="ideas-tab-content">
          <div className="space-y-12">
            
            {/* Public Ideas Section */}
            <section id="public-ideas-section">
              <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <Globe className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="font-display font-black text-xl text-slate-900 dark:text-white uppercase tracking-tight">
                    Published Ideas ({publicIdeasCount})
                  </h3>
                </div>
              </div>

              {userIdeas.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">No public ideas yet. Publish your vision to the world!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="public-ideas-grid">
                  {userIdeas.map(idea => (
                    <div
                      key={idea.id}
                      className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-[2rem] p-6 sm:p-8 transition-all shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] hover:shadow-2xl relative flex flex-col justify-between group overflow-hidden"
                      id={`own-idea-public-${idea.id}`}
                    >
                      <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-emerald-600 to-blue-600 opacity-60" />
                      
                      <div className="space-y-6">
                        {/* Header Action Badges and Date */}
                        <div className="flex justify-between items-center text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 select-none">
                          <span className="uppercase tracking-widest">Added {new Date(idea.createdAt).toLocaleDateString()}</span>
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-100 dark:border-emerald-900/50 uppercase tracking-widest">
                            <Globe className="h-3 w-3" />
                            <span>Live</span>
                          </span>
                        </div>

                        <div className="flex items-start space-x-4 select-none">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl shadow-sm group-hover:scale-105 transition-transform shrink-0">
                            {idea.logo}
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <h4 className="font-display font-black text-slate-950 dark:text-white group-hover:text-blue-600 text-lg truncate tracking-tight uppercase" dir="auto">{idea.name}</h4>
                            <div className="flex flex-wrap gap-2">
                              <span className="inline-block px-2 py-0.5 rounded-md text-[9px] bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider">{idea.category}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 text-xs font-bold leading-relaxed line-clamp-2 pr-2" dir="auto">
                          {idea.description}
                        </p>

                        {/* Idea Metrics Section */}
                        <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800/60 p-3 rounded-2xl text-center select-none font-mono text-[9px] font-black">
                          <div className="space-y-0.5">
                            <span className="block text-slate-400 uppercase tracking-tighter">Upvotes</span>
                            <span className="text-slate-900 dark:text-white text-[11px]">{(idea.likes || 0).toLocaleString()}</span>
                          </div>
                          <div className="space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800/60">
                            <span className="block text-slate-400 uppercase tracking-tighter">Feed</span>
                            <span className="text-slate-900 dark:text-white text-[11px]">{(idea.suggestionsCount || 0).toLocaleString()}</span>
                          </div>
                          <div className="space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800/60">
                            <span className="block text-slate-400 uppercase tracking-tighter">Team</span>
                            <span className="text-slate-900 dark:text-white text-[11px]">{(idea.collaborationCount || 0).toLocaleString()}</span>
                          </div>
                          <div className="space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800/60">
                            <span className="block text-slate-400 uppercase tracking-tighter">Views</span>
                            <span className="text-emerald-600 dark:text-emerald-400 text-[10px] truncate block">{(idea.viewsCount || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions footer wrapper */}
                      <div className="mt-6 pt-6 border-t-2 border-slate-50 dark:border-slate-800/60">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEditIdea?.(idea)}
                              className="p-2 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-400 hover:text-blue-600 transition-all cursor-pointer"
                              title="Edit Idea"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => { if (window.confirm(`Are you sure?`)) onDeleteIdea(idea.id); }}
                              className="p-2 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => onSelectIdea(idea)}
                            className="py-2.5 px-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 shadow-lg hover:shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                          >
                            <span>Open Deck</span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* 3. EDIT PROFILE CARD */}
        <div className={activeTab === 'profile' ? 'block animate-in fade-in slide-in-from-bottom-2 duration-300' : 'hidden'} id="profile-tab-content">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-6 sm:p-8">
            <div className="mb-6 select-none border-b border-slate-50 dark:border-slate-800/40 pb-4">
              <h2 className="font-display font-semibold text-lg text-slate-905 dark:text-white">My Public Founder Credentials</h2>
              <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">
                Configure your credentials and networking biographies so founders are confident when interacting.
              </p>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-6">
              
              {/* Save success banner */}
              {profileSaveSuccess && (
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100/50 dark:border-emerald-800/50 rounded-2xl flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs" id="profile-save-success">
                  <Check className="h-4 w-4" />
                  <span>Founder Profile synchronized successfully!</span>
                </div>
              )}

              {/* Logo and Portrait upload previews */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
                <div className="flex items-center space-x-3.5 border border-slate-150/60 dark:border-slate-800/60 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/20 relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                    onChange={(e) => handleImageUpload(e, setEditAvatar)}
                  />
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs shrink-0 flex items-center justify-center">
                    {editAvatar ? (
                      <img src={editAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold">No Pic</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Founder Picture</span>
                    <span className="text-[9px] text-slate-450 dark:text-slate-500 font-medium">Click to upload avatar.</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3.5 border border-slate-150/60 dark:border-slate-800/60 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950/20 relative">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                    onChange={(e) => handleImageUpload(e, setEditStartupLogo)}
                  />
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs shrink-0 flex items-center justify-center">
                    {editStartupLogo ? (
                      <img src={editStartupLogo} alt="Startup Logo Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold">No Logo</span>
                    )}
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">Startup Logo</span>
                    <span className="text-[9px] text-slate-450 dark:text-slate-500 font-medium">Click to upload brand logo.</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 select-none">Platform Entry Role</label>
                  <div className="flex bg-slate-50 dark:bg-slate-950/40 p-1.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 max-w-sm">
                    <button
                      type="button"
                      onClick={() => setEditRole('founder_hub')}
                      className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all cursor-pointer ${
                        editRole === 'founder_hub' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      FOUNDER HUB
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditRole('vision_board')}
                      className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all cursor-pointer ${
                        editRole === 'vision_board' ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      VISION BOARD
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2 italic px-1">This determines your default destination after logging in.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 select-none">Founder Display Name</label>
                  <input
                    id="profile-name-input"
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    dir="auto"
                    className="w-full py-2 px-3 border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 select-none">What Are You Building?</label>
                <textarea
                  id="profile-building-desc-textarea"
                  rows={3}
                  required
                  value={editBuildingDesc}
                  onChange={(e) => setEditBuildingDesc(e.target.value)}
                  dir="auto"
                  placeholder="Describe your current project..."
                  className="w-full py-2 px-3 border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 select-none">Short Founder Biography</label>
                <textarea
                  id="profile-bio-textarea"
                  rows={3}
                  required
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  dir="auto"
                  className="w-full py-2 px-3 border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 resize-none"
                />
              </div>

              {/* Social credentials handles */}
              <div className="border-t border-slate-50 dark:border-slate-800/40 pt-6 space-y-4">
                <h3 className="block text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">Networking Channels Profiles</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="profile-social-deck">
                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 select-none">Github URL</label>
                    <input
                      id="profile-github-input"
                      type="url"
                      value={editGithub}
                      onChange={(e) => setEditGithub(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full py-2 px-3 border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 select-none">Twitter (X) URL</label>
                    <input
                      id="profile-twitter-input"
                      type="url"
                      value={editTwitter}
                      onChange={(e) => setEditTwitter(e.target.value)}
                      placeholder="https://twitter.com/..."
                      className="w-full py-2 px-3 border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 select-none">LinkedIn URL</label>
                    <input
                      id="profile-linkedin-input"
                      type="url"
                      value={editLinkedin}
                      onChange={(e) => setEditLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full py-2 px-3 border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-100 dark:border-slate-800/40 pt-6 flex items-center justify-end select-none">
                <button
                  id="profile-save-btn"
                  type="submit"
                  disabled={isSavingProfile}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm flex items-center space-x-1.5"
                >
                  {isSavingProfile ? <span>Saving...</span> : <><Save className="h-4 w-4" /><span>Synchronize Profile Details</span></>}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
