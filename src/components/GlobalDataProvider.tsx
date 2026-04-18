import { collection, onSnapshot, query } from "firebase/firestore";
import { useEffect } from "react";
import { db } from "../lib/firebase";
import { parseBean, parseBrewLog, parseEquipment, parseRecipe } from "../lib/parsers";
import { useAuthStore } from "../store/useAuthStore";
import { useBeanStore } from "../store/useBeanStore";
import { useBrewLogStore } from "../store/useBrewLogStore";
import { useEquipmentStore } from "../store/useEquipmentStore";
import { useRecipeStore } from "../store/useRecipeStore";

export function GlobalDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const setBeans = useBeanStore((s) => s.setBeans);
  const setBeansLoading = useBeanStore((s) => s.setLoading);
  const setBeansError = useBeanStore((s) => s.setError);
  const setBeansInitialized = useBeanStore((s) => s.setInitialized);
  const resetBeans = useBeanStore((s) => s.reset);

  const setRecipes = useRecipeStore((s) => s.setRecipes);
  const setRecipesLoading = useRecipeStore((s) => s.setLoading);
  const setRecipesError = useRecipeStore((s) => s.setError);
  const setRecipesInitialized = useRecipeStore((s) => s.setInitialized);
  const resetRecipes = useRecipeStore((s) => s.reset);

  const setEquipment = useEquipmentStore((s) => s.setEquipment);
  const setEquipmentLoading = useEquipmentStore((s) => s.setLoading);
  const setEquipmentError = useEquipmentStore((s) => s.setError);
  const setEquipmentInitialized = useEquipmentStore((s) => s.setInitialized);
  const resetEquipment = useEquipmentStore((s) => s.reset);

  const setBrewLogs = useBrewLogStore((s) => s.setBrewLogs);
  const setBrewLogsLoading = useBrewLogStore((s) => s.setLoading);
  const setBrewLogsError = useBrewLogStore((s) => s.setError);
  const setBrewLogsInitialized = useBrewLogStore((s) => s.setInitialized);
  const resetBrewLogs = useBrewLogStore((s) => s.reset);

  useEffect(() => {
    if (!user) {
      resetBeans();
      resetRecipes();
      resetEquipment();
      resetBrewLogs();
      return;
    }

    setBeansLoading(true);
    setRecipesLoading(true);
    setEquipmentLoading(true);
    setBrewLogsLoading(true);

    const unsubBeans = onSnapshot(
      query(collection(db, "users", user.uid, "beans")),
      (snap) => {
        const items = snap.docs.map((d) => parseBean(d.id, d.data())).filter(Boolean) as ReturnType<typeof parseBean>[];
        setBeans(items.sort((a, b) => (b?.purchasedAt?.seconds ?? 0) - (a?.purchasedAt?.seconds ?? 0)) as ReturnType<typeof parseBean>[]);
        setBeansLoading(false);
        setBeansInitialized(true);
      },
      (err) => { setBeansError(err.message); setBeansLoading(false); }
    );

    const unsubRecipes = onSnapshot(
      query(collection(db, "users", user.uid, "recipes")),
      (snap) => {
        const items = snap.docs.map((d) => parseRecipe(d.id, d.data())).filter(Boolean) as ReturnType<typeof parseRecipe>[];
        setRecipes(items.sort((a, b) => (b?.createdAt?.seconds ?? 0) - (a?.createdAt?.seconds ?? 0)) as ReturnType<typeof parseRecipe>[]);
        setRecipesLoading(false);
        setRecipesInitialized(true);
      },
      (err) => { setRecipesError(err.message); setRecipesLoading(false); }
    );

    const unsubEquipment = onSnapshot(
      query(collection(db, "users", user.uid, "equipment")),
      (snap) => {
        const items = snap.docs.map((d) => parseEquipment(d.id, d.data())).filter(Boolean) as ReturnType<typeof parseEquipment>[];
        setEquipment(items.sort((a, b) => (b?.createdAt?.seconds ?? 0) - (a?.createdAt?.seconds ?? 0)) as ReturnType<typeof parseEquipment>[]);
        setEquipmentLoading(false);
        setEquipmentInitialized(true);
      },
      (err) => { setEquipmentError(err.message); setEquipmentLoading(false); }
    );

    const unsubBrewLogs = onSnapshot(
      query(collection(db, "users", user.uid, "brewLogs")),
      (snap) => {
        const items = snap.docs.map((d) => parseBrewLog(d.id, d.data())).filter(Boolean) as ReturnType<typeof parseBrewLog>[];
        setBrewLogs(items.sort((a, b) => (b?.brewedAt?.seconds ?? 0) - (a?.brewedAt?.seconds ?? 0)) as ReturnType<typeof parseBrewLog>[]);
        setBrewLogsLoading(false);
        setBrewLogsInitialized(true);
      },
      (err) => { setBrewLogsError(err.message); setBrewLogsLoading(false); }
    );

    return () => {
      unsubBeans();
      unsubRecipes();
      unsubEquipment();
      unsubBrewLogs();
    };
  }, [
    user,
    resetBeans,
    resetRecipes,
    resetEquipment,
    resetBrewLogs,
    setBeans,
    setBeansLoading,
    setBeansError,
    setBeansInitialized,
    setRecipes,
    setRecipesLoading,
    setRecipesError,
    setRecipesInitialized,
    setEquipment,
    setEquipmentLoading,
    setEquipmentError,
    setEquipmentInitialized,
    setBrewLogs,
    setBrewLogsLoading,
    setBrewLogsError,
    setBrewLogsInitialized,
  ]);

  return <>{children}</>;
}
