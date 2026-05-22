export interface FounderProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  skills: string[];
  buildingDesc?: string; // "What Are You Building?"
  startupLogo?: string;  // Startup logo search upload base64
  github?: string;
  twitter?: string;
  linkedin?: string;
  avatar: string; // Founder avatar
}

export interface Suggestion {
  id: string;
  ideaId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
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
  progressStage: 'JUST IDEA NOW' | 'IDEATION' | 'MVP BUILDING' | 'PROTOTYPE' | 'SCALE';
  likes: number;
  suggestionsCount: number;
  
  // Features requested
  needCollaboration: boolean;
  needFunding: boolean;
  isPublic: boolean;
  maxCollaborators?: number;
  fundingGoal?: string;
  instagramUrl?: string;
  facebookUrl?: string;
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
