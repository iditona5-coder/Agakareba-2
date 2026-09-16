export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  author?: string;
  authorAvatar?: string;
  authorId?: string; // ID unik pemilik postingan (uid Firebase Auth atau local client ID)
  authorClientId?: string; // ID client lokal pembuat postingan
  imageUrl: string; // URL gambar atau video
  mediaType?: 'image' | 'video';
  imageKitFileId?: string; // ImageKit ID untuk auto-deletion
  caption: string;
  mood: string; // 😡 😢 😄 ☕ 🔥 ⚠️ 🍜
  moodLabel?: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  caresCount: number;
  isCared: boolean;
  userReaction?: string; // 😡 😱 😄 🥲 🥰
  reactionCounts?: Record<string, number>;
  comments: Comment[];
  category?: 'laporan' | 'santai' | 'kuliner' | 'info' | 'darurat';
  isOwn?: boolean;
  hidden?: boolean;
}

export interface ReportItem {
  id: string;
  postId: string;
  postOwnerId?: string;
  postCaption?: string;
  postAuthor?: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  description: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'ignored';
}

export interface MoodConfig {
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export type AppTheme = 'warm' | 'dark' | 'light';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}
