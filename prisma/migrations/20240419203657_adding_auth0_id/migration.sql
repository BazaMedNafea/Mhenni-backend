/*
  Warnings:

  - Added the required column `auth0Id` to the `customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auth0Id` to the `provider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customer" ADD COLUMN     "auth0Id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "provider" ADD COLUMN     "auth0Id" TEXT NOT NULL;
