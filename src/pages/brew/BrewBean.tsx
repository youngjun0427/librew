import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorView } from "../../components/ErrorView";
import { LoadingView } from "../../components/LoadingView";
import { useBeans } from "../../hooks/useBeans";
import { useBrewSessionStore } from "../../store/useBrewSessionStore";

export default function BrewBeanPage() {
  const navigate = useNavigate();
  const { beans, isLoading, error } = useBeans();
  const { selectedRecipe, selectedBean, setSelectedBean, usedCoffeeWeight, setUsedCoffeeWeight } =
    useBrewSessionStore();
  const [coffeeInput, setCoffeeInput] = useState(
    String(usedCoffeeWeight || selectedRecipe?.coffeeWeight || "")
  );

  useEffect(() => {
    if (!selectedBean) return;
    const target = selectedRecipe?.coffeeWeight ?? 0;
    const adjusted = Math.min(target, selectedBean.remainingWeight);
    const val = adjusted > 0 ? adjusted : target;
    setCoffeeInput(String(val));
    setUsedCoffeeWeight(val);
  }, [selectedBean, selectedRecipe?.coffeeWeight, setUsedCoffeeWeight]);

  useEffect(() => {
    const n = Number(coffeeInput);
    if (!isNaN(n)) setUsedCoffeeWeight(n);
  }, [coffeeInput, setUsedCoffeeWeight]);

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  return (
    <div className="flex h-screen flex-col bg-zinc-900">
      <div className="px-5 pb-4 pt-14">
        <button onClick={() => navigate(-1)} className="mb-4 text-amber-400">← 뒤로</button>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">STEP 3 OF 3</p>
        <h1 className="mt-1 text-2xl font-bold text-white">원두 선택</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-56">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-500">BEAN SELECTION</p>
        {beans.length === 0 ? (
          <p className="mt-4 text-center text-zinc-500">등록된 원두가 없어요 (건너뛸 수 있어요)</p>
        ) : (
          beans.map((item) => {
            const pct = item.totalWeight > 0
              ? Math.round((item.remainingWeight / item.totalWeight) * 100) : 0;
            const selected = selectedBean?.id === item.id;
            return (
              <button
                key={item.id}
                className={`mb-3 w-full rounded-2xl border p-4 text-left ${
                  selected ? "border-amber-400 bg-zinc-800" : "border-zinc-700 bg-zinc-800"
                }`}
                onClick={() => setSelectedBean(selected ? null : item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className={`text-base font-semibold ${selected ? "text-amber-400" : "text-white"}`}>
                      {item.name}
                    </p>
                    <p className="text-sm text-zinc-400">{item.roastery} · {item.origin}</p>
                  </div>
                  <span className="text-sm text-zinc-400">{item.remainingWeight}g 남음</span>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-zinc-700">
                  <div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="border-t border-zinc-800 px-5 pb-8 pt-4">
        <div className="mb-3">
          <p className="mb-1 text-xs text-zinc-400">실제 원두량 (g)</p>
          <input
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none focus:border-amber-400"
            value={coffeeInput}
            onChange={(e) => setCoffeeInput(e.target.value)}
            inputMode="numeric"
          />
        </div>
        <button
          className="w-full rounded-2xl bg-amber-400 py-4 text-lg font-bold text-zinc-900"
          onClick={() => navigate("/brew/countdown")}
        >
          추출 시작
        </button>
      </div>
    </div>
  );
}
