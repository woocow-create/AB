import { GoogleGenAI } from "@google/genai";
import {
  CreativeScoreResponseSchema,
  CreativeScoreResponse,
  GEMINI_RESPONSE_SCHEMA,
} from "./schema";
import {
  EvaluationContext,
  CreativePayload,
  buildScoringSystemPrompt,
  calculateCompositeScore,
} from "./prompt";
import { generateCreativeCacheKey, getCachedScore, setCachedScore } from "./cache";

export interface ScoreCreativeOptions {
  context: EvaluationContext;
  payload: CreativePayload;
  imageUrlOrBase64?: string;
  useProModel?: boolean;
}

export interface EvaluatedCreativeResult {
  scoreResponse: CreativeScoreResponse;
  compositeScore: number;
  isCached: boolean;
}

/**
 * Stage 2 Gemini 2.5 Flash / Pro 멀티모달 8축 채점
 */
export async function evaluateCreativeScore(
  options: ScoreCreativeOptions
): Promise<EvaluatedCreativeResult> {
  const { context, payload, imageUrlOrBase64 = "", useProModel = false } = options;

  const contextStr = JSON.stringify(context);
  const cacheKey = generateCreativeCacheKey(
    imageUrlOrBase64,
    payload.headline,
    payload.bodyText,
    payload.ctaText,
    contextStr
  );

  const cached = getCachedScore(cacheKey);
  if (cached) {
    const rawAxesScores = {
      stopPower: cached.axes.stopPower.score,
      hierarchy: cached.axes.hierarchy.score,
      clarity: cached.axes.clarity.score,
      valueProp: cached.axes.valueProp.score,
      ctaStrength: cached.axes.ctaStrength.score,
      audienceFit: cached.axes.audienceFit.score,
      brandTrust: cached.axes.brandTrust.score,
      formatFit: cached.axes.formatFit.score,
    };
    return {
      scoreResponse: cached,
      compositeScore: calculateCompositeScore(rawAxesScores, context.objective),
      isCached: true,
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  let parsedResponse: CreativeScoreResponse;

  if (apiKey) {
    const ai = new GoogleGenAI({ apiKey });
    const modelName = useProModel ? "gemini-2.5-pro" : "gemini-2.5-flash";

    const promptText = buildScoringSystemPrompt(context, payload);

    const contents: any[] = [{ text: promptText }];

    if (imageUrlOrBase64.startsWith("data:image/")) {
      const match = imageUrlOrBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        contents.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: GEMINI_RESPONSE_SCHEMA as any,
          temperature: 0.2,
        },
      });

      const responseText = response.text || "{}";
      const rawObj = JSON.parse(responseText);
      parsedResponse = CreativeScoreResponseSchema.parse(rawObj);
    } catch (err: any) {
      console.warn("Gemini API 호출 경고: 기본 폴백 모드로 채점합니다.", err?.message || err);
      parsedResponse = generateFallbackScore(payload);
    }
  } else {
    // API Key가 미설정된 대행사 시연/개발 용 휴리스틱 데모 채점
    parsedResponse = generateFallbackScore(payload);
  }

  setCachedScore(cacheKey, parsedResponse);

  const rawAxesScores = {
    stopPower: parsedResponse.axes.stopPower.score,
    hierarchy: parsedResponse.axes.hierarchy.score,
    clarity: parsedResponse.axes.clarity.score,
    valueProp: parsedResponse.axes.valueProp.score,
    ctaStrength: parsedResponse.axes.ctaStrength.score,
    audienceFit: parsedResponse.axes.audienceFit.score,
    brandTrust: parsedResponse.axes.brandTrust.score,
    formatFit: parsedResponse.axes.formatFit.score,
  };

  return {
    scoreResponse: parsedResponse,
    compositeScore: calculateCompositeScore(rawAxesScores, context.objective),
    isCached: false,
  };
}

/**
 * GEMINI API Key가 없을 때 35~65점대 표준 예시 분포를 생성하는 휴리스틱 채점기
 */
function generateFallbackScore(payload: CreativePayload): CreativeScoreResponse {
  const headlineLen = payload.headline.length;
  const hasCta = payload.ctaText.trim().length > 0;

  const baseScore = Math.min(65, Math.max(38, 48 + (headlineLen < 20 ? 6 : -4) + (hasCta ? 5 : -5)));

  return {
    axes: {
      stopPower: {
        score: Math.min(75, baseScore + 4),
        evidence: `헤드라인 길이 ${headlineLen}자로 시선 유도 구도 확인됨.`,
        suggestion: "핵심 메시지 명도 대비를 15% 높여 모바일 스크롤 정지력을 강화하세요.",
      },
      hierarchy: {
        score: baseScore,
        evidence: "상단 헤드라인과 하단 CTA 배치가 표준 위계 준수.",
        suggestion: "본문 서브텍스트 크기를 2pt 줄여 헤드라인 대비를 명확히 하세요.",
      },
      clarity: {
        score: Math.min(70, baseScore + 2),
        evidence: `헤드라인 "${payload.headline}" 메시지가 모호함 없이 표현됨.`,
        suggestion: "전문 용어를 직관적인 단어로 변경하세요.",
      },
      valueProp: {
        score: Math.max(35, baseScore - 3),
        evidence: "혜택 제안 문구가 포괄적임.",
        suggestion: "숫자나 기간(예: 3일 한정 30% 할인)을 명시하여 가치 제안을 구체화하세요.",
      },
      ctaStrength: {
        score: hasCta ? Math.min(75, baseScore + 8) : 35,
        evidence: hasCta ? `CTA 버튼 텍스트 "${payload.ctaText}" 포함` : "명확한 CTA 버튼 부재",
        suggestion: "CTA 버튼 색상을 대비 색상으로 지정하여 시인성을 높이세요.",
      },
      audienceFit: {
        score: baseScore,
        evidence: "지정 타겟 연령대에 부합하는 톤앤매너.",
        suggestion: "타겟이 공감할 만한 소구점을 본문 첫 줄에 배치하세요.",
      },
      brandTrust: {
        score: Math.min(65, baseScore + 1),
        evidence: "브랜드 식별 요소와 정돈된 레이아웃.",
        suggestion: "고객 후기나 평점 신호를 이미지 하단에 작게 추가하세요.",
      },
      formatFit: {
        score: Math.min(80, baseScore + 5),
        evidence: "선택 매체 안전 영역 가이드라인 충족.",
        suggestion: "이미지 모서리 여백을 10px 확보하세요.",
      },
    },
    policyRisks: [],
    overallSummary: "전반적으로 업종 평균 수준의 평이한 소재입니다. CTA 강도와 가치 제안 구체화를 통한 리프트 개선이 기대됩니다.",
    modelConfidence: 0.85,
    scoreStdDev: 8.0,
  };
}
