"use client";

import { CreativeFormData, PlacementType } from "./types";

interface Props {
  creative: CreativeFormData;
  placement: PlacementType;
}

export function AdPreview({ creative, placement }: Props) {
  const headline = creative.headline || "헤드라인 입력 영역";
  const bodyText = creative.bodyText || "광고 본문 문구가 실시간으로 표시됩니다.";
  const ctaText = creative.ctaText || "지금 확인하기";
  const label = creative.label || "A";

  const renderContent = () => {
    switch (placement) {
      case "INSTAGRAM_FEED":
      default:
        return (
          <div className="w-[320px] bg-white text-slate-900 rounded-xl shadow-lg border border-slate-200 overflow-hidden font-sans text-xs">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
                  AD
                </div>
                <div>
                  <div className="font-semibold leading-tight text-slate-900">brand_official</div>
                  <div className="text-[10px] text-slate-400">스폰서드</div>
                </div>
              </div>
              <div className="text-slate-400 font-bold">•••</div>
            </div>

            {/* Media Area */}
            <div className="w-full aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden">
              {creative.imageDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={creative.imageDataUrl} alt="Ad Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>이미지 미등록</span>
                </div>
              )}
              <span className="absolute top-2 left-2 bg-slate-900/70 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                소재 {label}
              </span>
            </div>

            {/* CTA Strip */}
            <div className="bg-slate-50 px-3 py-2 flex items-center justify-between border-t border-b border-slate-100">
              <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[200px]">{headline}</span>
              <span className="text-blue-600 font-bold text-[11px] whitespace-nowrap">{ctaText} &gt;</span>
            </div>

            {/* Engagement & Text */}
            <div className="p-3 space-y-1">
              <div className="flex items-center gap-3 text-slate-700 text-sm mb-1.5">
                <span>♡</span> <span>💬</span> <span>✈</span>
              </div>
              <p className="text-slate-800">
                <span className="font-semibold mr-1">brand_official</span>
                {bodyText}
              </p>
            </div>
          </div>
        );

      case "INSTAGRAM_REELS":
        return (
          <div className="w-[260px] h-[460px] bg-slate-950 text-white rounded-2xl shadow-xl overflow-hidden relative font-sans text-xs flex flex-col justify-between p-4 border border-slate-800">
            {creative.imageDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={creative.imageDataUrl} alt="Ad Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500">
                <span>릴스 9:16 비디오/이미지</span>
              </div>
            )}
            <div className="relative z-10 flex justify-between items-center">
              <span className="bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold">소재 {label} (릴스)</span>
              <span className="text-[10px] text-slate-300">스폰서드</span>
            </div>
            <div className="relative z-10 space-y-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 -mx-2 -mb-2 rounded-b-xl">
              <p className="font-semibold text-sm line-clamp-2">{headline}</p>
              <p className="text-slate-300 text-[11px] line-clamp-2">{bodyText}</p>
              <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 font-bold rounded-lg text-white text-xs">
                {ctaText}
              </button>
            </div>
          </div>
        );

      case "FACEBOOK_FEED":
        return (
          <div className="w-[320px] bg-white text-slate-900 rounded-lg shadow-md border border-slate-200 overflow-hidden font-sans text-xs">
            <div className="p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">FB</div>
              <div>
                <div className="font-bold text-slate-900">공식 브랜드 페이지</div>
                <div className="text-[10px] text-slate-400">스폰서드 · 🌐</div>
              </div>
            </div>
            <div className="px-3 pb-2 text-slate-800">{bodyText}</div>
            <div className="w-full aspect-[1.91/1] bg-slate-100 relative overflow-hidden flex items-center justify-center border-y border-slate-100">
              {creative.imageDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={creative.imageDataUrl} alt="Ad Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-400 text-[11px]">1.91:1 가로 이미지</span>
              )}
            </div>
            <div className="bg-slate-100 p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">brand.co.kr</div>
                <div className="font-bold text-slate-900 truncate max-w-[180px]">{headline}</div>
              </div>
              <button className="px-3 py-1.5 bg-slate-200 text-slate-800 font-bold rounded hover:bg-slate-300 text-[11px]">
                {ctaText}
              </button>
            </div>
          </div>
        );

      case "NAVER_GFA_BANNER":
        return (
          <div className="w-[320px] bg-white text-slate-900 rounded-lg shadow-md border border-slate-300 p-3 font-sans text-xs">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
              <span className="font-bold text-green-600">NAVER GFA</span>
              <span>AD</span>
            </div>
            <div className="flex gap-3">
              <div className="w-20 h-20 bg-slate-100 rounded overflow-hidden shrink-0 flex items-center justify-center">
                {creative.imageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={creative.imageDataUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-slate-400 text-center">1:1 배너</span>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-slate-900 line-clamp-1">{headline}</div>
                  <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">{bodyText}</div>
                </div>
                <div className="text-right text-green-700 font-bold text-[11px] mt-1">{ctaText} &gt;</div>
              </div>
            </div>
          </div>
        );

      case "KAKAO_MOMENT_FEED":
        return (
          <div className="w-[320px] bg-amber-50/50 text-slate-900 rounded-xl shadow border border-amber-200 p-3 font-sans text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-900 text-[11px]">카카오비즈니스</span>
              <span className="bg-amber-200 text-amber-900 text-[9px] px-1.5 py-0.5 rounded font-semibold">AD</span>
            </div>
            <div className="space-y-2">
              <div className="font-bold text-slate-900 text-sm">{headline}</div>
              <div className="w-full aspect-[2/1] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                {creative.imageDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={creative.imageDataUrl} alt="Ad Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-slate-400">카카오 피드 이미지</span>
                )}
              </div>
              <div className="text-slate-700 text-[11px]">{bodyText}</div>
              <button className="w-full py-2 bg-amber-400 hover:bg-amber-500 font-bold text-amber-950 rounded-lg text-xs">
                {ctaText}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-medium text-[var(--text-muted)] mb-2">
        실시간 지면 미리보기 ({placement})
      </div>
      {renderContent()}
    </div>
  );
}
