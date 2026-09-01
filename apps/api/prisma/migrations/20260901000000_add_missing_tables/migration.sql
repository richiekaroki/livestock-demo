-- AlterTable: Add missing columns to audit_logs
ALTER TABLE "audit_logs" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "beforeValue" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "afterValue" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- AlterTable: Add missing columns to users
ALTER TABLE "users" ADD COLUMN "permissions" TEXT NOT NULL DEFAULT '[]';

-- AlterTable: Add missing columns to outbreaks
ALTER TABLE "outbreaks" ADD COLUMN "symptoms" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "outbreaks" ADD COLUMN "actions" JSONB NOT NULL DEFAULT '[]';

-- AlterTable: Add missing column to animals
ALTER TABLE "animals" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- CreateTable: disease_risks
CREATE TABLE "disease_risks" (
    "id" SERIAL NOT NULL,
    "county" TEXT NOT NULL,
    "diseaseType" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL DEFAULT 'low',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "factors" JSONB NOT NULL DEFAULT '[]',
    "lastCalculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "disease_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable: mortalities
CREATE TABLE "mortalities" (
    "id" SERIAL NOT NULL,
    "animalId" INTEGER NOT NULL,
    "cause" TEXT NOT NULL,
    "diseaseName" TEXT,
    "reportedBy" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mortalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable: weight_records
CREATE TABLE "weight_records" (
    "id" SERIAL NOT NULL,
    "animalId" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "weight_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable: pending_invitations
CREATE TABLE "pending_invitations" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "county" TEXT NOT NULL,
    "subCounty" TEXT,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pending_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable: push_tokens
CREATE TABLE "push_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "disease_risks_county_diseaseType_key" ON "disease_risks"("county", "diseaseType");
CREATE INDEX "weight_records_animalId_recordedAt_idx" ON "weight_records"("animalId", "recordedAt");
CREATE UNIQUE INDEX "pending_invitations_token_key" ON "pending_invitations"("token");
CREATE UNIQUE INDEX "push_tokens_token_key" ON "push_tokens"("token");

-- AddForeignKey
ALTER TABLE "mortalities" ADD CONSTRAINT "mortalities_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
