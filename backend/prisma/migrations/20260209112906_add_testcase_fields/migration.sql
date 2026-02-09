/*
  Warnings:

  - Added the required column `environment` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `module` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preconditions` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `severity` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testData` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `TestCase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TestCase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "actual" TEXT,
ADD COLUMN     "environment" TEXT NOT NULL,
ADD COLUMN     "module" TEXT NOT NULL,
ADD COLUMN     "preconditions" TEXT NOT NULL,
ADD COLUMN     "severity" TEXT NOT NULL,
ADD COLUMN     "testData" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;
