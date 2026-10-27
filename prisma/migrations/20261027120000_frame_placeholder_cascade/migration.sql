-- DropForeignKey
ALTER TABLE "FramePlaceholder" DROP CONSTRAINT "FramePlaceholder_frameId_fkey";

-- AddForeignKey
ALTER TABLE "FramePlaceholder" ADD CONSTRAINT "FramePlaceholder_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "FrameCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

