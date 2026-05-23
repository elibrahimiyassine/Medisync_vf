-- CreateTable
CREATE TABLE "clinic_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "clinicName" TEXT NOT NULL DEFAULT 'MediSync Clinique',
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "slotDuration" INTEGER NOT NULL DEFAULT 30,
    "workingHoursStart" TEXT NOT NULL DEFAULT '08:00',
    "workingHoursEnd" TEXT NOT NULL DEFAULT '18:00',
    "consultationFee" DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV',
    "passwordPolicy" TEXT NOT NULL DEFAULT 'strong',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_settings_pkey" PRIMARY KEY ("id")
);
