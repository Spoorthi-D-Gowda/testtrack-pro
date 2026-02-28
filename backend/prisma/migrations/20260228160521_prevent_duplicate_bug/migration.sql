/*
  Warnings:

  - A unique constraint covering the columns `[stepExecutionId]` on the table `Bug` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Bug_stepExecutionId_key" ON "Bug"("stepExecutionId");
