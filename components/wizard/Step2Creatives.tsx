"use client";

import { useState } from "react";
import { WizardFormData, CreativeFormData } from "./types";
import { AdPreview } from "./AdPreview";

interface Props {
  form: WizardFormData;
  onChange: (updates: Partial<WizardFormData>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function Step2Creatives({ form, onChange, onBack, onNext }: Props) {
  const [selectedCreativeIndex, setSelectedCreativeIndex] = useState<number>(0);

  const handleCreativeChange = (index: number, updates: Partial<CreativeFormData>) => {
    const nextCreatives = [...form.creatives];
    nextCreatives[index] = { ...nextCreatives[index], ...updates };
    onChange({ creatives: nextCreatives });
  };

  const handleImageUpload = (index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      handleCreativeChange(index, { imageDataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const addCreative = () => {
    if (form.creatives.length >= 4) return;
    const labels = ["A", "B", "C", "D"];
    const nextLabel = labels[form.creatives.length];
    onChange({
      creatives: [
        ...form.creatives,
        { label: nextLabel, headline: "", bodyText: "", ctaText: "", imageDataUrl: undefined },
      ],
    });
  };

  const removeCreative = (index: number) => {
    if (form.creatives.length <= 2) {
      alert("최소 2개의 소재가 필요합니다.");
      return;
    }
    const nextCreatives = form.creatives.filter((_, i) => i !== index);
    // Relabel
    const labels = ["A", "B", "C", "D"];
    const relabeled = nextCreatives.map((c, i) => ({ ...c, label: labels[i] }));
    onChange({ creatives: relabeled });
    if (selectedCreativeIndex >= relabeled.length) {
      setSelectedCreativeIndex(relabeled.length - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < form.creatives.length; i++) {
      const c = form.creatives[i];
      if (!c.headline.trim()) {
        alert(`${c.label}안의 헤드라인을 입력해 주세요.`);
        setSelectedCreativeIndex(i);
        return;
      }
    }
    onNext();
  };

  const activeCreative = form.creatives[selectedCreativeIndex] || form.creatives[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Step 2. 소재 등록</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          비교 실험할 소재 A/B안(최대 4개)의 이미지와 카피를 등록하세요.
        </p>
      </div>

      {/* 탭 네비게이션 & 추가 버튼 */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
        <div className="flex gap-2">
          {form.creatives.map((c, idx) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setSelectedCreativeIndex(idx)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors flex items-center gap-2 ${
                selectedCreativeIndex === idx
                  ? "bg-[var(--surface-1)] text-[var(--btn-primary-bg)] border-b-2 border-[var(--btn-primary-bg)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <span>소재 {c.label}안</span>
              {form.creatives.length > 2 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCreative(idx);
                  }}
                  className="text-xs text-red-400 hover:text-red-600 px-1"
                >
                  ✕
                </span>
              )}
            </button>
          ))}
        </div>
        {form.creatives.length < 4 && (
          <button
            type="button"
            onClick={addCreative}
            className="text-xs font-semibold text-[var(--btn-primary-bg)] hover:underline"
          >
            + 소재 추가 (C/D안)
          </button>
        )}
      </div>

      {/* 2열 메인 레이아웃: 좌측 입력 / 우측 지면 미리보기 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* 좌측: 현재 선택 탭의 입력 폼 */}
        <div className="space-y-5 bg-[var(--surface-1)] p-6 rounded-xl border border-[var(--border)]">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            소재 {activeCreative.label}안 입력
          </h2>

          {/* 이미지 드롭존 */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              소재 이미지 (드래그앤드롭 / 파일 선택)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleImageUpload(selectedCreativeIndex, file);
              }}
              className="border-2 border-dashed border-[var(--border)] rounded-xl p-4 text-center bg-[var(--page)] hover:border-[var(--btn-primary-bg)] transition-colors cursor-pointer relative"
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(selectedCreativeIndex, file);
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {activeCreative.imageDataUrl ? (
                <div className="flex flex-col items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeCreative.imageDataUrl}
                    alt="Uploaded"
                    className="max-h-32 rounded object-contain"
                  />
                  <span className="text-xs text-[var(--btn-primary-bg)] font-medium">
                    클릭하여 이미지 변경
                  </span>
                </div>
              ) : (
                <div className="py-4 space-y-1">
                  <div className="text-sm font-medium text-[var(--text-primary)]">
                    이미지 업로드
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    PNG, JPG, WEBP (지면 비율 권장)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 헤드라인 */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              헤드라인 (주요 카피) *
            </label>
            <input
              type="text"
              required
              placeholder="예: 7일만에 살아나는 피부 수분 장벽"
              value={activeCreative.headline}
              onChange={(e) =>
                handleCreativeChange(selectedCreativeIndex, { headline: e.target.value })
              }
              className="w-full px-3 py-2 bg-[var(--page)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          {/* 본문 텍스트 */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              본문 문구 (상세 텍스트)
            </label>
            <textarea
              rows={3}
              placeholder="예: 임상시험으로 입증된 100시간 보습력. 지금 무료 배송 혜택으로 만나보세요."
              value={activeCreative.bodyText}
              onChange={(e) =>
                handleCreativeChange(selectedCreativeIndex, { bodyText: e.target.value })
              }
              className="w-full px-3 py-2 bg-[var(--page)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          {/* CTA 텍스트 */}
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              CTA 버튼 문구
            </label>
            <input
              type="text"
              placeholder="예: 지금 구매하기, 자세히 보기"
              value={activeCreative.ctaText}
              onChange={(e) =>
                handleCreativeChange(selectedCreativeIndex, { ctaText: e.target.value })
              }
              className="w-full px-3 py-2 bg-[var(--page)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>
        </div>

        {/* 우측: 지면 미리보기 */}
        <div className="bg-[var(--surface-1)] p-6 rounded-xl border border-[var(--border)] flex flex-col items-center justify-center min-h-[420px]">
          <AdPreview creative={activeCreative} placement={form.placement} />
        </div>
      </div>

      {/* 하단 네비게이션 버튼 */}
      <div className="flex justify-between pt-4 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 bg-[var(--surface-2)] text-[var(--text-primary)] font-medium rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          ← 이전: 캠페인 설정
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          다음: 검토 →
        </button>
      </div>
    </form>
  );
}
