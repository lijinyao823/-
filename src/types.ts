export interface Photo {
  id: string;
  title: string;
  author: string;
  author_name?: string;
  category: 'scenery' | 'humanities' | 'activity';
  url: string;
  image_url?: string;
  likes: number;
  likes_count?: number;
  comments_count?: number;
  description: string;
  location?: string;
  user_id?: string;
  created_at?: string;
  featured?: boolean;
  exif?: {
    iso: string;
    shutter: string;
    aperture: string;
    camera: string;
  };
}

export interface Comment {
  id: string;
  photo_id?: string;
  user_id?: string;
  author: string;
  content: string;
  timestamp: string;
  created_at?: string;
  parent_id?: string | null;
  replies?: Comment[];
}

export interface Like {
  id: string;
  photo_id: string;
  user_id: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  college?: string;
  grade?: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'comment' | 'follow';
  actor_name: string;
  photo_title?: string;
  photo_id?: string;
  read: boolean;
  created_at: string;
}

export type SortOption = 'latest' | 'most_liked' | 'most_commented';
export type LocationFilter = 'all' | 'nanhu' | 'mafangshan' | 'yujiato';
