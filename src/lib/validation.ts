import { z } from 'zod';

export function cleanNormalizeEmail(rawEmail: any): string {
  if (!rawEmail || typeof rawEmail !== 'string') return '';
  let cleaned = rawEmail.trim();
  const mdMatch = cleaned.match(/\[([^\]]+)\]\((?:mailto:)?([^)]+)\)/i);
  if (mdMatch) {
    cleaned = mdMatch[1] || mdMatch[2];
  }
  cleaned = cleaned.replace(/^mailto:/i, '');
  cleaned = cleaned.replace(/^[\s<\[]+|[\s>\]]+$/g, '');
  const emailMatch = cleaned.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    cleaned = emailMatch[0];
  }
  return cleaned.trim().toLowerCase();
}

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    email: z.preprocess((val) => cleanNormalizeEmail(val), z.string().email('Please enter a valid email address')),
    password: z.string().min(3, 'Password must be at least 3 characters long'),
    confirmPassword: z.string().optional()
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const loginSchema = z.object({
  email: z.preprocess((val) => cleanNormalizeEmail(val), z.string().email('Please enter a valid email address')),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.preprocess((val) => cleanNormalizeEmail(val), z.string().email('Please enter a valid email address').optional().or(z.literal(''))),
  phone: z.string().trim().optional().or(z.literal('')),
  company: z.string().trim().optional().or(z.literal('')),
  gst: z.string().trim().optional().or(z.literal('')),
  avatarUrl: z.string().trim().optional().or(z.literal('')),
  addressLine1: z.string().trim().optional().or(z.literal('')),
  addressLine2: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().optional().or(z.literal('')),
  state: z.string().trim().optional().or(z.literal('')),
  country: z.string().trim().optional().or(z.literal('')),
  postalCode: z.string().trim().optional().or(z.literal('')),
  userId: z.string().optional(),
  userEmail: z.string().optional()
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters long')
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, 'New password must contain at least one letter and one number'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password')
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword']
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// --- STAGE 4: CATEGORY & PRODUCT VALIDATION SCHEMAS ---

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  isActive: z.boolean().default(true),
  parentId: z.string().trim().optional().nullable()
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const productCreateSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters'),
  slug: z.string().trim().optional(),
  sku: z.string().trim().min(2, 'SKU must be at least 2 characters'),
  shortDescription: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  mrp: z.coerce.number().min(0, 'MRP must be 0 or greater').optional().nullable(),
  discountPercentage: z.coerce.number().min(0).max(100).default(0),
  taxPercentage: z.coerce.number().min(0).max(100).default(0),
  stockQuantity: z.coerce.number().int().min(0, 'Stock quantity cannot be negative').default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  weight: z.coerce.number().min(0, 'Weight must be non-negative').optional().nullable(),
  length: z.coerce.number().min(0, 'Length must be non-negative').optional().nullable(),
  width: z.coerce.number().min(0, 'Width must be non-negative').optional().nullable(),
  height: z.coerce.number().min(0, 'Height must be non-negative').optional().nullable(),
  specifications: z.record(z.string(), z.any()).optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  requiresCustomization: z.boolean().default(false),
  requiresImageUpload: z.boolean().default(false),
  minimumImageUploads: z.coerce.number().int().min(1, 'Minimum uploads must be at least 1').default(1),
  maximumImageUploads: z.coerce.number().int().min(1, 'Maximum uploads must be at least 1').max(20, 'Maximum uploads cannot exceed 20').default(5),
  categoryId: z.string().min(1, 'Category selection is required'),
  seoTitle: z.string().trim().optional().nullable(),
  seoDescription: z.string().trim().optional().nullable(),
  metaDescription: z.string().trim().optional().nullable()
}).refine((data) => (data.mrp !== undefined && data.mrp !== null ? data.mrp >= data.price : true), {
  message: 'MRP must be greater than or equal to selling price',
  path: ['mrp']
}).refine((data) => data.maximumImageUploads >= data.minimumImageUploads, {
  message: 'Maximum image uploads must be greater than or equal to minimum image uploads',
  path: ['maximumImageUploads']
});

export const productUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters').optional(),
  slug: z.string().trim().optional(),
  sku: z.string().trim().min(2, 'SKU must be at least 2 characters').optional(),
  shortDescription: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  price: z.coerce.number().min(0, 'Price must be 0 or greater').optional(),
  mrp: z.coerce.number().min(0, 'MRP must be 0 or greater').optional(),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  taxPercentage: z.coerce.number().min(0).max(100).optional(),
  stockQuantity: z.coerce.number().int().min(0, 'Stock quantity cannot be negative').optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
  weight: z.coerce.number().min(0, 'Weight must be non-negative').optional().nullable(),
  length: z.coerce.number().min(0, 'Length must be non-negative').optional().nullable(),
  width: z.coerce.number().min(0, 'Width must be non-negative').optional().nullable(),
  height: z.coerce.number().min(0, 'Height must be non-negative').optional().nullable(),
  specifications: z.record(z.string(), z.any()).optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  requiresCustomization: z.boolean().optional(),
  requiresImageUpload: z.boolean().optional(),
  minimumImageUploads: z.coerce.number().int().min(1).optional(),
  maximumImageUploads: z.coerce.number().int().min(1).max(20).optional(),
  categoryId: z.string().min(1).optional(),
  seoTitle: z.string().trim().optional().nullable(),
  seoDescription: z.string().trim().optional().nullable(),
  metaDescription: z.string().trim().optional().nullable()
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

// --- STAGE 5: PRODUCT VARIANT VALIDATION SCHEMAS ---

export const productVariantCreateSchema = z.object({
  sku: z.string().trim().min(2, 'SKU must be at least 2 characters'),
  name: z.string().trim().min(1, 'Variant name is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or greater'),
  mrp: z.coerce.number().min(0, 'MRP must be 0 or greater'),
  stockQuantity: z.coerce.number().int().min(0).default(0),
  attributes: z.record(z.string(), z.any()).optional().nullable(),
  isActive: z.boolean().default(true)
});

export const productVariantUpdateSchema = productVariantCreateSchema.partial();

export type ProductVariantCreateInput = z.infer<typeof productVariantCreateSchema>;
export type ProductVariantUpdateInput = z.infer<typeof productVariantUpdateSchema>;

// --- STAGE 6: CART & WISHLIST VALIDATION SCHEMAS ---

export const cartItemAddSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().trim().optional().nullable(),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1)
});

export const cartItemUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1')
});

export const wishlistItemAddSchema = z.object({
  productId: z.string().min(1, 'Product ID is required')
});

export type CartItemAddInput = z.infer<typeof cartItemAddSchema>;
export type CartItemUpdateInput = z.infer<typeof cartItemUpdateSchema>;
export type WishlistItemAddInput = z.infer<typeof wishlistItemAddSchema>;

// --- STAGE 5.5: SERVICES & CMS VALIDATION SCHEMAS ---

export const serviceCreateSchema = z.object({
  name: z.string().trim().min(2, 'Service name must be at least 2 characters'),
  slug: z.string().trim().optional(),
  shortDescription: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().optional().nullable(),
  gallery: z.array(z.string()).optional().nullable(),
  industries: z.array(z.string()).optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
  seoTitle: z.string().trim().optional().nullable(),
  seoDescription: z.string().trim().optional().nullable()
});

export const serviceUpdateSchema = serviceCreateSchema.partial();

export const quoteRequestCreateSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().toLowerCase().email('Valid email address is required'),
  phone: z.string().trim().optional().nullable(),
  company: z.string().trim().optional().nullable(),
  serviceId: z.string().trim().optional().nullable(),
  serviceName: z.string().trim().optional().nullable(),
  projectDescription: z.string().trim().min(10, 'Please describe your project requirements in at least 10 characters'),
  quantity: z.coerce.number().int().min(1).default(1),
  materialPreference: z.string().trim().optional().nullable(),
  deliveryDate: z.string().optional().nullable(),
  fileUrl: z.string().trim().optional().nullable(),
  additionalNotes: z.string().trim().optional().nullable()
});

export const quoteRequestUpdateSchema = z.object({
  status: z.enum(['NEW', 'REVIEWING', 'QUOTED', 'ACCEPTED', 'REJECTED', 'CONVERTED', 'CLOSED']).optional(),
  internalNotes: z.string().trim().optional().nullable()
});

export const faqCreateSchema = z.object({
  question: z.string().trim().min(3, 'Question must be at least 3 characters'),
  answer: z.string().trim().min(3, 'Answer must be at least 3 characters'),
  category: z.string().trim().default('General'),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true)
});

export const testimonialCreateSchema = z.object({
  clientName: z.string().trim().min(2, 'Client name is required'),
  company: z.string().trim().optional().nullable(),
  designation: z.string().trim().optional().nullable(),
  avatarUrl: z.string().trim().optional().nullable(),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  content: z.string().trim().min(5, 'Testimonial content is required'),
  isActive: z.boolean().default(true)
});

export const bannerCreateSchema = z.object({
  title: z.string().trim().min(2, 'Title is required'),
  subtitle: z.string().trim().optional().nullable(),
  imageUrl: z.string().trim().min(5, 'Image URL is required'),
  linkUrl: z.string().trim().optional().nullable(),
  ctaText: z.string().trim().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true)
});

export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>;
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>;
export type QuoteRequestCreateInput = z.infer<typeof quoteRequestCreateSchema>;
export type QuoteRequestUpdateInput = z.infer<typeof quoteRequestUpdateSchema>;

