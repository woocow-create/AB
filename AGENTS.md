# AGENTS.md — AdLab Simulator

## 이 프로젝트가 뭔가
광고 소재(이미지 + 카피) A안과 B안을 넣으면, **실제로 매체에 집행하기 전에**
어느 쪽이 이길지, 얼마나 이길지, 그리고 "그 차이를 실제 테스트로 검증하려면
돈과 시간이 얼마나 드는지"를 계산해주는 사전 시뮬레이터.

사용자는 디지털 광고대행사의 퍼포먼스 마케터이며, 이 화면을 **광고주 앞에서 시연**한다.

## 절대 원칙 (어길 시 작업 되돌리기)

1. **예측을 실측으로 위장하지 않는다.** 모든 수치에는 신뢰구간과 "예측치" 표기가 붙는다.
   근거 없는 단정("B안이 32% 더 좋습니다")은 금지. 반드시 "B안 우세 확률 87%,
   예상 리프트 +12%~+51%" 형태.
2. **통계 로직은 순수 함수 + 단위테스트.** `lib/stats/` 안의 모든 함수는
   React·DB·API를 모르는 순수 TypeScript이며 Vitest 테스트가 반드시 동반된다.
   테스트 없는 통계 함수는 머지하지 않는다.
3. **하드코딩된 가짜 결과 금지.** 데모용 더미 데이터가 필요하면 `lib/fixtures/`에
   두고 파일명에 `.fixture.ts`를 붙여 실제 계산 경로와 명확히 분리한다.
4. **한국어 UI.** 모든 사용자 대면 문자열은 한국어. 마케팅 실무 용어를 쓴다
   (전환율, 노출, 지면, 소재, 유의성). 영어 직역체 금지.
5. **차트에 이중 축(dual y-axis) 금지.** 단위가 다른 두 지표는 차트를 나눈다.

## 기술 스택 (임의 변경 금지)
- Next.js 15 (App Router) + TypeScript strict
- Tailwind CSS v4 + shadcn/ui
- Prisma + SQLite (개발) / PostgreSQL (배포)
- Google Gemini API — `@google/genai` 패키지, structured output(responseSchema) 사용
- 차트: Recharts
- 애니메이션: motion (framer-motion v11+)
- 테스트: Vitest (단위) + Playwright (E2E)
- 폰트: Pretendard Variable

## 디렉토리 규칙
```
app/                 라우트. 서버 컴포넌트 기본, 'use client'는 필요한 잎사귀에만
components/ui/       shadcn 원본
components/          도메인 컴포넌트
lib/stats/           순수 통계 함수 (외부 의존성 0). 반드시 .test.ts 동반
lib/scoring/         Gemini 프롬프트 + 스키마 + 파서
lib/benchmarks/      매체·업종 벤치마크 시드 데이터
lib/types/           공용 타입
prisma/              스키마 + 시드
docs/                PRD, 방법론 문서
```

## 코딩 규칙
- 모든 금액은 **정수 KRW**로 저장·계산. 부동소수 금액 금지.
- 확률·비율은 0~1 실수로 저장하고, **표시할 때만** 퍼센트로 변환한다.
- CTR/CVR은 화면에서 소수점 2자리, 금액은 3자리 콤마 + 원, 확률은 정수 %.
- `any` 금지. Gemini 응답도 Zod로 파싱 검증.
- 에러는 삼키지 말 것. Gemini 호출 실패 시 사용자에게 명시적으로 알린다.

## 검증 명령어
- `npm run test` — Vitest 단위 테스트
- `npm run test:e2e` — Playwright
- `npm run lint && npx tsc --noEmit` — 타입·린트
작업 완료 선언 전에 위 3개를 모두 통과시킬 것.

## 하지 말 것
- 실제 매체 광고 API(Meta Marketing API, 네이버 검색광고 API 등) 연동 — 범위 밖
- 이모지 사용
- 글래스모피즘, 무지개 그라디언트, 과한 그림자
- 로딩 중 화면에 스켈레톤 없이 스피너만 띄우기
- README를 요청하지 않았는데 만들기
