-- Create a local shadow user table linked to the central LHP panel user.
CREATE TABLE "BibleUser" (
    "id" TEXT NOT NULL,
    "panelUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BibleUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BibleUser_panelUserId_key" ON "BibleUser"("panelUserId");

-- Preserve existing global favorites/notes under a legacy owner instead of deleting data.
INSERT INTO "BibleUser" ("id", "panelUserId", "name", "username", "updatedAt")
VALUES ('legacy', 'legacy', 'Dados anteriores', 'legacy', CURRENT_TIMESTAMP);

ALTER TABLE "FavoriteVerse" DROP CONSTRAINT IF EXISTS "FavoriteVerse_verseId_key";
ALTER TABLE "FavoriteHymn" DROP CONSTRAINT IF EXISTS "FavoriteHymn_hymnId_key";
ALTER TABLE "VerseNote" DROP CONSTRAINT IF EXISTS "VerseNote_verseId_key";

ALTER TABLE "FavoriteVerse" ADD COLUMN "userId" TEXT;
ALTER TABLE "FavoriteHymn" ADD COLUMN "userId" TEXT;
ALTER TABLE "VerseNote" ADD COLUMN "userId" TEXT;

UPDATE "FavoriteVerse" SET "userId" = 'legacy' WHERE "userId" IS NULL;
UPDATE "FavoriteHymn" SET "userId" = 'legacy' WHERE "userId" IS NULL;
UPDATE "VerseNote" SET "userId" = 'legacy' WHERE "userId" IS NULL;

ALTER TABLE "FavoriteVerse" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "FavoriteHymn" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "VerseNote" ALTER COLUMN "userId" SET NOT NULL;

CREATE UNIQUE INDEX "FavoriteVerse_userId_verseId_key" ON "FavoriteVerse"("userId", "verseId");
CREATE INDEX "FavoriteVerse_userId_idx" ON "FavoriteVerse"("userId");
CREATE UNIQUE INDEX "FavoriteHymn_userId_hymnId_key" ON "FavoriteHymn"("userId", "hymnId");
CREATE INDEX "FavoriteHymn_userId_idx" ON "FavoriteHymn"("userId");
CREATE UNIQUE INDEX "VerseNote_userId_verseId_key" ON "VerseNote"("userId", "verseId");
CREATE INDEX "VerseNote_userId_idx" ON "VerseNote"("userId");

ALTER TABLE "FavoriteVerse" ADD CONSTRAINT "FavoriteVerse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "BibleUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FavoriteHymn" ADD CONSTRAINT "FavoriteHymn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "BibleUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VerseNote" ADD CONSTRAINT "VerseNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "BibleUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
