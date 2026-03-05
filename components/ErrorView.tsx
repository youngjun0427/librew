import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorView({ message = "오류가 발생했어요", onRetry }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 px-6">
      <Text className="mb-2 text-gray-400">{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry}>
          <Text className="text-sm text-blue-500">다시 시도</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
