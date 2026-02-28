/*
  Warnings:

  - Made the column `stepExecutionId` on table `Bug` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Bug" DROP CONSTRAINT "Bug_stepExecutionId_fkey";

-- AlterTable
ALTER TABLE "Bug" ALTER COLUMN "stepExecutionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_stepExecutionId_fkey" FOREIGN KEY ("stepExecutionId") REFERENCES "TestStepExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
