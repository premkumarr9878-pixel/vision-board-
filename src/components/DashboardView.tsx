import React, { useState } from 'react';
import { LayoutDashboard, Users, CircleDollarSign, Plus, Lightbulb, Heart, MessageSquare, Clipboard, ExternalLink, RefreshCw, Check, Trash2, Edit3, Save, Eye, EyeOff, Lock, Globe } from 'lucide-react';
import { FounderProfile, StartupIdea, CollaborationRequest, FundingRequest, Suggestion } from '../types';

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
  onToggleVisibility,
  onEditIdea
}: DashboardViewProps) {
  // Tabs inside Dashboard: Dashboard Overview / My Published Ideas / Inbox: Collaboration / Inbox: Funding / Edit Profile / Suggestions
  const [activeTab, setActiveTab] = useState<'overview' | 'ideas' | 'collabs' | 'funding' | 'profile' | 'suggestions'>('overview');
  const [ideasSubFilter, setIdeasSubFilter] = useState<'all' | 'public' | 'private' | 'draft'>('all');

  // Edit Profile States
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editBuildingDesc, setEditBuildingDesc] = useState(profile.buildingDesc || '');
  const [editAvatar, setEditAvatar] = useState(profile.avatar || '');
  const [editStartupLogo, setEditStartupLogo] = useState(profile.startupLogo || '');
  const [editGithub, setEditGithub] = useState(profile.github || '');
  const [editTwitter, setEditTwitter] = useState(profile.twitter || '');
  const [editLinkedin, setEditLinkedin] = useState(profile.linkedin || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

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
  const userCollabs = collabs.filter(c => userIdeasIds.includes(c.ideaId));
  const userFundings = fundings.filter(f => userIdeasIds.includes(f.ideaId));
  const userSuggestions = (suggestions || []).filter(s => userIdeasIds.includes(s.ideaId));

  // Compute calculated statistics
  const totalLikes = userIdeas.reduce((acc, curr) => acc + curr.likes, 0);
  const totalSuggestions = userSuggestions.length;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setTimeout(() => {
      onUpdateProfile({
        ...profile,
        name: editName,
        bio: editBio,
        buildingDesc: editBuildingDesc,
        avatar: editAvatar,
        startupLogo: editStartupLogo,
        github: editGithub,
        twitter: editTwitter,
        linkedin: editLinkedin
      });
      setIsSavingProfile(false);
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 2000);
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="dashboard-main-view">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 select-none" id="dashboard-header-block">
        <div className="flex items-center space-x-3.5">
          <div className="flex -space-x-3 items-center">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0 z-10 relative">
              <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            {profile.startupLogo && (
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 z-0 relative bg-slate-50 flex items-center justify-center p-1">
                <img src={profile.startupLogo} alt="Startup Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-gray-900 tracking-tight flex items-center space-x-2">
              <span>{profile.name}&apos;s Founder Hub</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 max-w-lg truncate leading-relaxed">
              {profile.bio || 'Manage ideas, screen co-founders pitches, and check fundraising letters.'}
            </p>
          </div>
        </div>

        <button
          id="dashboard-new-idea"
          onClick={onAddIdeaClick}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/10 cursor-pointer self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Launch New Idea</span>
        </button>
      </div>

      {/* Dashboard Sub-navigation Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto pb-0.5 mb-8 select-none no-scrollbar" id="dashboard-tabs">
        <button
          id="tab-db-overview"
          onClick={() => setActiveTab('overview')}
          className={`pb-3.5 px-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap mr-6 ${
            activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-900'
          }`}
        >
          Overview Statistics
        </button>
        <button
          id="tab-db-ideas"
          onClick={() => setActiveTab('ideas')}
          className={`pb-3.5 px-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap mr-6 ${
            activeTab === 'ideas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-900'
          }`}
        >
          My Ideas ({userIdeas.length})
        </button>
        <button
          id="tab-db-collabs"
          onClick={() => setActiveTab('collabs')}
          className={`pb-3.5 px-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap mr-6 ${
            activeTab === 'collabs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-900'
          }`}
        >
          Co-founder Pitches ({userCollabs.length})
        </button>
        <button
          id="tab-db-funding"
          onClick={() => setActiveTab('funding')}
          className={`pb-3.5 px-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap mr-6 ${
            activeTab === 'funding' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-900'
          }`}
        >
          Investor Inbox ({userFundings.length})
        </button>
        <button
          id="tab-db-suggestions"
          onClick={() => setActiveTab('suggestions')}
          className={`pb-3.5 px-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap mr-6 ${
            activeTab === 'suggestions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-900'
          }`}
        >
          Suggestions Received ({totalSuggestions})
        </button>
        <button
          id="tab-db-profile"
          onClick={() => setActiveTab('profile')}
          className={`pb-3.5 px-1.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap mr-6 ${
            activeTab === 'profile' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-900'
          }`}
        >
          My Profile Card
        </button>
      </div>

      {/* RENDER ACTIVE TAB BODY */}
      
      {/* 1. OVERVIEW STATISTICS PANEL */}
      {activeTab === 'overview' && (
        <div className="space-y-8" id="overview-tab-content">
          {/* Main Idea Management Stats Header Banner */}
          <div className="border bg-slate-50 border-slate-205 border-slate-200/60 p-5 rounded-2xl select-none" id="founderhub-ideas-update">
            <span className="block text-[11px] font-bold font-mono uppercase tracking-wider text-slate-400 mb-1.5">FOUNDER HUB — IDEA MANAGEMENT SYSTEM</span>
            <h3 className="font-display font-extrabold text-base text-gray-950">Secure Idea Inventory Summary</h3>
            <p className="text-xs text-slate-500 mt-1">Check your visibility coverage, private drafts, and public campaign matrices instantly without page refresh.</p>
          </div>

          {/* Row 1: Idea visibility dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="idea-visibility-deck">
            
            {/* Total Ideas */}
            <div 
              onClick={() => { setActiveTab('ideas'); setIdeasSubFilter('all'); }}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_2.5px_rgba(0,0,0,0.01)] flex flex-col justify-between cursor-pointer hover:border-blue-500 hover:ring-2 hover:ring-blue-100 transition-all duration-150 select-none"
            >
              <div className="flex items-center justify-between text-gray-400 mb-4">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider">Total Ideas</span>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-650">
                  <Lightbulb className="h-4 w-4" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-extrabold font-display text-gray-950 block">{userIdeas.length}</span>
                <span className="text-[10px] font-medium text-slate-400 mt-1 block">In your personal database</span>
              </div>
            </div>

            {/* Public Ideas */}
            <div 
              onClick={() => { setActiveTab('ideas'); setIdeasSubFilter('public'); }}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_2.5px_rgba(0,0,0,0.01)] flex flex-col justify-between cursor-pointer hover:border-emerald-500 hover:ring-2 hover:ring-emerald-100 transition-all duration-150 select-none"
            >
              <div className="flex items-center justify-between text-gray-400 mb-4">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider">Public Ideas</span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-650">
                  <Globe className="h-4 w-4" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-extrabold font-display text-emerald-600 block">{userIdeas.filter(i => i.isPublic).length}</span>
                <span className="text-[10px] font-medium text-slate-400 mt-1 block">Featured on the explore feed</span>
              </div>
            </div>

            {/* Private Ideas */}
            <div 
              onClick={() => { setActiveTab('ideas'); setIdeasSubFilter('private'); }}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_2.5px_rgba(0,0,0,0.01)] flex flex-col justify-between cursor-pointer hover:border-amber-500 hover:ring-2 hover:ring-amber-100 transition-all duration-150 select-none"
            >
              <div className="flex items-center justify-between text-gray-400 mb-4">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider">Private Ideas</span>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-655">
                  <Lock className="h-4 w-4" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-extrabold font-display text-amber-600 block">{userIdeas.filter(i => !i.isPublic).length}</span>
                <span className="text-[10px] font-medium text-slate-400 mt-1 block">Hidden safely as personal drafts</span>
              </div>
            </div>

            {/* Draft Ideas (optional) */}
            <div 
              onClick={() => { setActiveTab('ideas'); setIdeasSubFilter('draft'); }}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_2.5px_rgba(0,0,0,0.01)] flex flex-col justify-between cursor-pointer hover:border-indigo-500 hover:ring-2 hover:ring-indigo-100 transition-all duration-150 select-none"
            >
              <div className="flex items-center justify-between text-gray-400 mb-4">
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider">Draft Ideas</span>
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650">
                  <Clipboard className="h-4 w-4" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-extrabold font-display text-indigo-600 block">
                  {userIdeas.filter(i => i.progressStage === 'JUST IDEA NOW' || i.progressStage === 'IDEATION').length}
                </span>
                <span className="text-[10px] font-medium text-slate-400 mt-1 block">Under ideation stages</span>
              </div>
            </div>

          </div>

          {/* Peer Engagement statistics */}
          <div className="border-t border-slate-100 pt-3" id="peer-engagement-row">
            <span className="block text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400 mb-3 select-none">Peer Interest & Feed Engagement</span>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="engagement-stats-deck">
              
              <div 
                onClick={() => setActiveTab('collabs')}
                className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-500 hover:ring-2 hover:ring-emerald-50 transition-all duration-150 select-none"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2.5">
                  <span className="text-[9px] font-bold font-mono uppercase tracking-wider">Partners Pitching</span>
                  <Users className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-2xl font-extrabold font-display text-slate-900 block">{userCollabs.length}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Active vetting requests</span>
              </div>

              <div 
                onClick={() => setActiveTab('funding')}
                className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-500 hover:ring-2 hover:ring-amber-50 transition-all duration-150 select-none"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2.5">
                  <span className="text-[9px] font-bold font-mono uppercase tracking-wider">Funders Inbox</span>
                  <CircleDollarSign className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-2xl font-extrabold font-display text-slate-900 block">{userFundings.length}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Inquiries from investors</span>
              </div>

              <div 
                onClick={() => { setActiveTab('ideas'); setIdeasSubFilter('all'); }}
                className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex flex-col justify-between cursor-pointer hover:border-red-500 hover:ring-2 hover:ring-red-50 transition-all duration-150 select-none"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2.5">
                  <span className="text-[9px] font-bold font-mono uppercase tracking-wider">Net Upvotes</span>
                  <Heart className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-2xl font-extrabold font-display text-slate-900 block">{totalLikes}</span>
                <span className="text-[9px] text-slate-400 mt-0.5 font-sans font-medium">Aggregate idea likes</span>
              </div>

              <div 
                onClick={() => setActiveTab('suggestions')}
                className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex flex-col justify-between cursor-pointer hover:border-purple-500 hover:ring-2 hover:ring-purple-50 transition-all duration-155 select-none"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2.5">
                  <span className="text-[9px] font-bold font-mono uppercase tracking-wider">Suggestions Recieved</span>
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-2xl font-extrabold font-display text-slate-900 block">{totalSuggestions}</span>
                <span className="text-[9px] text-slate-400 mt-0.5 font-sans font-medium font-semibold">Constructive peer feedback</span>
              </div>

            </div>
          </div>

          {/* Quick Info Alerts block */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-lower-overview">
            
            {/* Recent Inbox Summary */}
            <div className="p-6 border border-gray-200/60 rounded-2xl bg-white select-none">
              <h2 className="font-display font-semibold text-sm text-gray-900 border-b border-gray-50 pb-3 mb-4">Inbox Snapshots</h2>
              <div className="space-y-3.5">
                {userCollabs.length === 0 && userFundings.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center leading-relaxed">
                    No active requests. Make your ideas public and detailed to attract collaborators!
                  </p>
                ) : (
                  <>
                    {userCollabs.slice(0, 2).map(c => (
                      <div key={c.id} className="flex justify-between items-center text-xs p-3.5 border border-zinc-100 rounded-xl bg-zinc-50/50">
                        <div>
                          <span className="font-bold text-gray-905">{c.name}</span>
                          <span className="text-gray-450 ml-1">proposes to join</span>
                          <span className="font-semibold text-blue-650 ml-1 italic">“{c.ideaName}”</span>
                        </div>
                        <button onClick={() => setActiveTab('collabs')} className="text-blue-600 font-bold hover:underline">View</button>
                      </div>
                    ))}
                    {userFundings.slice(0, 2).map(f => (
                      <div key={f.id} className="flex justify-between items-center text-xs p-3.5 border border-amber-100 rounded-xl bg-amber-50/20">
                        <div>
                          <span className="font-bold text-gray-905">{f.name}</span>
                          <span className="text-gray-450 ml-1">submitted funding for</span>
                          <span className="font-semibold text-blue-650 ml-1 italic">“{f.ideaName}”</span>
                        </div>
                        <button onClick={() => setActiveTab('funding')} className="text-blue-600 font-bold hover:underline">View</button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Quick Profile Snapshot */}
            <div className="p-6 border border-gray-200/60 rounded-2xl bg-gradient-to-br from-gray-50 to-white flex flex-col justify-between">
              <div>
                <h2 className="font-display font-semibold text-sm text-gray-900 pb-3 border-b border-gray-100 select-none">Creator Card Verified</h2>
                <div className="flex flex-wrap gap-1.5 mt-4" id="verified-skills-preview">
                  {profile.skills.map(s => (
                    <span key={s} className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50/60 text-blue-700 border border-blue-100/50">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-gray-500 text-xs mt-3 leading-relaxed">
                  Before publishing future ideas, maintaining an active founder biography helps collaborators match with you based on matching engineering, design, or business skills.
                </p>
              </div>
              <button
                id="edit-profile-overview-btn"
                onClick={() => setActiveTab('profile')}
                className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-750 self-start cursor-pointer hover:underline"
              >
                Configure credentials / links →
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. MY IDEAS GRID */}
      {activeTab === 'ideas' && (() => {
        const filteredUserIdeas = userIdeas.filter(idea => {
          if (ideasSubFilter === 'public') return idea.isPublic;
          if (ideasSubFilter === 'private') return !idea.isPublic;
          if (ideasSubFilter === 'draft') return idea.progressStage === 'JUST IDEA NOW' || idea.progressStage === 'IDEATION';
          return true;
        });

        return (
          <div id="ideas-tab-content" className="space-y-6">
            {userIdeas.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 select-none bg-slate-50 border border-slate-150 p-1.5 rounded-2xl max-w-2xl mb-6" id="ideas-sub-filter-row">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider px-3">Filter Ideas:</span>
                {[
                  { id: 'all', label: `All (${userIdeas.length})` },
                  { id: 'public', label: `Public (${userIdeas.filter(i => i.isPublic).length})` },
                  { id: 'private', label: `Private (${userIdeas.filter(i => !i.isPublic).length})` },
                  { id: 'draft', label: `Ideation (${userIdeas.filter(i => i.progressStage === 'JUST IDEA NOW' || i.progressStage === 'IDEATION').length})` }
                ].map(pill => (
                  <button
                    key={pill.id}
                    onClick={() => setIdeasSubFilter(pill.id as any)}
                    className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      ideasSubFilter === pill.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-650 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            )}

            {filteredUserIdeas.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center select-none" id="my-ideas-empty">
                <Lightbulb className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                <h3 className="font-display font-bold text-base text-gray-950">
                  {userIdeas.length === 0 
                    ? "You haven't added any startup ideas yet" 
                    : "No ideas match this category"}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  {userIdeas.length === 0 
                    ? "Publish a modern rectangular startup idea card to gather comments, collaboration offers, and funding views!"
                    : "Try checking a different filter category above to view your ideas."}
                </p>
                {userIdeas.length === 0 && (
                  <button
                    id="empty-state-publish-btn"
                    onClick={onAddIdeaClick}
                    className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm select-none"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Launch First Concept</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up" id="ideas-tab-grid">
                {filteredUserIdeas.map(idea => (
                  <div
                    key={idea.id}
                    className="bg-white border border-gray-200/70 hover:border-blue-400/80 rounded-2xl p-6 transition-all shadow-[0_1.5px_4px_rgba(0,0,0,0.015)] hover:shadow-md relative flex flex-col justify-between group overflow-hidden"
                    id={`own-idea-${idea.id}`}
                  >
                    <div className="absolute top-0 right-0 h-1.5 w-full bg-slate-205 bg-gradient-to-r from-slate-200 to-slate-100" />
                    
                    <div>
                      {/* Header Action Badges and Date */}
                      <div className="flex justify-between items-center mb-4 text-[10px] font-mono text-gray-400 select-none">
                        <span>PUBLISHED: {new Date(idea.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center space-x-1.5">
                          {idea.isPublic ? (
                            <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-150 font-bold">
                              <Globe className="h-2.5 w-2.5" />
                              <span>Public Pitch</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-150 font-bold">
                              <Lock className="h-2.5 w-2.5" />
                              <span>Private Draft</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start space-x-4 mb-4 select-none">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-center text-2xl shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                          {idea.logo}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-display font-black text-slate-900 group-hover:text-blue-600 text-sm truncate uppercase tracking-tight">{idea.name}</h4>
                          <div className="flex flex-wrap gap-1.5 mt-1 select-none">
                            <span className="inline-block px-2 py-0.5 rounded-md text-[9px] bg-slate-100 border border-slate-150 text-slate-700 font-bold uppercase tracking-wider">{idea.category}</span>
                            <span className="inline-block px-2 py-0.5 rounded-md text-[9px] bg-zinc-50 border border-zinc-150 text-zinc-650 font-semibold">{idea.progressStage}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-slate-650 text-xs leading-relaxed line-clamp-3 mb-5 pr-2">
                        {idea.description}
                      </p>

                      {/* Idea Metrics Section */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center select-none mb-5 font-mono text-[10px] font-bold">
                        <div className="p-1">
                          <span className="block text-[8px] text-slate-400 uppercase">Upvotes</span>
                          <span className="text-slate-700 text-xs">{idea.likes}</span>
                        </div>
                        <div className="p-1 border-l border-slate-200">
                          <span className="block text-[8px] text-slate-400 uppercase">Suggestions</span>
                          <span className="text-slate-705 text-xs">{idea.suggestionsCount}</span>
                        </div>
                        <div className="p-1 border-l border-slate-200">
                          <span className="block text-[8px] text-slate-400 uppercase">Partners</span>
                          <span className="text-slate-705 text-xs">{idea.collaborationCount}</span>
                        </div>
                        <div className="p-1 border-l border-slate-200">
                          <span className="block text-[8px] text-slate-400 uppercase">Funding goal</span>
                          <span className="text-emerald-650 text-[10px] leading-tight truncate block">{idea.fundingGoal || 'None'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions footer wrapper: 4 clean distinct buttons */}
                    <div className="border-t border-slate-100 pt-4" id={`own-idea-footer-${idea.id}`}>
                      <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-1.5 col-span-2 sm:col-span-1">
                          {/* Make Public/Private Toggle Button */}
                          <button
                            onClick={() => onToggleVisibility?.(idea.id)}
                            className={`inline-flex items-center justify-center space-x-1 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                              idea.isPublic 
                                ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800' 
                                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                            }`}
                            title={idea.isPublic ? "Switch visibility to Private Draft" : "Make pitch Public for everyone"}
                          >
                            {idea.isPublic ? (
                              <>
                                <Lock className="h-3 w-3 shrink-0" />
                                <span>Go Private</span>
                              </>
                            ) : (
                              <>
                                <Globe className="h-3 w-3 shrink-0" />
                                <span>Go Public</span>
                              </>
                            )}
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => onEditIdea?.(idea)}
                            className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                            title="Edit Startup Idea"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Edit</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to permanently delete “${idea.name}”?`)) {
                                onDeleteIdea(idea.id);
                              }
                            }}
                            className="inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-105 border border-red-200 text-red-600 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                            title="Remove Idea"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>

                        {/* View Full Idea detailing button */}
                        <button
                          onClick={() => onSelectIdea(idea)}
                          className="col-span-2 sm:col-span-1 py-1.5 px-3.5 bg-gray-950 hover:bg-gray-900 border border-gray-950 hover:border-gray-900 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 hover:shadow-xs transition-all cursor-pointer grow sm:grow-0"
                        >
                          <span>View Board</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* 3. CO-FOUNDER PITCHES INBOX */}
      {activeTab === 'collabs' && (
        <div className="space-y-4" id="collabs-tab-content">
          {userCollabs.length === 0 ? (
            <div className="bg-white border-0 rounded-2xl p-12 text-center select-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
              <Users className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <h3 className="font-display font-bold text-sm text-gray-950">Collaborator Inbox Empty</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                When people view your public ideas and click &ldquo;Request Collaboration&rdquo;, their details, skills pitch, and emails will instantly display here!
              </p>
            </div>
          ) : (
            <div className="space-y-4" id="collabs-tab-list">
              {userCollabs.map(c => (
                <div key={c.id} className="p-5 border border-gray-200/60 bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]" id={`collab-request-${c.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div>
                      <h4 className="font-display font-bold text-sm text-gray-950 flex items-center space-x-1.5 select-all">
                        <span>{c.name}</span>
                        <span className="text-[11px] text-gray-400 font-normal">proposes to join</span>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border font-semibold italic">“{c.ideaName}”</span>
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 select-none" id={`actions-collab-${c.id}`}>
                      <a href={`mailto:${c.email}`} className="px-3 py-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-all">
                        Gmail Contact
                      </a>
                      <a href={`tel:${c.phone}`} className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-all">
                        Call co-founder
                      </a>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl">
                    <span className="block text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider mb-1.5 select-none animate-pulse">Personal Pitch Letter</span>
                    <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">
                      {c.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. INVESTOR FUNDING INBOX */}
      {activeTab === 'funding' && (
        <div className="space-y-4" id="funding-tab-content">
          {userFundings.length === 0 ? (
            <div className="bg-white border-0 rounded-2xl p-12 text-center select-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
              <CircleDollarSign className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <h3 className="font-display font-bold text-sm text-gray-950">Investor inbox empty</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
                When tech investors, venture firms, or angels show interest in funding your projects, their profiles, proposals, and phone contacts will show here!
              </p>
            </div>
          ) : (
            <div className="space-y-4" id="funding-tab-list">
              {userFundings.map(f => (
                <div key={f.id} className="p-5 border border-amber-100 bg-amber-50/5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.01)]" id={`funding-request-${f.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <div>
                      <h4 className="font-display font-bold text-sm text-amber-950 flex items-center space-x-1.5 select-all">
                        <span>{f.name}</span>
                        <span className="text-[11px] text-amber-600 font-normal">submits funding alert for</span>
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg border font-semibold italic">“{f.ideaName}”</span>
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(f.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 select-none" id={`actions-funding-${f.id}`}>
                      <a href={`mailto:${f.email}`} className="px-3 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-all">
                        Email Investor
                      </a>
                      <a href={`tel:${f.phone}`} className="px-3 py-1.5 border border-amber-200 hover:bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold transition-all">
                        Call Investor
                      </a>
                    </div>
                  </div>

                  <div className="bg-amber-50/15 p-4 border border-amber-100/30 rounded-xl">
                    <span className="block text-[10px] font-mono text-amber-600 uppercase font-bold tracking-wider mb-1.5 select-none">Investment capacity proposal</span>
                    <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">
                      {f.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. EDIT PROFILE CARD */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-gray-200/65 rounded-2xl p-6 sm:p-8" id="profile-tab-content">
          <div className="mb-6 select-none border-b border-gray-50 pb-4">
            <h2 className="font-display font-semibold text-lg text-gray-905">My Public Founder Credentials</h2>
            <p className="text-xs text-gray-450 mt-1">
              Configure your credentials and networking biographies so founders are confident when interacting.
            </p>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-6">
            
            {/* Save success banner */}
            {profileSaveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center space-x-2 text-emerald-600 text-xs" id="profile-save-success">
                <Check className="h-4 w-4" />
                <span>Founder Profile synchronized successfully in local storage session!</span>
              </div>
            )}

            {/* Logo and Portrait upload previews side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
              <div className="flex items-center space-x-3.5 border border-gray-150 rounded-xl p-3 bg-slate-50 relative">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                  onChange={(e) => handleImageUpload(e, setEditAvatar)}
                />
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-250 bg-white shadow-xs shrink-0 flex items-center justify-center">
                  {editAvatar ? (
                    <img src={editAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-400 font-bold">No Pic</span>
                  )}
                </div>
                <div>
                  <span className="block text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Founder Picture</span>
                  <span className="text-[9px] text-gray-450 font-medium">Click to upload brand illustration image.</span>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 border border-gray-150 rounded-xl p-3 bg-slate-50 relative">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                  onChange={(e) => handleImageUpload(e, setEditStartupLogo)}
                />
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-250 bg-white shadow-xs shrink-0 flex items-center justify-center">
                  {editStartupLogo ? (
                    <img src={editStartupLogo} alt="Startup Logo Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-gray-450 font-bold">No Logo</span>
                  )}
                </div>
                <div>
                  <span className="block text-[10px] font-bold font-mono text-gray-500 uppercase tracking-wider">Startup brand Logo</span>
                  <span className="text-[9px] text-gray-450 font-medium">Click to upload company/brand icon.</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-2xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5 select-none">Founder Display Name</label>
                <input
                  id="profile-name-input"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full py-2 px-3 border border-gray-200 bg-white rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-2xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5 select-none font-bold text-gray-850 text-gray-900">What Are You Building?</label>
              <textarea
                id="profile-building-desc-textarea"
                rows={3}
                required
                value={editBuildingDesc}
                onChange={(e) => setEditBuildingDesc(e.target.value)}
                placeholder="Describe your current project, tech stack, and goals..."
                className="w-full py-2 px-3 border border-gray-200 bg-white rounded-xl text-xs placeholder-gray-450 focus:outline-none focus:ring-2 focus:ring-blue-500/10 resize-none"
              />
            </div>

            <div>
              <label className="block text-2xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5 select-none">Short Founder Biography</label>
              <textarea
                id="profile-bio-textarea"
                rows={3}
                required
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full py-2 px-3 border border-gray-200 bg-white rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 resize-none"
              />
            </div>

            {/* Social credentials handles */}
            <div className="border-t border-gray-50 pt-6 space-y-4">
              <h3 className="block text-2xs font-bold font-mono text-gray-400 uppercase tracking-wider select-none">Networking Channels Profiles</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="profile-social-deck">
                <div>
                  <label className="block text-[11px] text-gray-550 mb-1 select-none">Github Website URL</label>
                  <input
                    id="profile-github-input"
                    type="url"
                    value={editGithub}
                    onChange={(e) => setEditGithub(e.target.value)}
                    placeholder="https://github.com/alexrivera"
                    className="w-full py-2 px-3 border border-gray-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-550 mb-1 select-none">Twitter (X) Profile URL</label>
                  <input
                    id="profile-twitter-input"
                    type="url"
                    value={editTwitter}
                    onChange={(e) => setEditTwitter(e.target.value)}
                    placeholder="https://twitter.com/alexrivera"
                    className="w-full py-2 px-3 border border-gray-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-550 mb-1 select-none">LinkedIn Profile URL</label>
                  <input
                    id="profile-linkedin-input"
                    type="url"
                    value={editLinkedin}
                    onChange={(e) => setEditLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/alexrivera"
                    className="w-full py-2 px-3 border border-gray-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-100 pt-6 flex items-center justify-end select-none">
              <button
                id="profile-save-btn"
                type="submit"
                disabled={isSavingProfile}
                className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm flex items-center space-x-1.5"
              >
                {isSavingProfile ? (
                  <span>Saving bio changes...</span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Synchronize Profile Details</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* 6. SUGGESTIONS RECEIVED TAB */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4" id="suggestions-tab-content">
          <div className="border bg-slate-50 border-slate-205 border-slate-200/60 p-5 rounded-2xl select-none" id="suggestions-tab-header">
            <span className="block text-[11px] font-bold font-mono uppercase tracking-wider text-slate-400 mb-1.5">COLLABORATION FEEDS — SUGGESTIONS RECEIVED</span>
            <h3 className="font-display font-extrabold text-base text-gray-950">Peer Improvement Board</h3>
            <p className="text-xs text-slate-500 mt-1">Review constructive feedback, layout optimizations, and feature suggestions posted by modern builders on your public board pitches.</p>
          </div>

          {userSuggestions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center select-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
              <MessageSquare className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <h3 className="font-display font-bold text-sm text-gray-950">No Suggestions Received Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                When other founders or investors post constructive comments on your public ideas, they will instantly show up in this centralized board!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="suggestions-tab-grid">
              {userSuggestions.map(s => {
                const associatedIdea = ideas.find(i => i.id === s.ideaId);
                return (
                  <div key={s.id} className="p-5 border border-slate-200 bg-white rounded-2xl shadow-xs flex flex-col justify-between" id={`user-suggestion-${s.id}`}>
                    <div>
                      {/* Suggestion title and date */}
                      <div className="flex items-center justify-between gap-2 mb-3 select-none">
                        <div className="flex items-center space-x-2">
                          <img src={s.authorAvatar} alt={s.authorName} className="w-8 h-8 rounded-full border object-cover" referrerPolicy="no-referrer" />
                          <div>
                            <span className="block text-xs font-bold text-slate-800">{s.authorName}</span>
                            <span className="block text-[9px] text-slate-400">{new Date(s.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        {associatedIdea && (
                          <div className="text-right">
                            <span className="inline-block px-2.5 py-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 uppercase tracking-tight font-mono">
                              Idea: {associatedIdea.name}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Suggestion text */}
                      <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap bg-slate-50/55 p-3.5 rounded-xl border border-slate-100 mb-4 font-sans">
                        {s.content}
                      </p>
                    </div>

                    {/* View/Navigate to card */}
                    {associatedIdea && (
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 select-none text-[10px] font-mono">
                        <span className="text-slate-400 font-medium">Under {associatedIdea.category}</span>
                        <button
                          onClick={() => onSelectIdea(associatedIdea)}
                          className="inline-flex items-center space-x-1 font-bold text-blue-600 hover:text-blue-750 hover:underline cursor-pointer"
                        >
                          <span>View Board</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
