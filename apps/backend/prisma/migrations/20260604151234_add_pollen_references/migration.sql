-- CreateEnum
CREATE TYPE "PollenRegion" AS ENUM ('UK_AND_IRELAND', 'EUROPE', 'NORTH_AMERICA', 'AUSTRALIA_AND_NEW_ZEALAND', 'SOUTH_AMERICA', 'ASIA', 'AFRICA');

-- CreateEnum
CREATE TYPE "PollenSeason" AS ENUM ('EARLY_SPRING', 'SPRING', 'LATE_SPRING', 'SUMMER', 'LATE_SUMMER', 'AUTUMN');

-- CreateTable
CREATE TABLE "PollenReference" (
    "id" TEXT NOT NULL,
    "plantName" TEXT NOT NULL,
    "scientificName" TEXT,
    "colorLabel" TEXT NOT NULL,
    "colorGroup" TEXT NOT NULL,
    "hexColor" TEXT NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PollenReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PollenReferenceRegion" (
    "id" TEXT NOT NULL,
    "pollenReferenceId" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "seasons" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PollenReferenceRegion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PollenReference_plantName_idx" ON "PollenReference"("plantName");

-- CreateIndex
CREATE INDEX "PollenReference_scientificName_idx" ON "PollenReference"("scientificName");

-- CreateIndex
CREATE INDEX "PollenReference_colorGroup_idx" ON "PollenReference"("colorGroup");

-- CreateIndex
CREATE INDEX "PollenReference_active_idx" ON "PollenReference"("active");

-- CreateIndex
CREATE INDEX "PollenReferenceRegion_pollenReferenceId_idx" ON "PollenReferenceRegion"("pollenReferenceId");

-- CreateIndex
CREATE INDEX "PollenReferenceRegion_region_idx" ON "PollenReferenceRegion"("region");

-- CreateIndex
CREATE UNIQUE INDEX "PollenReferenceRegion_pollenReferenceId_region_key" ON "PollenReferenceRegion"("pollenReferenceId", "region");

-- AddForeignKey
ALTER TABLE "PollenReferenceRegion" ADD CONSTRAINT "PollenReferenceRegion_pollenReferenceId_fkey" FOREIGN KEY ("pollenReferenceId") REFERENCES "PollenReference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
