import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BottomSheet } from "../../components/BottomSheet";
import { buildEquipmentSpecs, EquipmentForm, type EquipmentFormValues } from "../../components/EquipmentForm";
import { useBeans } from "../../hooks/useBeans";
import { useBrewLogs } from "../../hooks/useBrewLogs";
import { useEquipment } from "../../hooks/useEquipment";
import { useRecipes } from "../../hooks/useRecipes";
import { useBrewSessionStore } from "../../store/useBrewSessionStore";
import type { Bean, Equipment, NextBrewTips, Recipe } from "../../types";

const EQUIPMENT_ICONS: Record<Equipment["type"], string> = {
  grinder: "⚙️", kettle: "🫖", dripper: "☕", scale: "⚖️", other: "🔧",
};

type Sheet = "recipe" | "bean" | "grinder" | "dripper" | "other" | null;

function PrepRow({
  icon, label, value, sub, onPress, onAction, actionLabel,
}: {
  icon: string;
  label: string;
  value: string | null;
  sub?: string;
  onPress: () => void;
  onAction?: () => void;
  actionLabel?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className="flex w-full items-center gap-3 py-4"
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 text-left">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{label}</p>
        <p className={`mt-0.5 text-base font-semibold ${value ? "text-white" : "text-zinc-600"}`}>
          {value ?? "선택 안 됨"}
        </p>
        {sub && <p className="text-xs text-zinc-500">{sub}</p>}
      </div>
      {onAction && (
        <span
          role="button"
          tabIndex={0}
          className="mr-1 cursor-pointer text-xs text-amber-400"
          onClick={(e) => { e.stopPropagation(); onAction(); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onAction(); } }}
        >
          {actionLabel}
        </span>
      )}
      <span className="text-zinc-600">›</span>
    </motion.button>
  );
}

export default function BrewPrepPage() {
  const navigate = useNavigate();
  const { recipes, isLoading: recipesLoading } = useRecipes();
  const { beans, isLoading: beansLoading } = useBeans();
  const { equipment, isLoading: equipmentLoading, addEquipment } = useEquipment();
  const { brewLogs } = useBrewLogs();
  const isLoading = recipesLoading || beansLoading || equipmentLoading;
  const {
    selectedRecipe, selectedBean, usedCoffeeWeight,
    selectedGrinder, selectedDripper, selectedOtherEquipment,
    actualGrindSize, actualWaterTemp, actualFilterType,
    setSelectedRecipe, setSelectedBean, setUsedCoffeeWeight,
    setSelectedGrinder, setSelectedDripper, setSelectedOtherEquipment,
    setActualGrindSize, setActualWaterTemp, setActualFilterType,
  } = useBrewSessionStore();

  const lastTips: NextBrewTips | null = selectedRecipe
    ? (brewLogs
        .filter((l) => l.recipeId === selectedRecipe.id && l.nextBrewTips)
        .sort((a, b) => (b.brewedAt?.seconds ?? 0) - (a.brewedAt?.seconds ?? 0))[0]
        ?.nextBrewTips ?? null)
    : null;

  const [sheet, setSheet] = useState<Sheet>(null);
  const [addingEquipment, setAddingEquipment] = useState<Equipment["type"] | null>(null);
  
  const [coffeeInput, setCoffeeInput] = useState(
    String(usedCoffeeWeight || selectedRecipe?.coffeeWeight || "")
  );
  const [grindInput, setGrindInput] = useState(
    actualGrindSize ? String(actualGrindSize) : ""
  );
  const [tempInput, setTempInput] = useState(
    actualWaterTemp ? String(actualWaterTemp) : ""
  );
  const [filterInput, setFilterInput] = useState(
    actualFilterType || ""
  );

  useEffect(() => {
    const target = selectedRecipe?.coffeeWeight ?? 0;
    const adjusted = selectedBean ? Math.min(target, selectedBean.remainingWeight) : target;
    const val = adjusted > 0 ? adjusted : target;
    setCoffeeInput(String(val || ""));
    setUsedCoffeeWeight(val);
  }, [selectedRecipe?.id, selectedBean?.id]);

  useEffect(() => {
    const n = Number(coffeeInput);
    if (!isNaN(n) && n > 0) setUsedCoffeeWeight(n);
  }, [coffeeInput]);

  useEffect(() => {
    if (grindInput) {
      const n = Number(grindInput);
      if (!isNaN(n)) setActualGrindSize(n);
    } else {
      setActualGrindSize(null);
    }
  }, [grindInput]);

  useEffect(() => {
    if (tempInput) {
      const n = Number(tempInput);
      if (!isNaN(n)) setActualWaterTemp(n);
    } else {
      setActualWaterTemp(null);
    }
  }, [tempInput]);

  useEffect(() => {
    setActualFilterType(filterInput || null);
  }, [filterInput]);

  const recipeWater = selectedRecipe
    ? (selectedRecipe.steps.reduce((s, step) => s + step.waterAmount, 0) || selectedRecipe.waterWeight)
    : 0;
    
  const rescaledWater = (selectedRecipe && selectedRecipe.coffeeWeight > 0 && usedCoffeeWeight > 0)
    ? Math.round((recipeWater / selectedRecipe.coffeeWeight) * usedCoffeeWeight)
    : recipeWater;

  const recipeTime = selectedRecipe
    ? selectedRecipe.steps.reduce((s, step) => s + (step.duration ?? 0) + (step.waitTime ?? 0), 0)
    : 0;
  const recipeTimeStr = recipeTime > 0
    ? `${Math.floor(recipeTime / 60)}분 ${recipeTime % 60}초`
    : null;

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col bg-zinc-900">
        <div className="flex items-center justify-between px-5 pb-2 pt-14">
          <div className="h-4 w-10 animate-pulse rounded bg-zinc-800" />
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-800" />
          <div className="w-10" />
        </div>
        <div className="px-5 pt-4">
          <div className="h-px bg-zinc-800" />
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="flex items-center gap-3 py-4">
                <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-zinc-800" />
                  <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
                </div>
              </div>
              <div className="h-px bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="flex h-screen flex-col bg-zinc-900"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pb-2 pt-14">
        <button onClick={() => navigate(-1)} className="text-zinc-400 text-sm">✕ 취소</button>
        <h1 className="text-base font-bold text-white">브루잉 준비</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {/* Divider */}
        <div className="h-px bg-zinc-800" />

        {/* Recipe */}
        <PrepRow
          icon="📖"
          label="레시피 *"
          value={selectedRecipe?.title ?? null}
          sub={selectedRecipe
            ? [
                selectedRecipe.brewMethod,
                selectedRecipe.waterTemp ? `${selectedRecipe.waterTemp}°C` : null,
                recipeWater ? `${recipeWater}ml` : null,
                recipeTimeStr,
              ].filter(Boolean).join(" · ")
            : undefined}
          onPress={() => setSheet("recipe")}
          onAction={() => navigate("/recipe/new")}
          actionLabel="+ 추가"
        />
        <div className="h-px bg-zinc-800" />

        {/* Bean */}
        <PrepRow
          icon="☕"
          label="원두 (선택)"
          value={selectedBean?.name ?? null}
          sub={selectedBean ? `${selectedBean.roastery} · ${selectedBean.remainingWeight}g 남음` : undefined}
          onPress={() => setSheet("bean")}
          onAction={() => navigate("/bean/new")}
          actionLabel="+ 추가"
        />
        <div className="h-px bg-zinc-800" />

        {/* Grinder */}
        <PrepRow
          icon="⚙️"
          label="그라인더 *"
          value={selectedGrinder?.name ?? null}
          sub={selectedGrinder?.specs.clickUnit ? `클릭 단위: ${selectedGrinder.specs.clickUnit}` : undefined}
          onPress={() => setSheet("grinder")}
        />
        <div className="h-px bg-zinc-800" />

        {/* Dripper */}
        <PrepRow
          icon="☕"
          label="드리퍼 *"
          value={selectedDripper?.name ?? null}
          sub={selectedDripper?.specs.servings ? `${selectedDripper.specs.servings}` : undefined}
          onPress={() => setSheet("dripper")}
        />
        <div className="h-px bg-zinc-800" />

        {/* Other equipment */}
        <PrepRow
          icon="🔧"
          label="기타장비 (선택)"
          value={selectedOtherEquipment?.name ?? null}
          onPress={() => setSheet("other")}
        />
        <div className="h-px bg-zinc-800" />

        {/* Session Overrides */}
        {selectedRecipe && (
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-widest text-amber-400">이번 추출 변수 (Override)</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-xs font-medium text-zinc-500">원두량 (g)</p>
                <input
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-400"
                  value={coffeeInput}
                  onChange={(e) => setCoffeeInput(e.target.value)}
                  inputMode="decimal"
                  placeholder={String(selectedRecipe.coffeeWeight)}
                />
                <p className="mt-1.5 text-xs font-medium text-amber-400/80">
                  자동 예상 물량: {rescaledWater}ml
                </p>
              </div>
              
              <div>
                <p className="mb-2 text-xs font-medium text-zinc-500">분쇄도</p>
                <input
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-400"
                  value={grindInput}
                  onChange={(e) => setGrindInput(e.target.value)}
                  inputMode="decimal"
                  placeholder={String(selectedRecipe.grindSize)}
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-zinc-500">물 온도 (°C)</p>
                <input
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-400"
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                  inputMode="decimal"
                  placeholder={String(selectedRecipe.waterTemp)}
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-zinc-500">필터 종류</p>
                <input
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-400"
                  value={filterInput}
                  onChange={(e) => setFilterInput(e.target.value)}
                  placeholder={selectedRecipe.filterType || "필터"}
                />
              </div>
            </div>
          </div>
        )}

        {/* Last brew tips */}
        {lastTips && <LastBrewTipsCard tips={lastTips} />}
      </div>

      {/* Start button */}
      <div className="px-5 pb-10 pt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          className={`w-full rounded-2xl py-4 text-lg font-bold transition-colors ${
            selectedRecipe && selectedGrinder && selectedDripper
              ? "bg-amber-400 text-zinc-900"
              : "bg-zinc-800 text-zinc-600"
          }`}
          onClick={() => selectedRecipe && selectedGrinder && selectedDripper && navigate("/brew/countdown")}
          disabled={!selectedRecipe || !selectedGrinder || !selectedDripper}
        >
          ⚡ 추출 시작
        </motion.button>
      </div>

      {/* Recipe sheet */}
      <BottomSheet 
        isOpen={sheet === "recipe"} 
        onClose={() => setSheet(null)} 
        title="레시피 선택"
        action={<button onClick={() => { setSheet(null); navigate("/recipe/new"); }} className="text-sm font-medium text-amber-400">+ 추가</button>}
      >
        {recipes.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-zinc-500">레시피가 없어요</p>
          </div>
        ) : (
          recipes.map((recipe) => (
            <RecipeSelectRow
              key={recipe.id}
              recipe={recipe}
              selected={selectedRecipe?.id === recipe.id}
              onSelect={() => { setSelectedRecipe(recipe); setSheet(null); }}
            />
          ))
        )}
      </BottomSheet>

      {/* Grinder sheet */}
      <BottomSheet 
        isOpen={sheet === "grinder"} 
        onClose={() => setSheet(null)} 
        title="그라인더 선택"
        action={<button onClick={() => { setSheet(null); setAddingEquipment("grinder"); }} className="text-sm font-medium text-amber-400">+ 추가</button>}
      >
        <EquipmentSelectList
          items={equipment.filter((e) => e.type === "grinder")}
          selected={selectedGrinder}
          onSelect={(e) => { setSelectedGrinder(e); setSheet(null); }}
          emptyLabel="등록된 그라인더가 없어요"
        />
      </BottomSheet>

      {/* Dripper sheet */}
      <BottomSheet 
        isOpen={sheet === "dripper"} 
        onClose={() => setSheet(null)} 
        title="드리퍼 선택"
        action={<button onClick={() => { setSheet(null); setAddingEquipment("dripper"); }} className="text-sm font-medium text-amber-400">+ 추가</button>}
      >
        <EquipmentSelectList
          items={equipment.filter((e) => e.type === "dripper")}
          selected={selectedDripper}
          onSelect={(e) => { setSelectedDripper(e); setSheet(null); }}
          emptyLabel="등록된 드리퍼가 없어요"
        />
      </BottomSheet>

      {/* Other equipment sheet */}
      <BottomSheet 
        isOpen={sheet === "other"} 
        onClose={() => setSheet(null)} 
        title="기타장비 선택"
        action={<button onClick={() => { setSheet(null); setAddingEquipment("other"); }} className="text-sm font-medium text-amber-400">+ 추가</button>}
      >
        <button
          className="mb-2 flex w-full items-center py-3 text-zinc-400"
          onClick={() => { setSelectedOtherEquipment(null); setSheet(null); }}
        >
          <span className="flex-1 text-left text-sm">선택 안 함</span>
          {!selectedOtherEquipment && <span className="text-amber-400 text-sm">✓</span>}
        </button>
        <div className="mb-2 h-px bg-zinc-800" />
        <EquipmentSelectList
          items={equipment.filter((e) => e.type !== "grinder" && e.type !== "dripper")}
          selected={selectedOtherEquipment}
          onSelect={(e) => { setSelectedOtherEquipment(e); setSheet(null); }}
          emptyLabel="등록된 기타 장비가 없어요"
        />
      </BottomSheet>

      {/* Inline equipment add overlay */}
      {addingEquipment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <EquipmentForm
            title="장비 추가"
            defaultValues={{ type: addingEquipment }}
            lockedType={addingEquipment}
            showBrandPicker
            onBack={() => setAddingEquipment(null)}
            onSubmit={async (data: EquipmentFormValues) => {
              const newEquip = await addEquipment({
                name: [data.brand, data.model].filter(Boolean).join(" ") || "장비",
                brand: data.brand,
                model: data.model,
                type: data.type,
                specs: buildEquipmentSpecs(data),
                notes: data.notes || null,
              });
              if (newEquip) {
                if (newEquip.type === "grinder") setSelectedGrinder(newEquip);
                else if (newEquip.type === "dripper") setSelectedDripper(newEquip);
                else setSelectedOtherEquipment(newEquip);
              }
              setAddingEquipment(null);
            }}
          />
        </div>
      )}

      {/* Bean sheet */}
      <BottomSheet isOpen={sheet === "bean"} onClose={() => setSheet(null)} title="원두 선택">
        <button
          className="mb-2 flex w-full items-center py-3 text-zinc-400"
          onClick={() => { setSelectedBean(null); setSheet(null); }}
        >
          <span className="flex-1 text-left text-sm">선택 안 함</span>
          {!selectedBean && <span className="text-amber-400 text-sm">✓</span>}
        </button>
        <div className="mb-2 h-px bg-zinc-800" />
        {beans.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-zinc-500">등록된 원두가 없어요</p>
            <button
              onClick={() => { setSheet(null); navigate("/bean/new"); }}
              className="mt-3 text-amber-400"
            >
              원두 추가하기 →
            </button>
          </div>
        ) : (
          beans.map((bean) => (
            <BeanSelectRow
              key={bean.id}
              bean={bean}
              selected={selectedBean?.id === bean.id}
              onSelect={() => { setSelectedBean(bean); setSheet(null); }}
            />
          ))
        )}
      </BottomSheet>
    </motion.div>
  );
}

const TIP_LABELS: Record<keyof NextBrewTips, string> = {
  grind: "분쇄도", temp: "물 온도", bloom: "뜸 들이기", water: "물량", other: "기타",
};

function LastBrewTipsCard({ tips }: { tips: NextBrewTips }) {
  const entries = (Object.entries(tips) as [keyof NextBrewTips, string | undefined][]).filter(
    ([, v]) => v && v.trim()
  );
  if (entries.length === 0) return null;
  return (
    <div className="mb-4 mt-2 rounded-2xl bg-amber-400/10 p-4 ring-1 ring-amber-400/30">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
        지난 브루 팁
      </p>
      <div className="flex flex-col gap-1.5">
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-start gap-2">
            <span className="mt-px text-xs font-medium text-amber-400/70">{TIP_LABELS[key]}</span>
            <span className="flex-1 text-sm text-amber-100">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EquipmentSelectList({
  items, selected, onSelect, emptyLabel,
}: {
  items: Equipment[];
  selected: Equipment | null;
  onSelect: (e: Equipment) => void;
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-zinc-500">{emptyLabel}</p>
      </div>
    );
  }
  return (
    <>
      {items.map((item) => (
        <motion.button
          key={item.id}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(item)}
          className={`mb-2 flex w-full items-center rounded-2xl p-4 text-left ${
            selected?.id === item.id ? "bg-amber-400/10 ring-1 ring-amber-400" : "bg-zinc-800"
          }`}
        >
          <span className="mr-3 text-xl">{EQUIPMENT_ICONS[item.type]}</span>
          <div className="flex-1">
            <p className={`font-semibold ${selected?.id === item.id ? "text-amber-400" : "text-white"}`}>
              {item.name}
            </p>
            {item.specs.clickUnit && (
              <p className="mt-0.5 text-xs text-zinc-400">클릭 단위: {item.specs.clickUnit}</p>
            )}
          </div>
          {selected?.id === item.id && <span className="text-amber-400">✓</span>}
        </motion.button>
      ))}
    </>
  );
}

function RecipeSelectRow({ recipe, selected, onSelect }: { recipe: Recipe; selected: boolean; onSelect: () => void }) {
  const totalWater = recipe.steps.reduce((s, step) => s + step.waterAmount, 0) || recipe.waterWeight;
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`mb-2 flex w-full items-center rounded-2xl p-4 text-left ${
        selected ? "bg-amber-400/10 ring-1 ring-amber-400" : "bg-zinc-800"
      }`}
    >
      <div className="flex-1">
        <p className={`font-semibold ${selected ? "text-amber-400" : "text-white"}`}>{recipe.title}</p>
        <p className="mt-0.5 text-xs text-zinc-400">
          {recipe.brewMethod} · {recipe.waterTemp}°C · {totalWater}ml
        </p>
      </div>
      {selected && <span className="text-amber-400">✓</span>}
    </motion.button>
  );
}

function BeanSelectRow({ bean, selected, onSelect }: { bean: Bean; selected: boolean; onSelect: () => void }) {
  const pct = bean.totalWeight > 0 ? Math.round((bean.remainingWeight / bean.totalWeight) * 100) : 0;
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`mb-2 w-full rounded-2xl p-4 text-left ${
        selected ? "bg-amber-400/10 ring-1 ring-amber-400" : "bg-zinc-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`font-semibold ${selected ? "text-amber-400" : "text-white"}`}>{bean.name}</p>
          <p className="mt-0.5 text-xs text-zinc-400">{bean.roastery} · {bean.origin}</p>
        </div>
        <div className="ml-3 text-right">
          <p className="text-sm font-medium text-white">{bean.remainingWeight}g</p>
          {selected && <span className="text-xs text-amber-400">✓</span>}
        </div>
      </div>
      <div className="mt-2 h-1 rounded-full bg-zinc-700">
        <div className="h-1 rounded-full bg-amber-400/60" style={{ width: `${pct}%` }} />
      </div>
    </motion.button>
  );
}
