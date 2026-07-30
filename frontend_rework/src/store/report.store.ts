import { create } from 'zustand';
import type { ComplaintFilters, ComplaintCategory, ComplaintStatus } from '@/types';

interface ReportDraftState {
  // Step 1 data
  category: ComplaintCategory | null;
  description: string;
  address: string;
  images: string[];
  latitude: number | null;
  longitude: number | null;
  // Actions
  setCategory: (category: ComplaintCategory) => void;
  setDescription: (description: string) => void;
  setAddress: (address: string) => void;
  addImage: (uri: string) => void;
  removeImage: (uri: string) => void;
  setLocation: (lat: number, lng: number) => void;
  reset: () => void;
}

export const useReportStore = create<ReportDraftState>()((set) => ({
  category: null,
  description: '',
  address: '',
  images: [],
  latitude: null,
  longitude: null,

  setCategory: (category) => set({ category }),
  setDescription: (description) => set({ description }),
  setAddress: (address) => set({ address }),
  addImage: (uri) => set((s) => ({ images: [...s.images, uri] })),
  removeImage: (uri) => set((s) => ({ images: s.images.filter((i) => i !== uri) })),
  setLocation: (lat, lng) => set({ latitude: lat, longitude: lng }),
  reset: () => set({ category: null, description: '', address: '', images: [], latitude: null, longitude: null }),
}));
