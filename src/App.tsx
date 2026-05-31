import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import CategoryFilters from './components/CategoryFilters';
import IdeaCard from './components/IdeaCard';
import IdeaDetailsModal from './components/IdeaDetailsModal';
import AddIdeaModal from './components/AddIdeaModal';
import InterestModal from './components/InterestModal';
import DashboardView from './components/DashboardView';
import LeaderboardTable from './components/LeaderboardTable';
import PublicProfileModal from './components/PublicProfileModal';
import { CardSkeleton, TableRowSkeleton } from './components/Skeleton';
import { getLocalStorageState, saveLocalStorageState, DEFAULT_PROFILE, safeParse } from './data';
import { StartupIdea, FounderProfile, CollaborationRequest, FundingRequest, Suggestion, RequestStatus } from './types';
import { Star, Sparkles, Send, Flame, Lightbulb, Users, Globe, ExternalLink, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from './supabase';

// Global flag to prevent multiple auth attempts in StrictMode or rapid re-renders
let hasAttemptedAuth = false;

// Global error handler for uncaught promises to prevent silent failures
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    
    // 1. Suppress rejections that are just empty objects or null/undefined
    if (!reason || (typeof reason === 'object' && Object.keys(reason).length === 0)) {
      event.preventDefault();
      return;
    }

    // 2. Suppress generic Supabase/Auth/Network errors that don't impact UX
    if (reason && (
      reason.message?.includes('Fetch argument') || 
      reason.status === 403 ||
      reason.code === 403 ||
      reason.httpStatus === 403 ||
      reason.status === 404 ||
      reason.status === 422 ||
      (reason.name === 'n' && reason.code === 403) // Targeted fix for specific extension error
    )) {
      event.preventDefault();
      return;
    }

    // 3. Suppress errors originating from browser extensions
    const stack = reason?.stack || '';
    if (stack.includes('extension://') || stack.includes('content.js')) {
      event.preventDefault();
      return;
    }

    // 4. If it's an object with no message and no stack, it's likely extension noise
    if (typeof reason === 'object' && !reason.message && !reason.stack) {
      event.preventDefault();
      return;
    }

    console.warn('Unhandled Promise Rejection:', reason);
  });
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<FounderProfile | null>(DEFAULT_PROFILE);
  const [session, setSession] = useState<any>(null);

  // Load state from Supabase and sync with localStorage
  const [state, setState] = useState(() => {
    try {
      const localState = getLocalStorageState();
      // Ensure ideas are sorted by created_at descending (newest first) by default
      if (localState.ideas && localState.ideas.length > 0) {
        localState.ideas.sort((a, b) => {
          const dateA = new Date(a.createdAt || (a as any).created_at).getTime();
          const dateB = new Date(b.createdAt || (b as any).created_at).getTime();
          return dateB - dateA;
        });
      }
      return localState;
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

  const [currentView, setCurrentView] = useState<'explore' | 'dashboard'>('explore');

  // Anonymous Authentication & Profile Setup
  useEffect(() => {
    const handleAuth = async () => {
      if (hasAttemptedAuth) return;
      hasAttemptedAuth = true;

      if (!isSupabaseConfigured) {
        console.debug('Supabase not configured. Using local guest mode.');
        // Clean up any stale Supabase sessions from localStorage to prevent 403 errors
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase.auth.token') || key.startsWith('sb-'))) {
            localStorage.removeItem(key);
          }
        }
        const guestId = '00000000-0000-0000-0000-000000000000'; 
        setCurrentUser({ ...DEFAULT_PROFILE, id: guestId });
        return;
      }

      try {
        // 1. Get current session or sign in anonymously
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        let sessionToUse = currentSession;

        if (sessionError) {
          console.warn('Error fetching session:', sessionError.message);
        }
        
        if (sessionToUse) {
          localStorage.removeItem('supabase_auth_disabled');
        }

        if (!sessionToUse) {
          // Only attempt anonymous sign-in if we haven't confirmed it's disabled in this session
          const isAuthDisabled = localStorage.getItem('supabase_auth_disabled') === 'true';
          
          if (!isAuthDisabled) {
            try {
              const { data, error: signInError } = await supabase.auth.signInAnonymously();
              
              if (signInError) {
                if (signInError.message.includes('disabled') || signInError.status === 422) {
                  localStorage.setItem('supabase_auth_disabled', 'true');
                  console.debug('Supabase Anonymous Auth is disabled. Falling back to guest mode.');
                } else {
                  console.debug('Anonymous sign-in attempt skipped or failed.');
                }
                
                // Fallback: use guest ID
                const guestId = '00000000-0000-0000-0000-000000000000'; 
                setCurrentUser({ ...DEFAULT_PROFILE, id: guestId });
                return;
              }
              sessionToUse = data.session;
            } catch (signInErr: any) {
              console.warn('Critical auth failure:', signInErr?.message || signInErr);
              const guestId = '00000000-0000-0000-0000-000000000000'; 
              setCurrentUser({ ...DEFAULT_PROFILE, id: guestId });
              return;
            }
          } else {
            const guestId = '00000000-0000-0000-0000-000000000000'; 
            setCurrentUser({ ...DEFAULT_PROFILE, id: guestId });
            return;
          }
        }
        
        setSession(sessionToUse);
        const user = sessionToUse?.user;

        if (user) {
          // 2. Ensure profile exists
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();

            if (profileError) {
              console.warn('Error fetching profile:', profileError.message);
            }

            if (!profile) {
              // Create default profile
              const newProfile = {
                id: user.id,
                name: `Guest Founder`,
                email: user.email || `guest_${user.id.slice(0, 8)}@visionboard.local`,
                bio: 'New founder exploring visions.',
                skills: [],
                avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'
              };

              const { data: createdProfile, error: createError } = await supabase
                .from('profiles')
                .insert([newProfile])
                .select()
                .maybeSingle();

              if (createError) {
                console.warn('Error creating profile:', createError.message);
              }

              if (createdProfile) {
                setCurrentUser({
                  id: createdProfile.id,
                  name: createdProfile.name,
                  email: createdProfile.email,
                  bio: createdProfile.bio,
                  buildingDesc: createdProfile.building_desc,
                  skills: createdProfile.skills || [],
                  avatar: createdProfile.avatar_url
                });
              }
            } else {
              setCurrentUser({
                id: profile.id,
                name: profile.name,
                email: profile.email,
                bio: profile.bio,
                buildingDesc: profile.building_desc,
                skills: profile.skills || [],
                avatar: profile.avatar_url
              });
            }

            // 3. Fetch upvotes
            const { data: userUpvotes, error: upvotesError } = await supabase
              .from('idea_upvotes')
              .select('idea_id')
              .eq('voter_id', user.id);
            
            if (upvotesError) {
              console.warn('Error fetching upvotes:', upvotesError.message);
            } else if (userUpvotes) {
              setLikedIdeaIds(userUpvotes.map(u => u.idea_id));
            }
          } catch (profileFetchErr: any) {
            console.warn('Profile fetch error:', profileFetchErr?.message || profileFetchErr);
          }
        }
      } catch (err: any) {
        console.error('Auth handler critical error:', err?.message || err);
      }
    };

    handleAuth();

    if (isSupabaseConfigured) {
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      const profile: FounderProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        bio: data.bio,
        buildingDesc: data.building_desc,
        skills: data.skills || [],
        avatar: data.avatar_url,
        githubUrl: data.github_url,
        twitterUrl: data.twitter_url,
        linkedinUrl: data.linkedin_url,
        instagramUrl: data.instagram_url,
        facebookUrl: data.facebook_url,
        profession: data.profession,
        experience: data.experience,
        startupInterests: data.startup_interests || []
      };
      setCurrentUser(profile);
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
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'week1' | 'week2' | 'month1' | 'month2' | 'month3' | 'month6' | 'month8' | 'year1' | 'year2'>('all');

  // Active Modals overlay states
  const [selectedIdea, setSelectedIdea] = useState<StartupIdea | null>(null);
  const [showAddIdeaModal, setShowAddIdeaModal] = useState(false);
  const [ideaToEdit, setIdeaToEdit] = useState<StartupIdea | null>(null);
  
  // Expression of Interest states
  const [interestTargetType, setInterestTargetType] = useState<'collaboration' | 'funding' | null>(null);
  const [interestTargetIdea, setInterestTargetIdea] = useState<StartupIdea | null>(null);

  // Public Profile Modal State
  const [selectedPublicProfile, setSelectedPublicProfile] = useState<FounderProfile | null>(null);
  const [selectedFounderIdeas, setSelectedFounderIdeas] = useState<StartupIdea[]>([]);

  // Loading state for simulation
  const [isLoading, setIsLoading] = useState(true);

  // Simple feedback alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [totalIdeasCount, setTotalIdeasCount] = useState(0);

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
  const loadData = async () => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch ALL public published ideas for real-time counting & instant filtering
      const { data: ideas, error: ideasError } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (ideasError) {
        console.warn('Error fetching ideas:', ideasError.message);
      }

      const mappedIdeas: StartupIdea[] = (ideas || []).map(data => mapIdeaFromDB(data));

      // 2. Fetch collaboration requests
      let mappedCollabs: CollaborationRequest[] = [];
      try {
        const { data: collabs, error: collabsError } = await supabase
          .from('collaboration_requests')
          .select('*');
        if (!collabsError && collabs) {
          mappedCollabs = collabs.map(c => ({
            id: c.id,
            ideaId: c.idea_id,
            ideaName: c.idea_name,
            founderId: c.founder_id,
            name: c.full_name,
            email: c.email,
            phone: c.phone,
            role: 'Partner',
            message: c.about,
            status: c.status as RequestStatus,
            createdAt: c.created_at
          }));
        }
      } catch (e) { console.warn('Collabs fetch failed'); }

      // 3. Fetch funding requests
      let mappedFundings: FundingRequest[] = [];
      try {
        const { data: fundings, error: fundingsError } = await supabase
          .from('funding_requests')
          .select('*');
        if (!fundingsError && fundings) {
          mappedFundings = fundings.map(f => ({
            id: f.id,
            ideaId: f.idea_id,
            ideaName: f.idea_name,
            founderId: f.founder_id,
            name: f.full_name,
            email: f.email,
            phone: f.phone,
            investmentAmount: 'Not specified',
            message: f.about,
            status: f.status as RequestStatus,
            createdAt: f.created_at
          }));
        }
      } catch (e) { console.warn('Funding fetch failed'); }

      // 4. Fetch suggestions
      let mappedSuggestions: Suggestion[] = [];
      try {
        const { data: suggestions, error: suggestionsError } = await supabase
          .from('suggestions')
          .select('*, profiles!fk_suggestions_requester(name, avatar_url)');
        
        if (!suggestionsError && suggestions) {
          mappedSuggestions = suggestions.map(s => ({
            id: s.id,
            ideaId: s.idea_id,
            founderId: s.founder_id,
            content: s.suggestion_text,
            createdAt: s.created_at,
            authorName: (s as any).profiles?.name || 'Anonymous Founder',
            authorAvatar: (s as any).profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80',
            ideaName: mappedIdeas.find(i => i.id === s.idea_id)?.name || 'Unknown Idea'
          }));
        }
      } catch (e) { console.warn('Suggestions fetch failed'); }

      setState(prev => ({
        ...prev,
        ideas: mappedIdeas,
        collaborations: mappedCollabs,
        funding: mappedFundings,
        suggestions: mappedSuggestions
      }));
    } catch (err: any) {
      console.error('Error loading data from Supabase:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    } else {
      setIsLoading(false);
    }

    if (isSupabaseConfigured) {
      // Set up realtime listeners (scoped to visible data)
      const ideasChannel = supabase.channel('public:ideas')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ideas' }, (payload) => {
          const mappedIdea = mapIdeaFromDB(payload.new);
          
          setState(prev => {
            if (prev.ideas.some(i => i.id === mappedIdea.id)) return prev;
            return { ...prev, ideas: [mappedIdea, ...prev.ideas] };
          });
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ideas' }, (payload) => {
          const updatedIdea = mapIdeaFromDB(payload.new);
          setState(prev => ({
            ...prev,
            ideas: prev.ideas.map(idea => 
              idea.id === updatedIdea.id ? updatedIdea : idea
            )
          }));
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ideas' }, (payload) => {
          setState(prev => ({
            ...prev,
            ideas: prev.ideas.filter(idea => idea.id !== payload.old.id)
          }));
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIPTION_ERROR') console.debug('Ideas realtime sync failed');
        });

      const collabsChannel = supabase.channel('public:collaboration_requests')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'collaboration_requests' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const c = payload.new as any;
            const mapped: CollaborationRequest = {
              id: c.id,
              ideaId: c.idea_id,
              ideaName: c.idea_name,
              founderId: c.founder_id,
              name: c.full_name,
              email: c.email,
              phone: c.phone,
              role: 'Partner',
              message: c.about,
              status: c.status as RequestStatus,
              createdAt: c.created_at
            };
            setState(prev => ({ ...prev, collaborations: [mapped, ...prev.collaborations] }));
          } else if (payload.eventType === 'UPDATE') {
            setState(prev => ({
              ...prev,
              collaborations: prev.collaborations.map(c => c.id === payload.new.id ? { ...c, status: payload.new.status } : c)
            }));
          }
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIPTION_ERROR') console.debug('Collabs realtime sync failed');
        });

      const suggestionsChannel = supabase.channel('public:suggestions')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'suggestions' }, (payload) => {
          const s = payload.new as any;
          const mapped: Suggestion = {
            id: s.id,
            ideaId: s.idea_id,
            founderId: s.founder_id,
            content: s.suggestion_text,
            createdAt: s.created_at,
            authorName: 'A Founder',
            authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80',
            ideaName: 'New Suggestion'
          };
          setState(prev => ({ ...prev, suggestions: [mapped, ...prev.suggestions] }));
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIPTION_ERROR') console.debug('Suggestions realtime sync failed');
        });

      const fundingChannel = supabase.channel('public:funding_requests')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'funding_requests' }, (payload) => {
          const f = payload.new as any;
          const mapped: FundingRequest = {
            id: f.id,
            ideaId: f.idea_id,
            ideaName: f.idea_name,
            founderId: f.founder_id,
            name: f.full_name,
            email: f.email,
            phone: f.phone,
            investmentAmount: 'Not specified',
            message: f.about,
            status: f.status as RequestStatus,
            createdAt: f.created_at
          };
          setState(prev => ({ ...prev, funding: [mapped, ...prev.funding] }));
        })
        .subscribe((status: string) => {
          if (status === 'SUBSCRIPTION_ERROR') console.debug('Funding realtime sync failed');
        });

      return () => {
        supabase.removeChannel(ideasChannel);
        supabase.removeChannel(collabsChannel);
        supabase.removeChannel(suggestionsChannel);
        supabase.removeChannel(fundingChannel);
      };
    }
  }, [currentUser]);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Centralized mapping helper for consistent data across the app
  const mapIdeaFromDB = (data: any): StartupIdea => ({
    id: data.id,
    name: data.name || 'Untitled',
    logo: data.logo || '🚀',
    banner: data.banner,
    description: data.description || '',
    whyThisWorks: data.why_this_works || '',
    problemSolved: data.problem_solved || '',
    targetAudience: data.target_audience || '',
    category: data.category || 'AI',
    founderId: data.founder_id,
    founderName: data.founder_name || 'Founder',
    founderAvatar: data.founder_avatar,
    collaborationCount: data.collaboration_count || 0,
    fundingInterestCount: data.funding_interest_count || 0,
    viewsCount: data.views_count || 0,
    progressStage: data.progress_stage || 'IDEATION',
    likes: data.likes || 0,
    suggestionsCount: data.suggestions_count || 0,
    needCollaboration: data.need_collaboration ?? true,
    needFunding: data.need_funding ?? false,
    seeking_collaboration: data.seeking_collaboration ?? false,
    seeking_funding: data.seeking_funding ?? false,
    isPublic: true,
    visibility: 'public',
    status: data.status || 'published',
    createdAt: data.created_at,
    instagramUrl: data.instagram_url,
    facebookUrl: data.facebook_url,
    website_url: data.website_url, // Added mapping for social links
    websiteUrl: data.website_url // Keep both for safety
  });

  const handleProfileUpdate = async (updated: FounderProfile) => {
    if (!currentUser) return;

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updated.name,
          email: updated.email,
          bio: updated.bio,
          building_desc: updated.buildingDesc,
          skills: updated.skills,
          avatar_url: updated.avatar,
          github_url: updated.githubUrl,
          twitter_url: updated.twitterUrl,
          linkedin_url: updated.linkedinUrl,
          instagram_url: updated.instagramUrl,
          facebook_url: updated.facebookUrl,
          experience: updated.experience,
          startup_interests: updated.startupInterests,
          profession: updated.profession
        })
        .eq('id', currentUser.id);

      if (error) {
        console.error('Error updating profile in Supabase:', error);
        showToast('Failed to sync profile update to database.');
        return;
      }
    }

    setCurrentUser(updated);
    setState(prev => ({ 
      ...prev, 
      profile: updated,
      // Update founder info in local ideas if the user just updated their own profile
      ideas: prev.ideas.map(idea => 
        idea.founderId === updated.id 
          ? { ...idea, founderName: updated.name, founderAvatar: updated.avatar } 
          : idea
      )
    }));
    showToast('Founder Bio updated successfully!');
  };

  const handleFounderProfileClick = async (founderId: string) => {
    // Fetch ideas by this founder first (local and remote)
    const founderIdeas = state.ideas.filter(idea => idea.founderId === founderId);
    setSelectedFounderIdeas(founderIdeas);

    // 1. Check if it's the current user
    if (currentUser && founderId === currentUser.id) {
      setSelectedPublicProfile(currentUser);
      return;
    }

    // 2. Fetch from Supabase
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', founderId)
        .single();

      if (!error && data) {
        const profile: FounderProfile = {
          id: data.id,
          name: data.name,
          email: data.email,
          bio: data.bio,
          buildingDesc: data.building_desc,
          profession: data.profession,
          skills: data.skills || [],
          avatar: data.avatar_url,
          githubUrl: data.github_url,
          twitterUrl: data.twitter_url,
          linkedinUrl: data.linkedin_url,
          instagramUrl: data.instagram_url,
          facebookUrl: data.facebook_url,
          experience: data.experience,
          startupInterests: data.startup_interests || []
        };
        setSelectedPublicProfile(profile);
        return;
      }
    }

    // Fallback: look in local state ideas if fetch fails (e.g. offline/mock)
      const ideaWithFounder = state.ideas.find(i => i.founderId === founderId);
      if (ideaWithFounder) {
        setSelectedPublicProfile({
          id: ideaWithFounder.founderId,
          name: ideaWithFounder.founderName,
          email: 'Contact via Idea',
          bio: 'Founder exploring new visions.',
          avatar: ideaWithFounder.founderAvatar,
          skills: []
        });
      } else {
        showToast('Could not load founder profile.');
      }
  };

  // Add startup idea handler
  const handleAddIdeaSubmit = async (ideaData: Partial<StartupIdea>) => {
    if (!currentUser) {
      showToast('Session initializing. Please try again in a moment.');
      return;
    }

    // Payload mapping for database (snake_case)
    const payload = {
      name: ideaData.name || 'Untitled Vision',
      logo: ideaData.logo || '🚀',
      banner: ideaData.banner,
      description: ideaData.description || '',
      why_this_works: ideaData.whyThisWorks || '',
      problem_solved: ideaData.problemSolved || '',
      target_audience: ideaData.targetAudience || '',
      category: ideaData.category || 'AI',
      founder_id: currentUser.id,
      founder_name: currentUser.name,
      founder_avatar: currentUser.avatar,
      collaboration_count: 0,
      funding_interest_count: 0,
      views_count: 0,
      progress_stage: ideaData.progressStage || 'IDEATION',
      likes: 1, // Start with 1 upvote from founder
      suggestions_count: 0,
      need_collaboration: ideaData.needCollaboration ?? true,
      need_funding: ideaData.needFunding ?? false,
      seeking_collaboration: ideaData.seeking_collaboration ?? false,
      seeking_funding: ideaData.seeking_funding ?? false,
      is_public: true,
      visibility: 'public',
      status: ideaData.status || 'published',
      created_at: new Date().toISOString(),
      instagram_url: ideaData.instagramUrl,
      facebook_url: ideaData.facebookUrl,
      website_url: ideaData.websiteUrl
    };

    try {
      if (ideaToEdit) {
        if (isSupabaseConfigured) {
          const { error } = await supabase
            .from('ideas')
            .update(payload)
            .eq('id', ideaToEdit.id);

          if (error) throw error;
        }

        setState(prev => ({
          ...prev,
          ideas: prev.ideas.map(idea => 
            idea.id === ideaToEdit.id 
              ? { ...idea, ...ideaData, founderId: currentUser.id } as StartupIdea 
              : idea
          )
        }));
        showToast(`Saved changes for “${ideaData.name}” successfully!`);
        setIdeaToEdit(null);
        return;
      }

      let newIdea: StartupIdea;

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('ideas')
          .insert([payload])
          .select()
          .single();

        if (error) throw error;
        newIdea = mapIdeaFromDB(data);
      } else {
        const ideaId = `sim-${Math.random().toString(36).substr(2, 9)}`;
        newIdea = mapIdeaFromDB({ ...payload, id: ideaId });
      }

      // Update state instantly for immediate feedback (Realtime listener will handle duplicates)
      setState(prev => {
        if (prev.ideas.some(i => i.id === newIdea.id)) return prev;
        return {
          ...prev,
          ideas: [newIdea, ...prev.ideas]
        };
      });
      
      // Auto-like for the founder
      setLikedIdeaIds(prev => [...prev, newIdea.id]);
      showToast(`Vision “${newIdea.name}” is now live!`);
    } catch (err: any) {
      console.error('Submission error:', err.message || err);
      showToast('Connection error. Please try publishing again.');
    }
  };

  // Deletion helper for owners
  const handleDeleteIdea = async (id: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting idea:', error);
        showToast('Failed to delete idea.');
        return;
      }
    }

    setState(prev => ({
      ...prev,
      ideas: prev.ideas.filter(idea => idea.id !== id)
    }));
    showToast('Startup Vision removed from database.');
  };

  // Like handler
  const handleLikeToggle = async (ideaId: string) => {
    // Determine voter ID (user ID or session-based anonymous ID)
    let voterId = currentUser?.id;
    
    if (!voterId || voterId === '00000000-0000-0000-0000-000000000000') {
      // Guest mode: use or create a persistent anonymous ID in localStorage
      voterId = localStorage.getItem('vb_voter_id');
      if (!voterId) {
        voterId = 'anon-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('vb_voter_id', voterId);
      }
    }

    const isLiked = likedIdeaIds.includes(ideaId);
    
    // Optimistic UI update
    const newLikedIds = isLiked 
      ? likedIdeaIds.filter(id => id !== ideaId)
      : [...likedIdeaIds, ideaId];
    
    setLikedIdeaIds(newLikedIds);

    // Optimistically update the count in local ideas state
    setState(prev => ({
      ...prev,
      ideas: prev.ideas.map(idea => 
        idea.id === ideaId 
          ? { ...idea, likes: Math.max(0, idea.likes + (isLiked ? -1 : 1)) } 
          : idea
      )
    }));

    if (isLiked) {
      // Unlike: Remove from idea_upvotes table
      if (isSupabaseConfigured) {
        try {
          const { error: upvoteError } = await supabase
            .from('idea_upvotes')
            .delete()
            .match({ voter_id: voterId, idea_id: ideaId });

          if (upvoteError) throw upvoteError;

          // Sync count in ideas table
          await supabase.rpc('decrement_idea_likes', { idea_uuid: ideaId });
        } catch (err: any) {
          console.warn('Unlike sync failed:', err.message);
        }
      }
    } else {
      // Like: Add to idea_upvotes table
      if (isSupabaseConfigured) {
        try {
          const { error: upvoteError } = await supabase
            .from('idea_upvotes')
            .insert([{ voter_id: voterId, idea_id: ideaId }]);

          if (upvoteError && upvoteError.code !== '23505') throw upvoteError;

          // Sync count in ideas table
          await supabase.rpc('increment_idea_likes', { idea_uuid: ideaId });
        } catch (err: any) {
          console.warn('Like sync failed:', err.message);
        }
      }
    }
  };

  // Peer Suggestions Comment boards
  const handleAddSuggestion = async (content: string, guestName?: string) => {
    if (!selectedIdea) return;

    const payload = {
      idea_id: selectedIdea.id,
      founder_id: selectedIdea.founderId,
      requester_id: currentUser?.id,
      suggestion_text: content,
      created_at: new Date().toISOString()
    };

    let suggestionId = `sim-s-${Math.random().toString(36).substr(2, 9)}`;
    let suggestionCreatedAt = payload.created_at;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('suggestions')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Error adding suggestion:', error);
        showToast('Failed to post suggestion.');
        return;
      }
      if (data) {
        suggestionId = data.id;
        suggestionCreatedAt = data.created_at;
      }
    }

    const brandSuggestion: Suggestion = {
      id: suggestionId,
      ideaId: payload.idea_id,
      founderId: payload.founder_id,
      content: payload.suggestion_text,
      createdAt: suggestionCreatedAt,
      authorName: currentUser ? currentUser.name : (guestName || 'Anonymous Founder'),
      authorAvatar: currentUser ? currentUser.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80',
      ideaName: selectedIdea.name
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
  const handleInterestSubmit = async (formData: { name: string; email: string; phone: string; message: string; role?: string; investmentAmount?: string }) => {
    if (!interestTargetIdea || !interestTargetType) return;

    if (interestTargetType === 'collaboration') {
      const colPayload = {
        idea_id: interestTargetIdea.id,
        idea_name: interestTargetIdea.name,
        founder_id: interestTargetIdea.founderId,
        requester_id: currentUser?.id,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        about: formData.message,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      let colRequestId = `sim-c-${Math.random().toString(36).substr(2, 9)}`;
      let colRequestCreatedAt = colPayload.created_at;
      let colRequestStatus = colPayload.status as RequestStatus;

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('collaboration_requests')
          .insert([colPayload])
          .select()
          .single();

        if (error) {
          console.error('Error sending collaboration request:', error);
          showToast('Failed to send request to database.');
          return;
        }
        if (data) {
          colRequestId = data.id;
          colRequestCreatedAt = data.created_at;
          colRequestStatus = data.status as RequestStatus;
        }
      }

      const colRequest: CollaborationRequest = {
        id: colRequestId,
        ideaId: colPayload.idea_id,
        ideaName: colPayload.idea_name,
        founderId: colPayload.founder_id,
        name: colPayload.full_name,
        email: colPayload.email,
        phone: colPayload.phone,
        role: formData.role || 'Partner',
        message: colPayload.about,
        status: colRequestStatus,
        createdAt: colRequestCreatedAt
      };

      setState(prev => ({
        ...prev,
        collaborations: [colRequest, ...prev.collaborations],
        ideas: prev.ideas.map(idea => 
          idea.id === interestTargetIdea.id 
            ? { ...idea, collaborationCount: (idea.collaborationCount || 0) + 1 } 
            : idea
        )
      }));

      showToast('Your request has been sent to the founder!');
    } else {
      const fundPayload = {
        idea_id: interestTargetIdea.id,
        idea_name: interestTargetIdea.name,
        founder_id: interestTargetIdea.founderId,
        requester_id: currentUser?.id,
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        about: formData.message,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      let fundRequestId = `sim-f-${Math.random().toString(36).substr(2, 9)}`;
      let fundRequestCreatedAt = fundPayload.created_at;
      let fundRequestStatus = fundPayload.status as RequestStatus;

      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('funding_requests')
          .insert([fundPayload])
          .select()
          .single();

        if (error) {
          console.error('Error sending funding request:', error);
          showToast('Failed to send request to database.');
          return;
        }
        if (data) {
          fundRequestId = data.id;
          fundRequestCreatedAt = data.created_at;
          fundRequestStatus = data.status as RequestStatus;
        }
      }

      const fundRequest: FundingRequest = {
        id: fundRequestId,
        ideaId: fundPayload.idea_id,
        ideaName: fundPayload.idea_name,
        founderId: fundPayload.founder_id,
        name: fundPayload.full_name,
        email: fundPayload.email,
        phone: fundPayload.phone,
        investmentAmount: formData.investmentAmount || 'Not specified',
        message: fundPayload.about,
        status: fundRequestStatus,
        createdAt: fundRequestCreatedAt
      };

      setState(prev => ({
        ...prev,
        funding: [fundRequest, ...prev.funding],
        ideas: prev.ideas.map(idea => 
          idea.id === interestTargetIdea.id 
            ? { ...idea, fundingInterestCount: (idea.fundingInterestCount || 0) + 1 } 
            : idea
        )
      }));

      showToast('Your request has been sent to the founder!');
    }

    setInterestTargetIdea(null);
    setInterestTargetType(null);
  };

  const handleUpdateRequestStatus = async (type: 'collaboration' | 'funding', id: string, status: RequestStatus) => {
    const table = type === 'collaboration' ? 'collaboration_requests' : 'funding_requests';
    
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        showToast('Failed to update request status.');
        return;
      }
    }

    if (type === 'collaboration') {
      setState(prev => ({
        ...prev,
        collaborations: prev.collaborations.map(c => c.id === id ? { ...c, status } : c)
      }));
    } else {
      setState(prev => ({
        ...prev,
        funding: prev.funding.map(f => f.id === id ? { ...f, status } : f)
      }));
    }
    showToast(`Pitch updated to ${status.toUpperCase()} status.`);
  };

  // Filter ideas logic: query search, category pills & timeFilter
  const filteredPublicIdeas = useMemo(() => {
    const now = new Date();
    const nowTime = now.getTime();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return state.ideas.filter(idea => {
      // Simplified: all ideas are public now
      if (idea.status === 'draft') return false;
      
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        (idea.name?.toLowerCase() || '').includes(q) ||
        (idea.description?.toLowerCase() || '').includes(q) ||
        (idea.category?.toLowerCase() || '').includes(q) ||
        (idea.problemSolved?.toLowerCase() || '').includes(q) ||
        (idea.targetAudience?.toLowerCase() || '').includes(q) ||
        (idea.founderName?.toLowerCase() || '').includes(q) ||
        (idea.whyThisWorks?.toLowerCase() || '').includes(q);

      const matchesCategory = !selectedCategory || (idea.category === selectedCategory);

      // Time Filter Logic
      const createdAt = idea.createdAt || (idea as any).created_at;
      const ideaTime = createdAt ? new Date(createdAt).getTime() : 0;
      
      let matchesTime = true;
      if (timeFilter === 'day') {
        matchesTime = ideaTime >= startOfToday;
      } else if (timeFilter === 'week1') {
        matchesTime = nowTime - ideaTime <= 7 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'week2') {
        matchesTime = nowTime - ideaTime <= 14 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'month1') {
        matchesTime = nowTime - ideaTime <= 30 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'month2') {
        matchesTime = nowTime - ideaTime <= 60 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'month3') {
        matchesTime = nowTime - ideaTime <= 90 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'month6') {
        matchesTime = nowTime - ideaTime <= 180 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'month8') {
        matchesTime = nowTime - ideaTime <= 240 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'year1') {
        matchesTime = nowTime - ideaTime <= 365 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'year2') {
        matchesTime = nowTime - ideaTime <= 730 * 24 * 60 * 60 * 1000;
      }

      // Safety buffer for newly added ideas (within 10 minutes) - Ensure they show up immediately
      if (ideaTime > nowTime - 600000 && ideaTime < nowTime + 600000) {
        matchesTime = true;
      }

      return matchesSearch && matchesCategory && matchesTime;
    });
  }, [state.ideas, searchQuery, selectedCategory, timeFilter]);

  // Dynamically calculate counts for each time filter tab based on real-time database data
  const timeFilterCounts = useMemo(() => {
    const now = new Date();
    const nowTime = now.getTime();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const counts: Record<string, number> = {
      all: 0, day: 0, week1: 0, week2: 0, month1: 0, month2: 0, month3: 0, month6: 0, month8: 0, year1: 0, year2: 0
    };

    state.ideas.forEach(idea => {
      const isPublished = idea.status === 'published' || !idea.status;
      
      if (isPublished) {
        const createdAt = idea.createdAt || (idea as any).created_at;
        const ideaTime = createdAt ? new Date(createdAt).getTime() : 0;
        
        counts.all++;
        
        // Safety buffer: always include ideas added in the last 10 mins in all categories
        const isNew = ideaTime > nowTime - 600000 && ideaTime < nowTime + 600000;

        if (ideaTime >= startOfToday || isNew) counts.day++;
        if (nowTime - ideaTime <= 7 * 24 * 60 * 60 * 1000 || isNew) counts.week1++;
        if (nowTime - ideaTime <= 14 * 24 * 60 * 60 * 1000 || isNew) counts.week2++;
        if (nowTime - ideaTime <= 30 * 24 * 60 * 60 * 1000 || isNew) counts.month1++;
        if (nowTime - ideaTime <= 60 * 24 * 60 * 60 * 1000 || isNew) counts.month2++;
        if (nowTime - ideaTime <= 90 * 24 * 60 * 60 * 1000 || isNew) counts.month3++;
        if (nowTime - ideaTime <= 180 * 24 * 60 * 60 * 1000 || isNew) counts.month6++;
        if (nowTime - ideaTime <= 240 * 24 * 60 * 60 * 1000 || isNew) counts.month8++;
        if (nowTime - ideaTime <= 365 * 24 * 60 * 60 * 1000 || isNew) counts.year1++;
        if (nowTime - ideaTime <= 730 * 24 * 60 * 60 * 1000 || isNew) counts.year2++;
      }
    });
    
    return counts;
  }, [state.ideas]);

  // Calculate global stats (unfiltered by search/category/time, but filtered by public status)
  // This represents the real total ideas available in the global ecosystem
  const totalPublicIdeasCount = useMemo(() => {
    // The user wants the "Total Ideas" counter to reflect the global count (e.g., 24 -> 25)
    // even if a specific time filter is active.
    return timeFilterCounts.all || 0;
  }, [timeFilterCounts]);

  // Calculate dynamic category counts for ideas filtered by the selected date range
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const now = new Date();
    const nowTime = now.getTime();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    state.ideas.forEach(idea => {
      const isPublished = idea.status === 'published' || !idea.status;
      
      if (isPublished) {
        const createdAt = idea.createdAt || (idea as any).created_at;
        const ideaTime = createdAt ? new Date(createdAt).getTime() : 0;
        
        let matchesTime = true;
        if (timeFilter === 'day') {
          matchesTime = ideaTime >= startOfToday;
        } else if (timeFilter === 'week1') {
          matchesTime = nowTime - ideaTime <= 7 * 24 * 60 * 60 * 1000;
        } else if (timeFilter === 'week2') {
          matchesTime = nowTime - ideaTime <= 14 * 24 * 60 * 60 * 1000;
        } else if (timeFilter === 'month1') {
          matchesTime = nowTime - ideaTime <= 30 * 24 * 60 * 60 * 1000;
        } else if (timeFilter === 'month2') {
          matchesTime = nowTime - ideaTime <= 60 * 24 * 60 * 60 * 1000;
        } else if (timeFilter === 'month3') {
          matchesTime = nowTime - ideaTime <= 90 * 24 * 60 * 60 * 1000;
        } else if (timeFilter === 'month6') {
          matchesTime = nowTime - ideaTime <= 180 * 24 * 60 * 60 * 1000;
        } else if (timeFilter === 'month8') {
          matchesTime = nowTime - ideaTime <= 240 * 24 * 60 * 60 * 1000;
        } else if (timeFilter === 'year1') {
          matchesTime = nowTime - ideaTime <= 365 * 24 * 60 * 60 * 1000;
        } else if (timeFilter === 'year2') {
          matchesTime = nowTime - ideaTime <= 730 * 24 * 60 * 60 * 1000;
        }

        // Safety buffer for newly added ideas (within 10 minutes)
        if (ideaTime > nowTime - 600000 && ideaTime < nowTime + 600000) {
          matchesTime = true;
        }

        if (matchesTime) {
          const cat = idea.category || 'Other';
          counts[cat] = (counts[cat] || 0) + 1;
        }
      }
    });
    return counts;
  }, [state.ideas, timeFilter]);

  // Segregate filtered lists into TrustMRR structured grid blocks
  // 1. Trending: Sorted by upvotes & collaborations count
  const trendingIdeas = useMemo(() => {
    return [...filteredPublicIdeas]
      .sort((a, b) => (b.likes + b.collaborationCount * 2) - (a.likes + a.collaborationCount * 2));
  }, [filteredPublicIdeas]);

  // 2. Weekly Best: Ideas with scale stage, high interest rate
  const weeklyBestIdeas = useMemo(() => {
    return [...filteredPublicIdeas]
      .filter(idea => idea.likes > 60 || idea.progressStage === 'SCALE' || idea.progressStage === 'PROTOTYPE');
  }, [filteredPublicIdeas]);

  // 3. Recently Listed: Chronologically sorted
  const recentlyListedIdeas = useMemo(() => {
    return [...filteredPublicIdeas]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || (a as any).created_at).getTime();
        const dateB = new Date(b.createdAt || (b as any).created_at).getTime();
        return dateB - dateA;
      });
  }, [filteredPublicIdeas]);

  // Active suggestions list addressed to the clicked idea details modal
  const activeSuggestions = state.suggestions.filter(s => selectedIdea && s.ideaId === selectedIdea.id);

  // View tracking handler - optimized for instant updates with cooldown protection
  const handleIdeaView = async (ideaId: string) => {
    // 1. Cooldown protection: Check if this idea was already viewed in this session/day
    const VIEW_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hour cooldown
    const now = Date.now();
    
    try {
      const viewedData = safeParse(localStorage.getItem('vb_viewed_ideas'), {});
      const lastViewed = viewedData[ideaId] || 0;
      
      if (now - lastViewed < VIEW_COOLDOWN) {
        console.debug(`View skipped for ${ideaId}: Cooldown active`);
        return;
      }
      
      // Update cooldown timestamp
      viewedData[ideaId] = now;
      localStorage.setItem('vb_viewed_ideas', JSON.stringify(viewedData));
    } catch (e) {
      console.warn('View cooldown check failed', e);
    }

    // 2. Optimistic UI update
    setState(prev => ({
      ...prev,
      ideas: prev.ideas.map(idea => 
        idea.id === ideaId 
          ? { ...idea, viewsCount: (idea.viewsCount || 0) + 1 } 
          : idea
      )
    }));

    // 3. Sync with database if configured
    if (isSupabaseConfigured) {
      try {
        const idea = state.ideas.find(i => i.id === ideaId);
        const currentViews = idea?.viewsCount || 0;

        const { error } = await supabase
          .from('ideas')
          .update({ views_count: currentViews + 1 })
          .eq('id', ideaId);

        if (error) {
          // Fallback to database function if update fails
          try {
            await supabase.rpc('increment_idea_views', { idea_uuid: ideaId });
          } catch (rpcErr) {
            console.debug('RPC view increment failed');
          }
        }
      } catch (err: any) {
        console.warn('View tracking sync failed');
      }
    }
  };

  const handleIdeaClick = (idea: StartupIdea) => {
    // 1. Open the modal first for instant feedback
    setSelectedIdea(idea);
    
    // 2. Track view asynchronously
    handleIdeaView(idea.id);
  };

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out failed:', err);
    } finally {
      setCurrentUser(null);
      setSession(null);
      setLikedIdeaIds([]);
      showToast('Signed out successfully.');
    }
  };

  const handleAuthClick = () => {
    // This could open an auth modal if implemented
    showToast('Authentication modal would open here.');
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#F8FAFC] text-[#334155] flex flex-col font-sans selection:bg-blue-500/10 selection:text-blue-900 transition-colors">
      {/* Premium ambient radial glows - Exactly matching reference image colors and spread */}
      <div className="absolute top-0 left-0 w-full h-[1000px] pointer-events-none -z-10 hero-glow-bg" />
      
      {/* Soft blue-purple ambient glow overlays */}
      <div className="absolute top-0 left-[-10%] w-[1200px] h-[1000px] bg-[rgba(37,99,235,0.08)] rounded-full blur-[180px] pointer-events-none -z-10" />
      <div className="absolute top-[5%] right-[-10%] w-[1000px] h-[900px] bg-[rgba(124,58,237,0.08)] rounded-full blur-[200px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] left-[15%] w-[800px] h-[800px] bg-[rgba(79,70,229,0.05)] rounded-full blur-[150px] pointer-events-none -z-10" />
      
      {/* Mobile Fixed CTA */}
      <div className="lg:hidden fixed bottom-6 right-6 z-[60]">
        <button
          onClick={() => {
            setIdeaToEdit(null);
            setShowAddIdeaModal(true);
          }}
          className="w-14 h-14 rounded-full premium-gradient text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>

      {/* HEADER SECTION (Sticky Search & Nav swaps) */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddIdeaClick={() => {
          setIdeaToEdit(null);
          setShowAddIdeaModal(true);
        }}
        onDashboardClick={() => setCurrentView('dashboard')}
        onExploreClick={() => setCurrentView('explore')}
        onAuthClick={handleAuthClick}
        onLogout={handleLogout}
        currentUser={currentUser}
        currentView={currentView}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* BODY ROUTER */}
              <main className="flex-1 pb-20">
        
        {currentView === 'explore' ? (
          
          /* EXPLORE HOMEPAGE DECK */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 sm:py-0 space-y-4 sm:space-y-6" id="explore-view">
            
            {/* Geometric Centered Headline Callout */}
            <div className="text-center max-w-5xl mx-auto space-y-3 sm:space-y-4 select-none pt-0 sm:pt-2" id="hero-centered-headline">
              
              <div className="relative inline-block px-6 sm:px-8 py-2.5 sm:py-3 bg-white/60 backdrop-blur-xl rounded-[1.25rem] sm:rounded-[1.5rem] border border-white/50 shadow-[0_15px_40px_-15px_rgba(70,90,255,0.12)] mb-2">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black text-[#0F172A] leading-[1.1] tracking-tight" id="main-visionboard-headline">
                  The database of <span className="bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] bg-clip-text text-transparent block sm:inline">future startup ideas</span>
                </h2>
              </div>

              {/* Home Add Idea trigger and Search Bar alignment */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-4xl mx-auto pt-2">
                {/* HERO SEARCH BAR */}
                <div className="w-full sm:flex-1 relative group">
                  <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#2563EB] transition-colors z-10" />
                  <input
                    type="text"
                    placeholder="Search ideas, founders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 sm:pl-12 pr-6 py-3.5 sm:py-4 bg-white text-slate-900 border border-slate-200 focus:border-[#2563EB]/50 rounded-xl sm:rounded-2xl text-sm sm:text-base font-medium transition-all outline-none placeholder-slate-400 shadow-lg"
                  />
                </div>

                <button
                  id="add-idea-hero-btn"
                  onClick={() => setShowAddIdeaModal(true)}
                  className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-[#020617] text-white border border-slate-800 text-sm font-black rounded-xl sm:rounded-2xl hover:bg-[#0F172A] hover:scale-[1.01] active:scale-[0.99] transition-all select-none cursor-pointer duration-200 shadow-xl"
                >
                  + Add Your Idea
                </button>
              </div>
            </div>

            {/* Filter & Stats Panel */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-2 bg-white rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.04)]" id="hero-stats-panel">
              {/* Left Side: Stats */}
              <div className="flex items-center space-x-4 sm:space-x-6 px-4 sm:px-6 py-2 sm:py-2.5 bg-slate-50/50 rounded-xl sm:rounded-2xl border border-slate-100 w-full lg:w-auto min-w-[140px] sm:min-w-[160px]">
                <div className="text-left select-none">
                  <span className="block text-[8px] sm:text-[9px] font-black font-mono text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Total Ideas</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl sm:text-4xl font-display font-black text-[#2563EB] tracking-tighter" id="total-ideas-count">
                      {totalPublicIdeasCount.toLocaleString()}
                    </span>
                    <div className="h-6 sm:h-7 w-1 bg-[#2563EB]/20 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Right Side: Filter Tabs */}
              <div className="flex flex-col space-y-1.5 px-2 sm:px-4 pb-1 sm:pb-0 flex-1 w-full max-w-5xl" id="time-filter-tabs">
                <span className="text-[8px] sm:text-[9px] font-black font-mono text-slate-400 uppercase tracking-widest text-left">Filter by Release Day</span>
                <div className="flex items-center p-1 sm:p-1.5 bg-slate-50/80 border border-slate-100 rounded-xl sm:rounded-2xl overflow-x-auto no-scrollbar mobile-scroll-container touch-pan-x">
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'day', label: 'Today' },
                    { id: 'week1', label: '1 Week' },
                    { id: 'week2', label: '2 Week' },
                    { id: 'month1', label: '1 Month' },
                    { id: 'month2', label: '2 Month' },
                    { id: 'month3', label: '3 Month' },
                    { id: 'month6', label: '6 Month' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      id={`time-filter-${f.id}`}
                      onClick={() => setTimeFilter(f.id as any)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 sm:space-x-2 shrink-0 ${
                        timeFilter === f.id
                          ? 'premium-gradient text-white shadow-lg scale-[1.01] z-10'
                          : 'bg-white text-slate-500 border border-slate-100 hover:text-slate-900 shadow-sm'
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] ${
                        timeFilter === f.id 
                          ? 'bg-white/10 text-white' 
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {timeFilterCounts[f.id] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Browse By Category Section */}
            <div className="space-y-2 sm:space-y-3 pt-1">
              <span className="text-[8px] sm:text-[9px] font-black font-mono text-slate-400 uppercase tracking-widest block">Browse by Category</span>
              <CategoryFilters 
                selectedCategory={selectedCategory} 
                onSelectCategory={setSelectedCategory}
                totalIdeas={totalPublicIdeasCount}
                categoryCounts={categoryCounts}
              />
            </div>

          <div className="flex flex-col space-y-4 sm:space-y-8" id="ideas-main-feed">
            {/* 1. Just Listed - Now prioritized for newest-first discovery */}
            <section id="just-listed-section">
              <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
                <div className="flex items-center space-x-3 select-none">
                  <div className="p-2 rounded-xl premium-gradient shadow-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 uppercase tracking-tight">Just Listed</h2>
                </div>
                <div className="flex items-center space-x-2.5 text-[10px] font-black font-mono text-purple-600 uppercase tracking-widest bg-purple-50 px-4 py-2 rounded-xl border border-purple-100 shadow-sm">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center -ml-2 mr-2">
                    <Star className="h-4 w-4 text-white fill-current" />
                  </div>
                  <span>Verified Feed</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                ) : (
                  recentlyListedIdeas.map(idea => (
                    <IdeaCard 
                      key={idea.id} 
                      idea={idea} 
                      onCardClick={() => handleIdeaClick(idea)}
                      onLikeClick={() => handleLikeToggle(idea.id)}
                      isLikedByUser={likedIdeaIds.includes(idea.id)}
                      isOwner={currentUser?.id === idea.founderId}
                      rowStyle="recent"
                    />
                  ))
                )}
              </div>
            </section>

            {/* 2. Trending Ideas */}
            <section id="trending-ideas-section">
              <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
                <div className="flex items-center space-x-3 select-none">
                  <div className="p-2 rounded-xl bg-emerald-500 shadow-lg border border-emerald-400/20">
                    <Flame className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 uppercase tracking-tight">Trending Ideas</h2>
                </div>
                <div className="hidden sm:flex items-center space-x-2.5 text-[10px] font-black font-mono text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Feed Validated</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                ) : (
                  trendingIdeas.map(idea => (
                    <IdeaCard 
                      key={idea.id} 
                      idea={idea} 
                      onCardClick={() => handleIdeaClick(idea)}
                      onLikeClick={() => handleLikeToggle(idea.id)}
                      isLikedByUser={likedIdeaIds.includes(idea.id)}
                      isOwner={currentUser?.id === idea.founderId}
                      rowStyle="trending"
                    />
                  ))
                )}
              </div>
            </section>

            {/* 3. Weekly Best */}
            <section id="weekly-best-section">
              <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
                <div className="flex items-center space-x-3 select-none">
                  <div className="p-2 rounded-xl bg-blue-500 shadow-lg border border-blue-400/20">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-display font-black text-slate-900 uppercase tracking-tight">Weekly Best</h2>
                </div>
                <div className="hidden sm:flex items-center space-x-2.5 text-[10px] font-black font-mono text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>Editor Choice</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
                ) : (
                  weeklyBestIdeas.map(idea => (
                    <IdeaCard 
                      key={idea.id} 
                      idea={idea} 
                      onCardClick={() => handleIdeaClick(idea)}
                      onLikeClick={() => handleLikeToggle(idea.id)}
                      isLikedByUser={likedIdeaIds.includes(idea.id)}
                      isOwner={currentUser?.id === idea.founderId}
                      rowStyle="weekly"
                    />
                  ))
                )}
              </div>
            </section>

            {/* LEADERBOARD / ALL DIRECTORY TABLE */}
            <section id="directory-leaderboard-section" className="pb-12 sm:pb-20">
              <div className="flex items-center justify-between mb-8 sm:mb-10 px-1">
                <div className="flex items-center space-x-4 select-none">
                  <div className="p-2.5 rounded-2xl bg-slate-900 shadow-xl border border-slate-800">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 uppercase tracking-tight">Startup Leaderboard</h2>
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
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400 font-bold">Initializing your secure workspace...</p>
            </div>
          )
        )}
      </main>

      {/* FOOTER METRICS SUMMARY */}
      <footer className="bg-zinc-950 text-gray-400 py-8 sm:py-12 mt-10 sm:mt-20 border-t border-zinc-900 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left space-y-6 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div className="space-y-1">
            <span className="font-display font-bold text-white text-base tracking-tight block">
              ★ VisionBoard
            </span>
            <p className="text-[10px] sm:text-[11px] text-gray-500">The database of future startup ideas. Building robust co-founder matches.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-[10px] sm:text-xs font-mono text-zinc-500">
            <span className="px-2.5 py-1 bg-zinc-900 rounded-md border border-zinc-800">
              DATABASE RECORDS: {totalPublicIdeasCount} IDEAS
            </span>
            <span>© 2026 VisionBoard Hub. Clean startup rectangles.</span>
          </div>
        </div>
      </footer>

      {/* OVERLAY FLOW MODALS AND DIALOGS */}
      
      {/* 2. Detailed View Modal (Interactive suggestion boxes + trigger collaborations) */}
      {selectedIdea && (
        <IdeaDetailsModal
          idea={selectedIdea}
          isOpen={!!selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onLike={() => handleLikeToggle(selectedIdea.id)}
          isLikedByUser={likedIdeaIds.includes(selectedIdea.id)}
          onFounderProfileClick={handleFounderProfileClick}
          currentUser={currentUser}
        />
      )}

      {/* Founder Public Profile Modal */}
      {selectedPublicProfile && (
        <PublicProfileModal
          profile={selectedPublicProfile}
          ideas={selectedFounderIdeas}
          isOpen={!!selectedPublicProfile}
          onClose={() => setSelectedPublicProfile(null)}
          onIdeaClick={(idea) => {
            setSelectedPublicProfile(null);
            setSelectedIdea(idea);
          }}
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
          onUpdateProfile={handleProfileUpdate}
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
