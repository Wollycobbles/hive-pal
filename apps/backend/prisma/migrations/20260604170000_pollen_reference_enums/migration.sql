-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "PollenRegion" AS ENUM ('UK_AND_IRELAND', 'EUROPE', 'NORTH_AMERICA', 'AUSTRALIA_AND_NEW_ZEALAND', 'SOUTH_AMERICA', 'ASIA', 'AFRICA');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$
BEGIN
  CREATE TYPE "PollenSeason" AS ENUM ('EARLY_SPRING', 'SPRING', 'LATE_SPRING', 'SUMMER', 'LATE_SUMMER', 'AUTUMN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "PollenReferenceRegion"
  ALTER COLUMN "region" TYPE "PollenRegion" USING "region"::text::"PollenRegion",
  ALTER COLUMN "seasons" TYPE "PollenSeason"[] USING array_replace(array_replace(array_replace(array_replace(array_replace(array_replace("seasons"::text[], 'early-spring', 'EARLY_SPRING'), 'spring', 'SPRING'), 'late-spring', 'LATE_SPRING'), 'summer', 'SUMMER'), 'late-summer', 'LATE_SUMMER'), 'autumn', 'AUTUMN')::"PollenSeason"[];
