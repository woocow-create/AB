import { describe, it, expect } from "vitest";
import { logit, sigmoid, normalCdf, normalQuantile } from "./math";
import { runMonteCarloSimulation } from "./monte-carlo";
import { calculateExperimentDesign } from "./experiment";
import { calculateCalibrationUpdate } from "./calibration";
import { calculateConfidenceGrade } from "./confidence";

describe("PRD 11절 단위 테스트 검증 케이스", () => {
  // 1. logit / sigmoid 왕복 변환 오차 < 1e-10
  it("1. logit/sigmoid 왕복 변환 오차가 1e-10 미만이어야 함", () => {
    const testValues = [0.001, 0.0149, 0.05, 0.2, 0.5, 0.8, 0.95, 0.999];
    for (const p of testValues) {
      const logitVal = logit(p);
      const recovered = sigmoid(logitVal);
      expect(Math.abs(recovered - p)).toBeLessThan(1e-10);
    }
  });

  // 2. 정규분포 CDF / 역함수 (z=1.96 -> 0.975)
  it("2. 정규분포 CDF 및 역함수 알려진 알려진 값 대조", () => {
    const cdf196 = normalCdf(1.959964);
    expect(cdf196).toBeCloseTo(0.975, 4);

    const quantile975 = normalQuantile(0.975);
    expect(quantile975).toBeCloseTo(1.959964, 3);
  });

  // 3. 표본수 계산 (p1=2%, p2=2.4%, alpha=.05, power=.8 -> n ~ 21,106/arm +-1%)
  it("3. 표본수 계산 결과가 21,106 (+-1%) 범위 내에 있어야 함", () => {
    const res = calculateExperimentDesign({
      p1CtrMedian: 0.02,
      p2CtrMedian: 0.024,
      dailyBudgetKrw: 100000,
      plannedDays: 14,
      cpmKrw: 10000,
      winProbability: 0.85,
      winnerLabel: "B",
      expectedLiftMedian: 0.2,
      confidenceGrade: "B",
    });

    const expected = 21106;
    const diffRatio = Math.abs(res.requiredImpressionsPerArm - expected) / expected;
    expect(diffRatio).toBeLessThan(0.01);
  });

  // 4. 몬테카를로 대칭성 (S_A = S_B 일 때 P(win) = 0.50 +- 0.01)
  it("4. S_A = S_B 일 때 P(win)이 0.50 +- 0.01 이어야 함", () => {
    const sim = runMonteCarloSimulation(
      [
        { label: "A", score: 50 },
        { label: "B", score: 50 },
      ],
      {
        media: "META",
        baselineCtr: 0.0149,
        baselineCvr: 0.0194,
        baselineCpmKrw: 14000,
        baselineSource: "PRESET",
        isEstimatedBenchmark: false,
        dailyBudgetKrw: 100000,
        plannedDays: 7,
        iterations: 50000,
        seed: "symmetry-test-seed",
      }
    );

    expect(sim.winProbability).toBeGreaterThanOrEqual(0.49);
    expect(sim.winProbability).toBeLessThanOrEqual(0.51);
  });

  // 5. 몬테카를로 단조성 (S_B를 올릴수록 P(win)이 단조 증가)
  it("5. S_B 점수를 올릴수록 P(win)이 단조 증가해야 함", () => {
    const scores = [50, 55, 60, 65, 70];
    let prevWinProb = 0;

    for (const scoreB of scores) {
      const sim = runMonteCarloSimulation(
        [
          { label: "A", score: 50 },
          { label: "B", score: scoreB },
        ],
        {
          media: "META",
          baselineCtr: 0.0149,
          baselineCvr: 0.0194,
          baselineCpmKrw: 14000,
          baselineSource: "PRESET",
          isEstimatedBenchmark: false,
          dailyBudgetKrw: 100000,
          plannedDays: 7,
          iterations: 10000,
          seed: `monotonic-seed-${scoreB}`,
        }
      );

      const winB = sim.perCreative.find((c) => c.label === "B")!.winProbability;
      expect(winB).toBeGreaterThanOrEqual(prevWinProb);
      prevWinProb = winB;
    }
  });

  // 6. 시드 재현성 (같은 입력 2회 실행 -> 완전히 동일한 결과)
  it("6. 동일한 시드로 실행 시 결과가 완전히 동일해야 함", () => {
    const config = {
      media: "META" as const,
      baselineCtr: 0.0149,
      baselineCvr: 0.0194,
      baselineCpmKrw: 14000,
      baselineSource: "PRESET" as const,
      isEstimatedBenchmark: false,
      dailyBudgetKrw: 100000,
      plannedDays: 7,
      iterations: 5000,
      seed: "fixed-reproducible-seed",
    };

    const run1 = runMonteCarloSimulation(
      [{ label: "A", score: 45 }, { label: "B", score: 62 }],
      config
    );
    const run2 = runMonteCarloSimulation(
      [{ label: "A", score: 45 }, { label: "B", score: 62 }],
      config
    );

    expect(run1.winnerLabel).toBe(run2.winnerLabel);
    expect(run1.winProbability).toBe(run2.winProbability);
    expect(run1.liftMedian).toBe(run2.liftMedian);
    expect(run1.perCreative[0].ctrMedian).toBe(run2.perCreative[0].ctrMedian);
  });

  // 7. 공유 베이스라인 검증 (절대 CTR의 95% 구간 폭 > 리프트의 95% 구간 폭)
  it("7. 공유 베이스라인 구조 검증: 절대 CTR 95% 구간 폭 > 상대 리프트 95% 구간 폭", () => {
    const sim = runMonteCarloSimulation(
      [
        { label: "A", score: 50 },
        { label: "B", score: 60 },
      ],
      {
        media: "META",
        baselineCtr: 0.0149,
        baselineCvr: 0.0194,
        baselineCpmKrw: 14000,
        baselineSource: "PRESET",
        isEstimatedBenchmark: true, // 추정 벤치마크 kappa0=800 적용하여 베이스라인 불확실성 반영
        dailyBudgetKrw: 100000,
        plannedDays: 7,
        iterations: 20000,
        seed: "shared-baseline-test",
      }
    );

    const creativeA = sim.perCreative.find((c) => c.label === "A")!;
    // 로그오즈 공간에서의 절대 CTR 95% 구간 폭
    const logitCtrWidthA = logit(creativeA.ctrCi95[1]) - logit(creativeA.ctrCi95[0]);
    // 상대 리프트의 95% 구간 폭 (로그 변환 기준)
    const logitLiftWidth = Math.log(1 + sim.liftCi95[1]) - Math.log(1 + Math.max(-0.9, sim.liftCi95[0]));

    // 베이스라인 오차가 두 안에 공통으로 작동하여 상쇄되므로 절대 CTR 분포 폭이 상대 리프트 분포 폭보다 넓음
    expect(logitCtrWidthA).toBeGreaterThan(logitLiftWidth);
  });

  // 8. 기대손실 부호 (승자의 기대손실 < 패자의 기대손실)
  it("8. 승자의 기대손실이 패자의 기대손실보다 작아야 함", () => {
    const sim = runMonteCarloSimulation(
      [
        { label: "A", score: 40 },
        { label: "B", score: 65 },
      ],
      {
        media: "META",
        baselineCtr: 0.0149,
        baselineCvr: 0.0194,
        baselineCpmKrw: 14000,
        baselineSource: "PRESET",
        isEstimatedBenchmark: false,
        dailyBudgetKrw: 100000,
        plannedDays: 7,
        iterations: 10000,
        seed: "expected-loss-seed",
      }
    );

    expect(sim.expectedLoss["B"]).toBeLessThan(sim.expectedLoss["A"]);
  });

  // 9. MDE 역산 일관성 (MDE로 계산한 리프트를 표본수 공식에 넣으면 원래 n이 나옴)
  it("9. MDE 역산 일관성 검증", () => {
    const p1 = 0.02;
    const dailyBudget = 100000;
    const plannedDays = 10;
    const cpm = 10000;

    const availableImpressionsPerArm = ((dailyBudget * plannedDays) / cpm * 1000) / 2;

    const design = calculateExperimentDesign({
      p1CtrMedian: p1,
      p2CtrMedian: p1 * 1.25,
      dailyBudgetKrw: dailyBudget,
      plannedDays: plannedDays,
      cpmKrw: cpm,
      winProbability: 0.85,
      winnerLabel: "B",
      expectedLiftMedian: 0.25,
      confidenceGrade: "A",
    });

    // MDE 상대 리프트로 p2_mde 생성
    const p2Mde = p1 * (1 + design.mdeRelative);

    const designMde = calculateExperimentDesign({
      p1CtrMedian: p1,
      p2CtrMedian: p2Mde,
      dailyBudgetKrw: dailyBudget,
      plannedDays: plannedDays,
      cpmKrw: cpm,
      winProbability: 0.85,
      winnerLabel: "B",
      expectedLiftMedian: design.mdeRelative,
      confidenceGrade: "A",
    });

    const diffRatio = Math.abs(designMde.requiredImpressionsPerArm - availableImpressionsPerArm) / availableImpressionsPerArm;
    expect(diffRatio).toBeLessThan(0.01);
  });

  // 10. 캘리브레이션 (실측 3건 입력 후 beta가 [0.3, 1.8] 범위 내에서 갱신됨)
  it("10. 캘리브레이션 3건 입력 후 beta가 [0.3, 1.8] 안에서 갱신되어야 함", () => {
    const history = [
      { score: 60, predictedCtr: 0.02, actualCtr: 0.025, p0: 0.015 },
      { score: 70, predictedCtr: 0.025, actualCtr: 0.032, p0: 0.015 },
      { score: 40, predictedCtr: 0.012, actualCtr: 0.011, p0: 0.015 },
    ];

    const result = calculateCalibrationUpdate(history, 1.10);
    expect(result.updatedBeta).toBeGreaterThanOrEqual(0.3);
    expect(result.updatedBeta).toBeLessThanOrEqual(1.8);
    expect(result.updatedBeta).not.toBe(1.10);
  });

  // 11. 신뢰도 등급 산정
  it("11. 신뢰도 등급 산정 조건 테스트", () => {
    const highGrade = calculateConfidenceGrade({
      baselineSource: "USER_ACCOUNT",
      isEstimatedBenchmark: false,
      modelConfidence: 0.9,
      calibrationCount: 6,
      isCreativeComplete: true,
    });
    expect(highGrade.grade).toBe("A");
    expect(highGrade.score).toBe(100);

    const lowGrade = calculateConfidenceGrade({
      baselineSource: "PRESET",
      isEstimatedBenchmark: true,
      modelConfidence: 0.5,
      calibrationCount: 0,
      isCreativeComplete: false,
    });
    expect(lowGrade.grade).toBe("D");
    expect(lowGrade.score).toBe(5);
  });
});
