"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { useState } from "react";

// ── 타입 정의 ────────────────────────────────────────────────────────────────

interface AxeScore {
  score: number;
  evidence: string;
  suggestion: string;
}

interface CreativeScore {
  id: string;
  stopPower: number;
  hierarchy: number;
  clarity: number;
  valueProp: number;
  ctaStrength: number;
  audienceFit: number;
  brandTrust: number;
  formatFit: number;
  composite: number;
  scoreStdDev: number;
  modelConfidence: number;
  rationale: any;
  policyRisks: any;
}

interface Creative {
  id: string;
  label: string;
  imageUrl: string;
  headline: string;
  bodyText: string;
  ctaText: string;
  score: CreativeScore | null;
}

interface PerCreative {
  label: string;
  ctrMedian: number;
  ctrCi80: [number, number];
  ctrCi95: [number, number];
  cvrMedian: number;
  cpaMedian: number;
  expectedClicks: number;
  expectedLoss: number;
  winProbability: number;
}

interface SimResult {
  perCreative: any; // JSON string
  winnerLabel: string;
  winProbability: number;
  liftMedian: number;
  liftCi95: any;
  expectedLoss: any;
  requiredImpressionsPerArm: number;
  requiredBudgetKrw: number;
  requiredDays: number;
  mdeRelative: number;
  testVerdict: "SKIP_TEST_SHIP_WINNER" | "RUN_TEST" | "INCONCLUSIVE_BY_DESIGN";
  confidenceGrade: string;
}

interface Sim {
  id: string;
  title: string;
  media: string;
  placement: string;
  industry: string;
  objective: string;
  targetSummary: string;
  dailyBudgetKrw: number;
  plannedDays: number;
  baselineCtr: number;
  baselineCvr: number;
  baselineCpmKrw: number;
  baselineSource: string;
  project: { name: string; industry: string };
  creatives: Creative[];
  result: SimResult | null;
}

interface Props {
  sim: Sim;
}

// ── 유틸 ────────────────────────────────────────────────────────────────────

function fmtPct(v: number, dp = 2) {
  return `${(v * 100).toFixed(dp)}%`;
}
function fmtKrw(v: number) {
  return `${v.toLocaleString("ko-KR")}원`;
}
function fmtPctInt(v: number) {
  return `${Math.round(v * 100)}%`;
}

const AXES_LABELS: Record<string, string> = {
  stopPower: "시선 정지력",
  hierarchy: "정보 위계",
  clarity: "메시지 명확성",
  valueProp: "가치 제안",
  ctaStrength: "CTA 강도",
  audienceFit: "타겟 적합성",
  brandTrust: "브랜드 신뢰",
  formatFit: "지면 적합성",
};

const VERDICT_CONFIG = {
  SKIP_TEST_SHIP_WINNER: {
    label: "테스트 불필요 — 바로 집행하세요",
    desc: "예측 신뢰도가 충분히 높아 실측 A/B 테스트 없이 승자 소재를 집행하는 것이 예산 효율상 유리합니다.",
    bg: "bg-[#0ca30c]/10 border-[#0ca30c]/30",
    text: "text-[#0ca30c]",
    dot: "#0ca30c",
  },
  RUN_TEST: {
    label: "실측 A/B 테스트 권장",
    desc: "예측 차이가 유의하나 신뢰도 확보를 위해 실제 매체 테스트를 권장합니다.",
    bg: "bg-amber-500/10 border-amber-500/30",
    text: "text-amber-600",
    dot: "#fab219",
  },
  INCONCLUSIVE_BY_DESIGN: {
    label: "이 예산으로는 결론이 나지 않습니다",
    desc: "현재 예산과 기간의 검출 한계(MDE)가 예측 차이보다 커서, 실측 테스트를 돌려도 유의미한 결론이 나오기 어렵습니다.",
    bg: "bg-red-500/10 border-red-500/30",
    text: "text-red-500",
    dot: "#d03b3b",
  },
};

const GRADE_COLOR: Record<string, string> = {
  A: "bg-[#0ca30c]/15 text-[#0ca30c]",
  B: "bg-amber-500/15 text-amber-600",
  C: "bg-orange-500/15 text-orange-600",
  D: "bg-red-500/15 text-red-500",
};

const CREATIVE_COLORS: Record<string, string> = {
  A: "var(--creative-a)",
  B: "var(--creative-b)",
  C: "var(--creative-c)",
  D: "#9b59b6",
};

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export function SimulationReport({ sim }: Props) {
  const [expandedAxe, setExpandedAxe] = useState<string | null>(null);
  const [showActualInput, setShowActualInput] = useState(false);

  if (!sim.result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--page)]">
        <div className="text-center p-12 space-y-4">
          <div className="text-4xl">⏳</div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">분석 결과 없음</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            시뮬레이션이 아직 실행되지 않았거나 오류가 발생했습니다.
          </p>
          <a
            href={`/simulations/new?step=4`}
            className="inline-block px-4 py-2 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] rounded-lg text-sm font-semibold"
          >
            다시 실행하기
          </a>
        </div>
      </div>
    );
  }

  const result = sim.result;
  const perCreative: PerCreative[] =
    typeof result.perCreative === "string"
      ? JSON.parse(result.perCreative)
      : result.perCreative;
  const liftCi95: [number, number] =
    typeof result.liftCi95 === "string"
      ? JSON.parse(result.liftCi95)
      : result.liftCi95;

  const winnerCreative = sim.creatives.find((c) => c.label === result.winnerLabel)!;
  const verdict = VERDICT_CONFIG[result.testVerdict];

  // 레이더 차트 데이터 생성
  const radarData = Object.keys(AXES_LABELS).map((key) => {
    const entry: Record<string, any> = { axis: AXES_LABELS[key] };
    sim.creatives.forEach((c) => {
      if (c.score) {
        entry[`score_${c.label}`] = (c.score as any)[key] ?? 50;
      }
    });
    return entry;
  });

  // 사후분포 오버레이 차트 데이터 (정규 근사)
  const densityPoints = 50;
  const posteriorData = Array.from({ length: densityPoints }, (_, i) => {
    const x = i / (densityPoints - 1);
    const point: Record<string, any> = { x: Math.round(x * 100) };
    perCreative.forEach((pc) => {
      const center = pc.ctrMedian;
      const range = pc.ctrCi95[1] - pc.ctrCi95[0];
      const sigma = range / 3.92;
      const density =
        (1 / (sigma * Math.sqrt(2 * Math.PI))) *
        Math.exp(-0.5 * Math.pow((x * 0.08 + center - 0.03 - center) / sigma, 2));
      point[`density_${pc.label}`] = Math.max(0, density * 0.004);
    });
    return point;
  });

  // 리프트 분포 히스토그램 데이터 (정규 근사)
  const liftHistData = Array.from({ length: 30 }, (_, i) => {
    const lift = liftCi95[0] + (i / 29) * (liftCi95[1] - liftCi95[0]);
    const center = result.liftMedian;
    const sigma = (liftCi95[1] - liftCi95[0]) / 4;
    const density =
      sigma > 0
        ? Math.exp(-0.5 * Math.pow((lift - center) / sigma, 2))
        : 0;
    return { lift: parseFloat((lift * 100).toFixed(2)), density };
  });

  return (
    <div className="min-h-screen bg-[var(--page)]">
      {/* ── 상단 고정 헤더 ── */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface-1)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              ← 대시보드
            </a>
            <span className="text-[var(--border)]">/</span>
            <span className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-xs">
              {sim.title}
            </span>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-medium border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors">
              공유 링크 복사
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] rounded-lg hover:opacity-90 transition-opacity">
              PDF 내보내기
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* ── 1. 판정 히어로 ── */}
        <section
          className={`rounded-2xl border p-8 ${verdict.bg}`}
        >
          {result.confidenceGrade === "D" && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-500 text-xs font-semibold">
              신뢰도 등급 D — 입력 정보 부족으로 예측 정확도가 낮습니다. 결과를 참고 수준으로만 사용하세요.
            </div>
          )}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className={`text-xs font-bold uppercase tracking-widest ${verdict.text}`}>
                판정
              </div>
              <h1 className={`text-2xl font-bold ${verdict.text}`}>{verdict.label}</h1>
              <p className="text-sm text-[var(--text-secondary)] max-w-xl">{verdict.desc}</p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`px-4 py-2 rounded-xl font-bold text-sm ${GRADE_COLOR[result.confidenceGrade] || GRADE_COLOR.C}`}
              >
                신뢰도 등급 {result.confidenceGrade}
              </div>
              <div className="text-right">
                <div className="text-xs text-[var(--text-muted)]">매체 / 지면</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {sim.media} · {sim.placement}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. 승자 카드 + 우세 확률 ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">
              예측 우세 소재
            </div>
            <div
              className="text-7xl font-bold tabular-nums"
              style={{ color: CREATIVE_COLORS[result.winnerLabel] || "var(--text-primary)" }}
            >
              {result.winnerLabel}
            </div>
            <div className="text-sm font-medium text-[var(--text-secondary)]">
              &quot;{winnerCreative?.headline || "소재 " + result.winnerLabel + "안"}&quot;
            </div>
          </div>

          <div className="md:col-span-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-6 flex flex-col justify-center space-y-4">
            <div className="text-xs text-[var(--text-muted)] font-semibold uppercase tracking-wider">
              {result.winnerLabel}안 우세 확률 (예측치)
            </div>
            <div className="text-6xl font-bold tabular-nums text-[var(--text-primary)]">
              {fmtPctInt(result.winProbability)}
            </div>
            <div className="w-full h-3 bg-[var(--surface-2)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.round(result.winProbability * 100)}%`,
                  backgroundColor: CREATIVE_COLORS[result.winnerLabel],
                }}
              />
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              예상 리프트 (CTR 중앙값 기준): 상대 +{fmtPctInt(result.liftMedian)} 
              &nbsp;·&nbsp; 95% 신용구간 [{fmtPctInt(liftCi95[0])}, {fmtPctInt(liftCi95[1])}]
            </div>
          </div>
        </section>

        {/* ── 3. KPI 타일 행 ── */}
        <section>
          <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">
            예상 성과 비교 (예측치)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {perCreative.map((pc) => {
              const color = CREATIVE_COLORS[pc.label] || "var(--text-primary)";
              const isWinner = pc.label === result.winnerLabel;
              return (
                <div
                  key={pc.label}
                  className={`bg-[var(--surface-1)] border rounded-xl p-4 space-y-3 ${isWinner ? "border-[var(--btn-primary-bg)]" : "border-[var(--border)]"}`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-bold"
                      style={{ color }}
                    >
                      소재 {pc.label}안
                    </span>
                    {isWinner && (
                      <span className="text-[10px] font-bold bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] px-1.5 py-0.5 rounded">
                        우세
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">CTR 중앙값</span>
                      <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                        {fmtPct(pc.ctrMedian)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">CVR 예측</span>
                      <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                        {fmtPct(pc.cvrMedian)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">예상 CPA</span>
                      <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                        {fmtKrw(Math.round(pc.cpaMedian))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">예상 클릭</span>
                      <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                        {Math.round(pc.expectedClicks).toLocaleString()}회
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. 리프트 분포 차트 ── */}
        <section className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-6 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                리프트 분포 (예측치)
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                50,000회 시뮬레이션 중 {fmtPctInt(result.winProbability)}에서 {result.winnerLabel}안이 앞섰습니다.
                음영 영역은 95% 신용구간입니다.
              </p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liftHistData} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="liftGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CREATIVE_COLORS[result.winnerLabel]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CREATIVE_COLORS[result.winnerLabel]} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--grid)" />
                <XAxis
                  dataKey="lift"
                  tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(v: number) => [v.toFixed(3), "밀도"]}
                  labelFormatter={(l) => `리프트 ${l}%`}
                  contentStyle={{
                    background: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <ReferenceLine x={0} stroke="var(--axis)" strokeWidth={2} label={{ value: "0%", position: "top", fontSize: 10 }} />
                <ReferenceLine
                  x={parseFloat((result.liftMedian * 100).toFixed(2))}
                  stroke={CREATIVE_COLORS[result.winnerLabel]}
                  strokeDasharray="4 2"
                />
                <Area
                  type="monotone"
                  dataKey="density"
                  stroke={CREATIVE_COLORS[result.winnerLabel]}
                  strokeWidth={2}
                  fill="url(#liftGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── 5. 실험 설계 패널 ── */}
        <section className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            실험 설계 계산기 (빈도주의, 예측치)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "안당 필요 노출수",
                value: result.requiredImpressionsPerArm.toLocaleString() + "회",
              },
              {
                label: "최소 필요 예산",
                value: fmtKrw(result.requiredBudgetKrw),
              },
              {
                label: "최소 필요 기간",
                value: result.requiredDays + "일",
              },
              {
                label: "현 예산 MDE",
                value: fmtPctInt(result.mdeRelative) + " (상대)",
              },
            ].map((tile) => (
              <div
                key={tile.label}
                className="bg-[var(--page)] border border-[var(--border)] rounded-xl p-4"
              >
                <div className="text-xs text-[var(--text-muted)] mb-1">{tile.label}</div>
                <div className="text-xl font-bold tabular-nums text-[var(--text-primary)]">
                  {tile.value}
                </div>
              </div>
            ))}
          </div>

          {/* 판정 근거 문장 */}
          <div className={`p-4 rounded-xl border text-sm ${verdict.bg}`}>
            <span className={`font-semibold ${verdict.text}`}>[{result.testVerdict}]&nbsp;</span>
            <span className="text-[var(--text-secondary)]">{verdict.desc}</span>
          </div>
        </section>

        {/* ── 6. 8축 레이더 차트 ── */}
        <section className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-[var(--text-primary)]">8축 소재 진단 (AI 평가)</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* 레이더 차트 */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--grid)" />
                  <PolarAngleAxis
                    dataKey="axis"
                    tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                  />
                  {sim.creatives.map((c) =>
                    c.score ? (
                      <Radar
                        key={c.label}
                        name={`소재 ${c.label}안`}
                        dataKey={`score_${c.label}`}
                        stroke={CREATIVE_COLORS[c.label]}
                        fill={CREATIVE_COLORS[c.label]}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    ) : null
                  )}
                  <Tooltip
                    formatter={(v: number) => [`${v}점 / 100점`, ""]}
                    contentStyle={{
                      background: "var(--surface-1)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* 축별 아코디언 */}
            <div className="space-y-2">
              {Object.entries(AXES_LABELS).map(([key, label]) => {
                const isOpen = expandedAxe === key;
                const scoresByCreative = sim.creatives
                  .filter((c) => c.score)
                  .map((c) => ({
                    label: c.label,
                    score: (c.score as any)[key] as number,
                    evidence: (() => {
                      try {
                        const r = typeof c.score!.rationale === "string"
                          ? JSON.parse(c.score!.rationale)
                          : c.score!.rationale;
                        return r?.[key]?.evidence || "";
                      } catch { return ""; }
                    })(),
                    suggestion: (() => {
                      try {
                        const r = typeof c.score!.rationale === "string"
                          ? JSON.parse(c.score!.rationale)
                          : c.score!.rationale;
                        return r?.[key]?.suggestion || "";
                      } catch { return ""; }
                    })(),
                  }));

                return (
                  <div key={key} className="border border-[var(--border)] rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedAxe(isOpen ? null : key)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-[var(--surface-2)] transition-colors"
                    >
                      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
                      <div className="flex items-center gap-3">
                        {scoresByCreative.map((sc) => (
                          <span
                            key={sc.label}
                            className="text-xs font-bold tabular-nums"
                            style={{ color: CREATIVE_COLORS[sc.label] }}
                          >
                            {sc.label}: {sc.score}
                          </span>
                        ))}
                        <span className="text-[var(--text-muted)] text-xs">
                          {isOpen ? "▲" : "▼"}
                        </span>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-2 space-y-3 bg-[var(--page)] border-t border-[var(--border)]">
                        {scoresByCreative.map((sc) => (
                          <div key={sc.label}>
                            <div
                              className="text-xs font-bold mb-1"
                              style={{ color: CREATIVE_COLORS[sc.label] }}
                            >
                              소재 {sc.label}안 ({sc.score}점)
                            </div>
                            <div className="w-full h-1.5 bg-[var(--surface-2)] rounded-full mb-1.5">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${sc.score}%`,
                                  backgroundColor: CREATIVE_COLORS[sc.label],
                                }}
                              />
                            </div>
                            {sc.evidence && (
                              <p className="text-xs text-[var(--text-secondary)]">
                                <span className="font-semibold">근거:</span> {sc.evidence}
                              </p>
                            )}
                            {sc.suggestion && (
                              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                <span className="font-semibold">개선:</span> {sc.suggestion}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 7. 정책 리스크 ── */}
        {sim.creatives.some((c) => {
          if (!c.score?.policyRisks) return false;
          try {
            const risks = typeof c.score.policyRisks === "string"
              ? JSON.parse(c.score.policyRisks)
              : c.score.policyRisks;
            return Array.isArray(risks) && risks.length > 0;
          } catch { return false; }
        }) && (
          <section className="bg-[var(--surface-1)] border border-amber-500/30 rounded-2xl p-6 space-y-3">
            <h2 className="text-base font-bold text-amber-600">정책 리스크 감지</h2>
            {sim.creatives.map((c) => {
              if (!c.score?.policyRisks) return null;
              let risks: any[] = [];
              try {
                risks = typeof c.score.policyRisks === "string"
                  ? JSON.parse(c.score.policyRisks)
                  : c.score.policyRisks;
              } catch { return null; }
              if (!Array.isArray(risks) || risks.length === 0) return null;
              return (
                <div key={c.id} className="space-y-2">
                  <div className="text-xs font-bold text-[var(--text-secondary)]">소재 {c.label}안</div>
                  {risks.map((risk: any, i: number) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-xs border ${
                        risk.severity === "BLOCK"
                          ? "bg-red-500/10 border-red-400/30 text-red-600"
                          : "bg-amber-500/10 border-amber-400/30 text-amber-700"
                      }`}
                    >
                      <span className="font-bold">[{risk.severity}]</span>{" "}
                      {risk.description || risk.rule || JSON.stringify(risk)}
                    </div>
                  ))}
                </div>
              );
            })}
          </section>
        )}

        {/* ── 8. 실측 결과 입력 (접이식) ── */}
        <section className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowActualInput(!showActualInput)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--surface-2)] transition-colors"
          >
            <div className="text-left">
              <div className="text-base font-bold text-[var(--text-primary)]">실측 결과 입력</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">
                집행 후 실제 성과를 입력하면 다음 예측 정확도가 향상됩니다.
              </div>
            </div>
            <span className="text-[var(--text-muted)] text-sm">{showActualInput ? "▲" : "▼"}</span>
          </button>
          {showActualInput && (
            <div className="border-t border-[var(--border)] p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sim.creatives.map((c) => (
                  <div key={c.id} className="space-y-3">
                    <div
                      className="text-sm font-bold"
                      style={{ color: CREATIVE_COLORS[c.label] }}
                    >
                      소재 {c.label}안 실측값
                    </div>
                    {[
                      { label: "실제 노출수", placeholder: "예: 152000" },
                      { label: "실제 클릭수", placeholder: "예: 2840" },
                      { label: "실제 전환수", placeholder: "예: 91" },
                      { label: "실제 소진액 (원)", placeholder: "예: 700000" },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">
                          {field.label}
                        </label>
                        <input
                          type="number"
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 bg-[var(--page)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] font-mono"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button className="px-5 py-2.5 bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] rounded-lg text-sm font-bold hover:opacity-90">
                  실측 데이터 저장 (캘리브레이션 반영)
                </button>
              </div>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
