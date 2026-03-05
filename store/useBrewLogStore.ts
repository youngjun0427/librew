import { create } from "zustand";
import type { BrewLog } from "../types";

interface BrewLogState {
  brewLogs: BrewLog[];
  isLoading: boolean;
  error: string | null;
  setBrewLogs: (brewLogs: BrewLog[]) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useBrewLogStore = create<BrewLogState>((set) => ({
  brewLogs: [],
  isLoading: true,
  error: null,
  setBrewLogs: (brewLogs) => set({ brewLogs }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
