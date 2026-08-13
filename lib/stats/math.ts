/**
 * 순수 수학 및 통계 기초 함수
 * - 외부 의존성 없음 (Pure TypeScript)
 */

/**
 * Logit 함수: log(p / (1 - p))
 * 0 < p < 1 범위 클리핑으로 수치적 안정성 확보
 */
export function logit(p: number): number {
  const eps = 1e-12;
  const clamped = Math.max(eps, Math.min(1 - eps, p));
  return Math.log(clamped / (1 - clamped));
}

/**
 * Sigmoid 함수: 1 / (1 + exp(-x))
 */
export function sigmoid(x: number): number {
  if (x >= 40) return 1 - 1e-15;
  if (x <= -40) return 1e-15;
  return 1 / (1 + Math.exp(-x));
}

/**
 * 표준 정규분포 CDF Φ(z)
 * Error function (erf) 근사 활용 (오차 < 1.5e-7)
 */
export function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/**
 * Error function 근사 (Abramowitz and Stegun 7.1.26)
 */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
}

/**
 * 표준 정규분포 역함수 Φ⁻¹(p) - Acklam 근사
 * (오차 < 1.15e-9)
 */
export function normalQuantile(p: number): number {
  if (p <= 0) return -8.0;
  if (p >= 1) return 8.0;

  // Coefficients in rational approximations
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239e0];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838e0, -2.549732539343734e0, 4.374664141464968e0, 2.938163982698783e0];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996e0, 3.754408661907416e0];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }

  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

/**
 * 시드 고정 난수 생성기 (Mulberry32)
 */
export function createPrng(seed: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  }

  return function () {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Standard Normal Sample N(0, 1) - Box-Muller 변환
 */
export function sampleStandardNormal(prng: () => number): number {
  let u1 = prng();
  let u2 = prng();
  while (u1 <= 1e-15) u1 = prng();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * Gamma 분포 샘플러 (Marsaglia and Tsang 2000)
 */
export function sampleGamma(alpha: number, beta: number = 1.0, prng: () => number): number {
  if (alpha < 1) {
    const u = prng();
    return sampleGamma(1 + alpha, beta, prng) * Math.pow(u, 1 / alpha);
  }

  const d = alpha - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  while (true) {
    const z = sampleStandardNormal(prng);
    const v = 1 + c * z;
    if (v <= 0) continue;

    const v3 = v * v * v;
    const u = prng();

    if (u < 1 - 0.0331 * z * z * z * z) {
      return (d * v3) / beta;
    }

    if (Math.log(u) < 0.5 * z * z + d * (1 - v3 + Math.log(v3))) {
      return (d * v3) / beta;
    }
  }
}

/**
 * Beta 분포 샘플러 Beta(α, β)
 * X ~ Gamma(α, 1), Y ~ Gamma(β, 1) => X / (X + Y) ~ Beta(α, β)
 */
export function sampleBeta(alpha: number, beta: number, prng: () => number): number {
  const x = sampleGamma(alpha, 1.0, prng);
  const y = sampleGamma(beta, 1.0, prng);
  if (x + y === 0) return 0.5;
  return x / (x + y);
}
