import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorView } from "../../components/ErrorView";
import { LoadingView } from "../../components/LoadingView";
import { useEquipment } from "../../hooks/useEquipment";
import type { Equipment } from "../../types";

const TYPE_ICONS: Record<Equipment["type"], string> = {
  grinder: "⚙️",
  dripper: "☕",
  scale: "⚖️",
  other: "🔧",
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

function EquipmentCard({
  item,
  onPress,
  onUpdateGrindSetting,
}: {
  item: Equipment;
  onPress: () => void;
  onUpdateGrindSetting: (id: string, currentVal: string) => void;
}) {
  // 브랜드명을 제거한 순수 모델명 추출 (브랜드명이 이름 앞에 포함된 경우 대비)
  const displayName =
    item.brand && item.name.startsWith(item.brand)
      ? item.name.replace(item.brand, "").trim()
      : item.name;

  return (
    <div
      className="flex flex-col justify-between overflow-hidden rounded-2xl bg-zinc-800 p-4 active:bg-zinc-700/50 cursor-pointer h-full"
      onClick={onPress}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-700">
          <span className="text-xl">{TYPE_ICONS[item.type]}</span>
        </div>

        {item.type === "grinder" && item.specs.currentGrindSetting && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateGrindSetting(item.id, item.specs.currentGrindSetting || "");
            }}
            className="rounded-lg bg-zinc-900/50 px-3 py-1.5 text-right transition-colors hover:bg-zinc-700"
          >
            <span className="text-sm font-bold text-amber-400">
              {item.specs.currentGrindSetting}
            </span>
          </button>
        )}
      </div>

      <div>
        {item.brand ? (
          <p className="text-xs font-medium text-zinc-400 mb-0.5">{item.brand}</p>
        ) : null}
        <p className="text-base font-bold text-white leading-tight">{displayName}</p>
      </div>
    </div>
  );
}

export default function EquipmentListPage() {
  const { equipment, isLoading, error, updateEquipment } = useEquipment();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("grinder");

  const handleUpdateGrindSetting = async (id: string, currentVal: string) => {
    const newVal = window.prompt(
      "현재 분쇄도를 입력하세요 (예: 18클릭, 2.5.2)\n삭제하려면 빈 칸으로 확인을 누르세요.",
      currentVal
    );
    if (newVal !== null) {
      const equip = equipment.find((e) => e.id === id);
      if (equip) {
        await updateEquipment(id, {
          specs: { ...equip.specs, currentGrindSetting: newVal.trim() || undefined },
        });
      }
    }
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

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <p className="text-zinc-400">
              등록된 {TABS.find((t) => t.key === tab)?.label}가 없어요
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <EquipmentCard
                key={item.id}
                item={item}
                onPress={() => navigate(`/equipment/${item.id}`)}
                onUpdateGrindSetting={handleUpdateGrindSetting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
