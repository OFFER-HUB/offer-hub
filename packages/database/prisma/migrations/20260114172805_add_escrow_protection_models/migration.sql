/*
  Warnings:

  - Changed the type of `opened_by` on the `disputes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `reason` on the `disputes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DisputeReason" AS ENUM ('NOT_DELIVERED', 'QUALITY_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "DisputeOpenedBy" AS ENUM ('BUYER', 'SELLER');

-- AlterTable
ALTER TABLE "disputes" DROP COLUMN "opened_by",
ADD COLUMN     "opened_by" "DisputeOpenedBy" NOT NULL,
DROP COLUMN "reason",
ADD COLUMN     "reason" "DisputeReason" NOT NULL;
