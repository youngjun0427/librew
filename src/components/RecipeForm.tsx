import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";

export type RecipeFormValues = {
  title: string;
  brewMethod: string;
  filterType: string;
  grinderName: string;
  grindSize: string;
  waterTemp: string;
  coffeeWeight: string;
  waterWeight: string;
  steps: {
    waterAmount: string;
    duration: string;
    waitTime: string;
    pourMethod: string;
    tip: string;
  }[];
};

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
  dripperOptions,
  grinderOptions,
}: Props) {
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
      grindSize: "5",
      waterTemp: "93",
      coffeeWeight: "15",
      waterWeight: "225",
      steps: [
        {
          waterAmount: "50",
          duration: "10",
          waitTime: "30",
          pourMethod: "원을 그리며",
          tip: "뜸들이기",
        },
      ],
      ...defaultValues,
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "steps" });
  const brewMethodValue = useWatch({ control, name: "brewMethod" });
  const grinderNameValue = useWatch({ control, name: "grinderName" });

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
              <input {...field} className={inputClass} placeholder="미입력 시 드리퍼, 원두량으로 자동 생성" />
            )}
          />
        </Field>

        <Field label="추출 도구">
          {dripperOptions && dripperOptions.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {dripperOptions.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setValue("brewMethod", d)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium ${
                    brewMethodValue === d ? "bg-amber-400 text-zinc-900" : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          )}
          <Controller
            control={control}
            name="brewMethod"
            render={({ field }) => (
              <input {...field} className={inputClass} placeholder="드리퍼, 에어로프레스, 모카포트 등" />
            )}
          />
        </Field>

        <Field label="필터">
          <Controller
            control={control}
            name="filterType"
            render={({ field }) => (
              <input {...field} className={inputClass} placeholder="예: 종이, 금속" />
            )}
          />
        </Field>

        <Field label="그라인더">
          {grinderOptions && grinderOptions.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {grinderOptions.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setValue("grinderName", grinderNameValue === g ? "" : g)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium ${
                    grinderNameValue === g ? "bg-amber-400 text-zinc-900" : "bg-zinc-700 text-zinc-300"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
          <Controller
            control={control}
            name="grinderName"
            render={({ field }) => (
              <input {...field} className={inputClass} placeholder="사용한 그라인더 (선택)" />
            )}
          />
        </Field>

        <div className="flex gap-3">
          <div className="flex-1">
            <Field label="분쇄도">
              <Controller
                control={control}
                name="grindSize"
                render={({ field }) => (
                  <input {...field} className={inputClass} inputMode="numeric" />
                )}
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="물 온도 (°C)">
              <Controller
                control={control}
                name="waterTemp"
                render={({ field }) => (
                  <input {...field} className={inputClass} inputMode="numeric" />
                )}
              />
            </Field>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Field label="원두 (g)">
              <Controller
                control={control}
                name="coffeeWeight"
                render={({ field }) => (
                  <input {...field} className={inputClass} inputMode="numeric" />
                )}
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="물 (ml)">
              <Controller
                control={control}
                name="waterWeight"
                render={({ field }) => (
                  <input {...field} className={inputClass} inputMode="numeric" />
                )}
              />
            </Field>
          </div>
        </div>

        <p className="mb-3 mt-2 text-base font-semibold text-white">추출 단계</p>
        {fields.map((field, index) => (
          <div key={field.id} className="mb-3 rounded-2xl bg-zinc-800 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-300">Step {index + 1}</span>
              {fields.length > 1 && (
                <button onClick={() => remove(index)} className="text-sm text-red-400">
                  삭제
                </button>
              )}
            </div>

            <div className="mb-2 flex gap-2">
              <div className="flex-1">
                <p className="mb-1 text-xs text-zinc-500">물량 (ml)</p>
                <Controller
                  control={control}
                  name={`steps.${index}.waterAmount`}
                  render={({ field: f }) => (
                    <input {...f} className={inputClass} inputMode="numeric" />
                  )}
                />
              </div>
              <div className="flex-1">
                <p className="mb-1 text-xs text-zinc-500">붓는 시간 (초)</p>
                <Controller
                  control={control}
                  name={`steps.${index}.duration`}
                  render={({ field: f }) => (
                    <input {...f} className={inputClass} inputMode="numeric" />
                  )}
                />
              </div>
              <div className="flex-1">
                <p className="mb-1 text-xs text-zinc-500">대기 (초)</p>
                <Controller
                  control={control}
                  name={`steps.${index}.waitTime`}
                  render={({ field: f }) => (
                    <input {...f} className={inputClass} inputMode="numeric" />
                  )}
                />
              </div>
            </div>

            <div className="mb-2">
              <p className="mb-1 text-xs text-zinc-500">푸어링 방식</p>
              <Controller
                control={control}
                name={`steps.${index}.pourMethod`}
                render={({ field: f }) => (
                  <input {...f} className={inputClass} placeholder="예: 원을 그리며 중앙부터" />
                )}
              />
            </div>

            <div>
              <p className="mb-1 text-xs text-zinc-500">팁 (선택)</p>
              <Controller
                control={control}
                name={`steps.${index}.tip`}
                render={({ field: f }) => (
                  <input {...f} className={inputClass} placeholder="예: 드리퍼가 충분히 젖도록" />
                )}
              />
            </div>
          </div>
        ))}

        <button
          className="mb-6 w-full rounded-2xl border border-dashed border-amber-400/40 py-3 text-amber-400"
          onClick={() =>
            append({ waterAmount: "", duration: "", waitTime: "", pourMethod: "", tip: "" })
          }
          type="button"
        >
          + 단계 추가
        </button>

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
