-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('TECHNICAL', 'REPORT', 'BLOG', 'STORY', 'ACADEMIC', 'BUSINESS', 'GENERAL');

-- AlterTable
ALTER TABLE "ContentSession" ADD COLUMN     "contentType" "ContentType" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "grammarIssues" JSONB,
ADD COLUMN     "suggestions" JSONB,
ADD COLUMN     "vocabularySuggestions" JSONB;

-- CreateIndex
CREATE INDEX "ContentSession_contentType_idx" ON "ContentSession"("contentType");
