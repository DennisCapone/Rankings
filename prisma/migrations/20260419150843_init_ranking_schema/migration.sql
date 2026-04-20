/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Ranking" (
    "code" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creator" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "category" TEXT[],
    "accuracy" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "times" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "rankingCode" TEXT NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_rankingCode_fkey" FOREIGN KEY ("rankingCode") REFERENCES "Ranking"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
