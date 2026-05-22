import React, { useState } from 'react';
import { X, HelpCircle, Eye, Rocket, Send, Sparkles, Upload, Link, Info, Image as ImageIcon } from 'lucide-react';
import { StartupIdea, FounderProfile } from '../types';
import { CATEGORIES } from '../data';
import { motion, AnimatePresence } from 'motion/react';

interface AddIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ideaData: Partial<StartupIdea>) => void;
  currentUser: FounderProfile | null;
  ideaToEdit?: StartupIdea | null;
}

const PRESET_BANNERS = [
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=600', // vibrant abstract
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600', // minimalist 3d
  'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=600', // soft organic waves
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&q=80&w=600'  // glassmorphism dark teal
];

const PRESET_LOGOS = ['🚀', '🏥', '🔄', '🛡️', '🎓', '🤖', '🤝', '🚴', '📝', '⚡', '🎨', '🧩', '📈', '🌐', '🥑'];

export default function AddIdeaModal({
  isOpen,
  onClose,
  onSubmit,
  currentUser,
  ideaToEdit = null
}: AddIdeaModalProps) {
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
  const [isPublic, setIsPublic] = useState(true);

  // Social link inputs State
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

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
      setIsPublic(ideaToEdit.isPublic ?? true);
      setInstagramUrl(ideaToEdit.instagramUrl || '');
      setFacebookUrl(ideaToEdit.facebookUrl || '');
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
      setIsPublic(true);
      setInstagramUrl('');
      setFacebookUrl('');
      setWebsiteUrl('');
    }
  }, [ideaToEdit, isOpen]);

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

  if (!isOpen) return null;

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
      isPublic,
      instagramUrl,
      facebookUrl,
      websiteUrl
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
          className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md"
          id="add-idea-backdrop"
        />

        {/* Form panel container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 185 }}
          className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-2xl rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.6)] flex flex-col max-h-[90vh] overflow-hidden"
          id="add-idea-modal"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-150/40 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/20 select-none">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-450 animate-pulse" />
              </div>
              <div>
                <h2 className="font-display font-black text-lg text-slate-900 dark:text-white leading-tight">
                  {ideaToEdit ? "Edit Your Startup Idea" : "Publish a Future Startup Idea"}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {ideaToEdit ? "Modify your project settings, status, or design options." : "Draft your vision & connect with looking co-founders."}
                </p>
              </div>
            </div>
            <button
              id="close-add-idea-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all shrink-0 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form wrapper (Scrollable) */}
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

            {/* SECTION 1: Startup Branding */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 space-y-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/45 dark:border-slate-800/50 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-3 bg-blue-500 rounded-full" />
                  <div>
                    <span className="block text-[9px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none select-none">SECTION 1</span>
                    <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1 select-none">Startup Branding</span>
                  </div>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-950/60 p-0.5 rounded-lg text-[10px] self-start sm:self-auto" id="logo-type-tabs">
                  <button
                    type="button"
                    onClick={() => { setLogoType('emoji'); setLogo('🚀'); }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all duration-150 cursor-pointer ${logoType === 'emoji' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-300'}`}
                  >
                    Gallery
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLogoType('upload'); setLogo(''); }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all duration-150 cursor-pointer ${logoType === 'upload' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-300'}`}
                  >
                    Desktop Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLogoType('url'); setLogo(''); }}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all duration-150 cursor-pointer ${logoType === 'url' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs font-bold' : 'text-slate-500 hover:text-slate-950 dark:hover:text-slate-300'}`}
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
                        className="flex-1 sm:w-full py-2 px-2 border border-slate-200 dark:border-slate-830 bg-white dark:bg-slate-900 rounded-xl text-xs focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none cursor-pointer"
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
                          className="w-full py-2 px-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-[10px] placeholder-slate-400 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="sm:col-span-3">
                  <label className="block text-2xs font-extrabold font-mono text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-1.5 select-none text-[9px]">
                    Startup Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="idea-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Healthflow, ScribeAI, TaskMaster"
                    className="w-full py-2.5 px-3.5 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-155 bg-white dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Aesthetic Banner Artwork */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 space-y-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/45 dark:border-slate-800/50 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-3 bg-purple-500 rounded-full" />
                  <div>
                    <span className="block text-[9px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none select-none">SECTION 2</span>
                    <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1 select-none">Visual Identity Banner</span>
                  </div>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-950/60 p-0.5 rounded-lg text-xs self-start sm:self-auto" id="banner-type-tabs">
                  <button
                    type="button"
                    onClick={() => { setBannerType('preset'); setCustomBannerUrl(''); setSelectedBanner(PRESET_BANNERS[0]); }}
                    className={`px-3 py-1 rounded-md font-medium transition-all duration-150 cursor-pointer ${bannerType === 'preset' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs font-bold text-[10px]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white text-[10px]'}`}
                  >
                    Preset Art
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBannerType('upload'); setCustomBannerUrl(''); setSelectedBanner(''); }}
                    className={`px-3 py-1 rounded-md font-medium transition-all duration-150 cursor-pointer ${bannerType === 'upload' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs font-bold text-[10px]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white text-[10px]'}`}
                  >
                    desktop upload
                  </button>
                  <button
                    type="button"
                    onClick={() => { setBannerType('url'); setCustomBannerUrl(''); setSelectedBanner(''); }}
                    className={`px-3 py-1 rounded-md font-medium transition-all duration-150 cursor-pointer ${bannerType === 'url' ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-xs font-bold text-[10px]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white text-[10px]'}`}
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
                        className="inline-flex items-center space-x-1.5 py-2 px-3.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-705 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer select-none transition-all duration-150 hover:shadow-xs"
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

            {/* SECTION 3: Idea Category Selection */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 space-y-3.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-all">
              <div className="flex items-center space-x-2 border-b border-slate-200/45 dark:border-slate-800/50 pb-2">
                <div className="w-1.5 h-3 bg-indigo-505 bg-indigo-500 rounded-full" />
                <div>
                  <span className="block text-[9px] font-bold font-mono text-slate-400 dark:text-slate-550 uppercase tracking-widest leading-none select-none">SECTION 3</span>
                  <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1 select-none">Industry Category <span className="text-red-500 text-2xs font-semibold">* Required</span></span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5" id="form-categories-list">
                {CATEGORIES.map(cat => {
                  const isActive = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3.5 py-1.5 border rounded-xl text-[11px] font-semibold transition-all duration-[180ms] cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                        isActive 
                          ? 'bg-slate-950 dark:bg-slate-100 border-slate-950 dark:border-slate-100 text-white dark:text-slate-950 shadow-sm' 
                          : 'bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/70 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-350 dark:hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: Elevator Pitch & Problem */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 space-y-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-all">
              <div className="flex items-center space-x-2 border-b border-slate-200/45 dark:border-slate-800/50 pb-2.5">
                <div className="w-1.5 h-3 bg-emerald-500 rounded-full" />
                <div>
                  <span className="block text-[9px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none select-none">SECTION 4</span>
                  <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1 select-none">Pitch Definition & Story</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-2xs font-black font-mono text-slate-950 dark:text-white uppercase tracking-widest select-none text-[10px] bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 rounded">
                      Describe Your Idea <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[9px] font-mono text-slate-400">{description.length}/2000 chars</span>
                  </div>
                  <textarea
                    id="add-idea-desc"
                    rows={4}
                    maxLength={2000}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Summarize the product concept, core values, and features visually."
                    className="w-full py-2.5 px-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-400 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none leading-relaxed font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-black font-mono text-slate-950 dark:text-white uppercase tracking-widest mb-1.5 select-none text-[10px] bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 rounded">
                      Why this idea works <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="why-works-textarea"
                      rows={3}
                      required
                      value={whyThisWorks}
                      onChange={(e) => setWhyThisWorks(e.target.value)}
                      placeholder="Describe unique market advantages, viability, and demand."
                      className="w-full py-2.5 px-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-400 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none leading-relaxed font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-2xs font-black font-mono text-slate-950 dark:text-white uppercase tracking-widest mb-1.5 select-none text-[10px] bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 rounded">
                      Exact Problem Solved <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="problem-textarea"
                      rows={3}
                      required
                      value={problemSolved}
                      onChange={(e) => setProblemSolved(e.target.value)}
                      placeholder="Describe user pain points this idea targets directly."
                      className="w-full py-2.5 px-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-400 bg-white dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none leading-relaxed font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-black font-mono text-slate-950 dark:text-white uppercase tracking-widest mb-1.5 select-none text-[10px] bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 rounded">
                    Target Audience / Segment <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="target-audience-input"
                    type="text"
                    required
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Physicians, Node Engineers, College Students barter network"
                    className="w-full py-2.5 px-3.5 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: Optional connect URLs */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 space-y-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-all">
              <div className="flex items-center space-x-2 border-b border-slate-200/45 dark:border-slate-800/50 pb-2">
                <div className="w-1.5 h-3 bg-amber-500 rounded-full" />
                <div>
                  <span className="block text-[9px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none select-none">SECTION 5</span>
                  <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1 select-none">Optional Social & Site Links</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-450 mb-1 select-none font-bold uppercase tracking-wider font-mono">Instagram</label>
                  <input
                    id="idea-instagram-url"
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/co"
                    className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800/85 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-xs placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-450 mb-1 select-none font-bold uppercase tracking-wider font-mono">Facebook</label>
                  <input
                    id="idea-facebook-url"
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/co"
                    className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800/85 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-xs placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-450 mb-1 select-none font-bold uppercase tracking-wider font-mono">Website Pitch</label>
                  <input
                    id="idea-website-url"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://mycompany.com"
                    className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800/85 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-xs placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 6: Option Settings Config */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 space-y-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-all">
              <div className="flex items-center space-x-2 border-b border-slate-200/45 dark:border-slate-800/50 pb-2">
                <div className="w-1.5 h-3 bg-pink-500 rounded-full" />
                <div>
                  <span className="block text-[9px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none select-none">SECTION 6</span>
                  <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1 select-none">Partnership & Support Config</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="add-idea-options-layout">
                
                {/* 1. Collaboration toggler */}
                <div className={`p-4 border rounded-2xl transition-all duration-200 ${
                  needCollaboration 
                    ? 'bg-blue-50/40 border-blue-200 dark:bg-blue-950/25 dark:border-blue-900/60 shadow-xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/70'
                }`}>
                  <div className="flex items-center justify-between mb-3 select-none">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-250">Need Co-founders / Team</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="collaboration-toggle"
                        type="checkbox"
                        checked={needCollaboration}
                        onChange={(e) => setNeedCollaboration(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  {needCollaboration && (
                    <div className="space-y-1.5 animate-slide-down">
                      <label className="block text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold">Max Partners Needed</label>
                      <input
                        id="collab-limit-input"
                        type="number"
                        min={1}
                        max={100}
                        value={collaborationLimit}
                        onChange={(e) => setCollaborationLimit(parseInt(e.target.value) || 5)}
                        className="w-full py-1.5 px-3.5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-800 dark:text-white rounded-xl text-xs focus:ring-4 focus:ring-blue-500/10 outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Funding toggler */}
                <div className={`p-4 border rounded-2xl transition-all duration-200 ${
                  needFunding 
                    ? 'bg-amber-50/45 border-amber-250 dark:bg-amber-950/20 dark:border-amber-900/60 shadow-xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/70'
                }`}>
                  <div className="flex items-center justify-between mb-3 select-none">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-205">Need Funding / Investors</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        id="funding-toggle"
                        type="checkbox"
                        checked={needFunding}
                        onChange={(e) => setNeedFunding(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                  {needFunding && (
                    <div className="space-y-1.5 animate-slide-down">
                      <label className="block text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase font-bold">Funding Target Goal</label>
                      <input
                        id="funding-goal-input"
                        type="text"
                        value={fundingAmount}
                        onChange={(e) => setFundingAmount(e.target.value)}
                        placeholder="e.g. $50,000 / MVP cost"
                        className="w-full py-1.5 px-3.5 bg-white dark:bg-slate-950 border border-slate-255 dark:border-slate-800 dark:text-white rounded-xl text-xs focus:ring-4 focus:ring-amber-500/10 outline-none"
                      />
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* SECTION 7: Visibility & Stepper Stages */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 space-y-4 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-all">
              <div className="flex items-center space-x-2 border-b border-slate-200/45 dark:border-slate-800/50 pb-2">
                <div className="w-1.5 h-3 bg-cyan-500 rounded-full" />
                <div>
                  <span className="block text-[9px] font-bold font-mono text-slate-400 dark:text-slate-550 uppercase tracking-widest leading-none select-none">SECTION 7</span>
                  <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1 select-none">Deployment & Launch Status</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-2xs font-extrabold font-mono text-slate-400 dark:text-slate-550 uppercase tracking-widest mb-1.5 select-none text-[9px]">Roadmap Maturity Stage</label>
                  <select
                    id="stage-select"
                    value={progressStage}
                    onChange={(e) => setProgressStage(e.target.value as any)}
                    className="w-full py-2.5 px-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-xs focus:ring-4 focus:ring-blue-500/10 outline-none"
                  >
                    <option value="JUST IDEA NOW">JUST IDEA NOW (Concept Sketch)</option>
                    <option value="IDEATION">IDEATION (Active Blueprint & Specs)</option>
                    <option value="MVP BUILDING">MVP BUILDING (Under construction)</option>
                    <option value="PROTOTYPE">PROTOTYPE (Pre-seed demo ready)</option>
                    <option value="SCALE">SCALE (Live user production)</option>
                  </select>
                </div>

                {/* Highly Polished & Highlighted Public / Private Choices */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-2xs font-extrabold font-mono text-slate-400 dark:text-slate-550 uppercase tracking-widest select-none text-[9px]">
                      Concept Visibility Strategy <span className="text-red-500">*</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="visibility-card-selectors">
                    {/* Public Card */}
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`text-left p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start space-x-3.5 relative hover:scale-[1.015] ${
                        isPublic 
                          ? 'bg-blue-500/5 dark:bg-blue-400/5 border-blue-500/80 ring-4 ring-blue-500/5 shadow-2xs' 
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-75 hover:opacity-100 hover:border-slate-300'
                      }`}
                    >
                      {isPublic && (
                        <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                      )}
                      <div className={`p-2.5 rounded-xl shrink-0 ${isPublic ? 'bg-blue-500/10 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Eye className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className={`block text-xs font-bold leading-tight ${isPublic ? 'text-blue-950 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>
                          🌐 Public Live Pitch (Recommended)
                        </span>
                        <span className="block text-[10.5px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                          Featured directly on the homepage feed of future startup ideas so coworkers, co-founders, and investors can find you.
                        </span>
                      </div>
                    </button>

                    {/* Private Card */}
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`text-left p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start space-x-3.5 relative hover:scale-[1.015] ${
                        !isPublic 
                          ? 'bg-amber-500/5 dark:bg-amber-400/5 border-amber-505/80 border-amber-500 ring-4 ring-amber-500/5 shadow-2xs' 
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-75 hover:opacity-100 hover:border-slate-300'
                      }`}
                    >
                      {!isPublic && (
                        <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                      <div className={`p-2.5 rounded-xl shrink-0 ${!isPublic ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Rocket className="h-4.5 w-4.5 rotate-90" />
                      </div>
                      <div>
                        <span className={`block text-xs font-bold leading-tight ${!isPublic ? 'text-amber-950 dark:text-amber-200' : 'text-slate-800 dark:text-slate-300'}`}>
                          🔒 Private Draft Mode
                        </span>
                        <span className="block text-[10.5px] text-slate-505 dark:text-slate-400 mt-1.5 leading-relaxed">
                          Hidden completely from the homepage feed. Can only be accessed and managed in your secure Founder Hub dashboard.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="border-t border-slate-150/50 dark:border-slate-800/60 pt-6 flex items-center justify-end space-x-3 select-none">
              <button
                id="cancel-add-idea-btn"
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 border border-slate-205 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-705 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-850 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="submit-add-idea-btn"
                type="submit"
                className="py-2.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-750 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_16px_rgba(59,130,246,0.18)] hover:-translate-y-0.5 cursor-pointer flex items-center space-x-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{ideaToEdit ? "Save Changes" : "Publish Concept"}</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
