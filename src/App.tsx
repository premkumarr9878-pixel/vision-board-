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
import ProfileSetup from './components/ProfileSetup';
import { CardSkeleton, TableRowSkeleton } from './components/Skeleton';
import { getLocalStorageState, saveLocalStorageState, DEFAULT_PROFILE, safeParse } from './data';
import { StartupIdea, FounderProfile, CollaborationRequest, FundingRequest, Suggestion, RequestStatus } from './types';
import { Star, Sparkles, Send, Flame, Lightbulb, Users, Globe, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from './supabase';

export default function App() {
  // Load state from localStorage on init
  const [state, setState] = useState(() => {
    try {
      return getLocalStorageState();
    } catch (err) {
      console.error('Initial state load failed:', err);
      return {
        ideas: [],
        profile: DEFAULT_PROFILE,
        collaborations: [],
        funding: [],
        suggestions: [],
        hasModified: false
      };
    }
  });

  const [currentUser, setCurrentUser] = useState<FounderProfile | null>(null);
  const [currentView, setCurrentView] = useState<'explore' | 'dashboard' | 'onboarding' | 'profile-setup'>('explore');
  const [onboardingSource, setOnboardingSource] = useState<'add-idea' | 'founder-hub' | null>(null);

  // Supabase Auth Listener
  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.user_metadata?.is_new_user);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.user_metadata?.is_new_user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, isNewUser?: boolean) => {
    if (!userId) return;
    console.log(`Fetching profile for user ${userId}, isNewUser: ${isNewUser}`);
    let attempts = 0;
    const maxAttempts = 5; // Increased attempts for more reliability
    
    while (attempts < maxAttempts) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
          .catch(err => ({ data: null, error: err }));

        if (error) {
          if ((error.code === 'PGRST116' || error.message?.includes('0 rows')) && attempts < maxAttempts - 1) {
            // Profile not created yet by trigger, wait and retry
            console.log(`Profile not found yet, retrying... (attempt ${attempts + 1})`);
            attempts++;
            await new Promise(r => setTimeout(r, 1000)); // Increased wait time to 1s
            continue;
          }
          console.error('Final profile fetch error:', error);
          throw error;
        }

        if (data) {
          console.log('Profile successfully loaded:', data.name);
          const profile: FounderProfile = {
            id: data.id,
            name: data.name || '',
            email: data.email || '',
            bio: data.bio || '',
            skills: data.skills || [],
            buildingDesc: data.building_desc || '',
            avatar: data.avatar_url || '',
            startupLogo: data.startup_logo_url || undefined,
            github: data.github_url || '',
            twitter: data.twitter_url || '',
            linkedin: data.linkedin_url || '',
            userRole: data.user_role as 'founder_hub' | 'vision_board'
          };
          setCurrentUser(profile);

          // If new user flag is present, redirect to profile setup
          if (isNewUser) {
            console.log('New user detected, redirecting to setup...');
            setCurrentView('profile-setup');
            // Clear the metadata flag in Supabase so it doesn't redirect again
            await supabase.auth.updateUser({ data: { is_new_user: false } }).catch(e => console.warn('Metadata update failed:', e));
          } else if (currentView === 'explore' || currentView === 'onboarding') {
            // Role-based redirection after login (only if we are on entry screens)
            if (data.user_role === 'founder_hub') {
              setCurrentView('dashboard');
            } else {
              setCurrentView('explore');
            }
          }
        }
      } catch (err) {
        console.warn(`Profile fetch attempt ${attempts + 1} failed:`, err);
        if (attempts >= maxAttempts - 1) break;
        attempts++;
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  };

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

  // Loading state for simulation
  const [isLoading, setIsLoading] = useState(true);

  // Simple feedback alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Liked tracking (local list of user loved ideaIds to simulate session validation)
  const [likedIdeaIds, setLikedIdeaIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('vb_user_liked_ids');
      return safeParse(saved, ['idea-1', 'idea-3']);
    } catch (err) {
      return ['idea-1', 'idea-3'];
    }
  });

  // Simulation of initial data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

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
    // Session is handled by Supabase Auth Listener above
  }, [currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auth synchronization handlers
  const handleAuthSuccess = async () => {
    // Show feedback
    showToast(`Successfully authenticated!`);

    // Navigate to appropriate view
    if (onboardingSource === 'add-idea') {
      setCurrentView('dashboard');
      setShowAddIdeaModal(true);
    } else {
      setCurrentView('dashboard');
    }
    setOnboardingSource(null);
  };

  const handleOnboardingComplete = (
    name: string,
    email: string,
    bio: string,
    buildingDesc: string,
    avatar?: string,
    startupLogo?: string
  ) => {
    // Generate a valid Unsplash photo ID based on a small set of curated founder-style images
    const founderPhotoIds = [
      '1494790108377-be9c29b29330',
      '1507003211169-0a1dd7228f2d',
      '1438761681033-6461ffad8d80',
      '1500648767791-00dcc994a43e',
      '1544005313-94ddf0286df2'
    ];
    const randomId = founderPhotoIds[Math.floor(Math.random() * founderPhotoIds.length)];
    const defaultAvatar = `https://images.unsplash.com/photo-${randomId}?auto=format&fit=crop&q=80&w=150`;
    
    const freshProfile: FounderProfile = {
      id: `usr_${Date.now()}`,
      name,
      email,
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

  const handleProfileSetupComplete = (updatedProfile: FounderProfile) => {
    setCurrentUser(updatedProfile);
    setCurrentView('dashboard');
    showToast(`Profile updated! Welcome ${updatedProfile.name}`);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setCurrentView('explore');
      showToast('Signed out of developer session safely.');
    } catch (err) {
      console.error('Logout failed:', err);
    }
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
  const handleInterestSubmit = (formData: { name: string; email: string; phone: string; message: string; role?: string; investmentAmount?: string }) => {
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
        role: formData.role || 'Partner',
        message: formData.message,
        status: 'pending',
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
        investmentAmount: formData.investmentAmount || 'Not specified',
        message: formData.message,
        status: 'pending',
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

  const handleUpdateRequestStatus = (type: 'collaboration' | 'funding', requestId: string, newStatus: RequestStatus) => {
    setState(prev => {
      if (type === 'collaboration') {
        return {
          ...prev,
          collaborations: prev.collaborations.map(c => c.id === requestId ? { ...c, status: newStatus } : c)
        };
      } else {
        return {
          ...prev,
          funding: prev.funding.map(f => f.id === requestId ? { ...f, status: newStatus } : f)
        };
      }
    });
    
    const statusMsg = newStatus === 'accepted' ? 'Request accepted!' : 
                     newStatus === 'rejected' ? 'Request declined.' : 
                     'Marked as contacted.';
    showToast(statusMsg);
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
          setOnboardingSource('get-started');
          setCurrentView('onboarding');
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6" id="explore-view">
            
            {/* Geometric Centered Headline Callout */}
            <div className="text-center max-w-4xl mx-auto space-y-3 select-none mb-8 pt-0" id="hero-centered-headline">
              {/* Optional verification alert */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/5 dark:bg-blue-400/10 text-blue-700 dark:text-blue-400 text-[10px] font-black font-mono uppercase tracking-wider rounded-full border-2 border-blue-500/15 shadow-sm">
                <Sparkles className="h-4 w-4 text-blue-500 shrink-0 fill-current animate-pulse" />
                <span>Sandbox Version 2.0 Live</span>
              </div>
              
              <h2 className="font-display font-black text-5xl sm:text-7xl md:text-[72px] text-slate-950 dark:text-white tracking-tighter leading-[0.95]" id="main-visionboard-headline">
                The database of <span className="bg-gradient-to-r from-blue-600 via-indigo-550 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent block sm:inline">future startup ideas</span>
              </h2>
              
              <p className="text-lg text-slate-700 dark:text-slate-300 max-w-2xl mx-auto font-bold leading-relaxed px-4">
                Publish ideas, find collaborators, attract funding, and build your startup validation boards alongside a network of peers.
              </p>

              {/* Home Add Idea trigger and Search Bar alignment */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto pt-1">
                <button
                  id="get-started-hero-btn"
                  onClick={() => {
                    if (!currentUser) {
                      setOnboardingSource('get-started');
                      setCurrentView('onboarding');
                    } else {
                      setCurrentView('dashboard');
                    }
                  }}
                  className="px-10 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-sm font-black rounded-2xl hover:scale-[1.03] active:scale-[0.98] transition-all select-none cursor-pointer text-center duration-200 shadow-xl"
                >
                  Get Started Now
                </button>
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
                  className="px-10 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 text-sm font-black rounded-2xl hover:scale-[1.03] active:scale-[0.98] transition-all select-none cursor-pointer text-center duration-200"
                >
                  + Add Your Startup Idea
                </button>
              </div>
            </div>

            {/* Stats Summary Panel */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12" id="hero-stats-panel">
              <div className="text-center group select-none">
                <span className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">Total Ideas Shared</span>
                <span className="text-4xl font-display font-black text-slate-950 dark:text-white tracking-tighter" id="total-ideas-count">
                  {state.ideas.length.toLocaleString()}
                </span>
                <div className="h-1 w-8 bg-blue-600 mx-auto mt-2 rounded-full transform group-hover:scale-x-150 transition-transform" />
              </div>

              <div className="hidden md:block w-px h-12 bg-slate-200 dark:bg-slate-800" />

              {/* Home Filter Toggle Tabs (Time range) */}
              <div className="flex flex-col space-y-2 select-none" id="time-filter-tabs">
                <span className="text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center md:text-left mb-1">Filter by Release Day</span>
                <div className="flex items-center p-1.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'day', label: 'Today' },
                    { id: 'week', label: 'Weekly' },
                    { id: 'month', label: 'Monthly' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      id={`time-filter-${f.id}`}
                      onClick={() => setTimeFilter(f.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        timeFilter === f.id
                          ? 'bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 shadow-md scale-105'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category selection tab caps */}
            <div className="mb-6" id="category-filter-section">
              <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Designated Categories</span>
                <div className="h-px flex-1 mx-4 bg-gradient-to-r from-slate-200/40 via-transparent to-transparent dark:from-slate-800/40" />
              </div>
              <CategoryFilters
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </div>

          <div className="flex flex-col space-y-10" id="ideas-main-feed">
            {/* 1. Trending Ideas (Sorted by high engagement) */}
            <section id="trending-ideas-section">
              <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center space-x-3 select-none">
                  <div className="p-2 rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/20">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-display font-black text-slate-950 dark:text-white uppercase tracking-tight">Trending Ideas</h2>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-black font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Feed Validated</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                ) : (
                  trendingIdeas.map(idea => (
                    <IdeaCard 
                      key={idea.id} 
                      idea={idea} 
                      onCardClick={() => setSelectedIdea(idea)}
                      onLikeClick={() => handleLikeToggle(idea.id)}
                      isLikedByUser={likedIdeaIds.includes(idea.id)}
                      rowStyle="trending"
                    />
                  ))
                )}
              </div>
            </section>

            {/* 2. Recently Listed (Chronological) */}
            <section id="recently-listed-section">
              <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center space-x-3 select-none">
                  <div className="p-2 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-display font-black text-slate-950 dark:text-white uppercase tracking-tight">Recently Listed Ideas</h2>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-black font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span>Live Stream</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                ) : (
                  recentlyListedIdeas.map(idea => (
                    <IdeaCard 
                      key={idea.id} 
                      idea={idea} 
                      onCardClick={() => setSelectedIdea(idea)}
                      onLikeClick={() => handleLikeToggle(idea.id)}
                      isLikedByUser={likedIdeaIds.includes(idea.id)}
                      rowStyle="recent"
                    />
                  ))
                )}
              </div>
            </section>

            {/* 3. Weekly Best (Staff picks / High Upvotes) */}
            <section id="weekly-best-section">
              <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center space-x-3 select-none">
                  <div className="p-2 rounded-xl bg-purple-600 shadow-lg shadow-purple-500/20">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-display font-black text-slate-950 dark:text-white uppercase tracking-tight">Best Ideas This Week</h2>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-black font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-950/30 px-3 py-1.5 rounded-lg border border-purple-100 dark:border-purple-900 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                  <span>Gold Validated</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                ) : (
                  weeklyBestIdeas.map(idea => (
                    <IdeaCard 
                      key={idea.id} 
                      idea={idea} 
                      onCardClick={() => setSelectedIdea(idea)}
                      onLikeClick={() => handleLikeToggle(idea.id)}
                      isLikedByUser={likedIdeaIds.includes(idea.id)}
                      rowStyle="weekly"
                    />
                  ))
                )}
              </div>
            </section>

            {/* 4. Visionary Founder Table (Leaderboard) */}
            <section id="leaderboard-section">
              <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center space-x-3 select-none">
                  <div className="p-2 rounded-xl bg-amber-500 shadow-lg shadow-amber-500/20">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-display font-black text-slate-950 dark:text-white uppercase tracking-tight">Visionary Founder Tables</h2>
                </div>
                <div className="text-[10px] font-black font-mono text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-900 shadow-sm">
                  Updates Realtime
                </div>
              </div>
              {isLoading ? (
                <div className="bg-white dark:bg-slate-950 rounded-3xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden">
                  {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}
                </div>
              ) : (
                <LeaderboardTable />
              )}
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
        ) : currentView === 'profile-setup' && currentUser ? (
          <ProfileSetup 
            profile={currentUser}
            onComplete={handleProfileSetupComplete}
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
              onUpdateRequestStatus={handleUpdateRequestStatus}
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
            isCollaborationRequested={state.collaborations.some(c => c.ideaId === selectedIdea.id && (currentUser ? c.email === currentUser.email : false))}
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
