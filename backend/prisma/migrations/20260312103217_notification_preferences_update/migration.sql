-- AlterTable
ALTER TABLE "NotificationPreference" ADD COLUMN     "bugStatusEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "bugStatusInApp" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "retestEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "retestInApp" BOOLEAN NOT NULL DEFAULT true;
