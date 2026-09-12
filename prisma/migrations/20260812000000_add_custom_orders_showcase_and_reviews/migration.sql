-- AlterTable: Add showcase fields to custom_orders
ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "customOrderName" TEXT;
ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "custom_order_name" TEXT;
ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "image_url" TEXT;
ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "custom_orders" ADD COLUMN IF NOT EXISTS "is_public" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "custom_orders_isPublic_idx" ON "custom_orders"("isPublic");

-- CreateTable: custom_order_reviews
CREATE TABLE IF NOT EXISTS "custom_order_reviews" (
    "id" TEXT NOT NULL,
    "customOrderId" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_order_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "custom_order_reviews_customOrderId_idx" ON "custom_order_reviews"("customOrderId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'custom_order_reviews_customOrderId_fkey'
  ) THEN
    ALTER TABLE "custom_order_reviews"
    ADD CONSTRAINT "custom_order_reviews_customOrderId_fkey"
    FOREIGN KEY ("customOrderId") REFERENCES "custom_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
