export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: 'HOME' | 'WORK' | 'OTHER';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string | null;
  isActive?: boolean;
  parent?: Category | null;
  children?: Category[];
  subcategories?: Subcategory[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  images?: string[];
  verifiedPurchase: boolean;
  createdAt: string;
  helpfulCount?: number;
  reported?: boolean;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  publicId?: string | null;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  mrp: number;
  stockQuantity: number;
  attributes?: Record<string, any> | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name?: string;
  title?: string;
  slug: string;
  sku: string;
  shortDescription?: string | null;
  description?: string;
  price: number;
  mrp?: number;
  salePrice?: number;
  discountPercentage?: number;
  taxPercentage?: number;
  stockQuantity?: number;
  lowStockThreshold?: number;
  stock?: number;
  categoryId: string;
  subcategoryId?: string;
  category?: Category;
  images?: string[];
  productImages?: ProductImage[];
  productVariants?: ProductVariant[];
  variants?: ProductVariant[];
  imageUrl?: string | null;
  brand?: string;
  rating?: number;
  reviewCount?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaDescription?: string | null;
  specifications?: Record<string, any>;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'CREATED' | 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type PaymentMethod = 'RAZORPAY' | 'COD' | 'CARD' | 'UPI';

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productTitle: string;
  productImage: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export type ShipmentStatus =
  | 'CREATED'
  | 'READY_TO_SHIP'
  | 'PACKED'
  | 'SHIPPED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'DELIVERY_ATTEMPTED'
  | 'FAILED'
  | 'RETURNED'
  | 'CANCELLED';

export interface ShipmentStatusHistory {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  description?: string;
  location?: string;
  timestamp: string;
  source: 'ADMIN' | 'SYSTEM' | 'COURIER' | 'WEBHOOK' | 'CUSTOMER';
  createdAt: string;
}

export interface ShipmentItem {
  orderItemId: string;
  productId: string;
  productTitle?: string;
  quantity: number;
}

export interface Shipment {
  id: string;
  orderId: string;
  orderNumber?: string;
  shipmentNumber: string;
  provider: string;
  serviceType?: string;
  awbNumber?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  status: ShipmentStatus;
  shippingCost: number;
  estimatedDeliveryDate?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  labelUrl?: string;
  labelFormat?: string;
  labelGeneratedAt?: string;
  items?: ShipmentItem[];
  statusHistory: ShipmentStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderTrackingEvent {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  invoiceNumber?: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  tax: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentId?: string; // Razorpay payment ID
  razorpayOrderId?: string;
  razorpaySignature?: string;
  paymentFailureReason?: string;
  paymentVerifiedAt?: string;
  stockDeducted?: boolean;
  invoiceGenerated?: boolean;
  confirmationEmailSent?: boolean;
  trackingEvents: OrderTrackingEvent[];
  courierName?: string;
  trackingNumber?: string;
  shipments?: Shipment[];
  createdAt: string;
  estimatedDeliveryDate: string;
}

export interface EmailNotification {
  id: string;
  toEmail: string;
  subject: string;
  type: 'WELCOME' | 'ORDER_CONFIRMATION' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'PASSWORD_RESET';
  content: string;
  sentAt: string;
  status: 'DELIVERED' | 'FAILED' | 'PENDING';
}

export interface ProductFilterState {
  categoryId?: string;
  subcategoryId?: string;
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  minRating?: number;
  inStockOnly?: boolean;
  onSaleOnly?: boolean;
  sortBy?: 'popular' | 'newest' | 'price-low-high' | 'price-high-low' | 'rating';
}

export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  topSellingProducts: { productId: string; title: string; quantitySold: number; totalRevenue: number }[];
  categoryBreakdown: { categoryName: string; percentage: number; revenue: number }[];
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  gallery?: string[] | null;
  industries?: string[] | null;
  isActive?: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type QuoteStatus = 
  | 'Submitted' 
  | 'Engineering Review' 
  | 'Quotation Prepared' 
  | 'Awaiting Customer Approval' 
  | 'Approved' 
  | 'Production' 
  | 'Quality Inspection' 
  | 'Completed' 
  | 'Ready for Dispatch' 
  | 'NEW' 
  | 'REVIEWING' 
  | 'QUOTED' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'CONVERTED' 
  | 'CLOSED';

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  serviceId?: string | null;
  service?: Service | null;
  serviceName?: string | null;
  projectDescription: string;
  quantity?: number;
  materialPreference?: string | null;
  deliveryDate?: string | null;
  fileUrl?: string | null;
  additionalNotes?: string | null;
  status: QuoteStatus;
  estimatedPrice?: number;
  leadTimeDays?: number;
  materialDetails?: string;
  revisionNotes?: string;
  internalNotes?: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  company?: string | null;
  designation?: string | null;
  avatarUrl?: string | null;
  rating: number;
  content: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  ctaText?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: any;
  updatedAt?: string;
}

