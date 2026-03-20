import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Toggle } from "./Toggle";
import type { Equipment, EquipmentSpecs } from "../types";

export type EquipmentFormValues = {
  brand: string;
  model: string;
  type: Equipment["type"];
  clickUnit: string;
  capacity: string;
  temperature: string;
  filterType: string;
  servings: string;
  precision: string;
  hasTimer: boolean;
  notes: string;
};

export function buildEquipmentSpecs(data: EquipmentFormValues): EquipmentSpecs {
  const specs: EquipmentSpecs = {};
  if (data.type === "grinder") {
    if (data.clickUnit) specs.clickUnit = data.clickUnit;
  } else if (data.type === "kettle") {
    if (data.capacity) specs.capacity = Number(data.capacity);
    if (data.temperature) specs.temperature = Number(data.temperature);
  } else if (data.type === "dripper") {
    if (data.servings) specs.servings = data.servings;
  return specs;
}

const GRINDER_BRANDS: { brand: string; models: string[] }[] = [
  { brand: "Comandante", models: ["C40 MK3", "C40 MK4", "C60 Baracuda"] },
  { brand: "1Zpresso", models: ["ZP6 Special", "K-Ultra", "K-Max", "K-Plus", "J-Max", "JX-Pro", "Q2"] },
  { brand: "Fellow", models: ["Ode Gen 1", "Ode Gen 2", "Opus"] },
  { brand: "Kinu", models: ["M47 Classic", "M47 Phoenix", "M47 Simplicity"] },
  { brand: "Timemore", models: ["Chestnut C2", "Chestnut C3", "Slim", "Nano", "Sculptor 078", "Sculptor 064"] },
  { brand: "Baratza", models: ["Encore", "Virtuoso+", "Vario-W+", "Forte BG"] },
  { brand: "Wilfa", models: ["Svart Aroma", "Uniform"] },
  { brand: "Mahlkönig", models: ["EK43", "EK43 S", "X54"] },
  { brand: "Eureka", models: ["Mignon Filtro", "Mignon Brew Pro"] },
  { brand: "Weber Workshops", models: ["EG-1", "HG-2", "Key Grinder"] },
  { brand: "Option-O", models: ["Lagom P64", "Lagom Mini", "Lagom 01"] },
  { brand: "Hario", models: ["Skerton Pro", "V60 Electric Grinder"] },
  { brand: "Knock", models: ["Feldgrind", "Aergrind"] },
  { brand: "Mazzer", models: ["Omega", "Philos"] },
];

const TYPES: { value: Equipment["type"]; label: string }[] = [
  { value: "grinder", label: "그라인더" },
  { value: "kettle", label: "케틀" },
  { value: "dripper", label: "드리퍼" },
  { value: "other", label: "기타" },
];

const inputClass =
  "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-amber-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-1 text-sm font-medium text-zinc-400">{label}</p>
      {children}
    </div>
  );
}

type Props = {
  defaultValues?: Partial<EquipmentFormValues>;
  onSubmit: (data: EquipmentFormValues) => Promise<void>;
  onBack: () => void;
  title: string;
  submitLabel?: string;
  showBrandPicker?: boolean;
  lockedType?: Equipment["type"];
};

export function EquipmentForm({ defaultValues, onSubmit, onBack, title, submitLabel = "저장", showBrandPicker = false, lockedType }: Props) {
  const { control, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<EquipmentFormValues>({
    defaultValues: {
      brand: "", model: "", type: "grinder",
      clickUnit: "", capacity: "", temperature: "", filterType: "",
      servings: "", precision: "", hasTimer: false, notes: "",
      ...defaultValues,
    },
  });

  const type = watch("type");
  const model = watch("model");

  // 그라인더 브랜드 피커 상태
  const [pickerBrand, setPickerBrand] = useState<string | null>(defaultValues?.brand ?? null);
  const isCustomBrand = pickerBrand === "기타";
  const selectedBrandData = GRINDER_BRANDS.find((b) => b.brand === pickerBrand);

  const handleBrandSelect = (b: string) => {
    setPickerBrand(b);
    if (b !== "기타") {
      setValue("brand", b);
      setValue("model", "");
    } else {
      setValue("brand", "");
      setValue("model", "");
    }
  };

  const handleModelSelect = (m: string) => {
    setValue("model", m);
  };

  const showPicker = showBrandPicker && type === "grinder";

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="overflow-y-auto p-6 pt-14">
        <div className="mb-6 flex items-center">
          <button onClick={onBack} className="text-amber-400">← 뒤로</button>
          <h1 className="ml-4 text-xl font-bold text-white">{title}</h1>
        </div>

        {!lockedType && (
          <Field label="종류">
            <Controller
              control={control}
              name="type"
              render={({ field: { value, onChange } }) => (
                <div className="flex flex-wrap gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        onChange(t.value);
                        setPickerBrand(null);
                        setValue("brand", "");
                        setValue("model", "");
                      }}
                      className={`rounded-xl px-4 py-2 text-sm font-medium ${
                        value === t.value ? "bg-amber-400 text-zinc-900" : "bg-zinc-700 text-zinc-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </Field>
        )}

        {/* 그라인더 브랜드 피커 */}
        {showPicker ? (
          <>
            <Field label="브랜드">
              <div className="grid grid-cols-3 gap-2">
                {GRINDER_BRANDS.map((b) => (
                  <button
                    key={b.brand}
                    type="button"
                    onClick={() => handleBrandSelect(b.brand)}
                    className={`rounded-xl py-3 text-sm font-medium ${
                      pickerBrand === b.brand
                        ? "bg-amber-400 text-zinc-900"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    {b.brand}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleBrandSelect("기타")}
                  className={`rounded-xl py-3 text-sm font-medium ${
                    isCustomBrand ? "bg-amber-400 text-zinc-900" : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  기타
                </button>
              </div>
            </Field>

            {/* 모델 선택 */}
            {selectedBrandData && !isCustomBrand && (
              <Field label="모델">
                <div className="flex flex-wrap gap-2">
                  {selectedBrandData.models.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleModelSelect(m)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium ${
                        model === m ? "bg-amber-400 text-zinc-900" : "bg-zinc-700 text-zinc-300"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </Field>
            )}

            {/* 기타 직접 입력 */}
            {isCustomBrand && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <Field label="브랜드 직접 입력">
                    <Controller control={control} name="brand" render={({ field }) => (
                      <input {...field} className={inputClass} placeholder="브랜드명" />
                    )} />
                  </Field>
                </div>
                <div className="flex-1">
                  <Field label="모델명 직접 입력">
                    <Controller control={control} name="model" render={({ field }) => (
                      <input {...field} className={inputClass} placeholder="모델명" />
                    )} />
                  </Field>
                </div>
              </div>
            )}
          </>
        ) : (
          /* 그라인더 외 or 편집 모드 */
          <div className="flex gap-3">
            <div className="flex-1">
              <Field label="브랜드">
                <Controller control={control} name="brand" render={({ field }) => (
                  <input {...field} className={inputClass} placeholder="예: Comandante" />
                )} />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="모델명">
                <Controller control={control} name="model" render={({ field }) => (
                  <input {...field} className={inputClass} placeholder="예: C40 MK4" />
                )} />
              </Field>
            </div>
          </div>
        )}

        {type === "grinder" && (
          <Field label="분쇄도 설정">
            <Controller control={control} name="clickUnit" render={({ field }) => (
              <input {...field} className={inputClass} placeholder="예: #18 클릭 · Medium Fine" />
            )} />
          </Field>
        )}

        {type === "kettle" && (
          <div className="flex gap-3">
            <div className="flex-1">
              <Field label="온도 (°C)">
                <Controller control={control} name="temperature" render={({ field }) => (
                  <input {...field} className={inputClass} inputMode="numeric" placeholder="93" />
                )} />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="용량 (L)">
                <Controller control={control} name="capacity" render={({ field }) => (
                  <input {...field} className={inputClass} inputMode="numeric" placeholder="0.9" />
                )} />
              </Field>
            </div>
          </div>
        )}

        {type === "dripper" && (
          <Field label="인원">
            <Controller control={control} name="servings" render={({ field }) => (
              <input {...field} className={inputClass} placeholder="1~4인용" />
            )} />
          </Field>
        )}


        <Field label="메모 (선택)">
          <Controller
            control={control}
            name="notes"
            render={({ field }) => (
              <textarea {...field} className={inputClass} rows={2} placeholder="추가 메모" />
            )}
          />
        </Field>

        <button
          className={`w-full rounded-2xl py-4 font-bold text-zinc-900 ${isSubmitting ? "bg-amber-300" : "bg-amber-400"}`}
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
