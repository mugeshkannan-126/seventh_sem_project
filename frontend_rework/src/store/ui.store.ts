import { create } from 'zustand';

interface UIState {
  // Bottom sheet
  isReportSheetOpen: boolean;
  // Toast / snackbar
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  // Loading overlays
  isGlobalLoading: boolean;
  // Actions
  openReportSheet: () => void;
  closeReportSheet: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
  setGlobalLoading: (value: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isReportSheetOpen: false,
  toast: null,
  isGlobalLoading: false,

  openReportSheet: () => set({ isReportSheetOpen: true }),
  closeReportSheet: () => set({ isReportSheetOpen: false }),
  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
  setGlobalLoading: (value) => set({ isGlobalLoading: value }),
}));
