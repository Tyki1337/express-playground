/*
  Warnings:

  - Added the required column `discount` to the `Promo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "totalFinal" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Promo" ADD COLUMN     "discount" INTEGER NOT NULL;
