import React, { useState } from 'react';
import { User, Camera, Mail, Rocket, ArrowRight, Github, Twitter, Linkedin, CheckCircle2, Sparkles, Upload } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
      >
        <div className="p-8 sm:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-4">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Complete Your Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Let the community know who you are and what you're building.</p>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 rotate-180" />
                {error}
              </div>
            )}

            {/* Profile Photo */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2rem] bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <User className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-[-10px] right-[-10px] p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg cursor-pointer transition-all hover:scale-110 active:scale-95 group-hover:rotate-6">
                  <Camera className="h-5 w-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <span className="text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-6">Profile Photo</span>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Full Name / Username</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sahil"
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-5 text-[13px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Bio / Tagline</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Founder exploring new visions..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-5 text-[13px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Growth, Product Design..."
                  className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-5 text-[13px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">GitHub</label>
                  <div className="relative">
                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="url"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="github.com/..."
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-[11px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Twitter</label>
                  <div className="relative">
                    <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="url"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="twitter.com/..."
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-[11px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">LinkedIn</label>
                  <div className="relative">
                    <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="linkedin.com/in/..."
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-[11px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3 border-0 cursor-pointer"
              >
                {isLoading ? (
                  <Sparkles className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Enter VisionBoard Hub</span>
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
