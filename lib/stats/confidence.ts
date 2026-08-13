import { BaselineSource } from "../benchmarks/seed";

export interface ConfidenceInput {
  baselineSource: BaselineSource;
  isEstimatedBenchmark: boolean;
  modelConfidence: number; // 0 ~ 1
  calibrationCount: number;
  isCreativeComplete: boolean;
}

export interface ConfidenceOutput {
  grade: "A" | "B" | "C" | "D";
  score: number;
  breakdown: {
    baselinePoints: number;
    modelConfidencePoints: number;
    calibrationPoints: number;
    completenessPoints: number;
  };
}

/**
 * Stage 6 신뢰도 등급 산정
 */
export function calculateConfidenceGrade(input: ConfidenceInput): ConfidenceOutput {
  let baselinePoints = 0;
  if (input.baselineSource === "USER_ACCOUNT") {
    baselinePoints = 30;
  } else if (!input.isEstimatedBenchmark) {
    baselinePoints = 10;
  } else {
    baselinePoints = 0;
  }

  let modelConfidencePoints = 5;
  if (input.modelConfidence >= 0.8) {
    modelConfidencePoints = 25;
  } else if (input.modelConfidence >= 0.6) {
    modelConfidencePoints = 15;
  }

  let calibrationPoints = 0;
  if (input.calibrationCount >= 5) {
    calibrationPoints = 25;
  } else if (input.calibrationCount >= 1) {
    calibrationPoints = 15;
  }

  const completenessPoints = input.isCreativeComplete ? 20 : 0;

  const totalScore = baselinePoints + modelConfidencePoints + calibrationPoints + completenessPoints;

  let grade: "A" | "B" | "C" | "D";
  if (totalScore >= 80) {
    grade = "A";
  } else if (totalScore >= 60) {
    grade = "B";
  } else if (totalScore >= 40) {
    grade = "C";
  } else {
    grade = "D";
  }

  return {
    grade,
    score: totalScore,
    breakdown: {
      baselinePoints,
      modelConfidencePoints,
      calibrationPoints,
      completenessPoints,
    },
  };
}
