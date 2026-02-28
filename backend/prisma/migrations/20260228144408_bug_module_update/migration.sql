/*
  Warnings:

  - A unique constraint covering the columns `[bugId]` on the table `Bug` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Bug" ADD COLUMN     "actual" TEXT,
ADD COLUMN     "affectedVersion" TEXT,
ADD COLUMN     "bugId" TEXT,
ADD COLUMN     "commitLink" TEXT,
ADD COLUMN     "environment" TEXT,
ADD COLUMN     "expected" TEXT,
ADD COLUMN     "fixNotes" TEXT,
ADD COLUMN     "stepsToReproduce" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "severity" DROP DEFAULT,
ALTER COLUMN "status" SET DEFAULT 'New',
ALTER COLUMN "priority" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Bug_bugId_key" ON "Bug"("bugId");
