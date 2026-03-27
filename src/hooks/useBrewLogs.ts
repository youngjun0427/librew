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
import { useBrewLogStore } from "../store/useBrewLogStore";
import type { BrewLog } from "../types";

export function useBrewLogs() {
  const { user } = useAuthStore();
  const { brewLogs, isLoading, error } = useBrewLogStore();

  const addBrewLog = (data: Omit<BrewLog, "id" | "brewedAt">) => {
    if (!user) return Promise.reject("Not authenticated");
    return addDoc(collection(db, "users", user.uid, "brewLogs"), {
      ...data,
      brewedAt: serverTimestamp(),
    });
  };

  const updateBrewLog = (id: string, data: Partial<Omit<BrewLog, "id" | "brewedAt">>) => {
    if (!user) return Promise.reject("Not authenticated");
    return updateDoc(doc(db, "users", user.uid, "brewLogs", id), data);
  };

  const deleteBrewLog = (id: string) => {
    if (!user) return Promise.reject("Not authenticated");
    return deleteDoc(doc(db, "users", user.uid, "brewLogs", id));
  };

  return { brewLogs, isLoading, error, addBrewLog, updateBrewLog, deleteBrewLog };
}
