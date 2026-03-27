import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/useAuthStore";
import { useRecipeStore } from "../store/useRecipeStore";
import type { Recipe } from "../types";

export function useRecipes() {
  const { user } = useAuthStore();
  const { recipes, isLoading, error } = useRecipeStore();

  const addRecipe = (data: Omit<Recipe, "id" | "createdAt">) => {
    if (!user) return Promise.reject("Not authenticated");
    return addDoc(collection(db, "users", user.uid, "recipes"), {
      ...data,
      createdAt: serverTimestamp(),
    });
  };

  const updateRecipe = (id: string, data: Partial<Omit<Recipe, "id" | "createdAt">>) => {
    if (!user) return Promise.reject("Not authenticated");
    return updateDoc(doc(db, "users", user.uid, "recipes", id), data);
  };

  const deleteRecipe = (id: string) => {
    if (!user) return Promise.reject("Not authenticated");
    return deleteDoc(doc(db, "users", user.uid, "recipes", id));
  };

  return { recipes, isLoading, error, addRecipe, updateRecipe, deleteRecipe };
}
