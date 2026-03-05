import { Timestamp } from "firebase/firestore";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { Bean } from "../types";

export type BeanFormValues = {
  name: string;
  roastery: string;
  origin: string;
  variety: string;
  roastedAt: string;
  purchasedAt: string;
  price: string;
  totalWeight: string;
  remainingWeight: string;
};

export function beanFormToData(data: BeanFormValues): Omit<Bean, "id"> {
  return {
    name: data.name,
    roastery: data.roastery,
    origin: data.origin,
    variety: data.variety,
    roastedAt: Timestamp.fromDate(new Date(data.roastedAt)),
    purchasedAt: Timestamp.fromDate(new Date(data.purchasedAt)),
    price: Number(data.price),
    totalWeight: Number(data.totalWeight),
    remainingWeight: Number(data.remainingWeight),
  };
}

const inputClass = "rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="mb-1 text-sm font-medium text-gray-700">{label}</Text>
      {children}
    </View>
  );
}

type Props = {
  defaultValues?: Partial<BeanFormValues>;
  onSubmit: (data: BeanFormValues) => Promise<void>;
  onBack: () => void;
  title: string;
  submitLabel?: string;
};

export function BeanForm({ defaultValues, onSubmit, onBack, title, submitLabel = "저장" }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<BeanFormValues>({
    defaultValues: {
      name: "",
      roastery: "",
      origin: "",
      variety: "",
      roastedAt: today,
      purchasedAt: today,
      price: "",
      totalWeight: "200",
      remainingWeight: "200",
      ...defaultValues,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 56 }}>
        <View className="mb-6 flex-row items-center">
          <TouchableOpacity onPress={onBack}>
            <Text className="text-blue-500">← 뒤로</Text>
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-bold text-gray-900">{title}</Text>
        </View>

        <Field label="원두 이름">
          <Controller
            control={control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className={inputClass}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="예: 에티오피아 예가체프"
              />
            )}
          />
        </Field>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field label="로스터리">
              <Controller
                control={control}
                name="roastery"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={inputClass}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="로스터리명"
                  />
                )}
              />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="원산지">
              <Controller
                control={control}
                name="origin"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={inputClass}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="에티오피아..."
                  />
                )}
              />
            </Field>
          </View>
        </View>

        <Field label="품종">
          <Controller
            control={control}
            name="variety"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className={inputClass}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Heirloom, Bourbon..."
              />
            )}
          />
        </Field>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field label="로스팅 날짜">
              <Controller
                control={control}
                name="roastedAt"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={inputClass}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="YYYY-MM-DD"
                  />
                )}
              />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="구매 날짜">
              <Controller
                control={control}
                name="purchasedAt"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={inputClass}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="YYYY-MM-DD"
                  />
                )}
              />
            </Field>
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field label="구매 가격 (원)">
              <Controller
                control={control}
                name="price"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={inputClass}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    placeholder="25000"
                  />
                )}
              />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="구매 용량 (g)">
              <Controller
                control={control}
                name="totalWeight"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={inputClass}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                  />
                )}
              />
            </Field>
          </View>
        </View>

        <Field label="잔여 용량 (g)">
          <Controller
            control={control}
            name="remainingWeight"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className={inputClass}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="numeric"
              />
            )}
          />
        </Field>

        <TouchableOpacity
          className={`rounded-xl py-4 ${isSubmitting ? "bg-amber-300" : "bg-amber-500"}`}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text className="text-center font-semibold text-white">
            {isSubmitting ? "저장 중..." : submitLabel}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
