import React, { useState } from 'react';
import { X, Mail, Lock, AlertCircle, ArrowRight, Upload, User, Rocket, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../supabase';

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
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const handleResendConfirmation = async () => {
    if (!email) return;
    if (!isSupabaseConfigured) {
      setError('Confirmation email simulated! (Supabase not configured)');
      setResendSent(true);
      return;
    }
    setResendLoading(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (resendError) throw resendError;
      setResendSent(true);
      setError('Confirmation email resent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResendLoading(false);
    }
  };

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

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!isSupabaseConfigured) {
      setIsLoading(true);
      console.info('Supabase not configured. Simulating successful auth.');
      setTimeout(() => {
        onAuthSuccess();
        onClose();
        setIsLoading(false);
      }, 1000);
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (name.trim().length < 3) {
        setError('Full name must be at least 3 characters long.');
        return;
      }
    }

    setIsLoading(true);
    setError('');
    
    try {
      const sanitizedEmail = email.trim().toLowerCase();
      
      if (isSignUp) {
        console.log('Attempting secure production sign up for:', sanitizedEmail);
        
        // 1. Strict Multi-table Pre-check for email existence
        const [{ data: inProfiles }, { data: inUsers }] = await Promise.all([
          supabase.from('profiles').select('email').eq('email', sanitizedEmail).maybeSingle(),
          supabase.from('users').select('email').eq('email', sanitizedEmail).maybeSingle()
        ]);

        if (inProfiles || inUsers) {
          setError('This email is already registered. Please login.');
          setIsLoading(false);
          return;
        }

        // 2. Production-level Supabase Auth Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            data: {
              full_name: name.trim(),
              is_new_user: true,
              user_role: 'founder_hub'
            },
            emailRedirectTo: window.location.origin
          }
        });

        if (signUpError) {
          console.error('Supabase Sign Up Error:', signUpError);
          if (signUpError.message?.toLowerCase().includes('already registered') || 
              signUpError.message?.toLowerCase().includes('already exists') ||
              signUpError.status === 422) {
            setError('This email is already registered. Please login.');
            return;
          }
          throw signUpError;
        }
        
        if (data?.user) {
          // Extra security check for unconfirmed existing identities
          if (data.user.identities && data.user.identities.length === 0) {
            setError('This email is already registered. Please login.');
            return;
          }

          console.log('Sign up successful, user ID:', data.user.id);
          if (data.session) {
            onAuthSuccess();
            onClose();
          } else {
            setError('Account created! Please check your email to confirm your account before signing in.');
          }
        }
      } else {
        console.log('Attempting secure sign in for:', sanitizedEmail);
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password
        });

        if (signInError) {
          console.error('Supabase Sign In Error:', signInError);
          if (signInError.message?.includes('Email not confirmed')) {
            setError('Please confirm your email first. Check your inbox (and spam folder)!');
            return;
          }
          if (signInError.message?.toLowerCase().includes('invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
            return;
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
      } else if (msg.toLowerCase().includes('already registered') || 
                 msg.toLowerCase().includes('unique constraint') ||
                 msg.toLowerCase().includes('already exists')) {
        setError('This email is already registered. Please login.');
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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] border-2 border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-950/20 dark:shadow-none overflow-hidden p-8 sm:p-10"
          id="auth-modal-card"
        >
          {/* Close button */}
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-500 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer z-10"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Heading */}
          <div className="mb-10 text-center select-none">
            <div className="flex justify-center mb-6">
              <div className="relative h-16 sm:h-20 group/logo transition-transform duration-500 hover:scale-105">
                <img 
                  src="/logo.png" 
                  alt="VisionBoard Logo" 
                  className="h-full w-auto object-contain brightness-110 dark:brightness-125"
                />
                <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full -z-10 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
            <h2 className="text-xl font-black font-display text-slate-950 dark:text-slate-100 mt-3 leading-tight">
              {isSignUp ? 'Create your Founder Account' : 'Sign In to VisionBoard'}
            </h2>
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-2 uppercase tracking-[0.15em]">
              {isSignUp ? 'Join the database of future startup ideas.' : 'Access your dashboard and network.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-50 dark:bg-slate-950/50 p-1.5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 mb-8 select-none" id="auth-tabs">
            <button
              id="tab-login"
              type="button"
              onClick={() => { setIsSignUp(false); setError(''); }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                !isSignUp ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700' : 'text-slate-600 hover:text-slate-950 dark:hover:text-slate-200'
              }`}
            >
              SIGN IN
            </button>
            <button
              id="tab-register"
              type="button"
              onClick={() => { setIsSignUp(true); setError(''); }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                isSignUp ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700' : 'text-slate-600 hover:text-slate-950 dark:hover:text-slate-200'
              }`}
            >
              SIGN UP
            </button>
          </div>

          {/* Optional Signup notice */}
          {isSignUp && signupNoticeMessage && (
            <div className="mb-6 p-4 bg-blue-500/5 dark:bg-blue-400/5 border border-blue-500/20 dark:border-blue-400/20 rounded-2xl text-blue-700 dark:text-blue-400 text-[11px] leading-relaxed select-none font-bold italic">
              ✨ {signupNoticeMessage}
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-2xl flex items-start space-x-3 text-red-600 dark:text-red-400 text-[11px] font-bold animate-in fade-in slide-in-from-top-2" id="auth-error">
              <div className="bg-red-600 text-white rounded-full p-1 shadow-lg shadow-red-600/20 shrink-0">
                <AlertCircle className="h-3 w-3" />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <span>{error}</span>
                {error.includes('confirm your email') && !resendSent && (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendLoading}
                    className="text-[10px] text-blue-600 dark:text-blue-400 underline hover:no-underline text-left font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Confirmation Email'}
                  </button>
                )}
                {error.includes('Too many attempts') && (
                  <span className="text-[10px] opacity-80 underline cursor-pointer" onClick={() => setError('')}>Try again now</span>
                )}
              </div>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 px-1">Full Founder Name</label>
                  <div className="relative group/input">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 group-focus-within/input:text-blue-600 transition-colors" />
                    <input
                      id="signup-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      dir="auto"
                      placeholder="Rachel Adams"
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] font-bold text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 px-1">Professional Email</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 group-focus-within/input:text-blue-600 transition-colors" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="auto"
                    placeholder="rachel@startup.com"
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] font-bold text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 px-1">Security Password</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 group-focus-within/input:text-blue-600 transition-colors" />
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] font-bold text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-4.5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-slate-950/20 dark:shadow-none hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 select-none flex items-center justify-center space-x-3 border-0"
            >
              {isLoading ? (
                <>
                  <Sparkles className="animate-spin h-4 w-4" />
                  <span>{isSignUp ? 'Creating Founder ID...' : 'Verifying Session...'}</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Join the Network' : 'Enter Dashboard'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footnotes */}
          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center select-none">
            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.25em] opacity-60">
              Secured by VisionBoard Auth System v2.0
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
