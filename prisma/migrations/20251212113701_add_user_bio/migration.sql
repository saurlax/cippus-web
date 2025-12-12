/*
  Warnings:

  - You are about to drop the column `rewardId` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the `Reward` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `awardId` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AwardLevel" AS ENUM ('national', 'provincial', 'university', 'college');

-- CreateEnum
CREATE TYPE "AwardType" AS ENUM ('teamFirstPrize', 'teamSecondPrize', 'teamThirdPrize', 'individual1nd', 'individual2nd', 'individual3rd', 'individual4th', 'individual5th', 'individual6th');

-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_rewardId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "rewardId",
ADD COLUMN     "awardId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT;

-- DropTable
DROP TABLE "public"."Reward";

-- DropEnum
DROP TYPE "public"."RewardLevel";

-- DropEnum
DROP TYPE "public"."RewardType";

-- CreateTable
CREATE TABLE "Award" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "contestId" INTEGER NOT NULL,
    "level" "AwardLevel" NOT NULL,
    "type" "AwardType" NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'draft',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_awardId_fkey" FOREIGN KEY ("awardId") REFERENCES "Award"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
