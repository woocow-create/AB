import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { evaluateCreativeScore } from "@/lib/scoring/evaluator";
import { runMonteCarloSimulation } from "@/lib/stats/monte-carlo";
import { calculateExperimentDesign } from "@/lib/stats/experiment";
import { calculateConfidenceGrade } from "@/lib/stats/confidence";
import { getBenchmark } from "@/lib/benchmarks/seed";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sim = await prisma.simulation.findUnique({
      where: { id },
      include: {
        project: true,
        creatives: {
          include: { score: true },
        },
      },
    });

    if (!sim) {
      return NextResponse.json({ error: "시뮬레이션을 찾을 수 없습니다." }, { status: 404 });
    }

    const bm = getBenchmark(sim.media as any, sim.project.industry as any);
    const isEstimatedBenchmark = bm.isEstimated;

    // 1. Gemini 8축 채점 진행 (각 소재별 독립 분석)
    const evaluatedCreatives: { label: string; score: number; scoreStdDev: number; scoreResponse: any; creativeId: string }[] = [];

    for (const c of sim.creatives) {
      const evalRes = await evaluateCreativeScore({
        context: {
          media: sim.media as any,
          placement: sim.placement,
          industry: sim.project.industry as any,
          objective: sim.objective as any,
          targetSummary: sim.targetSummary,
        },
        payload: {
          headline: c.headline,
          bodyText: c.bodyText,
          ctaText: c.ctaText,
        },
        imageUrlOrBase64: c.imageUrl,
      });

      // CreativeScore 저장/업데이트
      await prisma.creativeScore.upsert({
        where: { creativeId: c.id },
        update: {
          stopPower: evalRes.scoreResponse.axes.stopPower.score,
          hierarchy: evalRes.scoreResponse.axes.hierarchy.score,
          clarity: evalRes.scoreResponse.axes.clarity.score,
          valueProp: evalRes.scoreResponse.axes.valueProp.score,
          ctaStrength: evalRes.scoreResponse.axes.ctaStrength.score,
          audienceFit: evalRes.scoreResponse.axes.audienceFit.score,
          brandTrust: evalRes.scoreResponse.axes.brandTrust.score,
          formatFit: evalRes.scoreResponse.axes.formatFit.score,
          composite: evalRes.compositeScore,
          scoreStdDev: evalRes.scoreResponse.scoreStdDev,
          modelConfidence: evalRes.scoreResponse.modelConfidence,
          rationale: JSON.stringify(evalRes.scoreResponse.axes),
          policyRisks: JSON.stringify(evalRes.scoreResponse.policyRisks),
          rawResponse: JSON.stringify(evalRes.scoreResponse),
        },
        create: {
          creativeId: c.id,
          stopPower: evalRes.scoreResponse.axes.stopPower.score,
          hierarchy: evalRes.scoreResponse.axes.hierarchy.score,
          clarity: evalRes.scoreResponse.axes.clarity.score,
          valueProp: evalRes.scoreResponse.axes.valueProp.score,
          ctaStrength: evalRes.scoreResponse.axes.ctaStrength.score,
          audienceFit: evalRes.scoreResponse.axes.audienceFit.score,
          brandTrust: evalRes.scoreResponse.axes.brandTrust.score,
          formatFit: evalRes.scoreResponse.axes.formatFit.score,
          composite: evalRes.compositeScore,
          scoreStdDev: evalRes.scoreResponse.scoreStdDev,
          modelConfidence: evalRes.scoreResponse.modelConfidence,
          rationale: JSON.stringify(evalRes.scoreResponse.axes),
          policyRisks: JSON.stringify(evalRes.scoreResponse.policyRisks),
          rawResponse: JSON.stringify(evalRes.scoreResponse),
        },
      });

      evaluatedCreatives.push({
        label: c.label,
        score: evalRes.compositeScore,
        scoreStdDev: evalRes.scoreResponse.scoreStdDev,
        scoreResponse: evalRes.scoreResponse,
        creativeId: c.id,
      });
    }

    // 2. 신뢰도 등급 계산
    const avgModelConfidence =
      evaluatedCreatives.reduce((acc, curr) => acc + curr.scoreResponse.modelConfidence, 0) /
      evaluatedCreatives.length;

    const confidenceRes = calculateConfidenceGrade({
      baselineSource: sim.baselineSource as any,
      isEstimatedBenchmark,
      modelConfidence: avgModelConfidence,
      calibrationCount: 0,
      isCreativeComplete: sim.creatives.every((c) => c.headline && c.ctaText),
    });

    // 3. Stage 4 베이지안 몬테카를로 시뮬레이션 (50,000회)
    const mcOutput = runMonteCarloSimulation(
      evaluatedCreatives.map((e) => ({
        label: e.label,
        score: e.score,
        scoreStdDev: e.scoreStdDev,
      })),
      {
        media: sim.media as any,
        baselineCtr: sim.baselineCtr,
        baselineCvr: sim.baselineCvr,
        baselineCpmKrw: sim.baselineCpmKrw,
        baselineSource: sim.baselineSource as any,
        isEstimatedBenchmark,
        dailyBudgetKrw: sim.dailyBudgetKrw,
        plannedDays: sim.plannedDays,
        iterations: 50000,
        seed: `sim-${sim.id}`,
      }
    );

    // 4. Stage 5 실험 설계 및 가치 판정
    const winnerSummary = mcOutput.perCreative.find((c) => c.label === mcOutput.winnerLabel)!;
    const runnerSummary = mcOutput.perCreative.find((c) => c.label !== mcOutput.winnerLabel) || mcOutput.perCreative[0];

    const expDesign = calculateExperimentDesign({
      p1CtrMedian: runnerSummary.ctrMedian,
      p2CtrMedian: winnerSummary.ctrMedian,
      dailyBudgetKrw: sim.dailyBudgetKrw,
      plannedDays: sim.plannedDays,
      cpmKrw: sim.baselineCpmKrw,
      numArms: sim.creatives.length,
      winProbability: mcOutput.winProbability,
      winnerLabel: mcOutput.winnerLabel,
      expectedLiftMedian: mcOutput.liftMedian,
      confidenceGrade: confidenceRes.grade,
    });

    // 5. SimulationResult 레코드 저장
    // experiment.ts가 MAX_SAFE_DB_INT(2,000,000,000) 이하로 클리핑을 보장하므로
    // Int 컬럼에 직접 저장 가능
    const resultRecord = await prisma.simulationResult.upsert({
      where: { simulationId: sim.id },
      update: {
        perCreative: JSON.stringify(mcOutput.perCreative),
        winnerLabel: mcOutput.winnerLabel,
        winProbability: mcOutput.winProbability,
        liftMedian: mcOutput.liftMedian,
        liftCi95: JSON.stringify(mcOutput.liftCi95),
        expectedLoss: JSON.stringify(mcOutput.expectedLoss),
        requiredImpressionsPerArm: expDesign.requiredImpressionsPerArm,
        requiredBudgetKrw: expDesign.requiredBudgetKrw,
        requiredDays: expDesign.requiredDays,
        mdeRelative: expDesign.mdeRelative,
        testVerdict: expDesign.testVerdict,
        confidenceGrade: confidenceRes.grade,
        engineVersion: "v1.0.0",
      },
      create: {
        simulationId: sim.id,
        perCreative: JSON.stringify(mcOutput.perCreative),
        winnerLabel: mcOutput.winnerLabel,
        winProbability: mcOutput.winProbability,
        liftMedian: mcOutput.liftMedian,
        liftCi95: JSON.stringify(mcOutput.liftCi95),
        expectedLoss: JSON.stringify(mcOutput.expectedLoss),
        requiredImpressionsPerArm: expDesign.requiredImpressionsPerArm,
        requiredBudgetKrw: expDesign.requiredBudgetKrw,
        requiredDays: expDesign.requiredDays,
        mdeRelative: expDesign.mdeRelative,
        testVerdict: expDesign.testVerdict,
        confidenceGrade: confidenceRes.grade,
        engineVersion: "v1.0.0",
      },
    });

    return NextResponse.json({
      simulationId: sim.id,
      result: resultRecord,
      mcOutput,
      expDesign,
      confidenceRes,
    });
  } catch (error: any) {
    console.error("Simulation run error:", error);
    return NextResponse.json({ error: error?.message || "시뮬레이션 실행 중 에러가 발생했습니다." }, { status: 500 });
  }
}
