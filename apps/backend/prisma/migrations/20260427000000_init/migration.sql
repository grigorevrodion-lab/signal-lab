-- CreateTable
CREATE TABLE "ScenarioRun" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScenarioRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScenarioRun_type_idx" ON "ScenarioRun"("type");

-- CreateIndex
CREATE INDEX "ScenarioRun_status_idx" ON "ScenarioRun"("status");

-- CreateIndex
CREATE INDEX "ScenarioRun_createdAt_idx" ON "ScenarioRun"("createdAt");
