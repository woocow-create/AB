/**
 * PRD 5.2절 매체 및 업종별 벤치마크 시드 데이터
 */

export type Media =
  | "META"
  | "GOOGLE_SEARCH"
  | "GOOGLE_DISPLAY"
  | "YOUTUBE"
  | "NAVER_GFA"
  | "KAKAO_MOMENT";

export type Industry =
  | "FOOD_BEVERAGE"
  | "FASHION"
  | "BEAUTY"
  | "FITNESS"
  | "ECOMMERCE"
  | "TRAVEL"
  | "EDUCATION"
  | "AUTOMOBILE"
  | "HEALTHCARE"
  | "REAL_ESTATE"
  | "B2B_SAAS"
  | "FINANCE"
  | "ENTERTAINMENT"
  | "HOME_SERVICES"
  | "TECHNOLOGY"
  | "INSURANCE"
  | "LEGAL";

export type BaselineSource = "PRESET" | "USER_ACCOUNT";

export interface BenchmarkRecord {
  media: Media;
  industry: Industry;
  ctr: number; // 0 ~ 1
  cvr: number; // 0 ~ 1
  cpcUsd?: number;
  cpmUsd?: number;
  cpcKrw?: number;
  cpmKrw?: number;
  isEstimated: boolean;
}

export const USD_TO_KRW = 1350;

/**
 * Meta (페이스북/인스타그램) 벤치마크
 */
const META_BENCHMARKS: BenchmarkRecord[] = [
  { media: "META", industry: "FOOD_BEVERAGE", ctr: 0.0218, cvr: 0.0356, cpcUsd: 0.78, cpmUsd: 8.14, isEstimated: false },
  { media: "META", industry: "FASHION", ctr: 0.0191, cvr: 0.0324, cpcUsd: 0.89, cpmUsd: 9.23, isEstimated: false },
  { media: "META", industry: "BEAUTY", ctr: 0.0176, cvr: 0.0297, cpcUsd: 1.63, cpmUsd: 12.5, isEstimated: false },
  { media: "META", industry: "FITNESS", ctr: 0.0183, cvr: 0.0243, cpcUsd: 1.54, cpmUsd: 11.2, isEstimated: false },
  { media: "META", industry: "ECOMMERCE", ctr: 0.0149, cvr: 0.0281, cpcUsd: 1.35, cpmUsd: 10.42, isEstimated: true },
  { media: "META", industry: "TRAVEL", ctr: 0.0140, cvr: 0.0192, cpcUsd: 1.86, cpmUsd: 12.0, isEstimated: true },
  { media: "META", industry: "EDUCATION", ctr: 0.0130, cvr: 0.0164, cpcUsd: 2.18, cpmUsd: 14.0, isEstimated: true },
  { media: "META", industry: "AUTOMOBILE", ctr: 0.0125, cvr: 0.0128, cpcUsd: 2.08, cpmUsd: 13.5, isEstimated: true },
  { media: "META", industry: "HEALTHCARE", ctr: 0.0115, cvr: 0.0118, cpcUsd: 2.41, cpmUsd: 15.0, isEstimated: true },
  { media: "META", industry: "REAL_ESTATE", ctr: 0.0105, cvr: 0.0094, cpcUsd: 2.67, cpmUsd: 16.0, isEstimated: true },
  { media: "META", industry: "B2B_SAAS", ctr: 0.0078, cvr: 0.0071, cpcUsd: 2.94, cpmUsd: 16.41, isEstimated: false },
  { media: "META", industry: "FINANCE", ctr: 0.0094, cvr: 0.0088, cpcUsd: 3.89, cpmUsd: 18.56, isEstimated: false },
];

/**
 * Google 검색광고 벤치마크
 */
const GOOGLE_SEARCH_BENCHMARKS: BenchmarkRecord[] = [
  { media: "GOOGLE_SEARCH", industry: "ENTERTAINMENT", ctr: 0.0562, cvr: 0.0277, cpcUsd: 0.63, isEstimated: false },
  { media: "GOOGLE_SEARCH", industry: "TRAVEL", ctr: 0.0536, cvr: 0.0315, cpcUsd: 1.63, isEstimated: false },
  { media: "GOOGLE_SEARCH", industry: "AUTOMOBILE", ctr: 0.0468, cvr: 0.0798, cpcUsd: 2.46, isEstimated: false },
  { media: "GOOGLE_SEARCH", industry: "ECOMMERCE", ctr: 0.0382, cvr: 0.0309, cpcUsd: 1.16, isEstimated: false },
  { media: "GOOGLE_SEARCH", industry: "FINANCE", ctr: 0.0341, cvr: 0.0472, cpcUsd: 3.08, isEstimated: false },
  { media: "GOOGLE_SEARCH", industry: "HOME_SERVICES", ctr: 0.0328, cvr: 0.0507, cpcUsd: 5.21, isEstimated: false },
  { media: "GOOGLE_SEARCH", industry: "TECHNOLOGY", ctr: 0.0317, cvr: 0.0371, cpcUsd: 2.62, isEstimated: false },
  { media: "GOOGLE_SEARCH", industry: "B2B_SAAS", ctr: 0.0286, cvr: 0.0382, cpcUsd: 3.33, isEstimated: false },
  { media: "GOOGLE_SEARCH", industry: "INSURANCE", ctr: 0.0253, cvr: 0.0615, cpcUsd: 6.22, isEstimated: false },
  { media: "GOOGLE_SEARCH", industry: "LEGAL", ctr: 0.0231, cvr: 0.0531, cpcUsd: 6.75, isEstimated: false },
];

/**
 * Google 디스플레이(GDN) 벤치마크
 */
const GDN_BENCHMARKS: BenchmarkRecord[] = [
  { media: "GOOGLE_DISPLAY", industry: "ENTERTAINMENT", ctr: 0.0058, cvr: 0.0043, cpcUsd: 0.22, isEstimated: false },
  { media: "GOOGLE_DISPLAY", industry: "ECOMMERCE", ctr: 0.0051, cvr: 0.0048, cpcUsd: 0.28, isEstimated: false },
  { media: "GOOGLE_DISPLAY", industry: "INSURANCE", ctr: 0.0027, cvr: 0.0098, cpcUsd: 0.68, isEstimated: false },
  { media: "GOOGLE_DISPLAY", industry: "LEGAL", ctr: 0.0024, cvr: 0.0088, cpcUsd: 0.72, isEstimated: false },
];

export const BENCHMARK_SEEDS: BenchmarkRecord[] = [
  ...META_BENCHMARKS,
  ...GOOGLE_SEARCH_BENCHMARKS,
  ...GDN_BENCHMARKS,
];

/**
 * 업종/매체에 맞는 벤치마크 데이터 조회
 * GDN 기반 매체 계수 적용 (네이버 GFA: CTR x1.1 / CPC x1.35, 카카오: CTR x1.2 / CPC x0.85)
 */
export function getBenchmark(media: Media, industry: Industry): BenchmarkRecord {
  const exactMatch = BENCHMARK_SEEDS.find(
    (b) => b.media === media && b.industry === industry
  );

  if (exactMatch) {
    const cpmKrw = exactMatch.cpmUsd
      ? Math.round(exactMatch.cpmUsd * USD_TO_KRW)
      : Math.round(((exactMatch.ctr * (exactMatch.cpcUsd || 1.72)) / 1000) * USD_TO_KRW * 1000);
    return {
      ...exactMatch,
      cpmKrw,
      cpcKrw: exactMatch.cpcUsd ? Math.round(exactMatch.cpcUsd * USD_TO_KRW) : undefined,
    };
  }

  // GDN 기반 매체 계수 적용 (네이버 GFA, 카카오모먼트, YOUTUBE 등)
  const gdnBase = BENCHMARK_SEEDS.find((b) => b.media === "GOOGLE_DISPLAY" && b.industry === industry) || {
    media: "GOOGLE_DISPLAY" as Media,
    industry,
    ctr: 0.0039,
    cvr: 0.0072,
    cpcUsd: 0.44,
    isEstimated: true,
  };

  if (media === "NAVER_GFA") {
    return {
      media,
      industry,
      ctr: gdnBase.ctr * 1.1,
      cvr: gdnBase.cvr,
      cpcUsd: (gdnBase.cpcUsd || 0.44) * 1.35,
      cpmKrw: Math.round(gdnBase.ctr * 1.1 * (gdnBase.cpcUsd || 0.44) * 1.35 * USD_TO_KRW * 1000),
      isEstimated: true,
    };
  }

  if (media === "KAKAO_MOMENT") {
    return {
      media,
      industry,
      ctr: gdnBase.ctr * 1.2,
      cvr: gdnBase.cvr * 1.1,
      cpcUsd: (gdnBase.cpcUsd || 0.44) * 0.85,
      cpmKrw: Math.round(gdnBase.ctr * 1.2 * (gdnBase.cpcUsd || 0.44) * 0.85 * USD_TO_KRW * 1000),
      isEstimated: true,
    };
  }

  if (media === "YOUTUBE") {
    return {
      media,
      industry,
      ctr: 0.0065,
      cvr: 0.0150,
      cpcUsd: 0.65,
      cpmKrw: Math.round(0.0065 * 0.65 * USD_TO_KRW * 1000),
      isEstimated: true,
    };
  }

  // 기본 메타 평균값 리턴
  return {
    media,
    industry,
    ctr: 0.0149,
    cvr: 0.0194,
    cpcUsd: 1.72,
    cpmUsd: 11.54,
    cpmKrw: Math.round(11.54 * USD_TO_KRW),
    isEstimated: true,
  };
}

/**
 * 사전분포 불확실성 가중치 κ0 구하기
 * - USER_ACCOUNT: 12000 (가장 확신)
 * - PRESET (실측): 3000
 * - PRESET (추정): 800
 */
export function getPriorSampleWeight(source: BaselineSource, isEstimated: boolean): number {
  if (source === "USER_ACCOUNT") return 12000;
  if (!isEstimated) return 3000;
  return 800;
}
