/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `ContentSession` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `ContentSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CollaboratorRole" AS ENUM ('OWNER', 'EDITOR', 'COMMENTER', 'VIEWER');

-- AlterTable
ALTER TABLE "ContentSession" ADD COLUMN     "allowComments" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowEditing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "characterCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "documentSettings" JSONB,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isShared" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTemplate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paragraphCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "readingTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shareToken" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "templateCategory" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "wordCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DocumentVersion" (
    "id" TEXT NOT NULL,
    "contentSessionId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "documentSettings" JSONB,
    "changesSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "DocumentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentComment" (
    "id" TEXT NOT NULL,
    "contentSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "selectionStart" INTEGER,
    "selectionEnd" INTEGER,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentCollaborator" (
    "id" TEXT NOT NULL,
    "contentSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CollaboratorRole" NOT NULL DEFAULT 'VIEWER',
    "invitedBy" TEXT NOT NULL,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "DocumentCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentVersion_contentSessionId_idx" ON "DocumentVersion"("contentSessionId");

-- CreateIndex
CREATE INDEX "DocumentVersion_createdAt_idx" ON "DocumentVersion"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentVersion_contentSessionId_version_key" ON "DocumentVersion"("contentSessionId", "version");

-- CreateIndex
CREATE INDEX "DocumentComment_contentSessionId_idx" ON "DocumentComment"("contentSessionId");

-- CreateIndex
CREATE INDEX "DocumentComment_userId_idx" ON "DocumentComment"("userId");

-- CreateIndex
CREATE INDEX "DocumentComment_createdAt_idx" ON "DocumentComment"("createdAt");

-- CreateIndex
CREATE INDEX "DocumentComment_parentId_idx" ON "DocumentComment"("parentId");

-- CreateIndex
CREATE INDEX "DocumentCollaborator_contentSessionId_idx" ON "DocumentCollaborator"("contentSessionId");

-- CreateIndex
CREATE INDEX "DocumentCollaborator_userId_idx" ON "DocumentCollaborator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentCollaborator_contentSessionId_userId_key" ON "DocumentCollaborator"("contentSessionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentSession_shareToken_key" ON "ContentSession"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "ContentSession_slug_key" ON "ContentSession"("slug");

-- CreateIndex
CREATE INDEX "ContentSession_isPublished_idx" ON "ContentSession"("isPublished");

-- CreateIndex
CREATE INDEX "ContentSession_slug_idx" ON "ContentSession"("slug");

-- CreateIndex
CREATE INDEX "ContentSession_shareToken_idx" ON "ContentSession"("shareToken");

-- AddForeignKey
ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_contentSessionId_fkey" FOREIGN KEY ("contentSessionId") REFERENCES "ContentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_contentSessionId_fkey" FOREIGN KEY ("contentSessionId") REFERENCES "ContentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentComment" ADD CONSTRAINT "DocumentComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DocumentComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentCollaborator" ADD CONSTRAINT "DocumentCollaborator_contentSessionId_fkey" FOREIGN KEY ("contentSessionId") REFERENCES "ContentSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentCollaborator" ADD CONSTRAINT "DocumentCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
