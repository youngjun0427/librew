import { useNavigate } from "react-router-dom";
import { ErrorView } from "../../components/ErrorView";
import { LoadingView } from "../../components/LoadingView";
import { useBeans } from "../../hooks/useBeans";
import type { Bean } from "../../types";

function BeanCard({ bean, onPress }: { bean: Bean; onPress: () => void }) {
  const pct =
    bean.totalWeight > 0 ? Math.round((bean.remainingWeight / bean.totalWeight) * 100) : 0;
  return (
    <button className="mb-3 w-full rounded-2xl bg-zinc-800 p-4 text-left active:bg-zinc-700" onClick={onPress}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-base font-semibold text-white">{bean.name}</p>
          <p className="mt-0.5 text-sm text-zinc-400">{bean.roastery} · {bean.origin}</p>
        </div>
        <span className="text-sm font-medium text-zinc-300">{bean.remainingWeight}g 남음</span>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-zinc-700">
        <div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
      </div>
    </button>
  );
}

export default function BeanListPage() {
  const { beans, isLoading, error } = useBeans();
  const navigate = useNavigate();

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="flex items-center justify-between px-5 pb-4 pt-14">
        <button onClick={() => navigate(-1)} className="text-amber-400">← 뒤로</button>
        <h1 className="text-lg font-bold text-white">원두 관리</h1>
        <button onClick={() => navigate("/bean/new")} className="text-amber-400">+ 추가</button>
      </div>

      {beans.length === 0 ? (
        <div className="flex flex-col items-center py-20">
          <p className="text-zinc-400">등록된 원두가 없어요</p>
          <button className="mt-4 text-amber-400" onClick={() => navigate("/bean/new")}>
            + 원두 추가하기
          </button>
        </div>
      ) : (
        <div className="px-5 pb-8">
          {beans.map((item) => (
            <BeanCard key={item.id} bean={item} onPress={() => navigate(`/bean/${item.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}
