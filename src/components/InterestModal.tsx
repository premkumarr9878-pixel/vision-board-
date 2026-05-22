import React, { useState } from 'react';
import { X, Send, User, Mail, Phone, MessageSquare, DollarSign, Briefcase, ChevronRight } from 'lucide-react';
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
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
          id="interest-backdrop"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative bg-white dark:bg-slate-950 w-full max-w-xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          id="interest-modal"
        >
          {/* Decorative Background Element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none" />

          {/* Close trigger */}
          <button
            id="close-interest-modal"
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-all shrink-0 cursor-pointer z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8 sm:p-10">
            {/* Heading */}
            <div className="mb-8 select-none">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
                {type === 'collaboration' ? <Briefcase className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                <span>{type === 'collaboration' ? 'Partnership' : 'Investment'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-950 dark:text-white tracking-tight leading-tight">
                {type === 'collaboration' ? 'Join as Co-founder' : 'Invest in this Vision'}
              </h2>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">
                Connect directly with the founder of <span className="text-blue-600 dark:text-blue-400">“{ideaName}”</span>.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-2xl mb-6 font-bold flex items-center space-x-2" 
                id="interest-error"
              >
                <Info className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 select-none">Your Full Name</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      id="interest-name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-bold transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 select-none">Email Address</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        id="interest-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@gmail.com"
                        className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-bold transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 select-none">Phone Number</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                        <Phone className="h-4 w-4" />
                      </span>
                      <input
                        id="interest-phone-input"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 0192"
                        className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-bold transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {type === 'collaboration' ? (
                <div>
                  <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 select-none">Proposed Role / Collaboration Type</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      <Briefcase className="h-4 w-4" />
                    </span>
                    <select
                      id="interest-role-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-bold transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select a role...</option>
                      <option value="Technical Co-founder">Technical Co-founder</option>
                      <option value="Product Lead">Product Lead</option>
                      <option value="Marketing & Growth">Marketing & Growth</option>
                      <option value="Operations / Strategy">Operations / Strategy</option>
                      <option value="Design / UX">Design / UX</option>
                      <option value="Advisor">Advisor</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 select-none">Investment Amount</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-600 transition-colors">
                      <DollarSign className="h-4 w-4" />
                    </span>
                    <select
                      id="interest-funding-select"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-bold transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select investment range...</option>
                      <option value="$500 – $1K">$500 – $1K</option>
                      <option value="$1K – $5K">$1K – $5K</option>
                      <option value="$5K – $25K">$5K – $25K</option>
                      <option value="$25K – $100K">$25K – $100K</option>
                      <option value="Angel Investor $100K+">Angel Investor $100K+</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 select-none">
                  {type === 'collaboration' ? 'Your Pitch / Skills' : 'Investment Message'}
                </label>
                <div className="relative group">
                  <span className="absolute top-4 left-4 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                    <MessageSquare className="h-4 w-4" />
                  </span>
                  <textarea
                    id="interest-message-textarea"
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      type === 'collaboration'
                        ? 'Briefly introduce yourself and why you want to build this...'
                        : 'Share your background and what excites you about this idea...'
                    }
                    className="w-full pl-11 pr-4 py-4 border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-[1.5rem] text-xs placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:text-white font-bold transition-all resize-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 select-none">
                <button
                  id="cancel-interest-btn"
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto py-3.5 px-8 text-xs font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-interest-btn"
                  type="submit"
                  className="w-full sm:w-auto py-3.5 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition-all shadow-xl shadow-blue-500/20 active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Submit Interest</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
