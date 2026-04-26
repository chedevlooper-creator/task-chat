import { UserProfile, Course, CommunityPost, Language, UserLevel } from '../types';

export const mockUser: UserProfile = {
  id: 'user-1',
  name: 'Alex Learner',
  avatar: 'https://i.pravatar.cc/150?img=11',
  targetLanguage: 'ja',
  level: 'beginner',
  xp: 1450,
  streak: 12,
  badges: [
    { id: 'b1', name: 'Early Bird', icon: 'Sun', description: 'Logged in before 8 AM', unlockedAt: '2023-10-01' },
    { id: 'b2', name: 'Vocab Master', icon: 'BookOpen', description: 'Learned 500 words', unlockedAt: '2023-10-05' },
  ],
};

export const mockCourses: Course[] = [
  {
    id: 'c-ja-1',
    title: 'Japanese Foundations I',
    description: 'Master Hiragana, Katakana, and basic greetings.',
    language: 'ja',
    level: 'beginner',
    image: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=800&q=80',
    progress: 40,
    modules: [
      { id: 'm1', title: 'Hiragana Characters', type: 'vocabulary', duration: 15, completed: true, score: 95 },
      { id: 'm2', title: 'Greetings & Introductions', type: 'listening', duration: 10, completed: true, score: 88 },
      { id: 'm3', title: 'Basic Sentence Structure', type: 'grammar', duration: 20, completed: false },
      { id: 'm4', title: 'Shadowing: Meeting People', type: 'shadowing', duration: 15, completed: false },
    ],
  },
  {
    id: 'c-ja-2',
    title: 'Survival Japanese',
    description: 'Essential phrases for travel and shopping.',
    language: 'ja',
    level: 'beginner',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    progress: 0,
    modules: [
      { id: 'm5', title: 'At the Restaurant', type: 'vocabulary', duration: 15, completed: false },
      { id: 'm6', title: 'Asking for Directions', type: 'listening', duration: 20, completed: false },
    ],
  },
  {
    id: 'c-ko-1',
    title: 'Korean Hangul Mastery',
    description: 'Learn to read and write the Korean alphabet in 3 days.',
    language: 'ko',
    level: 'beginner',
    image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80',
    progress: 100,
    modules: [
      { id: 'm7', title: 'Vowels', type: 'vocabulary', duration: 20, completed: true, score: 100 },
      { id: 'm8', title: 'Consonants', type: 'vocabulary', duration: 20, completed: true, score: 98 },
    ],
  },
];

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'p1',
    userId: 'user-2',
    userName: 'Sarah',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    content: 'Just finished my first shadowing exercise in Japanese! My pronunciation is improving so much.',
    likes: 24,
    comments: 5,
    createdAt: '2 hours ago',
  },
  {
    id: 'p2',
    userId: 'user-3',
    userName: 'David M.',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
    content: 'Can someone explain the difference between 은/는 and 이/가 in Korean? Im stuck on this module.',
    likes: 15,
    comments: 12,
    createdAt: '5 hours ago',
  },
  {
    id: 'p3',
    userId: 'user-4',
    userName: 'Emma_Lang',
    userAvatar: 'https://i.pravatar.cc/150?img=20',
    content: 'Hit my 30-day streak today! 🎉 Consistency really is the key to language learning.',
    likes: 89,
    comments: 14,
    createdAt: '1 day ago',
  }
];
