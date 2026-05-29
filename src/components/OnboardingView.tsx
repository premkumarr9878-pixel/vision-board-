import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Sparkles, Code, Lightbulb, Users, Target, ShieldCheck, AlertCircle, Upload, Rocket } from 'lucide-react';
import { FounderProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../supabase';

interface OnboardingViewProps {
  source: 'add-idea' | 'founder-hub' | 'get-started' | null;
  onComplete: () => void;
  onCancel: () => void;
}

export default function OnboardingView({ source, onComplete, onCancel }: OnboardingViewProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [buildingDesc, setBuildingDesc] = useState('');
  const [avatar, setAvatar] = useState('');
  const [startupLogo, setStartupLogo] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file size must be less than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password.trim() || password.length < 5) {
      setError('Password must be at least 5 characters long for security.');
      return;
    }

    if (!isSignUp) {
      if (!isSupabaseConfigured) {
        console.info('Supabase not configured. Simulating successful login.');
        onComplete();
        return;
      }
      setIsLoading(true);
      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        }).catch(err => ({ data: { user: null }, error: err }));

        if (signInError) throw signInError;
        
        if (data?.user) {
          onComplete();
        }
      } catch (err: any) {
        const msg = err.message || 'Login failed.';
        if (msg.toLowerCase().includes('rate limit') || err.status === 429) {
          setError('Too many attempts. Please try again later.');
        } else {
          setError(msg);
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Sign Up path: check name first before step 2
    if (!name.trim()) {
      setError('Please provide your full founder name.');
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!bio.trim() || bio.trim().length < 15) {
      setError('Please write at least 15 characters for your Biography.');
      return;
    }

    if (!buildingDesc.trim() || buildingDesc.trim().length < 15) {
      setError('Please tell us about what you are building (min 15 chars).');
      return;
    }

    setIsLoading(true);

    if (!isSupabaseConfigured) {
      console.info('Supabase not configured. Simulating successful signup.');
      setTimeout(() => {
        onComplete();
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            bio: bio || 'Founder exploring new visions.',
            building_desc: buildingDesc || 'Building the future, one idea at a time.',
            avatar_url: avatar || null,
            startup_logo_url: startupLogo || null,
            user_role: 'founder_hub'
          }
        }
      }).catch(err => ({ data: { user: null }, error: err }));

      if (signUpError) throw signUpError;
      
      if (data?.user) {
        const { data: { session } } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
        
        if (session) {
          onComplete();
        } else {
          setError('Account created! Please confirm your email, then sign in.');
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Signup failed.';
      if (msg.toLowerCase().includes('rate limit') || err.status === 429) {
        setError('Too many signup attempts. Please try again later.');
      } else if (msg.toLowerCase().includes('already registered')) {
        setError('This email is already registered. Please switch to "Welcome Back" (Sign In) instead.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16" id="onboarding-portal-page">
      {/* Header Announcement */}
      <div className="mb-10 text-center lg:text-left select-none max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/5 dark:bg-blue-400/10 text-blue-700 dark:text-blue-400 text-[10px] font-black font-mono uppercase tracking-widest rounded-full border border-blue-500/15 mb-4">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Founder Onboarding Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-950 dark:text-white tracking-tight leading-[1.1] mb-3">
          {source === 'add-idea' 
            ? 'Submit Your Concept to the Global Startup Ecosystem' 
            : source === 'founder-hub'
              ? 'Access Founder Hub Dashboard & Directory'
              : 'Choose Your Startup Path'}
        </h1>
        <p className="text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
          {source === 'add-idea'
            ? 'Before submitting your idea, create your developer identity or startup founder profile so others know who they are matching with.'
            : source === 'founder-hub'
              ? 'To check peer upvotes, collaboration requests, investor letters, and match with team members, set up your builder card.'
              : 'Join the community as a Founder or a Visionary. One account, two powerful ways to build.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Hand: Explanatory Branding Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-10 space-y-8 select-none shadow-2xl shadow-slate-200/60 dark:shadow-none relative overflow-hidden group" id="onboarding-info-panel">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
          
          <div className="relative">
            <div className="flex items-center mb-6">
              <div className="h-10 transition-transform duration-500 hover:scale-105">
                <img 
                  src="/logo.png" 
                  alt="VisionBoard Logo" 
                  className="h-full w-auto object-contain brightness-110 dark:brightness-125"
                />
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 font-bold leading-relaxed uppercase tracking-wider">Authenticity & Clarity in Matching</p>
          </div>

          <div className="space-y-6 relative">
            <div className="flex items-start space-x-4 group/item">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform duration-300 border border-blue-100 dark:border-blue-800">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-[11px] font-black text-slate-950 dark:text-white uppercase tracking-widest mb-1">1. Submit Startup Concepts</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">Publish business ideas, list target audiences, problem statements, and indicate if you seek technical co-founders or investors.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group/item">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform duration-300 border border-emerald-100 dark:border-emerald-800">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h4 className="text-[11px] font-black text-slate-950 dark:text-white uppercase tracking-widest mb-1">2. Co-Founder Matching</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">Let design partners, fullstack engineers, and marketing experts pitch collaboration requests directly to your profile inbox.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group/item">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform duration-300 border border-purple-100 dark:border-purple-800">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="text-[11px] font-black text-slate-950 dark:text-white uppercase tracking-widest mb-1">3. Weekly Leaderboards</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">Gather hearts and endorsements from community mentors to climb the visionary index and gain organic validation.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group/item">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform duration-300 border border-amber-100 dark:border-amber-800">
                <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-[11px] font-black text-slate-950 dark:text-white uppercase tracking-widest mb-1">4. Secured Email Verification</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">Verify your professional connections, keep client keys hidden, and maintain custom aesthetic profiles from your desktop.</p>
              </div>
            </div>
          </div>

          {/* Stepper overview */}
          <div className="pt-6 relative">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-5 rounded-[1.75rem] border-2 border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-black font-mono text-slate-500 dark:text-slate-400 tracking-widest">Route</span>
              <div className="flex items-center space-x-3 text-xs font-black">
                <div className="flex items-center space-x-2">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all ${step === 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>1</span>
                  <span className={step === 1 ? 'text-slate-950 dark:text-white' : 'text-slate-500'}>Account</span>
                </div>
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <div className="flex items-center space-x-2">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all ${step === 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>2</span>
                  <span className={step === 2 ? 'text-slate-950 dark:text-white' : 'text-slate-500'}>Profile Info</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Hand: Actionable Onboarding Card Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/60 dark:shadow-none group relative" id="onboarding-form-card">
          
          {/* CRITICAL ATTENTION HIGHLIGHT NOTICE (saate impotant line ko highlight) */}
          <div className="mb-10 p-5 bg-amber-500/5 dark:bg-amber-400/5 border-2 border-dashed border-amber-500/30 dark:border-amber-400/30 rounded-[1.75rem] flex items-start space-x-4" id="custom-important-highlight-banner">
            <div className="bg-amber-500 rounded-xl p-2 shadow-lg shadow-amber-500/20 shrink-0">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="text-[11px]">
              <span className="font-black text-amber-950 dark:text-amber-400 block tracking-widest uppercase font-mono mb-1">
                PLATFORM GUARD REQUIRED
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
                To keep our database clean and trusted, you <strong className="text-amber-700 dark:text-amber-500 underline decoration-amber-500/50 decoration-2 underline-offset-4">MUST authenticate</strong> before you can submit a concept or view the Hub.
              </p>
            </div>
          </div>

          {/* Validation Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-650 text-red-650 flex items-start space-x-2" id="onboarding-error-alert">
              <span className="bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10.5px] select-none shrink-0 shrink-0">!</span>
              <div>
                <span className="font-bold block mb-0.5">Onboarding validation failed</span>
                {error}
              </div>
            </div>
          )}

          {/* STEP 1: Email Onboarding Setup / Sign-In & Sign-Up Switcher */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-950/50 p-1.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 flex" id="onboarding-mode-selector">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setError(''); }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer text-center ${
                    isSignUp 
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700' 
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  ✨ Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setError(''); }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer text-center ${
                    !isSignUp 
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700' 
                      : 'text-slate-600 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  🔑 Sign In
                </button>
              </div>

              <div className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 px-1">Full Founder Name</label>
                    <div className="relative group/input">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-blue-600 transition-colors">
                        <User className="h-4.5 w-4.5" />
                      </span>
                      <input
                        id="onboarding-name-input"
                        type="text"
                        required={isSignUp}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        dir="auto"
                        placeholder="Rachel Adams"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-[13px] font-bold placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 px-1">Professional Email</label>
                  <div className="relative group/input">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-blue-600 transition-colors">
                      <Mail className="h-4.5 w-4.5" />
                    </span>
                    <input
                      id="onboarding-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rachel@startup.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-[13px] font-bold placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 px-1">Security Password</label>
                  <div className="relative group/input">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-blue-600 transition-colors">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <input
                      id="onboarding-password-input"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl text-[13px] font-bold placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 dark:text-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl flex items-center space-x-3 shadow-xl shadow-blue-500/20 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <Sparkles className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>{isSignUp ? 'Next: Profile' : 'Access Hub'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Profile Customization & Tagline */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2 px-1">
                    <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none">Founder Biography & Vision</label>
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-lg">{Math.max(0, 15 - bio.trim().length)} chars left</span>
                  </div>
                  <textarea
                    id="onboarding-bio-textarea"
                    required
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    dir="auto"
                    placeholder="e.g. AI-focused software engineer. Looking to match with creative product managers..."
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-[13px] font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 dark:text-white transition-all resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">What Are You Building?</label>
                  <textarea
                    id="onboarding-building-desc-textarea"
                    required
                    rows={3}
                    value={buildingDesc}
                    onChange={(e) => setBuildingDesc(e.target.value)}
                    dir="auto"
                    placeholder="Tell people what you are building and why it matters..."
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-[13px] font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 dark:text-white transition-all resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Founder Avatar</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50/10 cursor-pointer relative group transition-all min-h-[6rem]">
                      <input
                        type="file"
                        id="onboarding-avatar-file-input"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        onChange={(e) => handleImageUpload(e, setAvatar)}
                      />
                      {avatar ? (
                        <div className="relative">
                          <img src={avatar} alt="Preview" className="h-14 w-14 rounded-xl object-cover border-2 border-white dark:border-slate-800 shadow-md" />
                          <div className="absolute -top-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                            <Sparkles className="h-3 w-3" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm mb-2 group-hover:scale-110 transition-transform">
                            <Upload className="h-4 w-4 text-slate-400" />
                          </div>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider">Upload Photo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-1">Startup Logo</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50/10 cursor-pointer relative group transition-all min-h-[6rem]">
                      <input
                        type="file"
                        id="onboarding-startup-file-input"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        onChange={(e) => handleImageUpload(e, setStartupLogo)}
                      />
                      {startupLogo ? (
                        <div className="relative">
                          <img src={startupLogo} alt="Preview" className="h-14 w-14 rounded-xl object-cover border-2 border-white dark:border-slate-800 shadow-md" />
                          <div className="absolute -top-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm">
                            <Rocket className="h-3 w-3" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm mb-2 group-hover:scale-110 transition-transform">
                            <Rocket className="h-4 w-4 text-slate-400" />
                          </div>
                          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider">Brand Logo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-slate-950 dark:bg-white text-white dark:text-slate-950 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {isLoading ? (
                    <Sparkles className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Complete Onboarding</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Skip for Now
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
