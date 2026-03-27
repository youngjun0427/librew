import type { Timestamp } from "firebase/firestore";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BeanForm, beanFormToData, type BeanFormValues } from "../../components/BeanForm";
import { useBeans } from "../../hooks/useBeans";
import { useBrewLogs } from "../../hooks/useBrewLogs";
import { useRecipes } from "../../hooks/useRecipes";

function toDateStr(ts: Timestamp) {
  return ts.toDate().toISOString().split("T")[0];
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

export default function BeanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { beans, updateBean, deleteBean } = useBeans();
  const { brewLogs } = useBrewLogs();
  const { recipes } = useRecipes();

  const [isEditing, setIsEditing] = useState(false);
  const bean = beans.find((b) => b.id === id);

  if (!bean) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900">
        <p className="text-zinc-400">원두를 찾을 수 없어요</p>
        <button onClick={() => navigate(-1)} className="mt-2 text-amber-400">← 돌아가기</button>
      </div>
    );
  }

  if (isEditing) {
    const defaultValues: BeanFormValues = {
      name: bean.name, roastery: bean.roastery, origin: bean.origin, variety: bean.variety,
      roastedAt: toDateStr(bean.roastedAt), purchasedAt: toDateStr(bean.purchasedAt),
      price: String(bean.price), totalWeight: String(bean.totalWeight),
      remainingWeight: String(bean.remainingWeight),
    };
    const handleSubmit = async (data: BeanFormValues) => {
      await updateBean(id!, beanFormToData(data));
      setIsEditing(false);
    };
    return (
      <BeanForm
        title="원두 수정" defaultValues={defaultValues}
        onBack={() => setIsEditing(false)} onSubmit={handleSubmit} submitLabel="수정 완료"
      />
    );
  }

  const handleDelete = async () => {
    if (!window.confirm("이 원두를 삭제할까요?")) return;
    await deleteBean(id!);
    navigate(-1);
  };

  const pct =
    bean.totalWeight > 0 ? Math.round((bean.remainingWeight / bean.totalWeight) * 100) : 0;

  const beanLogs = brewLogs.filter((log) => log.beanId === id);

  return (
    <div className="min-h-screen overflow-y-auto bg-zinc-900 p-6 pt-14">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-amber-400">← 뒤로</button>
        <div className="flex gap-4">
          <button onClick={() => setIsEditing(true)} className="text-amber-400">수정</button>
          <button onClick={handleDelete} className="text-red-400">삭제</button>
        </div>
      </div>

      <h1 className="mb-1 text-2xl font-bold text-white">{bean.name}</h1>
      <p className="mb-6 text-base text-zinc-400">{bean.roastery}</p>

      <div className="mb-4 rounded-2xl bg-zinc-800 p-5">
        <InfoRow label="원산지" value={bean.origin} />
        <InfoRow label="품종" value={bean.variety} />
        <InfoRow label="로스팅 날짜" value={toDateStr(bean.roastedAt)} />
        <InfoRow label="구매일" value={toDateStr(bean.purchasedAt)} />
        <InfoRow label="구매 가격" value={`₩${bean.price.toLocaleString()}`} />
        <InfoRow label="전체 용량" value={`${bean.totalWeight}g`} />
        <InfoRow label="잔여 용량" value={`${bean.remainingWeight}g (${pct}%)`} />
        <div className="mt-4 h-2 rounded-full bg-zinc-700">
          <div className="h-2 rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-8 pb-10">
        <h2 className="mb-4 text-lg font-bold text-white">이 원두의 추출 기록</h2>
        {beanLogs.length === 0 ? (
          <p className="text-sm text-zinc-500">아직 이 원두로 내린 기록이 없어요.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {beanLogs.map((log) => {
              const recipe = recipes.find(r => r.id === log.recipeId);
              const score = log.sensoryNote?.overall;
              const hasOverrides = log.actualGrindSize != null || log.actualWaterTemp != null || log.actualFilterType != null;
              
              return (
                <Link
                  key={log.id}
                  to={`/log/${log.id}`}
                  className="block rounded-2xl bg-zinc-800 p-4 transition-transform active:scale-[0.98]"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {recipe?.title || "알 수 없는 레시피"}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {log.brewedAt ? toDateStr(log.brewedAt) : ""}
                      </p>
                    </div>
                    {score && (
                      <div className="flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-1">
                        <span className="text-xs text-amber-400">★</span>
                        <span className="text-sm font-bold text-amber-400">{score.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-zinc-300">
                    <p className="font-medium text-zinc-400">{log.usedCoffeeWeight}g → {log.actualWaterWeight}ml</p>
                    {hasOverrides && (
                      <div className="mt-3 rounded-xl border border-zinc-700 bg-zinc-900/50 p-3">
                        <p className="mb-1.5 text-[10px] font-semibold tracking-wider text-amber-400/80">🔥 변경된 세팅 (Override)</p>
                        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-zinc-400">
                          {log.actualGrindSize != null && <li>분쇄도: <span className="text-zinc-200">{log.actualGrindSize}</span></li>}
                          {log.actualWaterTemp != null && <li>온도: <span className="text-zinc-200">{log.actualWaterTemp}°C</span></li>}
                          {log.actualFilterType != null && <li>필터: <span className="text-zinc-200">{log.actualFilterType}</span></li>}
                        </ul>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
