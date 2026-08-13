"use client";

import { useState } from "react";

export default function TokensPage() {
  const [isDark, setIsDark] = useState(true);

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-[var(--page)] text-[var(--text-primary)] p-8 transition-colors">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
            <div>
              <h1 className="text-2xl font-bold">AdLab Design System Tokens</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                PRD 7절 디자인 토큰 및 라이트/다크 테마 검증 페이지
              </p>
            </div>
            <button
              onClick={() => setIsDark(!isDark)}
              className="px-4 py-2 text-sm rounded-lg bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-medium cursor-pointer"
            >
              테마 전환: {isDark ? "Dark Mode" : "Light Mode"}
            </button>
          </div>

          {/* UI Chrome Colors */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold border-b border-[var(--border)] pb-2">
              1. UI Chrome Colors
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                <div className="text-xs text-[var(--text-muted)]">--surface-1</div>
                <div className="text-sm font-medium mt-1">Surface 1</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--page)] border border-[var(--border)]">
                <div className="text-xs text-[var(--text-muted)]">--page</div>
                <div className="text-sm font-medium mt-1">Page Background</div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                <div className="text-xs text-[var(--text-secondary)]">--text-secondary</div>
                <div className="text-sm font-medium mt-1 text-[var(--text-primary)]">
                  Primary Text
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                <div className="text-xs text-[var(--text-muted)]">--text-muted</div>
                <div className="text-sm font-medium mt-1 text-[var(--text-muted)]">
                  Muted Axis Text
                </div>
              </div>
            </div>
          </section>

          {/* Fixed Entity Colors */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold border-b border-[var(--border)] pb-2">
              2. Data Colors (소재 엔티티 고정)
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[var(--border)] space-y-2 bg-[var(--surface-1)]">
                <div className="h-10 rounded-md bg-[var(--creative-a)]"></div>
                <div className="text-sm font-bold">소재 A (Blue)</div>
                <div className="text-xs tabular-nums text-[var(--text-secondary)]">
                  CTR 2.45% | Lift +32.4%
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border)] space-y-2 bg-[var(--surface-1)]">
                <div className="h-10 rounded-md bg-[var(--creative-b)]"></div>
                <div className="text-sm font-bold">소재 B (Orange)</div>
                <div className="text-xs tabular-nums text-[var(--text-secondary)]">
                  CTR 1.85% | Lift +0.0%
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[var(--border)] space-y-2 bg-[var(--surface-1)]">
                <div className="h-10 rounded-md bg-[var(--creative-c)]"></div>
                <div className="text-sm font-bold">소재 C (Aqua)</div>
                <div className="text-xs tabular-nums text-[var(--text-secondary)]">
                  CTR 3.10% | Lift +67.5%
                </div>
              </div>
            </div>
          </section>

          {/* Status Indicators */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold border-b border-[var(--border)] pb-2">
              3. Status Colors & Verdict Badges
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-good)]"></span>
                <span className="text-[var(--status-good)]">Good / Skip Test</span>
              </div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-warning)]"></span>
                <span className="text-[var(--status-warning)]">Warning / Run Test</span>
              </div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-serious)]"></span>
                <span className="text-[var(--status-serious)]">Serious Risk</span>
              </div>
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-critical)]"></span>
                <span className="text-[var(--status-critical)]">Inconclusive</span>
              </div>
            </div>
          </section>

          {/* Primary Action Button */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold border-b border-[var(--border)] pb-2">
              4. Primary Action Button
            </h2>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
              <button className="px-6 py-3 rounded-lg bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-semibold shadow-xs transition-opacity hover:opacity-90">
                시뮬레이션 시작하기
              </button>
              <span className="text-xs text-[var(--text-secondary)]">
                주 액션 버튼은 near-black (#0b0b0b) / white (#ffffff) 솔리드 적용
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
