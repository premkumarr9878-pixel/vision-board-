import React from 'react';
import { X, Globe, Instagram, Facebook, Twitter, Briefcase, Mail, Info, ExternalLink, ArrowLeft, Rocket, Linkedin, Github, Clock, Sparkles, MessageSquare } from 'lucide-react';
import { FounderProfile, StartupIdea } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface PublicProfileModalProps {
  profile: FounderProfile;
  ideas: StartupIdea[];
  isOpen: boolean;
  onClose: () => void;
  onIdeaClick: (idea: StartupIdea) => void;
}

const SocialIcon = ({ icon: Icon, url, label }: { icon: any, url?: string, label: string }) => {
  if (!url) return null;
  return (
    <a
      href={url.startsWith('http') ? url : `https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/80 hover:border-blue-500/50 transition-all duration-300 group shadow-lg"
      title={label}
    >
      <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
    </a>
  );
};

const SocialCard = ({ icon: Icon, label, url, username }: { icon: any, label: string, url?: string, username?: string }) => {
  if (!url) return null;
  return (
    <a
      href={url.startsWith('http') ? url : `https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 hover:border-blue-500/30 transition-all group"
    >
      <div className="p-2 rounded-lg bg-slate-900/50 text-blue-400 group-hover:text-blue-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-xs font-bold text-slate-200 truncate">{username || 'View Profile'}</p>
      </div>
    </a>
  );
};

const IdeaMiniCard = ({ idea, onClick }: { idea: StartupIdea, onClick: (idea: StartupIdea) => void }) => {
  return (
    <div 
      onClick={() => onClick(idea)}
      className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-800/20 border border-slate-700/20 hover:bg-slate-800/40 hover:border-blue-500/40 transition-all cursor-pointer group shadow-sm"
    >
      <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700/50 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform overflow-hidden shrink-0">
        {idea.logo && (idea.logo.startsWith('data:image/') || idea.logo.startsWith('http')) ? (
          <img src={idea.logo} alt={idea.name} className="w-full h-full object-cover" />
        ) : (
          idea.logo || '🚀'
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-black text-slate-100 truncate group-hover:text-blue-400 transition-colors">{idea.name}</h4>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-900/50 px-2 py-0.5 rounded-md border border-slate-700/30">{idea.category}</span>
          <span className="text-[9px] font-bold text-blue-500/80 uppercase tracking-tight">{idea.progressStage}</span>
        </div>
      </div>
      <div className="p-2 rounded-lg bg-slate-900/50 text-slate-500 group-hover:text-blue-400 transition-colors">
        <ExternalLink className="h-4 w-4" />
      </div>
    </div>
  );
};

export default function PublicProfileModal({ profile, ideas, isOpen, onClose, onIdeaClick }: PublicProfileModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-slate-900 w-full max-w-5xl rounded-[2.5rem] border border-slate-800 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close Button Mobile Only */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 z-10 p-2 bg-slate-800/50 text-white rounded-full backdrop-blur-md"
          >
            <X className="h-5 w-5" />
          </button>

          {/* LEFT COLUMN: Main Identity */}
          <div className="w-full md:w-[40%] bg-slate-950/50 p-8 flex flex-col items-center border-r border-slate-800 overflow-y-auto no-scrollbar">
            {/* Navigation Button */}
            <button
              onClick={onClose}
              className="self-start flex items-center space-x-2 px-4 py-2 bg-slate-800/40 hover:bg-slate-800/60 text-slate-300 hover:text-white rounded-xl border border-slate-700/50 transition-all cursor-pointer text-[11px] font-black uppercase tracking-widest mb-10 shadow-lg group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Idea</span>
            </button>

            {/* Profile Avatar with Glow */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl" />
              <div className="w-48 h-48 rounded-full p-1 bg-gradient-to-tr from-blue-600/50 to-purple-600/50 relative">
                <div className="w-full h-full rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800 shadow-2xl">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span className="text-6xl font-black">{profile.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Identity Info */}
            <div className="text-center space-y-4 mb-10 w-full">
              <h2 className="text-4xl font-display font-black text-white tracking-tight uppercase">
                {profile.name}
              </h2>
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 text-[11px] font-black uppercase tracking-widest shadow-sm">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{profile.profession || 'Founder / CEO'}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-[280px] mx-auto">
                {profile.buildingDesc || "Empowering innovators. Designing the future of collaboration. Let's connect and build."}
              </p>
            </div>

            {/* Social Icons Circle */}
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <SocialIcon icon={Instagram} url={profile.instagramUrl} label="Instagram" />
              <SocialIcon icon={Facebook} url={profile.facebookUrl} label="Facebook" />
              <SocialIcon icon={Twitter} url={profile.twitterUrl} label="Twitter / X" />
              <SocialIcon icon={Linkedin} url={profile.linkedinUrl} label="LinkedIn" />
              <SocialIcon icon={Github} url={profile.githubUrl} label="GitHub" />
            </div>

            {/* Contact Button */}
            <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-[1.25rem] text-sm font-black uppercase tracking-widest shadow-[0_8px_30px_-10px_rgba(59,130,246,0.5)] hover:-translate-y-1 transition-all duration-300 active:scale-95 cursor-pointer">
              Contact Founder
            </button>
          </div>

          {/* RIGHT COLUMN: Details & Ideas */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-10">
            {/* Close Button Desktop */}
            <button
              onClick={onClose}
              className="hidden md:block absolute top-8 right-8 p-2 bg-slate-800/50 hover:bg-slate-700/80 text-slate-400 hover:text-white rounded-xl border border-slate-700/50 transition-all cursor-pointer z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {/* About Section */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2">
                <div className="w-1 h-3 bg-blue-500 rounded-full" />
                <span>ABOUT FOUNDER</span>
              </h3>
              <div className="bg-slate-800/30 p-8 rounded-[2rem] border border-slate-700/30 shadow-inner">
                <p className="text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                  {profile.bio || "This founder hasn't shared their story yet, but they're building something amazing!"}
                </p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2">
                <div className="w-1 h-3 bg-purple-500 rounded-full" />
                <span>FOUNDER INFORMATION</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/30 p-8 rounded-[2rem] border border-slate-700/30">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PROFESSION</p>
                  <p className="text-xs font-bold text-slate-200">{profile.profession || 'Product Design & Strategy'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">EXPERIENCE</p>
                  <p className="text-xs font-bold text-slate-200">{profile.experience || '10+ Years in Tech'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SKILLS</p>
                  <p className="text-xs font-bold text-slate-200">
                    {profile.skills?.length > 0 ? profile.skills.join(', ') : 'Product, UX/UI, Growth, Coding'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">STARTUP INTERESTS</p>
                  <p className="text-xs font-bold text-slate-200">
                    {profile.startupInterests?.length > 0 ? profile.startupInterests.join(', ') : 'AI/ML, Collaboration'}
                  </p>
                </div>
              </div>
            </div>

            {/* Networking & Startup Ideas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Social Networking Cards */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2">
                  <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                  <span>SOCIAL & NETWORKING</span>
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <SocialCard 
                    icon={Linkedin} 
                    label="LinkedIn" 
                    url={profile.linkedinUrl} 
                    username={profile.name}
                  />
                  <SocialCard 
                    icon={Twitter} 
                    label="Twitter / X" 
                    url={profile.twitterUrl} 
                    username={profile.twitterUrl?.split('/').pop()}
                  />
                  <SocialCard 
                    icon={Github} 
                    label="GitHub" 
                    url={profile.githubUrl} 
                    username={profile.githubUrl?.split('/').pop()}
                  />
                </div>
              </div>

              {/* Startup Ideas List */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center space-x-2">
                  <div className="w-1 h-3 bg-blue-500 rounded-full" />
                  <span>PUBLIC STARTUP IDEAS</span>
                </h3>
                <div className="space-y-3">
                  {ideas.length > 0 ? (
                    ideas.map(idea => (
                      <IdeaMiniCard 
                        key={idea.id} 
                        idea={idea} 
                        onClick={onIdeaClick} 
                      />
                    ))
                  ) : (
                    <div className="p-10 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-2 opacity-50">
                      <Rocket className="h-8 w-8 text-slate-700" />
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">No public ideas yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}