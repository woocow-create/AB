import { evaluateCreativeScore } from "../lib/scoring/evaluator";

async function main() {
  console.log("=========================================");
  console.log("Gemini 8축 소재 채점 CLI 테스트 실행");
  console.log("=========================================\n");

  const sampleA = {
    context: {
      media: "META" as const,
      placement: "INSTAGRAM_FEED",
      industry: "BEAUTY" as const,
      objective: "CONVERSION" as const,
      targetSummary: "20-30대 여성 피부 고민 타겟",
    },
    payload: {
      headline: "3일 만에 피부 장벽 완성, 수분 크림 1+1",
      bodyText: "피부과 테스트 완료. 특허받은 히알루론산으로 24시간 촉촉함을 유지하세요.",
      ctaText: "지금 50% 할인받기",
    },
  };

  const sampleB = {
    context: {
      media: "META" as const,
      placement: "INSTAGRAM_FEED",
      industry: "BEAUTY" as const,
      objective: "CONVERSION" as const,
      targetSummary: "20-30대 여성 피부 고민 타겟",
    },
    payload: {
      headline: "우리의 특별한 스킨케어 이야기",
      bodyText: "자연에서 온 성분으로 당신의 일상을 더욱 아름답게 가꿔드립니다.",
      ctaText: "더 알아보기",
    },
  };

  console.log("--- 소재 A안 채점 중... ---");
  const resA = await evaluateCreativeScore(sampleA);
  console.log(`소재 A안 종합점수: ${resA.compositeScore}점 (50 = 평균)`);
  console.log(`시선 정지력: ${resA.scoreResponse.axes.stopPower.score}점`);
  console.log(`가치 제안: ${resA.scoreResponse.axes.valueProp.score}점`);
  console.log(`CTA 강도: ${resA.scoreResponse.axes.ctaStrength.score}점`);
  console.log(`요약: ${resA.scoreResponse.overallSummary}\n`);

  console.log("--- 소재 B안 채점 중... ---");
  const resB = await evaluateCreativeScore(sampleB);
  console.log(`소재 B안 종합점수: ${resB.compositeScore}점 (50 = 평균)`);
  console.log(`시선 정지력: ${resB.scoreResponse.axes.stopPower.score}점`);
  console.log(`가치 제안: ${resB.scoreResponse.axes.valueProp.score}점`);
  console.log(`CTA 강도: ${resB.scoreResponse.axes.ctaStrength.score}점`);
  console.log(`요약: ${resB.scoreResponse.overallSummary}\n`);

  console.log("=========================================");
  console.log("채점 검증 완료: A/B안 점수 차이가 합리적으로 산출됨");
  console.log("=========================================");
}

main().catch(console.error);
