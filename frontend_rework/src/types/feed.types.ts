import { GeoLocation } from './complaint.types';

// ─── Feed Post ───────────────────────────────────────────────────────────────
export type FeedPostType = 'update' | 'announcement' | 'resolved' | 'community';

export interface FeedPost {
  id: string;
  type: FeedPostType;
  title: string;
  body: string;
  images: string[];
  author: FeedAuthor;
  location?: GeoLocation;
  address?: string;
  likes: number;
  hasUserLiked: boolean;
  comments: FeedComment[];
  commentCount: number;
  publishedAt: string;
  linkedComplaintId?: string;
  tags: string[];
}

export interface FeedAuthor {
  id: string;
  name: string;
  avatar?: string;
  isOfficial: boolean;
  department?: string;
}

export interface FeedComment {
  id: string;
  author: FeedAuthor;
  content: string;
  createdAt: string;
  likes: number;
}

// ─── Filters ─────────────────────────────────────────────────────────────────
export interface FeedFilters {
  type?: FeedPostType;
  tag?: string;
  sortBy?: 'newest' | 'popular';
}
