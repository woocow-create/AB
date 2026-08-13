import { Media, Industry } from "../benchmarks/seed";

export type Objective = "AWARENESS" | "TRAFFIC" | "CONVERSION";

export interface EvaluationContext {
  media: Media;
  placement: string;
  industry: Industry;
  objective: Objective;
  targetSummary: string;
}

export interface CreativePayload {
  headline: string;
  bodyText: string;
  ctaText: string;
}

/**
 * PRD 5.3절 목표별 축 가중치 (합 = 1.0)
 */
export const OBJECTIVE_WEIGHTS: Record<
  Objective,
  {
    stopPower: number;
    hierarchy: number;
    clarity: number;
    valueProp: number;
    ctaStrength: number;
    audienceFit: number;
    brandTrust: number;
    formatFit: number;
  }
> = {
  AWARENESS: {
    stopPower: 0.28,
    hierarchy: 0.16,
    clarity: 0.14,
    valueProp: 0.08,
    ctaStrength: 0.04,
    audienceFit: 0.12,
    brandTrust: 0.13,
    formatFit: 0.05,
  },
  TRAFFIC: {
    stopPower: 0.22,
    hierarchy: 0.15,
    clarity: 0.18,
    valueProp: 0.14,
    ctaStrength: 0.13,
    audienceFit: 0.10,
    brandTrust: 0.04,
    formatFit: 0.04,
  },
  CONVERSION: {
    stopPower: 0.13,
    hierarchy: 0.11,
    clarity: 0.15,
    valueProp: 0.22,
    ctaStrength: 0.18,
    audienceFit: 0.13,
    brandTrust: 0.05,
    formatFit: 0.03,
  },
};

/**
 * Composite 종합 점수 산출
 */
export function calculateCompositeScore(
  axesScores: Record<keyof typeof OBJECTIVE_WEIGHTS.AWARENESS, number>,
  objective: Objective
): number {
  const weights = OBJECTIVE_WEIGHTS[objective];
  let sum = 0;
  for (const key of Object.keys(weights) as (keyof typeof weights)[]) {
    sum += axesScores[key] * weights[key];
  }
  return Math.round(sum * 10) / 10;
}

/**
 * Gemini 시스템 프롬프트 생성
 */
export function buildScoringSystemPrompt(
  context: EvaluationContext,
  payload: CreativePayload
): string {
  return `당신은 퍼포먼스 마케팅 광고 소재 전문가이자 매체 심의 위원입니다.
제공된 광고 이미지 및 카피 텍스트를 바탕으로 8개 축에 대해 엄격히 독립 채점하세요.

[캠페인 컨텍스트]
- 매체: ${context.media}
- 지면: ${context.placement}
- 업종: ${context.industry}
- 캠페인 목표: ${context.objective}
- 타겟 페르소나: ${context.targetSummary}

[광고 소재 텍스트]
- 헤드라인: "${payload.headline}"
- 본문 카피: "${payload.bodyText}"
- CTA 버튼: "${payload.ctaText}"

[채점 절대 기준 - 점수 인플레이션 엄금]
1. **50점은 이 업종·이 매체의 평균적인 소재 기준점입니다.**
2. 대부분의 정상적인 광고 소재는 **35점 ~ 65점 사이**에 분포합니다.
3. 85점 이상은 상위 5% 이내의 독창적이고 압도적인 성과가 검증될 소재에만여 부여하세요.
4. evidence에는 추상적인 칭찬("멋짐", "매력적임")을 금지하며, 이미지와 카피에서 **직접 관찰 가능한 요소**(폰트 크기, 대비, 문자 수, 구도, 색상, 모델 시선 등)만 객관적으로 서술하세요.
5. suggestion은 즉시 수정 실행이 가능한 1개 문장의 지침을 제공하세요.
6. A/B안 비교를 의식하지 말고 오직 전달된 단일 소재 자체의 질만 독립 평가하세요.`;
}
