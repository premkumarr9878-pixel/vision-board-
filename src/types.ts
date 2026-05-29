export interface FounderProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  profession?: string;
  skills: string[];
  buildingDesc?: string;
  startupLogo?: string;
  githubUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  experience?: string;
  startupInterests?: string[];
  avatar: string;
  userRole?: 'founder_hub' | 'vision_board';
}

export interface Suggestion {
  id: string;
  ideaId: string;
  founderId: string;
  content: string;
  createdAt: string;
  likes?: number;
  // Local UI fields (optional mapping)
  authorName?: string;
  authorAvatar?: string;
  ideaName?: string;
}

export interface StartupIdea {
  id: string;
  name: string;
  logo: string; // url or icon name
  banner?: string;
  description: string;
  whyThisWorks: string;
  problemSolved: string;
  targetAudience: string;
  category: string;
  founderId: string;
  founderName: string;
  founderAvatar: string;
  
  // Option Section details
  collaborationCount: number;
  fundingInterestCount: number;
  viewsCount: number;
  progressStage: 'JUST IDEA NOW' | 'IDEATION' | 'RESEARCH' | 'MVP BUILDING' | 'PROTOTYPE' | 'SCALE';
  likes: number;
  suggestionsCount: number;
  
  // Features requested
  needCollaboration: boolean;
  needFunding: boolean;
  seeking_collaboration: boolean;
  seeking_funding: boolean;
  isPublic: boolean;
  visibility: 'public' | 'private';
  status: 'draft' | 'published';
  maxCollaborators?: number;
  fundingGoal?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
  
  createdAt: string;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'contacted';

export interface CollaborationRequest {
  id: string;
  ideaId: string;
  ideaName: string;
  founderId: string; // recipient
  name: string;
  email: string;
  phone: string;
  role: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
}

export interface FundingRequest {
  id: string;
  ideaId: string;
  ideaName: string;
  founderId: string; // recipient
  name: string;
  email: string;
  phone: string;
  investmentAmount: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
}

export interface UserStats {
  totalIdeas: number;
  collaborationRequests: number;
  fundingRequests: number;
  likes: number;
  suggestions: number;
}
