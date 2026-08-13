"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { WizardStepIndicator } from "@/components/wizard/WizardStepIndicator";
import { Step1Campaign } from "@/components/wizard/Step1Campaign";
import { Step2Creatives } from "@/components/wizard/Step2Creatives";
import { Step3Review } from "@/components/wizard/Step3Review";
import { Step4Running } from "@/components/wizard/Step4Running";
import type { WizardFormData } from "@/components/wizard/types";

const STEPS = [
  { id: 1, label: "캠페인 설정" },
  { id: 2, label: "소재 등록" },
  { id: 3, label: "검토" },
  { id: 4, label: "분석 중" },
];

const DEFAULT_FORM: WizardFormData = {
  projectName: "",
  title: "",
  media: "META",
  placement: "INSTAGRAM_FEED",
  industry: "BEAUTY",
  objective: "CONVERSION",
  targetSummary: "",
  dailyBudgetKrw: 100000,
  plannedDays: 7,
  customCtr: undefined,
  customCvr: undefined,
  customCpmKrw: undefined,
  creatives: [
    { label: "A", headline: "", bodyText: "", ctaText: "", imageDataUrl: undefined },
    { label: "B", headline: "", bodyText: "", ctaText: "", imageDataUrl: undefined },
  ],
};

function NewSimulationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = parseInt(searchParams.get("step") || "1", 10);
  const currentStep = Math.max(1, Math.min(4, isNaN(stepParam) ? 1 : stepParam));

  const [form, setForm] = useState<WizardFormData>(DEFAULT_FORM);

  const goToStep = (step: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", step.toString());
    router.push(`/simulations/new?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[var(--page)]">
      <div className="max-w-7xl mx-auto flex min-h-screen">
        {/* 좌측 스텝 인디케이터 고정 */}
        <WizardStepIndicator steps={STEPS} currentStep={currentStep} />

        {/* 우측 본문 */}
        <main className="flex-1 px-8 py-12 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {currentStep === 1 && (
              <Step1Campaign
                form={form}
                onChange={(updates) => setForm((prev) => ({ ...prev, ...updates }))}
                onNext={() => goToStep(2)}
              />
            )}
            {currentStep === 2 && (
              <Step2Creatives
                form={form}
                onChange={(updates) => setForm((prev) => ({ ...prev, ...updates }))}
                onBack={() => goToStep(1)}
                onNext={() => goToStep(3)}
              />
            )}
            {currentStep === 3 && (
              <Step3Review
                form={form}
                onBack={() => goToStep(2)}
                onStart={() => goToStep(4)}
              />
            )}
            {currentStep === 4 && (
              <Step4Running
                form={form}
                onComplete={(id) => {
                  router.push(`/simulations/${id}`);
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function NewSimulationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--page)]" />}>
      <NewSimulationContent />
    </Suspense>
  );
}
