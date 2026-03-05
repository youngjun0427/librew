import { ActivityIndicator, View } from "react-native";

export function LoadingView() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}
