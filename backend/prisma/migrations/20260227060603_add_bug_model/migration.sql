/*
  Warnings:

  - You are about to drop the column `userId` on the `Bug` table. All the data in the column will be lost.
  - Added the required column `reportedById` to the `Bug` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bug" DROP CONSTRAINT "Bug_userId_fkey";

-- AlterTable
ALTER TABLE "Bug" DROP COLUMN "userId",
ADD COLUMN     "assignedToId" INTEGER,
ADD COLUMN     "executionId" INTEGER,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'Medium',
ADD COLUMN     "reportedById" INTEGER NOT NULL,
ADD COLUMN     "stepExecutionId" INTEGER,
ADD COLUMN     "testCaseId" INTEGER,
ALTER COLUMN "severity" SET DEFAULT 'Major',
ALTER COLUMN "status" SET DEFAULT 'Open';

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_executionId_fkey" FOREIGN KEY ("executionId") REFERENCES "TestExecution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_stepExecutionId_fkey" FOREIGN KEY ("stepExecutionId") REFERENCES "TestStepExecution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
