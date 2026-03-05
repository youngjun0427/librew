import { useRouter } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { ErrorView } from "../../components/ErrorView";
import { LoadingView } from "../../components/LoadingView";
import { useBeans } from "../../hooks/useBeans";
import type { Bean } from "../../types";

function BeanCard({ bean, onPress }: { bean: Bean; onPress: () => void }) {
  const pct =
    bean.totalWeight > 0 ? Math.round((bean.remainingWeight / bean.totalWeight) * 100) : 0;
  return (
    <TouchableOpacity className="mb-3 rounded-2xl bg-white p-4 shadow-sm" onPress={onPress}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{bean.name}</Text>
          <Text className="mt-0.5 text-sm text-gray-500">
            {bean.roastery} · {bean.origin}
          </Text>
        </View>
        <Text className="text-sm font-medium text-gray-700">{bean.remainingWeight}g 남음</Text>
      </View>
      <View className="mt-3 h-1.5 rounded-full bg-gray-100">
        <View className="h-1.5 rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
      </View>
    </TouchableOpacity>
  );
}

export default function BeansScreen() {
  const { beans, isLoading, error } = useBeans();
  const router = useRouter();

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pb-4 pt-16">
        <Text className="text-2xl font-bold text-gray-900">원두 관리</Text>
      </View>

      {beans.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-400">등록된 원두가 없어요</Text>
          <Text className="mt-1 text-sm text-gray-400">+ 버튼으로 원두를 추가해보세요</Text>
        </View>
      ) : (
        <FlatList
          data={beans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <BeanCard bean={item} onPress={() => router.push(`/bean/${item.id}`)} />
          )}
        />
      )}

      <TouchableOpacity
        className="absolute bottom-8 right-6 h-14 w-14 items-center justify-center rounded-full bg-amber-500 shadow-lg"
        onPress={() => router.push("/bean/new")}
      >
        <Text className="text-2xl font-light text-white">+</Text>
      </TouchableOpacity>
    </View>
  );
}
