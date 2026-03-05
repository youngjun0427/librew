import { useRouter } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { ErrorView } from "../../components/ErrorView";
import { LoadingView } from "../../components/LoadingView";
import { useRecipes } from "../../hooks/useRecipes";
import type { Recipe } from "../../types";

function RecipeCard({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) {
  const ratio =
    recipe.coffeeWeight > 0 ? (recipe.waterWeight / recipe.coffeeWeight).toFixed(1) : "-";
  return (
    <TouchableOpacity className="mb-3 rounded-2xl bg-white p-4 shadow-sm" onPress={onPress}>
      <Text className="text-base font-semibold text-gray-900">{recipe.title}</Text>
      <View className="mt-2 flex-row gap-2">
        <Text className="text-sm text-gray-500">{recipe.brewMethod}</Text>
        <Text className="text-sm text-gray-300">·</Text>
        <Text className="text-sm text-gray-500">
          {recipe.coffeeWeight}g / {recipe.waterWeight}ml
        </Text>
        <Text className="text-sm text-gray-300">·</Text>
        <Text className="text-sm text-gray-500">1:{ratio}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function RecipesScreen() {
  const { recipes, isLoading, error } = useRecipes();
  const router = useRouter();

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pb-4 pt-16">
        <Text className="text-2xl font-bold text-gray-900">레시피</Text>
      </View>

      {recipes.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">아직 레시피가 없어요</Text>
          <Text className="mt-1 text-sm text-gray-400">+ 버튼으로 첫 레시피를 추가해보세요</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <RecipeCard recipe={item} onPress={() => router.push(`/recipe/${item.id}`)} />
          )}
        />
      )}

      <TouchableOpacity
        className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg"
        onPress={() => router.push("/recipe/new")}
      >
        <Text className="text-2xl font-light text-white">+</Text>
      </TouchableOpacity>
    </View>
  );
}
