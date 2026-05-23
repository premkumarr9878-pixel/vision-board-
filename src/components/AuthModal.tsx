import React, { useState } from 'react';
import { X, Mail, Lock, AlertCircle, ArrowRight, Upload, User, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  defaultIsSignUp?: boolean;
  signupNoticeMessage?: string;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onAuthSuccess,
  defaultIsSignUp = false,
  signupNoticeMessage
}: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(defaultIsSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [buildingDesc, setBuildingDesc] = useState('');
  const [avatar, setAvatar] = useState('');
  const [startupLogo, setStartupLogo] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [showOptional, setShowOptional] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsSignUp(defaultIsSignUp);
      setError('');
      setShowOptional(false);
    }
  }, [isOpen, defaultIsSignUp]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file must be less than 2MB.');
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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all standard credentials.');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
    }

    setIsLoading(true);
    setError('');
    
    try {
      if (isSignUp) {
        console.log('Attempting sign up for:', email);
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              is_new_user: true
            }
          }
        }).catch(err => {
          console.error('Sign up promise rejected:', err);
          return { data: { user: null }, error: err };
        });

        if (signUpError) {
          console.error('Supabase Sign Up Error:', signUpError);
          throw signUpError;
        }
        
        if (data?.user) {
          console.log('Sign up successful, user ID:', data.user.id);
          const { data: { session }, error: sessionError } = await supabase.auth.getSession().catch(() => ({ data: { session: null }, error: null }));
          
          if (session) {
            console.log('Session detected, redirecting to success...');
            onAuthSuccess();
            onClose();
          } else {
            console.log('No session detected, email confirmation likely required.');
            setError('Account created! Please check your email to confirm your account before signing in.');
          }
        }
      } else {
        console.log('Attempting sign in for:', email);
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        }).catch(err => {
          console.error('Sign in promise rejected:', err);
          return { data: { user: null }, error: err };
        });

        if (signInError) {
          console.error('Supabase Sign In Error:', signInError);
          if (signInError.message?.includes('Email not confirmed')) {
            throw new Error('Please confirm your email first. Check your inbox!');
          }
          throw signInError;
        }
        
        if (data?.user) {
          console.log('Sign in successful, user ID:', data.user.id);
          onAuthSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Auth handler caught error:', err);
      const msg = err.message || 'Authentication failed. Please try again.';
      if (msg.toLowerCase().includes('rate limit') || err.status === 429) {
        setError('Too many attempts. Please try again in a minute.');
      } else if (msg.toLowerCase().includes('already registered')) {
        setError('This email is already registered. Please Sign In instead.');
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm"
          id="auth-backdrop"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative bg-white dark:bg-slate-950 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8"
          id="auth-modal-card"
        >
          {/* Close button */}
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Heading */}
          <div className="mb-8 text-center select-none">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                <Rocket className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="text-2xl font-black font-display text-slate-950 dark:text-white tracking-tight">
              Vision<span className="text-blue-600">Board</span>
            </span>
            <h2 className="text-xl font-black font-display text-slate-900 dark:text-slate-100 mt-2">
              {isSignUp ? 'Create your Founder Account' : 'Welcome Back, Builder'}
            </h2>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
              {isSignUp ? 'Join the database of future startup ideas.' : 'Access your dashboard, ideas, and collaborations.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl mb-8 select-none" id="auth-tabs">
            <button
              id="tab-login"
              type="button"
              onClick={() => { setIsSignUp(false); setError(''); }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                !isSignUp ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              SIGN IN
            </button>
            <button
              id="tab-register"
              type="button"
              onClick={() => { setIsSignUp(true); setError(''); }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                isSignUp ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              SIGN UP
            </button>
          </div>

          {/* Optional Signup notice */}
          {isSignUp && signupNoticeMessage && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed select-none font-bold">
              💡 {signupNoticeMessage}
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-start space-x-2.5 text-red-600 dark:text-red-400 text-xs font-bold" id="auth-error">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span>{error}</span>
                {error.includes('Too many attempts') && (
                  <span className="text-[10px] opacity-80 underline cursor-pointer" onClick={() => setError('')}>Try again now</span>
                )}
              </div>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest select-none px-1">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      id="signup-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      dir="auto"
                      placeholder="Sahil"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-50 border-2 border-slate-100 dark:border-slate-200 rounded-2xl text-[13px] font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 dark:text-black transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest select-none px-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="auto"
                    placeholder="name@company.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-50 border-2 border-slate-100 dark:border-slate-200 rounded-2xl text-[13px] font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 dark:text-black transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest select-none px-1">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-50 border-2 border-slate-100 dark:border-slate-200 rounded-2xl text-[13px] font-bold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 dark:text-black transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-xs font-black transition-all shadow-xl hover:shadow-slate-500/20 dark:hover:shadow-white/10 cursor-pointer disabled:opacity-50 select-none flex items-center justify-center space-x-2 active:scale-[0.98] uppercase tracking-widest border-0"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <span>{isSignUp ? 'Sign Up with Email' : 'Sign In to Dashboard'}</span>
              )}
            </button>
          </form>

          {/* Footnotes */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-900 text-center select-none">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              Secured by VisionBoard Auth System v2.0
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
