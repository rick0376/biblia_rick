/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Hymn` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Hymn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Hymn" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";
