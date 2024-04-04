/*
  Warnings:

  - Added the required column `artist` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `favoriteAlbum` VARCHAR(191) NULL,
    ADD COLUMN `favoriteArtist` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Vote` ADD COLUMN `artist` VARCHAR(191) NOT NULL;
