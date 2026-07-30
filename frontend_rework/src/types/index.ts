export * from './complaint.types';
export * from './auth.types';
export * from './feed.types';

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

// ─── Map ──────────────────────────────────────────────────────────────────────
export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  status: import('./complaint.types').ComplaintStatus;
  category: import('./complaint.types').ComplaintCategory;
  title: string;
}

// ─── Emergency Contacts ───────────────────────────────────────────────────────
export interface EmergencyContact {
  id: string;
  title: string;
  subtitle: string;
  phone: string;
  icon: string;
  colorClass: string;
  iconBgClass: string;
  iconColorClass: string;
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  '(auth)/splash': undefined;
  '(auth)/onboarding': undefined;
  '(tabs)': undefined;
  'complaint/[id]': { id: string };
  '(report)/step1': undefined;
  '(report)/analysis': { complaintId: string };
};
