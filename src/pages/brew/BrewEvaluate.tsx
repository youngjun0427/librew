import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBrewLogs } from "../../hooks/useBrewLogs";
import { useRecipes } from "../../hooks/useRecipes";
import { useBrewSessionStore } from "../../store/useBrewSessionStore";
import type { NextBrewTips, SensoryNote } from "../../types";

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

export default function BrewEvaluatePage() {
  const navigate = useNavigate();
  const { addBrewLog } = useBrewLogs();
  const { updateRecipe } = useRecipes();
  const { 
    selectedRecipe, selectedBean, usedCoffeeWeight, totalElapsed,
    actualGrindSize, actualWaterTemp, actualFilterType, reset 
  } = useBrewSessionStore();

  const [ratings, setRatings] = useState<SensoryNote>({
    acidity: 3, bitterness: 3, body: 3, aroma: 3, overall: 3,
  });
  const [memo, setMemo] = useState("");
  const [tips, setTips] = useState<NextBrewTips>({});
  const [isSaving, setIsSaving] = useState(false);

  const recipeWater = selectedRecipe?.steps.reduce((s, step) => s + step.waterAmount, 0) ?? selectedRecipe?.waterWeight ?? 0;
  
  const rescaledWater = (selectedRecipe && selectedRecipe.coffeeWeight > 0 && usedCoffeeWeight > 0)
    ? Math.round((recipeWater / selectedRecipe.coffeeWeight) * usedCoffeeWeight)
    : recipeWater;

  const hasTips = Object.values(tips).some((v) => v && v.trim());
  const hasOverrides = actualGrindSize !== null || actualWaterTemp !== null || actualFilterType !== null || usedCoffeeWeight !== selectedRecipe?.coffeeWeight;

  const handleSave = async () => {
    if (!selectedRecipe) return;
    setIsSaving(true);
    try {
      const logData: any = {
        recipeId: selectedRecipe.id,
        beanId: selectedBean?.id ?? null,
        usedCoffeeWeight,
        actualWaterWeight: rescaledWater,
        totalBrewTime: totalElapsed,
        sensoryNote: ratings,
        memo: memo.trim() || null,
        nextBrewTips: hasTips ? tips : null,
      };

      if (actualGrindSize != null) logData.actualGrindSize = actualGrindSize;
      if (actualWaterTemp != null) logData.actualWaterTemp = actualWaterTemp;
      if (actualFilterType != null) logData.actualFilterType = actualFilterType;

      await addBrewLog(logData);

      if (hasOverrides && ratings.overall >= 4) {
        if (window.confirm(`오늘 변경한 세팅이 만족스러우셨나요?\n이 세팅을 기존 '${selectedRecipe.title}'의 기본값으로 덮어쓸까요?`)) {
          await updateRecipe(selectedRecipe.id, {
            coffeeWeight: usedCoffeeWeight,
            waterWeight: rescaledWater,
            grindSize: actualGrindSize ?? selectedRecipe.grindSize,
            waterTemp: actualWaterTemp ?? selectedRecipe.waterTemp,
            filterType: actualFilterType ?? selectedRecipe.filterType,
          });
        }
      }

      reset();
      navigate("/", { replace: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipEval = async () => {
    if (!selectedRecipe) { reset(); navigate("/", { replace: true }); return; }
    
    const logData: any = {
      recipeId: selectedRecipe.id,
      beanId: selectedBean?.id ?? null,
      usedCoffeeWeight,
      actualWaterWeight: rescaledWater,
      totalBrewTime: totalElapsed,
      sensoryNote: null,
      memo: null,
    };

    if (actualGrindSize != null) logData.actualGrindSize = actualGrindSize;
    if (actualWaterTemp != null) logData.actualWaterTemp = actualWaterTemp;
    if (actualFilterType != null) logData.actualFilterType = actualFilterType;

    await addBrewLog(logData);
    reset();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-zinc-900 p-6 pt-14">
      <button onClick={() => navigate(-1)} className="mb-6 text-amber-400">← 뒤로</button>

      <h1 className="mb-1 text-2xl font-bold text-white">관능 평가</h1>
      <p className="mb-8 text-sm text-zinc-400">이번 추출은 어땠나요?</p>

      {CRITERIA.map(({ key, label, desc }) => (
        <RatingRow
          key={key}
          label={label}
          desc={desc}
          value={ratings[key]}
          onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
        />
      ))}

      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-zinc-400">메모 (선택)</p>
        <textarea
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-amber-400"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="이번 추출 소감..."
          rows={3}
        />
      </div>

      {/* Next brew tips */}
      <div className="mb-8">
        <p className="mb-1 text-sm font-semibold text-white">다음 번엔?</p>
        <p className="mb-3 text-xs text-zinc-500">다음 추출에서 바꿔볼 것들을 메모하세요</p>
        <div className="rounded-2xl bg-zinc-800 p-4">
          {TIP_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key} className="mb-3 last:mb-0">
              <p className="mb-1 text-xs font-medium text-zinc-400">{label}</p>
              <input
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-400"
                value={tips[key] ?? ""}
                onChange={(e) =>
                  setTips((prev) => ({ ...prev, [key]: e.target.value }))
                }
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        className={`mb-3 w-full rounded-2xl py-4 font-bold text-zinc-900 ${isSaving ? "bg-amber-300" : "bg-amber-400"}`}
        onClick={handleSave}
        disabled={isSaving}
      >
        {isSaving ? "저장 중..." : "저장하기"}
      </button>

      <button className="w-full py-3 text-center text-zinc-500" onClick={handleSkipEval}>
        기록만 남기고 건너뛰기
      </button>
    </div>
  );
}
