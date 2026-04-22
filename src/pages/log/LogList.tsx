import type { Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ErrorView } from "../../components/ErrorView";
import { LoadingView } from "../../components/LoadingView";
import { useBeans } from "../../hooks/useBeans";
import { useBrewLogs } from "../../hooks/useBrewLogs";
import { useRecipes } from "../../hooks/useRecipes";
import type { BrewLog } from "../../types";

function formatDate(ts: Timestamp) {
  return ts.toDate().toLocaleDateString("ko-KR", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatTime(s: number) {
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function LogListPage() {
  const navigate = useNavigate();
  const { brewLogs, isLoading: logsLoading, error } = useBrewLogs();
  const { recipes, isLoading: recLoading } = useRecipes();
  const { beans, isLoading: beansLoading } = useBeans();

  const isLoading = logsLoading || recLoading || beansLoading;

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="flex items-center justify-between px-5 pb-4 pt-14">
        <button onClick={() => navigate(-1)} className="text-amber-400">← 뒤로</button>
        <h1 className="text-lg font-bold text-white">추출 기록</h1>
        <div className="w-12" />
      </div>

      {brewLogs.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <p className="text-zinc-400">추출 기록이 없어요</p>
          <p className="mt-1 text-sm text-zinc-600">브루잉을 마치면 여기에 쌓입니다</p>
        </div>
      ) : (
        <div className="px-5 pb-8">
          {(brewLogs as BrewLog[]).map((item) => {
            const recipe = recipes.find((r) => r.id === item.recipeId);
            const bean = item.beanId ? beans.find((b) => b.id === item.beanId) : null;
            const overall = item.sensoryNote?.overall;
            return (
              <button
                key={item.id}
                className="mb-3 w-full rounded-2xl bg-zinc-800 p-4 text-left active:bg-zinc-700"
                onClick={() => navigate(`/log/${item.id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-base font-semibold text-white">
                      {recipe?.title ?? "알 수 없는 레시피"}
                    </p>
                    {bean ? <p className="mt-0.5 text-sm text-zinc-400">{bean.name}</p> : null}
                    <p className="mt-1 text-xs text-zinc-500">{formatDate(item.brewedAt)}</p>
                  </div>
                  <div className="text-right">
                    {overall != null ? (
                      <div className="rounded-lg bg-amber-400/20 px-2 py-1">
                        <span className="text-sm font-semibold text-amber-400">★ {overall}/5</span>
                      </div>
                    ) : null}
                    {item.totalBrewTime > 0 ? (
                      <p className="mt-1 text-xs text-zinc-500">{formatTime(item.totalBrewTime)}</p>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
