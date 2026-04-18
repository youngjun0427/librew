import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBrewSessionStore } from "../../store/useBrewSessionStore";

function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

export default function BrewSessionPage() {
  const navigate = useNavigate();
  const { selectedRecipe, actualSteps, setTotalElapsed } = useBrewSessionStore();
  const steps = actualSteps ?? selectedRecipe?.steps ?? [];

  const [stepIndex, setStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [stepElapsed, setStepElapsed] = useState(0);

  const elapsedRef = useRef(0);
  const stepElapsedRef = useRef(0);
  const stepIndexRef = useRef(0);
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  useEffect(() => {
    const interval = setInterval(() => {
      elapsedRef.current += 1;
      stepElapsedRef.current += 1;
      setElapsed(elapsedRef.current);

      const allSteps = stepsRef.current;
      const idx = stepIndexRef.current;
      const step = allSteps[idx];
      const stepTotal = step?.duration ?? 0;

      if (stepTotal > 0 && stepElapsedRef.current >= stepTotal) {
        if (idx >= allSteps.length - 1) {
          setTotalElapsed(elapsedRef.current);
          navigate("/brew/evaluate", { replace: true });
        } else {
          const next = idx + 1;
          stepIndexRef.current = next;
          stepElapsedRef.current = 0;
          setStepIndex(next);
          setStepElapsed(0);
        }
      } else {
        setStepElapsed(stepElapsedRef.current);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate, setTotalElapsed]);

  if (!selectedRecipe) {
    navigate("/", { replace: true });
    return null;
  }

  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex >= steps.length - 1;
  const nextStep = !isLastStep ? steps[stepIndex + 1] : null;

  const stepDuration = currentStep?.duration ?? 0;
  const hasTimer = stepDuration > 0;
  const phaseRemaining = stepDuration - stepElapsed;

  // 누적 prefix sums
  const cumulativeWater = steps.map((_, i) =>
    steps.slice(0, i + 1).reduce((s, st) => s + st.waterAmount, 0)
  );
  const totalRecipeTime = steps.reduce((sum, s) => sum + s.duration, 0);
  const progressPercent =
    totalRecipeTime > 0
      ? Math.min(100, Math.round((elapsed / totalRecipeTime) * 100))
      : Math.round((stepIndex / steps.length) * 100);

  const targetWater = cumulativeWater[stepIndex] ?? 0;
  const addWater = currentStep?.waterAmount ?? 0;
  const nextTargetWater = nextStep ? cumulativeWater[stepIndex + 1] : null;

  const advanceStep = () => {
    if (isLastStep) {
      setTotalElapsed(elapsedRef.current);
      navigate("/brew/evaluate", { replace: true });
    } else {
      const next = stepIndex + 1;
      stepIndexRef.current = next;
      stepElapsedRef.current = 0;
      setStepIndex(next);
      setStepElapsed(0);
    }
  };

  const handleHome = () => {
    if (window.confirm("추출을 중단하시겠습니까?")) {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-900">
      {/* 헤더 */}
      <div className="px-5 pt-12">
        <div className="mb-3 flex items-center justify-between">
          <button onClick={handleHome} className="text-sm text-zinc-500 active:text-zinc-300">
            ← 홈
          </button>
          <p className="text-sm text-zinc-500">{selectedRecipe.title}</p>
          <p className="text-xl font-bold tabular-nums text-white">{formatTime(elapsed)}</p>
        </div>
        <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-zinc-700">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mb-4 text-right text-xs text-zinc-600">{progressPercent}%</p>
      </div>

      {/* 스텝 콘텐츠 */}
      {currentStep && (
        <div className="flex flex-1 flex-col overflow-y-auto px-5">
          <p className="mb-4 text-center text-sm text-zinc-500">
            Step {currentStep.order} / {steps.length}
          </p>

          {hasTimer ? (
            /* ─── 일반 스텝 (duration > 0) ─── */
            <>
              {/* 카운트다운 */}
              <div className="mb-6 flex flex-col items-center gap-2">
                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-400">
                  물 붓기
                </span>
                <p className="text-6xl font-bold tabular-nums text-white">
                  {formatTime(Math.max(0, phaseRemaining))}
                </p>
              </div>

              {/* 물양: 증분 + 누적 */}
              <div className="mb-5 flex items-end justify-center gap-4">
                <div className="text-center">
                  <p className="mb-1 text-xs text-zinc-500">추가</p>
                  <p className="text-5xl font-bold text-amber-400">+{addWater}</p>
                  <p className="text-lg text-amber-400/70">ml</p>
                </div>
                <div className="mb-2 text-2xl text-zinc-600">→</div>
                <div className="text-center">
                  <p className="mb-1 text-xs text-zinc-500">총 목표</p>
                  <p className="text-5xl font-bold text-white">{targetWater}</p>
                  <p className="text-lg text-zinc-400">ml</p>
                </div>
              </div>

              {/* 푸어링 방식 */}
              {currentStep.pourMethod && (
                <div className="mb-3 rounded-2xl bg-zinc-800 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    푸어링
                  </p>
                  <p className="text-base text-white">{currentStep.pourMethod}</p>
                </div>
              )}

              {/* 팁 */}
              {currentStep.tip && (
                <div className="mb-3 rounded-2xl bg-zinc-800/60 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">팁</p>
                  <p className="text-sm text-zinc-300">{currentStep.tip}</p>
                </div>
              )}
            </>
          ) : (
            /* ─── 뜸들이기 스텝 (duration = 0) ─── */
            <>
              <div className="mb-5 text-center">
                <p className="mb-4 text-sm text-zinc-400">
                  {currentStep.pourMethod || "물을 붓고 뜸을 들이세요"}
                </p>
                <span className="text-7xl font-bold text-white">{addWater}</span>
                <span className="text-3xl text-zinc-400">ml</span>
              </div>

              {currentStep.tip && (
                <div className="mb-3 rounded-2xl bg-zinc-800/60 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-zinc-500">팁</p>
                  <p className="text-sm text-zinc-300">{currentStep.tip}</p>
                </div>
              )}

              <button
                className="mb-4 mt-2 w-full rounded-2xl bg-amber-400 py-4 text-lg font-bold text-zinc-900 active:bg-amber-300"
                onClick={advanceStep}
              >
                {isLastStep ? "추출 완료" : "다음 단계 →"}
              </button>
            </>
          )}
        </div>
      )}

      {/* 고정 하단: 다음 스텝 미리보기 */}
      <div className="px-5 pb-8 pt-2">
        <div className="rounded-2xl bg-zinc-800/50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">다음</p>
          {nextStep ? (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-500">Step {nextStep.order}</span>
                <span className="text-sm font-semibold text-white">+{nextStep.waterAmount}ml</span>
                {nextTargetWater !== null && (
                  <span className="text-sm text-zinc-400">총 {nextTargetWater}ml</span>
                )}
                {nextStep.duration > 0 && (
                  <span className="text-sm text-zinc-500">{nextStep.duration}초 붓기</span>
                )}
              </div>
              {nextStep.pourMethod && (
                <p className="mt-1.5 text-xs text-zinc-500">{nextStep.pourMethod}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-zinc-400">추출 완료</p>
          )}
        </div>
      </div>
    </div>
  );
}
