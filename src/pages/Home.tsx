import { useNavigate } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { ErrorView } from "../components/ErrorView";
import { LoadingView } from "../components/LoadingView";
import { useBrewLogs } from "../hooks/useBrewLogs";
import { useRecipes } from "../hooks/useRecipes";
import type { BrewLog, Recipe } from "../types";

function StarRating({ value }: { value: number }) {
  return (
    <span className="text-xs text-amber-400">
      {"★".repeat(value)}{"☆".repeat(5 - value)}
    </span>
  );
}

function NavCard({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-zinc-800 py-7 active:bg-zinc-700"
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-medium text-white">{label}</span>
    </button>
  );
}

function RecentLogItem({
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
    <button onClick={onPress} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-700">
        <span className="text-lg">☕</span>
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
  const { recipes, isLoading: recLoading, error: recError } = useRecipes();
  const { brewLogs, isLoading: logLoading, error: logError } = useBrewLogs();

  const isLoading = recLoading || logLoading;
  const error = recError || logError;

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  const recipeMap = new Map<string, Recipe>(recipes.map((r) => [r.id, r]));
  const recentLogs = brewLogs.slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-900 pb-8">
      <TopBar />

      <div className="flex-1 overflow-y-auto px-4 pt-2 space-y-3">
        {/* Nav cards */}
        <div className="grid grid-cols-3 gap-3">
          <NavCard icon="⚙️" label="장비" onClick={() => navigate("/equipment")} />
          <NavCard icon="🫘" label="원두" onClick={() => navigate("/bean")} />
          <NavCard icon="📋" label="레시피" onClick={() => navigate("/recipe")} />
        </div>

        {/* Recent logs - bigger card */}
        <div className="rounded-2xl bg-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-sm font-semibold text-white">최근 기록</span>
            <button onClick={() => navigate("/log")} className="text-sm text-amber-400">전체 ›</button>
          </div>
          {recentLogs.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-1">
              <span className="text-sm text-zinc-500">아직 추출 기록이 없어요</span>
              <span className="text-xs text-zinc-600">브루잉 후 평가를 남겨보세요</span>
            </div>
          ) : (
            recentLogs.map((log, idx) => (
              <div key={log.id}>
                {idx > 0 && <div className="mx-4 h-px bg-zinc-700" />}
                <RecentLogItem
                  log={log}
                  recipeName={recipeMap.get(log.recipeId)?.title ?? "삭제된 레시피"}
                  onPress={() => navigate(`/log/${log.id}`)}
                />
              </div>
            ))
          )}
        </div>

        {/* Brew CTA */}
        <button
          onClick={() => navigate("/brew/prep")}
          className="w-full rounded-2xl bg-amber-400 py-5 text-lg font-bold text-zinc-900 shadow-lg shadow-amber-400/20 active:bg-amber-300"
        >
          ⚡ 브루잉 시작
        </button>
      </div>
    </div>
  );
}
