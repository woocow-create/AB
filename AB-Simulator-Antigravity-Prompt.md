# 광고 소재 A/B 테스트 시뮬레이터 — 안티그래비티 마스터 프롬프트

> 이 문서는 **그대로 복붙하는 프롬프트 모음**입니다.
> 안티그래비티는 "탐색 → 계획 → 실행" 워크플로우로 움직이고, 워크스페이스 루트의 `AGENTS.md`를 항상 참조합니다.
> 그래서 **한 번에 다 던지지 말고 아래 순서대로** 넣으세요.

---

## 투입 순서 (이대로 하세요)

| 단계 | 무엇을 | 어떻게 |
|---|---|---|
| **0** | 새 폴더 열고 안티그래비티 시작 | 빈 워크스페이스 |
| **1** | `AGENTS.md` 생성 | 아래 **PART A** 를 그대로 붙여넣고 "이 내용으로 워크스페이스 루트에 AGENTS.md를 만들어줘" |
| **2** | `docs/PRD.md` 생성 | 아래 **PART B** 전체를 붙여넣고 "이 내용으로 docs/PRD.md를 만들어줘. 아직 코드는 짜지 마." |
| **3** | 계획 요청 | `@docs/PRD.md 를 정독하고, Phase 0~2까지의 구현 계획(Implementation Plan)을 작성해줘. 코드는 아직 쓰지 마.` |
| **4** | 계획 리뷰 | 안티그래비티가 만든 Implementation Plan 아티팩트에 **코멘트로 수정 지시** → Proceed |
| **5** | Phase별 실행 | **PART C**의 Phase 프롬프트를 하나씩 순서대로 |
| **6** | 검증 | **PART D**의 검증 프롬프트 |

> **왜 이렇게 쪼개나:** 안티그래비티에 한 번에 전체 앱을 시키면 통계 엔진을 대충 만들고 UI만 예쁘게 뽑습니다. 이 앱은 **엔진이 곧 제품**이라 엔진부터 테스트 통과시킨 뒤 UI를 얹어야 광고주 앞에서 안 깨집니다.

---
---

# PART A — `AGENTS.md` (1단계)

```markdown
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
```

---
---

# PART B — `docs/PRD.md` 마스터 명세 (2단계)

아래 전체를 복붙하세요.

---

## 0. 한 문장 정의

**AdLab Simulator** — 광고 소재 A안/B안을 업로드하면, 매체에 집행하기 전에 승자와 승률을 예측하고, "이 테스트를 실제로 돌릴 가치가 있는지"까지 판정해주는 사전 시뮬레이터.

## 1. 해결하려는 문제

디지털 광고대행사는 소재 A/B 테스트를 매체에서 직접 돌린다. 이때 두 가지 낭비가 발생한다.

1. **돈 낭비** — 결국 지는 소재에도 예산의 절반이 들어간다.
2. **시간 낭비** — 통계적으로 유의한 결론이 나오려면 2~3주가 필요한데, 그 안에 캠페인이 끝나는 경우가 많다. 더 심각한 건, **애초에 예산이 부족해 어떤 결론도 나올 수 없는 테스트를 3주 동안 돌리는 경우**다.

이 앱의 진짜 가치는 "어느 게 이길지 맞히기"보다 **"이 테스트를 돌려야 하는가"를 사전에 판정**하는 데 있다. 이 판정이 제품의 핵심 차별점이며, 리포트에서 가장 눈에 띄는 자리에 놓인다.

## 2. 설계 철학 3원칙

| 원칙 | 의미 | 구현에 미치는 영향 |
|---|---|---|
| **정직한 불확실성** | 예측이 확실한 척하지 않는다 | 모든 수치에 신용구간. 신뢰도 등급 A~D 표기. |
| **의사결정 지향** | 숫자가 아니라 "그래서 뭘 해야 하나"를 준다 | 리포트 최상단은 차트가 아니라 **권고 문장** |
| **학습하는 시스템** | 실측 결과를 먹고 정확해진다 | 캘리브레이션 루프 필수. 예측 정확도(MAPE)를 대시보드에 노출 |

세 번째가 광고주 설득의 열쇠다. "저희 툴은 지금까지 47건 실측 대조에서 평균 오차 14%입니다"라고 말할 수 있어야 한다.

## 3. 도메인 용어집 (UI에 쓸 정확한 용어)

| 용어 | 정의 |
|---|---|
| 소재(Creative) | 이미지 1장 + 헤드라인 + 본문 + CTA 버튼 텍스트의 묶음 |
| 지면(Placement) | 인스타 피드, 인스타 릴스, 페북 피드, GDN 배너, 네이버 GFA 등 |
| 캠페인 목표 | 인지도 / 트래픽 / 전환 — 소재 평가 가중치를 바꾼다 |
| CTR | 클릭수 ÷ 노출수 |
| CVR | 전환수 ÷ 클릭수 |
| 소재 점수(Creative Score) | 8축 루브릭 종합 점수 0~100. **50 = 해당 업종·매체 평균 소재** |
| 우세 확률(P(win)) | 베이지안 사후분포에서 B안이 A안보다 나을 확률 |
| 기대손실(Expected Loss) | 그 안을 골랐을 때 잘못 골랐을 경우 잃는 성과의 기댓값 |
| MDE | 주어진 예산으로 통계적으로 검출 가능한 최소 리프트 |
| 테스트 가치 판정 | 예측 리프트와 MDE를 비교해 실측 테스트 필요 여부를 판정 |

## 4. 데이터 모델 (Prisma)

```prisma
model Project {
  id          String   @id @default(cuid())
  name        String            // 광고주명 또는 캠페인명
  industry    Industry
  createdAt   DateTime @default(now())
  simulations Simulation[]
}

model Simulation {
  id             String   @id @default(cuid())
  projectId      String
  project        Project  @relation(fields: [projectId], references: [id])
  title          String

  // 캠페인 컨텍스트
  media          Media             // META | GOOGLE_SEARCH | GOOGLE_DISPLAY | YOUTUBE | NAVER_GFA | KAKAO_MOMENT
  placement      Placement
  objective      Objective         // AWARENESS | TRAFFIC | CONVERSION
  targetSummary  String            // "25-34 여성, 뷰티 관심사"
  dailyBudgetKrw Int
  plannedDays    Int

  // 벤치마크 (사용자가 자기 계정 실적으로 덮어쓸 수 있음)
  baselineCtr    Float             // 0~1
  baselineCvr    Float
  baselineCpmKrw Int
  baselineSource BaselineSource    // PRESET | USER_ACCOUNT

  creatives      Creative[]
  result         SimulationResult?
  actual         ActualResult?
  createdAt      DateTime @default(now())
}

model Creative {
  id            String @id @default(cuid())
  simulationId  String
  simulation    Simulation @relation(fields: [simulationId], references: [id])
  label         String            // "A" | "B" | "C" | "D"
  imageUrl      String
  imageMeta     Json              // width, height, bytes, dominantColors
  headline      String
  bodyText      String
  ctaText       String

  score         CreativeScore?
}

model CreativeScore {
  id            String @id @default(cuid())
  creativeId    String @unique
  creative      Creative @relation(fields: [creativeId], references: [id])

  // 8축 (각 0~100)
  stopPower       Int   // 시선 정지력
  hierarchy       Int   // 시각적 위계
  clarity         Int   // 메시지 명확성
  valueProp       Int   // 가치 제안 강도
  ctaStrength     Int   // CTA 강도
  audienceFit     Int   // 타겟 적합성
  brandTrust      Int   // 브랜드 정합성·신뢰 신호
  formatFit       Int   // 매체 규격 적합성

  composite       Float // 목표별 가중 종합 점수 0~100
  scoreStdDev     Float // 채점 불확실성 (기본 8.0)
  modelConfidence Float // 0~1, Gemini 자기보고

  rationale       Json  // 축별 { score, evidence, suggestion }
  policyRisks     Json  // 매체 정책 위반 가능성 배열
  rawResponse     Json
  createdAt       DateTime @default(now())
}

model SimulationResult {
  id             String @id @default(cuid())
  simulationId   String @unique
  simulation     Simulation @relation(fields: [simulationId], references: [id])

  perCreative    Json   // [{ label, ctrMedian, ctrCi80, ctrCi95, cvrMedian, cpaMedian, ... }]
  winnerLabel    String
  winProbability Float  // 승자의 우세 확률
  liftMedian     Float  // 승자 대비 차순위 상대 리프트
  liftCi95       Json   // [low, high]
  expectedLoss   Json   // { "A": 0.0012, "B": 0.0001 } 상대 기대손실

  // 실험 설계 계산
  requiredImpressionsPerArm Int
  requiredBudgetKrw         Int
  requiredDays              Int
  mdeRelative               Float  // 현재 예산으로 검출 가능한 최소 상대 리프트
  testVerdict               TestVerdict // SKIP_TEST_SHIP_WINNER | RUN_TEST | INCONCLUSIVE_BY_DESIGN
  confidenceGrade           String      // "A" | "B" | "C" | "D"

  engineVersion  String
  createdAt      DateTime @default(now())
}

model ActualResult {
  id            String @id @default(cuid())
  simulationId  String @unique
  simulation    Simulation @relation(fields: [simulationId], references: [id])
  perCreative   Json     // [{ label, impressions, clicks, conversions, spendKrw }]
  enteredAt     DateTime @default(now())
}

model CalibrationPoint {
  id            String @id @default(cuid())
  media         Media
  industry      Industry
  predictedCtr  Float
  actualCtr     Float
  predictedLift Float
  actualLift    Float
  createdAt     DateTime @default(now())
}
```

## 5. 예측 엔진 — 이 앱의 심장

> **구현 순서상 가장 먼저, UI보다 먼저 만든다.** `lib/stats/`와 `lib/scoring/`이 완성되고 테스트를 통과한 뒤에 화면을 짠다.

### 5.1 파이프라인 개요

```
[입력] 캠페인 컨텍스트 + 소재 A/B
   │
   ├─ Stage 1  벤치마크 사전분포 조회         → 베이스라인 CTR/CVR/CPM + 그 불확실성
   ├─ Stage 2  Gemini 멀티모달 8축 채점        → 소재별 점수 0~100 + 채점 불확실성
   ├─ Stage 3  점수 → 성과 파라미터 변환        → 로그오즈 리프트
   ├─ Stage 4  베이지안 몬테카를로 (공유 베이스라인)→ 사후분포, 우세확률, 기대손실
   ├─ Stage 5  실험 설계 계산기                → 필요 표본·예산·기간, MDE, 테스트 가치 판정
   └─ Stage 6  신뢰도 등급 산정                → A~D
[출력] 리포트
```

### 5.2 Stage 1 — 벤치마크 사전분포

`lib/benchmarks/seed.ts`에 아래 표를 시드로 넣는다. **단, UI에서 사용자가 자기 광고 계정의 실제 평균으로 덮어쓸 수 있어야 하며, 덮어쓴 값이 항상 우선한다.** 대행사는 자기 데이터를 갖고 있고, 그게 어떤 공개 벤치마크보다 정확하다.

**Meta (페이스북·인스타그램) — 업종별**

| 업종 | CTR | CVR | CPC(USD) | CPM(USD) |
|---|---|---|---|---|
| 식음료 | 2.18% | 3.56% | 0.78 | 8.14 |
| 패션·의류 | 1.91% | 3.24% | 0.89 | 9.23 |
| 뷰티·퍼스널케어 | 1.76% | 2.97% | 1.63 | — |
| 피트니스·웰니스 | 1.83% | 2.43% | 1.54 | — |
| 이커머스(일반) | 1.49%※ | 2.81% | 1.35 | 10.42 |
| 여행·숙박 | 1.40%※ | 1.92% | 1.86 | — |
| 교육 | 1.30%※ | 1.64% | 2.18 | — |
| 자동차 | 1.25%※ | 1.28% | 2.08 | — |
| 헬스케어 | 1.15%※ | 1.18% | 2.41 | — |
| 부동산 | 1.05%※ | 0.94% | 2.67 | — |
| B2B·SaaS | 0.78% | 0.71% | 2.94 | 16.41 |
| 금융 | 0.94% | 0.88% | 3.89 | 18.56 |
| **전체 평균** | **1.49%** | **1.94%** | **1.72** | **11.54** |

> ※ 표시된 CTR은 원 출처에 값이 없어 **CPC·CPM·전환율로부터 역산한 추정치**다.
> 코드에서 `isEstimated: true` 플래그를 달고, 해당 업종 선택 시 UI에 "추정 벤치마크"
> 배지를 띄운다. 신뢰도 등급 계산에서도 PRESET-추정은 +0점으로 처리한다.

**Google 검색광고 — 업종별**

| 업종 | CTR | CVR | CPC(USD) |
|---|---|---|---|
| 예술·엔터테인먼트 | 5.62% | 2.77% | 0.63 |
| 여행·숙박 | 5.36% | 3.15% | 1.63 |
| 자동차 | 4.68% | 7.98% | 2.46 |
| 리테일·이커머스 | 3.82% | 3.09% | 1.16 |
| 금융 | 3.41% | 4.72% | 3.08 |
| 홈서비스 | 3.28% | 5.07% | 5.21 |
| 기술 | 3.17% | 3.71% | 2.62 |
| B2B·SaaS | 2.86% | 3.82% | 3.33 |
| 보험 | 2.53% | 6.15% | 6.22 |
| 법률 | 2.31% | 5.31% | 6.75 |
| **전체 평균** | **3.52%** | **4.40%** | **2.96** |

**Google 디스플레이(GDN)**

| 업종 | CTR | CVR | CPC(USD) |
|---|---|---|---|
| 예술·엔터테인먼트 | 0.58% | 0.43% | 0.22 |
| 리테일·이커머스 | 0.51% | 0.48% | 0.28 |
| 보험 | 0.27% | 0.98% | 0.68 |
| 법률 | 0.24% | 0.88% | 0.72 |
| **전체 평균** | **0.39%** | **0.72%** | **0.44** |

**네이버 GFA / 카카오모먼트**

공개된 신뢰할 만한 업종별 수치가 없다. 따라서:
- 시드 기본값은 **GDN 값에 매체 계수**를 적용한다 — 네이버 GFA는 CTR ×1.1 / CPC ×1.35, 카카오모먼트는 CTR ×1.2 / CPC ×0.85 (업계 통설: GFA가 CPC가 높고 인지 중심, 카카오모먼트가 CPC가 낮고 전환 성과가 좋은 편).
- **UI에 명확히 경고를 띄운다**: "네이버·카카오 기본 벤치마크는 추정치입니다. 정확한 예측을 위해 실제 계정 평균을 입력하세요."
- USD 값은 앱 설정의 환율(기본 1,350원)로 KRW 변환하되, 국내 매체는 CPM/CPC를 원화로 직접 입력받는 것을 기본 UX로 한다.

**베이스라인 불확실성**: 베이스라인 CTR `p0`는 점추정이 아니라 Beta 분포로 다룬다.

```
κ0 = 12000 (USER_ACCOUNT 실계정 값 — 가장 확신)   → 1.49% 기준 1σ ≈ ±0.11%p
κ0 = 3000  (PRESET, 원출처에 실측값 존재)         → 1σ ≈ ±0.22%p
κ0 = 800   (PRESET-추정: ※ 표시 항목, 네이버·카카오 기본값) → 1σ ≈ ±0.43%p

α0 = κ0 · p0,  β0 = κ0 · (1 − p0)
p0 ~ Beta(α0, β0)
```

### 5.3 Stage 2 — Gemini 멀티모달 8축 채점

**모델**: `gemini-2.5-flash` 기본, 설정에서 `gemini-2.5-pro` 전환 가능. `responseSchema`로 structured output 강제.

**8축 루브릭** — 각 축 0~100, **50점 = 해당 업종·매체의 평균적인 소재**. 이 앵커링이 매우 중요하므로 프롬프트에 반복해서 명시할 것.

| # | 축 | 채점 질문 |
|---|---|---|
| 1 | **시선 정지력** (stopPower) | 피드를 빠르게 스크롤하는 사람이 0.3초 안에 멈출 만한가? 대비, 인물 시선, 색상 돌출, 패턴 파괴 |
| 2 | **시각적 위계** (hierarchy) | 0.5초 안에 무엇이 첫 번째로 읽히는가? 읽는 순서가 의도대로 설계됐는가? 요소 간 크기 대비가 충분한가? |
| 3 | **메시지 명확성** (clarity) | 이 광고가 무엇을 파는지 한 문장으로 즉시 알 수 있는가? 카피가 모호하거나 지나치게 영리한가? |
| 4 | **가치 제안 강도** (valueProp) | 왜 지금 이걸 사야 하는가에 대한 답이 있는가? 혜택이 구체적인가(숫자·기간·조건)? 경쟁사 대비 차별점이 보이는가? |
| 5 | **CTA 강도** (ctaStrength) | 다음 행동이 명확한가? CTA가 시각적으로 발견 가능한가? 카피와 CTA가 일관된 약속을 하는가? |
| 6 | **타겟 적합성** (audienceFit) | 지정된 타겟이 자기 이야기라고 느낄 단서(모델·톤·상황·언어)가 있는가? |
| 7 | **브랜드 정합성·신뢰** (brandTrust) | 브랜드가 식별되는가? 과장 광고로 읽힐 위험은? 신뢰 신호(리뷰수·수상·보증)가 있는가? |
| 8 | **매체 규격 적합성** (formatFit) | 해당 지면의 비율·안전영역에 맞는가? 이미지 내 텍스트 비중이 과한가? 모바일 축소 시 카피가 읽히는가? |

**목표별 가중치** (합 = 1.0):

| 축 | 인지도 | 트래픽 | 전환 |
|---|---|---|---|
| 시선 정지력 | 0.28 | 0.22 | 0.13 |
| 시각적 위계 | 0.16 | 0.15 | 0.11 |
| 메시지 명확성 | 0.14 | 0.18 | 0.15 |
| 가치 제안 | 0.08 | 0.14 | 0.22 |
| CTA 강도 | 0.04 | 0.13 | 0.18 |
| 타겟 적합성 | 0.12 | 0.10 | 0.13 |
| 브랜드 정합성 | 0.13 | 0.04 | 0.05 |
| 규격 적합성 | 0.05 | 0.04 | 0.03 |

```
composite = Σ (축점수 × 목표별가중치)
```

**응답 스키마** (Zod로도 동일하게 정의해 파싱 검증):

```ts
{
  axes: {
    stopPower:   { score: number, evidence: string, suggestion: string },
    hierarchy:   { score: number, evidence: string, suggestion: string },
    clarity:     { score: number, evidence: string, suggestion: string },
    valueProp:   { score: number, evidence: string, suggestion: string },
    ctaStrength: { score: number, evidence: string, suggestion: string },
    audienceFit: { score: number, evidence: string, suggestion: string },
    brandTrust:  { score: number, evidence: string, suggestion: string },
    formatFit:   { score: number, evidence: string, suggestion: string }
  },
  policyRisks: [{ severity: "low"|"medium"|"high", issue: string, mediaRule: string }],
  overallSummary: string,      // 2문장 이내, 한국어
  modelConfidence: number,      // 0~1. 이미지 품질이 낮거나 정보가 부족하면 낮게
  scoreStdDev: number           // 5~20. 자기 채점의 불확실성. 애매할수록 크게
}
```

**채점 프롬프트에 반드시 포함할 것**:
- 업종, 매체, 지면, 캠페인 목표, 타겟 요약을 컨텍스트로 제공
- "50점은 이 업종·이 매체의 **평균적인** 소재다. 대부분의 소재는 35~65에 분포한다. 85점 이상은 상위 5% 소재에만 준다." — 점수 인플레이션 방지
- `evidence`는 **이미지·카피에서 실제로 관찰된 것**만 쓰게 한다. "역동적이고 매력적입니다" 같은 공허한 문장 금지. "헤드라인이 14자로 길고 배경 이미지와 명도 대비가 낮아 모바일에서 읽히지 않는다" 수준을 요구.
- `suggestion`은 실행 가능한 한 가지 수정 지시.
- A안과 B안은 **각각 독립적으로** 채점한다. 한 번에 둘을 비교시키면 모델이 임의로 한쪽을 편들며 점수를 벌린다.

**캐싱**: `(imageHash + headline + bodyText + ctaText + context)` 해시로 결과를 캐싱한다. 같은 소재 재채점 시 API 비용을 쓰지 않는다.

### 5.4 Stage 3 — 점수 → 성과 파라미터 변환

로그오즈(logit) 공간에서 선형 변환한다. 확률이 0~1을 벗어나지 않고, 리프트가 곱셈적으로 작동해 광고 성과의 실제 거동과 맞는다.

```
logit(p) = ln(p / (1 − p))

logit(ctr_i) = logit(p0) + β_ctr · (S_i − 50) / 50 + δ_ctr
logit(cvr_i) = logit(q0) + β_cvr · (S_i − 50) / 50 + δ_cvr
```

- `S_i` = 소재 i의 composite 점수
- `δ` = 캘리브레이션 보정항 (초기 0, Stage 7에서 학습)
- `β` = **소재 민감도 계수**. 소재의 자유도가 큰 매체일수록 크다:

| 매체·지면 | β_ctr | β_cvr | 근거 |
|---|---|---|---|
| Meta 피드·릴스 | 1.10 | 0.45 | 소재가 성과를 지배하는 대표 매체 |
| Meta 스토리 | 1.05 | 0.40 | |
| YouTube 인스트림 | 1.00 | 0.40 | |
| Google 디스플레이 | 0.95 | 0.40 | |
| 카카오모먼트 | 0.90 | 0.40 | |
| 네이버 GFA | 0.85 | 0.40 | |
| Google 검색(RSA) | 0.55 | 0.30 | 지면이 텍스트로 고정돼 소재 영향 작음 |

> 해석: Meta에서 β_ctr = 1.10이면 100점 소재는 50점 소재 대비 CTR이 약 e^1.10 ≈ 3.0배. 실무 감각과 일치한다. **이 계수는 캘리브레이션 데이터가 3건 이상 쌓이면 재추정된다.**
> `β_cvr`이 훨씬 작은 이유: 전환율은 소재보다 오퍼·랜딩페이지·가격이 지배하기 때문. 이 앱이 CVR을 CTR만큼 확신 있게 예측한다고 주장하면 안 된다.

**채점 오차의 로그오즈 표준편차**:
```
σ_i = β_ctr · scoreStdDev_i / 50
```
예: β=1.10, scoreStdDev=8 → σ = 0.176 (약 ±19% 상대 오차, 1σ)

### 5.5 Stage 4 — 베이지안 몬테카를로 (공유 베이스라인 구조)

**이 구조가 이 엔진의 핵심 설계다. 그냥 A와 B에 독립 Beta 사후분포를 씌우는 흔한 구현과 다르다.**

A안과 B안은 같은 벤치마크, 같은 채점 모델을 공유한다. 따라서 베이스라인 오차는 **두 안에 공통으로** 작용해 차이를 계산할 때 상쇄된다. 반면 채점 오차는 소재마다 독립이다. 이걸 반영하면:
- **절대 CTR 예측**은 넓은 구간 (정직함)
- **A vs B 상대 비교**는 좁은 구간 (유용함)

둘 다 올바르게 나온다. 독립 모형을 쓰면 절대값은 지나치게 확신하고 비교는 지나치게 흐릿해진다.

```
N = 50,000

for k in 1..N:
    p0_k ~ Beta(α0, β0)                        # 베이스라인 — A/B 공유
    for each creative i:
        ε_ik ~ Normal(0, σ_i)                  # 채점 오차 — 소재별 독립
        ctr_ik = sigmoid( logit(p0_k) + β_ctr·(S_i−50)/50 + δ_ctr + ε_ik )
    (CVR도 동일 구조, 별도 q0_k와 ε′_ik로 반복)
```

시드 고정 난수 생성기(seedrandom 등)를 써서 **같은 입력에 같은 결과**가 나오게 한다. 광고주 앞에서 두 번 돌렸는데 숫자가 달라지면 안 된다.

**산출물**:

```
우세확률       P(win_B) = (1/N) Σ 1[ctr_Bk > ctr_Ak]
리프트 분포    lift_k = ctr_Bk / ctr_Ak − 1
               → 중앙값, 80% 신용구간, 95% 신용구간
기대손실       EL(B 선택) = (1/N) Σ max(ctr_Ak − ctr_Bk, 0) / ctr_Ak   # 상대값
               EL(A 선택) = (1/N) Σ max(ctr_Bk − ctr_Ak, 0) / ctr_Ak
CTR 사후분포   각 안의 중앙값, 80%/95% 신용구간
예상 CPA       CPA_ik = CPM / (1000 · ctr_ik · cvr_ik)
예상 클릭수    일예산 · 기간 / CPM · 1000 · ctr_ik
```

**판정 규칙**:

| 조건 | 판정 |
|---|---|
| P(win) ≥ 0.95 **그리고** EL(승자) ≤ 0.005 | **명확한 우세** |
| 0.80 ≤ P(win) < 0.95 | **우세하나 실측 확인 권장** |
| P(win) < 0.80 | **판별 불가 — 두 안의 차이가 크지 않음** |

3안 이상(A/B/C/D)일 때는 모든 쌍이 아니라 **각 안이 1위일 확률**을 계산한다: `P(best_i) = (1/N) Σ 1[ctr_ik = max_j ctr_jk]`

### 5.6 Stage 5 — 실험 설계 계산기 (빈도주의)

여기가 "돈과 시간을 아낀다"는 약속을 실제로 지키는 부분이다.

**필요 표본수** (양측 α=0.05, 검정력 80%, 두 비율 검정):

```
z_α/2 = 1.959964,  z_β = 0.841621
n_per_arm = (z_α/2 + z_β)² · [ p₁(1−p₁) + p₂(1−p₂) ] / (p₂ − p₁)²
```
`p₁`, `p₂`는 A/B 예측 CTR의 **중앙값**을 쓴다.

**필요 예산·기간**:
```
필요 총 노출     = n_per_arm × 안 개수
필요 예산(원)    = 필요 총 노출 / 1000 × CPM_krw
일일 예상 노출   = 일예산 / CPM_krw × 1000
필요 기간(일)    = ceil(필요 총 노출 / 일일 예상 노출)
```

**MDE — 현재 예산으로 검출 가능한 최소 리프트** (역방향 계산):
```
n_available = (일예산 × 계획기간 / CPM_krw × 1000) / 안 개수
p̄ = (p₁ + p₂) / 2
MDE_절대 = (z_α/2 + z_β) · sqrt( 2 · p̄(1−p̄) / n_available )
MDE_상대 = MDE_절대 / p̄
```

**테스트 가치 판정** — 리포트 최상단에 이 결과가 나간다:

| 조건 | 판정 | 화면에 띄울 권고 |
|---|---|---|
| P(win) ≥ 0.95 이고 신뢰도 등급 A 또는 B | `SKIP_TEST_SHIP_WINNER` | "실측 A/B 테스트 없이 {승자}안으로 바로 집행하세요. 테스트에 쓸 {절감액}원을 승자 소재 증액에 쓰는 편이 낫습니다." |
| 예측 리프트 중앙값 ≥ MDE_상대 × 1.2 이고 P(win) < 0.95 | `RUN_TEST` | "실측 테스트를 권장합니다. 최소 {기간}일 / {예산}원이 필요하며, 이 조건이면 결론이 납니다." |
| 예측 리프트 중앙값 < MDE_상대 | `INCONCLUSIVE_BY_DESIGN` | "**이 예산으로는 결론이 나지 않습니다.** 현재 예산의 검출 한계는 상대 리프트 {MDE}%인데, 두 안의 예상 차이는 {리프트}%에 불과합니다. 테스트를 돌려도 3주 뒤 '유의차 없음'이 나옵니다. 예산을 {필요예산}원으로 늘리거나, 차이가 더 큰 소재를 새로 만드세요." |

세 번째 판정이 이 제품의 존재 이유다. UI에서 가장 크고 눈에 띄게 렌더링할 것.

### 5.7 Stage 6 — 신뢰도 등급

```
점수 = 0
+ 30  베이스라인이 USER_ACCOUNT (실계정 데이터)      / +10  PRESET 실측값 / +0  PRESET-추정(※ 항목, 네이버·카카오 기본값)
+ 25  modelConfidence ≥ 0.8                          / +15  0.6~0.8 / +5  < 0.6
+ 25  해당 매체·업종 캘리브레이션 데이터 5건 이상      / +15  1~4건 / +0  없음
+ 20  소재 정보 완전 (이미지 + 헤드라인 + 본문 + CTA 모두 존재, 이미지 해상도 충분)

A: 80점 이상 / B: 60~79 / C: 40~59 / D: 40 미만
```

D등급이면 리포트 상단에 경고 배너를 띄우고 `SKIP_TEST_SHIP_WINNER` 판정을 **금지**한다.

### 5.8 Stage 7 — 캘리브레이션 루프

사용자가 실제 집행 결과(노출·클릭·전환·소진액)를 입력하면:

1. `CalibrationPoint` 레코드 생성
2. **베이스라인 보정**: 같은 매체·업종의 최근 20건에 대해
   ```
   δ_ctr = median( logit(실측CTR_i) − logit(예측CTR_i) )
   ```
   다음 시뮬레이션부터 이 δ를 가산한다.
3. **β 재추정**: 해당 매체 데이터가 3건 이상이면 최소제곱으로
   ```
   logit(실측CTR) − logit(p0) = β · (S − 50)/50  →  β_new = Σ x·y / Σ x²
   ```
   급격한 변동을 막기 위해 `β = 0.7·β_기존 + 0.3·β_new`로 완만하게 갱신하고, `[0.3, 1.8]` 범위로 클리핑한다.
4. **정확도 지표 산출**: CTR MAPE, 리프트 방향 적중률, 승자 예측 적중률.
   대시보드 상단에 **"실측 대조 {n}건 · CTR 평균 오차 {MAPE}% · 승자 적중률 {x}%"** 를 상시 노출한다. 광고주 시연에서 이 한 줄이 가장 강력하다.

## 6. 화면 명세

### 6.1 대시보드 `/`
- 상단: 정확도 스트립 — "실측 대조 n건 · CTR 평균오차 x% · 승자 적중률 y%" (데이터 0건이면 "실측 데이터를 입력하면 예측이 정확해집니다" CTA)
- KPI 행: 이번 달 시뮬레이션 수 / 테스트 회피로 절감한 추정 예산 / 평균 예측 리프트
- 최근 시뮬레이션 리스트 (프로젝트, 매체 배지, 승자, 우세확률, 판정 배지, 날짜)
- 우상단 주 액션: **새 시뮬레이션**

### 6.2 새 시뮬레이션 `/simulations/new` — 4스텝 위저드

좌측에 스텝 인디케이터 고정, 우측 본문. 각 스텝은 URL 쿼리로 상태 유지(새로고침해도 안 날아감).

**Step 1 — 캠페인 설정**
매체 선택(로고 카드 그리드) → 지면 → 업종 → 캠페인 목표(3카드: 인지도/트래픽/전환, 각각 무엇이 달라지는지 한 줄 설명) → 타겟 요약(자유 텍스트) → 일 예산 / 계획 기간
하단 접이식 패널 **"벤치마크 직접 입력 (권장)"** — 평균 CTR / CVR / CPM. 비워두면 프리셋 사용. 프리셋 사용 시 "예측 정확도가 낮아집니다" 인라인 안내.

**Step 2 — 소재 등록**
A안·B안을 좌우 2열로 나란히 입력. 각 열: 이미지 드롭존(드래그앤드롭, 붙여넣기 지원, 지면 규격 비율 가이드 오버레이) + 헤드라인 + 본문 + CTA 텍스트.
"+ 소재 추가"로 C·D안까지 확장(최대 4).
우측에 **선택한 지면의 실시간 미리보기**를 붙인다 — 인스타 피드/릴스, 페북 피드, 네이버 GFA 배너 목업 안에 입력값이 즉시 반영. 이게 시연 때 반응이 가장 좋은 요소다.

**Step 3 — 검토**
입력값 요약. 누락 경고. 예상 소요 시간·API 비용 안내.

**Step 4 — 실행 중**
단계별 진행 애니메이션(각 단계 완료 시 체크): `벤치마크 조회 → A안 분석 → B안 분석 → 5만회 시뮬레이션 → 실험 설계 계산 → 리포트 생성`. 스켈레톤 필수, 스피너만 두지 말 것. 총 소요 목표 25초 이내.

### 6.3 리포트 `/simulations/[id]` — 제품의 얼굴

위에서 아래로:

1. **판정 히어로** — 화면 폭 전체. 배경은 판정별 색(중립 회색 계열, 원색 남발 금지).
   `SKIP_TEST_SHIP_WINNER` / `RUN_TEST` / `INCONCLUSIVE_BY_DESIGN` 문구를 5.6표 그대로.
   우측에 신뢰도 등급 배지(A~D)와 툴팁으로 산정 근거.
2. **승자 카드 + 우세 확률 미터** — 큰 숫자(≥48px) "87%", 그 아래 "B안 우세 확률". 미터는 단일 hue 트랙.
3. **예상 성과 비교 KPI 행** — CTR / CVR / CPA / 예상 클릭수 4개 타일. 각 타일 안에 A값·B값·델타. 델타는 아이콘+라벨 동반(색만으로 의미 전달 금지).
4. **사후분포 오버레이 차트** — A안·B안의 CTR 사후 밀도곡선 2개. 겹치는 정도가 곧 "얼마나 애매한가"를 직관적으로 보여준다. 이 차트 하나가 신뢰구간 설명을 대체한다.
5. **리프트 분포 차트** — 히스토그램, 0 기준 수직선 강조, 95% 신용구간 음영. 캡션에 "5만 회 시뮬레이션 중 87%에서 B안이 앞섰습니다".
6. **실험 설계 패널** — 필요 표본수 / 필요 예산 / 필요 기간 / 현재 예산의 MDE. 4개 스탯 타일 + 아래에 판정 근거 문장.
7. **8축 진단** — 레이더 차트(A/B 2계열) + 그 아래 축별 아코디언. 각 축에 점수 바, `evidence`, `suggestion`.
8. **정책 리스크** — 있을 때만. severity별 아이콘+라벨.
9. **개선 제안 종합** — 두 안의 강점을 합친 "C안 제안" 3줄.
10. **실측 결과 입력** — 접이식. 집행 후 돌아와 입력하면 캘리브레이션에 반영.
11. 상단 우측 고정 액션: **PDF 내보내기 / 공유 링크 복사**

### 6.4 공유 리포트 `/share/[token]`
로그인 없이 열리는 읽기 전용 리포트. 좌상단에 대행사 로고 자리. 편집·실측입력 UI 제거. 광고주에게 던지는 링크.

### 6.5 소재 라이브러리 `/creatives`
과거 소재를 점수순으로 그리드. 필터: 매체·업종·점수구간. "이 소재를 새 시뮬레이션에 사용" 액션.

### 6.6 설정 `/settings`
API 키, 기본 환율, 기본 모델(flash/pro), 자사 벤치마크 프리셋 관리, 캘리브레이션 데이터 조회·삭제.

## 7. 디자인 시스템

**톤**: 광고주 앞에 띄우는 화면. 화려함이 아니라 **정밀함**으로 신뢰를 만든다. 참조 감각은 Linear·Vercel 대시보드 — 넓은 여백, 얇은 헤어라인, 절제된 색, 정확한 정렬.

**폰트**: Pretendard Variable. 숫자 정렬이 필요한 표·축 눈금에만 `font-variant-numeric: tabular-nums`. 히어로 숫자는 기본 비례 숫자.

**색 — UI 크롬**
```
--surface-1      #fcfcfb    (다크 #1a1a19)   카드·차트 배경
--page           #f9f9f7    (다크 #0d0d0d)   페이지 배경
--text-primary   #0b0b0b    (다크 #ffffff)
--text-secondary #52514e    (다크 #c3c2b7)
--text-muted     #898781    (양쪽 동일)      축 라벨
--border         rgba(11,11,11,0.10)  (다크 rgba(255,255,255,0.10))
--grid           #e1e0d9    (다크 #2c2c2a)
--axis           #c3c2b7    (다크 #383835)
```
**주 액션 버튼은 near-black(`#0b0b0b`) 솔리드**로 한다. 파란 버튼을 쓰면 차트의 A안 파랑과 충돌해 색이 의미를 잃는다.

**색 — 데이터 (고정 배정, 절대 바꾸지 말 것)**
```
A안   라이트 #2a78d6   다크 #3987e5   (블루)
B안   라이트 #eb6834   다크 #d95926   (오렌지)
C안   라이트 #1baf7a   다크 #199e70   (아쿠아)
D안   —  4번째부터는 직접 라벨 필수
```
이 3색은 색각이상 시뮬레이션에서 전 조합 판별 가능한 조합이다. 임의로 바꾸지 말 것.

**상태 색** (계열 재사용 금지, 반드시 아이콘+라벨 동반)
```
good #0ca30c   warning #fab219   serious #ec835a   critical #d03b3b
```

**간격·모서리**: 8px 그리드. radius — 버튼/인풋 8px, 카드 12px, 히어로 패널 16px.
**그림자**: 최대 1단계, `0 1px 2px rgba(0,0,0,0.04)`. 그 이상 금지.
**다크 모드**: 자동 반전이 아니라 위 표의 다크 값으로 별도 지정.

**모션** (motion 라이브러리)
- 진입: opacity 0→1 + y 8px→0, 220ms, ease-out
- 숫자 카운트업: 히어로 숫자와 KPI 타일만, 600ms
- 시뮬레이션 진행 단계: 각 단계 완료 시 체크 마크 스프링 애니메이션
- 차트 초기 draw: 400ms. **호버 시 애니메이션 금지** (즉시 반응해야 함)
- `prefers-reduced-motion` 존중

## 8. 차트 규칙 (위반 시 리뷰 반려)

1. **이중 y축 절대 금지.** 단위가 다르면 차트를 나눈다.
2. **2계열 이상이면 범례 항상 표시**, 4계열 이하면 직접 라벨도 함께. 색만으로 구분하게 두지 않는다.
3. 색은 **엔티티(A안/B안)에 고정**. 필터로 계열 수가 바뀌어도 남은 계열의 색을 다시 칠하지 않는다.
4. 마크는 얇게 — 선 2px, 마커 최소 8px, 겹치는 마크에는 2px 서피스 링.
5. 그리드·축은 후퇴색(`--grid`, `--axis`). 값 라벨은 텍스트 색을 쓰고 계열 색을 입히지 않는다.
6. 모든 차트에 **호버 툴팁 기본 탑재** (선/영역은 크로스헤어, 바/셀은 마크별). 히트 영역은 마크보다 크게.
7. 모든 차트에 **표 보기 토글**을 제공한다. 접근성이자 광고주가 숫자를 그대로 가져갈 수 있는 실용 기능.
8. 단일 값은 차트가 아니라 **스탯 타일**로. 막대 1개짜리 차트 금지.
9. 순차 인코딩은 단일 hue 명도 변화. 무지개 팔레트 금지.
10. 렌더링 후 실제로 열어보고 라벨 겹침·오버플로를 눈으로 확인할 것.

## 9. API 명세

```
POST   /api/projects                      프로젝트 생성
GET    /api/benchmarks?media&industry      벤치마크 조회
POST   /api/simulations                    시뮬레이션 생성 (컨텍스트 + 소재)
GET    /api/simulations/:id                결과 조회
POST   /api/simulations/:id/run            실행 — SSE 스트리밍으로 진행 단계 전송
POST   /api/creatives/:id/score            개별 소재 재채점
POST   /api/simulations/:id/actuals        실측 결과 입력 → 캘리브레이션 반영
POST   /api/simulations/:id/share          공유 토큰 발급
GET    /api/calibration/accuracy            정확도 지표
POST   /api/simulations/:id/export          PDF 생성
```

`/run`은 SSE로 `{ stage, status, progress }` 를 흘려보내 Step 4 화면이 실시간으로 움직이게 한다.

## 10. 구현 Phase

| Phase | 내용 | 완료 조건 |
|---|---|---|
| **0** | Next.js 스캐폴딩, Tailwind v4, shadcn, Pretendard, 디자인 토큰 CSS 변수, Prisma 스키마 + 마이그레이션 | `npm run dev` 뜨고 토큰 데모 페이지가 라이트/다크 모두 정상 |
| **1** | `lib/stats/` 전체 + 단위 테스트. 벤치마크 시드 데이터 | `npm run test` 전부 통과. **UI 없음** |
| **2** | `lib/scoring/` — Gemini 프롬프트, responseSchema, Zod 파서, 캐싱. CLI 스크립트로 샘플 이미지 채점 검증 | 샘플 3개 채점 결과가 스키마 준수 + 점수가 35~65에 합리적 분포 |
| **3** | 4스텝 위저드 UI + 지면 미리보기 목업 | 입력 → DB 저장까지 E2E |
| **4** | `/run` SSE + 리포트 화면 + 전체 차트 | 실제 소재로 리포트 완성 |
| **5** | 대시보드, 소재 라이브러리, 설정 | |
| **6** | 공유 링크, PDF 내보내기 | 로그아웃 상태로 공유 링크 열림 |
| **7** | 실측 입력 + 캘리브레이션 루프 + 정확도 대시보드 | 실측 3건 입력 시 β가 실제로 갱신됨을 테스트로 증명 |
| **8** | 폴리시 — 빈 상태, 에러 상태, 로딩 스켈레톤, 키보드 내비, 반응형, 접근성 | Lighthouse 접근성 95+ |

## 11. 검증 요구사항

**단위 테스트 — 최소 이 케이스들은 반드시 포함**

```
logit/sigmoid       왕복 변환 오차 < 1e-10
정규분포 CDF/역함수  알려진 값과 대조 (z=1.96 → 0.975)
표본수 계산          p1=2%, p2=2.4%, α=.05, power=.8 → n≈21,106/arm (±1%)
                    (풀드 분산으로 계산해도 21,110으로 일치해야 함)
몬테카를로 대칭성    S_A = S_B 일 때 P(win) = 0.50 ± 0.01
몬테카를로 단조성    S_B를 올릴수록 P(win)이 단조 증가
시드 재현성          같은 입력 2회 실행 → 완전히 동일한 결과
공유 베이스라인 검증  절대 CTR의 95% 구간 폭 > 리프트의 95% 구간 폭
                    (이게 깨지면 공유 베이스라인 구조가 잘못 구현된 것)
기대손실 부호        승자의 기대손실 < 패자의 기대손실
MDE 역산 일관성      MDE로 계산한 리프트를 표본수 공식에 넣으면 원래 n이 나옴
캘리브레이션         실측 3건 입력 후 β가 [0.3, 1.8] 범위 안에서 갱신됨
```

**E2E (Playwright)**: 신규 시뮬레이션 생성 → 실행 → 리포트 렌더 → 공유 링크 열기

**시각 검증**: 안티그래비티의 브라우저 기능으로 리포트 페이지를 라이트/다크 각각 데스크톱(1440px)·모바일(390px)에서 캡처하고, 라벨 겹침·오버플로·색 대비를 직접 눈으로 확인할 것.

## 12. 하지 말 것 (Anti-goals)

- 실제 매체 광고 API 연동 — 이번 범위 밖
- 예측치를 실측처럼 단정 표기
- CTR을 소수점 4자리까지 표시하는 식의 가짜 정밀도
- 벤치마크 데이터가 없는데 있는 것처럼 보이게 하기 (네이버·카카오는 추정치임을 반드시 표기)
- 이모지, 글래스모피즘, 무지개 그라디언트
- 로딩 상태를 스피너 하나로 때우기
- 요청하지 않은 README·CHANGELOG 생성
- `lib/stats/`에 React·Prisma·fetch 끌어들이기

---
---

# PART C — Phase별 실행 프롬프트 (5단계)

계획 승인 후 아래를 **하나씩** 넣으세요. 앞 Phase의 테스트가 통과한 뒤 다음으로 넘어갑니다.

### Phase 0
```
@docs/PRD.md 의 10절 Phase 0을 실행해줘.
Next.js 15 App Router + TypeScript strict + Tailwind v4 + shadcn/ui를 세팅하고,
PRD 7절의 디자인 토큰을 전부 CSS 커스텀 프로퍼티로 정의해줘 (라이트/다크 둘 다).
Pretendard Variable을 next/font로 로드해줘.
PRD 4절 Prisma 스키마를 그대로 만들고 SQLite로 마이그레이션해줘.
마지막으로 /_tokens 라우트에 토큰 데모 페이지를 만들어서
색·타이포·간격·차트 3색이 라이트/다크에서 어떻게 보이는지 확인할 수 있게 해줘.
```

### Phase 1 — 가장 중요. 여기서 대충 넘어가면 안 됨
```
@docs/PRD.md 의 5절 예측 엔진을 lib/stats/ 아래 순수 TypeScript 함수로 구현해줘.
React, Prisma, fetch를 일절 import하지 마.

구현할 것:
- logit / sigmoid
- 정규분포 CDF와 역함수 (Acklam 근사 또는 동등한 정확도)
- Beta 분포 샘플러 (Gamma 두 개 비율. Marsaglia-Tsang)
- 시드 고정 PRNG
- Stage 3 점수→성과 파라미터 변환 (5.4절 수식 그대로, β 테이블 포함)
- Stage 4 공유 베이스라인 몬테카를로 (5.5절 의사코드 그대로. 베이스라인은 A/B 공유,
  채점 오차만 소재별 독립 — 이 구조가 핵심이니 정확히 지켜줘)
- Stage 5 표본수 / 필요예산 / 필요기간 / MDE / 테스트 가치 판정
- Stage 6 신뢰도 등급
- Stage 7 캘리브레이션 (δ 추정, β 재추정 + 클리핑)
- lib/benchmarks/seed.ts — PRD 5.2절 표 전부

그리고 PRD 11절에 나열된 모든 테스트 케이스를 Vitest로 작성해줘.
특히 "공유 베이스라인 검증" 케이스 — 절대 CTR 구간이 리프트 구간보다 넓어야 한다는 것 —
이게 통과하지 않으면 구조를 잘못 짠 거야.

UI는 만들지 마. npm run test가 전부 통과할 때까지가 이번 작업이야.
```

### Phase 2
```
@docs/PRD.md 5.3절대로 lib/scoring/ 을 구현해줘.
@google/genai로 gemini-2.5-flash를 쓰고 responseSchema로 structured output을 강제해.
응답은 Zod로 한 번 더 검증해줘.

채점 프롬프트에는 반드시 넣어줘:
- "50점 = 이 업종·이 매체의 평균 소재, 대부분 35~65에 분포, 85점 이상은 상위 5%만"
- evidence는 이미지·카피에서 실제 관찰된 것만. 공허한 형용사 금지
- A안과 B안은 각각 독립 호출로 채점 (비교시키지 말 것)

이미지+텍스트 해시로 결과 캐싱도 붙여줘.
scripts/score-sample.ts CLI를 만들어서 샘플 이미지로 실제 호출해보고,
점수 분포가 합리적인지 (전부 80점대로 몰리지 않는지) 확인해줘.
```

### Phase 3~8
```
@docs/PRD.md 의 Phase {N}을 실행해줘.
해당 절의 화면 명세와 7·8절 디자인·차트 규칙을 정확히 지켜줘.
완료 후 npm run lint && npx tsc --noEmit && npm run test 를 돌려서 통과시키고,
브라우저로 실제 화면을 열어 라이트/다크 · 데스크톱(1440)/모바일(390)에서 캡처해 보여줘.
```

---
---

# PART D — 검증 프롬프트 (6단계)

```
@docs/PRD.md 11절 기준으로 지금까지 만든 걸 전면 검증해줘.

1. lib/stats/ 의 모든 공식을 PRD 5절과 한 줄씩 대조해서 틀린 곳을 찾아줘.
   특히 표본수 공식과 MDE 역산이 서로 일관되는지 수치로 확인해줘.
2. 표본수 계산 결과를 공개 A/B 테스트 표본수 계산기와 3개 케이스 대조해줘.
3. 리포트 화면을 브라우저로 열어서, 예측치가 실측처럼 단정적으로 표기된 곳이 있는지
   문구를 전부 검사해줘. 신뢰구간 없이 단일 숫자만 나오는 곳이 있으면 고쳐줘.
4. 모든 차트가 8절 규칙을 지키는지 점검해줘 (이중축 없음, 범례 있음, 표 보기 토글 있음,
   색이 엔티티에 고정, 호버 툴팁 존재).
5. 벤치마크가 PRESET인데 마치 실데이터인 것처럼 보이는 화면이 있으면 경고 표기를 추가해줘.
6. 라이트/다크 · 1440px/390px 4가지 조합으로 리포트를 캡처해서 보여줘.
```

---
---

# PART E — 광고주 시연 전 체크리스트

시연 직전에 이것만 확인하세요.

- [ ] **판정 히어로**가 리포트 최상단에서 한눈에 읽히는가 — 광고주는 이 한 문장을 본다
- [ ] 정확도 스트립에 표시할 **실측 대조 데이터가 최소 5건** 쌓여 있는가 (과거 캠페인 결과를 미리 입력해둘 것)
- [ ] 지면 미리보기 목업이 실제 인스타/GFA와 닮았는가 — 시연 몰입도를 좌우함
- [ ] `INCONCLUSIVE_BY_DESIGN` 판정이 나오는 케이스를 **일부러 하나 준비**했는가
      → "이 툴은 무조건 답을 주는 게 아니라, 답이 안 나오는 테스트를 미리 걸러줍니다"가 가장 강한 세일즈 포인트
- [ ] 신뢰도 등급 배지 툴팁이 산정 근거를 설명하는가
- [ ] PDF 내보내기가 한글 폰트 깨짐 없이 되는가
- [ ] 공유 링크를 시크릿 창에서 열어봤는가
- [ ] 시뮬레이션 총 소요 시간이 25초를 넘지 않는가 (넘으면 시연 중 정적이 흐름)
- [ ] 같은 입력으로 두 번 돌렸을 때 숫자가 동일한가 (시드 고정 확인)

---

## 데이터 출처

벤치마크와 방법론의 근거:

- [Facebook Ads Benchmarks 2026: CPC, CPM, CTR by Industry — Digital Applied](https://www.digitalapplied.com/blog/facebook-ads-benchmarks-2026-cpc-cpm-ctr-industry)
- [Google Ads Benchmarks 2026: CPC, CTR, CVR by Industry — Digital Applied](https://www.digitalapplied.com/blog/google-ads-benchmarks-2026-cpc-ctr-cvr-industry)
- [Formulas for Bayesian A/B Testing — Evan Miller](https://www.evanmiller.org/bayesian-ab-testing.html)
- [Bayesian Statistics for A/B Testing — GrowthBook](https://www.growthbook.io/insights/bayesian-statistics)
- [Two-proportion Z-test — Wikipedia](https://en.wikipedia.org/wiki/Two-proportion_Z-test)
- [Hook Rate Benchmarks for Meta & TikTok Ads 2026 — SparkUGC](https://www.sparkugc.com/resources/hook-rate-benchmarks-2026)
- [Meta Ads Frequency Benchmarks — Adamigo](https://www.adamigo.ai/blog/meta-ads-frequency-benchmarks-when-ads-start-fatiguing)
- [네이버 GFA vs 카카오모먼트 — 제이영컨설팅](https://jyoungad.kr/column/navergfakakao/)
- [Google Antigravity Docs — Best Practices](https://antigravity.google/docs/cli/best-practices)
- [Google Antigravity Docs — Implementation Plan](https://antigravity.google/docs/implementation-plan)
