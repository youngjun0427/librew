import { useNavigate } from "react-router-dom";
import { ErrorView } from "../../components/ErrorView";
import { LoadingView } from "../../components/LoadingView";
import { useEquipment } from "../../hooks/useEquipment";
import type { Equipment } from "../../types";

const EQUIPMENT_ICONS: Record<Equipment["type"], string> = {
  grinder: "⚙️", dripper: "☕", filter: "📄", other: "🔧",
};
const EQUIPMENT_TYPE_LABELS: Record<Equipment["type"], string> = {
  grinder: "그라인더", dripper: "드리퍼", filter: "필터", other: "기타",
};

function getSubtitle(item: Equipment): string {
  const s = item.specs;
  if (item.type === "grinder") return s.clickUnit ?? "";
  if (item.type === "dripper") return [s.filterType, s.servings].filter(Boolean).join(" · ");
  if (item.type === "filter") return s.remainingAmount ? `${s.remainingAmount}장 남음` : "";
  return "";
}

export default function BrewEquipmentPage() {
  const navigate = useNavigate();
  const { equipment, isLoading, error } = useEquipment();

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  return (
    <div className="flex h-screen flex-col bg-zinc-900">
      <div className="px-5 pb-4 pt-14">
        <button onClick={() => navigate(-1)} className="mb-4 text-zinc-400">✕ 취소</button>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">STEP 1 OF 3</p>
        <h1 className="mt-1 text-2xl font-bold text-white">장비 확인</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {equipment.length === 0 ? (
          <div className="mt-8 flex flex-col items-center">
            <p className="text-zinc-400">등록된 장비가 없어요</p>
            <button className="mt-4 text-amber-400" onClick={() => navigate("/equipment")}>
              장비 추가하러 가기 →
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-zinc-800">
            {equipment.map((item, idx) => (
              <div key={item.id}>
                {idx > 0 && <div className="mx-4 h-px bg-zinc-700" />}
                <div className="flex items-center px-4 py-3">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-700">
                    <span className="text-lg">{EQUIPMENT_ICONS[item.type]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-zinc-400">{EQUIPMENT_TYPE_LABELS[item.type]}</p>
                    <p className="text-base font-semibold text-white">{item.name}</p>
                    {getSubtitle(item) ? (
                      <p className="text-xs text-zinc-400">{getSubtitle(item)}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <button className="mt-4 w-full py-2 text-center text-sm text-zinc-500" onClick={() => navigate("/equipment")}>
          장비 변경하기 →
        </button>
      </div>

      <div className="px-5 pb-8 pt-4">
        <button
          className="w-full items-center justify-center rounded-2xl bg-amber-400 py-4 text-lg font-bold text-zinc-900"
          onClick={() => navigate("/brew/recipe")}
        >
          다음: 레시피 선택
        </button>
      </div>
    </div>
  );
}
