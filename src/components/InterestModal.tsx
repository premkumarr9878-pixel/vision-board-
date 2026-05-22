import React, { useState } from 'react';
import { X, Send, User, Mail, Phone, MessageSquare, DollarSign, Briefcase, ChevronRight, Info } from 'lucide-react';
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
  const [role, setRole] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError('Please fill in all details to proceed.');
      return;
    }

    if (type === 'collaboration' && !role.trim()) {
      setError('Please specify your proposed role.');
      return;
    }

    if (type === 'funding' && !investmentAmount.trim()) {
      setError('Please specify your investment amount.');
      return;
    }

    onSubmit({ 
      name, 
      email, 
      phone, 
      message, 
      role: type === 'collaboration' ? role : undefined,
      investmentAmount: type === 'funding' ? investmentAmount : undefined
    });
    
    // Reset state
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setInvestmentAmount('');
    setRole('');
    onClose();
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-transparent via-blue-50/10 to-transparent dark:via-blue-900/5 pointer-events-none" />

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
                {type === 'collaboration' ? <Briefcase className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                <span>{type === 'collaboration' ? 'Strategic Partnership' : 'Venture Investment'}</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-black font-display text-slate-950 dark:text-white tracking-tight leading-[1.1] mb-3" dir="auto">
                {type === 'collaboration' ? 'Join the Founding Team' : 'Back this Startup Vision'}
              </h2>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm" dir="auto">
                Initiate a direct connection with the visionary behind <span className="text-blue-600 dark:text-blue-400 font-black italic">“{ideaName}”</span>.
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
            <form onSubmit={handleSubmit} className="space-y-6 relative">
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 select-none">Full Name</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                      <User className="h-4.5 w-4.5" />
                    </span>
                    <input
                      id="interest-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      dir="auto"
                      placeholder="e.g. Alex Rivera"
                      className="w-full pl-12 pr-5 py-4 border-2 border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 rounded-[1.25rem] text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 select-none">Email Address</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                        <Mail className="h-4.5 w-4.5" />
                      </span>
                      <input
                        id="interest-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@gmail.com"
                        className="w-full pl-12 pr-5 py-4 border-2 border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 rounded-[1.25rem] text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-bold transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 select-none">Phone Number</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                        <Phone className="h-4.5 w-4.5" />
                      </span>
                      <input
                        id="interest-phone-input"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 0192"
                        className="w-full pl-12 pr-5 py-4 border-2 border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 rounded-[1.25rem] text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-bold transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {type === 'collaboration' ? (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 select-none">Proposed Role / Collaboration Type</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                      <Briefcase className="h-4.5 w-4.5" />
                    </span>
                    <select
                      id="interest-role-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-12 pr-10 py-4 border-2 border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 rounded-[1.25rem] text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-bold transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select a role...</option>
                      <option value="Technical Co-founder">Technical Co-founder</option>
                      <option value="Product Lead">Product Lead</option>
                      <option value="Marketing & Growth">Marketing & Growth</option>
                      <option value="Operations / Strategy">Operations / Strategy</option>
                      <option value="Design / UX">Design / UX</option>
                      <option value="Advisor">Advisor</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 select-none">Investment Amount</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4.5 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                      <DollarSign className="h-4.5 w-4.5" />
                    </span>
                    <select
                      id="interest-funding-select"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      className="w-full pl-12 pr-10 py-4 border-2 border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 rounded-[1.25rem] text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-bold transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select amount...</option>
                      <option value="$500 - $5,000">$500 - $5,000</option>
                      <option value="$5,000 - $20,000">$5,000 - $20,000</option>
                      <option value="$20,000 - $50,000">$20,000 - $50,000</option>
                      <option value="$50,000 - $200,000">$50,000 - $200,000</option>
                      <option value="$200,000+">$200,000+</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 select-none">
                  {type === 'collaboration' ? 'Strategic Pitch / Skills' : 'Investment Thesis / Message'}
                </label>
                <div className="relative group">
                  <span className="absolute top-4.5 left-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </span>
                  <textarea
                    id="interest-message-textarea"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    dir="auto"
                    placeholder={
                      type === 'collaboration'
                        ? 'Briefly introduce yourself and why you want to build this...'
                        : 'Share your background and what excites you about this idea...'
                    }
                    className="w-full pl-12 pr-5 py-4.5 border-2 border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 rounded-[1.5rem] text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-medium transition-all resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0 sm:space-x-6 pt-6 select-none border-t border-slate-100 dark:border-slate-800/60 mt-4">
                <button
                  id="cancel-interest-btn"
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-4 px-10 text-xs font-black text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-interest-btn"
                  type="submit"
                  className="w-full sm:w-auto py-4 px-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-[1.25rem] text-xs font-black transition-all shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2.5 group"
                >
                  <span>Transmit Interest</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
