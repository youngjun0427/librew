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
import { useEquipmentStore } from "../store/useEquipmentStore";
import type { Equipment } from "../types";

export function useEquipment() {
  const { user } = useAuthStore();
  const { equipment, isLoading, error } = useEquipmentStore();

  const addEquipment = async (data: Omit<Equipment, "id" | "createdAt">) => {
    if (!user) return Promise.reject("Not authenticated");
    const ref = await addDoc(collection(db, "users", user.uid, "equipment"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    // The GlobalDataProvider will eventually catch this up,
    // but returning the document ref/id can be useful if needed immediately.
    // Note: To return a fully formed Equipment we'd have to construct it, 
    // but typically we can wait for the snapshot or just return the ref.
    return { id: ref.id, ...data, type: data.type } as Equipment;
  };

  const updateEquipment = (id: string, data: Partial<Omit<Equipment, "id" | "createdAt">>) => {
    if (!user) return Promise.reject("Not authenticated");
    return updateDoc(doc(db, "users", user.uid, "equipment", id), data);
  };

  const deleteEquipment = (id: string) => {
    if (!user) return Promise.reject("Not authenticated");
    return deleteDoc(doc(db, "users", user.uid, "equipment", id));
  };

  return { equipment, isLoading, error, addEquipment, updateEquipment, deleteEquipment };
}
