import { Timestamp } from "firebase/firestore";

export interface Equipment {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: "grinder" | "kettle" | "dripper" | "scale" | "other";
  specs: EquipmentSpecs;
  notes: string | null;
  createdAt: Timestamp;
}

export interface EquipmentSpecs {
  clickUnit?: string;
  currentGrindSetting?: string;
  capacity?: number;
  temperature?: number;
  filterType?: string;
  servings?: string;
  precision?: string;
  hasTimer?: boolean;
  hasValve?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  grindSize: number;
  waterTemp: number;
  coffeeWeight: number;
  waterWeight: number;
  filterType: string;
  brewMethod: string;
  grinderName: string | null;
  steps: RecipeStep[];
  isPublic: boolean;
  shareId: string | null;
  createdAt: Timestamp;
}

export interface RecipeStep {
  order: number;
  waterAmount: number;
  duration: number;
  waitTime: number;
  pourMethod: string;
  tip: string | null;
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

export interface NextBrewTips {
  grind?: string;
  temp?: string;
  bloom?: string;
  water?: string;
  other?: string;
}

export interface BrewLog {
  id: string;
  recipeId: string;
  beanId: string | null;
  usedCoffeeWeight: number;
  actualWaterWeight: number;
  actualGrindSize?: number;
  actualWaterTemp?: number;
  actualFilterType?: string;
  totalBrewTime: number;
  sensoryNote: SensoryNote | null;
  memo: string | null;
  nextBrewTips?: NextBrewTips;
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
