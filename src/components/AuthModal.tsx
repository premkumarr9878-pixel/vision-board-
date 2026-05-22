import React, { useState } from 'react';
import { X, Mail, Lock, AlertCircle, ArrowRight, Upload, User, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (
    name: string,
    email: string,
    bio?: string,
    buildingDesc?: string,
    avatar?: string,
    startupLogo?: string
  ) => void;
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

  React.useEffect(() => {
    if (isOpen) {
      setIsSignUp(defaultIsSignUp);
      setError('');
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

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all standard credentials.');
      return;
    }

    if (isSignUp) {
      if (!name) {
        setError('Please enter your full founder name.');
        return;
      }
      if (!bio || bio.trim().length < 10) {
        setError('Please tell us a bit about yourself in Biography (at least 10 characters).');
        return;
      }
      if (!buildingDesc || buildingDesc.trim().length < 15) {
        setError('Please fill in "What Are You Building?" explaining your startup (at least 15 characters).');
        return;
      }
    }

    setIsLoading(true);
    
    // Simulate database delay
    setTimeout(() => {
      setIsLoading(false);
      onAuthSuccess(
        isSignUp ? name : email.split('@')[0], 
        email, 
        isSignUp ? bio : undefined, 
        isSignUp ? buildingDesc : undefined,
        isSignUp ? avatar || undefined : undefined,
        isSignUp ? startupLogo || undefined : undefined
      );
      onClose();
    }, 800);
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
          className="relative bg-white w-full max-w-md rounded-2xl border border-gray-100 shadow-xl overflow-hidden p-6 sm:p-8"
          id="auth-modal-card"
        >
          {/* Close button */}
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Heading */}
          <div className="mb-6 text-center select-none">
            <span className="text-2xl font-bold font-display text-gray-950">
              Vision<span className="text-blue-600">Board</span>
            </span>
            <h2 className="text-xl font-bold font-display text-gray-900 mt-2">
              {isSignUp ? 'Create your Founder Account' : 'Welcome Back, Builder'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {isSignUp ? 'Join the database of future startup ideas.' : 'Access your dashboard, ideas, and collaborations.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-gray-100 mb-6" id="auth-tabs">
            <button
              id="tab-login"
              type="button"
              onClick={() => { setIsSignUp(false); setError(''); }}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 text-center transition-colors ${
                !isSignUp ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-register"
              type="button"
              onClick={() => { setIsSignUp(true); setError(''); }}
              className={`flex-1 pb-3 text-sm font-medium border-b-2 text-center transition-colors ${
                isSignUp ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Optional Signup notice */}
          {isSignUp && signupNoticeMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-[11px] leading-relaxed select-none font-medium">
              💡 {signupNoticeMessage}
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-2 text-red-600 text-xs" id="auth-error">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 select-none">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                    <input
                      id="signup-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Sarah Jenkins"
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 select-none">Biography / Tagline</label>
                  <textarea
                    id="signup-bio-input"
                    rows={2}
                    required
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g. Fullstack developer open to building AI tools and scaling with non-technical founders."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5 select-none font-semibold text-gray-900">What Are You Building?</label>
                  <textarea
                    id="signup-building-desc-input"
                    rows={3}
                    required
                    value={buildingDesc}
                    onChange={(e) => setBuildingDesc(e.target.value)}
                    placeholder="Tell people what you are building and why it matters..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 select-none">Founder Profile Picture</label>
                    <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/10 rounded-xl p-3 bg-slate-50 relative group transition-all text-center min-h-[5.5rem]">
                      <input
                        type="file"
                        id="avatar-upload-input"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        onChange={(e) => handleImageUpload(e, setAvatar)}
                      />
                      {avatar ? (
                        <img src={avatar} alt="Profile preview" className="h-14 w-14 rounded-full object-cover border border-gray-200 shadow-sm" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-4 w-4 text-gray-400 mb-1" />
                          <span className="text-[10px] text-gray-600 font-bold">Upload Pic</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5 select-none">Startup Brand Logo</label>
                    <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/10 rounded-xl p-3 bg-slate-50 relative group transition-all text-center min-h-[5.5rem]">
                      <input
                        type="file"
                        id="logo-upload-input"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        onChange={(e) => handleImageUpload(e, setStartupLogo)}
                      />
                      {startupLogo ? (
                        <img src={startupLogo} alt="Startup preview" className="h-14 w-14 rounded-lg object-cover border border-gray-200 shadow-sm" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Rocket className="h-4 w-4 text-gray-400 mb-1" />
                          <span className="text-[10px] text-gray-600 font-bold">Upload Logo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 select-none">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="auth-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 select-none">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="auth-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all shadow-sm shadow-blue-500/10 cursor-pointer disabled:opacity-50 select-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Connecting to authentication...</span>
                </>
              ) : (
                <span>{isSignUp ? 'Create Founder Account' : 'Sign In'}</span>
              )}
            </button>
          </form>

          {/* Footnotes */}
          <p className="text-[10px] text-gray-400 text-center mt-6 select-none border-t border-gray-100 pt-4">
            Using developer sandbox mode. Submissions are instantly signed with standard localized tokens.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
