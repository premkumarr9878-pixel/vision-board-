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
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm" id="leaderboard-table-widget">
      
      {/* Title block */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 select-none">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-95/40 dark:bg-orange-950/40 flex items-center justify-center border border-orange-200 dark:border-orange-900">
            <Award className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">Founder Integrity Leaderboard</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Ranked by peer endorsements, collaboration engagement, and project quality.</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 text-[10px] font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 rounded px-2.5 py-0.5 select-none shrink-0 border-0">
          <Sparkles className="h-3 w-3" />
          <span>VERIFIED BUILDERS</span>
        </div>
      </div>

      {/* Table block */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 tracking-wider bg-slate-50 dark:bg-slate-950 select-none">
              <th className="py-2.5 px-6 text-center w-16">RANK</th>
              <th className="py-2.5 px-6">FOUNDER PROFILE</th>
              <th className="py-2.5 px-6">VERIFIED SKILLS</th>
              <th className="py-2.5 px-6 text-center">CONCEPTS</th>
              <th className="py-2.5 px-6 text-center">NET LIKES</th>
              <th className="py-2.5 px-6">STATUS REQUIREMENT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {TOP_FOUNDERS.map((cur) => (
              <tr key={cur.rank} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors">
                {/* Ranks badge */}
                <td className="py-4 px-6 text-center select-none">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold font-mono ${
                    cur.rank === 1 ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 shadow-xs' :
                    cur.rank === 2 ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700' :
                    cur.rank === 3 ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-850 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-900/60' :
                    'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-150 dark:border-slate-700'
                  }`}>
                    0{cur.rank}
                  </span>
                </td>

                {/* Profile card details */}
                <td className="py-4 px-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-805 shrink-0 select-none bg-slate-50 dark:bg-slate-800">
                      <img src={cur.avatar} alt={cur.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5 select-all">
                        <span>{cur.name}</span>
                        {cur.rank <= 2 && <UserCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" title="Super Builder" />}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 max-w-xs truncate">{cur.bio}</p>
                    </div>
                  </div>
                </td>

                {/* Skills columns */}
                <td className="py-4 px-6">
                  <div className="flex flex-wrap gap-1" id={`leaderboard-skills-${cur.rank}`}>
                    {cur.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350 border border-slate-200/50 dark:border-slate-700/50">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Idea counts */}
                <td className="py-4 px-5 text-center text-xs font-semibold text-slate-800 dark:text-slate-200 font-display">
                  {cur.ideasCount}
                </td>

                {/* Endorsements Likes counter */}
                <td className="py-4 px-6 text-center">
                  <span className="inline-flex items-center space-x-1 text-xs font-semibold text-red-650 text-red-600 dark:text-red-400 font-display">
                    <Heart className="h-3.5 w-3.5 fill-current shrink-0" />
                    <span>{cur.netLikes}</span>
                  </span>
                </td>

                {/* Status Column */}
                <td className="py-4 px-6">
                  <span className={`inline-block px-2.5 py-1 rounded text-[9px] font-bold tracking-wider ${
                    cur.status.includes('CO-FOUNDER') ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40' :
                    cur.status.includes('BACKING') ? 'bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40' :
                    cur.status.includes('HIRING') ? 'bg-purple-50 dark:bg-purple-955/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40' :
                    'bg-slate-105 dark:bg-slate-800 text-slate-705 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {cur.status}
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
