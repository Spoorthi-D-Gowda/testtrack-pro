-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;
