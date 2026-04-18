import { create } from "zustand";
import type { Bean, Equipment, Recipe, RecipeStep } from "../types";

interface BrewSessionState {
  selectedRecipe: Recipe | null;
  selectedBean: Bean | null;
  usedCoffeeWeight: number;
  totalElapsed: number;
  selectedGrinder: Equipment | null;
  actualGrindSetting: string | null;
  actualWaterTemp: number | null;
  actualFilterType: string | null;
  actualSteps: RecipeStep[] | null;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  setSelectedBean: (bean: Bean | null) => void;
  setUsedCoffeeWeight: (weight: number) => void;
  setTotalElapsed: (elapsed: number) => void;
  setSelectedGrinder: (eq: Equipment | null) => void;
  setActualGrindSetting: (setting: string | null) => void;
  setActualWaterTemp: (temp: number | null) => void;
  setActualFilterType: (filter: string | null) => void;
  setActualSteps: (steps: RecipeStep[] | null) => void;
  reset: () => void;
}

export const useBrewSessionStore = create<BrewSessionState>((set) => ({
  selectedRecipe: null,
  selectedBean: null,
  usedCoffeeWeight: 0,
  totalElapsed: 0,
  selectedGrinder: null,
  actualGrindSetting: null,
  actualWaterTemp: null,
  actualFilterType: null,
  actualSteps: null,
  setSelectedRecipe: (recipe) => set({ selectedRecipe: recipe }),
  setSelectedBean: (bean) => set({ selectedBean: bean }),
  setUsedCoffeeWeight: (weight) => set({ usedCoffeeWeight: weight }),
  setTotalElapsed: (elapsed) => set({ totalElapsed: elapsed }),
  setSelectedGrinder: (eq) => set({ selectedGrinder: eq }),
  setActualGrindSetting: (setting) => set({ actualGrindSetting: setting }),
  setActualWaterTemp: (temp) => set({ actualWaterTemp: temp }),
  setActualFilterType: (filter) => set({ actualFilterType: filter }),
  setActualSteps: (steps) => set({ actualSteps: steps }),
  reset: () =>
    set({
      selectedRecipe: null,
      selectedBean: null,
      usedCoffeeWeight: 0,
      totalElapsed: 0,
      selectedGrinder: null,
      actualGrindSetting: null,
      actualWaterTemp: null,
      actualFilterType: null,
      actualSteps: null,
    }),
}));
