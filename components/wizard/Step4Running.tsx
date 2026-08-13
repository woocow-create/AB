"use client";

import { useEffect, useState, useRef } from "react";
import { WizardFormData } from "./types";

interface Props {
  form: WizardFormData;
  onComplete: (simulationId: string) => void;
}

const STAGES = [
  { id: "CREATE", label: "시뮬레이션 데이터 저장 중..." },
  { id: "BENCHMARK", label: "매체/업종 벤치마크 조회" },
  { id: "SCORING", label: "AI 멀티모달 소재 심층 평가 (Gemini 2.5)" },
  { id: "MONTE_CARLO", label: "몬테카를로 50,000회 베이지안 시뮬레이션" },
  { id: "DESIGN", label: "실험 설계 계산 (표본수, MDE, 판정)" },
  { id: "REPORT", label: "종합 결과 리포트 생성 완료" },
];

export function Step4Running({ form, onComplete }: Props) {
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isStarted = useRef(false);

  useEffect(() => {
    if (isStarted.current) return;
    isStarted.current = true;

    async function runFlow() {
      try {
        // 1. 시뮬레이션 + 소재 DB 저장 (project는 내부에서 생성)
        const simRes = await fetch("/api/simulations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: form.projectName || "새 프로젝트",
            title: form.title || `${form.media} ${form.placement} 시뮬레이션`,
            media: form.media,
            placement: form.placement,
            industry: form.industry,
            objective: form.objective,
            targetSummary: form.targetSummary,
            dailyBudgetKrw: form.dailyBudgetKrw,
            plannedDays: form.plannedDays,
            customCtr: form.customCtr,
            customCvr: form.customCvr,
            customCpmKrw: form.customCpmKrw,
            creatives: form.creatives.map((c) => ({
              label: c.label,
              headline: c.headline,
              bodyText: c.bodyText,
              ctaText: c.ctaText,
              imageDataUrl: c.imageDataUrl,
            })),
          }),
        });

        if (!simRes.ok) {
          const errJson = await simRes.json();
          throw new Error(errJson.error || "시뮬레이션 생성 실패");
        }

        const simData = await simRes.json();
        const simulationId = simData.simulation?.id || simData.id || simData.simulation;
        if (!simulationId) throw new Error("시뮬레이션 ID를 받지 못했습니다.");

        setCurrentStageIdx(1);

        // 2. 분석 실행 (Gemini 채점 + 몬테카를로)
        const runRes = await fetch(`/api/simulations/${simulationId}/run`, {
          method: "POST",
        });

        if (!runRes.ok) {
          const runErr = await runRes.json();
          throw new Error(runErr.error || "시뮬레이션 실행 중 오류 발생");
        }

        // 3. 단계별 진행 애니메이션 (run이 완료된 후 표시)
        setCurrentStageIdx(2);
        await new Promise((r) => setTimeout(r, 800));
        setCurrentStageIdx(3);
        await new Promise((r) => setTimeout(r, 800));
        setCurrentStageIdx(4);
        await new Promise((r) => setTimeout(r, 800));
        setCurrentStageIdx(5);
        await new Promise((r) => setTimeout(r, 600));

        onComplete(simulationId);
      } catch (err: any) {
        console.error("Simulation error:", err);
        setErrorMsg(err.message || "시뮬레이션 실행 중 예외가 발생했습니다.");
      }
    }

    runFlow();
  }, [form, onComplete]);

  if (errorMsg) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/30 rounded-2xl text-center space-y-4">
        <div className="text-3xl">⚠️</div>
        <h2 className="text-lg font-bold text-red-500">시뮬레이션 실행 실패</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">{errorMsg}</p>
        <button
          onClick={() => {
            isStarted.current = false;
            setErrorMsg(null);
            setCurrentStageIdx(0);
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Step 4. 시뮬레이션 분석 중...
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          AI 모델과 몬테카를로 엔진이 예측 분석을 진행하고 있습니다. 잠시만 기다려 주세요.
        </p>
      </div>

      {/* 진행 상황 체크리스트 */}
      <div className="bg-[var(--surface-1)] p-6 rounded-xl border border-[var(--border)] space-y-4">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">분석 파이프라인 진행 상태</h2>
        <div className="space-y-3">
          {STAGES.map((stage, idx) => {
            const isDone = idx < currentStageIdx;
            const isCurrent = idx === currentStageIdx;
            return (
              <div
                key={stage.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isDone
                    ? "bg-[var(--surface-2)] border-[var(--border)] opacity-70"
                    : isCurrent
                    ? "bg-[var(--page)] border-[var(--btn-primary-bg)] shadow-sm"
                    : "bg-[var(--page)] border-[var(--border)] opacity-40"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isDone
                      ? "bg-[var(--status-good)] text-white"
                      : isCurrent
                      ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]"
                      : "border border-[var(--border)] text-[var(--text-muted)]"
                  }`}
                >
                  {isDone ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span className={`text-xs ${isCurrent ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                  {stage.label}
                </span>
                {isCurrent && (
                  <span className="ml-auto text-[10px] text-[var(--btn-primary-bg)] font-semibold animate-pulse">
                    처리 중...
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 스켈레톤 UI */}
      <div className="bg-[var(--surface-1)] p-6 rounded-xl border border-[var(--border)] space-y-6">
        <div className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--btn-primary-bg)] animate-ping" />
          결과 리포트 카드 구조화 중...
        </div>
        <div className="h-24 bg-[var(--surface-2)] rounded-xl animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          <div className="h-20 bg-[var(--surface-2)] rounded-lg animate-pulse" />
          <div className="h-20 bg-[var(--surface-2)] rounded-lg animate-pulse delay-75" />
          <div className="h-20 bg-[var(--surface-2)] rounded-lg animate-pulse delay-100" />
          <div className="h-20 bg-[var(--surface-2)] rounded-lg animate-pulse delay-150" />
        </div>
        <div className="h-48 bg-[var(--surface-2)] rounded-xl animate-pulse delay-200" />
      </div>
    </div>
  );
}
