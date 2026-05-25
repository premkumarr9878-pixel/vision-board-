import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CategoryFilters from './components/CategoryFilters';
import IdeaCard from './components/IdeaCard';
import IdeaDetailsModal from './components/IdeaDetailsModal';
import AddIdeaModal from './components/AddIdeaModal';
import InterestModal from './components/InterestModal';
import DashboardView from './components/DashboardView';
import LeaderboardTable from './components/LeaderboardTable';
import { CardSkeleton, TableRowSkeleton } from './components/Skeleton';
import { getLocalStorageState, saveLocalStorageState, DEFAULT_PROFILE, safeParse } from './data';
import { StartupIdea, FounderProfile, CollaborationRequest, FundingRequest, Suggestion, RequestStatus } from './types';
import { Star, Sparkles, Send, Flame, Lightbulb, Users, Globe, ExternalLink, Search } from 'lucide-react';
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

  const [currentUser, setCurrentUser] = useState<FounderProfile | null>(DEFAULT_PROFILE);
  const [currentView, setCurrentView] = useState<'explore' | 'dashboard'>('explore');

  const fetchProfile = async (userId: string, isNewUser?: boolean) => {
    // Auth is disabled
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
      try {
        const { data: ideas, error: ideasError } = await supabase
          .from('ideas')
          .select('*')
          .order('created_at', { ascending: false });

        if (ideasError) throw ideasError;

        const mappedIdeas: StartupIdea[] = ideas.map(data => ({
          id: data.id,
          name: data.name,
          logo: data.logo,
          banner: data.banner,
          description: data.description,
          whyThisWorks: data.why_this_works,
          problemSolved: data.problem_solved,
          targetAudience: data.target_audience,
          category: data.category,
          founderId: data.founder_id,
          founderName: data.founder_name,
          founderAvatar: data.founder_avatar,
          collaborationCount: data.collaboration_count,
          fundingInterestCount: data.funding_interest_count,
          progressStage: data.progress_stage,
          likes: data.likes,
          suggestionsCount: data.suggestions_count,
          needCollaboration: data.need_collaboration,
          needFunding: data.need_funding,
          seeking_collaboration: data.seeking_collaboration,
          seeking_funding: data.seeking_funding,
          isPublic: data.is_public,
          visibility: data.visibility || (data.is_public ? 'public' : 'private'),
          status: data.status || 'published',
          createdAt: data.created_at
        }));

        // Fetch collaboration requests
        const { data: collabs, error: collabsError } = await supabase
          .from('collaboration_requests')
          .select('*');

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
          .select('*');

        const mappedSuggestions: Suggestion[] = (suggestions || []).map(s => ({
          id: s.id,
          ideaId: s.idea_id,
          founderId: s.founder_id,
          content: s.suggestion_text,
          createdAt: s.created_at,
          authorName: 'Anonymous Founder',
          authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80',
          ideaName: mappedIdeas.find(i => i.id === s.idea_id)?.name || 'Unknown Idea'
        }));

        setState(prev => ({
          ...prev,
          ideas: mappedIdeas,
          collaborations: mappedCollabs,
          funding: mappedFundings,
          suggestions: mappedSuggestions
        }));
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Set up realtime listeners
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleProfileUpdate = (updated: FounderProfile) => {
    setCurrentUser(updated);
    setState(prev => ({ ...prev, profile: updated }));
    showToast('Founder Bio updated successfully!');
  };

  // Add startup idea handler
  const handleAddIdeaSubmit = async (ideaData: Partial<StartupIdea>) => {
    if (!currentUser) return;

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
      const { error } = await supabase
        .from('ideas')
        .update(payload)
        .eq('id', ideaToEdit.id);

      if (error) {
        console.error('Error updating idea:', error);
        showToast('Failed to save changes to database.');
        return;
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

    const { data, error } = await supabase
      .from('ideas')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error creating idea:', error);
      showToast('Failed to publish to database.');
      return;
    }

    const newIdeaObj: StartupIdea = {
      id: data.id,
      name: data.name,
      logo: data.logo,
      banner: data.banner,
      description: data.description,
      whyThisWorks: data.why_this_works,
      problemSolved: data.problem_solved,
      targetAudience: data.target_audience,
      category: data.category,
      founderId: data.founder_id,
      founderName: data.founder_name,
      founderAvatar: data.founder_avatar,
      collaborationCount: data.collaboration_count,
      fundingInterestCount: data.funding_interest_count,
      progressStage: data.progress_stage,
      likes: data.likes,
      suggestionsCount: data.suggestions_count,
      needCollaboration: data.need_collaboration,
      needFunding: data.need_funding,
      seeking_collaboration: data.seeking_collaboration,
      seeking_funding: data.seeking_funding,
      isPublic: data.is_public,
      visibility: data.visibility || (data.is_public ? 'public' : 'private'),
      status: data.status || 'published',
      createdAt: data.created_at
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
  const handleDeleteIdea = async (id: string) => {
    const { error } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting idea:', error);
      showToast('Failed to delete idea.');
      return;
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

    const newVisibility = idea.visibility === 'public' ? 'private' : 'public';
    const newIsPublic = newVisibility === 'public';

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
    const isLiked = likedIdeaIds.includes(ideaId);
    const idea = state.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const newLikes = isLiked ? Math.max(0, idea.likes - 1) : idea.likes + 1;

    const { error } = await supabase
      .from('ideas')
      .update({ likes: newLikes })
      .eq('id', ideaId);

    if (error) {
      console.error('Error updating likes:', error);
      showToast('Failed to update likes.');
      return;
    }

    if (isLiked) {
      setLikedIdeaIds(prev => prev.filter(likedId => likedId !== ideaId));
    } else {
      setLikedIdeaIds(prev => [...prev, ideaId]);
    }

    setState(prev => ({
      ...prev,
      ideas: prev.ideas.map(i => 
        i.id === ideaId ? { ...i, likes: newLikes } : i
      )
    }));

    // Refresh selected modal reference to update state immediately
    if (selectedIdea && selectedIdea.id === ideaId) {
      setSelectedIdea(prev => {
        if (!prev) return null;
        return {
          ...prev,
          likes: newLikes
        };
      });
    }
  };

  // Peer Suggestions Comment boards
  const handleAddSuggestion = async (content: string, guestName?: string) => {
    if (!selectedIdea) return;

    const payload = {
      idea_id: selectedIdea.id,
      founder_id: selectedIdea.founderId,
      suggestion_text: content,
      created_at: new Date().toISOString()
    };

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

    const brandSuggestion: Suggestion = {
      id: data.id,
      ideaId: data.idea_id,
      founderId: data.founder_id,
      suggestion_text: data.suggestion_text,
      created_at: data.created_at,
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
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        about: formData.message,
        status: 'pending',
        created_at: new Date().toISOString()
      };

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

      const colRequest: CollaborationRequest = {
        id: data.id,
        ideaId: data.idea_id,
        ideaName: data.idea_name,
        founderId: data.founder_id,
        name: data.full_name,
        email: data.email,
        phone: data.phone,
        role: formData.role || 'Partner',
        message: data.about,
        status: data.status as RequestStatus,
        createdAt: data.created_at
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
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        about: formData.message,
        status: 'pending',
        created_at: new Date().toISOString()
      };

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

      const fundRequest: FundingRequest = {
        id: data.id,
        ideaId: data.idea_id,
        ideaName: data.idea_name,
        founderId: data.founder_id,
        name: data.full_name,
        email: data.email,
        phone: data.phone,
        investmentAmount: formData.investmentAmount || 'Not specified',
        message: data.about,
        status: data.status as RequestStatus,
        createdAt: data.created_at
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
    
    const { error } = await supabase
      .from(table)
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      showToast('Failed to update request status.');
      return;
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
  const filteredPublicIdeas = state.ideas.filter(idea => {
    if (!idea.isPublic || idea.status !== 'published') return false;
    
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
    }

    return matchesSearch && matchesCategory && matchesTime;
  });

  // Segregate filtered lists into TrustMRR structured grid blocks
  // 1. Trending: Sorted by upvotes & collaborations count
  const trendingIdeas = [...filteredPublicIdeas]
    .sort((a, b) => (b.likes + b.collaborationCount * 2) - (a.likes + a.collaborationCount * 2));

  // 2. Weekly Best: Ideas with scale stage, high interest rate
  const weeklyBestIdeas = [...filteredPublicIdeas]
    .filter(idea => idea.likes > 60 || idea.progressStage === 'SCALE' || idea.progressStage === 'PROTOTYPE');

  // 3. Recently Listed: Chronologically sorted
  const recentlyListedIdeas = [...filteredPublicIdeas]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
          setIdeaToEdit(null);
          setShowAddIdeaModal(true);
        }}
        onDashboardClick={() => setCurrentView('dashboard')}
        onExploreClick={() => setCurrentView('explore')}
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
              
              <div className="p-2 sm:p-3 bg-white/98 dark:bg-slate-900/98 backdrop-blur-sm rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="font-display font-black text-3xl sm:text-5xl md:text-[58px] text-slate-950 dark:text-white tracking-tighter leading-[0.95]" id="main-visionboard-headline">
                  The database of <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent block sm:inline">future startup ideas</span>
                </h2>
              </div>

              {/* Home Add Idea trigger and Search Bar alignment */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-4xl mx-auto pt-1">
                {/* HERO SEARCH BAR */}
                <div className="flex-1 w-full max-w-md relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search ideas, founders, categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-white rounded-2xl text-xs font-bold transition-all outline-none dark:text-white placeholder-slate-400 shadow-sm"
                  />
                </div>

                <button
                  id="add-idea-hero-btn"
                  onClick={() => setShowAddIdeaModal(true)}
                  className="w-full sm:w-auto px-9 py-3.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-2 border-slate-950 dark:border-white text-sm font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all select-none cursor-pointer text-center duration-200 shadow-xl"
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
                    {filteredPublicIdeas.length.toLocaleString()}
                  </span>
                </div>
                <div className="h-8 w-1 bg-blue-600 rounded-full transform group-hover:scale-y-125 transition-transform" />
              </div>

              <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-800" />

              {/* Home Filter Toggle Tabs (Time range) */}
              <div className="flex flex-col space-y-0.5 select-none" id="time-filter-tabs">
                <span className="text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center md:text-left">Filter by Release Day</span>
                <div className="flex items-center p-1 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
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
        ) : (
          /* DASHBOARD ROW (If view set to user center) */
          <DashboardView
            profile={currentUser!}
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
