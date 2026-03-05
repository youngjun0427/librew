import type { Timestamp } from "firebase/firestore";
import { Text, View } from "react-native";
import { ErrorView } from "../../components/ErrorView";
import { LoadingView } from "../../components/LoadingView";
import { useBeans } from "../../hooks/useBeans";
import { useBrewLogs } from "../../hooks/useBrewLogs";

function isToday(ts: Timestamp) {
  const d = ts.toDate();
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isThisWeek(ts: Timestamp) {
  const d = ts.toDate();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return d >= weekStart;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-2xl bg-white p-5 shadow-sm">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="mt-1 text-3xl font-bold text-gray-900">{value}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { brewLogs, isLoading: logsLoading, error: logsError } = useBrewLogs();
  const { beans, isLoading: beansLoading, error: beansError } = useBeans();

  if (logsLoading || beansLoading) return <LoadingView />;
  if (logsError || beansError) return <ErrorView message={logsError ?? beansError ?? undefined} />;

  const todayCount = brewLogs.filter((log) => isToday(log.brewedAt)).length;

  const weeklyLogs = brewLogs.filter((log) => isThisWeek(log.brewedAt));
  const weeklyIntake = weeklyLogs.reduce((sum, log) => sum + log.usedCoffeeWeight, 0);

  const weeklySpend = weeklyLogs.reduce((sum, log) => {
    if (!log.beanId) return sum;
    const bean = beans.find((b) => b.id === log.beanId);
    if (!bean || bean.totalWeight === 0) return sum;
    return sum + (bean.price / bean.totalWeight) * log.usedCoffeeWeight;
  }, 0);

  return (
    <View className="flex-1 bg-gray-50 px-6 pt-16">
      <Text className="mb-8 text-2xl font-bold text-gray-900">대시보드</Text>
      <View className="gap-4">
        <StatCard label="오늘 추출" value={`${todayCount}잔`} />
        <StatCard label="이번주 섭취량" value={`${weeklyIntake}g`} />
        <StatCard label="이번주 지출" value={`₩${Math.round(weeklySpend).toLocaleString()}`} />
      </View>
    </View>
  );
}
