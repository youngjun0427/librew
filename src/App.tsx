import { onAuthStateChanged } from "firebase/auth";
import { lazy, Suspense, useEffect } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { GlobalDataProvider } from "./components/GlobalDataProvider";
import { LoadingView } from "./components/LoadingView";
import { auth } from "./lib/firebase";
import { useAuthStore } from "./store/useAuthStore";

const LoginPage = lazy(() => import("./pages/Login"));
const HomePage = lazy(() => import("./pages/Home"));
const BeanDetailPage = lazy(() => import("./pages/bean/BeanDetail"));
const BeanListPage = lazy(() => import("./pages/bean/BeanList"));
const BeanNewPage = lazy(() => import("./pages/bean/BeanNew"));
const BrewPrepPage = lazy(() => import("./pages/brew/BrewPrep"));
const BrewCountdownPage = lazy(() => import("./pages/brew/BrewCountdown"));
const BrewEvaluatePage = lazy(() => import("./pages/brew/BrewEvaluate"));
const BrewSessionPage = lazy(() => import("./pages/brew/BrewSession"));
const BrewCompletePage = lazy(() => import("./pages/brew/BrewComplete"));
const EquipmentDetailPage = lazy(() => import("./pages/equipment/EquipmentDetail"));
const EquipmentListPage = lazy(() => import("./pages/equipment/EquipmentList"));
const EquipmentNewPage = lazy(() => import("./pages/equipment/EquipmentNew"));
const LogDetailPage = lazy(() => import("./pages/log/LogDetail"));
const LogListPage = lazy(() => import("./pages/log/LogList"));
const MyPage = lazy(() => import("./pages/MyPage"));
const RecipeDetailPage = lazy(() => import("./pages/recipe/RecipeDetail"));
const RecipeEditPage = lazy(() => import("./pages/recipe/RecipeEdit"));
const RecipeListPage = lazy(() => import("./pages/recipe/RecipeList"));
const RecipeNewPage = lazy(() => import("./pages/recipe/RecipeNew"));

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <LoadingView />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppBottomNav() {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();
  if (isLoading || !user) return null;
  if (location.pathname.startsWith("/brew") || location.pathname === "/login") return null;
  return <BottomNav />;
}

export default function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [setUser, setLoading]);

  return (
    <HashRouter>
      <GlobalDataProvider>
        <Suspense fallback={<LoadingView />}>
          <div className="pb-nav-safe">
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<AuthGuard><HomePage /></AuthGuard>} />
            <Route path="/recipe" element={<AuthGuard><RecipeListPage /></AuthGuard>} />
            <Route path="/recipe/new" element={<AuthGuard><RecipeNewPage /></AuthGuard>} />
            <Route path="/recipe/edit/:id" element={<AuthGuard><RecipeEditPage /></AuthGuard>} />
            <Route path="/recipe/:id" element={<AuthGuard><RecipeDetailPage /></AuthGuard>} />
            <Route path="/bean" element={<AuthGuard><BeanListPage /></AuthGuard>} />
            <Route path="/bean/new" element={<AuthGuard><BeanNewPage /></AuthGuard>} />
            <Route path="/bean/:id" element={<AuthGuard><BeanDetailPage /></AuthGuard>} />
            <Route path="/equipment" element={<AuthGuard><EquipmentListPage /></AuthGuard>} />
            <Route path="/equipment/new" element={<AuthGuard><EquipmentNewPage /></AuthGuard>} />
            <Route path="/equipment/:id" element={<AuthGuard><EquipmentDetailPage /></AuthGuard>} />
            <Route path="/brew/prep" element={<AuthGuard><BrewPrepPage /></AuthGuard>} />
            <Route path="/brew/countdown" element={<AuthGuard><BrewCountdownPage /></AuthGuard>} />
            <Route path="/brew/session" element={<AuthGuard><BrewSessionPage /></AuthGuard>} />
            <Route path="/brew/complete" element={<AuthGuard><BrewCompletePage /></AuthGuard>} />
            <Route path="/brew/evaluate" element={<AuthGuard><BrewEvaluatePage /></AuthGuard>} />
            <Route path="/log" element={<AuthGuard><LogListPage /></AuthGuard>} />
            <Route path="/log/:id" element={<AuthGuard><LogDetailPage /></AuthGuard>} />
            <Route path="/mypage" element={<AuthGuard><MyPage /></AuthGuard>} />
          </Routes>
          </div>
          <AppBottomNav />
        </Suspense>
      </GlobalDataProvider>
    </HashRouter>
  );
}
