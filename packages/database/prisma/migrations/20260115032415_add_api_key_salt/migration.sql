/*
  Warnings:

  - Added the required column `salt` to the `api_keys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "salt" TEXT NOT NULL;
