import "../global.css";

import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { auth } from "../lib/firebase";
import { useAuthStore } from "../store/useAuthStore";

function useProtectedRoute(user: User | null, isLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inLoginScreen = segments[0] === "login";
    if (!user && !inLoginScreen) {
      router.replace("/login");
    } else if (user && inLoginScreen) {
      router.replace("/");
    }
  }, [user, isLoading, segments]);
}

export default function RootLayout() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useProtectedRoute(user, isLoading);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
    </Stack>
  );
}
