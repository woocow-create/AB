import { logit } from "./math";

export interface ActualCalibrationInput {
  score: number; // S_i
  predictedCtr: number;
  actualCtr: number;
  p0: number; // baseline CTR
}

export interface CalibrationResult {
  deltaCtr: number;
  updatedBeta: number;
  mape: number; // Mean Absolute Percentage Error (%)
}

/**
 * Stage 7 캘리브레이션 보정항 및 β 계수 재추정
 */
export function calculateCalibrationUpdate(
  history: ActualCalibrationInput[],
  currentBeta: number
): CalibrationResult {
  if (history.length === 0) {
    return {
      deltaCtr: 0,
      updatedBeta: currentBeta,
      mape: 0,
    };
  }

  // 1. deltaCtr: median( logit(actualCTR_i) - logit(predictedCTR_i) )
  const diffs = history.map((item) => logit(item.actualCtr) - logit(item.predictedCtr));
  diffs.sort((a, b) => a - b);
  const mid = Math.floor(diffs.length / 2);
  const deltaCtr = diffs.length % 2 !== 0 ? diffs[mid] : (diffs[mid - 1] + diffs[mid]) / 2;

  // 2. β_new 최소제곱 추정 (데이터 >= 3)
  let updatedBeta = currentBeta;
  if (history.length >= 3) {
    let sumXY = 0;
    let sumX2 = 0;

    for (const item of history) {
      const x = (item.score - 50) / 50;
      const y = logit(item.actualCtr) - logit(item.p0);
      sumXY += x * y;
      sumX2 += x * x;
    }

    if (sumX2 > 1e-6) {
      const betaNew = sumXY / sumX2;
      const smoothed = 0.7 * currentBeta + 0.3 * betaNew;
      updatedBeta = Math.max(0.3, Math.min(1.8, smoothed));
    }
  }

  // 3. CTR MAPE 계산: (1/n) * sum( |actual - predicted| / actual ) * 100
  let totalErrorRatio = 0;
  for (const item of history) {
    const err = Math.abs(item.actualCtr - item.predictedCtr) / Math.max(1e-6, item.actualCtr);
    totalErrorRatio += err;
  }
  const mape = (totalErrorRatio / history.length) * 100;

  return {
    deltaCtr,
    updatedBeta,
    mape,
  };
}
