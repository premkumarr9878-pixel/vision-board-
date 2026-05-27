import React, { useState } from 'react';
import { X, Send, User, Mail, Phone, MessageSquare, DollarSign, Briefcase, ChevronRight, Info, Handshake, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: { name: string; email: string; phone: string; message: string; role?: string; investmentAmount?: string }) => void;
  type: 'collaboration' | 'funding';
  ideaName: string;
}

export default function InterestModal({
  isOpen,
  onClose,
  onSubmit,
  type,
  ideaName
}: InterestModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError('Please fill in all details to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ 
        name, 
        email, 
        phone, 
        message, 
        role: type === 'collaboration' ? 'Partner' : undefined,
        investmentAmount: type === 'funding' ? 'Not specified' : undefined
      });
      
      // Reset state
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      onClose();
    } catch (err) {
      setError('Failed to send request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-md"
          id="interest-backdrop"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative bg-white dark:bg-slate-950 w-full max-w-xl rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800/80 shadow-2xl overflow-hidden"
          id="interest-modal"
        >
          {/* Premium Ambient Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-400/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

          {/* Close trigger */}
          <button
            id="close-interest-modal"
            onClick={onClose}
            className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-all shrink-0 cursor-pointer z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-10 sm:p-12">
            {/* Heading Section */}
            <div className="mb-10 select-none relative">
              <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] mb-6 shadow-sm border ${
                type === 'collaboration' 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800' 
                  : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800'
              }`}>
                {type === 'collaboration' ? <Handshake className="h-3 w-3" /> : <Coins className="h-3 w-3" />}
                <span>{type === 'collaboration' ? 'Collaboration Request' : 'Funding Interest'}</span>
              </div>
              
              <h2 className="text-3xl font-black font-display text-slate-950 dark:text-white tracking-tight leading-[1.1] mb-3" dir="auto">
                {type === 'collaboration' ? 'Request Collaboration' : 'Express Funding Interest'}
              </h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm" dir="auto">
                Initiate a direct connection with the founder of <span className="text-blue-600 dark:text-blue-400 font-black italic">“{ideaName}”</span>.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-2xl mb-8 font-bold flex items-center space-x-2 shadow-sm" 
                id="interest-error"
              >
                <Info className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="space-y-5 relative">
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 select-none">Full Name</label>
                  <input
                    id="interest-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    dir="auto"
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-5 py-3.5 border-2 border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-medium transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 select-none">Email Address</label>
                    <input
                      id="interest-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-5 py-3.5 border-2 border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-medium transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 select-none">Phone Number</label>
                    <input
                      id="interest-phone-input"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-5 py-3.5 border-2 border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 select-none">
                    {type === 'collaboration' ? 'Why do you want to join?' : 'Investment Message / Thesis'}
                  </label>
                  <textarea
                    id="interest-message-textarea"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    dir="auto"
                    placeholder="Tell the founder about your background and why you are interested..."
                    className="w-full px-5 py-4 border-2 border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-medium transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 select-none">
                <button
                  id="submit-interest-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:shadow-slate-500/20 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Request'}
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
