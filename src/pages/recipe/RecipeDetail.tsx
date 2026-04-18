import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useBrewLogs } from "../../hooks/useBrewLogs";
import { useEquipment } from "../../hooks/useEquipment";
import { useRecipes } from "../../hooks/useRecipes";
import type { BrewLog } from "../../types";

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function LogRow({ log, onPress }: { log: BrewLog; onPress: () => void }) {
  const date = log.brewedAt
    ? new Date(log.brewedAt.seconds * 1000).toLocaleDateString("ko-KR", {
        month: "short", day: "numeric",
      })
    : "";
  const overall = log.sensoryNote?.overall;
  const hasTips = log.nextBrewTips && Object.values(log.nextBrewTips).some((v) => v && v.trim());

  return (
    <button onClick={onPress} className="flex w-full items-center justify-between py-3 text-left">
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-300">{date}</span>
        {overall ? (
          <span className="text-xs text-amber-400">{"★".repeat(overall)}{"☆".repeat(5 - overall)}</span>
        ) : (
          <span className="text-xs text-zinc-600">평가 없음</span>
        )}
        {hasTips && (
          <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
            팁
          </span>
        )}
      </div>
      <span className="text-zinc-600">›</span>
    </button>
  );
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { recipes, deleteRecipe } = useRecipes();
  const { brewLogs } = useBrewLogs();
  const { equipment } = useEquipment();
  const recipe = recipes.find((r) => r.id === id);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!recipe) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-900">
        <p className="text-zinc-400">레시피를 찾을 수 없어요</p>
        <button onClick={() => navigate(-1)} className="mt-2 text-amber-400">← 돌아가기</button>
      </div>
    );
  }

  const handleDelete = async () => {
    setShowDeleteDialog(false);
    await deleteRecipe(id!);
    navigate(-1);
  };

  const handleStartBrew = () => {
    navigate("/brew/prep", { state: { recipeId: recipe.id } });
  };

  const ratio =
    recipe.coffeeWeight > 0 ? (recipe.waterWeight / recipe.coffeeWeight).toFixed(1) : "-";

  const relatedLogs = brewLogs
    .filter((l) => l.recipeId === id)
    .sort((a, b) => (b.brewedAt?.seconds ?? 0) - (a.brewedAt?.seconds ?? 0));

  return (
    <div className="min-h-screen overflow-y-auto bg-zinc-900 p-6 pt-14">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="text-amber-400">← 뒤로</button>
        <div className="flex gap-4">
          <button onClick={() => navigate(`/recipe/edit/${id}`)} className="text-amber-400">수정</button>
          <button onClick={() => setShowDeleteDialog(true)} className="text-red-400">삭제</button>
        </div>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-white">{recipe.title}</h1>

      <div className="mb-4 rounded-2xl bg-zinc-800 p-5">
        <p className="mb-3 text-sm font-semibold text-zinc-300">파라미터</p>
        <ParamRow label="추출 방식" value={recipe.brewMethod} />
        <ParamRow label="필터 종류" value={recipe.filterType} />
        <ParamRow label="물 온도" value={`${recipe.waterTemp}°C`} />
        <ParamRow label="원두량" value={`${recipe.coffeeWeight}g`} />
        <ParamRow label="물량" value={`${recipe.waterWeight}ml`} />
        <ParamRow label="비율" value={`1:${ratio}`} />
      </div>

      {recipe.grindSettings && Object.keys(recipe.grindSettings).length > 0 && (
        <div className="mb-4 rounded-2xl bg-zinc-800 p-5">
          <p className="mb-3 text-sm font-semibold text-zinc-300">그라인더별 분쇄도</p>
          {Object.entries(recipe.grindSettings).map(([grinderId, setting]) => {
            const grinder = equipment.find((e) => e.id === grinderId);
            return (
              <div key={grinderId} className="flex items-center justify-between py-2">
                <span className="text-sm text-zinc-400">{grinder?.name ?? grinderId}</span>
                <span className="text-sm font-medium text-white">{setting}</span>
              </div>
            );
          })}
        </div>
      )}

      {recipe.steps.length > 0 && (
        <div className="mb-4 rounded-2xl bg-zinc-800 p-5">
          <p className="mb-4 text-sm font-semibold text-zinc-300">추출 단계</p>
          {recipe.steps.map((step) => (
            <div key={step.order} className="mb-4 flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20">
                <span className="text-xs font-bold text-amber-400">{step.order}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{step.waterAmount}ml</p>
                {step.pourMethod ? (
                  <p className="mt-0.5 text-xs text-zinc-400">{step.pourMethod}</p>
                ) : null}
                {step.duration > 0 && (
                  <p className="mt-0.5 text-xs text-zinc-500">{step.duration}초</p>
                )}
                {step.tip ? <p className="mt-0.5 text-xs text-zinc-500">{step.tip}</p> : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Brew log history */}
      <div className="mb-6 rounded-2xl bg-zinc-800 p-5">
        <p className="mb-1 text-sm font-semibold text-zinc-300">추출 기록</p>
        {relatedLogs.length === 0 ? (
          <p className="py-3 text-sm text-zinc-500">아직 이 레시피로 추출한 기록이 없어요</p>
        ) : (
          <div>
            {relatedLogs.map((log, idx) => (
              <div key={log.id}>
                {idx > 0 && <div className="h-px bg-zinc-700" />}
                <LogRow log={log} onPress={() => navigate(`/log/${log.id}`)} />
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="w-full rounded-2xl bg-amber-400 py-4 text-center font-bold text-zinc-900"
        onClick={handleStartBrew}
      >
        ⚡ 이 레시피로 브루잉 시작
      </button>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="레시피를 삭제할까요?"
        description="삭제하면 복구할 수 없어요"
        confirmLabel="삭제"
        variant="danger"
        onConfirm={handleDelete}
        onClose={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
