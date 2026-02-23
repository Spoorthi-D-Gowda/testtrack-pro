-- CreateTable
CREATE TABLE "TestCaseTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT,
    "templateData" JSONB NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestCaseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSuite" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER NOT NULL,

    CONSTRAINT "TestSuite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuiteTestCase" (
    "id" SERIAL NOT NULL,
    "suiteId" INTEGER NOT NULL,
    "testCaseId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "SuiteTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SuiteTestCase_suiteId_testCaseId_key" ON "SuiteTestCase"("suiteId", "testCaseId");

-- AddForeignKey
ALTER TABLE "TestCaseTemplate" ADD CONSTRAINT "TestCaseTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSuite" ADD CONSTRAINT "TestSuite_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "TestSuite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestSuite" ADD CONSTRAINT "TestSuite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuiteTestCase" ADD CONSTRAINT "SuiteTestCase_suiteId_fkey" FOREIGN KEY ("suiteId") REFERENCES "TestSuite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuiteTestCase" ADD CONSTRAINT "SuiteTestCase_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
