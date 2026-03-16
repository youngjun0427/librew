import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect } from "react";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/useAuthStore";
import { useRecipeStore } from "../store/useRecipeStore";
import type { Recipe } from "../types";

export function useRecipes() {
  const { user } = useAuthStore();
  const { recipes, isLoading, initialized, error, setRecipes, setLoading, setInitialized, setError, reset } = useRecipeStore();

  useEffect(() => {
    if (!user) {
      reset();
      return;
    }
    if (initialized) return;

    setLoading(true);
    const q = query(collection(db, "users", user.uid, "recipes"));
    getDocs(q)
      .then((snapshot) => {
        const sorted = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Recipe)
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setRecipes(sorted);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
        setInitialized(true);
      });
  }, [user]);

  const addRecipe = (data: Omit<Recipe, "id" | "createdAt">) => {
    if (!user) return;
    return addDoc(collection(db, "users", user.uid, "recipes"), {
      ...data,
      createdAt: serverTimestamp(),
    });
  };

  const updateRecipe = (id: string, data: Partial<Omit<Recipe, "id" | "createdAt">>) => {
    if (!user) return;
    return updateDoc(doc(db, "users", user.uid, "recipes", id), data);
  };

  const deleteRecipe = (id: string) => {
    if (!user) return;
    return deleteDoc(doc(db, "users", user.uid, "recipes", id));
  };

  return { recipes, isLoading, error, addRecipe, updateRecipe, deleteRecipe };
}
