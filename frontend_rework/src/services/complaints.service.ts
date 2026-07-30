import { MOCK_COMPLAINTS, MOCK_STATS, MOCK_MAP_MARKERS } from '@/constants/mockData';
import type {
  Complaint,
  ComplaintFilters,
  ComplaintStats,
  CreateComplaintDto,
  MapMarker,
  PaginatedResult,
} from '@/types';

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

// ─── Complaints Service ───────────────────────────────────────────────────────
export const complaintsService = {
  /** List all complaints with optional filters */
  async list(filters?: ComplaintFilters): Promise<PaginatedResult<Complaint>> {
    await delay();
    let items = [...MOCK_COMPLAINTS];

    if (filters?.status) {
      items = items.filter((c) => c.status === filters.status);
    }
    if (filters?.category) {
      items = items.filter((c) => c.category === filters.category);
    }

    return {
      items,
      meta: { page: 1, limit: 20, total: items.length, totalPages: 1, hasNext: false, hasPrev: false },
    };
  },

  /** Get a single complaint by ID */
  async getById(id: string): Promise<Complaint | null> {
    await delay();
    return MOCK_COMPLAINTS.find((c) => c.id === id) ?? null;
  },

  /** Create a new complaint */
  async create(dto: CreateComplaintDto): Promise<Complaint> {
    await delay(1200);
    const newComplaint: Complaint = {
      id: `c${Date.now()}`,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      status: 'pending',
      priority: 'medium',
      location: dto.location,
      address: dto.address,
      images: dto.images,
      reportedBy: 'user_001',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 0,
      hasUserUpvoted: false,
      timeline: [
        {
          id: 't1',
          type: 'submitted',
          label: 'Submitted',
          description: 'Report received by the system.',
          timestamp: new Date().toISOString(),
          isCompleted: true,
          isActive: false,
        },
      ],
      comments: [],
    };
    return newComplaint;
  },

  /** Upvote a complaint */
  async upvote(id: string): Promise<void> {
    await delay(300);
    console.log(`[mock] upvoted complaint ${id}`);
  },

  /** Get complaints stats for current user */
  async getStats(): Promise<ComplaintStats> {
    await delay(400);
    return MOCK_STATS;
  },

  /** Get map markers */
  async getMapMarkers(bounds?: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }): Promise<MapMarker[]> {
    await delay(500);
    return MOCK_MAP_MARKERS;
  },
};
