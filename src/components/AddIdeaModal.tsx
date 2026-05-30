import React, { useState } from 'react';
import { X, HelpCircle, Eye, Rocket, Send, Sparkles, Upload, Link, Info, Image as ImageIcon, Users, CircleDollarSign, Globe, Lock, ArrowLeft, Instagram, Facebook, Twitter, Briefcase, GraduationCap, User, Plus, Clock, Linkedin, Github } from 'lucide-react';
import { StartupIdea, FounderProfile } from '../types';
import { CATEGORIES } from '../data';
import { motion, AnimatePresence } from 'framer-motion';

interface AddIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ideaData: Partial<StartupIdea>) => void;
  onUpdateProfile: (profile: FounderProfile) => void;
  currentUser: FounderProfile | null;
  ideaToEdit?: StartupIdea | null;
}

const PROFESSIONS = ['Developer', 'Designer', 'Student', 'Business', 'Job', 'Founder', 'Researcher', 'Other'];

const PRESET_BANNERS = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=600', // vibrant abstract
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600', // minimalist 3d
  'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600', // soft organic waves
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=600'  // glassmorphism dark teal
];

const PRESET_LOGOS = ['🚀', '🏥', '🔄', '🛡️', '🎓', '🤖', '🤝', '🚴', '📝', '⚡', '🎨', '🧩', '📈', '🌐', '🥑'];

const AutoResizeTextarea = ({
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  id,
  rows = 3,
  className = ""
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  required?: boolean;
  maxLength?: number;
  id?: string;
  rows?: number;
  className?: string;
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      id={id}
      rows={rows}
      maxLength={maxLength}
      required={required}
      value={value}
      onChange={onChange}
      dir="auto"
      placeholder={placeholder}
      className={`w-full py-3.5 px-4 border-2 border-slate-200 dark:border-slate-800 rounded-2xl placeholder-slate-500 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-500 transition-all resize-none leading-relaxed font-sans overflow-hidden min-h-[100px] font-medium multilingual-text ${className}`}
    />
  );
};

export default function AddIdeaModal({
  isOpen,
  onClose,
  onSubmit,
  onUpdateProfile,
  currentUser,
  ideaToEdit = null
}: AddIdeaModalProps) {
  const [view, setView] = useState<'idea' | 'profile'>('idea');
  
  // Idea Form State
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('🚀');
  const [logoType, setLogoType] = useState<'emoji' | 'upload' | 'url'>('emoji');
  const [bannerType, setBannerType] = useState<'preset' | 'upload' | 'url'>('preset');
  const [selectedBanner, setSelectedBanner] = useState(PRESET_BANNERS[0]);
  const [customBannerUrl, setCustomBannerUrl] = useState('');
  const [description, setDescription] = useState('');
  const [whyThisWorks, setWhyThisWorks] = useState('');
  const [problemSolved, setProblemSolved] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [category, setCategory] = useState('AI');
  
  // Option Button Section
  const [needCollaboration, setNeedCollaboration] = useState(true);
  const [collaborationLimit, setCollaborationLimit] = useState(5);
  const [needFunding, setNeedFunding] = useState(false);
  const [fundingAmount, setFundingAmount] = useState('$50,000');
  const [progressStage, setProgressStage] = useState<'JUST IDEA NOW' | 'IDEATION' | 'MVP BUILDING' | 'PROTOTYPE' | 'SCALE'>('JUST IDEA NOW');

  // Social link inputs State
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Profile Form State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileBio, setProfileBio] = useState(currentUser?.bio || '');
  const [profileProfession, setProfileProfession] = useState(currentUser?.profession || 'Developer');
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar || '');
  const [profileInstagram, setProfileInstagram] = useState(currentUser?.instagramUrl || '');
  const [profileFacebook, setProfileFacebook] = useState(currentUser?.facebookUrl || '');
  const [profileTwitter, setProfileTwitter] = useState(currentUser?.twitterUrl || '');
  const [profileLinkedin, setProfileLinkedin] = useState(currentUser?.linkedinUrl || '');
  const [profileGithub, setProfileGithub] = useState(currentUser?.githubUrl || '');
  const [profileTagline, setProfileTagline] = useState(currentUser?.buildingDesc || '');
  const [profileExperience, setProfileExperience] = useState(currentUser?.experience || '');
  const [profileSkills, setProfileSkills] = useState(currentUser?.skills?.join(', ') || '');
  const [profileInterests, setProfileInterests] = useState(currentUser?.startupInterests?.join(', ') || '');

  const [error, setError] = useState('');

  // Synchronize state when editing
  React.useEffect(() => {
    if (ideaToEdit && isOpen) {
      setName(ideaToEdit.name || '');
      setLogo(ideaToEdit.logo || '🚀');
      if (PRESET_BANNERS.includes(ideaToEdit.banner || '')) {
        setBannerType('preset');
        setSelectedBanner(ideaToEdit.banner || PRESET_BANNERS[0]);
        setCustomBannerUrl('');
      } else {
        setBannerType('url');
        setSelectedBanner('');
        setCustomBannerUrl(ideaToEdit.banner || '');
      }
      setDescription(ideaToEdit.description || '');
      setWhyThisWorks(ideaToEdit.whyThisWorks || '');
      setProblemSolved(ideaToEdit.problemSolved || '');
      setTargetAudience(ideaToEdit.targetAudience || '');
      setCategory(ideaToEdit.category || 'AI');
      setNeedCollaboration(ideaToEdit.needCollaboration ?? true);
      setCollaborationLimit(ideaToEdit.maxCollaborators ?? 5);
      setNeedFunding(ideaToEdit.needFunding ?? false);
      setFundingAmount(ideaToEdit.fundingGoal || '$50,000');
      setProgressStage(ideaToEdit.progressStage || 'JUST IDEA NOW');
      setInstagramUrl(ideaToEdit.instagramUrl || '');
      setWebsiteUrl(ideaToEdit.websiteUrl || '');
    } else if (isOpen) {
      setName('');
      setLogo('🚀');
      setBannerType('preset');
      setSelectedBanner(PRESET_BANNERS[0]);
      setCustomBannerUrl('');
      setDescription('');
      setWhyThisWorks('');
      setProblemSolved('');
      setTargetAudience('');
      setCategory('AI');
      setNeedCollaboration(true);
      setCollaborationLimit(5);
      setNeedFunding(false);
      setFundingAmount('$50,000');
      setProgressStage('JUST IDEA NOW');
      setInstagramUrl('');
      setFacebookUrl('');
      setWebsiteUrl('');
      setView('idea');
    }

    if (currentUser && isOpen) {
      setProfileName(currentUser.name);
      setProfileEmail(currentUser.email);
      setProfileBio(currentUser.bio);
      setProfileProfession(currentUser.profession || 'Developer');
      setProfileAvatar(currentUser.avatar);
      setProfileInstagram(currentUser.instagramUrl || '');
      setProfileFacebook(currentUser.facebookUrl || '');
      setProfileTwitter(currentUser.twitterUrl || '');
      setProfileLinkedin(currentUser.linkedinUrl || '');
      setProfileGithub(currentUser.githubUrl || '');
      setProfileTagline(currentUser.buildingDesc || '');
      setProfileExperience(currentUser.experience || '');
      setProfileSkills(currentUser.skills?.join(', ') || '');
      setProfileInterests(currentUser.startupInterests?.join(', ') || '');
    }
  }, [ideaToEdit, isOpen, currentUser]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setCustomBannerUrl(reader.result);
        setSelectedBanner('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setProfileAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setError('Name is required for profile.');
      return;
    }
    
    const updatedProfile: FounderProfile = {
      ...currentUser!,
      name: profileName,
      email: profileEmail,
      bio: profileBio,
      buildingDesc: profileTagline,
      profession: profileProfession,
      avatar: profileAvatar,
      instagramUrl: profileInstagram,
      facebookUrl: profileFacebook,
      twitterUrl: profileTwitter,
      linkedinUrl: profileLinkedin,
      githubUrl: profileGithub,
      experience: profileExperience,
      skills: profileSkills.split(',').map(s => s.trim()).filter(s => s),
      startupInterests: profileInterests.split(',').map(s => s.trim()).filter(s => s)
    };

    onUpdateProfile(updatedProfile);
    setView('idea');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Idea Name is required.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide an idea description.');
      return;
    }
    if (!whyThisWorks.trim()) {
      setError('Please explain why this works in the market.');
      return;
    }
    if (!problemSolved.trim()) {
      setError('Please describe the problem this idea solves.');
      return;
    }
    if (!targetAudience.trim()) {
      setError('Please specify the target audience.');
      return;
    }
    if (!category) {
      setError('Category selection is mandatory.');
      return;
    }

    const payload: Partial<StartupIdea> = {
      name,
      logo,
      banner: customBannerUrl.trim() || selectedBanner,
      description,
      whyThisWorks,
      problemSolved,
      targetAudience,
      category,
      needCollaboration,
      maxCollaborators: collaborationLimit,
      needFunding,
      fundingGoal: needFunding ? fundingAmount : undefined,
      progressStage,
      isPublic: true,
      visibility: 'public',
      instagramUrl,
      facebookUrl,
      websiteUrl,
      seeking_collaboration: needCollaboration,
      seeking_funding: needFunding
    };

    onSubmit(payload);
    
    // Reset state
    setName('');
    setDescription('');
    setWhyThisWorks('');
    setProblemSolved('');
    setTargetAudience('');
    setCategory('AI');
    setInstagramUrl('');
    setFacebookUrl('');
    setWebsiteUrl('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 dark:bg-slate-950/90 backdrop-blur-sm"
          id="add-idea-backdrop"
        />

        {/* Form panel container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 185 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-hidden"
          id="add-idea-modal"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 select-none">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600/10 rounded-xl">
                {view === 'idea' ? (
                  <Sparkles className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                ) : (
                  <User className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                )}
              </div>
              <div>
                <h2 className="font-display font-black text-lg text-slate-950 dark:text-white leading-tight">
                  {view === 'idea' 
                    ? (ideaToEdit ? "Edit Your Startup Idea" : "Publish a Future Startup Idea")
                    : "Founder Profile Details"
                  }
                </h2>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 font-bold">
                  {view === 'idea'
                    ? (ideaToEdit ? "Modify your project settings, status, or design options." : "Draft your vision & connect with looking co-founders.")
                    : "Complete your professional profile to build trust with collaborators."
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {view === 'idea' && !ideaToEdit && (
                <button
                  type="button"
                  onClick={() => setView('profile')}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-xl transition-all shadow-md cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Add Your Profile</span>
                </button>
              )}
              <button
                id="close-add-idea-btn"
                onClick={onClose}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all shrink-0 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form wrapper (Scrollable) */}
          {view === 'idea' ? (
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              
              {/* Error banner */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 dark:bg-red-500/5 border border-red-200/20 dark:border-red-550/30 rounded-xl text-xs text-red-650 dark:text-red-400" 
                  id="add-idea-error"
                >
                  {error}
                </motion.div>
              )}

            {/* SECTION 2: Identity & Branding Banner */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 space-y-4 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-100 dark:border-slate-700/50 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-3 bg-blue-600 rounded-full" />
                  <div>
                    <span className="block text-[9px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none select-none">SECTION 1</span>
                    <span className="block text-xs font-black text-slate-900 dark:text-white mt-1 select-none">Startup Branding</span>
                  </div>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg text-[10px] self-start sm:self-auto border border-slate-200 dark:border-slate-800" id="logo-type-tabs">
                  <button
                    type="button"
                    onClick={() => { setLogoType('emoji'); setLogo('🚀'); }}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all duration-150 cursor-pointer ${logoType === 'emoji' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-300'}`}
                  >
                    Gallery
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLogoType('upload'); setLogo(''); }}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all duration-150 cursor-pointer ${logoType === 'upload' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-300'}`}
                  >
                    Desktop Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLogoType('url'); setLogo(''); }}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all duration-150 cursor-pointer ${logoType === 'url' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-300'}`}
                  >
                    Picture URL
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="sm:col-span-1">
                  <div className="flex items-center space-x-2.5 sm:flex-col sm:items-stretch sm:space-x-0 sm:gap-2">
                    <div className="w-12 h-12 border-2 border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl flex items-center justify-center text-2xl select-none overflow-hidden shrink-0 shadow-2xs group hover:scale-105 transition-transform duration-200">
                      {logo && (logo.startsWith('data:image/') || logo.startsWith('http')) ? (
                        <img src={logo} alt="custom-logo" className="w-full h-full object-cover" />
                      ) : (
                        logo || '❓'
                      )}
                    </div>
                    {logoType === 'emoji' ? (
                      <select
                        id="logo-dropdown"
                        value={logo}
                        onChange={(e) => setLogo(e.target.value)}
                        className="flex-1 sm:w-full py-2 px-2 border border-slate-200 dark:border-slate-830 bg-white dark:bg-slate-900 dark:text-white rounded-xl text-xs focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none cursor-pointer"
                      >
                        {PRESET_LOGOS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    ) : logoType === 'upload' ? (
                      <div className="flex-1 sm:w-full relative">
                        <input
                          id="logo-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('logo-file-input')?.click()}
                          className="w-full py-2 px-1 border border-slate-200 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-semibold text-center truncate cursor-pointer select-none transition-all duration-150"
                        >
                          Choose avatar
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 sm:w-full">
                        <input
                          type="text"
                          placeholder="Paste image URL..."
                          value={logo.startsWith('http') ? logo : ''}
                          onChange={(e) => setLogo(e.target.value)}
                          className="w-full py-2 px-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white rounded-xl text-[10px] placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label className="block text-2xs font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 select-none text-[9px]">
                    Startup Project Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="idea-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    dir="auto"
                    placeholder="e.g. Healthflow, ScribeAI, TaskMaster"
                    className="w-full py-2.5 px-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-500 transition-all duration-155 bg-white dark:bg-slate-950 dark:text-white font-bold"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Aesthetic Banner Artwork */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 space-y-4 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-slate-100 dark:border-slate-700/50 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-3 bg-purple-600 rounded-full" />
                  <div>
                    <span className="block text-[9px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none select-none">SECTION 2</span>
                    <span className="block text-xs font-black text-slate-900 dark:text-slate-100 mt-1 select-none">Visual Identity Banner</span>
                  </div>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg text-xs self-start sm:self-auto border border-slate-200 dark:border-slate-800" id="banner-type-tabs">
                  <button
                    type="button"
                    onClick={() => { setBannerType('preset'); setCustomBannerUrl(''); setSelectedBanner(PRESET_BANNERS[0]); }}
                    className={`px-3 py-1 rounded-md font-bold transition-all duration-150 cursor-pointer ${bannerType === 'preset' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm text-[10px]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white text-[10px]'}`}
                  >
                    Preset Art
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBannerType('upload'); setCustomBannerUrl(''); setSelectedBanner(''); }}
                    className={`px-3 py-1 rounded-md font-bold transition-all duration-150 cursor-pointer ${bannerType === 'upload' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm text-[10px]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white text-[10px]'}`}
                  >
                    desktop upload
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBannerType('url'); setCustomBannerUrl(''); setSelectedBanner(''); }}
                    className={`px-3 py-1 rounded-md font-bold transition-all duration-150 cursor-pointer ${bannerType === 'url' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-sm text-[10px]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white text-[10px]'}`}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {bannerType === 'preset' && (
                <div className="grid grid-cols-4 gap-2.5" id="banner-presets">
                  {PRESET_BANNERS.map((curBanner, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setSelectedBanner(curBanner); setCustomBannerUrl(''); }}
                      className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer ${
                        selectedBanner === curBanner && !customBannerUrl ? 'border-blue-500 ring-2 ring-blue-500/15 shadow-sm' : 'border-transparent opacity-85 hover:opacity-100'
                      }`}
                    >
                      <img src={curBanner} alt="preset-banner" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {bannerType === 'upload' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-4 bg-slate-100/40 dark:bg-slate-950/20 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="w-20 h-10 bg-slate-50 dark:bg-slate-900 flex items-center justify-center rounded-lg overflow-hidden border border-slate-200/55 dark:border-slate-800 select-none shrink-0">
                      {customBannerUrl ? (
                        <img src={customBannerUrl} alt="Banner Preview" className="w-full h-full object-cover animate-fade-in" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">None</span>
                      )}
                    </div>
                    <div className="flex-1 relative">
                      <input
                        id="banner-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('banner-file-input')?.click()}
                        className="inline-flex items-center space-x-1.5 py-2 px-3.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all duration-150 hover:shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Custom Banner Landscape</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {bannerType === 'url' && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Link className="h-4 w-4" />
                  </div>
                  <input
                    id="banner-url-input"
                    type="url"
                    value={customBannerUrl}
                    onChange={(e) => setCustomBannerUrl(e.target.value)}
                    placeholder="Paste banner Image URL (e.g. https://images.unsplash.com/photo-...)"
                    className="w-full py-2.5 pl-10 pr-3.5 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs placeholder-slate-450 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-white dark:bg-slate-950 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* SECTION 3: Industry Category Selection */}
            <div className="bg-white dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 space-y-3.5 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] transition-all group">
              <div className="flex items-center space-x-2 border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-1.5 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
                <div>
                  <span className="block text-[9px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none select-none">SECTION 3</span>
                  <span className="block text-xs font-black text-slate-900 dark:text-white mt-1 select-none">Industry Category <span className="text-red-500 text-[10px] font-bold">* Required</span></span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2" id="form-categories-list">
                {CATEGORIES.map(cat => {
                  const isActive = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 border-2 rounded-xl text-[11px] font-black transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                        isActive 
                          ? 'bg-slate-950 dark:bg-white border-slate-950 dark:border-white text-white dark:text-slate-950 shadow-lg' 
                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: Elevator Pitch & Problem */}
            <div className="bg-white dark:bg-slate-900/50 p-5 sm:p-6 rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 space-y-6 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] transition-all group">
              <div className="flex items-center space-x-3 border-b-2 border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-2 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                <div>
                  <span className="block text-[9px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none select-none">SECTION 4</span>
                  <span className="block text-sm font-black text-slate-900 dark:text-white mt-1 select-none">Pitch Definition & Story</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group/field">
                  <div className="flex justify-between items-center mb-2.5 px-1">
                    <label className="flex items-center space-x-2 text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>Describe Your Idea</span>
                      <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <span className={`text-[10px] font-mono font-bold ${description.length > 180000 ? 'text-orange-500' : 'text-slate-400'}`}>
                      {description.length.toLocaleString()} / 200,000
                    </span>
                  </div>
                  <AutoResizeTextarea
                    id="add-idea-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200000}
                    required
                    placeholder="Summarize the product concept, core values, and features visually."
                    className="focus:ring-blue-500/10 group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group/field">
                    <div className="flex justify-between items-center mb-2.5 px-1">
                      <label className="flex items-center space-x-2 text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Why this idea works</span>
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                    </div>
                    <AutoResizeTextarea
                      id="why-works-textarea"
                      value={whyThisWorks}
                      onChange={(e) => setWhyThisWorks(e.target.value)}
                      required
                      placeholder="Unique market advantages and demand."
                      className="min-h-[120px] focus:ring-emerald-500/10 group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                    />
                  </div>

                  <div className="group/field">
                    <div className="flex justify-between items-center mb-2.5 px-1">
                      <label className="flex items-center space-x-2 text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <span>Exact Problem Solved</span>
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                    </div>
                    <AutoResizeTextarea
                      id="problem-textarea"
                      value={problemSolved}
                      onChange={(e) => setProblemSolved(e.target.value)}
                      required
                      placeholder="User pain points this idea targets."
                      className="min-h-[120px] focus:ring-orange-500/10 group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                    />
                  </div>
                </div>

                <div className="group/field">
                  <div className="flex justify-between items-center mb-2.5 px-1">
                    <label className="flex items-center space-x-2 text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>Target Audience / Segment</span>
                      <span className="text-red-500 ml-0.5">*</span>
                    </label>
                  </div>
                  <input
                    id="target-audience-input"
                    type="text"
                    required
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Physicians, Node Engineers, College Students..."
                    className="w-full py-3.5 px-4 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold placeholder-slate-400 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 dark:focus:border-indigo-500 transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: Optional connect URLs */}
            <div className="bg-white dark:bg-slate-900/50 p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 space-y-4 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] transition-all group">
              <div className="flex items-center space-x-2 border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                <div className="w-1.5 h-3 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
                <div>
                  <span className="block text-[9px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none select-none">SECTION 5</span>
                  <span className="block text-xs font-black text-slate-900 dark:text-white mt-1 select-none">Optional Social & Site Links</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="group/field">
                  <label className="block text-[9px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 px-1">Instagram</label>
                  <input
                    id="idea-instagram-url"
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full py-2.5 px-3.5 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-[11px] font-bold placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                  />
                </div>
                <div className="group/field">
                  <label className="block text-[9px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 px-1">Facebook</label>
                  <input
                    id="idea-facebook-url"
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full py-2.5 px-3.5 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-[11px] font-bold placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                  />
                </div>
                <div className="group/field">
                  <label className="block text-[9px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 px-1">Website Pitch</label>
                  <input
                    id="idea-website-url"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://mycompany.com"
                    className="w-full py-2.5 px-3.5 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-[11px] font-bold placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 6: Project Growth Strategy */}
            <div className="bg-white dark:bg-slate-900/50 p-5 sm:p-6 rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 space-y-8 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] transition-all group">
              <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-3 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                  <div>
                    <span className="block text-[9px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none select-none">SECTION 6</span>
                    <span className="block text-xs font-black text-slate-900 dark:text-white mt-1 select-none">Project Roadmap</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Progress Stage - Now Full Width */}
                <div className="space-y-3 group/field">
                  <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none px-1">
                    Current Progress Stage <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="progress-stage-select"
                      value={progressStage}
                      onChange={(e) => setProgressStage(e.target.value as any)}
                      className="w-full py-3.5 px-4 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-2xl text-xs font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-500 transition-all appearance-none cursor-pointer group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                    >
                      <option value="JUST IDEA NOW">JUST IDEA NOW (Concept Sketch)</option>
                      <option value="IDEATION">IDEATION (Active Blueprint & Specs)</option>
                      <option value="MVP BUILDING">MVP BUILDING (Under construction)</option>
                      <option value="PROTOTYPE">PROTOTYPE (Pre-seed demo ready)</option>
                      <option value="SCALE">SCALE (Live user production)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        <Rocket className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="border-t border-slate-100 dark:border-slate-800/60 pt-6 flex items-center justify-end space-x-3 select-none">
              <button
                id="cancel-add-idea-btn"
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="submit-add-idea-btn"
                type="submit"
                className="py-2.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_16px_rgba(59,130,246,0.18)] hover:-translate-y-0.5 cursor-pointer flex items-center space-x-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{ideaToEdit ? "Save Changes" : "Publish Concept"}</span>
              </button>
            </div>

          </form>
          ) : (
            /* Founder Profile Details Page */
            <form onSubmit={handleProfileSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
              
              {/* Error banner */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 dark:bg-red-500/5 border border-red-200/20 dark:border-red-550/30 rounded-xl text-xs text-red-650 dark:text-red-400" 
                >
                  {error}
                </motion.div>
              )}

              {/* Profile Basics */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 space-y-5">
              {/* Personal Details Section */}
              <div className="bg-white dark:bg-slate-900/50 p-5 rounded-[1.5rem] border-2 border-slate-200 dark:border-slate-800 space-y-6 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] transition-all group">
                <div className="flex items-center space-x-6">
                  <div className="relative group/avatar">
                    <div className="w-24 h-24 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-lg group-hover/avatar:border-blue-500/50 transition-colors">
                      {profileAvatar ? (
                        <img src={profileAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <User className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="profile-avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfileAvatarChange}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('profile-avatar-upload')?.click()}
                      className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
                    >
                      <Upload className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="group/field">
                      <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 px-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full py-2.5 px-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-white font-bold placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                      />
                    </div>
                    <div className="group/field">
                      <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 px-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full py-2.5 px-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-white font-bold placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group/field">
                    <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 px-1">Profession</label>
                    <div className="relative">
                      <select
                        value={profileProfession}
                        onChange={(e) => setProfileProfession(e.target.value)}
                        className="w-full py-2.5 px-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-white font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                      >
                        {PROFESSIONS.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <Briefcase className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="group/field">
                    <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 px-1">Short Tagline</label>
                    <input
                      type="text"
                      placeholder="e.g. Designing the future of collaboration"
                      value={profileTagline}
                      onChange={(e) => setProfileTagline(e.target.value)}
                      className="w-full py-2.5 px-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-white font-bold placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group/field">
                    <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 px-1">Years of Experience</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. 5+ Years in Tech"
                        value={profileExperience}
                        onChange={(e) => setProfileExperience(e.target.value)}
                        className="w-full py-2.5 px-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-white font-bold placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                      />
                      <Clock className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

              {/* Skills & Interests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 space-y-3 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] transition-all group/field">
                  <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Skills</label>
                  <input
                    type="text"
                    placeholder="e.g. React, UI/UX, Growth"
                    value={profileSkills}
                    onChange={(e) => setProfileSkills(e.target.value)}
                    className="w-full py-2.5 px-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-white font-bold placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                  />
                </div>
                <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 space-y-3 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] transition-all group/field">
                  <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Interests</label>
                  <input
                    type="text"
                    placeholder="e.g. AI/ML, SaaS, B2B"
                    value={profileInterests}
                    onChange={(e) => setProfileInterests(e.target.value)}
                    className="w-full py-2.5 px-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-white font-bold placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                  />
                </div>
              </div>

              {/* About Yourself */}
              <div className="bg-white dark:bg-slate-900/50 p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 space-y-3 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] transition-all group/field">
                <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">About Yourself</label>
                <AutoResizeTextarea
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Share your background, experience, and what drives you..."
                  className="min-h-[120px] focus:ring-blue-500/10 group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                />
              </div>

              {/* Social Links */}
              <div className="bg-white dark:bg-slate-900/50 p-5 rounded-[1.5rem] border-2 border-slate-200 dark:border-slate-800 space-y-5 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.05)] transition-all group">
                <div className="flex items-center space-x-2 border-b-2 border-slate-100 dark:border-slate-800 pb-3">
                  <div className="w-1.5 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
                  <h3 className="text-[11px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">Social Connections</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="relative group/field">
                    <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500" />
                    <input
                      type="url"
                      placeholder="Instagram URL"
                      value={profileInstagram}
                      onChange={(e) => setProfileInstagram(e.target.value)}
                      className="w-full py-2.5 pl-10 pr-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-white font-bold placeholder-slate-400 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                    />
                  </div>
                  <div className="relative group/field">
                    <Facebook className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                    <input
                      type="url"
                      placeholder="Facebook URL"
                      value={profileFacebook}
                      onChange={(e) => setProfileFacebook(e.target.value)}
                      className="w-full py-2.5 pl-10 pr-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-white font-bold placeholder-slate-400 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                    />
                  </div>
                  <div className="relative group/field">
                    <Twitter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-500" />
                    <input
                      type="url"
                      placeholder="Twitter/X URL"
                      value={profileTwitter}
                      onChange={(e) => setProfileTwitter(e.target.value)}
                      className="w-full py-2.5 pl-10 pr-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-white font-bold placeholder-slate-400 focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                    />
                  </div>
                  <div className="relative group/field">
                    <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-700" />
                    <input
                      type="url"
                      placeholder="LinkedIn URL"
                      value={profileLinkedin}
                      onChange={(e) => setProfileLinkedin(e.target.value)}
                      className="w-full py-2.5 pl-10 pr-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-white font-bold placeholder-slate-400 focus:ring-4 focus:ring-blue-700/10 focus:border-blue-700 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                    />
                  </div>
                  <div className="relative group/field">
                    <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-900 dark:text-white" />
                    <input
                      type="url"
                      placeholder="GitHub URL"
                      value={profileGithub}
                      onChange={(e) => setProfileGithub(e.target.value)}
                      className="w-full py-2.5 pl-10 pr-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-950 dark:text-white font-bold placeholder-slate-400 focus:ring-4 focus:ring-slate-500/10 focus:border-slate-500 outline-none transition-all group-hover/field:border-slate-300 dark:group-hover/field:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t-2 border-slate-100 dark:border-slate-800/60 pt-6 flex items-center justify-between select-none">
                <button
                  type="button"
                  onClick={() => setView('idea')}
                  className="flex items-center space-x-2 py-3 px-6 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Idea</span>
                </button>
                <button
                  type="submit"
                  className="py-3 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
