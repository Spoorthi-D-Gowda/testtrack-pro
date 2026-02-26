-- CreateTable
CREATE TABLE "ExecutionEvidence" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stepExecutionId" INTEGER NOT NULL,

    CONSTRAINT "ExecutionEvidence_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExecutionEvidence" ADD CONSTRAINT "ExecutionEvidence_stepExecutionId_fkey" FOREIGN KEY ("stepExecutionId") REFERENCES "TestStepExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;
