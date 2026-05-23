import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Sparkles, Code, Lightbulb, Users, Target, ShieldCheck, AlertCircle, Upload, Rocket } from 'lucide-react';
import { FounderProfile } from '../types';
import { supabase } from '../supabase';

interface OnboardingViewProps {
  source: 'add-idea' | 'founder-hub' | null;
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
            startup_logo_url: startupLogo || null
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
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="onboarding-portal-page">
      {/* Header Announcement */}
      <div className="mb-8 text-center sm:text-left select-none">
        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold font-mono uppercase tracking-widest rounded-full border border-blue-100">
          Onboarding Portal
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight mt-2">
          {source === 'add-idea' 
            ? 'Submit Your Concept to the Global Startup Ecosystem' 
            : 'Access Founder Hub Dashboard & Directory'}
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          {source === 'add-idea'
            ? 'Before submitting your idea, create your developer identity or startup founder profile so others know who they are matching with.'
            : 'To check peer upvotes, collaboration requests, investor letters, and match with team members, set up your builder card.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Hand: Explanatory Branding Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-205 border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 select-none shadow-[0_1px_3px_rgba(0,0,0,0.01)]" id="onboarding-info-panel">
          <div>
            <h2 className="font-display font-bold text-lg text-slate-900 tracking-tight flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />
              <span>VisionBoard Founder Code</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Our platform matches authentic profiles with clear requirements. No anonymous or robotic listing is permitted.</p>
          </div>

          <hr className="border-slate-100" />

          {/* Core Feature Checklist */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Lightbulb className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">1. Submit Startup Concepts</h4>
                <p className="text-xs text-slate-500 mt-0.5">Publish business ideas, list target audiences, problem statements, and indicate if you seek technical co-founders or investors.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">2. Bidirectional Co-Founder Matching</h4>
                <p className="text-xs text-slate-500 mt-0.5">Let design partners, fullstack engineers, and marketing experts pitch collaboration requests directly to your profile inbox.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">3. Weekly Leaderboards</h4>
                <p className="text-xs text-slate-500 mt-0.5">Gather hearts and endorsements from community mentors to climb the visionary index and gain organic validation.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">4. Secured Email Verification</h4>
                <p className="text-xs text-slate-500 mt-0.5">Verify your professional connections, keep client keys hidden, and maintain custom aesthetic profiles from your desktop.</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Stepper overview */}
          <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] uppercase font-bold font-mono text-slate-400">Onboarding Route</span>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
              <span className={`px-2 py-0.5 rounded-md ${step === 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>1. Account</span>
              <span className="text-slate-350">➔</span>
              <span className={`px-2 py-0.5 rounded-md ${step === 2 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'}`}>2. Profile Info</span>
            </div>
          </div>
        </div>

        {/* Right Hand: Actionable Onboarding Card Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md group relative" id="onboarding-form-card">
          
          {/* CRITICAL ATTENTION HIGHLIGHT NOTICE (saate impotant line ko highlight) */}
          <div className="mb-6 p-4.5 bg-amber-50/75 border-2 border-dashed border-amber-400 rounded-2xl flex items-start space-x-3 shadow-xs" id="custom-important-highlight-banner">
            <span className="bg-amber-500 text-white rounded-full h-5 w-5 flex items-center justify-center font-bold text-xs select-none shrink-0 shrink-0 shadow-sm animate-bounce">
              ★
            </span>
            <div className="text-xs">
              <span className="font-extrabold text-amber-900 block tracking-tight uppercase font-mono text-[10.5px] mb-0.5">
                ⚠️ Platform Guard: Authentication Required
              </span>
              <p className="text-amber-850 text-slate-700 leading-relaxed font-medium">
                To keep our builder database clean and co-founder networks trusted, you <strong className="text-amber-950 underline font-extrabold decoration-amber-500 decoration-2">MUST create an account or sign in</strong> before you can submit a concept or view the <strong className="text-blue-700 font-bold">Founder Hub</strong>. After login, you gain immediate access and can choose to make ideas <strong className="text-amber-700 font-bold">🔒 Private</strong> or <strong className="text-emerald-700 font-semibold">🌐 Public</strong>.
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
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-100 flex" id="onboarding-mode-selector">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setError(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                    isSignUp 
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200/40' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  ✨ Create Founder Account (Sign Up)
                </button>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setError(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                    !isSignUp 
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-200/40' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  🔑 Welcome Back (Sign In / Login)
                </button>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
                    {isSignUp ? 'Step 1: Account Specification' : 'Secure Session Verification'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isSignUp 
                    ? 'Enter your professional email so partners and investors can reach out to you.' 
                    : 'Log in with your email address to manage your startup drafts and network.'}
                </p>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-2xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-2 select-none">Full Founder Name</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        id="onboarding-name-input"
                        type="text"
                        required={isSignUp}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      dir="auto"
                      placeholder="e.g. Rachel Adams, Johnathan Doe"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-white dark:bg-slate-50 dark:text-black"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-2xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-2 select-none">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="onboarding-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rachel@startupflow.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-white dark:bg-slate-50 dark:text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-2 select-none">Security Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="onboarding-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Choose a startup passcode"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-white dark:bg-slate-50 dark:text-black"
                  />
                </div>
              </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancel & Go Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1 shadow-sm hover:translate-x-0.5 transition-all cursor-pointer"
                >
                  <span>{isSignUp ? 'Build Profile Info' : 'Sign In & Access Hub'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Profile Customization & Tagline */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Code className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">Step 2: Profile Tagging & Bio</span>
                </div>
                <p className="text-[11px] text-slate-400">Provide interesting tags and background about yourself for match-making.</p>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-2xs font-bold font-mono text-slate-400 uppercase tracking-wider select-none">Founder Biography & Vision</label>
                    <span className="text-[10px] font-mono text-slate-400">{Math.max(0, 15 - bio.trim().length)} more chars needed</span>
                  </div>
                  <textarea
                    id="onboarding-bio-textarea"
                    required
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    dir="auto"
                    placeholder="e.g. AI-focused systems software engineer with 4 years experience building backend APIs. Looking to match with creative product managers to launch standard B2B SaaS utilities."
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-white dark:bg-slate-50 dark:text-black resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-2 select-none">What Are You Building?</label>
                  <textarea
                    id="onboarding-building-desc-textarea"
                    required
                    rows={4}
                    value={buildingDesc}
                    onChange={(e) => setBuildingDesc(e.target.value)}
                    dir="auto"
                    placeholder="Tell people what you are building and why it matters..."
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 bg-white dark:bg-slate-50 dark:text-black resize-none leading-relaxed"
                  />
                </div>

                {/* Real drag-and-drop or select button upload fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5 select-none">Founder Profile Picture</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-500/50 rounded-xl p-3 bg-slate-50 hover:bg-blue-50/10 cursor-pointer relative group transition-all text-center min-h-[5.5rem]">
                      <input
                        type="file"
                        id="onboarding-avatar-file-input"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-15"
                        onChange={(e) => handleImageUpload(e, setAvatar)}
                      />
                      {avatar ? (
                        <img src={avatar} alt="Profile avatar preview" className="h-14 w-14 rounded-full object-cover border border-slate-100" />
                      ) : (
                        <div className="flex flex-col items-center select-none">
                          <Upload className="h-4.5 w-4.5 text-slate-400 mb-1" />
                          <span className="text-[10px] text-slate-600 font-bold">Upload picture</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-2xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-1.5 select-none">Startup Brand Logo</label>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-500/50 rounded-xl p-3 bg-slate-50 hover:bg-blue-50/10 cursor-pointer relative group transition-all text-center min-h-[5.5rem]">
                      <input
                        type="file"
                        id="onboarding-startup-file-input"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-15"
                        onChange={(e) => handleImageUpload(e, setStartupLogo)}
                      />
                      {startupLogo ? (
                        <img src={startupLogo} alt="Startup logo preview" className="h-14 w-14 rounded-lg object-cover border border-slate-100" />
                      ) : (
                        <div className="flex flex-col items-center select-none">
                          <Rocket className="h-4.5 w-4.5 text-slate-400 mb-1" />
                          <span className="text-[10px] text-slate-600 font-bold">Upload Startup Logo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Sparkles className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Complete Profile
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
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
