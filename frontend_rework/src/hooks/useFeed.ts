import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feedService } from '@/services/feed.service';
import type { FeedFilters } from '@/types';

export const feedKeys = {
  all: ['feed'] as const,
  lists: () => [...feedKeys.all, 'list'] as const,
  list: (filters?: FeedFilters) => [...feedKeys.lists(), { filters }] as const,
  detail: (id: string) => [...feedKeys.all, 'detail', id] as const,
};

export function useFeed(filters?: FeedFilters) {
  return useQuery({
    queryKey: feedKeys.list(filters),
    queryFn: () => feedService.list(filters),
  });
}

export function useFeedPost(id: string) {
  return useQuery({
    queryKey: feedKeys.detail(id),
    queryFn: () => feedService.getById(id),
    enabled: !!id,
  });
}

export function useLikeFeedPost(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => feedService.like(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
    },
  });
}
