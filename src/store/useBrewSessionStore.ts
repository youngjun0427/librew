import { create } from "zustand";
import type { Bean, Equipment, Recipe } from "../types";

interface BrewSessionState {
  selectedRecipe: Recipe | null;
  selectedBean: Bean | null;
  usedCoffeeWeight: number;
  totalElapsed: number;
  selectedGrinder: Equipment | null;
  selectedDripper: Equipment | null;
  selectedOtherEquipment: Equipment | null;
  actualGrindSize: number | null;
  actualWaterTemp: number | null;
  actualFilterType: string | null;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  setSelectedBean: (bean: Bean | null) => void;
  setUsedCoffeeWeight: (weight: number) => void;
  setTotalElapsed: (elapsed: number) => void;
  setSelectedGrinder: (eq: Equipment | null) => void;
  setSelectedDripper: (eq: Equipment | null) => void;
  setSelectedOtherEquipment: (eq: Equipment | null) => void;
  setActualGrindSize: (size: number | null) => void;
  setActualWaterTemp: (temp: number | null) => void;
  setActualFilterType: (filter: string | null) => void;
  reset: () => void;
}

export const useBrewSessionStore = create<BrewSessionState>((set) => ({
  selectedRecipe: null,
  selectedBean: null,
  usedCoffeeWeight: 0,
  totalElapsed: 0,
  selectedGrinder: null,
  selectedDripper: null,
  selectedOtherEquipment: null,
  actualGrindSize: null,
  actualWaterTemp: null,
  actualFilterType: null,
  setSelectedRecipe: (recipe) => set({ selectedRecipe: recipe }),
  setSelectedBean: (bean) => set({ selectedBean: bean }),
  setUsedCoffeeWeight: (weight) => set({ usedCoffeeWeight: weight }),
  setTotalElapsed: (elapsed) => set({ totalElapsed: elapsed }),
  setSelectedGrinder: (eq) => set({ selectedGrinder: eq }),
  setSelectedDripper: (eq) => set({ selectedDripper: eq }),
  setSelectedOtherEquipment: (eq) => set({ selectedOtherEquipment: eq }),
  setActualGrindSize: (size) => set({ actualGrindSize: size }),
  setActualWaterTemp: (temp) => set({ actualWaterTemp: temp }),
  setActualFilterType: (filter) => set({ actualFilterType: filter }),
  reset: () =>
    set({
      selectedRecipe: null,
      selectedBean: null,
      usedCoffeeWeight: 0,
      totalElapsed: 0,
      selectedGrinder: null,
      selectedDripper: null,
      selectedOtherEquipment: null,
      actualGrindSize: null,
      actualWaterTemp: null,
      actualFilterType: null,
    }),
}));
