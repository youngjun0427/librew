import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../lib/firebase";
import { useRecipes } from "../../hooks/useRecipes";
import { useAuthStore } from "../../store/useAuthStore";
import type { PublicRecipe } from "../../types";

export default function ShareViewerPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addRecipe } = useRecipes();
  const [publicRecipe, setPublicRecipe] = useState<PublicRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "publicRecipes", shareId!))
      .then((snap) => {
        if (snap.exists()) setPublicRecipe(snap.data() as PublicRecipe);
      })
      .finally(() => setLoading(false));
  }, [shareId]);

  const handleImport = async () => {
    if (!publicRecipe || !user) return;
    const r = publicRecipe.recipeData;
    await addRecipe({
      title: `${r.title} (가져옴)`,
      brewMethod: r.brewMethod,
      filterType: r.filterType,
      grindSize: r.grindSize,
      waterTemp: r.waterTemp,
      coffeeWeight: r.coffeeWeight,
      waterWeight: r.waterWeight,
      steps: r.steps,
      isPublic: false,
      shareId: null,
    });
    setImported(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <p className="text-zinc-400">불러오는 중...</p>
      </div>
    );
  }

  if (!publicRecipe) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <p className="text-zinc-400">레시피를 찾을 수 없어요</p>
      </div>
    );
  }

  const r = publicRecipe.recipeData;
  const ratio = r.coffeeWeight > 0 ? (r.waterWeight / r.coffeeWeight).toFixed(1) : "-";

  return (
    <div className="min-h-screen overflow-y-auto bg-zinc-900 p-6 pt-14">
      <p className="mb-1 text-sm text-zinc-400">공유된 레시피</p>
      <h1 className="mb-6 text-2xl font-bold text-white">{r.title}</h1>

      <div className="mb-6 rounded-2xl bg-zinc-800 p-5">
        {(
          [
            ["드리퍼", r.brewMethod],
            ["필터", r.filterType],
            ["분쇄도", String(r.grindSize)],
            ["물 온도", `${r.waterTemp}°C`],
            ["원두", `${r.coffeeWeight}g`],
            ["물", `${r.waterWeight}ml`],
            ["비율", `1:${ratio}`],
          ] as [string, string][]
        ).map(([label, value]) => (
          <div key={label} className="flex items-center justify-between py-2">
            <span className="text-sm text-zinc-400">{label}</span>
            <span className="text-sm font-medium text-white">{value}</span>
          </div>
        ))}
      </div>

      {r.steps.length > 0 && (
        <div className="mb-6 rounded-2xl bg-zinc-800 p-5">
          <p className="mb-4 font-semibold text-zinc-300">추출 단계</p>
          {r.steps.map((step) => (
            <div key={step.order} className="mb-3 flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/20">
                <span className="text-xs font-bold text-amber-400">{step.order}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{step.waterAmount}ml</p>
                {step.tip ? <p className="text-sm text-zinc-400">{step.tip}</p> : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {user ? (
        imported ? (
          <div className="rounded-xl bg-green-900/30 py-4">
            <p className="text-center font-semibold text-green-400">내 레시피에 추가되었어요!</p>
          </div>
        ) : (
          <button
            className="w-full rounded-xl bg-amber-400 py-4 font-semibold text-zinc-900"
            onClick={handleImport}
          >
            내 레시피로 가져오기
          </button>
        )
      ) : (
        <button
          className="w-full rounded-xl bg-amber-400 py-4 font-semibold text-zinc-900"
          onClick={() => navigate("/login")}
        >
          로그인하여 가져오기
        </button>
      )}
    </div>
  );
}
