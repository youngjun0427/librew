import { Text, TouchableOpacity, View } from "react-native";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";

export default function LoginScreen() {
  const { signIn } = useGoogleSignIn();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="mb-2 text-3xl font-bold text-gray-900">Coffee Brew Log</Text>
      <Text className="mb-12 text-base text-gray-500">핸드드립 레시피 관리 앱</Text>

      <TouchableOpacity className="rounded-xl bg-blue-500 px-8 py-4" onPress={signIn}>
        <Text className="font-semibold text-white">Google로 시작하기</Text>
      </TouchableOpacity>
    </View>
  );
}
