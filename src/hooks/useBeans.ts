import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/useAuthStore";
import { useBeanStore } from "../store/useBeanStore";
import type { Bean } from "../types";

export function useBeans() {
  const { user } = useAuthStore();
  const { beans, isLoading, error } = useBeanStore();

  const addBean = (data: Omit<Bean, "id">) => {
    if (!user) return Promise.reject("Not authenticated");
    return addDoc(collection(db, "users", user.uid, "beans"), data);
  };

  const updateBean = (id: string, data: Partial<Omit<Bean, "id">>) => {
    if (!user) return Promise.reject("Not authenticated");
    return updateDoc(doc(db, "users", user.uid, "beans", id), data);
  };

  const deleteBean = (id: string) => {
    if (!user) return Promise.reject("Not authenticated");
    return deleteDoc(doc(db, "users", user.uid, "beans", id));
  };

  return { beans, isLoading, error, addBean, updateBean, deleteBean };
}
