import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CategoryFilters from './components/CategoryFilters';
import IdeaCard from './components/IdeaCard';
import IdeaDetailsModal from './components/IdeaDetailsModal';
import AddIdeaModal from './components/AddIdeaModal';
import InterestModal from './components/InterestModal';
import AuthModal from './components/AuthModal';
import DashboardView from './components/DashboardView';
import LeaderboardTable from './components/LeaderboardTable';
import OnboardingView from './components/OnboardingView';
import { getLocalStorageState, saveLocalStorageState, DEFAULT_PROFILE } from './data';
import { StartupIdea, FounderProfile, CollaborationRequest, FundingRequest, Suggestion } from './types';
import { Star, Sparkles, Send, Flame, Lightbulb, Users, Globe, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Load state from localStorage on init
  const [state, setState] = useState(() => getLocalStorageState());
  const [currentUser, setCurrentUser] = useState<FounderProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    const sessionUser = localStorage.getItem('vb_auth_user');
    return sessionUser ? JSON.parse(sessionUser) : null;
  });
  const [currentView, setCurrentView] = useState<'explore' | 'dashboard' | 'onboarding'>('explore');
  const [onboardingSource, setOnboardingSource] = useState<'add-idea' | 'founder-hub' | null>(null);

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vb_theme');
      if (saved === 'dark' || saved === 'light') return saved as 'light' | 'dark';
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      localStorage.setItem('vb_theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Interactive Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'week' | 'month'>('all');

  // Active Modals overlay states
  const [selectedIdea, setSelectedIdea] = useState<StartupIdea | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddIdeaModal, setShowAddIdeaModal] = useState(false);
  const [ideaToEdit, setIdeaToEdit] = useState<StartupIdea | null>(null);
  const [authTriggeredByAddIdea, setAuthTriggeredByAddIdea] = useState(false);
  const [authDefaultIsSignUp, setAuthDefaultIsSignUp] = useState(false);
  const [authNoticeMessage, setAuthNoticeMessage] = useState<string | undefined>(undefined);
  
  // Expression of Interest states
  const [interestTargetType, setInterestTargetType] = useState<'collaboration' | 'funding' | null>(null);
  const [interestTargetIdea, setInterestTargetIdea] = useState<StartupIdea | null>(null);

  // Simple feedback alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Liked tracking (local list of user loved ideaIds to simulate session validation)
  const [likedIdeaIds, setLikedIdeaIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('vb_user_liked_ids');
    return saved ? JSON.parse(saved) : ['idea-1', 'idea-3']; // Seed with some pre-liked items
  });

  // Sync state changes to global LocalStorage
  useEffect(() => {
    saveLocalStorageState({
      ideas: state.ideas,
      profile: currentUser || DEFAULT_PROFILE,
      collaborations: state.collaborations,
      funding: state.funding,
      suggestions: state.suggestions
    });
  }, [state, currentUser]);

  // Sync liked idea ids
  useEffect(() => {
    localStorage.setItem('vb_user_liked_ids', JSON.stringify(likedIdeaIds));
  }, [likedIdeaIds]);

  // Sync current authenticated user session (Save user session after login)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentUser) {
        localStorage.setItem('vb_auth_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('vb_auth_user');
      }
    }
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auth synchronization handlers
  const handleAuthSuccess = (
    name: string,
    email: string,
    customBio?: string,
    buildingDesc?: string,
    avatar?: string,
    startupLogo?: string
  ) => {
    const defaultAvatar = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&q=80&w=150`;
    const freshProfile: FounderProfile = {
      id: `usr_${Date.now()}`,
      name,
      bio: customBio || `Tech enthusiast, product scale co-founder. Open to build & execute. Contact at: ${email}`,
      skills: ['TypeScript', 'Growth', 'Product Dev'],
      buildingDesc: buildingDesc || 'Product concept launching soon on VisionBoard. Stay tuned for further announcements!',
      avatar: avatar || defaultAvatar,
      startupLogo: startupLogo || undefined,
      github: 'https://github.com',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    };
    setCurrentUser(freshProfile);
    setState(prev => ({ ...prev, profile: freshProfile }));
    showToast(`Welcome builder, logged in as ${name}!`);

    if (authTriggeredByAddIdea) {
      setAuthTriggeredByAddIdea(false);
      setCurrentView('dashboard');
      setShowAddIdeaModal(true);
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleOnboardingComplete = (
    name: string,
    email: string,
    bio: string,
    buildingDesc: string,
    avatar?: string,
    startupLogo?: string
  ) => {
    const defaultAvatar = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?auto=format&fit=crop&q=80&w=150`;
    const freshProfile: FounderProfile = {
      id: `usr_${Date.now()}`,
      name,
      bio,
      skills: ['TypeScript', 'Growth', 'Product Dev'],
      buildingDesc,
      avatar: avatar || defaultAvatar,
      startupLogo: startupLogo || undefined,
      github: 'https://github.com',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    };
    setCurrentUser(freshProfile);
    setState(prev => ({ ...prev, profile: freshProfile }));
    showToast(`Welcome ${name}, your founder card is live!`);

    if (onboardingSource === 'add-idea') {
      setCurrentView('dashboard');
      setShowAddIdeaModal(true);
    } else {
      setCurrentView('dashboard');
    }
    setOnboardingSource(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('explore');
    showToast('Signed out of developer session safely.');
  };

  const handleProfileUpdate = (updated: FounderProfile) => {
    setCurrentUser(updated);
    setState(prev => ({ ...prev, profile: updated }));
    showToast('Founder Bio updated successfully!');
  };

  // Add startup idea handler
  const handleAddIdeaSubmit = (ideaData: Partial<StartupIdea>) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    if (ideaToEdit) {
      setState(prev => {
        const updatedIdeas = prev.ideas.map(idea => {
          if (idea.id === ideaToEdit.id) {
            return {
              ...idea,
              name: ideaData.name || 'Untitled Vision',
              logo: ideaData.logo || '🚀',
              banner: ideaData.banner,
              description: ideaData.description || '',
              whyThisWorks: ideaData.whyThisWorks || '',
              problemSolved: ideaData.problemSolved || '',
              targetAudience: ideaData.targetAudience || '',
              category: ideaData.category || 'AI',
              needCollaboration: ideaData.needCollaboration ?? true,
              maxCollaborators: ideaData.maxCollaborators,
              needFunding: ideaData.needFunding ?? false,
              fundingGoal: ideaData.fundingGoal,
              isPublic: ideaData.isPublic ?? true,
              instagramUrl: ideaData.instagramUrl || '',
              facebookUrl: ideaData.facebookUrl || '',
              websiteUrl: ideaData.websiteUrl || '',
              progressStage: ideaData.progressStage || 'IDEATION'
            };
          }
          return idea;
        });
        return { ...prev, ideas: updatedIdeas };
      });
      showToast(`Saved changes for “${ideaData.name}” successfully!`);
      setIdeaToEdit(null);
      return;
    }

    const newIdeaObj: StartupIdea = {
      id: `idea_${Date.now()}`,
      name: ideaData.name || 'Untitled Vision',
      logo: ideaData.logo || '🚀',
      banner: ideaData.banner,
      description: ideaData.description || '',
      whyThisWorks: ideaData.whyThisWorks || '',
      problemSolved: ideaData.problemSolved || '',
      targetAudience: ideaData.targetAudience || '',
      category: ideaData.category || 'AI',
      founderId: currentUser.id,
      founderName: currentUser.name,
      founderAvatar: currentUser.avatar,
      collaborationCount: 0,
      fundingInterestCount: 0,
      progressStage: ideaData.progressStage || 'IDEATION',
      likes: 1, // Author defaults with an endorsement like
      suggestionsCount: 0,
      needCollaboration: ideaData.needCollaboration ?? true,
      maxCollaborators: ideaData.maxCollaborators,
      needFunding: ideaData.needFunding ?? false,
      fundingGoal: ideaData.fundingGoal,
      isPublic: ideaData.isPublic ?? true,
      instagramUrl: ideaData.instagramUrl || '',
      facebookUrl: ideaData.facebookUrl || '',
      websiteUrl: ideaData.websiteUrl || '',
      createdAt: new Date().toISOString()
    };

    // Prepend new ideas
    setState(prev => ({
      ...prev,
      ideas: [newIdeaObj, ...prev.ideas]
    }));

    // Auto-like the new project
    setLikedIdeaIds(prev => [...prev, newIdeaObj.id]);
    showToast(`Published “${newIdeaObj.name}” to the global database!`);
  };

  // Deletion helper for owners
  const handleDeleteIdea = (id: string) => {
    setState(prev => ({
      ...prev,
      ideas: prev.ideas.filter(idea => idea.id !== id)
    }));
    showToast('Concept archived from dashboard database.');
  };

  // Toggle visibility helper for owners (Public / Private)
  const handleToggleIdeaVisibility = (id: string) => {
    setState(prev => {
      const updatedIdeas = prev.ideas.map(idea => {
        if (idea.id === id) {
          const nextIsPublic = !idea.isPublic;
          showToast(`“${idea.name}” is now ${nextIsPublic ? 'PUBLIC and featured on the live feed' : 'PRIVATE and hidden from other peers'}!`);
          return { ...idea, isPublic: nextIsPublic };
        }
        return idea;
      });
      return { ...prev, ideas: updatedIdeas };
    });
  };

  // Like endorsement toggle state mechanics
  const handleLikeToggle = (ideaId: string) => {
    const isLiked = likedIdeaIds.includes(ideaId);
    
    // Toggle user session list
    if (isLiked) {
      setLikedIdeaIds(prev => prev.filter(id => id !== ideaId));
      setState(prev => ({
        ...prev,
        ideas: prev.ideas.map(idea => idea.id === ideaId ? { ...idea, likes: Math.max(0, idea.likes - 1) } : idea)
      }));
    } else {
      setLikedIdeaIds(prev => [...prev, ideaId]);
      setState(prev => ({
        ...prev,
        ideas: prev.ideas.map(idea => idea.id === ideaId ? { ...idea, likes: idea.likes + 1 } : idea)
      }));
    }

    // Refresh selected modal reference to update state immediately
    if (selectedIdea && selectedIdea.id === ideaId) {
      setSelectedIdea(prev => {
        if (!prev) return null;
        return {
          ...prev,
          likes: isLiked ? Math.max(0, prev.likes - 1) : prev.likes + 1
        };
      });
    }
  };

  // Peer Suggestions Comment boards
  const handleAddSuggestion = (content: string, guestName?: string) => {
    if (!selectedIdea) return;

    let authorName = 'Anonymous Founder';
    let authorAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80';

    if (currentUser) {
      authorName = currentUser.name;
      authorAvatar = currentUser.avatar;
    } else if (guestName && guestName.trim()) {
      authorName = guestName.trim();
    }

    const brandSuggestion: Suggestion = {
      id: `sug_${Date.now()}`,
      ideaId: selectedIdea.id,
      authorName,
      authorAvatar,
      content,
      createdAt: new Date().toISOString(),
      likes: 0
    };

    setState(prev => ({
      ...prev,
      suggestions: [brandSuggestion, ...prev.suggestions],
      ideas: prev.ideas.map(idea => 
        idea.id === selectedIdea.id 
          ? { ...idea, suggestionsCount: (idea.suggestionsCount || 0) + 1 } 
          : idea
      )
    }));

    // Update the selectedIdea object to immediately show the updated count in the details modal
    setSelectedIdea(prev => {
      if (!prev) return null;
      return {
        ...prev,
        suggestionsCount: (prev.suggestionsCount || 0) + 1
      };
    });

    showToast('Constructive suggestion published successfully.');
  };

  // Expressions of interest submit handlers
  const handleInterestSubmit = (formData: { name: string; email: string; phone: string; message: string }) => {
    if (!interestTargetIdea || !interestTargetType) return;

    if (interestTargetType === 'collaboration') {
      const colRequest: CollaborationRequest = {
        id: `col_${Date.now()}`,
        ideaId: interestTargetIdea.id,
        ideaName: interestTargetIdea.name,
        founderId: interestTargetIdea.founderId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        createdAt: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        collaborations: [colRequest, ...prev.collaborations],
        ideas: prev.ideas.map(idea => 
          idea.id === interestTargetIdea.id 
            ? { ...idea, collaborationCount: idea.collaborationCount + 1 } 
            : idea
        )
      }));

      showToast(`Collaboration pitch sent directly to ${interestTargetIdea.founderName}!`);
    } else {
      const fundRequest: FundingRequest = {
        id: `fun_${Date.now()}`,
        ideaId: interestTargetIdea.id,
        ideaName: interestTargetIdea.name,
        founderId: interestTargetIdea.founderId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        createdAt: new Date().toISOString()
      };

      setState(prev => ({
        ...prev,
        funding: [fundRequest, ...prev.funding],
        ideas: prev.ideas.map(idea => 
          idea.id === interestTargetIdea.id 
            ? { ...idea, fundingInterestCount: idea.fundingInterestCount + 1 } 
            : idea
        )
      }));

      showToast(`Funding credentials sent directly to ${interestTargetIdea.founderName}!`);
    }

    setInterestTargetIdea(null);
    setInterestTargetType(null);
  };

  // Filter ideas logic: query search, category pills & timeFilter
  const filteredPublicIdeas = state.ideas.filter(idea => {
    if (!idea.isPublic) return false;
    
    const matchesSearch = 
      idea.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.problemSolved.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.targetAudience.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory ? (idea.category === selectedCategory) : true;

    // Filter by date intervals
    const ideaTime = new Date(idea.createdAt).getTime();
    const now = Date.now();
    let matchesTime = true;
    if (timeFilter === 'day') {
      matchesTime = now - ideaTime <= 24 * 60 * 60 * 1000;
    } else if (timeFilter === 'week') {
      matchesTime = now - ideaTime <= 7 * 24 * 60 * 60 * 1000;
    } else if (timeFilter === 'month') {
      matchesTime = now - ideaTime <= 30 * 24 * 60 * 60 * 1000;
    }

    return matchesSearch && matchesCategory && matchesTime;
  });

  // Segregate filtered lists into TrustMRR structured grid blocks
  // 1. Trending: Sorted by upvotes & collaborations count
  const trendingIdeas = [...filteredPublicIdeas]
    .sort((a, b) => (b.likes + b.collaborationCount * 2) - (a.likes + a.collaborationCount * 2))
    .slice(0, 3);

  // 2. Weekly Best: Ideas with scale stage, high interest rate
  const weeklyBestIdeas = [...filteredPublicIdeas]
    .filter(idea => idea.likes > 60 || idea.progressStage === 'SCALE' || idea.progressStage === 'PROTOTYPE')
    .slice(0, 3);

  // 3. Recently Listed: Chronologically sorted
  const recentlyListedIdeas = [...filteredPublicIdeas]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Active suggestions list addressed to the clicked idea details modal
  const activeSuggestions = state.suggestions.filter(s => selectedIdea && s.ideaId === selectedIdea.id);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#F9FAFB]/90 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-500/10 selection:text-blue-900 dark:selection:text-blue-200 transition-colors">
      {/* Premium ambient radial glows */}
      <div className="absolute top-0 left-[-10%] w-[500px] h-[500px] bg-blue-450/[0.04] dark:bg-blue-500/[0.02] rounded-full blur-[110px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-400/[0.04] dark:bg-purple-500/[0.02] rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] left-[20%] w-[350px] h-[350px] bg-cyan-400/[0.03] dark:bg-cyan-500/[0.01] rounded-full blur-[90px] pointer-events-none -z-10" />
      
      {/* HEADER SECTION (Sticky Search & Nav swaps) */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddIdeaClick={() => {
          if (!currentUser) {
            setOnboardingSource('add-idea');
            setCurrentView('onboarding');
          } else {
            setShowAddIdeaModal(true);
          }
        }}
        onDashboardClick={() => {
          if (!currentUser) {
            setOnboardingSource('founder-hub');
            setCurrentView('onboarding');
          } else {
            setCurrentView('dashboard');
          }
        }}
        onExploreClick={() => {
          setCurrentView('explore');
          setSelectedCategory(null);
          setSearchQuery('');
        }}
        onAuthClick={() => {
          setAuthTriggeredByAddIdea(false);
          setAuthDefaultIsSignUp(false);
          setAuthNoticeMessage(undefined);
          setShowAuthModal(true);
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        currentView={currentView}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* BODY ROUTER */}
      <main className="flex-1">
        
        {currentView === 'explore' ? (
          
          /* EXPLORE HOMEPAGE DECK (TrustMRR spacing style) */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12" id="explore-view">
            
            {/* Geometric Centered Headline Callout */}
            <div className="text-center max-w-3xl mx-auto space-y-4 select-none mb-6 pt-4" id="hero-centered-headline">
              {/* Optional verification alert */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-blue-500/5 dark:bg-blue-400/10 text-blue-650 dark:text-blue-450 text-[10px] font-bold font-mono uppercase tracking-wider rounded-full border border-blue-500/15 shadow-2xs">
                <Sparkles className="h-3 w-3 text-blue-500 shrink-0 fill-current animate-pulse" />
                <span>Sandbox Version 2.0 Live</span>
              </div>
              
              <h2 className="font-display font-extrabold text-4xl sm:text-5xl md:text-[52px] text-slate-950 dark:text-white tracking-tight leading-[1.1] md:leading-[1.05]" id="main-visionboard-headline">
                The database of <span className="bg-gradient-to-r from-blue-600 via-indigo-550 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">future startup ideas</span>
              </h2>
              
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium leading-relaxed">
                Publish ideas, find collaborators, attract funding, and build your startup validation boards alongside a network of peers.
              </p>

              {/* Home Add Idea trigger and Search Bar alignment */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-md mx-auto pt-4">
                <button
                  id="add-idea-hero-btn"
                  onClick={() => {
                    if (!currentUser) {
                      setOnboardingSource('add-idea');
                      setCurrentView('onboarding');
                    } else {
                      setShowAddIdeaModal(true);
                    }
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl hover:scale-[1.03] active:scale-[0.98] transition-all select-none cursor-pointer text-center duration-200 shadow-[0_4px_16px_rgba(59,130,246,0.22)] dark:shadow-[0_4px_16px_rgba(59,130,246,0.12)]"
                >
                  + Add Your Startup Idea
                </button>
              </div>
            </div>

             {/* Dynamic Idea Metrics Showcase & Date Filters */}
            <div className="max-w-4xl mx-auto select-none pt-2 flex flex-col md:flex-row items-stretch justify-center gap-4" id="dynamics-metrics">
              {/* Total Ideas Card */}
              <div className="bg-white/80 dark:bg-slate-900/65 backdrop-blur-md border border-slate-200/60 download-glass dark:border-slate-800/80 p-6 rounded-2xl text-center shadow-[0_4px_18px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.03)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-all duration-300 hover:-translate-y-1 flex-1 flex flex-col justify-center">
                <span className="block text-[10px] font-bold font-mono text-slate-450 dark:text-slate-500 uppercase tracking-widest">Total Ideas Shared</span>
                <span className="block text-4xl font-extrabold bg-gradient-to-r from-blue-650 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mt-1">
                  {(state.ideas.length + 1245).toLocaleString()}
                </span>
                <span className="block text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-mono">UPDATED DYNAMICALLY</span>
              </div>

              {/* Day filter tabs card side-by-side */}
              <div className="bg-white/80 dark:bg-slate-900/65 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-2xl shadow-[0_4px_18px_rgba(0,0,0,0.015)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.03)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-all duration-300 hover:-translate-y-1 flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <span className="block text-[10px] font-bold font-mono text-slate-455 dark:text-slate-500 uppercase tracking-widest text-center md:text-left">
                    Filter by release day
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-11/12 gap-2 mt-3" id="days-filter-tabs">
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'day', label: 'Today' },
                    { id: 'week', label: 'Weekly' },
                    { id: 'month', label: 'Monthly' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setTimeFilter(tab.id as 'all' | 'day' | 'week' | 'month');
                        showToast(`Filtered feed: ${tab.label}`);
                      }}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-150 cursor-pointer ${
                        timeFilter === tab.id
                          ? 'bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 border-slate-950 dark:border-slate-100 shadow-sm'
                          : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-705 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <span className="block text-[9px] text-slate-400 dark:text-slate-500 mt-2.5 font-mono text-center md:text-left">
                  {timeFilter === 'all' && "SHOWING ALL IDEAS"}
                  {timeFilter === 'day' && "SHARED IN THE LAST 24 HOURS"}
                  {timeFilter === 'week' && "SHARED IN THE LAST 7 DAYS"}
                  {timeFilter === 'month' && "SHARED IN THE LAST 30 DAYS"}
                </span>
              </div>
            </div>

            {/* Category selection tab caps */}
            <div className="border-t border-b border-slate-200 py-4 font-sans" id="filters-cap-row">
              <span className="block text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest text-center select-none mb-3">
                Designated Categories
              </span>
              <CategoryFilters
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

            {/* MAIN GRIDS Row-by-Row matching TrustMRR Card Rows */}
            <div className="space-y-12" id="card-feed-sections">
              
              {/* SECTION 1: Trending Ideas Section (APPEARS FIRST) */}
              <section id="trending-section" className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 select-none">
                  <div className="flex items-center space-x-2">
                    <Flame className="h-4 w-4 text-emerald-500 shrink-0 animate-pulse" />
                    <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-slate-400">Trending ideas</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-100 border border-slate-200/50 rounded px-2.5 py-0.5">PEER VALIDATED</span>
                </div>

                {trendingIdeas.length === 0 ? (
                  <p className="text-xs text-gray-400 italic bg-gray-50 border border-gray-100 p-6 rounded-2xl">
                    No trending ideas match the active query.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="trending-grid">
                    {trendingIdeas.map(idea => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        onCardClick={() => setSelectedIdea(idea)}
                        onLikeClick={() => handleLikeToggle(idea.id)}
                        isLikedByUser={likedIdeaIds.includes(idea.id)}
                        rowStyle="trending"
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* SECTION 2: Recently Added Ideas */}
              <section id="recently-added-section" className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 select-none">
                  <div className="flex items-center space-x-2">
                    <Lightbulb className="h-4 w-4 text-blue-500 shrink-0" />
                    <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-slate-400">Recently listed ideas</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-100 border border-slate-200/50 rounded px-2.5 py-0.5">LIVE STREAM</span>
                </div>

                {recentlyListedIdeas.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-white border border-slate-200 p-6 rounded-xl text-center">
                    No recently added ideas found in this tag category.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="recently-listed-grid">
                    {recentlyListedIdeas.map(idea => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        onCardClick={() => setSelectedIdea(idea)}
                        onLikeClick={() => handleLikeToggle(idea.id)}
                        isLikedByUser={likedIdeaIds.includes(idea.id)}
                        rowStyle="recent"
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* SECTION 3: Best Ideas This Week */}
              <section id="best-ideas-weekly-section" className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 select-none">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-purple-500 shrink-0 fill-current" />
                    <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-slate-400">Best ideas this week</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-100 border border-slate-200/50 rounded px-2.5 py-0.5">GOLD VALIDATED</span>
                </div>

                {weeklyBestIdeas.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-white border border-slate-200 p-6 rounded-xl text-center">
                    No validated weekly best items filtered.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="weekly-best-grid">
                    {weeklyBestIdeas.map(idea => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        onCardClick={() => setSelectedIdea(idea)}
                        onLikeClick={() => handleLikeToggle(idea.id)}
                        isLikedByUser={likedIdeaIds.includes(idea.id)}
                        rowStyle="weekly"
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* SECTION 4: Founder Leaderboard (below rows, clean modern table UI) */}
              <section id="leaderboard-section" className="space-y-4 pt-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 select-none">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-cyan-600 shrink-0" />
                    <h3 className="font-sans font-bold text-xs uppercase tracking-widest text-slate-400">Visionary founder tables</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-100 border border-slate-200/50 rounded px-2.5 py-0.5">UPDATES REALTIME</span>
                </div>
                
                <LeaderboardTable />
              </section>

            </div>

          </div>
        ) : currentView === 'onboarding' ? (
          <OnboardingView
            source={onboardingSource}
            onComplete={handleOnboardingComplete}
            onCancel={() => {
              setCurrentView('explore');
              setOnboardingSource(null);
            }}
          />
        ) : (
          /* DASHBOARD ROW (If view set to user center) */
          currentUser ? (
            <DashboardView
              profile={currentUser}
              ideas={state.ideas}
              collabs={state.collaborations}
              fundings={state.funding}
              suggestions={state.suggestions}
              onUpdateProfile={handleProfileUpdate}
              onAddIdeaClick={() => {
                setIdeaToEdit(null);
                setShowAddIdeaModal(true);
              }}
              onSelectIdea={(idea) => {
                setSelectedIdea(idea);
                setCurrentView('explore');
              }}
              onDeleteIdea={handleDeleteIdea}
              onToggleVisibility={handleToggleIdeaVisibility}
              onEditIdea={(idea) => {
                setIdeaToEdit(idea);
                setShowAddIdeaModal(true);
              }}
            />
          ) : (
            <div className="py-20 text-center text-xs text-gray-400 select-none">
              Please sign up or log in to view the dashboard contents.
            </div>
          )
        )}

      </main>

      {/* FOOTER METRICS SUMMARY */}
      <footer className="bg-zinc-950 text-gray-400 py-10 mt-16 border-t border-zinc-900 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left space-y-6 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div className="space-y-1">
            <span className="font-display font-bold text-white text-base tracking-tight block">
              ★ VisionBoard
            </span>
            <p className="text-[11px] text-gray-500">The database of future startup ideas. Building robust co-founder matches.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-mono text-zinc-500">
            <span className="px-2.5 py-1 bg-zinc-900 rounded-md border border-zinc-800">
              DATABASE RECORDS: {state.ideas.length} IDEAS
            </span>
            <span>© 2026 VisionBoard Hub. Clean startup rectangles inspired by TrustMRR.</span>
          </div>
        </div>
      </footer>

      {/* OVERLAY FLOW MODALS AND DIALOGS */}
      
      {/* 1. Login/Signup Modal (Mock authentication) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        defaultIsSignUp={authDefaultIsSignUp}
        signupNoticeMessage={authNoticeMessage}
      />

      {/* 2. Detailed View Modal (Interactive suggestion boxes + trigger collaborations) */}
      {selectedIdea && (
        <IdeaDetailsModal
          idea={selectedIdea}
          isOpen={!!selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onLike={() => handleLikeToggle(selectedIdea.id)}
          isLikedByUser={likedIdeaIds.includes(selectedIdea.id)}
          suggestions={activeSuggestions}
          onAddSuggestion={handleAddSuggestion}
          onCollaborationClick={() => {
            setInterestTargetType('collaboration');
            setInterestTargetIdea(selectedIdea);
          }}
          onFundingClick={() => {
            setInterestTargetType('funding');
            setInterestTargetIdea(selectedIdea);
          }}
          currentUser={currentUser}
        />
      )}

      {/* 3. Add Startup Idea Form Popup */}
      {showAddIdeaModal && (
        <AddIdeaModal
          isOpen={showAddIdeaModal}
          onClose={() => {
            setShowAddIdeaModal(false);
            setIdeaToEdit(null);
          }}
          onSubmit={handleAddIdeaSubmit}
          currentUser={currentUser}
          ideaToEdit={ideaToEdit}
        />
      )}

      {/* 4. Request Collaboration & Expression of Funding Interest popup modal */}
      {interestTargetIdea && interestTargetType && (
        <InterestModal
          isOpen={!!interestTargetIdea && !!interestTargetType}
          onClose={() => {
            setInterestTargetIdea(null);
            setInterestTargetType(null);
          }}
          type={interestTargetType}
          ideaName={interestTargetIdea.name}
          onSubmit={handleInterestSubmit}
        />
      )}

      {/* Satisfying Pop Toast alerts notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-60 bg-zinc-950 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 border border-zinc-850 text-xs font-semibold select-none"
            id="pop-toast"
          >
            <Sparkles className="h-4 w-4 text-blue-400 shrink-0 animate-bounce" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
