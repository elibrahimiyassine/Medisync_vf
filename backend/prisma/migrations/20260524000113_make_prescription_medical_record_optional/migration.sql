-- DropForeignKey
ALTER TABLE "prescriptions" DROP CONSTRAINT "prescriptions_medicalRecordId_fkey";

-- AlterTable
ALTER TABLE "prescriptions" ALTER COLUMN "medicalRecordId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "medical_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;
