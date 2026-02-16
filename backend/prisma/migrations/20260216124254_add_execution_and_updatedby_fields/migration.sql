/*
  Warnings:

  - You are about to drop the column `actual` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `steps` on the `TestCase` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[testCaseId]` on the table `TestCase` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `automationStatus` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testCaseId` to the `TestCase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "actual",
DROP COLUMN "steps",
ADD COLUMN     "automationLink" TEXT,
ADD COLUMN     "automationStatus" TEXT NOT NULL,
ADD COLUMN     "cleanupSteps" TEXT,
ADD COLUMN     "estimatedTime" TEXT,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postconditions" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "testCaseId" TEXT NOT NULL,
ADD COLUMN     "updatedById" INTEGER,
ALTER COLUMN "expected" SET DEFAULT '';

-- CreateTable
CREATE TABLE "TestCaseVersion" (
    "id" SERIAL NOT NULL,
    "testCaseId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "editedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestCaseVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestStep" (
    "id" SERIAL NOT NULL,
    "testCaseId" INTEGER NOT NULL,
    "stepNo" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "testData" TEXT,
    "expected" TEXT NOT NULL,
    "actual" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "executedAt" TIMESTAMP(3),

    CONSTRAINT "TestStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_testCaseId_key" ON "TestCase"("testCaseId");

-- AddForeignKey
ALTER TABLE "TestCaseVersion" ADD CONSTRAINT "TestCaseVersion_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCaseVersion" ADD CONSTRAINT "TestCaseVersion_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestStep" ADD CONSTRAINT "TestStep_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
