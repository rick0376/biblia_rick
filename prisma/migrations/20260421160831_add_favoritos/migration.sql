-- CreateTable
CREATE TABLE "FavoriteVerse" (
    "id" SERIAL NOT NULL,
    "verseId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteVerse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteHymn" (
    "id" SERIAL NOT NULL,
    "hymnId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteHymn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteVerse_verseId_key" ON "FavoriteVerse"("verseId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteHymn_hymnId_key" ON "FavoriteHymn"("hymnId");

-- AddForeignKey
ALTER TABLE "FavoriteVerse" ADD CONSTRAINT "FavoriteVerse_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "Verse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteHymn" ADD CONSTRAINT "FavoriteHymn_hymnId_fkey" FOREIGN KEY ("hymnId") REFERENCES "Hymn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
