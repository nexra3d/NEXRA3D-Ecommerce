-- AlterTable
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "requiresCustomization" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "requiresImageUpload" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "minimumImageUploads" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "maximumImageUploads" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "customizationText" TEXT;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "customizationText" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "cart_item_customization_images" (
    "id" TEXT NOT NULL,
    "cartItemId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_item_customization_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "order_item_customization_images" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "publicId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_item_customization_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "cart_item_customization_images_cartItemId_idx" ON "cart_item_customization_images"("cartItemId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "order_item_customization_images_orderItemId_idx" ON "order_item_customization_images"("orderItemId");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cart_item_customization_images_cartItemId_fkey'
  ) THEN
    ALTER TABLE "cart_item_customization_images" ADD CONSTRAINT "cart_item_customization_images_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "cart_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_item_customization_images_orderItemId_fkey'
  ) THEN
    ALTER TABLE "order_item_customization_images" ADD CONSTRAINT "order_item_customization_images_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
