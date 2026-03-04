-- CreateTable
CREATE TABLE "ProjectTester" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "testerId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectTester_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTester_projectId_testerId_key" ON "ProjectTester"("projectId", "testerId");

-- AddForeignKey
ALTER TABLE "ProjectTester" ADD CONSTRAINT "ProjectTester_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTester" ADD CONSTRAINT "ProjectTester_testerId_fkey" FOREIGN KEY ("testerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
