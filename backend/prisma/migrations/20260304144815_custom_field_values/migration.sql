-- CreateTable
CREATE TABLE "TestCaseCustomFieldValue" (
    "id" SERIAL NOT NULL,
    "testCaseId" INTEGER NOT NULL,
    "fieldId" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "TestCaseCustomFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestCaseCustomFieldValue_testCaseId_fieldId_key" ON "TestCaseCustomFieldValue"("testCaseId", "fieldId");

-- AddForeignKey
ALTER TABLE "TestCaseCustomFieldValue" ADD CONSTRAINT "TestCaseCustomFieldValue_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCaseCustomFieldValue" ADD CONSTRAINT "TestCaseCustomFieldValue_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "ProjectCustomField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
