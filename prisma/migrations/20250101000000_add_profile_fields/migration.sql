-- Add profile fields for user onboarding
ALTER TABLE "User" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "operatingArea" TEXT NOT NULL DEFAULT '';
