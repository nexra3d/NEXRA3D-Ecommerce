import crypto from 'crypto';
import Razorpay from 'razorpay';
import QRCode from 'qrcode';

export interface CreateCustomOrderPaymentResult {
  razorpayOrderId: string;
  razorpayQrId: string;
  qrImageUrl: string;
  paymentLink: string;
  isSimulated: boolean;
  expiresAt: Date;
}

/**
 * Initializes and executes Razorpay Order & Dynamic QR Code creation.
 * Returns order ID, QR ID, QR data URL / image URL, and payment link.
 */
export async function generateRazorpayCustomOrderQr(params: {
  orderDbId: string;
  customerName: string;
  phone: string;
  email?: string | null;
  description?: string | null;
  amount: number;
  deliveryType: string;
  validityMinutes?: number;
}): Promise<CreateCustomOrderPaymentResult> {
  const {
    orderDbId,
    customerName,
    phone,
    email,
    description,
    amount,
    deliveryType,
    validityMinutes = 60
  } = params;

  const amountInPaise = Math.round(amount * 100);
  const expiresAt = new Date(Date.now() + validityMinutes * 60 * 1000);
  const closeByTimestamp = Math.floor(expiresAt.getTime() / 1000);

  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const hasLiveKeys = Boolean(keyId && keySecret && keyId !== 'rzp_test_sample_key_id');

  // Standard UPI URI for instant fallback / mobile link
  // Uses Nexra 3D official handle or Razorpay virtual VPA
  const upiPayUri = `upi://pay?pa=nexra3d@icici&pn=NEXRA%203D&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    `Custom Order ${orderDbId} - ${customerName}`
  )}`;

  let razorpayOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let razorpayQrId = `qr_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let qrImageUrl = '';
  let paymentLink = upiPayUri;
  let isSimulated = !hasLiveKeys;

  if (hasLiveKeys) {
    try {
      // 1. Create Razorpay Order
      const rzpInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const orderRes = await rzpInstance.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: orderDbId.slice(0, 40),
        notes: {
          custom_order_id: orderDbId,
          customer_name: customerName,
          customer_phone: phone,
          delivery_type: deliveryType
        }
      });

      if (orderRes && orderRes.id) {
        razorpayOrderId = orderRes.id;
      }

      // 2. Call Razorpay QR Code API (POST /v1/payments/qr_codes)
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const qrPayload = {
        type: 'upi_qr',
        name: 'NEXRA 3D Custom Order',
        usage: 'single_use',
        fixed_amount: true,
        payment_amount: amountInPaise,
        description: (description || `Custom Order ${orderDbId} - ${customerName}`).slice(0, 100),
        notes: {
          custom_order_id: orderDbId,
          razorpay_order_id: razorpayOrderId,
          customer_name: customerName,
          customer_phone: phone,
          delivery_type: deliveryType
        },
        close_by: closeByTimestamp
      };

      const qrResponse = await fetch('https://api.razorpay.com/v1/payments/qr_codes', {
        method: 'POST',
        headers: {
          Authorization: authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(qrPayload)
      });

      if (qrResponse.ok) {
        const qrData: any = await qrResponse.json();
        if (qrData.id) razorpayQrId = qrData.id;
        if (qrData.image_url) qrImageUrl = qrData.image_url;
        if (qrData.short_url) paymentLink = qrData.short_url;
        isSimulated = false;
        console.log(`[Razorpay QR] Dynamic QR created: ${razorpayQrId} for order ${orderDbId}`);
      } else {
        const errText = await qrResponse.text();
        console.warn('[Razorpay QR] API returned error, falling back to dynamic UPI QR:', errText);
      }
    } catch (err: any) {
      console.warn('[Razorpay QR] Exception calling Razorpay API:', err?.message || err);
    }
  }

  // If Razorpay image_url is not available or fallback needed, generate high-res SVG/PNG QR data URL
  if (!qrImageUrl) {
    try {
      qrImageUrl = await QRCode.toDataURL(paymentLink, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 380,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    } catch (qrErr) {
      console.error('[QRCode] Failed to generate data URL:', qrErr);
      qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentLink)}`;
    }
  }

  return {
    razorpayOrderId,
    razorpayQrId,
    qrImageUrl,
    paymentLink,
    isSimulated,
    expiresAt
  };
}

/**
 * Deactivates an active QR code in Razorpay when cancelled or expired.
 */
export async function deactivateRazorpayQrCode(razorpayQrId: string): Promise<boolean> {
  if (!razorpayQrId || razorpayQrId.startsWith('qr_sim_')) return true;

  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  if (!keyId || !keySecret || keyId === 'rzp_test_sample_key_id') return true;

  try {
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const res = await fetch(`https://api.razorpay.com/v1/payments/qr_codes/${razorpayQrId}/close`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      console.log(`[Razorpay QR] Successfully deactivated QR code ${razorpayQrId}`);
      return true;
    } else {
      const errText = await res.text();
      console.warn(`[Razorpay QR] Could not deactivate QR ${razorpayQrId}:`, errText);
      return false;
    }
  } catch (err: any) {
    console.error(`[Razorpay QR] Error deactivating QR ${razorpayQrId}:`, err);
    return false;
  }
}

/**
 * Verifies Razorpay webhook HMAC-SHA256 signature.
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string | Buffer,
  signature: string,
  secret?: string
): boolean {
  const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    // If no secret configured in development, allow request but log warning
    console.warn('[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET is not configured; skipping cryptographic verification in dev.');
    return true;
  }

  if (!signature) return false;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(expectedSignature, 'utf8'), Buffer.from(signature, 'utf8'));
  } catch (err) {
    console.error('[Razorpay Webhook] Signature verification failed:', err);
    return false;
  }
}
