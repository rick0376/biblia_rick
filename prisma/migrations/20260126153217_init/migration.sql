/*
  Warnings:

  - The `type` column on the `HymnVerse` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[chapterId,number,translationId]` on the table `Verse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `translationId` to the `Verse` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "HymnVerseType" AS ENUM ('VERSE', 'CHORUS');

-- DropForeignKey
ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_bookId_fkey";

-- DropForeignKey
ALTER TABLE "Verse" DROP CONSTRAINT "Verse_chapterId_fkey";

-- DropIndex
DROP INDEX "Verse_chapterId_number_key";

-- AlterTable
ALTER TABLE "HymnVerse" DROP COLUMN "type",
ADD COLUMN     "type" "HymnVerseType" NOT NULL DEFAULT 'VERSE';

-- AlterTable
ALTER TABLE "Verse" ADD COLUMN     "translationId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Translation" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Translation_code_key" ON "Translation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Verse_chapterId_number_translationId_key" ON "Verse"("chapterId", "number", "translationId");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verse" ADD CONSTRAINT "Verse_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Verse" ADD CONSTRAINT "Verse_translationId_fkey" FOREIGN KEY ("translationId") REFERENCES "Translation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
