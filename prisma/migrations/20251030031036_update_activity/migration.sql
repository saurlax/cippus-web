/*
  Warnings:

  - You are about to drop the column `endTime` on the `Contest` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Contest` table. All the data in the column will be lost.
  - Added the required column `endDate` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Made the column `content` on table `Notice` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Contest" DROP COLUMN "endTime",
DROP COLUMN "startTime";

-- AlterTable
ALTER TABLE "Notice" ALTER COLUMN "content" SET NOT NULL;
