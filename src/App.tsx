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
import { Star, Sparkles, Send, Flame, Lightbulb, Users, Globe, ExternalLink, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from './supabase';

// Global flag to prevent multiple auth attempts in StrictMode or rapid re-renders
let hasAttemptedAuth = false;

export default function App() {
  const [currentUser, setCurrentUser] = useState<FounderProfile | null>(DEFAULT_PROFILE);
  const [session, setSession] = useState<any>(null);

  // Load state from Supabase and sync with localStorage
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
                  console.info('Supabase Anonymous Auth is disabled. Falling back to guest mode.');
                } else {
                  console.warn('Anonymous sign-in failed:', signInError.message);
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
  const [timeFilter, setTimeFilter] = useState<'all' | 'day' | 'week1' | 'week2' | 'week3' | 'month1' | 'month2' | 'month3'>('all');

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
    const loadData = async () => {
      if (!isSupabaseConfigured) {
        // Already loaded from local storage in state initialization
        setIsLoading(false);
        return;
      }
      try {
        // Fetch ideas
        const { data: ideas, error: ideasError } = await supabase
          .from('ideas')
          .select('*')
          .order('created_at', { ascending: false });

        if (ideasError) {
          console.warn('Error fetching ideas:', ideasError.message);
          return; // Stop if we can't get basic ideas
        }

        const mappedIdeas: StartupIdea[] = (ideas || []).map(data => ({
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
          isPublic: data.is_public ?? true,
          visibility: data.visibility || (data.is_public ? 'public' : 'private'),
          status: data.status || 'published',
          createdAt: data.created_at
        }));

        // Fetch collaboration requests
        const { data: collabs, error: collabsError } = await supabase
          .from('collaboration_requests')
          .select('*');

        if (collabsError) console.warn('Error fetching collabs:', collabsError.message);

        const mappedCollabs: CollaborationRequest[] = (collabs || []).map(c => ({
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

        // Fetch funding requests
        const { data: fundings, error: fundingsError } = await supabase
          .from('funding_requests')
          .select('*');

        if (fundingsError) console.warn('Error fetching fundings:', fundingsError.message);

        const mappedFundings: FundingRequest[] = (fundings || []).map(f => ({
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

        // Fetch suggestions
        const { data: suggestions, error: suggestionsError } = await supabase
          .from('suggestions')
          .select('*, profiles!fk_suggestions_requester(name, avatar_url)');

        if (suggestionsError) console.warn('Error fetching suggestions:', suggestionsError.message);

        const mappedSuggestions: Suggestion[] = (suggestions || []).map(s => ({
          id: s.id,
          ideaId: s.idea_id,
          founderId: s.founder_id,
          content: s.suggestion_text,
          createdAt: s.created_at,
          authorName: (s as any).profiles?.name || 'Anonymous Founder',
          authorAvatar: (s as any).profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80',
          ideaName: mappedIdeas.find(i => i.id === s.idea_id)?.name || 'Unknown Idea'
        }));

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
        // Fetch user's upvoted idea IDs
        try {
          let voterId = currentUser?.id;
          if (!voterId || voterId === '00000000-0000-0000-0000-000000000000') {
            voterId = localStorage.getItem('vb_voter_id') || '';
          }

          if (voterId) {
            const { data: upvotes, error: upvotesError } = await supabase
              .from('idea_upvotes')
              .select('idea_id')
              .eq('voter_id', voterId);
            
            if (upvotesError) {
              console.warn('Error fetching liked ideas:', upvotesError.message);
            } else if (upvotes) {
              setLikedIdeaIds(upvotes.map(v => v.idea_id));
            }
          }
        } catch (upvoteErr: any) {
          console.warn('Upvote fetch error:', upvoteErr?.message || upvoteErr);
        }

        setIsLoading(false);
      }
    };

    if (currentUser) {
      loadData();
    } else {
      setIsLoading(false);
    }

    if (isSupabaseConfigured) {
      // Set up realtime listeners (scoped to visible data)
      const ideasChannel = supabase.channel('public:ideas')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, () => loadData())
        .subscribe();

      const collabsChannel = supabase.channel('public:collaboration_requests')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'collaboration_requests' }, () => loadData())
        .subscribe();

      const fundingChannel = supabase.channel('public:funding_requests')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'funding_requests' }, () => loadData())
        .subscribe();

      const suggestionsChannel = supabase.channel('public:suggestions')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'suggestions' }, () => loadData())
        .subscribe();

      return () => {
        supabase.removeChannel(ideasChannel);
        supabase.removeChannel(collabsChannel);
        supabase.removeChannel(fundingChannel);
        supabase.removeChannel(suggestionsChannel);
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
    const founderIdeas = state.ideas.filter(idea => idea.founderId === founderId && (idea.isPublic || (idea as any).is_public));
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
      likes: 1,
      suggestions_count: 0,
      need_collaboration: ideaData.needCollaboration ?? true,
      need_funding: ideaData.needFunding ?? false,
      seeking_collaboration: ideaData.seeking_collaboration ?? false,
      seeking_funding: ideaData.seeking_funding ?? false,
      is_public: ideaData.isPublic ?? true,
      visibility: (ideaData.isPublic ?? true) ? 'public' : 'private',
      status: ideaData.status || 'published',
      created_at: new Date().toISOString()
    };

    if (ideaToEdit) {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('ideas')
          .update(payload)
          .eq('id', ideaToEdit.id);

        if (error) {
          console.error('Error updating idea:', error);
          showToast('Failed to save changes to database.');
          return;
        }
      }

      setState(prev => {
        const updatedIdeas = prev.ideas.map(idea => {
          if (idea.id === ideaToEdit.id) {
            return {
              ...idea,
              ...ideaData,
              id: ideaToEdit.id,
              founderId: currentUser.id,
              founderName: currentUser.name,
              founderAvatar: currentUser.avatar,
            } as StartupIdea;
          }
          return idea;
        });
        return { ...prev, ideas: updatedIdeas };
      });
      showToast(`Saved changes for “${ideaData.name}” successfully!`);
      setIdeaToEdit(null);
      return;
    }

    let ideaId = `sim-${Math.random().toString(36).substr(2, 9)}`;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('ideas')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Error adding idea to Supabase:', error);
        showToast('Failed to save idea to database.');
        return;
      }
      if (data) ideaId = data.id;
    }

    const newIdeaObj: StartupIdea = {
      id: ideaId,
      name: payload.name,
      logo: payload.logo,
      banner: payload.banner,
      description: payload.description,
      whyThisWorks: payload.why_this_works,
      problemSolved: payload.problem_solved,
      targetAudience: payload.target_audience,
      category: payload.category,
      founderId: payload.founder_id,
      founderName: payload.founder_name,
      founderAvatar: payload.founder_avatar,
      collaborationCount: payload.collaboration_count,
      fundingInterestCount: payload.funding_interest_count,
      viewsCount: payload.views_count,
      progressStage: payload.progress_stage,
      likes: payload.likes,
      suggestionsCount: payload.suggestions_count,
      needCollaboration: payload.need_collaboration,
      needFunding: payload.need_funding,
      seeking_collaboration: payload.seeking_collaboration,
      seeking_funding: payload.seeking_funding,
      isPublic: payload.is_public,
      visibility: payload.visibility as 'public' | 'private',
      status: payload.status as 'draft' | 'published',
      createdAt: payload.created_at
    };

    // Update local state immediately for simulation/sandbox mode
    setState(prev => ({
      ...prev,
      ideas: [newIdeaObj, ...prev.ideas]
    }));

    if (isSupabaseConfigured) {
      showToast(`Published “${newIdeaObj.name}” to the global database!`);
    } else {
      showToast(`Published “${newIdeaObj.name}” (Local Simulation)`);
    }

    // Auto-like the new project
    setLikedIdeaIds(prev => [...prev, newIdeaObj.id]);
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

  // Visibility toggle for owners
  const handleToggleIdeaVisibility = async (id: string) => {
    const idea = state.ideas.find(i => i.id === id);
    if (!idea) return;

    const newVisibility: 'public' | 'private' = idea.visibility === 'public' ? 'private' : 'public';
    const newIsPublic = newVisibility === 'public';

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('ideas')
        .update({ 
          visibility: newVisibility,
          is_public: newIsPublic
        })
        .eq('id', id);

      if (error) {
        console.error('Error toggling visibility:', error);
        showToast('Failed to update visibility.');
        return;
      }
    }

    setState(prev => ({
      ...prev,
      ideas: prev.ideas.map(idea => 
        idea.id === id ? { ...idea, visibility: newVisibility, isPublic: newIsPublic } : idea
      )
    }));
    showToast(`Vision is now ${newVisibility.toUpperCase()}`);
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
        const { error } = await supabase
          .from('idea_upvotes')
          .delete()
          .match({ voter_id: voterId, idea_id: ideaId });

        if (error) {
          console.error('Error removing upvote:', error);
          setLikedIdeaIds(likedIdeaIds); // Revert on error
          showToast('Failed to remove upvote.');
          return;
        }
      }
    } else {
      // Like: Add to idea_upvotes table
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('idea_upvotes')
          .insert([{ voter_id: voterId, idea_id: ideaId }]);

        if (error) {
          // If it's a unique constraint error, the user already liked it
          if (error.code !== '23505') {
            console.error('Error adding upvote:', error);
            setLikedIdeaIds(likedIdeaIds); // Revert on error
            showToast('Failed to add upvote.');
            return;
          }
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
    return state.ideas.filter(idea => {
      // Show ideas if they are public OR private (but protected)
      const isVisibleOnFeed = idea.isPublic || (idea as any).is_public || idea.visibility === 'public' || idea.visibility === 'private';
      if (!isVisibleOnFeed || idea.status !== 'published') return false;
      
      const matchesSearch = 
        (idea.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (idea.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (idea.category?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (idea.problemSolved?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (idea.targetAudience?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory ? (idea.category === selectedCategory) : true;

      // Filter by date intervals
      const createdAt = idea.createdAt || (idea as any).created_at;
      const ideaTime = createdAt ? new Date(createdAt).getTime() : 0;
      const now = new Date().getTime();
      let matchesTime = true;
      
      if (timeFilter === 'day') {
        // Within last 24 hours
        const oneDay = 24 * 60 * 60 * 1000;
        matchesTime = now - ideaTime <= oneDay;
      } else if (timeFilter === 'week1') {
        matchesTime = now - ideaTime <= 7 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'week2') {
        matchesTime = now - ideaTime <= 14 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'week3') {
        matchesTime = now - ideaTime <= 21 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'month1') {
        matchesTime = now - ideaTime <= 30 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'month2') {
        matchesTime = now - ideaTime <= 60 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'month3') {
        matchesTime = now - ideaTime <= 90 * 24 * 60 * 60 * 1000;
      } else if (timeFilter === 'all') {
        matchesTime = true;
      }

      // Safety check for future dates or newly added ideas (allow 5 min future buffer)
      if (ideaTime > now - 300000 && ideaTime < now + 300000) {
        matchesTime = true;
      }

      return matchesSearch && matchesCategory && matchesTime;
    });
  }, [state.ideas, searchQuery, selectedCategory, timeFilter]);

  // Calculate global stats (unfiltered by search/category/time, but filtered by public status)
  // This represents the real total ideas in the database
  const totalPublicIdeasCount = useMemo(() => {
    return state.ideas.filter(idea => 
      (idea.isPublic || (idea as any).is_public || idea.visibility === 'public' || idea.visibility === 'private') && 
      (idea.status === 'published' || !idea.status)
    ).length;
  }, [state.ideas]);

  // Calculate dynamic category counts for all public ideas
  const categoryCounts = useMemo(() => {
    return state.ideas.reduce((acc, idea) => {
      if ((idea.isPublic || (idea as any).is_public || idea.visibility === 'public' || idea.visibility === 'private') && 
          (idea.status === 'published' || !idea.status)) {
        const cat = idea.category || 'Other';
        acc[cat] = (acc[cat] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [state.ideas]);

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

  // View tracking handler with session cooldown
  const handleIdeaView = async (ideaId: string) => {
    try {
      const viewerId = currentUser?.id || 'anonymous-' + (localStorage.getItem('vb_anonymous_id') || '');
      if (!localStorage.getItem('vb_anonymous_id')) {
        const newAnonId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('vb_anonymous_id', newAnonId);
      }

      const lastViewedKey = `vb_viewed_${ideaId}`;
      const lastViewed = localStorage.getItem(lastViewedKey);
      const now = Date.now();
      const cooldown = 1000 * 60 * 30; // 30 minutes cooldown

      if (lastViewed && now - parseInt(lastViewed) < cooldown) {
        return; // Skip if viewed recently in this session
      }

      // Record view in DB
      if (isSupabaseConfigured) {
        const { error } = await supabase.rpc('increment_idea_views', { idea_uuid: ideaId });
        
        if (error) {
          console.warn('View tracking sync failed:', error.message);
        } else {
          localStorage.setItem(lastViewedKey, now.toString());
        }
      } else {
        localStorage.setItem(lastViewedKey, now.toString());
      }
    } catch (err: any) {
      console.warn('Error tracking view:', err?.message || err);
    }
  };

  const handleIdeaClick = (idea: StartupIdea) => {
    const isOwner = currentUser && idea.founderId === currentUser.id;
    if (idea.visibility === 'private' && !isOwner) {
      showToast('This startup concept is protected by the founder.');
      return;
    }
    
    // Track view
    handleIdeaView(idea.id);
    setSelectedIdea(idea);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setSession(null);
    setLikedIdeaIds([]);
    showToast('Signed out successfully.');
  };

  const handleAuthClick = () => {
    // This could open an auth modal if implemented
    showToast('Authentication modal would open here.');
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#F9FAFB] dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col font-sans selection:bg-blue-500/10 selection:text-blue-900 dark:selection:text-blue-200 transition-colors">
      {/* Premium ambient radial glows */}
      <div className="absolute top-0 left-[-10%] w-[800px] h-[800px] bg-blue-500/[0.04] dark:bg-blue-600/[0.03] rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[10s]" />
      <div className="absolute bottom-[10%] right-[-10%] w-[900px] h-[900px] bg-purple-500/[0.04] dark:bg-purple-600/[0.03] rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse duration-[12s]" />
      <div className="absolute top-[30%] left-[10%] w-[500px] h-[500px] bg-cyan-500/[0.03] dark:bg-cyan-600/[0.02] rounded-full blur-[100px] pointer-events-none -z-10" />
      
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
      <main className="flex-1">
        
        {currentView === 'explore' ? (
          
          /* EXPLORE HOMEPAGE DECK (TrustMRR spacing style) */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0 space-y-2" id="explore-view">
            
            {/* Geometric Centered Headline Callout */}
            <div className="text-center max-w-4xl mx-auto space-y-1 select-none mb-1 pt-0" id="hero-centered-headline">
              
              <div className="p-2 sm:p-3 bg-white/98 dark:bg-slate-900/98 backdrop-blur-sm rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)]">
                <h2 className="font-display font-black text-3xl sm:text-5xl md:text-[58px] text-slate-950 dark:text-white tracking-tighter leading-[0.95]" id="main-visionboard-headline">
                  The database of <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-500 bg-clip-text text-transparent block sm:inline drop-shadow-sm">future startup ideas</span>
                </h2>
              </div>

              {/* Home Add Idea trigger and Search Bar alignment */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-4xl mx-auto pt-1">
                {/* HERO SEARCH BAR */}
                <div className="flex-1 w-full max-w-md relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-600 transition-colors z-10" />
                  <input
                    type="text"
                    placeholder="Search ideas, founders, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:border-blue-600/60 dark:focus:border-blue-400/60 focus:bg-white dark:focus:bg-slate-900 rounded-2xl text-xs font-bold transition-all outline-none dark:text-white placeholder-slate-400 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.02)] focus:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.1)] dark:focus:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.15)]"
                  />
                </div>

                <button
                  id="add-idea-hero-btn"
                  onClick={() => setShowAddIdeaModal(true)}
                  className="w-full sm:w-auto px-9 py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-2 border-slate-950 dark:border-white text-sm font-black rounded-2xl hover:scale-[1.03] active:scale-[0.98] transition-all select-none cursor-pointer text-center duration-300 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_10px_30px_-10px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_35px_-8px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_15px_35px_-8px_rgba(255,255,255,0.2)]"
                >
                  + Add Your Startup Idea
                </button>
              </div>
            </div>

            {/* Stats Summary Panel */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 p-2.5 bg-white dark:bg-slate-900/95 backdrop-blur-sm rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-xs" id="hero-stats-panel">
              <div className="text-center group select-none flex items-center space-x-5">
                <div>
                  <span className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-0.5 group-hover:text-blue-600 transition-colors">Total Ideas Shared</span>
                  <span className="text-2xl font-display font-black text-slate-950 dark:text-white tracking-tighter" id="total-ideas-count">
                    {totalPublicIdeasCount.toLocaleString()}
                  </span>
                </div>
                <div className="h-8 w-1 bg-blue-600 rounded-full transform group-hover:scale-y-125 transition-transform" />
              </div>

              <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-800" />

              {/* Home Filter Toggle Tabs (Time range) */}
              <div className="flex flex-col space-y-0.5 select-none" id="time-filter-tabs">
                <span className="text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center md:text-left">Filter by Release Day</span>
                <div className="flex items-center p-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All Time' },
                    { id: 'day', label: 'Today' },
                    { id: 'week1', label: '1 Week' },
                    { id: 'week2', label: '2 Week' },
                    { id: 'week3', label: '3 Week' },
                    { id: 'month1', label: '1 Month' },
                    { id: 'month2', label: '2 Month' },
                    { id: 'month3', label: '3 Month' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      id={`time-filter-${f.id}`}
                      onClick={() => setTimeFilter(f.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                        timeFilter === f.id
                          ? 'bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_12px_-2px_rgba(255,255,255,0.1)] scale-[1.05] z-10'
                          : 'text-slate-500 dark:text-slate-500 hover:text-slate-950 dark:hover:text-white'
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
                categoryCounts={categoryCounts}
              />
            </div>

          <div className="flex flex-col space-y-10" id="ideas-main-feed">
            {/* 1. Trending Ideas (Sorted by high engagement) */}
            <section id="trending-ideas-section">
              <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center space-x-3 select-none">
                  <div className="p-2 rounded-xl bg-emerald-500 shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)]">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-display font-black text-slate-950 dark:text-white uppercase tracking-tight">Trending Ideas</h2>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-black font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50/50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg border-2 border-emerald-100 dark:border-emerald-900/50 shadow-sm">
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

            {/* 2. Weekly Best (Scale stage/high upvotes) */}
            <section id="weekly-best-section">
              <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center space-x-3 select-none">
                  <div className="p-2 rounded-xl bg-blue-500 shadow-[0_8px_20px_-4px_rgba(59,130,246,0.4)]">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-display font-black text-slate-950 dark:text-white uppercase tracking-tight">Weekly Best</h2>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-black font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50/50 dark:bg-blue-950/30 px-3 py-1.5 rounded-lg border-2 border-blue-100 dark:border-blue-900/50 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span>Editor Choice</span>
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

            {/* 3. Just Listed (Latest entries) */}
            <section id="just-listed-section">
              <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center space-x-3 select-none">
                  <div className="p-2 rounded-xl bg-purple-500 shadow-[0_8px_20px_-4px_rgba(168,85,247,0.4)]">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-display font-black text-slate-950 dark:text-white uppercase tracking-tight">Just Listed</h2>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-black font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50/50 dark:bg-purple-950/30 px-3 py-1.5 rounded-lg border-2 border-purple-100 dark:border-purple-900/50 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  <span>Verified Feed</span>
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

            {/* LEADERBOARD / ALL DIRECTORY TABLE */}
            <section id="directory-leaderboard-section" className="pb-10">
              <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center space-x-3 select-none">
                  <div className="p-2 rounded-xl bg-slate-950 dark:bg-white shadow-lg shadow-slate-950/10 dark:shadow-white/5">
                    <Users className="h-5 w-5 text-white dark:text-slate-950" />
                  </div>
                  <h2 className="text-xl font-display font-black text-slate-950 dark:text-white uppercase tracking-tight">Startup Leaderboard</h2>
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
