/*
  Warnings:

  - Added the required column `image` to the `service_category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "service_category" ADD COLUMN     "image" TEXT NOT NULL;
