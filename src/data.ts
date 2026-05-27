import { StartupIdea, FounderProfile, CollaborationRequest, FundingRequest, Suggestion } from './types';

export const CATEGORIES = [
  'AI',
  'SaaS',
  'Fintech',
  'Healthcare',
  'EdTech',
  'Marketplace',
  'Social Media',
  'Automation',
  'Productivity',
  'Student Startup',
  'E-commerce',
  'Mobile App',
  'Web App',
  'Gaming',
  'Future Tech'
];

export const DEFAULT_PROFILE: FounderProfile = {
  id: '5c463bb2-1742-4f70-9874-9c610ea4a229',
  name: 'sahil kumar',
  email: 'arjunk067860@gmail.com',
  bio: 'Founder exploring new visions.',
  skills: ['React', 'TypeScript', 'Node.js', 'Solidity', 'TailwindCSS', 'Product Design'],
  github: 'https://github.com/sahil_dev',
  twitter: 'https://twitter.com/sahil_builds',
  linkedin: 'https://linkedin.com/in/sahil-build',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
};

export const INITIAL_IDEAS: StartupIdea[] = [
  // Trending Ideas (e.g. Row 1)
  {
    id: 'idea-1',
    name: 'Clinify AI',
    logo: '🏥',
    banner: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    description: 'AI-powered clinical documentation assistant that listens to patient-doctor dialogue and instantly drafts structured medical notes.',
    whyThisWorks: 'Doctors spend up to 4 hours daily on repetitive paperwork. Clinify reduces entry overhead by 80% while ensuring complete HIPAA compliance.',
    problemSolved: 'Physician burnout due to excessive electronic health record (EHR) entry workloads.',
    targetAudience: 'Private medical practitioners, outpatient clinics, and community healthcare providers.',
    category: 'Healthcare',
    founderId: 'founder-1',
    founderName: 'Sarah Jenkins',
    founderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    collaborationCount: 12,
    fundingInterestCount: 8,
    progressStage: 'MVP BUILDING',
    likes: 124,
    suggestionsCount: 15,
    needCollaboration: true,
    needFunding: true,
    seeking_collaboration: true,
    seeking_funding: true,
    isPublic: true,
    visibility: 'public',
    status: 'published',
    createdAt: '2026-05-18T10:00:00Z'
  },
  {
    id: 'idea-2',
    name: 'FlowStack',
    logo: '🔄',
    banner: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=600',
    description: 'Visual event-driven database system allowing non-technical product managers to configure custom webhook pipelines and logs.',
    whyThisWorks: 'Integrations are either too simple (Zapier) or too complicated (Retool). FlowStack sits perfectly in the middle with a spreadsheet feel.',
    problemSolved: 'Bottlenecks in internal tooling queues where product changes wait on core engineering sprint cycles.',
    targetAudience: 'Product teams, operations managers, and growth hackers in late-seed startups.',
    category: 'Productivity',
    founderId: 'founder-2',
    founderName: 'Marcus Vance',
    founderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    collaborationCount: 9,
    fundingInterestCount: 4,
    progressStage: 'PROTOTYPE',
    likes: 98,
    suggestionsCount: 7,
    needCollaboration: true,
    needFunding: false,
    seeking_collaboration: true,
    seeking_funding: false,
    isPublic: true,
    visibility: 'public',
    status: 'published',
    createdAt: '2026-05-19T08:30:00Z'
  },
  {
    id: 'idea-3',
    name: 'SecurLedger',
    logo: '🛡️',
    banner: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=600',
    description: 'Decentralized compliance verification framework that automates smart-audit logs for SOC2 & ISO 27001 data storage.',
    whyThisWorks: 'Manual evidence gathering is highly error-prone. SecurLedger continuous proofs eliminate manual checks entirely.',
    problemSolved: 'Continuous compliance gaps leading up to annual enterprise security auditing procedures.',
    targetAudience: 'Fintech and highly regulated web3 startups handling sensitive user transactions.',
    category: 'Fintech',
    founderId: 'founder-3',
    founderName: 'Elena Rostova',
    founderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    collaborationCount: 15,
    fundingInterestCount: 11,
    progressStage: 'SCALE',
    likes: 185,
    suggestionsCount: 22,
    needCollaboration: false,
    needFunding: true,
    seeking_collaboration: false,
    seeking_funding: true,
    isPublic: true,
    visibility: 'public',
    status: 'published',
    createdAt: '2026-05-17T12:15:00Z'
  },

  // Recently Added (e.g. Row 2)
  {
    id: 'idea-4',
    name: 'Edulink LMS',
    logo: '🎓',
    banner: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600',
    description: 'Gamified learning management system offering real-time custom coding challenges tailored for high-schoolers.',
    whyThisWorks: 'Standard LMS formats are excessively dry. Interactive competition styles drive completion rates up by over 300%.',
    problemSolved: 'Plunging student engagement over abstract computer science curriculums.',
    targetAudience: 'Secondary schools, private academies, and online youth bootcamps.',
    category: 'EdTech',
    founderId: 'founder-4',
    founderName: 'Devon Lee',
    founderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    collaborationCount: 5,
    fundingInterestCount: 2,
    progressStage: 'IDEATION',
    likes: 42,
    suggestionsCount: 4,
    needCollaboration: true,
    needFunding: true,
    seeking_collaboration: true,
    seeking_funding: true,
    isPublic: true,
    visibility: 'public',
    status: 'published',
    createdAt: '2026-05-20T04:20:00Z'
  },
  {
    id: 'idea-5',
    name: 'PromptRefine',
    logo: '🤖',
    banner: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&q=80&w=600',
    description: 'Collaborative development playground for refining, unit-testing, and running robust evaluations on LLM prompt sets.',
    whyThisWorks: 'Engineers are managing prompt files in messy Excel files. This creates a Git-like environment for immediate benchmarking.',
    problemSolved: 'Uncontrolled model response regression when pushing prompt updates to production.',
    targetAudience: 'Engineering teams building production software atop OpenAI, Anthropic, or Gemini endpoints.',
    category: 'AI',
    founderId: 'founder-5',
    founderName: 'Cassandra Cole',
    founderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    collaborationCount: 6,
    fundingInterestCount: 1,
    progressStage: 'MVP BUILDING',
    likes: 58,
    suggestionsCount: 8,
    needCollaboration: true,
    needFunding: false,
    seeking_collaboration: true,
    seeking_funding: false,
    isPublic: true,
    visibility: 'public',
    status: 'published',
    createdAt: '2026-05-20T11:05:00Z'
  },
  {
    id: 'idea-6',
    name: 'PeerCraft',
    logo: '🤝',
    banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600',
    description: 'Colleague-driven marketplace where university students barter skill exchanges instead of relying on high-charge tutoring.',
    whyThisWorks: 'Tutoring fees are financially out-of-reach, yet peer students have highly complementary skills ready to trade for credit.',
    problemSolved: 'Astronomical learning costs and isolation among college coders and designers.',
    targetAudience: 'Undergraduate engineering and liberal arts students looking for tutoring networks.',
    category: 'Student Startup',
    founderId: 'founder-6',
    founderName: 'Jordan Wu',
    founderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    collaborationCount: 8,
    fundingInterestCount: 3,
    progressStage: 'PROTOTYPE',
    likes: 72,
    suggestionsCount: 9,
    needCollaboration: true,
    needFunding: true,
    seeking_collaboration: true,
    seeking_funding: true,
    isPublic: true,
    visibility: 'public',
    status: 'published',
    createdAt: '2026-05-20T14:45:00Z'
  },

  // Best Ideas This Week (e.g. Row 3)
  {
    id: 'idea-7',
    name: 'EcoRoute',
    logo: '🚴',
    banner: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=600',
    description: 'Last-mile courier navigation router maximizing local bicycle-lane priority, loading zones, and carbon-offset metrics reporting.',
    whyThisWorks: 'Standard GPS systems routing delivery riders onto unsafe arterial freeways creates driver delays and attrition.',
    problemSolved: 'Inaccurate arrival timings, dangerous courier routes, and rising urban carbon profiles.',
    targetAudience: 'Boutique eco-delivery fleets, urban bicycle couriers, and conscious e-commerce logistics groups.',
    category: 'Future Tech',
    founderId: 'founder-7',
    founderName: 'Amara Diop',
    founderAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200',
    collaborationCount: 11,
    fundingInterestCount: 9,
    progressStage: 'MVP BUILDING',
    likes: 145,
    suggestionsCount: 16,
    needCollaboration: true,
    needFunding: true,
    seeking_collaboration: true,
    seeking_funding: true,
    isPublic: true,
    visibility: 'public',
    status: 'published',
    createdAt: '2026-05-15T09:00:00Z'
  },
  {
    id: 'idea-8',
    name: 'ScribeSaaS',
    logo: '📝',
    banner: 'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&q=80&w=600',
    description: 'Instant mock documentation suite generator matching any JSON payload schema with dynamic swagger setups.',
    whyThisWorks: 'Developers hate writing static docs. ScribeSaaS keeps your mock configurations fully running with automated updates.',
    problemSolved: 'Stale manual endpoints leading to communication blockages inside client integration pipelines.',
    targetAudience: 'Software consulting houses, backend microservice startups, and SDK build agencies.',
    category: 'SaaS',
    founderId: 'founder-8',
    founderName: 'Karim Al-Masri',
    founderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    collaborationCount: 14,
    fundingInterestCount: 10,
    progressStage: 'SCALE',
    likes: 162,
    suggestionsCount: 18,
    needCollaboration: true,
    needFunding: true,
    seeking_collaboration: true,
    seeking_funding: true,
    isPublic: true,
    visibility: 'public',
    status: 'published',
    createdAt: '2026-05-16T13:40:00Z'
  },
  {
    id: 'idea-9',
    name: 'Autonode',
    logo: '🤖',
    banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600',
    description: 'No-code integration service triggering specialized headless scrapers and web-hook routines using plain conversation.',
    whyThisWorks: 'Non-engineers find automated script setups impossible. Autonode compiles plain language instructions into error-free cron scrapers.',
    problemSolved: 'High developer cost for simple, repetitive web-data collection and inventory tracking.',
    targetAudience: 'Market analysts, content operations directors, and data researchers.',
    category: 'Automation',
    founderId: 'founder-9',
    founderName: 'Tariq Patel',
    founderAvatar: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&q=80&w=200',
    collaborationCount: 10,
    fundingInterestCount: 7,
    progressStage: 'PROTOTYPE',
    likes: 119,
    suggestionsCount: 12,
    needCollaboration: true,
    needFunding: false,
    seeking_collaboration: true,
    seeking_funding: false,
    isPublic: true,
    visibility: 'public',
    status: 'published',
    createdAt: '2026-05-16T15:20:00Z'
  }
];

export const INITIAL_SUGGESTIONS: Suggestion[] = [
  {
    id: 's-1',
    ideaId: 'idea-1',
    founderId: 'founder-1',
    authorName: 'Alex Rivera',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    content: 'Love this concept. Have you thought about integrating directly with AthenaHealth or Epic? Integrating with secondary open EHR APIs would be a huge quick-win before full certification.',
    createdAt: '2026-05-18T14:20:00Z',
    likes: 5
  },
  {
    id: 's-2',
    ideaId: 'idea-1',
    founderId: 'founder-1',
    authorName: 'Devon Lee',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    content: 'Very critical problem. However, make sure you double down on HIPAA audio-processing rules. Storing transcribing outputs on server instances requires specific security enclaves.',
    createdAt: '2026-05-18T16:30:00Z',
    likes: 9
  },
  {
    id: 's-3',
    ideaId: 'idea-2',
    founderId: 'founder-2',
    authorName: 'Sarah Jenkins',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    content: 'Would love to collaborate on the pipeline builder frontend. I build interactive visual node interfaces in React for my day job!',
    createdAt: '2026-05-19T10:15:00Z',
    likes: 3
  }
];

// Helper to load application state from Storage safely
export const safeParse = (str: string | null, fallback: any) => {
  if (!str) return fallback;
  try {
    const parsed = JSON.parse(str);
    return parsed || fallback;
  } catch (e) {
    console.error('Error parsing storage item:', e);
    return fallback;
  }
};

export function getLocalStorageState() {
  if (typeof window === 'undefined') {
    return {
      ideas: INITIAL_IDEAS,
      profile: DEFAULT_PROFILE,
      collaborations: [] as CollaborationRequest[],
      funding: [] as FundingRequest[],
      suggestions: INITIAL_SUGGESTIONS,
      hasModified: false
    };
  }

  try {
    const ideasStr = localStorage.getItem('vb_ideas');
    const profileStr = localStorage.getItem('vb_profile');
    const collabsStr = localStorage.getItem('vb_collabs');
    const fundingStr = localStorage.getItem('vb_funding');
    const suggestionsStr = localStorage.getItem('vb_suggestions');

    return {
      ideas: safeParse(ideasStr, INITIAL_IDEAS),
      profile: safeParse(profileStr, DEFAULT_PROFILE),
      collaborations: safeParse(collabsStr, []),
      funding: safeParse(fundingStr, []),
      suggestions: safeParse(suggestionsStr, INITIAL_SUGGESTIONS),
      hasModified: !!(ideasStr || profileStr)
    };
  } catch (err) {
    console.error('Error reading from localStorage:', err);
    return {
      ideas: INITIAL_IDEAS,
      profile: DEFAULT_PROFILE,
      collaborations: [],
      funding: [],
      suggestions: INITIAL_SUGGESTIONS,
      hasModified: false
    };
  }
}

export function saveLocalStorageState(state: {
  ideas: StartupIdea[];
  profile: FounderProfile;
  collaborations: CollaborationRequest[];
  funding: FundingRequest[];
  suggestions: Suggestion[];
}) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('vb_ideas', JSON.stringify(state.ideas));
    localStorage.setItem('vb_profile', JSON.stringify(state.profile));
    localStorage.setItem('vb_collabs', JSON.stringify(state.collaborations));
    localStorage.setItem('vb_funding', JSON.stringify(state.funding));
    localStorage.setItem('vb_suggestions', JSON.stringify(state.suggestions));
  } catch (err) {
    console.error('Error saving to localStorage (possibly quota exceeded):', err);
  }
}
