-- CreateEnum
CREATE TYPE "VerseMarkColor" AS ENUM ('YELLOW', 'BLUE', 'GREEN');

-- CreateTable
CREATE TABLE "VerseMark" (
    "id" SERIAL NOT NULL,
    "verseId" INTEGER NOT NULL,
    "color" "VerseMarkColor" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerseMark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerseMark_verseId_key" ON "VerseMark"("verseId");

-- AddForeignKey
ALTER TABLE "VerseMark" ADD CONSTRAINT "VerseMark_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "Verse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
