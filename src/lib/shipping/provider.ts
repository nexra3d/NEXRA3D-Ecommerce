import { ShipmentStatus, ShipmentItem, Address } from '../../types';

export interface CreateShipmentParams {
  orderId: string;
  orderNumber: string;
  shippingAddress: Address;
  items?: ShipmentItem[];
  serviceType?: string;
  shippingCost?: number;
  estimatedDeliveryDate?: string;
  awbNumber?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

export interface ShippingProvider {
  name: string;
  createShipment(params: CreateShipmentParams): Promise<{
    shipmentNumber: string;
    awbNumber?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDeliveryDate?: string;
  }>;
  cancelShipment(shipmentNumber: string): Promise<boolean>;
  generateLabel(shipmentNumber: string): Promise<{ labelUrl: string; labelFormat?: string; labelGeneratedAt?: string }>;
  trackShipment(trackingNumber: string): Promise<{ status: ShipmentStatus; history: any[] }>;
}

export class ManualShippingProvider implements ShippingProvider {
  name = 'MANUAL';

  async createShipment(params: CreateShipmentParams) {
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const shipmentNumber = `SHP-NX-${randomSuffix}`;
    const awbNumber = params.awbNumber || `AWB-NX-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const trackingNumber = params.trackingNumber || awbNumber;
    const trackingUrl = params.trackingUrl || `https://track.nexra3d.com/shipment/${trackingNumber}`;
    const estimatedDeliveryDate = params.estimatedDeliveryDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return {
      shipmentNumber,
      awbNumber,
      trackingNumber,
      trackingUrl,
      estimatedDeliveryDate
    };
  }

  async cancelShipment(_shipmentNumber: string) {
    return true;
  }

  async generateLabel(shipmentNumber: string) {
    return {
      labelUrl: `/api/shipments/${shipmentNumber}/label`,
      labelFormat: 'PDF',
      labelGeneratedAt: new Date().toISOString()
    };
  }

  async trackShipment(_trackingNumber: string) {
    return { status: 'CREATED' as ShipmentStatus, history: [] };
  }
}

export const manualShippingProvider = new ManualShippingProvider();

export const shippingProviders: Record<string, ShippingProvider> = {
  MANUAL: manualShippingProvider
};
