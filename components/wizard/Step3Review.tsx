"use client";

import { WizardFormData } from "./types";

interface Props {
  form: WizardFormData;
  onBack: () => void;
  onStart: () => void;
}

export function Step3Review({ form, onBack, onStart }: Props) {
  const missingImages = form.creatives.filter((c) => !c.imageDataUrl);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Step 3. 최종 검토</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          시뮬레이션을 시작하기 전 설정 내용을 최종 확인합니다.
        </p>
      </div>

      {/* 누락 경고 배너 (이미지 없는 경우) */}
      {missingImages.length > 0 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 text-sm flex items-start gap-3">
          <span className="font-bold text-base">⚠️</span>
          <div>
            <div className="font-bold">소재 이미지 누락</div>
            <div className="text-xs mt-0.5 opacity-90">
              {missingImages.map((c) => `${c.label}안`).join(", ")}에 이미지가 등록되지 않았습니다.
              이미지 없이 진행 시 텍스트 카피 중심 평가가 실행되며 신뢰도 점수가 약간 하락할 수 있습니다.
            </div>
          </div>
        </div>
      )}

      {/* 1. 캠페인 요약 카드 */}
      <div className="bg-[var(--surface-1)] p-6 rounded-xl border border-[var(--border)] space-y-4">
        <h2 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-3">
          캠페인 및 타겟 정보
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[var(--text-muted)] block mb-1">프로젝트명</span>
            <span className="font-semibold text-[var(--text-primary)]">{form.projectName}</span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block mb-1">매체 / 지면</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {form.media} / {form.placement}
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block mb-1">업종 / 목표</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {form.industry} ({form.objective})
            </span>
          </div>
          <div>
            <span className="text-[var(--text-muted)] block mb-1">일예산 / 계획기간</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {form.dailyBudgetKrw.toLocaleString()}원 / {form.plannedDays}일
            </span>
          </div>
        </div>
        {form.targetSummary && (
          <div className="text-xs pt-2 border-t border-[var(--border)]">
            <span className="text-[var(--text-muted)] mr-2">타겟 요약:</span>
            <span className="text-[var(--text-primary)]">{form.targetSummary}</span>
          </div>
        )}
      </div>

      {/* 2. 등록된 소재 요약 카드 */}
      <div className="bg-[var(--surface-1)] p-6 rounded-xl border border-[var(--border)] space-y-4">
        <h2 className="text-base font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-3">
          등록된 비교 소재 ({form.creatives.length}개)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.creatives.map((c) => (
            <div
              key={c.label}
              className="flex gap-4 p-3 bg-[var(--page)] rounded-lg border border-[var(--border)] items-center"
            >
              <div className="w-16 h-16 bg-[var(--surface-2)] rounded overflow-hidden shrink-0 flex items-center justify-center text-xs text-[var(--text-muted)] font-bold">
                {c.imageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.imageDataUrl} alt={c.label} className="w-full h-full object-cover" />
                ) : (
                  <span>{c.label}안</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-[var(--text-primary)] mb-1">
                  소재 {c.label}안
                </div>
                <div className="text-xs font-medium text-[var(--text-secondary)] truncate">
                  {c.headline || "(헤드라인 없음)"}
                </div>
                <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                  {c.bodyText || "(본문 없음)"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 소요 시간 & 실행 안내 */}
      <div className="p-4 bg-[var(--surface-2)] rounded-xl border border-[var(--border)] text-xs space-y-2">
        <div className="flex items-center justify-between font-medium text-[var(--text-primary)]">
          <span>⏱️ 예상 분석 소요 시간</span>
          <span>약 15초 ~ 25초</span>
        </div>
        <div className="flex items-center justify-between text-[var(--text-secondary)]">
          <span>🧠 멀티모달 프롬프트 평가</span>
          <span>Google Gemini 2.5 (Structured Output)</span>
        </div>
        <div className="flex items-center justify-between text-[var(--text-secondary)]">
          <span>📊 몬테카를로 렌더링</span>
          <span>50,000회 베이시언 사후분포 추출</span>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-between pt-4 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 bg-[var(--surface-2)] text-[var(--text-primary)] font-medium rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          ← 이전: 소재 등록
        </button>
        <button
          type="button"
          onClick={onStart}
          className="px-8 py-3 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-bold rounded-xl hover:opacity-90 transition-opacity text-base shadow-md"
        >
          🚀 시뮬레이션 실행하기
        </button>
      </div>
    </div>
  );
}
