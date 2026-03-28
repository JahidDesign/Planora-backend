-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "excerpt" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "tags" TEXT[];
