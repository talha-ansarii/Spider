/*
  Warnings:

  - You are about to drop the column `projectId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_projectId_fkey";

-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "projectId";

-- DropTable
DROP TABLE "public"."Project";
