/*
  Warnings:

  - The primary key for the `expense` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `expense_desc` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `expense_id` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `total_amount` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `expense` table. All the data in the column will be lost.
  - Added the required column `description` to the `expense` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "expense" DROP CONSTRAINT "expense_user_id_fkey";

-- AlterTable
ALTER TABLE "expense" DROP CONSTRAINT "expense_pkey",
DROP COLUMN "expense_desc",
DROP COLUMN "expense_id",
DROP COLUMN "quantity",
DROP COLUMN "total_amount",
DROP COLUMN "user_id",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "expense_pkey" PRIMARY KEY ("id");
