import { logit, sigmoid } from "./math";
import { Media } from "../benchmarks/seed";

export interface MediaSensitivity {
  betaCtr: number;
  betaCvr: number;
  description: string;
}

/**
 * PRD 5.4절 매체별 소재 민감도 계수 β 테이블
 */
export const MEDIA_SENSITIVITY_TABLE: Record<Media, MediaSensitivity> = {
  META: { betaCtr: 1.10, betaCvr: 0.45, description: "소재가 성과를 지배하는 대표 매체" },
  YOUTUBE: { betaCtr: 1.00, betaCvr: 0.40, description: "영상 비주얼 중심 매체" },
  GOOGLE_DISPLAY: { betaCtr: 0.95, betaCvr: 0.40, description: "배너 카피/이미지 민감도 높음" },
  KAKAO_MOMENT: { betaCtr: 0.90, betaCvr: 0.40, description: "도달율 및 카피 메시지 반응성" },
  NAVER_GFA: { betaCtr: 0.85, betaCvr: 0.40, description: "메인 배너 및 소재 위계 중요" },
  GOOGLE_SEARCH: { betaCtr: 0.55, betaCvr: 0.30, description: "지면이 텍스트로 고정되어 소재 영향 상대적 적음" },
};

/**
 * 소재 종합점수 S_i (0~100)와 베이스라인 p0/q0, 매체 민감도 β로부터 logit 공간 성과 파라미터 산출
 * logit(ctr_i) = logit(p0) + β_ctr * (S_i - 50) / 50 + δ_ctr
 */
export function calculateLogitPerformance(
  score: number, // 0 ~ 100
  p0: number,    // baseline CTR (0 ~ 1)
  q0: number,    // baseline CVR (0 ~ 1)
  media: Media,
  deltaCtr: number = 0,
  deltaCvr: number = 0,
  betaOverrideCtr?: number,
  betaOverrideCvr?: number
) {
  const sens = MEDIA_SENSITIVITY_TABLE[media] || MEDIA_SENSITIVITY_TABLE.META;
  const betaCtr = betaOverrideCtr ?? sens.betaCtr;
  const betaCvr = betaOverrideCvr ?? sens.betaCvr;

  const scoreNormalized = (score - 50) / 50;

  const logitCtrMedian = logit(p0) + betaCtr * scoreNormalized + deltaCtr;
  const logitCvrMedian = logit(q0) + betaCvr * scoreNormalized + deltaCvr;

  return {
    logitCtrMedian,
    logitCvrMedian,
    predictedCtrMedian: sigmoid(logitCtrMedian),
    predictedCvrMedian: sigmoid(logitCvrMedian),
    betaCtr,
    betaCvr,
  };
}

/**
 * 채점 불확실성(scoreStdDev)으로부터 로그오즈 표준편차 σ 산출
 * σ_i = β_ctr * scoreStdDev_i / 50
 */
export function calculateScoreStdDevLogit(scoreStdDev: number, betaCtr: number): number {
  return (betaCtr * scoreStdDev) / 50;
}
