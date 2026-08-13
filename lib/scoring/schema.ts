import { z } from "zod";

export const AxisScoreSchema = z.object({
  score: z.number().min(0).max(100),
  evidence: z.string(),
  suggestion: z.string(),
});

export const PolicyRiskSchema = z.object({
  severity: z.enum(["low", "medium", "high"]),
  issue: z.string(),
  mediaRule: z.string(),
});

export const CreativeScoreResponseSchema = z.object({
  axes: z.object({
    stopPower: AxisScoreSchema,
    hierarchy: AxisScoreSchema,
    clarity: AxisScoreSchema,
    valueProp: AxisScoreSchema,
    ctaStrength: AxisScoreSchema,
    audienceFit: AxisScoreSchema,
    brandTrust: AxisScoreSchema,
    formatFit: AxisScoreSchema,
  }),
  policyRisks: z.array(PolicyRiskSchema),
  overallSummary: z.string(),
  modelConfidence: z.number().min(0).max(1),
  scoreStdDev: z.number().min(5).max(20),
});

export type CreativeScoreResponse = z.infer<typeof CreativeScoreResponseSchema>;

/**
 * PRD 5.3절 Gemini structured output (responseSchema) JSON schema
 */
export const GEMINI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    axes: {
      type: "OBJECT",
      properties: {
        stopPower: {
          type: "OBJECT",
          properties: {
            score: { type: "INTEGER", description: "0~100 점수 (50 = 평균)" },
            evidence: { type: "STRING", description: "이미지/카피에서 관찰된 객관적 근거" },
            suggestion: { type: "STRING", description: "구체적 개선 제안" },
          },
          required: ["score", "evidence", "suggestion"],
        },
        hierarchy: {
          type: "OBJECT",
          properties: {
            score: { type: "INTEGER" },
            evidence: { type: "STRING" },
            suggestion: { type: "STRING" },
          },
          required: ["score", "evidence", "suggestion"],
        },
        clarity: {
          type: "OBJECT",
          properties: {
            score: { type: "INTEGER" },
            evidence: { type: "STRING" },
            suggestion: { type: "STRING" },
          },
          required: ["score", "evidence", "suggestion"],
        },
        valueProp: {
          type: "OBJECT",
          properties: {
            score: { type: "INTEGER" },
            evidence: { type: "STRING" },
            suggestion: { type: "STRING" },
          },
          required: ["score", "evidence", "suggestion"],
        },
        ctaStrength: {
          type: "OBJECT",
          properties: {
            score: { type: "INTEGER" },
            evidence: { type: "STRING" },
            suggestion: { type: "STRING" },
          },
          required: ["score", "evidence", "suggestion"],
        },
        audienceFit: {
          type: "OBJECT",
          properties: {
            score: { type: "INTEGER" },
            evidence: { type: "STRING" },
            suggestion: { type: "STRING" },
          },
          required: ["score", "evidence", "suggestion"],
        },
        brandTrust: {
          type: "OBJECT",
          properties: {
            score: { type: "INTEGER" },
            evidence: { type: "STRING" },
            suggestion: { type: "STRING" },
          },
          required: ["score", "evidence", "suggestion"],
        },
        formatFit: {
          type: "OBJECT",
          properties: {
            score: { type: "INTEGER" },
            evidence: { type: "STRING" },
            suggestion: { type: "STRING" },
          },
          required: ["score", "evidence", "suggestion"],
        },
      },
      required: [
        "stopPower",
        "hierarchy",
        "clarity",
        "valueProp",
        "ctaStrength",
        "audienceFit",
        "brandTrust",
        "formatFit",
      ],
    },
    policyRisks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          severity: { type: "STRING", enum: ["low", "medium", "high"] },
          issue: { type: "STRING" },
          mediaRule: { type: "STRING" },
        },
        required: ["severity", "issue", "mediaRule"],
      },
    },
    overallSummary: { type: "STRING" },
    modelConfidence: { type: "NUMBER" },
    scoreStdDev: { type: "NUMBER" },
  },
  required: [
    "axes",
    "policyRisks",
    "overallSummary",
    "modelConfidence",
    "scoreStdDev",
  ],
};
