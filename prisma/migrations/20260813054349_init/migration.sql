-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "media" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "targetSummary" TEXT NOT NULL,
    "dailyBudgetKrw" INTEGER NOT NULL,
    "plannedDays" INTEGER NOT NULL,
    "baselineCtr" REAL NOT NULL,
    "baselineCvr" REAL NOT NULL,
    "baselineCpmKrw" INTEGER NOT NULL,
    "baselineSource" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Simulation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Creative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "simulationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageMeta" JSONB NOT NULL,
    "headline" TEXT NOT NULL,
    "bodyText" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    CONSTRAINT "Creative_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CreativeScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creativeId" TEXT NOT NULL,
    "stopPower" INTEGER NOT NULL,
    "hierarchy" INTEGER NOT NULL,
    "clarity" INTEGER NOT NULL,
    "valueProp" INTEGER NOT NULL,
    "ctaStrength" INTEGER NOT NULL,
    "audienceFit" INTEGER NOT NULL,
    "brandTrust" INTEGER NOT NULL,
    "formatFit" INTEGER NOT NULL,
    "composite" REAL NOT NULL,
    "scoreStdDev" REAL NOT NULL,
    "modelConfidence" REAL NOT NULL,
    "rationale" JSONB NOT NULL,
    "policyRisks" JSONB NOT NULL,
    "rawResponse" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreativeScore_creativeId_fkey" FOREIGN KEY ("creativeId") REFERENCES "Creative" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SimulationResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "simulationId" TEXT NOT NULL,
    "perCreative" JSONB NOT NULL,
    "winnerLabel" TEXT NOT NULL,
    "winProbability" REAL NOT NULL,
    "liftMedian" REAL NOT NULL,
    "liftCi95" JSONB NOT NULL,
    "expectedLoss" JSONB NOT NULL,
    "requiredImpressionsPerArm" INTEGER NOT NULL,
    "requiredBudgetKrw" INTEGER NOT NULL,
    "requiredDays" INTEGER NOT NULL,
    "mdeRelative" REAL NOT NULL,
    "testVerdict" TEXT NOT NULL,
    "confidenceGrade" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SimulationResult_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActualResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "simulationId" TEXT NOT NULL,
    "perCreative" JSONB NOT NULL,
    "enteredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActualResult_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CalibrationPoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "media" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "predictedCtr" REAL NOT NULL,
    "actualCtr" REAL NOT NULL,
    "predictedLift" REAL NOT NULL,
    "actualLift" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "CreativeScore_creativeId_key" ON "CreativeScore"("creativeId");

-- CreateIndex
CREATE UNIQUE INDEX "SimulationResult_simulationId_key" ON "SimulationResult"("simulationId");

-- CreateIndex
CREATE UNIQUE INDEX "ActualResult_simulationId_key" ON "ActualResult"("simulationId");
