import React, { useState } from 'react';
import { User, Camera, Mail, Rocket, ArrowRight, Github, Twitter, Linkedin, CheckCircle2, Sparkles, Upload, AlertCircle } from 'lucide-react';
import { FounderProfile } from '../types';
import { supabase } from '../supabase';
import { motion } from 'motion/react';

interface ProfileSetupProps {
  profile: FounderProfile;
  onComplete: (updated: FounderProfile) => void;
}

export default function ProfileSetup({ profile, onComplete }: ProfileSetupProps) {
  const [name, setName] = useState(profile.name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [buildingDesc, setBuildingDesc] = useState(profile.buildingDesc || '');
  const [avatar, setAvatar] = useState(profile.avatar || '');
  const [skills, setSkills] = useState<string>(profile.skills?.join(', ') || '');
  const [github, setGithub] = useState(profile.github || '');
  const [twitter, setTwitter] = useState(profile.twitter || '');
  const [linkedin, setLinkedin] = useState(profile.linkedin || '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setIsLoading(true);
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name,
          bio,
          building_desc: buildingDesc,
          avatar_url: avatar,
          skills: skillsArray,
          github_url: github,
          twitter_url: twitter,
          linkedin_url: linkedin,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      onComplete({
        ...profile,
        name,
        bio,
        buildingDesc,
        avatar,
        skills: skillsArray,
        github,
        twitter,
        linkedin
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save profile details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 lg:py-24 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/60 dark:shadow-none overflow-hidden relative"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        
        <div className="p-8 sm:p-14">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-4 bg-blue-500/5 dark:bg-blue-400/10 rounded-[1.75rem] border border-blue-500/10 mb-6">
              <Sparkles className="h-7 w-7 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-slate-950 dark:text-white tracking-tight leading-tight">Complete Your Profile</h1>
            <p className="text-slate-700 dark:text-slate-300 mt-3 text-base font-semibold max-w-md mx-auto leading-relaxed">Let the community know who you are and what you're building.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-10">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2" id="profile-setup-error">
                <div className="bg-red-600 text-white rounded-full p-1 shadow-lg shadow-red-600/20">
                  <AlertCircle className="h-3 w-3" />
                </div>
                {error}
              </div>
            )}

            {/* Profile Photo */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-36 h-36 rounded-[2.5rem] bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                      <User className="h-14 w-14 mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Empty</span>
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-600/30 cursor-pointer transition-all hover:scale-110 active:scale-95 hover:rotate-6 z-10">
                  <Camera className="h-5 w-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <span className="text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 mt-8 px-3 py-1 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800 uppercase tracking-widest">Founder Avatar</span>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {/* Name */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Full Founder Name</label>
                <div className="relative group/input">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 group-focus-within/input:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rachel Adams"
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-[13px] font-bold text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Bio / Tagline</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Founder exploring new visions..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-6 text-[13px] font-bold text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Skills (React, Growth, AI...)</label>
                <div className="relative group/input">
                  <Rocket className="absolute left-5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500 group-focus-within/input:text-blue-600 transition-colors" />
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="Product Design, Marketing, Web3..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-[13px] font-bold text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Professional Links</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="relative group/input">
                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within/input:text-blue-600 transition-colors" />
                    <input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="GitHub"
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-[11px] font-bold text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                    />
                  </div>
                  <div className="relative group/input">
                    <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within/input:text-blue-600 transition-colors" />
                    <input
                      type="url"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="Twitter"
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-[11px] font-bold text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                    />
                  </div>
                  <div className="relative group/input">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within/input:text-blue-600 transition-colors" />
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="LinkedIn"
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-[11px] font-bold text-slate-950 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-[1.75rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-950/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-4 border-0 cursor-pointer"
              >
                {isLoading ? (
                  <Sparkles className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Enter Founder Hub</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
