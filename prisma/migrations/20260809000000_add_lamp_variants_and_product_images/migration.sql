-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "colour" TEXT,
ADD COLUMN IF NOT EXISTS "wattage" TEXT;

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "skuSnapshot" TEXT,
ADD COLUMN IF NOT EXISTS "selectedColour" TEXT,
ADD COLUMN IF NOT EXISTS "selectedWattage" TEXT;
