import type { DocumentData } from "firebase/firestore";
import type { Bean, BrewLog, Equipment, Recipe } from "../types";

export function parseRecipe(id: string, data: DocumentData): Recipe | null {
  if (!data || !data.title || !data.brewMethod) return null;
  return { id, ...data } as Recipe;
}

export function parseBean(id: string, data: DocumentData): Bean | null {
  if (!data || !data.name) return null;
  return { id, ...data } as Bean;
}

export function parseEquipment(id: string, data: DocumentData): Equipment | null {
  if (!data || !data.name || !data.type) return null;
  return { id, ...data } as Equipment;
}

export function parseBrewLog(id: string, data: DocumentData): BrewLog | null {
  if (!data || !data.recipeId) return null;
  return { id, ...data } as BrewLog;
}
