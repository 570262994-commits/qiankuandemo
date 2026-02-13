import { create } from 'zustand';

export type ViewMode = 'collection' | 'journal';

interface ViewModeState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewModeStore = create<ViewModeState>((set) => ({
  viewMode: 'journal',
  setViewMode: (mode) => set({ viewMode: mode }),
}));
