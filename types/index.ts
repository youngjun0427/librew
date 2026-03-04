import { Timestamp } from "firebase/firestore";

export interface Recipe {
  id: string;
  title: string;
  baseRecipeId: string | null;
  grindSize: number;
  waterTemp: number;
  coffeeWeight: number;
  waterWeight: number;
  filterType: string;
  brewMethod: string;
  equipmentId: string | null;
  steps: RecipeStep[];
  isPublic: boolean;
  shareId: string | null;
  createdAt: Timestamp;
}

export interface RecipeStep {
  order: number;
  waterAmount: number;
  tip: string;
}

export interface Bean {
  id: string;
  name: string;
  roastery: string;
  origin: string;
  variety: string;
  roastedAt: Timestamp;
  purchasedAt: Timestamp;
  price: number;
  totalWeight: number;
  remainingWeight: number;
}

export interface BrewLog {
  id: string;
  recipeId: string;
  beanId: string | null;
  usedCoffeeWeight: number;
  sensoryNote: SensoryNote;
  aiSuggestion: string | null;
  brewedAt: Timestamp;
}

export interface SensoryNote {
  acidity: number;
  bitterness: number;
  body: number;
  aroma: number;
  overall: number;
}

export interface PublicRecipe {
  shareId: string;
  recipeData: Recipe;
  authorUid: string;
  createdAt: Timestamp;
}
