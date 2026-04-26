export type Language = 'en' | 'ja' | 'ko' | 'es' | 'fr' | 'zh';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  targetLanguage: Language;
  level: UserLevel;
  xp: number;
  streak: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
}

export type ModuleType = 'vocabulary' | 'grammar' | 'shadowing' | 'listening';

export interface Module {
  id: string;
  title: string;
  type: ModuleType;
  duration: number; // in minutes
  completed: boolean;
  score?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  language: Language;
  level: UserLevel;
  image: string;
  progress: number; // 0-100
  modules: Module[];
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likes: number;
  comments: number;
  createdAt: string;
}
