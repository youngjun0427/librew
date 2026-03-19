import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorView } from "../../components/ErrorView";
import { LoadingView } from "../../components/LoadingView";
import { useEquipment } from "../../hooks/useEquipment";
import type { Equipment } from "../../types";

const TYPE_ICONS: Record<Equipment["type"], string> = {
  grinder: "⚙️", kettle: "🫖", dripper: "☕", scale: "⚖️", other: "🔧",
};
const TYPE_LABELS: Record<Equipment["type"], string> = {
  grinder: "그라인더", kettle: "케틀", dripper: "드리퍼", scale: "저울", other: "기타",
};

type Tab = "grinder" | "dripper" | "other";

const TABS: { key: Tab; label: string }[] = [
  { key: "grinder", label: "그라인더" },
  { key: "dripper", label: "드리퍼" },
  { key: "other", label: "기타장비" },
];

function filterByTab(equipment: Equipment[], tab: Tab): Equipment[] {
  if (tab === "grinder") return equipment.filter((e) => e.type === "grinder");
  if (tab === "dripper") return equipment.filter((e) => e.type === "dripper");
  return equipment.filter((e) => e.type !== "grinder" && e.type !== "dripper");
}

function EquipmentCard({ item, onPress }: { item: Equipment; onPress: () => void }) {
  return (
    <button className="mb-3 flex w-full items-center rounded-2xl bg-zinc-800 p-4 text-left" onClick={onPress}>
      <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-700">
        <span className="text-2xl">{TYPE_ICONS[item.type]}</span>
      </div>
      <div className="flex-1">
        <p className="text-xs text-zinc-400">{TYPE_LABELS[item.type]}</p>
        <p className="text-base font-semibold text-white">{item.name}</p>
        {item.brand ? <p className="text-sm text-zinc-400">{item.brand}</p> : null}
      </div>
    </button>
  );
}

export default function EquipmentListPage() {
  const { equipment, isLoading, error } = useEquipment();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("grinder");

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  const items = filterByTab(equipment, tab);

  return (
    <div className="flex h-screen flex-col bg-zinc-900">
      <div className="flex items-center justify-between px-5 pb-4 pt-14">
        <button onClick={() => navigate(-1)} className="text-amber-400">← 뒤로</button>
        <h1 className="text-lg font-bold text-white">장비 관리</h1>
        <button onClick={() => navigate("/equipment/new")} className="text-amber-400">+ 추가</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-b-2 border-amber-400 text-amber-400"
                : "text-zinc-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <p className="text-zinc-400">등록된 {TABS.find((t) => t.key === tab)?.label}가 없어요</p>
            <button className="mt-4 text-amber-400" onClick={() => navigate("/equipment/new")}>
              + 추가하기
            </button>
          </div>
        ) : (
          items.map((item) => (
            <EquipmentCard key={item.id} item={item} onPress={() => navigate(`/equipment/${item.id}`)} />
          ))
        )}
      </div>
    </div>
  );
}
