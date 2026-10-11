-- AlterTable
ALTER TABLE "ProjectHotspot" ADD COLUMN     "mediaId" TEXT;

-- AddForeignKey
ALTER TABLE "ProjectHotspot" ADD CONSTRAINT "ProjectHotspot_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

