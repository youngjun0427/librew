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
import { useEquipmentStore } from "../store/useEquipmentStore";
import type { Equipment } from "../types";

export function useEquipment() {
  const { user } = useAuthStore();
  const { equipment, isLoading, initialized, error, setEquipment, setLoading, setInitialized, setError, reset } = useEquipmentStore();

  useEffect(() => {
    if (!user) {
      reset();
      return;
    }
    if (initialized) return;

    setLoading(true);
    const q = query(collection(db, "users", user.uid, "equipment"));
    getDocs(q)
      .then((snapshot) => {
        const sorted = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Equipment)
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setEquipment(sorted);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
        setInitialized(true);
      });
  }, [user]);

  const addEquipment = (data: Omit<Equipment, "id" | "createdAt">) => {
    if (!user) return;
    return addDoc(collection(db, "users", user.uid, "equipment"), {
      ...data,
      createdAt: serverTimestamp(),
    });
  };

  const updateEquipment = (id: string, data: Partial<Omit<Equipment, "id" | "createdAt">>) => {
    if (!user) return;
    return updateDoc(doc(db, "users", user.uid, "equipment", id), data);
  };

  const deleteEquipment = (id: string) => {
    if (!user) return;
    return deleteDoc(doc(db, "users", user.uid, "equipment", id));
  };

  return { equipment, isLoading, error, addEquipment, updateEquipment, deleteEquipment };
}
