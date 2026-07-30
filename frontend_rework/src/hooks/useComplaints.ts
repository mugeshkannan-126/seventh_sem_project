import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintsService } from '@/services/complaints.service';
import type { ComplaintFilters, CreateComplaintDto } from '@/types';

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const complaintKeys = {
  all: ['complaints'] as const,
  lists: () => [...complaintKeys.all, 'list'] as const,
  list: (filters?: ComplaintFilters) => [...complaintKeys.lists(), { filters }] as const,
  detail: (id: string) => [...complaintKeys.all, 'detail', id] as const,
  stats: () => [...complaintKeys.all, 'stats'] as const,
  mapMarkers: () => [...complaintKeys.all, 'markers'] as const,
};

// ─── List Complaints ──────────────────────────────────────────────────────────
export function useComplaints(filters?: ComplaintFilters) {
  return useQuery({
    queryKey: complaintKeys.list(filters),
    queryFn: () => complaintsService.list(filters),
  });
}

// ─── Single Complaint ─────────────────────────────────────────────────────────
export function useComplaint(id: string) {
  return useQuery({
    queryKey: complaintKeys.detail(id),
    queryFn: () => complaintsService.getById(id),
    enabled: !!id,
  });
}

// ─── Stats ───────────────────────────────────────────────────────────────────
export function useComplaintStats() {
  return useQuery({
    queryKey: complaintKeys.stats(),
    queryFn: complaintsService.getStats,
  });
}

// ─── Map Markers ──────────────────────────────────────────────────────────────
export function useMapMarkers() {
  return useQuery({
    queryKey: complaintKeys.mapMarkers(),
    queryFn: () => complaintsService.getMapMarkers(),
  });
}

// ─── Create Complaint ─────────────────────────────────────────────────────────
export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateComplaintDto) => complaintsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintKeys.lists() });
      queryClient.invalidateQueries({ queryKey: complaintKeys.stats() });
    },
  });
}

// ─── Upvote ───────────────────────────────────────────────────────────────────
export function useUpvoteComplaint(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => complaintsService.upvote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintKeys.detail(id) });
    },
  });
}
