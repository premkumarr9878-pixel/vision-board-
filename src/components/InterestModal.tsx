import React, { useState } from 'react';
import { X, Send, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: { name: string; email: string; phone: string; message: string }) => void;
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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError('Please fill in all details to apply.');
      return;
    }

    onSubmit({ name, email, phone, message });
    
    // Reset state
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-gray-950/40 backdrop-blur-xs"
          id="interest-backdrop"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative bg-white w-full max-w-md rounded-2xl border border-gray-100 shadow-2xl overflow-hidden p-6 sm:p-8"
          id="interest-modal"
        >
          {/* Close trigger */}
          <button
            id="close-interest-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-450 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Heading */}
          <div className="mb-6 select-none">
            <h2 className="text-lg font-bold font-display text-gray-950">
              {type === 'collaboration' ? 'Join as Co-founder / Partner' : 'Express Angel Funding Interest'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Submit your pitch & credentials directly to <span className="font-semibold text-blue-650">{ideaName}</span>.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-650 text-xs rounded-xl mb-4" id="interest-error">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-2xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5 select-none">Your Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="interest-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 bg-white rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-2xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5 select-none">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="interest-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 bg-white rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5 select-none">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    id="interest-phone-input"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 0192"
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 bg-white rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-2xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-1.5 select-none">
                {type === 'collaboration' ? 'Co-founder Pitch / Skills message' : 'Funding capacity & Message'}
              </label>
              <div className="relative">
                <span className="absolute top-2.5 left-3 text-gray-400">
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
                      ? 'Introduce your technical background, skills, and why you are excited to help build this...'
                      : 'State your average investment size, general criteria, and schedule a call proposal...'
                  }
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 bg-white rounded-xl text-xs placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 select-none pt-2">
              <button
                id="cancel-interest-btn"
                type="button"
                onClick={onClose}
                className="py-2 px-4 border border-gray-250 hover:border-gray-300 rounded-xl text-xs text-gray-500 transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                id="submit-interest-btn"
                type="submit"
                className="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm select-none cursor-pointer flex items-center space-x-1.5"
              >
                <Send className="h-3.5 w-3.5 animate-pulse" />
                <span>Submit Expression</span>
              </button>
            </div>

          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
