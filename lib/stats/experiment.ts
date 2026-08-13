export type TestVerdict =
  | "SKIP_TEST_SHIP_WINNER"
  | "RUN_TEST"
  | "INCONCLUSIVE_BY_DESIGN";

export interface ExperimentDesignInput {
  p1CtrMedian: number;
  p2CtrMedian: number;
  dailyBudgetKrw: number;
  plannedDays: number;
  cpmKrw: number;
  numArms?: number; // default 2
  winProbability: number;
  winnerLabel: string;
  expectedLiftMedian: number;
  confidenceGrade: string; // "A" | "B" | "C" | "D"
}

export interface ExperimentDesignOutput {
  requiredImpressionsPerArm: number;
  requiredTotalImpressions: number;
  requiredBudgetKrw: number;
  requiredDays: number;
  mdeAbsolute: number;
  mdeRelative: number;
  testVerdict: TestVerdict;
  verdictRecommendationText: string;
  isRequiredUnconstrained: boolean; // 두 소재 차이가 너무 작아 결론 도출 불가 수준임을 표시
}

// DB Int 컬럼 안전 상한 (2,000,000,000 = 20억 — INT_MAX 이하)
const MAX_SAFE_DB_INT = 2_000_000_000;

/**
 * Stage 5 실험 설계 계산기 및 가치 판정
 *
 * 모든 금액·노출수는 정수 KRW / 정수 노출로 반환한다.
 * delta가 너무 작아 계산 불가 수준인 경우 MAX_SAFE_DB_INT로 클리핑하고
 * isRequiredUnconstrained = true를 반환한다.
 */
export function calculateExperimentDesign(
  input: ExperimentDesignInput
): ExperimentDesignOutput {
  const zAlpha = 1.959964; // alpha = 0.05 (two-tailed)
  const zBeta = 0.841621;  // power = 0.80

  const p1 = Math.max(1e-6, Math.min(1 - 1e-6, input.p1CtrMedian));
  const p2 = Math.max(1e-6, Math.min(1 - 1e-6, input.p2CtrMedian));
  const arms = input.numArms ?? 2;

  const delta = Math.abs(p2 - p1);

  // 두 소재 CTR 차이가 통계적으로 의미 없는 수준 (< 0.01%p)이면 결론 도출 불가
  const isRequiredUnconstrained = delta < 0.0001;

  let nPerArm: number;
  if (isRequiredUnconstrained) {
    // 사실상 무한대 — 의미 있는 표본 수 없음. MAX_SAFE로 클리핑
    nPerArm = MAX_SAFE_DB_INT;
  } else {
    const numerator = Math.pow(zAlpha + zBeta, 2) * (p1 * (1 - p1) + p2 * (1 - p2));
    const denominator = Math.pow(delta, 2);
    const rawN = Math.round(numerator / denominator);
    // 폭발 방지 클리핑
    nPerArm = Math.min(rawN, MAX_SAFE_DB_INT);
  }

  const requiredTotalImpressions = Math.min(nPerArm * arms, MAX_SAFE_DB_INT);
  const rawBudget = Math.round((requiredTotalImpressions / 1000) * input.cpmKrw);
  const requiredBudgetKrw = Math.min(rawBudget, MAX_SAFE_DB_INT);

  const dailyImpressions = (input.dailyBudgetKrw / input.cpmKrw) * 1000;
  const rawDays = Math.ceil(requiredTotalImpressions / Math.max(1, dailyImpressions));
  const requiredDays = Math.min(rawDays, 36500); // 최대 100년으로 클리핑

  // MDE 역방향 계산
  const currentTotalImpressions = (input.dailyBudgetKrw * input.plannedDays / input.cpmKrw) * 1000;
  const nAvailablePerArm = Math.max(1, currentTotalImpressions / arms);

  const K = Math.pow(zAlpha + zBeta, 2);
  const A = nAvailablePerArm + K;
  const B = -K * (1 - 2 * p1);
  const C = -K * 2 * p1 * (1 - p1);

  const discriminant = B * B - 4 * A * C;
  const mdeAbs = discriminant >= 0 ? (-B + Math.sqrt(discriminant)) / (2 * A) : 1;
  const mdeRel = mdeAbs / Math.max(1e-6, p1);

  // 테스트 가치 판정
  let verdict: TestVerdict;
  let recommendationText: string;

  const isGradeHigh = input.confidenceGrade === "A" || input.confidenceGrade === "B";

  if (input.winProbability >= 0.95 && isGradeHigh) {
    verdict = "SKIP_TEST_SHIP_WINNER";
    const savedBudget = Math.round((input.dailyBudgetKrw * input.plannedDays) * 0.5);
    recommendationText = `실측 A/B 테스트 없이 ${input.winnerLabel}안으로 바로 집행하세요. 테스트에 쓸 ${savedBudget.toLocaleString()}원을 승자 소재 증액에 쓰는 편이 낫습니다.`;
  } else if (!isRequiredUnconstrained && input.expectedLiftMedian >= mdeRel * 1.2 && input.winProbability < 0.95) {
    verdict = "RUN_TEST";
    recommendationText = `실측 테스트를 권장합니다. 최소 ${requiredDays}일 / ${requiredBudgetKrw.toLocaleString()}원이 필요하며, 이 조건이면 결론이 납니다.`;
  } else {
    verdict = "INCONCLUSIVE_BY_DESIGN";
    const mdeRelPct = Math.round(mdeRel * 100);
    const liftPct = Math.round(input.expectedLiftMedian * 100);
    if (isRequiredUnconstrained) {
      recommendationText = `두 소재의 예측 CTR 차이가 통계적으로 구분 불가 수준(${liftPct}% 미만)입니다. 어떤 예산으로도 실측 결론을 내기 어렵습니다. 더 차별화된 소재를 제작하세요.`;
    } else {
      recommendationText = `이 예산으로는 결론이 나지 않습니다. 현재 예산의 검출 한계는 상대 리프트 ${mdeRelPct}%인데, 두 안의 예상 차이는 ${liftPct}%에 불과합니다. 예산을 ${requiredBudgetKrw.toLocaleString()}원으로 늘리거나, 차이가 더 큰 소재를 새로 만드세요.`;
    }
  }

  return {
    requiredImpressionsPerArm: nPerArm,
    requiredTotalImpressions,
    requiredBudgetKrw,
    requiredDays,
    mdeAbsolute: mdeAbs,
    mdeRelative: mdeRel,
    testVerdict: verdict,
    verdictRecommendationText: recommendationText,
    isRequiredUnconstrained,
  };
}
