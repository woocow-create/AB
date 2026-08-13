-- PostgreSQL 초기 마이그레이션
-- Vercel + Neon 배포용

CREATE TYPE "Media" AS ENUM ('META', 'GOOGLE_SEARCH', 'GOOGLE_DISPLAY', 'YOUTUBE', 'NAVER_GFA', 'KAKAO_MOMENT');
CREATE TYPE "Placement" AS ENUM ('INSTAGRAM_FEED', 'INSTAGRAM_REELS', 'FACEBOOK_FEED', 'GDN_BANNER', 'NAVER_GFA_BANNER', 'KAKAO_MOMENT_FEED');
CREATE TYPE "Objective" AS ENUM ('AWARENESS', 'TRAFFIC', 'CONVERSION');
CREATE TYPE "Industry" AS ENUM ('FOOD_BEVERAGE', 'FASHION', 'BEAUTY', 'FITNESS', 'ECOMMERCE', 'TRAVEL', 'EDUCATION', 'AUTOMOBILE', 'HEALTHCARE', 'REAL_ESTATE', 'B2B_SAAS', 'FINANCE', 'ENTERTAINMENT', 'HOME_SERVICES', 'TECHNOLOGY', 'INSURANCE', 'LEGAL');
CREATE TYPE "BaselineSource" AS ENUM ('PRESET', 'USER_ACCOUNT');
CREATE TYPE "TestVerdict" AS ENUM ('SKIP_TEST_SHIP_WINNER', 'RUN_TEST', 'INCONCLUSIVE_BY_DESIGN');

CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" "Industry" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "media" "Media" NOT NULL,
    "placement" "Placement" NOT NULL,
    "objective" "Objective" NOT NULL,
    "targetSummary" TEXT NOT NULL,
    "dailyBudgetKrw" INTEGER NOT NULL,
    "plannedDays" INTEGER NOT NULL,
    "baselineCtr" DOUBLE PRECISION NOT NULL,
    "baselineCvr" DOUBLE PRECISION NOT NULL,
    "baselineCpmKrw" INTEGER NOT NULL,
    "baselineSource" "BaselineSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Creative" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageMeta" JSONB NOT NULL,
    "headline" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    CONSTRAINT "Creative_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CreativeScore" (
    "id" TEXT NOT NULL,
    "creativeId" TEXT NOT NULL,
    "stopPower" INTEGER NOT NULL,
    "hierarchy" INTEGER NOT NULL,
    "clarity" INTEGER NOT NULL,
    "valueProp" INTEGER NOT NULL,
    "ctaStrength" INTEGER NOT NULL,
    "audienceFit" INTEGER NOT NULL,
    "brandTrust" INTEGER NOT NULL,
    "formatFit" INTEGER NOT NULL,
    "composite" DOUBLE PRECISION NOT NULL,
    "scoreStdDev" DOUBLE PRECISION NOT NULL,
    "modelConfidence" DOUBLE PRECISION NOT NULL,
    "rationale" JSONB NOT NULL,
    "policyRisks" JSONB NOT NULL,
    "rawResponse" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreativeScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SimulationResult" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "perCreative" JSONB NOT NULL,
    "winnerLabel" TEXT NOT NULL,
    "winProbability" DOUBLE PRECISION NOT NULL,
    "liftMedian" DOUBLE PRECISION NOT NULL,
    "liftCi95" JSONB NOT NULL,
    "expectedLoss" JSONB NOT NULL,
    "requiredImpressionsPerArm" INTEGER NOT NULL,
    "requiredBudgetKrw" INTEGER NOT NULL,
    "requiredDays" INTEGER NOT NULL,
    "mdeRelative" DOUBLE PRECISION NOT NULL,
    "testVerdict" "TestVerdict" NOT NULL,
    "confidenceGrade" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SimulationResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ActualResult" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "perCreative" JSONB NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActualResult_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CalibrationPoint" (
    "id" TEXT NOT NULL,
    "media" "Media" NOT NULL,
    "industry" "Industry" NOT NULL,
    "predictedCtr" DOUBLE PRECISION NOT NULL,
    "actualCtr" DOUBLE PRECISION NOT NULL,
    "predictedLift" DOUBLE PRECISION NOT NULL,
    "actualLift" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CalibrationPoint_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "CreativeScore_creativeId_key" ON "CreativeScore"("creativeId");
CREATE UNIQUE INDEX "SimulationResult_simulationId_key" ON "SimulationResult"("simulationId");
CREATE UNIQUE INDEX "ActualResult_simulationId_key" ON "ActualResult"("simulationId");

-- Foreign keys
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Creative" ADD CONSTRAINT "Creative_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CreativeScore" ADD CONSTRAINT "CreativeScore_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "Creative"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SimulationResult" ADD CONSTRAINT "SimulationResult_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ActualResult" ADD CONSTRAINT "ActualResult_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
