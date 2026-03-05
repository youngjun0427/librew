import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect } from "react";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/useAuthStore";
import { useBrewLogStore } from "../store/useBrewLogStore";
import type { BrewLog } from "../types";

export function useBrewLogs() {
  const { user } = useAuthStore();
  const { brewLogs, isLoading, error, setBrewLogs, setLoading, setError } = useBrewLogStore();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "users", user.uid, "brewLogs"),
      orderBy("brewedAt", "desc")
    );
    return onSnapshot(
      q,
      (snapshot) => {
        setBrewLogs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as BrewLog));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, [user]);

  const addBrewLog = (data: Omit<BrewLog, "id" | "brewedAt">) => {
    if (!user) return;
    return addDoc(collection(db, "users", user.uid, "brewLogs"), {
      ...data,
      brewedAt: serverTimestamp(),
    });
  };

  const updateBrewLog = (id: string, data: Partial<Omit<BrewLog, "id" | "brewedAt">>) => {
    if (!user) return;
    return updateDoc(doc(db, "users", user.uid, "brewLogs", id), data);
  };

  const deleteBrewLog = (id: string) => {
    if (!user) return;
    return deleteDoc(doc(db, "users", user.uid, "brewLogs", id));
  };

  return { brewLogs, isLoading, error, addBrewLog, updateBrewLog, deleteBrewLog };
}
