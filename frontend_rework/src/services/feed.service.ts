import { MOCK_FEED_POSTS } from '@/constants/mockData';
import type { FeedFilters, FeedPost, PaginatedResult } from '@/types';

const delay = (ms = 600) => new Promise((r) => setTimeout(r, ms));

export const feedService = {
  async list(filters?: FeedFilters): Promise<PaginatedResult<FeedPost>> {
    await delay();
    let items = [...MOCK_FEED_POSTS];
    if (filters?.type) items = items.filter((p) => p.type === filters.type);
    return {
      items,
      meta: { page: 1, limit: 20, total: items.length, totalPages: 1, hasNext: false, hasPrev: false },
    };
  },

  async getById(id: string): Promise<FeedPost | null> {
    await delay();
    return MOCK_FEED_POSTS.find((p) => p.id === id) ?? null;
  },

  async like(id: string): Promise<void> {
    await delay(200);
    console.log(`[mock] liked feed post ${id}`);
  },
};
