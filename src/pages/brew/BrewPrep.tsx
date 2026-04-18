import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomSheet } from "../../components/BottomSheet";
import { useBeans } from "../../hooks/useBeans";
import { useBrewLogs } from "../../hooks/useBrewLogs";
import { useEquipment } from "../../hooks/useEquipment";
import { useRecipes } from "../../hooks/useRecipes";
import { useBrewSessionStore } from "../../store/useBrewSessionStore";
import type { Bean, BrewLog, Equipment, Recipe, RecipeStep } from "../../types";

type Sheet = "history" | "bean" | "recipe" | "grinder" | null;
type StepEdit = { waterAmount: string; duration: string };

const inputClass =
  "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400 placeholder-zinc-600";
const cellInputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-center text-sm text-white outline-none focus:border-amber-400";

function toDateStr(ts: { seconds: number }) {
  return new Date(ts.seconds * 1000).toLocaleDateString("ko-KR", {
    month: "short", day: "numeric",
  });
}

// 셀렉터 행 컴포넌트
function SelectorRow({
  label,
  required,
  value,
  placeholder,
  onClick,
}: {
  label: string;
  required?: boolean;
  value?: string;
  placeholder: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl bg-zinc-800 p-4 text-left active:bg-zinc-700"
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs text-zinc-500">
          {label}
          {required && <span className="ml-1 text-amber-400">*</span>}
        </p>
        <p className={`mt-0.5 truncate text-sm font-semibold ${value ? "text-white" : "text-zinc-500"}`}>
          {value || placeholder}
        </p>
      </div>
      <span className="ml-3 shrink-0 text-lg text-zinc-600">›</span>
    </button>
  );
}

export default function BrewPrepPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { beans, isLoading: beansLoading } = useBeans();
  const { equipment, isLoading: equipmentLoading } = useEquipment();
  const { brewLogs } = useBrewLogs();

  const {
    selectedRecipe, selectedBean, selectedGrinder,
    setSelectedRecipe, setSelectedBean, setSelectedGrinder,
    setUsedCoffeeWeight, setActualGrindSetting, setActualWaterTemp,
    setActualSteps, reset,
  } = useBrewSessionStore();

  const [sheet, setSheet] = useState<Sheet>(null);
  const [grindInput, setGrindInput] = useState("");
  const [coffeeInput, setCoffeeInput] = useState("");
  const [tempInput, setTempInput] = useState("");
  const [stepEdits, setStepEdits] = useState<StepEdit[]>([]);

  const grinders = equipment.filter((e) => e.type === "grinder");
  const isLoading = recipesLoading || beansLoading || equipmentLoading;

  // 마운트 시 항상 초기화
  useEffect(() => {
    reset();
    const recipeId = (location.state as { recipeId?: string } | null)?.recipeId;
    if (recipeId) {
      const recipe = recipes.find((r) => r.id === recipeId);
      if (recipe) selectRecipe(recipe);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // stepEdits → actualSteps 동기화
  useEffect(() => {
    if (stepEdits.length === 0 || !selectedRecipe) { setActualSteps(null); return; }
    const steps: RecipeStep[] = selectedRecipe.steps.map((s, i) => ({
      ...s,
      waterAmount: Number(stepEdits[i]?.waterAmount) || s.waterAmount,
      duration: Number(stepEdits[i]?.duration) || 0,
    }));
    setActualSteps(steps);
  }, [stepEdits]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── 핸들러 ────────────────────────────────────────────────────────────

  function selectRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe);
    setCoffeeInput(String(recipe.coffeeWeight || ""));
    setUsedCoffeeWeight(recipe.coffeeWeight);
    setTempInput(String(recipe.waterTemp || ""));
    setActualWaterTemp(recipe.waterTemp ?? null);
    setStepEdits(recipe.steps.map((s) => ({
      waterAmount: String(s.waterAmount),
      duration: String(s.duration ?? 0),
    })));
    if (selectedGrinder) {
      const saved = recipe.grindSettings?.[selectedGrinder.id] ?? "";
      setGrindInput(saved);
      setActualGrindSetting(saved || null);
    }
  }

  function selectGrinder(grinder: Equipment | null) {
    setSelectedGrinder(grinder);
    if (grinder && selectedRecipe) {
      const saved = selectedRecipe.grindSettings?.[grinder.id] ?? "";
      setGrindInput(saved);
      setActualGrindSetting(saved || null);
    } else {
      setGrindInput("");
      setActualGrindSetting(null);
    }
  }

  function handleLoadHistory(log: BrewLog) {
    const recipe = recipes.find((r) => r.id === log.recipeId);
    if (!recipe) return;
    const bean: Bean | null = log.beanId ? (beans.find((b) => b.id === log.beanId) ?? null) : null;
    const grinder: Equipment | null = log.grinderId
      ? (equipment.find((e) => e.id === log.grinderId) ?? null)
      : null;

    reset();
    setSelectedRecipe(recipe);
    setSelectedBean(bean);
    setSelectedGrinder(grinder);

    const coffee = log.usedCoffeeWeight || recipe.coffeeWeight;
    const temp = log.actualWaterTemp ?? recipe.waterTemp ?? null;
    const grind = log.actualGrindSetting ?? (grinder ? recipe.grindSettings?.[grinder.id] ?? "" : "");

    setCoffeeInput(String(coffee));
    setUsedCoffeeWeight(coffee);
    setTempInput(String(temp ?? ""));
    setActualWaterTemp(temp);
    setGrindInput(grind);
    setActualGrindSetting(grind || null);
    setStepEdits(recipe.steps.map((s) => ({
      waterAmount: String(s.waterAmount),
      duration: String(s.duration ?? 0),
    })));
    setSheet(null);
  }

  // ─── 파생값 ────────────────────────────────────────────────────────────

  const totalWater = stepEdits.reduce((sum, s) => sum + (Number(s.waterAmount) || 0), 0);

  const recentLogs = [...brewLogs]
    .sort((a, b) => (b.brewedAt?.seconds ?? 0) - (a.brewedAt?.seconds ?? 0))
    .slice(0, 5);

  const sortedGrinders = selectedRecipe
    ? [...grinders].sort((a, b) => {
        const aHas = !!selectedRecipe.grindSettings?.[a.id];
        const bHas = !!selectedRecipe.grindSettings?.[b.id];
        return aHas === bHas ? 0 : aHas ? -1 : 1;
      })
    : grinders;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-900">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-900">
      {/* 헤더 */}
      <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-14">
        <button onClick={() => navigate(-1)} className="text-sm text-zinc-400">✕</button>
        <h1 className="text-base font-bold text-white">브루잉 준비</h1>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4">

        {/* 최근 기록 버튼 */}
        {recentLogs.length > 0 && (
          <button
            onClick={() => setSheet("history")}
            className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 py-3 text-sm font-medium text-zinc-300 active:bg-zinc-800"
          >
            <span className="text-base">🕐</span>
            최근 기록으로 시작
          </button>
        )}

        {/* 셀렉터 영역 */}
        <div className="space-y-3">
          {/* 원두 */}
          <SelectorRow
            label="원두"
            value={selectedBean?.name}
            placeholder="선택 안 함"
            onClick={() => setSheet("bean")}
          />

          {/* 레시피 */}
          <SelectorRow
            label="레시피"
            required
            value={selectedRecipe?.title}
            placeholder="레시피를 선택하세요"
            onClick={() => setSheet("recipe")}
          />

          {/* 레시피 선택 후 인라인 확장 */}
          {selectedRecipe && (
            <div className="rounded-2xl border border-zinc-700 bg-zinc-800/50 p-4 space-y-5">

              {/* 그라인더 */}
              <div>
                <p className="mb-2 text-xs font-medium text-zinc-500">그라인더</p>
                <button
                  onClick={() => setSheet("grinder")}
                  className="flex w-full items-center justify-between rounded-xl bg-zinc-800 px-4 py-3 text-left active:bg-zinc-700"
                >
                  <span className={`text-sm font-semibold ${selectedGrinder ? "text-white" : "text-zinc-500"}`}>
                    {selectedGrinder?.name || "선택 안 함"}
                  </span>
                  <span className="text-zinc-600">›</span>
                </button>
                {selectedGrinder && (
                  <div className="mt-2">
                    <p className="mb-1.5 text-xs text-zinc-500">분쇄도</p>
                    <input
                      className={inputClass}
                      value={grindInput}
                      onChange={(e) => {
                        setGrindInput(e.target.value);
                        setActualGrindSetting(e.target.value || null);
                      }}
                      placeholder="예: 18클릭, 3.5, 중간-굵게"
                    />
                  </div>
                )}
              </div>

              {/* 추출 설정 */}
              <div>
                <p className="mb-2 text-xs font-medium text-zinc-500">추출 설정</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="mb-1 text-xs text-zinc-600">원두량 (g)</p>
                    <input
                      className={inputClass}
                      value={coffeeInput}
                      onChange={(e) => {
                        setCoffeeInput(e.target.value);
                        const n = Number(e.target.value);
                        if (!isNaN(n) && n > 0) setUsedCoffeeWeight(n);
                      }}
                      inputMode="decimal"
                    />
                  </div>
                  <div>
                    <p className="mb-1 text-xs text-zinc-600">물 온도 (°C)</p>
                    <input
                      className={inputClass}
                      value={tempInput}
                      onChange={(e) => {
                        setTempInput(e.target.value);
                        const n = Number(e.target.value);
                        setActualWaterTemp(!isNaN(n) && n > 0 ? n : null);
                      }}
                      inputMode="decimal"
                    />
                  </div>
                </div>
              </div>

              {/* 추출 단계 */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-zinc-500">추출 단계</p>
                  <span className="text-xs text-zinc-600">총 {totalWater}ml</span>
                </div>
                {selectedRecipe.steps.map((step, i) => (
                  <div key={step.order} className="mb-3 rounded-xl bg-zinc-700/50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/20 text-xs font-bold text-amber-400">
                        {step.order}
                      </span>
                      {step.pourMethod && (
                        <span className="text-xs text-zinc-400">{step.pourMethod}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="mb-1 text-[10px] text-zinc-500">물량 (ml)</p>
                        <input
                          className={cellInputClass}
                          value={stepEdits[i]?.waterAmount ?? ""}
                          onChange={(e) => {
                            const next = [...stepEdits];
                            next[i] = { ...next[i], waterAmount: e.target.value };
                            setStepEdits(next);
                          }}
                          inputMode="decimal"
                        />
                      </div>
                      <div>
                        <p className="mb-1 text-[10px] text-zinc-500">붓기 (초)</p>
                        {i === 0 ? (
                          <div className={`${cellInputClass} cursor-not-allowed text-zinc-600`}>0</div>
                        ) : (
                          <input
                            className={cellInputClass}
                            value={stepEdits[i]?.duration ?? ""}
                            onChange={(e) => {
                              const next = [...stepEdits];
                              next[i] = { ...next[i], duration: e.target.value };
                              setStepEdits(next);
                            }}
                            inputMode="decimal"
                          />
                        )}
                      </div>
                    </div>
                    {step.tip && (
                      <p className="mt-2 text-xs text-zinc-600">{step.tip}</p>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* 추출 시작 */}
      <div className="shrink-0 px-5 pb-10 pt-3">
        <button
          onClick={() => selectedRecipe && navigate("/brew/countdown")}
          disabled={!selectedRecipe}
          className={`w-full rounded-2xl py-4 text-base font-bold transition-colors ${
            selectedRecipe ? "bg-amber-400 text-zinc-900" : "bg-zinc-800 text-zinc-600"
          }`}
        >
          ⚡ 추출 시작
        </button>
      </div>

      {/* ─── 바텀시트 ──────────────────────────────────────────────────── */}

      {/* 최근 기록 */}
      <BottomSheet
        isOpen={sheet === "history"}
        onClose={() => setSheet(null)}
        title="최근 기록"
      >
        {recentLogs.map((log) => {
          const recipe = recipes.find((r) => r.id === log.recipeId);
          const bean = log.beanId ? beans.find((b) => b.id === log.beanId) : null;
          if (!recipe) return null;
          return (
            <button
              key={log.id}
              onClick={() => handleLoadHistory(log)}
              className="mb-3 w-full rounded-2xl bg-zinc-800 p-4 text-left active:bg-zinc-700"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{recipe.title}</p>
                  {bean && <p className="mt-0.5 text-xs text-zinc-400">{bean.name}</p>}
                  <div className="mt-1.5 flex flex-wrap gap-x-3">
                    {log.actualGrindSetting && (
                      <span className="text-xs text-zinc-500">분쇄도 {log.actualGrindSetting}</span>
                    )}
                    {log.actualWaterTemp && (
                      <span className="text-xs text-zinc-500">{log.actualWaterTemp}°C</span>
                    )}
                    <span className="text-xs text-zinc-500">{log.usedCoffeeWeight}g</span>
                  </div>
                </div>
                <p className="shrink-0 text-xs text-zinc-600">
                  {log.brewedAt ? toDateStr(log.brewedAt) : ""}
                </p>
              </div>
            </button>
          );
        })}
      </BottomSheet>

      {/* 원두 선택 */}
      <BottomSheet
        isOpen={sheet === "bean"}
        onClose={() => setSheet(null)}
        title="원두 선택"
        action={
          <button onClick={() => { navigate("/bean/new"); setSheet(null); }} className="text-sm text-amber-400">
            + 추가
          </button>
        }
      >
        <button
          onClick={() => { setSelectedBean(null); setSheet(null); }}
          className={`last:mb-0 mb-2 w-full rounded-2xl p-4 text-left transition-colors ${
            !selectedBean ? "bg-amber-400/10 ring-1 ring-amber-400" : "bg-zinc-800 active:bg-zinc-700"
          }`}
        >
          <p className={`text-sm font-semibold ${!selectedBean ? "text-amber-400" : "text-zinc-400"}`}>
            선택 안 함
          </p>
        </button>
        {beans.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">등록된 원두가 없어요</p>
        ) : (
          beans.map((bean) => {
            const pct =
              bean.totalWeight > 0
                ? Math.round((bean.remainingWeight / bean.totalWeight) * 100)
                : 0;
            const sel = selectedBean?.id === bean.id;
            return (
              <button
                key={bean.id}
                onClick={() => { setSelectedBean(bean); setSheet(null); }}
                className={`last:mb-0 mb-2 w-full rounded-2xl p-4 text-left transition-colors ${
                  sel ? "bg-amber-400/10 ring-1 ring-amber-400" : "bg-zinc-800 active:bg-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-semibold ${sel ? "text-amber-400" : "text-white"}`}>
                      {bean.name}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {bean.roastery} · {bean.origin}
                    </p>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <p className="text-sm font-medium text-white">{bean.remainingWeight}g</p>
                    {sel && <p className="text-xs text-amber-400">✓</p>}
                  </div>
                </div>
                <div className="mt-2 h-1 rounded-full bg-zinc-700">
                  <div className="h-1 rounded-full bg-amber-400/60" style={{ width: `${pct}%` }} />
                </div>
              </button>
            );
          })
        )}
      </BottomSheet>

      {/* 레시피 선택 */}
      <BottomSheet
        isOpen={sheet === "recipe"}
        onClose={() => setSheet(null)}
        title="레시피 선택"
        action={
          <button onClick={() => { navigate("/recipe/new"); setSheet(null); }} className="text-sm text-amber-400">
            + 추가
          </button>
        }
      >
        {recipes.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">저장된 레시피가 없어요</p>
        ) : (
          recipes.map((recipe) => {
            const totalW =
              recipe.steps.reduce((s, st) => s + st.waterAmount, 0) || recipe.waterWeight;
            const sel = selectedRecipe?.id === recipe.id;
            return (
              <button
                key={recipe.id}
                onClick={() => { selectRecipe(recipe); setSheet(null); }}
                className={`last:mb-0 mb-2 w-full rounded-2xl p-4 text-left transition-colors ${
                  sel ? "bg-amber-400/10 ring-1 ring-amber-400" : "bg-zinc-800 active:bg-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`flex-1 font-semibold ${sel ? "text-amber-400" : "text-white"}`}>
                    {recipe.title}
                  </p>
                  {sel && <span className="shrink-0 text-sm text-amber-400">✓</span>}
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {recipe.brewMethod} · {recipe.waterTemp}°C · {totalW}ml
                </p>
              </button>
            );
          })
        )}
      </BottomSheet>

      {/* 그라인더 선택 */}
      <BottomSheet
        isOpen={sheet === "grinder"}
        onClose={() => setSheet(null)}
        title="그라인더 선택"
        action={
          <button onClick={() => { navigate("/equipment/new"); setSheet(null); }} className="text-sm text-amber-400">
            + 추가
          </button>
        }
      >
        <button
          onClick={() => { selectGrinder(null); setSheet(null); }}
          className={`last:mb-0 mb-2 w-full rounded-2xl p-4 text-left transition-colors ${
            !selectedGrinder ? "bg-amber-400/10 ring-1 ring-amber-400" : "bg-zinc-800 active:bg-zinc-700"
          }`}
        >
          <p className={`text-sm font-semibold ${!selectedGrinder ? "text-amber-400" : "text-zinc-400"}`}>
            선택 안 함
          </p>
        </button>
        {grinders.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">등록된 그라인더가 없어요</p>
        ) : (
          sortedGrinders.map((g) => {
            const saved = selectedRecipe?.grindSettings?.[g.id];
            const sel = selectedGrinder?.id === g.id;
            return (
              <button
                key={g.id}
                onClick={() => { selectGrinder(g); setSheet(null); }}
                className={`last:mb-0 mb-2 w-full rounded-2xl p-4 text-left transition-colors ${
                  sel ? "bg-amber-400/10 ring-1 ring-amber-400" : "bg-zinc-800 active:bg-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`font-semibold ${sel ? "text-amber-400" : "text-white"}`}>{g.name}</p>
                  {sel && <span className="text-sm text-amber-400">✓</span>}
                </div>
                {g.specs.clickUnit && (
                  <p className="mt-0.5 text-xs text-zinc-500">클릭 단위: {g.specs.clickUnit}</p>
                )}
                {saved && (
                  <p className="mt-0.5 text-xs text-amber-400/70">저장된 분쇄도: {saved}</p>
                )}
              </button>
            );
          })
        )}
      </BottomSheet>
    </div>
  );
}
