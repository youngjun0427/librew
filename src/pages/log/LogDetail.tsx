import type { Timestamp } from "firebase/firestore";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ErrorView } from "../../components/ErrorView";
import { LoadingView } from "../../components/LoadingView";
import { useBeans } from "../../hooks/useBeans";
import { useBrewLogs } from "../../hooks/useBrewLogs";
import { useRecipes } from "../../hooks/useRecipes";
import type { NextBrewTips } from "../../types";

const TIP_LABELS: Record<keyof NextBrewTips, string> = {
  grind: "분쇄도", temp: "물 온도", bloom: "뜸 들이기", water: "물량", other: "기타",
};

function formatDate(ts: Timestamp) {
  return ts.toDate().toLocaleString("ko-KR");
}
function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}
function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className="text-sm text-white">{value} / 5</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-700">
        <div className="h-2 rounded-full bg-amber-400" style={{ width: `${(value / 5) * 100}%` }} />
      </div>
    </div>
  );
}

export default function LogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { brewLogs, isLoading: logsLoading, error, deleteBrewLog } = useBrewLogs();
  const { recipes, isLoading: recLoading } = useRecipes();
  const { beans, isLoading: beansLoading } = useBeans();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isLoading = logsLoading || recLoading || beansLoading;

  if (isLoading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  const log = brewLogs.find((l) => l.id === id);

  if (!log) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900">
        <p className="text-zinc-400">기록을 찾을 수 없어요</p>
        <button onClick={() => navigate(-1)} className="mt-2 text-amber-400">← 돌아가기</button>
      </div>
    );
  }

  const recipe = recipes.find((r) => r.id === log.recipeId);
  const bean = log.beanId ? beans.find((b) => b.id === log.beanId) : null;

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    await deleteBrewLog(id!);
    navigate(-1);
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-zinc-900 p-6 pt-14">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-amber-400">← 뒤로</button>
        <button onClick={() => setShowDeleteDialog(true)} className="text-red-400">삭제</button>
      </div>

      <h1 className="mb-1 text-2xl font-bold text-white">
        {recipe?.title ?? "알 수 없는 레시피"}
      </h1>
      <p className="mb-6 text-sm text-zinc-400">{formatDate(log.brewedAt)}</p>

      <div className="mb-4 rounded-2xl bg-zinc-800 p-5">
        <p className="mb-3 text-sm font-semibold text-zinc-300">추출 정보</p>
        {bean ? <InfoRow label="원두" value={bean.name} /> : null}
        <InfoRow label="원두량" value={`${log.usedCoffeeWeight}g`} />
        <InfoRow label="물량" value={`${log.actualWaterWeight}ml`} />
        {log.totalBrewTime > 0 ? (
          <InfoRow label="추출 시간" value={formatTime(log.totalBrewTime)} />
        ) : null}
      </div>

      {log.sensoryNote && (
        <div className="mb-4 rounded-2xl bg-zinc-800 p-5">
          <p className="mb-4 text-sm font-semibold text-zinc-300">관능 평가</p>
          <RatingBar label="산미" value={log.sensoryNote.acidity} />
          <RatingBar label="쓴맛" value={log.sensoryNote.bitterness} />
          <RatingBar label="바디" value={log.sensoryNote.body} />
          <RatingBar label="향" value={log.sensoryNote.aroma} />
          <RatingBar label="전체 만족도" value={log.sensoryNote.overall} />
        </div>
      )}

      {log.memo ? (
        <div className="mb-4 rounded-2xl bg-zinc-800 p-5">
          <p className="mb-2 text-sm font-semibold text-zinc-300">메모</p>
          <p className="text-sm leading-relaxed text-zinc-300">{log.memo}</p>
        </div>
      ) : null}

      {log.nextBrewTips && (() => {
        const entries = (Object.entries(log.nextBrewTips) as [keyof NextBrewTips, string | undefined][])
          .filter(([, v]) => v && v.trim());
        if (entries.length === 0) return null;
        return (
          <div className="rounded-2xl bg-amber-400/10 p-5 ring-1 ring-amber-400/30">
            <p className="mb-3 text-sm font-semibold text-amber-400">다음 번엔?</p>
            <div className="flex flex-col gap-2">
              {entries.map(([key, val]) => (
                <div key={key} className="flex items-start gap-2">
                  <span className="mt-px text-xs font-medium text-amber-400/70">{TIP_LABELS[key]}</span>
                  <span className="flex-1 text-sm text-amber-100">{val}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="기록을 삭제할까요?"
        description="삭제하면 복구할 수 없어요"
        confirmLabel="삭제"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
