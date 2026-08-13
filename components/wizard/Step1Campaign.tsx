"use client";

import { useState } from "react";
import {
  WizardFormData,
  MEDIA_OPTIONS,
  PLACEMENT_OPTIONS,
  INDUSTRY_OPTIONS,
  OBJECTIVE_OPTIONS,
  MediaType,
  PlacementType,
  IndustryType,
  ObjectiveType,
} from "./types";

interface Props {
  form: WizardFormData;
  onChange: (updates: Partial<WizardFormData>) => void;
  onNext: () => void;
}

export function Step1Campaign({ form, onChange, onNext }: Props) {
  const [showCustomBenchmark, setShowCustomBenchmark] = useState(
    !!(form.customCtr || form.customCvr || form.customCpmKrw)
  );

  const handleMediaChange = (media: MediaType) => {
    const defaultPlacement = PLACEMENT_OPTIONS[media]?.[0]?.value || "INSTAGRAM_FEED";
    onChange({ media, placement: defaultPlacement });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectName.trim()) {
      alert("프로젝트명을 입력해주세요.");
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Step 1. 캠페인 설정</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          광고를 집행할 매체와 타겟, 예산 등 기본 캠페인 정보를 설정합니다.
        </p>
      </div>

      {/* 프로젝트명 / 시뮬레이션 제목 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            프로젝트명 *
          </label>
          <input
            type="text"
            required
            placeholder="예: 2026 수분크림 봄 런칭"
            value={form.projectName}
            onChange={(e) => onChange({ projectName: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--btn-primary-bg)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            시뮬레이션 제목 (선택)
          </label>
          <input
            type="text"
            placeholder="예: 메인 카피 A/B 테스트"
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--btn-primary-bg)]"
          />
        </div>
      </div>

      {/* 매체 선택 (카드 그리드) */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          매체 선택 *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {MEDIA_OPTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleMediaChange(item.value)}
              className={`p-4 border rounded-xl text-left transition-all ${
                form.media === item.value
                  ? "border-[var(--btn-primary-bg)] bg-[var(--surface-2)] shadow-sm"
                  : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--text-muted)]"
              }`}
            >
              <div className="font-semibold text-sm text-[var(--text-primary)]">{item.label}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 지면 & 업종 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            광고 지면 *
          </label>
          <select
            value={form.placement}
            onChange={(e) => onChange({ placement: e.target.value as PlacementType })}
            className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
          >
            {PLACEMENT_OPTIONS[form.media]?.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            업종 *
          </label>
          <select
            value={form.industry}
            onChange={(e) => onChange({ industry: e.target.value as IndustryType })}
            className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
          >
            {INDUSTRY_OPTIONS.map((ind) => (
              <option key={ind.value} value={ind.value}>
                {ind.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 캠페인 목표 (3개 카드) */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
          캠페인 목표 *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {OBJECTIVE_OPTIONS.map((obj) => (
            <button
              key={obj.value}
              type="button"
              onClick={() => onChange({ objective: obj.value })}
              className={`p-4 border rounded-xl text-left transition-all ${
                form.objective === obj.value
                  ? "border-[var(--btn-primary-bg)] bg-[var(--surface-2)] shadow-sm"
                  : "border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--text-muted)]"
              }`}
            >
              <div className="font-semibold text-sm text-[var(--text-primary)]">{obj.label}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{obj.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 타겟 요약 */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
          타겟 요약 (선택)
        </label>
        <input
          type="text"
          placeholder="예: 2030 수분 부족 지성 여성, 스킨케어 관심사"
          value={form.targetSummary}
          onChange={(e) => onChange({ targetSummary: e.target.value })}
          className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--btn-primary-bg)]"
        />
      </div>

      {/* 일예산 / 계획 기간 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            일일 예상 예산 (원) *
          </label>
          <input
            type="number"
            min={10000}
            step={10000}
            value={form.dailyBudgetKrw}
            onChange={(e) => onChange({ dailyBudgetKrw: parseInt(e.target.value, 10) || 0 })}
            className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--btn-primary-bg)] font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            계획 테스트 기간 (일) *
          </label>
          <input
            type="number"
            min={1}
            max={90}
            value={form.plannedDays}
            onChange={(e) => onChange({ plannedDays: parseInt(e.target.value, 10) || 1 })}
            className="w-full px-3 py-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--btn-primary-bg)] font-mono"
          />
        </div>
      </div>

      {/* 접이식 패널: 벤치마크 직접 입력 */}
      <div className="border border-[var(--border)] rounded-xl p-4 bg-[var(--surface-1)]">
        <button
          type="button"
          onClick={() => setShowCustomBenchmark(!showCustomBenchmark)}
          className="flex items-center justify-between w-full text-left text-sm font-medium text-[var(--text-primary)]"
        >
          <span>벤치마크 직접 입력 (권장)</span>
          <span className="text-xs text-[var(--text-muted)]">
            {showCustomBenchmark ? "접기 ▲" : "펼치기 ▼"}
          </span>
        </button>

        {showCustomBenchmark && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-4">
            <p className="text-xs text-[var(--text-muted)]">
              자사 실계정 데이터를 입력하면 시뮬레이션 신뢰도가 대폭 향상됩니다. 비워두면 시스템 매체/업종 프리셋 벤치마크를 사용합니다.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  평균 CTR (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="예: 1.85"
                  value={form.customCtr !== undefined ? form.customCtr * 100 : ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChange({ customCtr: isNaN(val) ? undefined : val / 100 });
                  }}
                  className="w-full px-3 py-2 bg-[var(--page)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  평균 CVR (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="예: 3.20"
                  value={form.customCvr !== undefined ? form.customCvr * 100 : ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChange({ customCvr: isNaN(val) ? undefined : val / 100 });
                  }}
                  className="w-full px-3 py-2 bg-[var(--page)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  평균 CPM (원)
                </label>
                <input
                  type="number"
                  placeholder="예: 4500"
                  value={form.customCpmKrw || ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onChange({ customCpmKrw: isNaN(val) ? undefined : val });
                  }}
                  className="w-full px-3 py-2 bg-[var(--page)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] font-mono"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-6 py-2.5 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          다음: 소재 등록 →
        </button>
      </div>
    </form>
  );
}
