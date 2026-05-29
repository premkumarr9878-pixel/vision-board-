import React from 'react';
import { X, Globe, Instagram, Facebook, Twitter, Briefcase, Mail, ExternalLink, ArrowLeft, Linkedin, Github, Clock, Sparkles, MessageCircle } from 'lucide-react';
import { FounderProfile, StartupIdea } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

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
      className="w-11 h-11 flex items-center justify-center rounded-full bg-slate-800/40 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/80 hover:border-blue-500/50 transition-all duration-300 group shadow-lg"
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
      className="flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-800/20 border border-slate-700/30 hover:bg-slate-800/40 hover:border-blue-500/30 transition-all group"
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

const IdeaMiniCard = ({ idea, onClick }: { idea: StartupIdea, onClick: (idea: StartupIdea) => void, key?: React.Key }) => {
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
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-slate-950 w-full max-w-6xl rounded-[2.5rem] border border-slate-800 shadow-[0_0_80px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row max-h-[92vh]"
        >
          {/* Close Button Mobile Only */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-6 right-6 z-10 p-2 bg-slate-800/50 text-white rounded-full backdrop-blur-md"
          >
            <X className="h-5 w-5" />
          </button>

          {/* LEFT COLUMN: Main Identity */}
          <div className="w-full md:w-[42%] bg-slate-950 p-8 flex flex-col items-center border-r border-slate-800/50 overflow-y-auto no-scrollbar relative">
            {/* Background Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Navigation Button */}
            <button
              onClick={onClose}
              className="self-start flex items-center space-x-2 px-4 py-2 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white rounded-xl border border-slate-800/50 transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest mb-12 shadow-lg group"
            >
              <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Idea</span>
            </button>

            {/* Profile Avatar with sophisticated Glow */}
            <div className="relative mb-10 group">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-colors duration-500" />
              <div className="w-52 h-52 rounded-full p-1.5 bg-gradient-to-tr from-blue-600/40 via-purple-600/40 to-blue-400/40 relative">
                <div className="w-full h-full rounded-full border-[6px] border-slate-950 overflow-hidden bg-slate-900 shadow-2xl relative">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span className="text-7xl font-black">{profile.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Identity Info */}
            <div className="text-center space-y-5 mb-12 w-full relative z-10">
              <h2 className="text-4xl font-display font-black text-white tracking-tight uppercase">
                {profile.name}
              </h2>
              <div className="inline-flex items-center space-x-2 px-5 py-2 bg-blue-500/5 text-blue-400 rounded-full border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.15em] shadow-sm backdrop-blur-sm">
                <Briefcase className="h-3.5 w-3.5" />
                <span>{profile.profession || 'Founder / CEO'}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-[320px] mx-auto italic opacity-90">
                "{profile.buildingDesc || "Empowering innovators. Designing the future of collaboration. Let's connect and build."}"
              </p>
            </div>

            {/* Social Icons Circle */}
            <div className="flex flex-wrap justify-center gap-4 mb-12 relative z-10">
              <SocialIcon icon={Instagram} url={profile.instagramUrl} label="Instagram" />
              <SocialIcon icon={Facebook} url={profile.facebookUrl} label="Facebook" />
              <SocialIcon icon={Twitter} url={profile.twitterUrl} label="Twitter / X" />
              <SocialIcon icon={Linkedin} url={profile.linkedinUrl} label="LinkedIn" />
              <SocialIcon icon={Github} url={profile.githubUrl} label="GitHub" />
            </div>

            {/* Contact Button */}
            <button className="w-full max-w-[280px] py-4.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-[0_15px_40px_-12px_rgba(59,130,246,0.6)] hover:-translate-y-1.5 transition-all duration-500 active:scale-95 cursor-pointer relative z-10 overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="flex items-center justify-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Contact Founder</span>
              </span>
            </button>
          </div>

          {/* RIGHT COLUMN: Details & Ideas */}
          <div className="flex-1 bg-slate-900/30 p-8 md:p-12 overflow-y-auto custom-scrollbar space-y-12 relative">
            {/* Background Decorations */}
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
            
            {/* Close Button Desktop */}
            <button
              onClick={onClose}
              className="hidden md:block absolute top-10 right-10 p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-500 hover:text-white rounded-xl border border-slate-800/50 transition-all cursor-pointer z-10 shadow-lg"
            >
              <X className="h-5 w-5" />
            </button>

            {/* About Section */}
            <div className="space-y-5">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center space-x-3">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                <span>ABOUT FOUNDER</span>
              </h3>
              <div className="bg-slate-900/60 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-800/50 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Sparkles className="h-12 w-12 text-blue-500" />
                </div>
                <p className="text-[13px] text-slate-300 leading-[1.8] font-medium whitespace-pre-line relative z-10">
                  {profile.bio || "This founder hasn't shared their story yet, but they're building something amazing!"}
                </p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="space-y-5">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center space-x-3">
                <div className="w-1.5 h-4 bg-purple-600 rounded-full" />
                <span>FOUNDER INFORMATION</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-900/40 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-800/50">
                <div className="space-y-2 p-4 rounded-2xl bg-slate-950/30 border border-slate-800/30">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                    <Briefcase className="h-3 w-3 text-blue-500" />
                    <span>PROFESSION</span>
                  </p>
                  <p className="text-xs font-bold text-slate-200">{profile.profession || 'Not Specified'}</p>
                </div>
                <div className="space-y-2 p-4 rounded-2xl bg-slate-950/30 border border-slate-800/30">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-purple-500" />
                    <span>EXPERIENCE</span>
                  </p>
                  <p className="text-xs font-bold text-slate-200">{profile.experience || 'Not Specified'}</p>
                </div>
                <div className="space-y-2 p-4 rounded-2xl bg-slate-950/30 border border-slate-800/30">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>SKILLS</span>
                  </p>
                  <p className="text-xs font-bold text-slate-200 leading-relaxed">
                    {profile.skills?.length > 0 ? profile.skills.join(', ') : 'Not Specified'}
                  </p>
                </div>
                <div className="space-y-2 p-4 rounded-2xl bg-slate-950/30 border border-slate-800/30">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center space-x-2">
                    <Rocket className="h-3 w-3 text-emerald-500" />
                    <span>STARTUP INTERESTS</span>
                  </p>
                  <p className="text-xs font-bold text-slate-200 leading-relaxed">
                    {profile.startupInterests?.length > 0 ? profile.startupInterests.join(', ') : 'Not Specified'}
                  </p>
                </div>
              </div>
            </div>

            {/* Social & Ideas Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Networking Section */}
              <div className="space-y-5">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center space-x-3">
                  <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                  <span>SOCIAL & NETWORKING</span>
                </h3>
                <div className="grid grid-cols-1 gap-3.5">
                  <SocialCard icon={Linkedin} label="LinkedIn" url={profile.linkedinUrl} username={profile.name} />
                  <SocialCard icon={Twitter} label="Twitter / X" url={profile.twitterUrl} username={profile.twitterUrl?.split('/').pop()} />
                  <SocialCard icon={Github} label="GitHub" url={profile.githubUrl} username={profile.githubUrl?.split('/').pop()} />
                </div>
              </div>

              {/* Startup Ideas Section */}
              <div className="space-y-5">
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center space-x-3">
                  <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                  <span>PUBLIC STARTUP IDEAS</span>
                </h3>
                <div className="grid grid-cols-1 gap-3.5">
                  {ideas.length > 0 ? (
                    ideas.map(idea => (
                      <IdeaMiniCard key={idea.id} idea={idea} onClick={onIdeaClick} />
                    ))
                  ) : (
                    <div className="p-10 rounded-[2rem] bg-slate-900/30 border border-slate-800/50 border-dashed text-center">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No public ideas yet</p>
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

// Re-import Rocket from lucide-react since it was added to the UI
import { Rocket } from 'lucide-react';
