// ─── Status ────────────────────────────────────────────────────────────────
export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'critical' | 'rejected';

export type ComplaintCategory =
  | 'pothole'
  | 'street_light'
  | 'water_leak'
  | 'garbage'
  | 'graffiti'
  | 'park'
  | 'traffic'
  | 'other';

// ─── Core Entity ────────────────────────────────────────────────────────────
export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: GeoLocation;
  address: string;
  images: string[];
  reportedBy: string;
  assignedTo?: DepartmentOfficer;
  department?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  timeline: TimelineEvent[];
  comments: ComplaintComment[];
  upvotes: number;
  hasUserUpvoted: boolean;
  aiAnalysis?: AIAnalysis;
  resolutionNote?: string;
  beforeImage?: string;
  afterImage?: string;
  communityRating?: number;
}

// ─── Location ────────────────────────────────────────────────────────────────
export interface GeoLocation {
  latitude: number;
  longitude: number;
}

// ─── Timeline ────────────────────────────────────────────────────────────────
export type TimelineEventType =
  | 'submitted'
  | 'verified'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'comment';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  label: string;
  description: string;
  timestamp: string;
  actor?: string;
  isCompleted: boolean;
  isActive: boolean;
}

// ─── Comments ────────────────────────────────────────────────────────────────
export interface ComplaintComment {
  id: string;
  author: string;
  authorAvatar?: string;
  isOfficial: boolean;
  content: string;
  createdAt: string;
  likes: number;
}

// ─── Department / Officer ────────────────────────────────────────────────────
export interface DepartmentOfficer {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar?: string;
  phone?: string;
}

// ─── AI Analysis ─────────────────────────────────────────────────────────────
export interface AIAnalysis {
  detectedCategory: ComplaintCategory;
  confidence: number;
  alternativeCategories: { category: ComplaintCategory; confidence: number }[];
  detectedSeverity: 'low' | 'medium' | 'high' | 'critical';
  estimatedResolutionDays: number;
  tags: string[];
  summary: string;
  priorityScore: number;
}

// ─── Create DTO ──────────────────────────────────────────────────────────────
export interface CreateComplaintDto {
  title: string;
  description: string;
  category: ComplaintCategory;
  location: GeoLocation;
  address: string;
  images: string[];
}

// ─── Filters ─────────────────────────────────────────────────────────────────
export interface ComplaintFilters {
  status?: ComplaintStatus;
  category?: ComplaintCategory;
  radius?: number;
  sortBy?: 'newest' | 'oldest' | 'upvotes' | 'priority';
}

// ─── Stats ───────────────────────────────────────────────────────────────────
export interface ComplaintStats {
  total: number;
  resolved: number;
  pending: number;
  inProgress: number;
  critical: number;
}
