/*
  Warnings:

  - A unique constraint covering the columns `[projectId,testCaseId]` on the table `TestCase` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TestCase_testCaseId_key";

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_projectId_testCaseId_key" ON "TestCase"("projectId", "testCaseId");
