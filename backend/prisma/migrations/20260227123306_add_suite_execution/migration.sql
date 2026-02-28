-- AlterTable
ALTER TABLE "TestExecution" ADD COLUMN     "suiteExecutionId" INTEGER;

-- CreateTable
CREATE TABLE "SuiteExecution" (
    "id" SERIAL NOT NULL,
    "suiteId" INTEGER NOT NULL,
    "executedById" INTEGER NOT NULL,
    "mode" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'In Progress',

    CONSTRAINT "SuiteExecution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TestExecution" ADD CONSTRAINT "TestExecution_suiteExecutionId_fkey" FOREIGN KEY ("suiteExecutionId") REFERENCES "SuiteExecution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuiteExecution" ADD CONSTRAINT "SuiteExecution_suiteId_fkey" FOREIGN KEY ("suiteId") REFERENCES "TestSuite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuiteExecution" ADD CONSTRAINT "SuiteExecution_executedById_fkey" FOREIGN KEY ("executedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
