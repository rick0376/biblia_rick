-- CreateTable
CREATE TABLE "Hymn" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hymn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HymnVerse" (
    "id" SERIAL NOT NULL,
    "hymnId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "HymnVerse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hymn_number_key" ON "Hymn"("number");

-- CreateIndex
CREATE UNIQUE INDEX "HymnVerse_hymnId_number_key" ON "HymnVerse"("hymnId", "number");

-- AddForeignKey
ALTER TABLE "HymnVerse" ADD CONSTRAINT "HymnVerse_hymnId_fkey" FOREIGN KEY ("hymnId") REFERENCES "Hymn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
