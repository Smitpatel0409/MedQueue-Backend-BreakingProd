-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('RECEPTIONIST', 'DOCTOR', 'NURSE', 'ADMIN');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('NEW_VISIT', 'FOLLOW_UP', 'REPORTS_ONLY');

-- CreateEnum
CREATE TYPE "TokenStatus" AS ENUM ('WAITING', 'VITALS_IN_PROGRESS', 'VITALS_DONE', 'IN_CONSULTATION', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NextStepType" AS ENUM ('LAB_TEST', 'RADIOLOGY', 'PHARMACY', 'SPECIALIST_REFERRAL', 'FOLLOW_UP', 'ADMISSION', 'DISCHARGE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "departmentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "floor" TEXT,
    "roomNumber" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymptomMapping" (
    "id" TEXT NOT NULL,
    "keywords" TEXT[],
    "priority" "Priority" NOT NULL,
    "departmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SymptomMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "tokenNumber" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "contactNumber" TEXT,
    "symptoms" TEXT NOT NULL,
    "visitType" "VisitType" NOT NULL,
    "priority" "Priority" NOT NULL,
    "status" "TokenStatus" NOT NULL DEFAULT 'WAITING',
    "departmentId" TEXT NOT NULL,
    "queuePosition" INTEGER NOT NULL,
    "estimatedWaitMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VitalCheck" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "bloodPressure" TEXT,
    "heartRate" INTEGER,
    "temperature" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "oxygenSaturation" INTEGER,
    "notes" TEXT,
    "checkedById" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VitalCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consultation" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "diagnosis" TEXT,
    "prescriptions" TEXT,
    "notes" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NextStep" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "stepType" "NextStepType" NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "instructions" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NextStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HospitalConfig" (
    "id" TEXT NOT NULL,
    "avgConsultationTime" INTEGER NOT NULL DEFAULT 10,
    "highPriorityMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "autoRefreshInterval" INTEGER NOT NULL DEFAULT 30,
    "openingTime" TEXT NOT NULL DEFAULT '08:00',
    "closingTime" TEXT NOT NULL DEFAULT '20:00',
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HospitalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_departmentId_idx" ON "User"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE INDEX "Department_code_idx" ON "Department"("code");

-- CreateIndex
CREATE INDEX "SymptomMapping_departmentId_idx" ON "SymptomMapping"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_tokenNumber_key" ON "Token"("tokenNumber");

-- CreateIndex
CREATE INDEX "Token_tokenNumber_idx" ON "Token"("tokenNumber");

-- CreateIndex
CREATE INDEX "Token_departmentId_status_idx" ON "Token"("departmentId", "status");

-- CreateIndex
CREATE INDEX "Token_createdAt_idx" ON "Token"("createdAt");

-- CreateIndex
CREATE INDEX "Token_status_idx" ON "Token"("status");

-- CreateIndex
CREATE UNIQUE INDEX "VitalCheck_tokenId_key" ON "VitalCheck"("tokenId");

-- CreateIndex
CREATE INDEX "VitalCheck_tokenId_idx" ON "VitalCheck"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_tokenId_key" ON "Consultation"("tokenId");

-- CreateIndex
CREATE INDEX "Consultation_tokenId_idx" ON "Consultation"("tokenId");

-- CreateIndex
CREATE INDEX "Consultation_doctorId_idx" ON "Consultation"("doctorId");

-- CreateIndex
CREATE INDEX "Consultation_departmentId_idx" ON "Consultation"("departmentId");

-- CreateIndex
CREATE INDEX "NextStep_tokenId_idx" ON "NextStep"("tokenId");

-- CreateIndex
CREATE INDEX "NextStep_isCompleted_idx" ON "NextStep"("isCompleted");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomMapping" ADD CONSTRAINT "SymptomMapping_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VitalCheck" ADD CONSTRAINT "VitalCheck_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VitalCheck" ADD CONSTRAINT "VitalCheck_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consultation" ADD CONSTRAINT "Consultation_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NextStep" ADD CONSTRAINT "NextStep_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE CASCADE ON UPDATE CASCADE;
