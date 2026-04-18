import { Timestamp } from "firebase/firestore";
import { Controller, useForm } from "react-hook-form";
import type { Bean } from "../types";
import { UnitInput } from "./UnitInput";

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

const inputClass = "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-amber-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-1 text-sm font-medium text-zinc-400">{label}</p>
      {children}
    </div>
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
    <div className="min-h-screen bg-zinc-900">
      <div className="overflow-y-auto p-6 pt-14">
        <div className="mb-6 flex items-center">
          <button onClick={onBack} className="text-amber-400">← 뒤로</button>
          <h1 className="ml-4 text-xl font-bold text-white">{title}</h1>
        </div>

        <Field label="원두 이름">
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <input {...field} className={inputClass} placeholder="예: 에티오피아 예가체프" />
            )}
          />
        </Field>

        <div className="flex gap-3">
          <div className="flex-1">
            <Field label="로스터리">
              <Controller
                control={control}
                name="roastery"
                render={({ field }) => (
                  <input {...field} className={inputClass} placeholder="로스터리명" />
                )}
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="원산지">
              <Controller
                control={control}
                name="origin"
                render={({ field }) => (
                  <input {...field} className={inputClass} placeholder="에티오피아..." />
                )}
              />
            </Field>
          </div>
        </div>

        <Field label="품종">
          <Controller
            control={control}
            name="variety"
            render={({ field }) => (
              <input {...field} className={inputClass} placeholder="Heirloom, Bourbon..." />
            )}
          />
        </Field>

        <div className="flex gap-3">
          <div className="flex-1">
            <Field label="로스팅 날짜">
              <Controller
                control={control}
                name="roastedAt"
                render={({ field }) => (
                  <input {...field} className={inputClass} placeholder="YYYY-MM-DD" />
                )}
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="구매 날짜">
              <Controller
                control={control}
                name="purchasedAt"
                render={({ field }) => (
                  <input {...field} className={inputClass} placeholder="YYYY-MM-DD" />
                )}
              />
            </Field>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <Field label="구매 가격">
              <Controller
                control={control}
                name="price"
                render={({ field }) => (
                  <UnitInput {...field} type="numeric" unit="원" placeholder="25000" />
                )}
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="구매 용량">
              <Controller
                control={control}
                name="totalWeight"
                render={({ field }) => (
                  <UnitInput {...field} type="numeric" unit="g" />
                )}
              />
            </Field>
          </div>
        </div>

        <Field label="잔여 용량">
          <Controller
            control={control}
            name="remainingWeight"
            render={({ field }) => (
              <UnitInput {...field} type="numeric" unit="g" />
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
