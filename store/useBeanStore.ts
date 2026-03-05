import { create } from "zustand";
import type { Bean } from "../types";

interface BeanState {
  beans: Bean[];
  isLoading: boolean;
  error: string | null;
  setBeans: (beans: Bean[]) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useBeanStore = create<BeanState>((set) => ({
  beans: [],
  isLoading: true,
  error: null,
  setBeans: (beans) => set({ beans }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
