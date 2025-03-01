-- CreateTable
CREATE TABLE "StickerCatalog" (
    "id" TEXT NOT NULL,
    "stickerName" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "StickerCatalog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StickerCatalog" ADD CONSTRAINT "StickerCatalog_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
