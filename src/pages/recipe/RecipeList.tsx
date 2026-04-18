import { useNavigate } from "react-router-dom";
import { ErrorView } from "../../components/ErrorView";
import { LoadingView } from "../../components/LoadingView";
import { useRecipes } from "../../hooks/useRecipes";
import type { Recipe } from "../../types";

function RecipeCard({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
  const ratio =
    recipe.coffeeWeight > 0 ? `1:${(recipe.waterWeight / recipe.coffeeWeight).toFixed(1)}` : "-";
  return (
    <button className="mb-3 w-full rounded-2xl bg-zinc-800 p-4 text-left" onClick={onPress}>
      <p className="text-base font-semibold text-white">{recipe.title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="text-sm text-zinc-400">{recipe.brewMethod}</span>
        <span className="text-sm text-zinc-600">·</span>
        <span className="text-sm text-zinc-400">
          {recipe.coffeeWeight}g / {recipe.waterWeight}ml
        </span>
        <span className="text-sm text-zinc-600">·</span>
        <span className="text-sm text-zinc-400">{ratio}</span>
      </div>
    </button>
  );
}

export default function RecipeListPage() {
  const { recipes, isLoading, error } = useRecipes();
  const navigate = useNavigate();

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="flex items-center justify-between px-5 pb-2 pt-14">
        <div>
          <h1 className="text-lg font-bold text-white">레시피</h1>
        </div>
        <button onClick={() => navigate("/recipe/new")} className="text-amber-400">
          + 추가
        </button>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-zinc-400">아직 레시피가 없어요</p>
          <button className="mt-4 text-amber-400" onClick={() => navigate("/recipe/new")}>
            + 첫 레시피 추가하기
          </button>
        </div>
      ) : (
        <div className="px-5 pb-8">
          {recipes.map((item) => (
            <RecipeCard
              key={item.id}
              recipe={item}
              onPress={() => navigate(`/recipe/${item.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
