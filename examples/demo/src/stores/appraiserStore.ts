import { create } from "zustand";
import { ErmisService } from "ermis-ekyc-sdk";
import type { Appraiser, CreateAppraiserRequest } from "ermis-ekyc-sdk";

interface AppraiserState {
  appraisers: Appraiser[];
  isLoading: boolean;
  error: string | null;
  meta: Record<string, unknown>;
}

interface AppraiserActions {
  fetchAppraisers: () => Promise<void>;
  createAppraiser: (data: CreateAppraiserRequest) => Promise<void>;
  clearError: () => void;
}

export const useAppraiserStore = create<AppraiserState & AppraiserActions>(
  (set) => ({
    appraisers: [],
    isLoading: false,
    error: null,
    meta: {},

    fetchAppraisers: async () => {
      set({ isLoading: true, error: null });
      try {
        const ermis = ErmisService.getInstance();
        const result = await ermis.appraisers.getAppraisers();
        set({
          appraisers: result.data,
          meta: result.meta,
          isLoading: false,
        });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load appraisers";
        set({ error: message, isLoading: false });
      }
    },

    createAppraiser: async (data: CreateAppraiserRequest) => {
      set({ isLoading: true, error: null });
      try {
        const ermis = ErmisService.getInstance();
        const newAppraiser = await ermis.appraisers.createAppraiser(data);
        set((state) => ({
          appraisers: [newAppraiser, ...state.appraisers],
          isLoading: false,
        }));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create appraiser";
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    clearError: () => set({ error: null }),
  }),
);
