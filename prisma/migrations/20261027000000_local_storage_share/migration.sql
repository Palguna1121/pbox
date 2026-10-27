-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "shareToken" TEXT,
ADD COLUMN     "size" INTEGER,
ADD COLUMN     "storageKey" TEXT,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "width" INTEGER;

-- Backfill share tokens for existing rows before enforcing NOT NULL + UNIQUE
UPDATE "Image" SET "shareToken" = md5(random()::text || "id" || clock_timestamp()::text) WHERE "shareToken" IS NULL;

ALTER TABLE "Image" ALTER COLUMN "shareToken" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Image_shareToken_key" ON "Image"("shareToken");

-- CreateIndex
CREATE INDEX "Image_userId_idx" ON "Image"("userId");

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
