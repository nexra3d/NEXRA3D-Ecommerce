-- CreateTable
CREATE TABLE IF NOT EXISTS "custom_orders" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "description" TEXT,
    "customOrderName" TEXT,
    "imageUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "amount" DECIMAL(10,2) NOT NULL,
    "deliveryType" TEXT NOT NULL DEFAULT 'STORE_PICKUP',
    "notes" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "razorpayOrderId" TEXT,
    "razorpayQrId" TEXT,
    "qrImageUrl" TEXT,
    "paymentLink" TEXT,
    "isSimulated" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "custom_orders_phone_idx" ON "custom_orders"("phone");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "custom_orders_paymentStatus_idx" ON "custom_orders"("paymentStatus");
