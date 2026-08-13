import { createPrng, sampleBeta, sampleStandardNormal, sigmoid, logit } from "./math";
import { Media, BaselineSource, getPriorSampleWeight } from "../benchmarks/seed";
import { calculateLogitPerformance, calculateScoreStdDevLogit } from "./transform";

export interface CreativeInput {
  label: string; // "A" | "B" | "C" | "D"
  score: number; // 0 ~ 100 composite score
  scoreStdDev?: number; // default 8.0
}

export interface MonteCarloConfig {
  media: Media;
  baselineCtr: number;
  baselineCvr: number;
  baselineCpmKrw: number;
  baselineSource: BaselineSource;
  isEstimatedBenchmark: boolean;
  dailyBudgetKrw: number;
  plannedDays: number;
  deltaCtr?: number;
  deltaCvr?: number;
  betaOverrideCtr?: number;
  betaOverrideCvr?: number;
  iterations?: number; // default 50,000
  seed?: string; // default "adlab-sim-seed"
}

export interface CreativeResultSummary {
  label: string;
  score: number;
  scoreStdDev: number;
  ctrMedian: number;
  ctrCi80: [number, number];
  ctrCi95: [number, number];
  cvrMedian: number;
  cvrCi80: [number, number];
  cvrCi95: [number, number];
  cpaMedian: number;
  expectedClicks: number;
  winProbability: number;
}

export interface SimulationOutput {
  perCreative: CreativeResultSummary[];
  winnerLabel: string;
  winProbability: number;
  liftMedian: number;
  liftCi80: [number, number];
  liftCi95: [number, number];
  expectedLoss: Record<string, number>;
  iterations: number;
  posteriorLiftSamples: number[]; // 히스토그램 차트용 렌더링 시드샘플
}

/**
 * Stage 4 베이지안 몬테카를로 시뮬레이션 (공유 베이스라인 구조)
 */
export function runMonteCarloSimulation(
  creatives: CreativeInput[],
  config: MonteCarloConfig
): SimulationOutput {
  const N = config.iterations ?? 50000;
  const prng = createPrng(config.seed ?? "adlab-sim-seed-v1");

  const kappa0 = getPriorSampleWeight(config.baselineSource, config.isEstimatedBenchmark);
  const alpha0_ctr = kappa0 * config.baselineCtr;
  const beta0_ctr = kappa0 * (1 - config.baselineCtr);

  const alpha0_cvr = kappa0 * config.baselineCvr;
  const beta0_cvr = kappa0 * (1 - config.baselineCvr);

  const deltaCtr = config.deltaCtr ?? 0;
  const deltaCvr = config.deltaCvr ?? 0;

  // 각 소재별 logit 성과 및 채점 불확실성 산출
  const armParams = creatives.map((c) => {
    const stdDev = c.scoreStdDev ?? 8.0;
    const perf = calculateLogitPerformance(
      c.score,
      config.baselineCtr,
      config.baselineCvr,
      config.media,
      deltaCtr,
      deltaCvr,
      config.betaOverrideCtr,
      config.betaOverrideCvr
    );
    const sigmaCtr = calculateScoreStdDevLogit(stdDev, perf.betaCtr);
    const sigmaCvr = calculateScoreStdDevLogit(stdDev, perf.betaCvr);

    return {
      label: c.label,
      score: c.score,
      scoreStdDev: stdDev,
      betaCtr: perf.betaCtr,
      betaCvr: perf.betaCvr,
      sigmaCtr,
      sigmaCvr,
    };
  });

  const numArms = armParams.length;
  const ctrSamples: number[][] = Array.from({ length: numArms }, () => new Array(N));
  const cvrSamples: number[][] = Array.from({ length: numArms }, () => new Array(N));
  const cpaSamples: number[][] = Array.from({ length: numArms }, () => new Array(N));

  const winCounts = new Array(numArms).fill(0);
  const totalSpend = config.dailyBudgetKrw * config.plannedDays;

  // 몬테카를로 N회 반복
  for (let k = 0; k < N; k++) {
    // 1. 공유 베이스라인 샘플링
    const p0_k = sampleBeta(alpha0_ctr, beta0_ctr, prng);
    const q0_k = sampleBeta(alpha0_cvr, beta0_cvr, prng);

    const logit_p0_k = logit(p0_k);
    const logit_q0_k = logit(q0_k);

    let maxCtr = -1;
    let winnerIndex = 0;

    // 2. 소재별 독립 채점 오차 주입
    for (let i = 0; i < numArms; i++) {
      const arm = armParams[i];

      const epsCtr = sampleStandardNormal(prng) * arm.sigmaCtr;
      const epsCvr = sampleStandardNormal(prng) * arm.sigmaCvr;

      const scoreNorm = (arm.score - 50) / 50;

      const ctr_ik = sigmoid(logit_p0_k + arm.betaCtr * scoreNorm + deltaCtr + epsCtr);
      const cvr_ik = sigmoid(logit_q0_k + arm.betaCvr * scoreNorm + deltaCvr + epsCvr);

      ctrSamples[i][k] = ctr_ik;
      cvrSamples[i][k] = cvr_ik;

      const cpa_ik = config.baselineCpmKrw / (1000 * Math.max(1e-9, ctr_ik * cvr_ik));
      cpaSamples[i][k] = cpa_ik;

      if (ctr_ik > maxCtr) {
        maxCtr = ctr_ik;
        winnerIndex = i;
      }
    }

    winCounts[winnerIndex]++;
  }

  // 승자 판정
  let winnerArmIndex = 0;
  let maxWinProb = -1;
  for (let i = 0; i < numArms; i++) {
    const winProb = winCounts[i] / N;
    if (winProb > maxWinProb) {
      maxWinProb = winProb;
      winnerArmIndex = i;
    }
  }

  // 상대 리프트 및 상대 기대손실 계산 (A/B 기준 또는 1위 vs 2위 기준)
  const runnerUpIndex = winnerArmIndex === 0 ? 1 : 0;
  const liftSamples = new Array(N);

  const lossSum: number[] = new Array(numArms).fill(0);

  for (let k = 0; k < N; k++) {
    const winnerCtr = ctrSamples[winnerArmIndex][k];
    const runnerCtr = ctrSamples[runnerUpIndex][k];
    liftSamples[k] = (winnerCtr - runnerCtr) / runnerCtr;

    // 기대손실 calculation: EL(choice_i) = (1/N) * sum( max(max_j(ctr_jk) - ctr_ik, 0) / max_j(ctr_jk) )
    let maxIterCtr = 0;
    for (let j = 0; j < numArms; j++) {
      if (ctrSamples[j][k] > maxIterCtr) maxIterCtr = ctrSamples[j][k];
    }
    for (let i = 0; i < numArms; i++) {
      const regret = (maxIterCtr - ctrSamples[i][k]) / maxIterCtr;
      lossSum[i] += Math.max(0, regret);
    }
  }

  const expectedLoss: Record<string, number> = {};
  for (let i = 0; i < numArms; i++) {
    expectedLoss[armParams[i].label] = lossSum[i] / N;
  }

  // 분위수 백센타일 계산 유틸리티
  const quantile = (arr: number[], q: number) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    }
    return sorted[base];
  };

  const perCreative: CreativeResultSummary[] = armParams.map((arm, i) => {
    const ctrMed = quantile(ctrSamples[i], 0.5);
    const ctr80Low = quantile(ctrSamples[i], 0.1);
    const ctr80High = quantile(ctrSamples[i], 0.9);
    const ctr95Low = quantile(ctrSamples[i], 0.025);
    const ctr95High = quantile(ctrSamples[i], 0.975);

    const cvrMed = quantile(cvrSamples[i], 0.5);
    const cvr80Low = quantile(cvrSamples[i], 0.1);
    const cvr80High = quantile(cvrSamples[i], 0.9);
    const cvr95Low = quantile(cvrSamples[i], 0.025);
    const cvr95High = quantile(cvrSamples[i], 0.975);

    const cpaMed = quantile(cpaSamples[i], 0.5);

    const impressions = (totalSpend / config.baselineCpmKrw) * 1000;
    const expectedClicks = Math.round(impressions * ctrMed);

    return {
      label: arm.label,
      score: arm.score,
      scoreStdDev: arm.scoreStdDev,
      ctrMedian: ctrMed,
      ctrCi80: [ctr80Low, ctr80High],
      ctrCi95: [ctr95Low, ctr95High],
      cvrMedian: cvrMed,
      cvrCi80: [cvr80Low, cvr80High],
      cvrCi95: [cvr95Low, cvr95High],
      cpaMedian: Math.round(cpaMed),
      expectedClicks,
      winProbability: winCounts[i] / N,
    };
  });

  // 차트 렌더링용 샘플 다운샘플링 (1,000개)
  const posteriorLiftSamples: number[] = [];
  const step = Math.max(1, Math.floor(N / 1000));
  for (let i = 0; i < N; i += step) {
    posteriorLiftSamples.push(liftSamples[i]);
  }

  return {
    perCreative,
    winnerLabel: armParams[winnerArmIndex].label,
    winProbability: maxWinProb,
    liftMedian: quantile(liftSamples, 0.5),
    liftCi80: [quantile(liftSamples, 0.1), quantile(liftSamples, 0.9)],
    liftCi95: [quantile(liftSamples, 0.025), quantile(liftSamples, 0.975)],
    expectedLoss,
    iterations: N,
    posteriorLiftSamples,
  };
}
