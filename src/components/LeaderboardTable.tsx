import React from 'react';
import { Award, Heart, MessageSquare, Sparkles, UserCheck } from 'lucide-react';

interface LeaderboardFounder {
  rank: number;
  name: string;
  avatar: string;
  bio: string;
  ideasCount: number;
  netLikes: number;
  skills: string[];
  status: string;
}

const TOP_FOUNDERS: LeaderboardFounder[] = [
  {
    rank: 1,
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    bio: 'Digital health researcher & AI engineer. Builder of Clinify AI.',
    ideasCount: 3,
    netLikes: 294,
    skills: ['NLP', 'FastAPI', 'EHR Systems', 'Python'],
    status: 'SEEKING TECHNICAL CO-FOUNDER'
  },
  {
    rank: 2,
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
    bio: 'Security researcher, specializes in smart contract evaluation logs.',
    ideasCount: 2,
    netLikes: 247,
    skills: ['Rust', 'Solidity', 'ISO 27001', 'Cryptography'],
    status: 'INVESTOR ENGAGED'
  },
  {
    rank: 3,
    name: 'Karim Al-Masri',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
    bio: 'SaaS architect, building mock documentation suites and mock payloads.',
    ideasCount: 4,
    netLikes: 216,
    skills: ['Next.js', 'Go', 'API Gateway', 'PostgreSQL'],
    status: 'HIRING FRONTEND'
  },
  {
    rank: 4,
    name: 'Amara Diop',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=150',
    bio: 'GIS specialist and logistics route analyst. Builder of EcoRoute last-mile bike navigation.',
    ideasCount: 1,
    netLikes: 145,
    skills: ['PostGIS', 'React Native', 'Routing APIs'],
    status: 'SEEKING ANGEL BACKING'
  },
  {
    rank: 5,
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    bio: 'Product manager focusing on mid-tier event spreadsheets integrations.',
    ideasCount: 2,
    netLikes: 124,
    skills: ['Webhooks', 'Tailwind', 'Product Management'],
    status: 'MVP COMPLETE'
  }
];

export default function LeaderboardTable() {
  return (
    <div className="w-full bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg" id="leaderboard-table-widget">
      
      {/* Title block */}
      <div className="px-8 py-6 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 select-none">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center border-2 border-orange-200 dark:border-orange-900/50 shadow-sm">
            <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-slate-950 dark:text-white tracking-tight">Founder Integrity Leaderboard</h3>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1">Ranked by peer endorsements, collaboration engagement, and project quality.</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-[10px] font-black font-mono text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-200 dark:border-blue-800 rounded-lg px-3.5 py-1.5 select-none shrink-0 shadow-sm">
          <Sparkles className="h-4 w-4" />
          <span>VERIFIED BUILDERS</span>
        </div>
      </div>

      {/* Table block */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-slate-100 dark:border-slate-800 text-[11px] font-black font-mono text-slate-500 dark:text-slate-400 tracking-widest bg-slate-50/50 dark:bg-slate-900/30 select-none">
              <th className="py-4 px-8 text-center w-20">RANK</th>
              <th className="py-4 px-8">FOUNDER PROFILE</th>
              <th className="py-4 px-8">VERIFIED SKILLS</th>
              <th className="py-4 px-8 text-center">CONCEPTS</th>
              <th className="py-4 px-8 text-center">NET LIKES</th>
              <th className="py-4 px-8">STATUS REQUIREMENT</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-50 dark:divide-slate-900">
            {TOP_FOUNDERS.map((founder) => (
              <tr key={founder.rank} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                <td className="py-6 px-8 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm shadow-sm ${
                    founder.rank === 1 ? 'bg-amber-100 text-amber-700 border-2 border-amber-200' :
                    founder.rank === 2 ? 'bg-slate-100 text-slate-700 border-2 border-slate-200' :
                    founder.rank === 3 ? 'bg-orange-50 text-orange-700 border-2 border-orange-100' :
                    'text-slate-500 dark:text-slate-400'
                  }`}>
                    {founder.rank}
                  </span>
                </td>
                <td className="py-6 px-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden shadow-md group-hover:scale-110 transition-transform">
                      <img src={founder.avatar} alt={founder.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-950 dark:text-white text-sm tracking-tight" dir="auto">{founder.name}</h4>
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[200px] mt-0.5" dir="auto">{founder.bio}</p>
                    </div>
                  </div>
                </td>
                <td className="py-6 px-8">
                  <div className="flex flex-wrap gap-1.5">
                    {founder.skills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm uppercase tracking-tight">
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-6 px-8 text-center">
                  <span className="text-sm font-black text-slate-950 dark:text-white">{founder.ideasCount}</span>
                </td>
                <td className="py-6 px-8 text-center">
                  <div className="flex items-center justify-center space-x-1.5">
                    <Heart className="h-3.5 w-3.5 text-red-500 fill-current" />
                    <span className="text-sm font-black text-slate-950 dark:text-white">{founder.netLikes}</span>
                  </div>
                </td>
                <td className="py-6 px-8">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black border-2 border-blue-100 dark:border-blue-900/50 uppercase tracking-widest shadow-sm">
                    <UserCheck className="h-3 w-3" />
                    <span>{founder.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
