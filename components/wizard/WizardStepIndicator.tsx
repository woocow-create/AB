"use client";

interface Step {
  id: number;
  label: string;
}

interface Props {
  steps: Step[];
  currentStep: number;
}

export function WizardStepIndicator({ steps, currentStep }: Props) {
  return (
    <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface-1)] px-6 py-12">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">새 시뮬레이션</h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">소재 예측 분석</p>
      </div>
      <nav className="space-y-1">
        {steps.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-[var(--page)] text-[var(--text-primary)] font-semibold"
                  : isCompleted
                  ? "text-[var(--text-secondary)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              <span
                className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                  isActive
                    ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]"
                    : isCompleted
                    ? "bg-[var(--status-good)] text-white"
                    : "border border-[var(--border)] text-[var(--text-muted)]"
                }`}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  step.id
                )}
              </span>
              <span className="text-sm">{step.label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
