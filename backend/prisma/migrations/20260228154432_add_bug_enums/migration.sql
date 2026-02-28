/*
  Warnings:

  - You are about to alter the column `title` on the `Bug` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - The `status` column on the `Bug` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `severity` on the `Bug` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `priority` on the `Bug` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `bugId` on table `Bug` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Bug` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "BugSeverity" AS ENUM ('Blocker', 'Critical', 'Major', 'Minor', 'Trivial');

-- CreateEnum
CREATE TYPE "BugPriority" AS ENUM ('P1_Urgent', 'P2_High', 'P3_Medium', 'P4_Low');

-- CreateEnum
CREATE TYPE "BugStatus" AS ENUM ('New', 'Open', 'In_Progress', 'Fixed', 'Verified', 'Closed', 'Reopened', 'Wont_Fix', 'Duplicate');

-- AlterTable
ALTER TABLE "Bug" ALTER COLUMN "title" SET DATA TYPE VARCHAR(200),
DROP COLUMN "severity",
ADD COLUMN     "severity" "BugSeverity" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "BugStatus" NOT NULL DEFAULT 'New',
DROP COLUMN "priority",
ADD COLUMN     "priority" "BugPriority" NOT NULL,
ALTER COLUMN "bugId" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateTable
CREATE TABLE "BugAttachment" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bugId" INTEGER NOT NULL,

    CONSTRAINT "BugAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BugAttachment" ADD CONSTRAINT "BugAttachment_bugId_fkey" FOREIGN KEY ("bugId") REFERENCES "Bug"("id") ON DELETE CASCADE ON UPDATE CASCADE;
