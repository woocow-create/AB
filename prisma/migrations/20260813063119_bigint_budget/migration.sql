/*
  Warnings:

  - You are about to alter the column `requiredBudgetKrw` on the `SimulationResult` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `requiredImpressionsPerArm` on the `SimulationResult` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SimulationResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "simulationId" TEXT NOT NULL,
    "perCreative" JSONB NOT NULL,
    "winnerLabel" TEXT NOT NULL,
    "winProbability" REAL NOT NULL,
    "liftMedian" REAL NOT NULL,
    "liftCi95" JSONB NOT NULL,
    "expectedLoss" JSONB NOT NULL,
    "requiredImpressionsPerArm" BIGINT NOT NULL,
    "requiredBudgetKrw" BIGINT NOT NULL,
    "requiredDays" INTEGER NOT NULL,
    "mdeRelative" REAL NOT NULL,
    "testVerdict" TEXT NOT NULL,
    "confidenceGrade" TEXT NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SimulationResult_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SimulationResult" ("confidenceGrade", "createdAt", "engineVersion", "expectedLoss", "id", "liftCi95", "liftMedian", "mdeRelative", "perCreative", "requiredBudgetKrw", "requiredDays", "requiredImpressionsPerArm", "simulationId", "testVerdict", "winProbability", "winnerLabel") SELECT "confidenceGrade", "createdAt", "engineVersion", "expectedLoss", "id", "liftCi95", "liftMedian", "mdeRelative", "perCreative", "requiredBudgetKrw", "requiredDays", "requiredImpressionsPerArm", "simulationId", "testVerdict", "winProbability", "winnerLabel" FROM "SimulationResult";
DROP TABLE "SimulationResult";
ALTER TABLE "new_SimulationResult" RENAME TO "SimulationResult";
CREATE UNIQUE INDEX "SimulationResult_simulationId_key" ON "SimulationResult"("simulationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
