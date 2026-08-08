-- Add Delhivery fields to orders table safely without dropping data
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shippingProvider" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "awbNumber" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipmentId" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "estimatedDelivery" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipmentStatus" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "pickupRequested" BOOLEAN DEFAULT false;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "labelUrl" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "trackingUrl" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "manifestUrl" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "lastTrackingUpdate" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "trackingHistory" JSONB;
