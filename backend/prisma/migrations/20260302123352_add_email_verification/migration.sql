-- DropForeignKey
ALTER TABLE "Bug" DROP CONSTRAINT "Bug_stepExecutionId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifyExpiry" TIMESTAMP(3),
ADD COLUMN     "verifyToken" TEXT;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_stepExecutionId_fkey" FOREIGN KEY ("stepExecutionId") REFERENCES "TestStepExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
