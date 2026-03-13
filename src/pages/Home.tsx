import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { ErrorView } from "../components/ErrorView";
import { LoadingView } from "../components/LoadingView";
import { useBrewLogs } from "../hooks/useBrewLogs";
import { useEquipment } from "../hooks/useEquipment";
import { useRecipes } from "../hooks/useRecipes";
import type { BrewLog, Equipment, Recipe } from "../types";

const EQUIPMENT_ICONS: Record<Equipment["type"], string> = {
  grinder: "⚙️", kettle: "🫖", dripper: "☕", scale: "⚖️", other: "🔧",
};

function StarRating({ value }: { value: number }) {
  return (
    <span className="text-xs text-amber-400">
      {"★".repeat(value)}{"☆".repeat(5 - value)}
    </span>
  );
}

function RecentLogCard({
  log, recipeName, onPress,
}: {
  log: BrewLog;
  recipeName: string;
  onPress: () => void;
}) {
  const date = log.brewedAt
    ? new Date(log.brewedAt.seconds * 1000).toLocaleDateString("ko-KR", {
        month: "short", day: "numeric",
      })
    : "";
  const overall = log.sensoryNote?.overall;
  const hasTips = log.nextBrewTips && Object.values(log.nextBrewTips).some((v) => v && v.trim());

  return (
    <button onClick={onPress} className="flex w-full items-center gap-3 px-4 py-3 text-left">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-700">
        <span className="text-base">☕</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-white">{recipeName}</p>
        <div className="mt-0.5 flex items-center gap-2">
          {overall ? <StarRating value={overall} /> : null}
          <span className="text-xs text-zinc-500">{date}</span>
          {hasTips && (
            <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
              팁 있음
            </span>
          )}
        </div>
      </div>
      <span className="text-zinc-600">›</span>
    </button>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { equipment, isLoading: eqLoading, error: eqError } = useEquipment();
  const { recipes, isLoading: recLoading, error: recError } = useRecipes();
  const { brewLogs, isLoading: logLoading } = useBrewLogs();

  const handleLogout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("로그아웃 실패:", error);
      }
    }
  };

  const isLoading = eqLoading || recLoading || logLoading;
  const error = eqError || recError;

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  const currentSetup = equipment.filter((e) => e.isInCurrentSetup);
  const recipeMap = new Map<string, Recipe>(recipes.map((r) => [r.id, r]));
  const recentLogs = brewLogs.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-900 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-3 pt-14">
        <h1 className="text-xl font-bold text-white">BrewNote</h1>
        <div className="flex gap-4">
          <button onClick={() => navigate("/bean")} className="text-sm text-zinc-400">원두</button>
          <button onClick={() => navigate("/log")} className="text-sm text-zinc-400">기록</button>
          <button onClick={handleLogout} className="text-sm text-zinc-400">설정</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Brew CTA */}
        <div className="mx-4 mb-6 mt-2">
          <button
            className="w-full items-center justify-center rounded-2xl bg-amber-400 py-5 text-lg font-bold text-zinc-900 shadow-lg shadow-amber-400/20"
            onClick={() => navigate("/brew/prep")}
          >
            ⚡ 브루잉 시작
          </button>
        </div>

        {/* Recent logs */}
        <div className="mx-4 mb-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">최근 기록</p>
            <button onClick={() => navigate("/log")} className="text-sm text-amber-400">전체 ›</button>
          </div>
          <div className="overflow-hidden rounded-2xl bg-zinc-800">
            {recentLogs.length === 0 ? (
              <div className="flex flex-col items-center py-8">
                <span className="text-zinc-500 text-sm">아직 추출 기록이 없어요</span>
                <span className="mt-1 text-xs text-zinc-600">브루잉 후 평가를 남겨보세요</span>
              </div>
            ) : (
              recentLogs.map((log, idx) => (
                <div key={log.id}>
                  {idx > 0 && <div className="mx-4 h-px bg-zinc-700" />}
                  <RecentLogCard
                    log={log}
                    recipeName={recipeMap.get(log.recipeId)?.title ?? "삭제된 레시피"}
                    onPress={() => navigate(`/log/${log.id}`)}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Equipment Section */}
        <div className="mx-4 mb-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">장비 세팅</p>
            <button onClick={() => navigate("/equipment")} className="text-sm text-amber-400">편집 ›</button>
          </div>
          <div className="overflow-hidden rounded-2xl bg-zinc-800">
            {currentSetup.length === 0 ? (
              <button
                className="flex w-full flex-col items-center py-6"
                onClick={() => navigate("/equipment/new")}
              >
                <span className="text-zinc-500 text-sm">장비를 등록해주세요</span>
                <span className="mt-1 text-xs text-amber-400">+ 장비 추가</span>
              </button>
            ) : (
              <div className="flex flex-wrap gap-2 px-4 py-3">
                {currentSetup.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(`/equipment/${item.id}`)}
                    className="flex items-center gap-1.5 rounded-xl bg-zinc-700 px-3 py-2"
                  >
                    <span className="text-sm">{EQUIPMENT_ICONS[item.type]}</span>
                    <span className="text-xs font-medium text-white">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recipe Section */}
        <div className="mx-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-400">레시피</p>
            <button onClick={() => navigate("/recipe/new")} className="text-sm text-amber-400">+ 추가</button>
          </div>
          <div className="overflow-hidden rounded-2xl bg-zinc-800">
            {recipes.length === 0 ? (
              <button
                className="flex w-full flex-col items-center py-6"
                onClick={() => navigate("/recipe/new")}
              >
                <span className="text-zinc-500 text-sm">레시피가 없어요</span>
                <span className="mt-1 text-xs text-amber-400">+ 첫 레시피 추가</span>
              </button>
            ) : (
              recipes.slice(0, 5).map((recipe, idx) => (
                <div key={recipe.id}>
                  {idx > 0 && <div className="mx-4 h-px bg-zinc-700" />}
                  <button
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{recipe.title}</p>
                      <p className="text-xs text-zinc-500">
                        {recipe.brewMethod} · {recipe.waterTemp}°C · {recipe.coffeeWeight}g
                      </p>
                    </div>
                    <span className="text-zinc-600">›</span>
                  </button>
                </div>
              ))
            )}
            {recipes.length > 5 && (
              <button
                onClick={() => navigate("/recipe")}
                className="flex w-full items-center justify-center py-3 text-xs text-zinc-500"
              >
                전체 {recipes.length}개 보기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
