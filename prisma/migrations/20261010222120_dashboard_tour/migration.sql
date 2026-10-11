-- CreateEnum
CREATE TYPE "ImageSection" AS ENUM ('GALLERY', 'DASHBOARD');

-- AlterTable
ALTER TABLE "ProjectImage" ADD COLUMN     "section" "ImageSection" NOT NULL DEFAULT 'GALLERY',
ADD COLUMN     "title" JSONB;

-- CreateTable
CREATE TABLE "ProjectHotspot" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "icon" TEXT NOT NULL,
    "label" JSONB NOT NULL,
    "body" JSONB NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectHotspot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectHotspot_imageId_sortOrder_idx" ON "ProjectHotspot"("imageId", "sortOrder");

-- AddForeignKey
ALTER TABLE "ProjectHotspot" ADD CONSTRAINT "ProjectHotspot_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "ProjectImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
