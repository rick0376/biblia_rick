-- AlterTable
ALTER TABLE "HymnVerse" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'VERSE';

-- CreateIndex
CREATE INDEX "HymnVerse_hymnId_position_idx" ON "HymnVerse"("hymnId", "position");
