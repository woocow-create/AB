import Link from "next/link";

export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center border-b border-[var(--border)] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            AdLab Simulator
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            광고 소재 사전 A/B 시뮬레이션 및 테스트 가치 판정 엔진
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/_tokens"
            className="px-4 py-2 text-sm rounded-md border border-[var(--border)] hover:bg-[var(--surface-1)] transition-colors"
          >
            디자인 토큰 데모
          </Link>
          <Link
            href="/simulations/new"
            className="px-4 py-2 text-sm font-medium rounded-md bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 transition-opacity"
          >
            새 시뮬레이션
          </Link>
        </div>
      </div>

      <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">시스템 상태</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[var(--page)] border border-[var(--border)] space-y-1">
            <span className="text-xs text-[var(--text-muted)]">통계 예측 엔진</span>
            <div className="text-sm font-medium text-[var(--status-good)]">
              lib/stats v1.0 준비 완료
            </div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--page)] border border-[var(--border)] space-y-1">
            <span className="text-xs text-[var(--text-muted)]">Gemini 8축 분석</span>
            <div className="text-sm font-medium text-[var(--text-primary)]">
              gemini-2.5-flash 연동
            </div>
          </div>
          <div className="p-4 rounded-lg bg-[var(--page)] border border-[var(--border)] space-y-1">
            <span className="text-xs text-[var(--text-muted)]">실측 캘리브레이션</span>
            <div className="text-sm font-medium text-[var(--text-secondary)]">
              대시보드 상시 노출 준비
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
