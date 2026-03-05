import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export type RecipeFormValues = {
  title: string;
  brewMethod: string;
  filterType: string;
  grindSize: string;
  waterTemp: string;
  coffeeWeight: string;
  waterWeight: string;
  steps: { waterAmount: string; tip: string }[];
};

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
  defaultValues?: Partial<RecipeFormValues>;
  onSubmit: (data: RecipeFormValues) => Promise<void>;
  onBack: () => void;
  title: string;
  submitLabel?: string;
};

export function RecipeForm({ defaultValues, onSubmit, onBack, title, submitLabel = "저장" }: Props) {
  const { control, handleSubmit, formState: { isSubmitting } } = useForm<RecipeFormValues>({
    defaultValues: {
      title: "",
      brewMethod: "V60",
      filterType: "종이",
      grindSize: "5",
      waterTemp: "93",
      coffeeWeight: "15",
      waterWeight: "225",
      steps: [{ waterAmount: "50", tip: "뜸들이기 30초" }],
      ...defaultValues,
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "steps" });

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

        <Field label="레시피 이름">
          <Controller
            control={control}
            name="title"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                className={inputClass}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="예: 아침 V60"
              />
            )}
          />
        </Field>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field label="추출 방식">
              <Controller
                control={control}
                name="brewMethod"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={inputClass}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="V60, Chemex..."
                  />
                )}
              />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="필터 종류">
              <Controller
                control={control}
                name="filterType"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    className={inputClass}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="종이, 금속..."
                  />
                )}
              />
            </Field>
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field label="분쇄도">
              <Controller
                control={control}
                name="grindSize"
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
          <View className="flex-1">
            <Field label="물 온도 (°C)">
              <Controller
                control={control}
                name="waterTemp"
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

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Field label="원두 (g)">
              <Controller
                control={control}
                name="coffeeWeight"
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
          <View className="flex-1">
            <Field label="물 (ml)">
              <Controller
                control={control}
                name="waterWeight"
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

        <Text className="mb-3 mt-2 text-base font-semibold text-gray-900">추출 단계</Text>
        {fields.map((field, index) => (
          <View key={field.id} className="mb-3 rounded-xl bg-white p-4 shadow-sm">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-sm font-medium text-gray-600">Step {index + 1}</Text>
              {fields.length > 1 && (
                <TouchableOpacity onPress={() => remove(index)}>
                  <Text className="text-sm text-red-400">삭제</Text>
                </TouchableOpacity>
              )}
            </View>
            <View className="flex-row gap-3">
              <View style={{ width: 88 }}>
                <Text className="mb-1 text-xs text-gray-500">물량 (ml)</Text>
                <Controller
                  control={control}
                  name={`steps.${index}.waterAmount`}
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
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-xs text-gray-500">팁</Text>
                <Controller
                  control={control}
                  name={`steps.${index}.tip`}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      className={inputClass}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="예: 천천히 원형으로"
                    />
                  )}
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          className="mb-6 rounded-xl border border-dashed border-blue-300 py-3"
          onPress={() => append({ waterAmount: "", tip: "" })}
        >
          <Text className="text-center text-blue-500">+ 단계 추가</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`rounded-xl py-4 ${isSubmitting ? "bg-blue-300" : "bg-blue-500"}`}
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
