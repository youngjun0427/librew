import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBrewLogs } from "../../hooks/useBrewLogs";
import { useRecipes } from "../../hooks/useRecipes";
import { useBrewSessionStore } from "../../store/useBrewSessionStore";
import type { BrewLog, NextBrewTips, SensoryNote } from "../../types";

function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

const CRITERIA: { key: keyof SensoryNote; label: string; desc: string }[] = [
  { key: "acidity", label: "산미", desc: "신맛의 강도" },
  { key: "bitterness", label: "쓴맛", desc: "쓴맛의 강도" },
  { key: "body", label: "바디", desc: "무게감 · 질감" },
  { key: "aroma", label: "향", desc: "향의 풍부함" },
  { key: "overall", label: "전체 만족도", desc: "이번 추출 전반" },
];

const TIP_FIELDS: { key: keyof NextBrewTips; label: string; placeholder: string }[] = [
  { key: "grind", label: "분쇄도", placeholder: "예: 분쇄도 +2 클릭" },
  { key: "temp", label: "물 온도", placeholder: "예: 92°C로 낮추기" },
  { key: "bloom", label: "뜸 들이기", placeholder: "예: 40초로 늘리기" },
  { key: "water", label: "물량", placeholder: "예: 240ml로 줄이기" },
  { key: "other", label: "기타", placeholder: "자유롭게..." },
];

function RatingRow({
  label, desc, value, onChange,
}: { label: string; desc: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-zinc-500">{desc}</p>
        </div>
        <span className="text-sm text-zinc-400">{value} / 5</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 rounded-xl py-3 text-center text-sm font-medium ${
              value >= n ? "bg-amber-400 text-zinc-900" : "bg-zinc-700 text-zinc-500"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleRow({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-zinc-300">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-amber-400" : "bg-zinc-600"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function BrewEvaluatePage() {
  const navigate = useNavigate();
  const { addBrewLog } = useBrewLogs();
  const { updateRecipe } = useRecipes();
  const {
    selectedRecipe, selectedBean, usedCoffeeWeight, totalElapsed,
    selectedGrinder, actualGrindSetting, actualWaterTemp, actualFilterType, reset,
  } = useBrewSessionStore();

  const [ratings, setRatings] = useState<SensoryNote>({
    acidity: 3, bitterness: 3, body: 3, aroma: 3, overall: 3,
  });
  const [memo, setMemo] = useState("");
  const [tips, setTips] = useState<NextBrewTips>({});
  const [isSaving, setIsSaving] = useState(false);

  const recipeWater = selectedRecipe
    ? (selectedRecipe.steps.reduce((s, st) => s + st.waterAmount, 0) || selectedRecipe.waterWeight)
    : 0;
  const rescaledWater =
    selectedRecipe && selectedRecipe.coffeeWeight > 0 && usedCoffeeWeight > 0
      ? Math.round((recipeWater / selectedRecipe.coffeeWeight) * usedCoffeeWeight)
      : recipeWater;

  // 변경 여부 감지
  const coffeeChanged = !!selectedRecipe && usedCoffeeWeight !== selectedRecipe.coffeeWeight;
  const tempChanged = actualWaterTemp !== null && !!selectedRecipe && actualWaterTemp !== selectedRecipe.waterTemp;
  const waterChanged = !!selectedRecipe && Math.abs(rescaledWater - selectedRecipe.waterWeight) > 1;
  const savedGrind = selectedGrinder ? (selectedRecipe?.grindSettings?.[selectedGrinder.id] ?? "") : "";
  const grindChanged = !!actualGrindSetting && actualGrindSetting !== savedGrind;
  const hasAnyChange = coffeeChanged || tempChanged || waterChanged || grindChanged;

  const [updateCoffee, setUpdateCoffee] = useState(true);
  const [updateTemp, setUpdateTemp] = useState(true);
  const [updateWater, setUpdateWater] = useState(true);
  const [updateGrind, setUpdateGrind] = useState(true);

  const hasTips = Object.values(tips).some((v) => v && v.trim());

  const handleSave = async () => {
    if (!selectedRecipe) return;
    setIsSaving(true);
    try {
      const logData: Omit<BrewLog, "id" | "brewedAt"> = {
        recipeId: selectedRecipe.id,
        beanId: selectedBean?.id ?? null,
        usedCoffeeWeight,
        actualWaterWeight: rescaledWater,
        totalBrewTime: totalElapsed,
        sensoryNote: ratings,
        memo: memo.trim() || null,
        nextBrewTips: hasTips ? tips : undefined,
      };
      if (selectedGrinder != null) logData.grinderId = selectedGrinder.id;
      if (actualGrindSetting != null) logData.actualGrindSetting = actualGrindSetting;
      if (actualWaterTemp != null) logData.actualWaterTemp = actualWaterTemp;
      if (actualFilterType != null) logData.actualFilterType = actualFilterType;

      await addBrewLog(logData);

      // 레시피 업데이트
      const recipeUpdate: Record<string, unknown> = {};
      if (coffeeChanged && updateCoffee) recipeUpdate.coffeeWeight = usedCoffeeWeight;
      if (tempChanged && updateTemp) recipeUpdate.waterTemp = actualWaterTemp;
      if (waterChanged && updateWater) recipeUpdate.waterWeight = rescaledWater;
      if (grindChanged && updateGrind && selectedGrinder) {
        recipeUpdate.grindSettings = {
          ...selectedRecipe.grindSettings,
          [selectedGrinder.id]: actualGrindSetting,
        };
      }

      if (Object.keys(recipeUpdate).length > 0) {
        await updateRecipe(selectedRecipe.id, recipeUpdate);
      }

      reset();
      navigate("/", { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleHome = () => {
    if (window.confirm("저장하지 않고 나가시겠어요?")) {
      reset();
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="overflow-y-auto pb-32">
        {/* 완료 헤더 */}
        <div className="px-6 pb-6 pt-14 text-center">
          <p className="mb-2 text-5xl">☕</p>
          <h1 className="mb-1 text-2xl font-bold text-white">추출 완료!</h1>
          <p className="mb-4 text-2xl font-mono font-semibold text-amber-400">{formatTime(totalElapsed)}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {selectedRecipe && (
              <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
                {selectedRecipe.title}
              </span>
            )}
            {selectedBean && (
              <span className="rounded-full bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
                {selectedBean.name}
              </span>
            )}
          </div>
        </div>

        <div className="px-6">
          {/* 관능 평가 */}
          <div className="mb-6 rounded-2xl bg-zinc-800 p-5">
            <p className="mb-4 text-sm font-semibold text-white">관능 평가</p>
            {CRITERIA.map(({ key, label, desc }) => (
              <RatingRow
                key={key}
                label={label}
                desc={desc}
                value={ratings[key]}
                onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
              />
            ))}
            <div className="mt-2">
              <p className="mb-2 text-xs font-medium text-zinc-400">메모 (선택)</p>
              <textarea
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-amber-400"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="이번 추출 소감..."
                rows={3}
              />
            </div>
          </div>

          {/* 다음 번엔? */}
          <div className="mb-6 rounded-2xl bg-zinc-800 p-5">
            <p className="mb-1 text-sm font-semibold text-white">다음 번엔?</p>
            <p className="mb-3 text-xs text-zinc-500">다음 추출에서 바꿔볼 것들을 메모하세요</p>
            {TIP_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} className="mb-3 last:mb-0">
                <p className="mb-1 text-xs font-medium text-zinc-400">{label}</p>
                <input
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-400"
                  value={tips[key] ?? ""}
                  onChange={(e) => setTips((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>

          {/* 레시피 업데이트 */}
          {hasAnyChange && (
            <div className="mb-6 rounded-2xl bg-zinc-800 p-5">
              <p className="mb-1 text-sm font-semibold text-white">레시피 업데이트</p>
              <p className="mb-3 text-xs text-zinc-500">추출 전 변경한 값이 있어요. 레시피에 반영할 항목을 선택하세요.</p>
              {coffeeChanged && (
                <ToggleRow
                  label={`원두량  ${selectedRecipe!.coffeeWeight}g → ${usedCoffeeWeight}g`}
                  checked={updateCoffee}
                  onChange={setUpdateCoffee}
                />
              )}
              {tempChanged && (
                <ToggleRow
                  label={`물 온도  ${selectedRecipe!.waterTemp}°C → ${actualWaterTemp}°C`}
                  checked={updateTemp}
                  onChange={setUpdateTemp}
                />
              )}
              {waterChanged && (
                <ToggleRow
                  label={`총 물량  ${selectedRecipe!.waterWeight}ml → ${rescaledWater}ml`}
                  checked={updateWater}
                  onChange={setUpdateWater}
                />
              )}
              {grindChanged && (
                <ToggleRow
                  label={`분쇄도  ${savedGrind || "미설정"} → ${actualGrindSetting}`}
                  checked={updateGrind}
                  onChange={setUpdateGrind}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* 하단 CTA */}
      <div className="fixed bottom-0 left-0 right-0 flex gap-3 border-t border-zinc-800 bg-zinc-900 px-5 pb-10 pt-4">
        <button
          onClick={handleHome}
          className="flex-1 rounded-2xl border border-zinc-700 py-4 text-sm font-semibold text-zinc-300 active:bg-zinc-800"
        >
          🏠 홈으로
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex-2 flex-1 rounded-2xl py-4 text-sm font-bold text-zinc-900 ${
            isSaving ? "bg-amber-300" : "bg-amber-400"
          }`}
        >
          {isSaving ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </div>
  );
}
