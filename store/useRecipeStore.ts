import { create } from "zustand";
import type { Recipe } from "../types";

interface RecipeState {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  setRecipes: (recipes: Recipe[]) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useRecipeStore = create<RecipeState>((set) => ({
  recipes: [],
  isLoading: true,
  error: null,
  setRecipes: (recipes) => set({ recipes }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
