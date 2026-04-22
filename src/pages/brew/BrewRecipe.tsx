import { useNavigate } from "react-router-dom";
import { ErrorView } from "../../components/ErrorView";
import { LoadingView } from "../../components/LoadingView";
import { useRecipes } from "../../hooks/useRecipes";
import { useBrewSessionStore } from "../../store/useBrewSessionStore";
import type { Recipe } from "../../types";

function RecipeSelectCard({
  recipe, selected, onPress,
}: { recipe: Recipe; selected: boolean; onPress: () => void }) {
  const totalWater = recipe.steps.reduce((s, step) => s + step.waterAmount, 0);
  const totalTime = recipe.steps.reduce(
    (s, step) => s + (step.duration ?? 0), 0
  );
  const timeStr = totalTime > 0 ? `${Math.floor(totalTime / 60)}m ${totalTime % 60}s` : null;

  return (
    <button
      className={`mb-3 w-full rounded-2xl border p-4 text-left active:bg-zinc-700 ${
        selected ? "border-amber-400 bg-zinc-800" : "border-zinc-700 bg-zinc-800"
      }`}
      onClick={onPress}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-base font-semibold ${selected ? "text-amber-400" : "text-white"}`}>
            {recipe.title}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <div className="rounded-lg bg-zinc-700 px-2 py-1">
              <span className="text-xs text-zinc-300">▽ {recipe.brewMethod}</span>
            </div>
            <div className="rounded-lg bg-zinc-700 px-2 py-1">
              <span className="text-xs text-zinc-300">◈ {recipe.waterTemp}°C</span>
            </div>
          </div>
        </div>
        <div className="ml-3 text-right">
          <p className="text-xs uppercase text-zinc-500">WATER</p>
          <p className={`text-2xl font-bold ${selected ? "text-amber-400" : "text-white"}`}>
            {totalWater > 0 ? totalWater : recipe.waterWeight}
            <span className="text-base text-zinc-400">ml</span>
          </p>
          {timeStr ? <p className="text-xs text-zinc-400">{timeStr}</p> : null}
        </div>
      </div>
    </button>
  );
}

export default function BrewRecipePage() {
  const navigate = useNavigate();
  const { recipes, isLoading, error } = useRecipes();
  const { selectedRecipe, setSelectedRecipe } = useBrewSessionStore();

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  return (
    <div className="flex h-screen flex-col bg-zinc-900">
      <div className="px-5 pb-4 pt-14">
        <button onClick={() => navigate(-1)} className="mb-4 text-amber-400">← 뒤로</button>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">STEP 2 OF 3</p>
        <h1 className="mt-1 text-2xl font-bold text-white">레시피 선택</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32">
        {recipes.length === 0 ? (
          <div className="mt-12 flex flex-col items-center">
            <p className="text-zinc-400">레시피가 없어요</p>
            <button className="mt-4 text-amber-400" onClick={() => navigate("/recipe/new")}>
              레시피 만들러 가기 →
            </button>
          </div>
        ) : (
          recipes.map((item) => (
            <RecipeSelectCard
              key={item.id}
              recipe={item}
              selected={selectedRecipe?.id === item.id}
              onPress={() => setSelectedRecipe(item)}
            />
          ))
        )}
      </div>

      <div className="border-t border-zinc-800 px-5 pb-8 pt-4">
        <button
          className={`w-full rounded-2xl py-4 text-lg font-bold ${
            selectedRecipe ? "bg-amber-400 text-zinc-900" : "bg-zinc-700 text-zinc-500"
          }`}
          onClick={() => navigate("/brew/bean")}
          disabled={!selectedRecipe}
        >
          다음: 원두 선택
        </button>
      </div>
    </div>
  );
}
