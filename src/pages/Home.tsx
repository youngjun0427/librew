import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { ErrorView } from "../components/ErrorView";
import { LoadingView } from "../components/LoadingView";
import { useBrewLogs } from "../hooks/useBrewLogs";
import { useRecipes } from "../hooks/useRecipes";
import type { BrewLog, Recipe } from "../types";

function getWeeklyData(logs: BrewLog[]) {
  const result = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(now.getDate() - i * 7);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const count = logs.filter((l) => {
      if (!l.brewedAt) return false;
      const d = new Date(l.brewedAt.seconds * 1000);
      return d >= start && d <= end;
    }).length;

    result.push({
      week: `${start.getMonth() + 1}/${start.getDate()}`,
      추출: count,
    });
  }
  return result;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex-1 rounded-2xl bg-zinc-800 px-4 py-3">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

function RecentLogItem({
  log,
  recipeName,
  onPress,
}: {
  log: BrewLog;
  recipeName: string;
  onPress: () => void;
}) {
  const date = log.brewedAt
    ? new Date(log.brewedAt.seconds * 1000).toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      })
    : "";
  const overall = log.sensoryNote?.overall;

  return (
    <button
      onClick={onPress}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-700">
        <span className="text-base">☕</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-white">{recipeName}</p>
        <div className="mt-0.5 flex items-center gap-2">
          {overall ? (
            <span className="text-xs text-amber-400">
              {"★".repeat(overall)}{"☆".repeat(5 - overall)}
            </span>
          ) : null}
          <span className="text-xs text-zinc-500">{date}</span>
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

  const weeklyData = useMemo(() => getWeeklyData(brewLogs), [brewLogs]);

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return brewLogs.filter((l) => {
      if (!l.brewedAt) return false;
      const d = new Date(l.brewedAt.seconds * 1000);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [brewLogs]);

  const avgOverall = useMemo(() => {
    const rated = brewLogs.filter((l) => l.sensoryNote?.overall);
    if (rated.length === 0) return null;
    const sum = rated.reduce((acc, l) => acc + (l.sensoryNote?.overall ?? 0), 0);
    return (sum / rated.length).toFixed(1);
  }, [brewLogs]);

  const recipeMap = useMemo(
    () => new Map<string, Recipe>(recipes.map((r) => [r.id, r])),
    [recipes]
  );

  const recentLogs = brewLogs.slice(0, 5);

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-2 pt-14">
        <h1 className="text-lg font-bold text-white">Librew</h1>
        <button
          onClick={() => navigate("/mypage")}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 active:bg-zinc-800"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
        {/* Stat cards */}
        <div className="flex gap-3">
          <StatCard
            label="총 추출"
            value={`${brewLogs.length}회`}
            sub={`이번 달 ${thisMonthCount}회`}
          />
          <StatCard
            label="평균 만족도"
            value={avgOverall ? `★ ${avgOverall}` : "-"}
            sub={avgOverall ? `${brewLogs.filter((l) => l.sensoryNote?.overall).length}회 평가` : "아직 평가 없음"}
          />
          <StatCard
            label="레시피"
            value={`${recipes.length}개`}
            sub="My Library"
          />
        </div>

        {/* Weekly chart */}
        <div className="rounded-2xl bg-zinc-800 px-4 pt-4 pb-2">
          <p className="mb-3 text-sm font-semibold text-white">주간 추출 현황</p>
          {brewLogs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-zinc-600">추출 기록이 없어요</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={weeklyData} barSize={18} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 9, fill: "#52525b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#27272a",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                  itemStyle={{ color: "#f59e0b" }}
                  formatter={(value) => [`${value}회`, "추출"]}
                />
                <Bar dataKey="추출" radius={[3, 3, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.추출 > 0 ? "#f59e0b" : "#3f3f46"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent brew logs */}
        <div className="rounded-2xl bg-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-sm font-semibold text-white">최근 Brew Log</p>
            <button
              onClick={() => navigate("/log")}
              className="text-sm text-amber-400"
            >
              전체 ›
            </button>
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
      </div>
    </div>
  );
}
