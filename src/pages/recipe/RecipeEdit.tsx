import { useNavigate, useParams } from "react-router-dom";
import { RecipeForm, type RecipeFormValues } from "../../components/RecipeForm";
import { useEquipment } from "../../hooks/useEquipment";
import { useRecipes } from "../../hooks/useRecipes";

export default function RecipeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recipes, updateRecipe } = useRecipes();
  const { equipment } = useEquipment();
  const dripperOptions = equipment.filter((e) => e.type === "dripper").map((e) => e.name);
  const grinderOptions = equipment.filter((e) => e.type === "grinder").map((e) => e.name);
  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) return null;

  const defaultValues: RecipeFormValues = {
    title: recipe.title,
    brewMethod: recipe.brewMethod,
    filterType: recipe.filterType,
    grinderName: recipe.grinderName ?? "",
    waterTemp: String(recipe.waterTemp),
    coffeeWeight: String(recipe.coffeeWeight),
    waterWeight: String(recipe.waterWeight),
    steps: recipe.steps.map((_, i) => ({
      waterAmount: String(recipe.steps.slice(0, i + 1).reduce((sum, st) => sum + st.waterAmount, 0)),
      duration: String(recipe.steps.slice(0, i + 1).reduce((sum, st) => sum + st.duration, 0)),
      pourMethod: recipe.steps[i].pourMethod ?? "",
      tip: recipe.steps[i].tip ?? "",
    })),
  };

  const handleSubmit = async (data: RecipeFormValues) => {
    await updateRecipe(id!, {
      title: data.title,
      brewMethod: data.brewMethod,
      filterType: data.filterType,
      grinderName: data.grinderName || null,
      waterTemp: Number(data.waterTemp),
      coffeeWeight: Number(data.coffeeWeight),
      waterWeight: Number(data.waterWeight),
      steps: data.steps.map((s, i) => ({
        order: i + 1,
        waterAmount: Number(s.waterAmount),
        duration: Number(s.duration) || 0,
        pourMethod: s.pourMethod,
        tip: s.tip || null,
      })),
    });
    navigate(-1);
  };

  return (
    <RecipeForm
      title="레시피 수정"
      defaultValues={defaultValues}
      dripperOptions={dripperOptions}
      grinderOptions={grinderOptions}
      onBack={() => navigate(-1)}
      onSubmit={handleSubmit}
      submitLabel="수정 완료"
    />
  );
}
