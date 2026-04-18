import { useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { BottomSheet } from "./BottomSheet";
import { UnitInput } from "./UnitInput";

export type RecipeFormValues = {
  title: string;
  brewMethod: string;
  filterType: string;
  grinderName: string;
  waterTemp: string;
  coffeeWeight: string;
  waterWeight: string;
  steps: {
    waterAmount: string;
    duration: string;
    pourMethod: string;
    tip: string;
  }[];
};


function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-1 text-sm font-medium text-zinc-400">{label}</p>
      {children}
    </div>
  );
}

type Props = {
  defaultValues?: Partial<RecipeFormValues>;
  onSubmit: (data: RecipeFormValues) => Promise<void>;
  onBack: () => void;
  title: string;
  submitLabel?: string;
  dripperOptions?: string[];
  grinderOptions?: string[];
};

export function RecipeForm({
  defaultValues,
  onSubmit,
  onBack,
  title,
  submitLabel = "저장",
  dripperOptions = [],
  grinderOptions = [],
}: Props) {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<RecipeFormValues>({
    defaultValues: {
      title: "",
      brewMethod: "",
      filterType: "종이",
      grinderName: "",
      waterTemp: "93",
      coffeeWeight: "15",
      waterWeight: "225",
      steps: [{ waterAmount: "50", duration: "0", pourMethod: "원을 그리며", tip: "뜸들이기" }],
      ...defaultValues,
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "steps" });
  const brewMethodValue = useWatch({ control, name: "brewMethod" });
  const grinderNameValue = useWatch({ control, name: "grinderName" });
  const stepsWatch = useWatch({ control, name: "steps" });

  const [sheet, setSheet] = useState<"dripper" | "grinder" | null>(null);

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="overflow-y-auto p-6 pt-14">
        <div className="mb-6 flex items-center">
          <button onClick={onBack} className="text-amber-400">
            ← 뒤로
          </button>
          <h1 className="ml-4 text-xl font-bold text-white">{title}</h1>
        </div>

        <Field label="레시피 이름">
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <UnitInput {...field} type="text" placeholder="미입력 시 드리퍼, 원두량으로 자동 생성" />
            )}
          />
        </Field>

        <Field label="추출 도구 (드리퍼)">
          <div 
            onClick={() => setSheet("dripper")}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white transition-colors active:bg-zinc-700"
          >
            <span className={brewMethodValue ? "text-white" : "text-zinc-500"}>
              {brewMethodValue || "내 장비에서 선택"}
            </span>
            <span className="text-amber-400 text-sm">선택</span>
          </div>
        </Field>

        <Field label="필터">
          <Controller
            control={control}
            name="filterType"
            render={({ field }) => (
              <UnitInput {...field} type="text" placeholder="예: 종이, 금속" />
            )}
          />
        </Field>

        <Field label="그라인더">
          <div 
            onClick={() => setSheet("grinder")}
            className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white transition-colors active:bg-zinc-700"
          >
            <span className={grinderNameValue ? "text-white" : "text-zinc-500"}>
              {grinderNameValue || "내 장비에서 선택"}
            </span>
            <span className="text-amber-400 text-sm">선택</span>
          </div>
        </Field>

        <Field label="물 온도">
          <Controller
            control={control}
            name="waterTemp"
            render={({ field }) => (
              <UnitInput {...field} type="numeric" unit="°C" />
            )}
          />
        </Field>

        <div className="flex gap-3">
          <div className="flex-1">
            <Field label="원두">
              <Controller
                control={control}
                name="coffeeWeight"
                render={({ field }) => (
                  <UnitInput {...field} type="numeric" unit="g" />
                )}
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="물">
              <Controller
                control={control}
                name="waterWeight"
                render={({ field }) => (
                  <UnitInput {...field} type="numeric" unit="ml" />
                )}
              />
            </Field>
          </div>
        </div>

        <p className="mb-3 mt-2 text-base font-semibold text-white">추출 단계</p>
        {fields.map((field, index) => {
          const isBloom = index === 0;
          const prevWater = index > 0 ? Number(stepsWatch[index - 1]?.waterAmount) || 0 : 0;
          const prevDur = index > 0 ? Number(stepsWatch[index - 1]?.duration) || 0 : 0;
          const curWater = Number(stepsWatch[index]?.waterAmount) || 0;
          const addWaterHint = curWater > prevWater ? `+${curWater - prevWater}ml 추가` : null;
          return (
            <div key={field.id} className="mb-3 rounded-2xl bg-zinc-800 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-300">
                  {isBloom ? "Step 1 · 뜸들이기" : `Step ${index + 1}`}
                </span>
                {fields.length > 1 && (
                  <button onClick={() => remove(index)} className="text-sm text-red-400">
                    삭제
                  </button>
                )}
              </div>

              <div className={`mb-3 ${isBloom ? "" : "flex gap-2"}`}>
                <div className={isBloom ? "mb-3" : "flex-1"}>
                  <p className="mb-1 text-xs text-zinc-500">
                    {isBloom ? "물양" : "누적 물양"}
                    {!isBloom && addWaterHint && (
                      <span className="ml-1.5 text-amber-400/70">{addWaterHint}</span>
                    )}
                  </p>
                  <Controller
                    control={control}
                    name={`steps.${index}.waterAmount`}
                    render={({ field: f }) => (
                      <UnitInput {...f} type="numeric" unit="ml" />
                    )}
                  />
                </div>
                {!isBloom && (
                  <div className="flex-1">
                    <p className="mb-1 text-xs text-zinc-500">
                      누적 시간
                      {prevDur > 0 && (
                        <span className="ml-1.5 text-zinc-600">이전 {prevDur}초</span>
                      )}
                    </p>
                    <Controller
                      control={control}
                      name={`steps.${index}.duration`}
                      render={({ field: f }) => (
                        <UnitInput {...f} type="numeric" unit="초" placeholder={String(prevDur + 1)} />
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="mb-3">
                <p className="mb-1 text-xs text-zinc-500">푸어링 방식</p>
                <Controller
                  control={control}
                  name={`steps.${index}.pourMethod`}
                  render={({ field: f }) => (
                    <UnitInput {...f} type="text" placeholder="예: 원을 그리며 중앙부터" />
                  )}
                />
              </div>

              <div>
                <p className="mb-1 text-xs text-zinc-500">팁 (선택)</p>
                <Controller
                  control={control}
                  name={`steps.${index}.tip`}
                  render={({ field: f }) => (
                    <UnitInput {...f} type="text" placeholder="예: 드리퍼가 충분히 젖도록" />
                  )}
                />
              </div>
            </div>
          );
        })}
        <button
          className="mb-6 w-full rounded-2xl border border-dashed border-amber-400/40 py-3 text-amber-400"
          onClick={() =>
            append({ waterAmount: "", duration: "", pourMethod: "", tip: "" })
          }
          type="button"
        >
          + 단계 추가
        </button>

        <button
          className={`w-full rounded-2xl py-4 font-bold text-zinc-900 ${isSubmitting ? "bg-amber-300" : "bg-amber-400"}`}
          onClick={handleSubmit(async (data) => {
            const normalized = {
              ...data,
              steps: data.steps.map((s, i) => ({
                ...s,
                waterAmount: String(Math.max(0, Number(s.waterAmount) - (i > 0 ? Number(data.steps[i - 1].waterAmount) : 0))),
                duration: i === 0 ? "0" : String(Math.max(0, Number(s.duration) - Number(data.steps[i - 1].duration))),
              })),
            };
            await onSubmit(normalized);
          })}
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : submitLabel}
        </button>
      </div>

      <BottomSheet isOpen={sheet === "dripper"} onClose={() => setSheet(null)} title="추출 도구 선택">
        <div className="mb-4 flex justify-between items-center px-1">
          <p className="text-sm text-zinc-400">내 장비에서 선택</p>
          <button onClick={() => navigate("/equipment/new")} className="text-sm text-amber-400">+ 추가하기</button>
        </div>
        {dripperOptions.length === 0 ? (
          <div className="py-8 text-center text-zinc-500">
            등록된 드리퍼가 없습니다
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {dripperOptions.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setValue("brewMethod", d);
                  setSheet(null);
                }}
                className={`w-full rounded-xl p-4 text-left font-medium transition-colors ${
                  brewMethodValue === d ? "bg-amber-400/10 text-amber-400 ring-1 ring-amber-400" : "bg-zinc-800 text-white active:bg-zinc-700"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </BottomSheet>

      <BottomSheet isOpen={sheet === "grinder"} onClose={() => setSheet(null)} title="그라인더 선택">
        <div className="mb-4 flex justify-between items-center px-1">
          <p className="text-sm text-zinc-400">내 장비에서 선택</p>
          <button onClick={() => navigate("/equipment/new")} className="text-sm text-amber-400">+ 추가하기</button>
        </div>
        <button
          className="mb-2 flex w-full items-center py-3 text-zinc-400 active:bg-zinc-800"
          onClick={() => { setValue("grinderName", ""); setSheet(null); }}
        >
          <span className="flex-1 text-left text-sm px-1">선택 안 함</span>
          {!grinderNameValue && <span className="text-amber-400 text-sm">✓</span>}
        </button>
        <div className="mb-4 h-px bg-zinc-800" />
        {grinderOptions.length === 0 ? (
          <div className="py-8 text-center text-zinc-500">
            등록된 그라인더가 없습니다
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {grinderOptions.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setValue("grinderName", g);
                  setSheet(null);
                }}
                className={`w-full rounded-xl p-4 text-left font-medium transition-colors ${
                  grinderNameValue === g ? "bg-amber-400/10 text-amber-400 ring-1 ring-amber-400" : "bg-zinc-800 text-white active:bg-zinc-700"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
