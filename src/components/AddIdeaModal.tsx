import React, { useState } from 'react';
import { X, HelpCircle, Eye, Rocket, Send, Sparkles, Upload, Link, Info, Image as ImageIcon, Users, CircleDollarSign, Handshake, Coins, Globe, Lock } from 'lucide-react';
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
      className={`w-full py-3.5 px-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-[14px] placeholder-slate-400/70 bg-white dark:bg-slate-50 dark:text-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none leading-relaxed font-sans overflow-hidden min-h-[100px] multilingual-text ${className}`}
    />
  );
};

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
  const [seekingCollaboration, setSeekingCollaboration] = useState(false);
  const [seekingFunding, setSeekingFunding] = useState(false);

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
      setSeekingCollaboration(ideaToEdit.seeking_collaboration ?? false);
      setSeekingFunding(ideaToEdit.seeking_funding ?? false);
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
      setSeekingCollaboration(false);
      setSeekingFunding(false);
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
      seeking_collaboration: seekingCollaboration,
      seeking_funding: seekingFunding,
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
                  <label className="block text-2xs font-extrabold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 select-none text-[9px]">
                    Startup Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="idea-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    dir="auto"
                    placeholder="e.g. Healthflow, ScribeAI, TaskMaster"
                    className="w-full py-2.5 px-3.5 border border-slate-200 dark:border-slate-800/80 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-155 bg-white dark:bg-slate-950 dark:text-white font-medium"
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

            {/* SECTION 3: Idea Category Selection */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/50 space-y-3.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-all">
              <div className="flex items-center space-x-2 border-b border-slate-200/45 dark:border-slate-800/50 pb-2">
                <div className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                <div>
                  <span className="block text-[9px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none select-none">SECTION 3</span>
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
                          : 'bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/70 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 4: Elevator Pitch & Problem */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 sm:p-7 rounded-[2rem] border border-slate-200/40 dark:border-slate-800/50 space-y-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all">
              <div className="flex items-center space-x-3 border-b border-slate-200/45 dark:border-slate-800/50 pb-4">
                <div className="w-2 h-4 bg-emerald-500 rounded-full" />
                <div>
                  <span className="block text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none select-none">SECTION 4</span>
                  <span className="block text-sm font-black text-slate-900 dark:text-slate-100 mt-1 select-none">Pitch Definition & Story</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <div className="flex justify-between items-center mb-2.5 px-1">
                    <label className="flex items-center space-x-2 text-[11px] font-black font-mono text-slate-700 dark:text-slate-300 uppercase tracking-widest select-none">
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
                    placeholder="Summarize the product concept, core values, and features visually. (Supports any language)"
                    className="group-hover:border-slate-300 dark:group-hover:border-slate-700"
                  />
                  <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-medium italic px-1">
                    Tip: Be clear and concise. This is the first thing people see.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <div className="flex justify-between items-center mb-2.5 px-1">
                      <label className="flex items-center space-x-2 text-[11px] font-black font-mono text-slate-700 dark:text-slate-300 uppercase tracking-widest select-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Why this idea works</span>
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {whyThisWorks.length.toLocaleString()}
                      </span>
                    </div>
                    <AutoResizeTextarea
                      id="why-works-textarea"
                      value={whyThisWorks}
                      onChange={(e) => setWhyThisWorks(e.target.value)}
                      required
                      placeholder="Unique market advantages, viability, and demand."
                      className="group-hover:border-slate-300 dark:group-hover:border-slate-700 min-h-[120px]"
                    />
                  </div>

                  <div className="group">
                    <div className="flex justify-between items-center mb-2.5 px-1">
                      <label className="flex items-center space-x-2 text-[11px] font-black font-mono text-slate-700 dark:text-slate-300 uppercase tracking-widest select-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <span>Exact Problem Solved</span>
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {problemSolved.length.toLocaleString()}
                      </span>
                    </div>
                    <AutoResizeTextarea
                      id="problem-textarea"
                      value={problemSolved}
                      onChange={(e) => setProblemSolved(e.target.value)}
                      required
                      placeholder="User pain points this idea targets directly."
                      className="group-hover:border-slate-300 dark:group-hover:border-slate-700 min-h-[120px]"
                    />
                  </div>
                </div>

                <div className="group">
                  <div className="flex justify-between items-center mb-2.5 px-1">
                    <label className="flex items-center space-x-2 text-[11px] font-black font-mono text-slate-700 dark:text-slate-300 uppercase tracking-widest select-none">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>Target Audience / Segment</span>
                      <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {targetAudience.length.toLocaleString()}
                    </span>
                  </div>
                  <input
                    id="target-audience-input"
                    type="text"
                    required
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    dir="auto"
                    placeholder="e.g. Physicians, Node Engineers, College Students..."
                    className="w-full py-4 px-4 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-[14px] font-sans font-medium placeholder-slate-400 bg-white dark:bg-slate-50 dark:text-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all group-hover:border-slate-300 dark:group-hover:border-slate-600 multilingual-text"
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
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 select-none font-bold uppercase tracking-wider font-mono">Instagram</label>
                  <input
                    id="idea-instagram-url"
                    type="url"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/co"
                    className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-xs placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 select-none font-bold uppercase tracking-wider font-mono">Facebook</label>
                  <input
                    id="idea-facebook-url"
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/co"
                    className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-xs placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1 select-none font-bold uppercase tracking-wider font-mono">Website Pitch</label>
                  <input
                    id="idea-website-url"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://mycompany.com"
                    className="w-full py-2 px-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-xl text-xs placeholder-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 6: Project Growth Strategy */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 sm:p-6 rounded-[2rem] border border-slate-200/40 dark:border-slate-800/50 space-y-8 hover:shadow-[0_4px_16px_rgba(0,0,0,0.01)] transition-all">
              <div className="flex items-center justify-between border-b border-slate-200/45 dark:border-slate-800/50 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-3 bg-blue-600 rounded-full" />
                  <div>
                    <span className="block text-[9px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none select-none">SECTION 6</span>
                    <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-1 select-none">Project Roadmap & Visibility</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* Progress Stage - Now Full Width */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none px-1">
                    Current Progress Stage <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="progress-stage-select"
                      value={progressStage}
                      onChange={(e) => setProgressStage(e.target.value as any)}
                      className="w-full py-3.5 px-4 border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white rounded-2xl text-[13px] font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="JUST IDEA NOW">JUST IDEA NOW (Concept Sketch)</option>
                      <option value="IDEATION">IDEATION (Active Blueprint & Specs)</option>
                      <option value="MVP BUILDING">MVP BUILDING (Under construction)</option>
                      <option value="PROTOTYPE">PROTOTYPE (Pre-seed demo ready)</option>
                      <option value="SCALE">SCALE (Live user production)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Rocket className="w-3 h-3 text-slate-400 rotate-180" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Highly Polished & Highlighted Public / Private Choices - Now Side-by-Side */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest select-none">
                      Idea Visibility <span className="text-red-500">*</span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="visibility-card-selectors">
                    {/* Public Card */}
                    <button
                      type="button"
                      onClick={() => setIsPublic(true)}
                      className={`group relative text-left p-5 rounded-[1.5rem] border-2 transition-all duration-300 cursor-pointer flex flex-col h-full ${
                        isPublic 
                          ? 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-500 ring-4 ring-blue-500/10 shadow-lg translate-y-[-2px]' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {isPublic && (
                        <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)] animate-pulse" />
                      )}
                      
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`p-3 rounded-2xl transition-colors duration-300 ${isPublic ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200'}`}>
                          <Globe className="h-5 w-5" />
                        </div>
                        <span className={`text-[13px] font-black leading-tight uppercase tracking-tight ${isPublic ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>
                          PUBLIC PITCH
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className={`block text-[11px] font-bold leading-relaxed ${isPublic ? 'text-blue-800/80 dark:text-blue-300/80' : 'text-slate-500 dark:text-slate-400'}`}>
                          Feature on explore feed — visible to all founders
                        </span>
                      </div>

                      {isPublic && (
                        <div className="mt-auto pt-4 flex items-center text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                          <Sparkles className="h-3 w-3 mr-1.5" />
                          Recommended
                        </div>
                      )}
                    </button>

                    {/* Private Card */}
                    <button
                      type="button"
                      onClick={() => setIsPublic(false)}
                      className={`group relative text-left p-5 rounded-[1.5rem] border-2 transition-all duration-300 cursor-pointer flex flex-col h-full ${
                        !isPublic 
                          ? 'bg-blue-50/50 dark:bg-blue-500/5 border-blue-500 ring-4 ring-blue-500/10 shadow-lg translate-y-[-2px]' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {!isPublic && (
                        <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)] animate-pulse" />
                      )}

                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`p-3 rounded-2xl transition-colors duration-300 ${!isPublic ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200'}`}>
                          <Lock className="h-5 w-5" />
                        </div>
                        <span className={`text-[13px] font-black leading-tight uppercase tracking-tight ${!isPublic ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-200'}`}>
                          PRIVATE DRAFT
                        </span>
                      </div>

                      <div className="space-y-2">
                        <span className={`block text-[11px] font-bold leading-relaxed ${!isPublic ? 'text-blue-800/80 dark:text-blue-300/80' : 'text-slate-500 dark:text-slate-400'}`}>
                          Hidden safely as personal draft
                        </span>
                      </div>

                      {!isPublic && (
                        <div className="mt-auto pt-4 flex items-center text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                          <Lock className="h-3 w-3 mr-1.5" />
                          Confidential
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 8: Collaboration & Funding */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 p-5 sm:p-7 rounded-[2rem] border border-slate-200/40 dark:border-slate-800/50 space-y-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all">
              <div className="flex flex-col space-y-1 border-b border-slate-200/45 dark:border-slate-800/50 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-4 bg-blue-500 rounded-full" />
                  <div>
                    <span className="block text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none select-none">SECTION 8</span>
                    <span className="block text-sm font-black text-slate-900 dark:text-slate-100 mt-1 select-none">Collaboration & Funding</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-5">
                  Let others know if you are open to collaboration or funding
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Card 1: Looking for Collaborator */}
                <button
                  type="button"
                  onClick={() => setSeekingCollaboration(!seekingCollaboration)}
                  className={`group flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-left ${
                    seekingCollaboration 
                      ? 'bg-blue-50/40 dark:bg-blue-500/5 border-blue-500 shadow-[0_4px_20px_rgba(59,130,246,0.08)]' 
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${seekingCollaboration ? 'bg-blue-600 text-white shadow-lg shadow-blue-200/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Handshake className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[13px] font-black tracking-tight leading-tight ${seekingCollaboration ? 'text-blue-900 dark:text-blue-100' : 'text-slate-800 dark:text-slate-200'}`}>
                        Looking for Collaborator
                      </span>
                      <span className={`text-[10px] font-bold mt-0.5 ${seekingCollaboration ? 'text-blue-700/70 dark:text-blue-300/60' : 'text-slate-500 dark:text-slate-400'}`}>
                        Open to co-founders, partners or team
                      </span>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-all duration-300 shrink-0 ml-4 ${seekingCollaboration ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${seekingCollaboration ? 'translate-x-5 scale-110' : 'translate-x-0 scale-100'}`} />
                  </div>
                </button>

                {/* Card 2: Open to Funding */}
                <button
                  type="button"
                  onClick={() => setSeekingFunding(!seekingFunding)}
                  className={`group flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer text-left ${
                    seekingFunding 
                      ? 'bg-emerald-50/40 dark:bg-emerald-500/5 border-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.08)]' 
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${seekingFunding ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Coins className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[13px] font-black tracking-tight leading-tight ${seekingFunding ? 'text-emerald-900 dark:text-emerald-100' : 'text-slate-800 dark:text-slate-200'}`}>
                        Open to Funding
                      </span>
                      <span className={`text-[10px] font-bold mt-0.5 ${seekingFunding ? 'text-emerald-700/70 dark:text-emerald-300/60' : 'text-slate-500 dark:text-slate-400'}`}>
                        Accepting interest from investors
                      </span>
                    </div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-all duration-300 shrink-0 ml-4 ${seekingFunding ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${seekingFunding ? 'translate-x-5 scale-110' : 'translate-x-0 scale-100'}`} />
                  </div>
                </button>
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
