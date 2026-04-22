import { useNavigate, useSearchParams } from "react-router-dom";
import { ErrorView } from "../../components/ErrorView";
import { LoadingView } from "../../components/LoadingView";
import { useEquipment } from "../../hooks/useEquipment";
import type { Equipment } from "../../types";

type Tab = "grinder" | "dripper" | "filter" | "other";

const TABS: { key: Tab; label: string }[] = [
  { key: "grinder", label: "그라인더" },
  { key: "dripper", label: "드리퍼" },
  { key: "filter", label: "필터" },
  { key: "other", label: "기타장비" },
];

function filterByTab(equipment: Equipment[], tab: Tab): Equipment[] {
  if (tab === "grinder") return equipment.filter((e) => e.type === "grinder");
  if (tab === "dripper") return equipment.filter((e) => e.type === "dripper");
  if (tab === "filter") return equipment.filter((e) => e.type === "filter");
  return equipment.filter((e) => e.type !== "grinder" && e.type !== "dripper" && e.type !== "filter");
}

function EquipmentListItem({ item, onPress }: { item: Equipment; onPress: () => void }) {
  // 브랜드명을 제거한 순수 모델명 추출 (브랜드명이 이름 앞에 포함된 경우 대비)
  const displayName =
    item.brand && item.name.startsWith(item.brand)
      ? item.name.replace(item.brand, "").trim()
      : item.name;

  return (
    <div
      onClick={onPress}
      className="flex items-center justify-between py-3.5 border-b border-zinc-800/80 active:bg-zinc-800 transition-colors cursor-pointer px-4"
    >
      <div className="flex items-center gap-2 min-w-0">
        {item.brand && (
          <span className="text-sm font-medium text-zinc-500 shrink-0">{item.brand}</span>
        )}
        <span className="text-base font-semibold text-zinc-100 truncate">{displayName}</span>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-2">
        {item.type === "grinder" && item.specs.currentGrindSetting && (
          <div className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5">
            <span className="text-xs font-medium text-zinc-400">분쇄도</span>
            <span className="text-sm font-bold text-amber-400">
              {item.specs.currentGrindSetting}
            </span>
          </div>
        )}
        {item.type === "filter" && (
          <div className="flex items-center gap-2">
            {item.specs.filterSize && (
              <span className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-300">
                {item.specs.filterSize}
              </span>
            )}
            {item.specs.remainingAmount && (
              <div className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5">
                <span className="text-xs font-medium text-zinc-400">잔여량</span>
                <span className="text-sm font-bold text-emerald-400">
                  {item.specs.remainingAmount}장
                </span>
              </div>
            )}
          </div>
        )}
        <span className="text-zinc-600">›</span>
      </div>
    </div>
  );
}

export default function EquipmentListPage() {
  const { equipment, isLoading, error } = useEquipment();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") as Tab) || "grinder";

  const setTab = (newTab: Tab) => {
    setSearchParams({ tab: newTab }, { replace: true });
  };

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  const items = filterByTab(equipment, tab);

  return (
    <div className="flex h-screen flex-col bg-zinc-900">
      <div className="flex items-center justify-between px-5 pb-4 pt-14">
        <button onClick={() => navigate(-1)} className="text-amber-400">
          ← 뒤로
        </button>
        <h1 className="text-lg font-bold text-white">장비 관리</h1>
        <button onClick={() => navigate("/equipment/new")} className="text-amber-400">
          + 추가
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t.key ? "border-b-2 border-amber-400 text-amber-400" : "text-zinc-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-1 pt-3 pb-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <p className="text-zinc-400">
              등록된 {TABS.find((t) => t.key === tab)?.label}가 없어요
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {items.map((item) => (
              <EquipmentListItem
                key={item.id}
                item={item}
                onPress={() => navigate(`/equipment/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
