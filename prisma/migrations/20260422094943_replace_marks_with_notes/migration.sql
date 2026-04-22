/*
  Warnings:

  - You are about to drop the `VerseMark` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VerseMark" DROP CONSTRAINT "VerseMark_verseId_fkey";

-- DropTable
DROP TABLE "VerseMark";

-- DropEnum
DROP TYPE "VerseMarkColor";

-- CreateTable
CREATE TABLE "VerseNote" (
    "id" SERIAL NOT NULL,
    "verseId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerseNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerseNote_verseId_key" ON "VerseNote"("verseId");

-- AddForeignKey
ALTER TABLE "VerseNote" ADD CONSTRAINT "VerseNote_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "Verse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
