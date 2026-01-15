-- Add status column to Request
ALTER TABLE "Request" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'OPEN';
