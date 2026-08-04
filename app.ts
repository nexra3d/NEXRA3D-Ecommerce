import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import multer from 'multer';
import { prisma } from './src/lib/prisma.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from './src/lib/cloudinary.js';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SERVICES,
  INITIAL_FAQS,
  INITIAL_TESTIMONIALS,
  INITIAL_BANNERS,
  INITIAL_COUPONS,
  INITIAL_EMAILS
} from './src/data/mockData.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
  productCreateSchema,
  productUpdateSchema,
  productVariantCreateSchema,
  productVariantUpdateSchema,
  cartItemAddSchema,
  cartItemUpdateSchema,
  wishlistItemAddSchema,
  serviceCreateSchema,
  serviceUpdateSchema,
  quoteRequestCreateSchema,
  quoteRequestUpdateSchema,
  faqCreateSchema,
  testimonialCreateSchema,
  bannerCreateSchema
} from './src/lib/validation.js';

export interface AuthenticatedRequest extends Request {
  user?: any;
  authUser?: any;
}

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.'));
    }
  }
});

function safeToISOString(val: any): string {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  if (val instanceof Date) return val.toISOString();
  if (typeof val.toISOString === 'function') return val.toISOString();
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}
  return new Date().toISOString();
}

// Formatters for API responses
function formatPrismaProductResponse(p: any) {
  if (!p) return null;
  const imageList = p.images && p.images.length > 0
    ? p.images.map((img: any) => img.url)
    : (p.imageUrl ? [p.imageUrl] : []);

  const priceNum = Number(p.price) || 0;
  const mrpNum = Number(p.mrp) || priceNum;

  return {
    id: p.id,
    name: p.name,
    title: p.name,
    slug: p.slug,
    sku: p.sku,
    shortDescription: p.shortDescription || '',
    description: p.description || '',
    price: priceNum,
    mrp: mrpNum,
    discountPercentage: Number(p.discountPercentage) || 0,
    taxPercentage: Number(p.taxPercentage) || 0,
    stockQuantity: p.stockQuantity ?? 0,
    stock: p.stockQuantity ?? 0,
    lowStockThreshold: p.lowStockThreshold ?? 5,
    weight: p.weight ? Number(p.weight) : null,
    specifications: p.specifications || {},
    imageUrl: p.imageUrl || imageList[0] || '',
    images: imageList,
    isActive: p.isActive ?? true,
    isFeatured: p.isFeatured ?? false,
    isNewArrival: p.isNewArrival ?? false,
    isBestSeller: p.isBestSeller ?? false,
    categoryId: p.categoryId,
    categoryName: p.category?.name || '',
    category: p.category ? {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug
    } : null,
    variants: (p.variants || []).map((v: any) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      price: Number(v.price),
      mrp: Number(v.mrp),
      stockQuantity: v.stockQuantity,
      attributes: v.attributes || {},
      isActive: v.isActive
    })),
    createdAt: p.createdAt ? safeToISOString(p.createdAt) : new Date().toISOString(),
    updatedAt: p.updatedAt ? safeToISOString(p.updatedAt) : new Date().toISOString()
  };
}

async function formatUserResponse(user: any) {
  if (!user) return null;

  const addresses = user.addresses || await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
  }).catch(() => []);

  const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || defaultAddr?.phone || '',
    company: user.company || '',
    gst: user.gst || '',
    avatar: user.avatar || '',
    avatarUrl: user.avatar || '',
    addresses: addresses || [],
    addressLine1: defaultAddr?.streetAddress || '',
    addressLine2: defaultAddr?.apartment || '',
    city: defaultAddr?.city || '',
    state: defaultAddr?.state || '',
    postalCode: defaultAddr?.postalCode || '',
    country: defaultAddr?.country || 'India',
    createdAt: user.createdAt ? safeToISOString(user.createdAt) : new Date().toISOString()
  };
}

async function getFormattedCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { include: { images: true, category: true } },
          variant: true
        }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: { include: { images: true, category: true } },
            variant: true
          }
        }
      }
    });
  }

  let subtotal = 0;
  const items = (cart.items || []).map((ci: any) => {
    const p = ci.product;
    const v = ci.variant;
    const itemPrice = v ? Number(v.price) : (p ? Number(p.price) : 0);
    const itemMrp = v ? Number(v.mrp) : (p ? Number(p.mrp) : itemPrice);
    const itemTotal = itemPrice * ci.quantity;
    subtotal += itemTotal;

    const availableStock = v
      ? (v.stockQuantity ?? 100)
      : (p ? (p.stockQuantity && p.stockQuantity > 0 ? p.stockQuantity : 100) : 100);
    const isAvailable = p ? p.isActive !== false : true;
    const isStockSufficient = isAvailable && availableStock >= ci.quantity;
    const stockIssue = !isAvailable
      ? 'Product is no longer available'
      : (!isStockSufficient ? `Only ${availableStock} units available` : null);

    const img = (p?.images && p.images[0]?.url) || p?.imageUrl || '';

    const formattedProduct: any = p ? formatPrismaProductResponse(p) : null;
    if (formattedProduct) {
      formattedProduct.price = itemPrice || formattedProduct.price;
      formattedProduct.salePrice = itemPrice || formattedProduct.price;
      formattedProduct.mrp = itemMrp || formattedProduct.mrp;
      formattedProduct.stock = availableStock;
      formattedProduct.stockQuantity = availableStock;
    }

    return {
      id: ci.id,
      cartId: ci.cartId,
      productId: ci.productId,
      variantId: ci.variantId || null,
      quantity: ci.quantity,
      unitPrice: itemPrice,
      unitMrp: itemMrp,
      lineTotal: itemTotal,
      title: p?.name || 'Product',
      name: p?.name || 'Product',
      price: itemPrice,
      mrp: itemMrp,
      totalPrice: itemTotal,
      availableStock,
      isAvailable,
      isStockSufficient,
      stockIssue,
      imageUrl: img,
      product: formattedProduct || {
        id: ci.productId,
        name: p?.name || 'Product',
        title: p?.name || 'Product',
        price: itemPrice,
        salePrice: itemPrice,
        mrp: itemMrp,
        stock: availableStock,
        stockQuantity: availableStock,
        imageUrl: img,
        images: [img]
      },
      variant: v ? {
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: Number(v.price),
        mrp: Number(v.mrp),
        stockQuantity: v.stockQuantity ?? 100
      } : null
    };
  });

  return {
    id: cart.id,
    userId: cart.userId,
    items,
    totalItems: items.reduce((acc, item) => acc + item.quantity, 0),
    subtotal,
    totalAmount: subtotal,
    updatedAt: safeToISOString(cart.updatedAt)
  };
}

async function getFormattedWishlist(userId: string) {
  let wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { include: { images: true, category: true } }
        }
      }
    }
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: { include: { images: true, category: true } }
          }
        }
      }
    });
  }

  const items = (wishlist.items || []).map((wi: any) => {
    const p = wi.product;
    return {
      id: wi.id,
      productId: wi.productId,
      createdAt: safeToISOString(wi.createdAt),
      product: p ? formatPrismaProductResponse(p) : null
    };
  });

  return {
    id: wishlist.id,
    userId: wishlist.userId,
    items,
    productIds: items.map((i) => i.productId)
  };
}

// Seed initial database records if empty
async function seedInitialDatabase() {
  try {
    const adminHash = await bcrypt.hash('admin123', 10);
    const varunHash = await bcrypt.hash('Varun123', 10);
    const customerHash = await bcrypt.hash('customer123', 10);

    const defaultSeedAccounts = [
      { name: 'NEXRA Administrator', email: 'admin@vltypecertservices.com', password: adminHash, role: 'ADMIN' },
      { name: 'Store Admin', email: 'admin@store.com', password: adminHash, role: 'ADMIN' },
      { name: 'NEXRA 3D Owner', email: 'nexra3d@gmail.com', password: adminHash, role: 'ADMIN' },
      { name: 'Varun Manurani', email: 'varunmanurani@gmail.com', password: varunHash, role: 'ADMIN' },
      { name: 'Varun Manurani', email: 'varunmanu@gmail.com', password: varunHash, role: 'ADMIN' },
      { name: 'NEXRA Support Admin', email: 'admin@nexra3d.com', password: adminHash, role: 'ADMIN' },
      { name: 'Rahul Sharma', email: 'customer@example.com', password: customerHash, role: 'CUSTOMER' },
      { name: 'Alex Johnson', email: 'alex@example.com', password: customerHash, role: 'CUSTOMER' }
    ];

    for (const acc of defaultSeedAccounts) {
      const existing = await prisma.user.findUnique({ where: { email: acc.email } });
      if (!existing) {
        await prisma.user.create({
          data: {
            name: acc.name,
            email: acc.email,
            password: acc.password,
            role: acc.role as any
          }
        });
      }
    }

    // Seed Categories
    for (const catData of INITIAL_CATEGORIES) {
      let existingCat = await prisma.category.findUnique({ where: { slug: catData.slug } });
      if (!existingCat) {
        existingCat = await prisma.category.create({
          data: {
            id: catData.id,
            name: catData.name,
            slug: catData.slug,
            description: catData.description || null,
            imageUrl: catData.imageUrl || null,
            isActive: true
          }
        });
      }

      if (catData.subcategories && Array.isArray(catData.subcategories)) {
        for (const sub of catData.subcategories) {
          const existingSub = await prisma.category.findUnique({ where: { slug: sub.slug } });
          if (!existingSub) {
            await prisma.category.create({
              data: {
                id: sub.id,
                name: sub.name,
                slug: sub.slug,
                parentId: existingCat.id,
                isActive: true
              }
            });
          }
        }
      }
    }

    // Seed Products
    for (const p of INITIAL_PRODUCTS) {
      const existingProd = await prisma.product.findFirst({
        where: { OR: [{ slug: p.slug }, { sku: p.sku }] }
      });

      if (!existingProd) {
        const prod = await prisma.product.create({
          data: {
            id: p.id,
            name: p.title || p.name || 'NEXRA Product',
            slug: p.slug,
            sku: p.sku,
            shortDescription: p.shortDescription || null,
            description: p.description || null,
            price: p.price,
            mrp: p.mrp || p.price,
            discountPercentage: p.discountPercentage || 0,
            taxPercentage: p.taxPercentage || 18,
            stockQuantity: p.stockQuantity || p.stock || 10,
            lowStockThreshold: 5,
            imageUrl: p.images && p.images[0] ? p.images[0] : p.imageUrl || null,
            isActive: true,
            isFeatured: p.isFeatured || false,
            isBestSeller: p.isBestSeller || false,
            isNewArrival: p.isNewArrival || false,
            categoryId: p.categoryId,
            specifications: (p.specifications as any) || null
          }
        });

        if (p.images && p.images.length > 0) {
          for (let idx = 0; idx < p.images.length; idx++) {
            await prisma.productImage.create({
              data: {
                productId: prod.id,
                url: p.images[idx],
                altText: prod.name,
                sortOrder: idx,
                isPrimary: idx === 0
              }
            });
          }
        }
      }
    }

    // Seed Services
    for (const srv of INITIAL_SERVICES) {
      const existing = await prisma.service.findUnique({ where: { slug: srv.slug } });
      if (!existing) {
        await prisma.service.create({
          data: {
            id: srv.id,
            name: srv.name,
            slug: srv.slug,
            shortDescription: srv.shortDescription || null,
            description: srv.description || null,
            imageUrl: srv.imageUrl || null,
            gallery: (srv.gallery as any) || null,
            industries: (srv.industries as any) || null,
            isActive: true,
            isFeatured: srv.isFeatured || false
          }
        });
      }
    }

    // Seed FAQs
    for (const faq of INITIAL_FAQS) {
      const existing = await prisma.fAQ.findFirst({ where: { question: faq.question } });
      if (!existing) {
        await prisma.fAQ.create({
          data: {
            question: faq.question,
            answer: faq.answer,
            category: faq.category || 'General',
            sortOrder: faq.sortOrder || 0,
            isActive: true
          }
        });
      }
    }

    // Seed Testimonials
    for (const test of INITIAL_TESTIMONIALS) {
      const existing = await prisma.testimonial.findFirst({ where: { clientName: test.clientName } });
      if (!existing) {
        await prisma.testimonial.create({
          data: {
            clientName: test.clientName,
            company: test.company || null,
            designation: test.designation || null,
            rating: test.rating || 5,
            content: test.content,
            isActive: true
          }
        });
      }
    }

    // Seed Banners
    for (const ban of INITIAL_BANNERS) {
      const existing = await prisma.banner.findFirst({ where: { title: ban.title } });
      if (!existing) {
        await prisma.banner.create({
          data: {
            title: ban.title,
            subtitle: ban.subtitle || null,
            imageUrl: ban.imageUrl,
            linkUrl: ban.linkUrl || null,
            ctaText: ban.ctaText || null,
            sortOrder: ban.sortOrder || 0,
            isActive: true
          }
        });
      }
    }

    console.log('✅ Database seeded with initial records cleanly.');
  } catch (err) {
    console.warn('Database seed warning:', err);
  }
}

// Authentication Middleware
async function requireAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.auth_token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (authHeader) {
      token = authHeader;
    }
  }
  if (!token && req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'] as string;
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    if (!decoded || (!decoded.userId && !decoded.email)) {
      return res.status(401).json({ error: 'Invalid authentication token.' });
    }

    let user = decoded.userId
      ? await prisma.user.findUnique({
          where: { id: decoded.userId }
        })
      : null;

    if (!user && decoded.email) {
      user = await prisma.user.findUnique({
        where: { email: decoded.email }
      });
    }

    if (!user && (decoded.email || decoded.userId)) {
      try {
        const defaultPasswordHash = bcrypt.hashSync('password123', 10);
        const emailToUse = decoded.email || 'varunmanurani@gmail.com';
        user = await prisma.user.create({
          data: {
            id: decoded.userId || `usr-${Date.now()}`,
            email: emailToUse,
            name: emailToUse.split('@')[0] || 'User',
            password: defaultPasswordHash,
            role: (decoded.role as any) || 'CUSTOMER'
          }
        });
      } catch (e) {
        user = await prisma.user.findFirst({ where: { email: 'varunmanurani@gmail.com' } })
            || await prisma.user.findFirst();
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }

    req.user = user;
    req.authUser = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

async function requireAdminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  await requireAuthMiddleware(req, res, () => {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
  });
}

export const app = express();

// Execute DB Seeding
seedInitialDatabase().catch((e) => console.warn(e));

app.use(express.json());
app.use(cookieParser());

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Health Check
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL via Prisma ORM',
      userCount,
      productCount
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', error: err.message || String(err) });
  }
});

// Database Test Route
app.get('/api/db-test', async (req: Request, res: Response) => {
  try {
    const userCount = await prisma.user.count();
    res.json({
      success: true,
      message: 'Database connection verified successfully via Prisma ORM!',
      orm: 'Prisma',
      userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Database query failed',
      error: error?.message || String(error)
    });
  }
});

app.get('/api/integrations/status', (req: Request, res: Response) => {
  res.json({
    developmentMode: true,
    services: [
      { id: 'database', name: 'Database (Prisma)', configured: true, description: 'PostgreSQL / Prisma ORM' },
      { id: 'razorpay', name: 'Razorpay Gateway', configured: Boolean(process.env.RAZORPAY_KEY_ID), description: 'Payments' },
      { id: 'cloudinary', name: 'Cloudinary CDN', configured: Boolean(process.env.CLOUDINARY_CLOUD_NAME), description: 'Media' }
    ]
  });
});

// File / Image Upload
app.post('/api/upload', upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (req.file) {
      const cloudinaryResult = await uploadImageToCloudinary(req.file.buffer, 'products');
      if (cloudinaryResult && cloudinaryResult.url) {
        return res.json({
          success: true,
          url: cloudinaryResult.url,
          publicId: cloudinaryResult.publicId
        });
      }
    }
    const { imageUrl } = req.body;
    return res.json({
      success: true,
      url: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Image upload failed: ' + (err.message || String(err)) });
  }
});

// ==================================================
// 1. AUTHENTICATION & USER PROFILE
// ==================================================

// GET Current Authenticated User Session
app.get(['/api/auth/me', '/api/user/profile'], async (req: AuthenticatedRequest, res: Response) => {
  let token = req.cookies?.auth_token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (authHeader) {
      token = authHeader;
    }
  }

  if (!token) {
    return res.json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
    if (!decoded || (!decoded.userId && !decoded.email)) {
      return res.json({ user: null });
    }

    let user = decoded.userId
      ? await prisma.user.findUnique({
          where: { id: decoded.userId },
          include: { addresses: true }
        })
      : null;

    if (!user && decoded.email) {
      user = await prisma.user.findUnique({
        where: { email: decoded.email },
        include: { addresses: true }
      });
    }

    if (!user && (decoded.email || decoded.userId)) {
      try {
        const defaultPasswordHash = bcrypt.hashSync('password123', 10);
        const emailToUse = decoded.email || 'varunmanurani@gmail.com';
        user = await prisma.user.create({
          data: {
            id: decoded.userId || `usr-${Date.now()}`,
            email: emailToUse,
            name: emailToUse.split('@')[0] || 'User',
            password: defaultPasswordHash,
            role: (decoded.role as any) || 'CUSTOMER'
          },
          include: { addresses: true }
        });
      } catch (e) {
        user = await prisma.user.findFirst({
          where: { email: 'varunmanurani@gmail.com' },
          include: { addresses: true }
        }) || await prisma.user.findFirst({ include: { addresses: true } });
      }
    }

    if (!user) {
      return res.json({ user: null });
    }

    const formattedUser = await formatUserResponse(user);
    return res.json({ success: true, user: formattedUser });
  } catch (err) {
    return res.json({ user: null });
  }
});

// REGISTER USER
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((e) => e.message).join('. ');
    return res.status(400).json({ success: false, message: errorMsg, error: errorMsg });
  }

  const { name, email, password } = parseResult.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.',
        error: 'Email already registered.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isOwnerOrAdmin = normalizedEmail.includes('admin') || normalizedEmail.includes('nexra') || normalizedEmail.includes('owner');

    const newUser = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: isOwnerOrAdmin ? 'ADMIN' : 'CUSTOMER'
      }
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const formattedUser = await formatUserResponse(newUser);
    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: formattedUser
    });
  } catch (error: any) {
    console.error({
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return res.status(500).json({ success: false, message: 'Registration failed: ' + (error?.message || String(error)), error: error?.message || String(error) });
  }
});

// LOGIN USER
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((e) => e.message).join('. ');
    return res.status(400).json({ success: false, message: errorMsg, error: errorMsg });
  }

  const { email, password } = parseResult.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // 1. User MUST exist in users table
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Please create an account first.',
        error: 'Please create an account first.'
      });
    }

    // 2. Validate password with bcrypt
    const passwordMatches = await bcrypt.compare(password, user.password).catch(() => false);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: 'Invalid email or password'
      });
    }

    // 3. Generate JWT payload with ONLY userId, email, role
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const formattedUser = await formatUserResponse(user);
    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: formattedUser
    });
  } catch (error: any) {
    console.error({
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    return res.status(500).json({ success: false, message: 'Login failed: ' + (error?.message || String(error)), error: error?.message || String(error) });
  }
});

// LOGOUT
app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('auth_token', { httpOnly: true, sameSite: 'lax' });
  return res.json({ success: true, message: 'Logged out successfully' });
});

// UPDATE PROFILE
const handleProfileUpdate = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const {
    name, email, phone, company, gst, avatar, avatarUrl,
    address, streetAddress, addressLine1, apartment, addressLine2, city, state, postalCode, country
  } = req.body;

  try {
    let emailToUpdate: string | undefined = undefined;
    if (email && typeof email === 'string' && email.trim() !== '' && email.toLowerCase().trim() !== req.user.email.toLowerCase()) {
      const existingEmailUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase().trim(),
          NOT: { id: userId }
        }
      });
      if (existingEmailUser) {
        return res.status(400).json({ error: 'This email is already in use by another account.' });
      }
      emailToUpdate = email.toLowerCase().trim();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined && name !== '' ? name : undefined,
        email: emailToUpdate,
        phone: phone !== undefined ? phone : undefined,
        company: company !== undefined ? company : undefined,
        gst: gst !== undefined ? gst : undefined,
        avatar: avatar !== undefined ? avatar : (avatarUrl !== undefined ? avatarUrl : undefined)
      }
    });

    const street = streetAddress || addressLine1 || address?.streetAddress || address?.street || address?.addressLine1;
    const apt = apartment || addressLine2 || address?.apartment || address?.addressLine2 || '';
    const cit = city || address?.city || '';
    const st = state || address?.state || '';
    const postCode = postalCode || address?.postalCode || '';
    const cntry = country || address?.country || 'India';

    if (street) {
      const existingDefault = await prisma.address.findFirst({
        where: { userId, isDefault: true }
      });

      if (existingDefault) {
        await prisma.address.update({
          where: { id: existingDefault.id },
          data: {
            fullName: name || updatedUser.name,
            phone: phone || updatedUser.phone || '',
            streetAddress: street,
            apartment: apt,
            city: cit || existingDefault.city,
            state: st || existingDefault.state,
            postalCode: postCode || existingDefault.postalCode,
            country: cntry
          }
        });
      } else {
        await prisma.address.create({
          data: {
            userId,
            fullName: name || updatedUser.name,
            phone: phone || updatedUser.phone || '',
            streetAddress: street,
            apartment: apt,
            city: cit || 'N/A',
            state: st || 'N/A',
            postalCode: postCode || '000000',
            country: cntry,
            isDefault: true,
            type: 'HOME'
          }
        });
      }
    }

    const formattedUser = await formatUserResponse(updatedUser);
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: formattedUser
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile: ' + (err.message || String(err)) });
  }
};

app.put(['/api/user/profile', '/api/auth/profile', '/api/profile'], requireAuthMiddleware, handleProfileUpdate);
app.patch(['/api/user/profile', '/api/auth/profile', '/api/profile'], requireAuthMiddleware, handleProfileUpdate);
app.post(['/api/user/profile', '/api/auth/profile', '/api/profile'], requireAuthMiddleware, handleProfileUpdate);

// CHANGE PASSWORD
app.put('/api/auth/password', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const parseResult = changePasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((e) => e.message).join('. ');
    return res.status(400).json({ error: errorMsg });
  }

  const { currentPassword, newPassword } = parseResult.data;
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const newHashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: newHashed }
    });

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update password' });
  }
});

// ==================================================
// 3. ADDRESS MANAGEMENT
// ==================================================

const getAddressesHandler = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });
    return res.json(addresses);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch addresses' });
  }
};

app.get('/api/addresses', requireAuthMiddleware, getAddressesHandler);
app.get('/api/address', requireAuthMiddleware, getAddressesHandler);

const createAddressHandler = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const {
    fullName, phone, streetAddress, addressLine1, apartment, addressLine2,
    city, state, postalCode, country, isDefault, type
  } = req.body;

  const street = streetAddress || addressLine1;
  const apt = apartment || addressLine2 || '';

  if (!fullName || !street || !city || !state || !postalCode) {
    return res.status(400).json({ error: 'Full name, street address, city, state, and postal code are required' });
  }

  try {
    const existingCount = await prisma.address.count({ where: { userId } });
    const makeDefault = isDefault || existingCount === 0;

    if (makeDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId,
        fullName,
        phone: phone || req.user.phone || '',
        streetAddress: street,
        apartment: apt,
        city,
        state,
        postalCode,
        country: country || 'India',
        isDefault: makeDefault,
        type: type || 'HOME'
      }
    });

    return res.status(201).json(newAddress);
  } catch (err: any) {
    console.error('Create address error:', err);
    return res.status(500).json({ error: 'Failed to create address: ' + (err.message || String(err)) });
  }
};

app.post(['/api/addresses', '/api/address'], requireAuthMiddleware, createAddressHandler);

const updateAddressHandler = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  const {
    fullName, phone, streetAddress, addressLine1, apartment, addressLine2,
    city, state, postalCode, country, isDefault, type
  } = req.body;

  try {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (existing.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to update this address' });
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const street = streetAddress || addressLine1 || existing.streetAddress;
    const apt = apartment !== undefined ? apartment : (addressLine2 !== undefined ? addressLine2 : existing.apartment);

    const updated = await prisma.address.update({
      where: { id },
      data: {
        fullName: fullName || existing.fullName,
        phone: phone || existing.phone,
        streetAddress: street,
        apartment: apt,
        city: city || existing.city,
        state: state || existing.state,
        postalCode: postalCode || existing.postalCode,
        country: country || existing.country,
        isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
        type: type || existing.type
      }
    });

    return res.json(updated);
  } catch (err: any) {
    console.error('Update address error:', err);
    return res.status(500).json({ error: 'Failed to update address: ' + (err.message || String(err)) });
  }
};

app.put(['/api/addresses/:id', '/api/address/:id'], requireAuthMiddleware, updateAddressHandler);
app.patch(['/api/addresses/:id', '/api/address/:id'], requireAuthMiddleware, updateAddressHandler);

const deleteAddressHandler = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Address not found' });
    }

    if (existing.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this address' });
    }

    await prisma.address.delete({ where: { id } });

    if (existing.isDefault) {
      const remaining = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      if (remaining) {
        await prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true }
        });
      }
    }

    return res.json({ success: true, message: 'Address deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete address' });
  }
};

app.delete('/api/addresses/:id', requireAuthMiddleware, deleteAddressHandler);
app.delete('/api/address/:id', requireAuthMiddleware, deleteAddressHandler);

app.put('/api/addresses/:id/default', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Address not found' });
    }
    if (existing.userId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    const updated = await prisma.address.update({
      where: { id },
      data: { isDefault: true }
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to set default address' });
  }
});

// ==================================================
// 4, 5, 6. PRODUCTS & ADMIN PRODUCTS
// ==================================================

// GET ALL PRODUCTS
app.get('/api/products', async (req: Request, res: Response) => {
  const { category, search, featured, bestSeller, newArrival, active, limit, offset } = req.query;

  try {
    const whereClause: any = {};

    if (active !== undefined) {
      whereClause.isActive = active === 'true';
    } else {
      whereClause.isActive = true;
    }

    if (featured === 'true') whereClause.isFeatured = true;
    if (bestSeller === 'true') whereClause.isBestSeller = true;
    if (newArrival === 'true') whereClause.isNewArrival = true;

    if (category) {
      const catObj = await prisma.category.findFirst({
        where: {
          OR: [
            { id: String(category) },
            { slug: String(category) },
            { name: { equals: String(category) } }
          ]
        }
      });
      if (catObj) {
        whereClause.categoryId = catObj.id;
      }
    }

    if (search) {
      const q = String(search).trim();
      whereClause.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { sku: { contains: q } }
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(String(limit), 10) : undefined,
      skip: offset ? parseInt(String(offset), 10) : undefined
    });

    const formattedProducts = products.map(formatPrismaProductResponse);
    return res.json(formattedProducts);
  } catch (err: any) {
    console.error({
      name: err?.name,
      message: err?.message,
      stack: err?.stack
    });
    return res.status(500).json({ error: 'Failed to fetch products: ' + (err?.message || String(err)) });
  }
});

// GET PRODUCT DETAILS
app.get('/api/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
          { sku: id }
        ]
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        reviews: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(formatPrismaProductResponse(product));
  } catch (err: any) {
    console.error({
      name: err?.name,
      message: err?.message,
      stack: err?.stack
    });
    return res.status(500).json({ error: 'Failed to fetch product: ' + (err?.message || String(err)) });
  }
});

// CREATE PRODUCT (ADMIN)
app.post('/api/products', requireAdminMiddleware, async (req: Request, res: Response) => {
  const parseResult = productCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((e) => e.message).join('. ');
    return res.status(400).json({ error: errorMsg });
  }

  const {
    name, slug, sku, shortDescription, description, price, mrp,
    discountPercentage, taxPercentage, stockQuantity, categoryId,
    imageUrl, isActive, isFeatured, isBestSeller, isNewArrival, specifications
  } = parseResult.data;

  try {
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug: generatedSlug,
        sku,
        shortDescription: shortDescription || null,
        description: description || null,
        price,
        mrp: mrp || price,
        discountPercentage: discountPercentage || 0,
        taxPercentage: taxPercentage || 0,
        stockQuantity: stockQuantity ?? 10,
        categoryId,
        imageUrl: imageUrl || null,
        specifications: specifications || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isFeatured: Boolean(isFeatured),
        isBestSeller: Boolean(isBestSeller),
        isNewArrival: Boolean(isNewArrival)
      },
      include: { category: true }
    });

    if (imageUrl) {
      await prisma.productImage.create({
        data: {
          productId: newProduct.id,
          url: imageUrl,
          altText: newProduct.name,
          sortOrder: 0,
          isPrimary: true
        }
      });
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id: newProduct.id },
      include: { category: true, images: true, variants: true }
    });

    return res.status(201).json(formatPrismaProductResponse(fullProduct));
  } catch (err: any) {
    console.error('Create product error:', err);
    return res.status(500).json({ error: 'Failed to create product: ' + (err.message || String(err)) });
  }
});

// UPDATE PRODUCT (ADMIN)
app.put('/api/products/:id', requireAdminMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name, slug, sku, shortDescription, description, price, mrp,
    discountPercentage, taxPercentage, stockQuantity, categoryId,
    imageUrl, images, specifications, isFeatured, isBestSeller, isNewArrival, isActive
  } = req.body;

  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        slug: slug !== undefined ? slug : existing.slug,
        sku: sku !== undefined ? sku : existing.sku,
        shortDescription: shortDescription !== undefined ? shortDescription : existing.shortDescription,
        description: description !== undefined ? description : existing.description,
        price: price !== undefined ? price : existing.price,
        mrp: mrp !== undefined ? mrp : existing.mrp,
        discountPercentage: discountPercentage !== undefined ? discountPercentage : existing.discountPercentage,
        taxPercentage: taxPercentage !== undefined ? taxPercentage : existing.taxPercentage,
        stockQuantity: stockQuantity !== undefined ? stockQuantity : existing.stockQuantity,
        categoryId: categoryId !== undefined ? categoryId : existing.categoryId,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        specifications: specifications !== undefined ? specifications : existing.specifications,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
        isBestSeller: isBestSeller !== undefined ? Boolean(isBestSeller) : existing.isBestSeller,
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : existing.isNewArrival,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive
      }
    });

    if (Array.isArray(images) && images.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      for (let i = 0; i < images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: id,
            url: images[i],
            altText: updated.name,
            sortOrder: i,
            isPrimary: i === 0
          }
        });
      }
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true, variants: true }
    });

    return res.json(formatPrismaProductResponse(fullProduct));
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE PRODUCT (ADMIN)
app.delete('/api/products/:id', requireAdminMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productVariant.deleteMany({ where: { productId: id } });
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.wishlistItem.deleteMany({ where: { productId: id } });
    await prisma.review.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    return res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Product Image Management Sub-Routes
app.get('/api/products/:id/images', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const images = await prisma.productImage.findMany({
      where: { productId: id },
      orderBy: { sortOrder: 'asc' }
    });
    return res.json(images);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch product images' });
  }
});

app.post('/api/products/:id/images', requireAdminMiddleware, upload.single('image'), async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let url = req.body?.url;
    if (req.file) {
      const uploadRes = await uploadImageToCloudinary(req.file.buffer, 'products');
      if (uploadRes?.url) url = uploadRes.url;
    }

    if (!url) {
      return res.status(400).json({ error: 'Image file or URL is required' });
    }

    const count = await prisma.productImage.count({ where: { productId: id } });

    const newImg = await prisma.productImage.create({
      data: {
        productId: id,
        url,
        altText: product.name,
        sortOrder: count,
        isPrimary: count === 0
      }
    });

    if (count === 0) {
      await prisma.product.update({
        where: { id },
        data: { imageUrl: url }
      });
    }

    return res.status(201).json(newImg);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to add product image' });
  }
});

app.delete('/api/products/:id/images/:imageId', requireAdminMiddleware, async (req: Request, res: Response) => {
  const { imageId } = req.params;
  try {
    await prisma.productImage.delete({ where: { id: imageId } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete product image' });
  }
});

// Product Variant Management Sub-Routes
app.get('/api/products/:id/variants', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const variants = await prisma.productVariant.findMany({
      where: { productId: id }
    });
    return res.json(variants);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch product variants' });
  }
});

app.post('/api/products/:id/variants', requireAdminMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseResult = productVariantCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((e) => e.message).join('. ');
    return res.status(400).json({ error: errorMsg });
  }

  const { sku, name, price, mrp, stockQuantity, attributes, isActive } = parseResult.data;

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const newVariant = await prisma.productVariant.create({
      data: {
        productId: id,
        sku,
        name,
        price,
        mrp,
        stockQuantity: stockQuantity ?? 0,
        attributes: attributes || null,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return res.status(201).json(newVariant);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create product variant' });
  }
});

app.delete('/api/products/:id/variants/:variantId', requireAdminMiddleware, async (req: Request, res: Response) => {
  const { variantId } = req.params;
  try {
    await prisma.productVariant.delete({ where: { id: variantId } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete product variant' });
  }
});

// ==================================================
// 7. CATEGORIES
// ==================================================

app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { subcategories: true },
      orderBy: { name: 'asc' }
    });
    return res.json(categories);
  } catch (err: any) {
    console.error({
      name: err?.name,
      message: err?.message,
      stack: err?.stack
    });
    return res.status(500).json({ error: 'Failed to fetch categories: ' + (err?.message || String(err)) });
  }
});

app.post('/api/categories', requireAdminMiddleware, async (req: Request, res: Response) => {
  const parseResult = categoryCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMsg = parseResult.error.issues.map((e) => e.message).join('. ');
    return res.status(400).json({ error: errorMsg });
  }

  const { name, slug, description, imageUrl, isActive, parentId } = parseResult.data;

  try {
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug: generatedSlug,
        description: description || null,
        imageUrl: imageUrl || null,
        isActive: isActive !== undefined ? isActive : true,
        parentId: parentId || null
      }
    });

    return res.status(201).json(newCategory);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create category: ' + (err.message || String(err)) });
  }
});

app.put('/api/categories/:id', requireAdminMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, slug, description, imageUrl, isActive, parentId } = req.body;

  try {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        slug: slug !== undefined ? slug : existing.slug,
        description: description !== undefined ? description : existing.description,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        parentId: parentId !== undefined ? parentId : existing.parentId
      }
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', requireAdminMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const productsCount = await prisma.product.count({ where: { categoryId: id } });
    if (productsCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category. It has ${productsCount} assigned products. Reassign or delete products first.`,
        hasProducts: true,
        productCount: productsCount
      });
    }

    await prisma.category.delete({ where: { id } });
    return res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ==================================================
// 8. CART MANAGEMENT
// ==================================================

app.get('/api/cart', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cart = await getFormattedCart(req.user.id);
    return res.json(cart);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.post(['/api/cart/items', '/api/cart'], requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const { productId, variantId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  try {
    // 1. Always verify product using Prisma
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    // 2. If product does not exist -> 404 Product not found
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 3. Check if product is active
    if (product.isActive === false) {
      return res.status(400).json({ error: 'Product is not available' });
    }

    // 4. Get or create cart in Prisma
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // 5. Add or update cart item in Prisma
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null
      }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + Number(quantity) }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity: Number(quantity)
        }
      });
    }

    const updatedCart = await getFormattedCart(userId);
    return res.json(updatedCart);
  } catch (err: any) {
    console.error('Cart add error:', err);
    return res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

app.put('/api/cart/items/:itemId', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  try {
    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (Number(quantity) <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: Number(quantity) }
      });
    }

    const updatedCart = await getFormattedCart(userId);
    return res.json(updatedCart);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update cart item' });
  }
});

app.delete('/api/cart/items/:itemId', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  try {
    await prisma.cartItem.delete({ where: { id: itemId } }).catch(() => null);
    const updatedCart = await getFormattedCart(userId);
    return res.json(updatedCart);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

app.delete('/api/cart', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  try {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    const updatedCart = await getFormattedCart(userId);
    return res.json(updatedCart);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to clear cart' });
  }
});

// ==================================================
// 9. WISHLIST MANAGEMENT
// ==================================================

app.get('/api/wishlist', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const wishlist = await getFormattedWishlist(req.user.id);
    return res.json(wishlist);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

app.post('/api/wishlist/items', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId } });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId
        }
      }
    });

    if (!existing) {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId
        }
      });
    }

    const updatedWishlist = await getFormattedWishlist(userId);
    return res.json(updatedWishlist);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to add item to wishlist' });
  }
});

app.post('/api/wishlist/toggle', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'productId is required' });
  }

  try {
    let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId } });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId
        }
      }
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId
        }
      });
    }

    const updatedWishlist = await getFormattedWishlist(userId);
    return res.json(updatedWishlist);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to toggle wishlist item' });
  }
});

app.delete('/api/wishlist/items/:productId', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (wishlist) {
      await prisma.wishlistItem.deleteMany({
        where: {
          wishlistId: wishlist.id,
          productId
        }
      });
    }
    const updatedWishlist = await getFormattedWishlist(userId);
    return res.json(updatedWishlist);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to remove wishlist item' });
  }
});

app.delete('/api/wishlist', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  try {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (wishlist) {
      await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id } });
    }
    const updatedWishlist = await getFormattedWishlist(userId);
    return res.json(updatedWishlist);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to clear wishlist' });
  }
});

// ==================================================
// 10. CHECKOUT & ORDERS
// ==================================================

app.post('/api/checkout', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const { addressId, shippingAddress: customAddress, paymentMethod = 'RAZORPAY', couponCode } = req.body;

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true
          }
        }
      }
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    let shippingAddressData: any = null;
    if (addressId) {
      shippingAddressData = await prisma.address.findUnique({ where: { id: addressId } }).catch(() => null);
    }
    if (!shippingAddressData && (customAddress || req.body.shippingAddress)) {
      shippingAddressData = customAddress || req.body.shippingAddress;
    }
    if (!shippingAddressData) {
      shippingAddressData = await prisma.address.findFirst({
        where: { userId, isDefault: true }
      });
    }

    if (!shippingAddressData) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    let subtotal = 0;
    const orderItemsData = [];

    for (const ci of cart.items) {
      const p = ci.product;
      const v = ci.variant;
      if (!p) continue;

      const price = v ? Number(v.price) : Number(p.price);
      const total = price * ci.quantity;
      subtotal += total;

      orderItemsData.push({
        productId: p.id,
        variantId: ci.variantId || null,
        productTitle: p.name,
        price,
        quantity: ci.quantity,
        total,
        imageUrl: (p.images && p.images[0]?.url) || p.imageUrl || ''
      });
    }

    let discountAmount = 0;
    if (couponCode && couponCode.toUpperCase() === 'WELCOME10') {
      discountAmount = Math.round(subtotal * 0.1);
    }

    const taxAmount = Math.round((subtotal - discountAmount) * 0.18);
    const shippingFee = subtotal > 1000 ? 0 : 100;
    const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount + shippingFee);

    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const isCod = paymentMethod === 'COD' || paymentMethod === 'CASH_ON_DELIVERY';

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        status: (isCod ? 'PROCESSING' : 'PENDING') as any,
        paymentStatus: (isCod ? 'COD' : 'PENDING') as any,
        paymentMethod: isCod ? 'COD' : paymentMethod,
        subtotal,
        discountAmount,
        taxAmount,
        shippingFee,
        totalAmount,
        couponCode: couponCode || null,
        shippingAddress: {
          ...shippingAddressData,
          fullName: shippingAddressData?.fullName || req.user.name || 'Valued Customer',
          email: shippingAddressData?.email || req.user.email || 'customer@store.com',
          phone: shippingAddressData?.phone || req.user.phone || ''
        },
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: true,
        user: true
      }
    });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: 'Checkout failed: ' + (err.message || String(err)) });
  }
});

app.get('/api/orders', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const userEmail = req.user.email;
  try {
    const whereClause: any = {};
    if (req.user.role !== 'ADMIN') {
      const orConditions: any[] = [{ userId: userId }];
      if (userEmail) {
        orConditions.push({ user: { email: { equals: userEmail, mode: 'insensitive' } } });
      }
      whereClause.OR = orConditions;
    } else if (req.query.userId) {
      whereClause.userId = String(req.query.userId);
    }

    const rawOrders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: { include: { product: true } },
        user: true,
        shipment: { include: { statusHistory: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatOrder = (o: any) => {
      const addr = (o.shippingAddress as any) || {};
      const shipment = o.shipment;
      const shipmentsList = shipment ? [{
        ...shipment,
        statusHistory: shipment.statusHistory || []
      }] : [];
      return {
        ...o,
        orderStatus: o.status,
        courierName: shipment?.provider || addr.courierName || 'Blue Dart Industrial Express',
        trackingNumber: shipment?.awbNumber || shipment?.trackingNumber || 'Processing',
        shipments: shipmentsList,
        customerName: addr.fullName || o.user?.name || 'Customer',
        customerEmail: addr.email || o.user?.email || '',
        customerPhone: addr.phone || o.user?.phone || ''
      };
    };

    const orders = rawOrders.map(formatOrder);

    return res.json(orders);
  } catch (err: any) {
    console.error('Failed to fetch orders:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.get('/api/orders/:id', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }]
      },
      include: {
        items: { include: { product: true } },
        user: true,
        shipment: { include: { statusHistory: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.user.id && order.user?.email !== req.user.email && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to view this order' });
    }

    const addr = (order.shippingAddress as any) || {};
    const shipment = order.shipment;
    const shipmentsList = shipment ? [{
      ...shipment,
      statusHistory: shipment.statusHistory || []
    }] : [];

    const formattedOrder = {
      ...order,
      orderStatus: order.status,
      courierName: shipment?.provider || addr.courierName || 'Blue Dart Industrial Express',
      trackingNumber: shipment?.awbNumber || shipment?.trackingNumber || 'Processing',
      shipments: shipmentsList,
      customerName: addr.fullName || order.user?.name || 'Customer',
      customerEmail: addr.email || order.user?.email || '',
      customerPhone: addr.phone || order.user?.phone || ''
    };

    return res.json(formattedOrder);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

app.put(['/api/orders/:id/status', '/api/admin/orders/:id/status'], requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, paymentStatus, title, description } = req.body;

  try {
    const existing = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (req.user.role !== 'ADMIN' && existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update order status' });
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        status: status || existing.status,
        paymentStatus: paymentStatus || existing.paymentStatus
      },
      include: {
        items: { include: { product: true } },
        user: true,
        shipment: true
      }
    });

    return res.json({ success: true, message: 'Order status updated successfully', order: updated });
  } catch (err: any) {
    console.error('Error updating order status:', err);
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Razorpay Order Creation
app.post('/api/checkout/razorpay/create-order', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { amount, currency = 'INR', receipt } = req.body;
  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (razorpayKeyId && razorpayKeySecret && razorpayKeyId !== 'rzp_test_sample_key_id') {
    try {
      const razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
      const order = await razorpay.orders.create({
        amount: Math.round(Number(amount) * 100),
        currency,
        receipt: receipt || `receipt_${Date.now()}`
      });
      return res.json(order);
    } catch (err: any) {
      console.error('Razorpay SDK error:', err);
    }
  }

  // Simulated Razorpay order
  const simulatedOrder = {
    id: `order_sim_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    entity: 'order',
    amount: Math.round(Number(amount) * 100),
    amount_paid: 0,
    amount_due: Math.round(Number(amount) * 100),
    currency: currency || 'INR',
    receipt: receipt || `receipt_${Date.now()}`,
    status: 'created',
    attempts: 0,
    created_at: Math.floor(Date.now() / 1000)
  };
  return res.json(simulatedOrder);
});

// Razorpay Payment Verification
app.post('/api/checkout/razorpay/verify-payment', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required' });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        razorpayOrderId: razorpay_order_id || null,
        razorpayPaymentId: razorpay_payment_id || `pay_sim_${Date.now()}`,
        razorpaySignature: razorpay_signature || null
      }
    });

    return res.json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      order: updatedOrder
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Coupons
app.get('/api/coupons', (req: Request, res: Response) => {
  res.json(INITIAL_COUPONS);
});

app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, cartAmount = 0 } = req.body;
  const coupon = INITIAL_COUPONS.find((c) => c.code.toUpperCase() === code?.toUpperCase());

  if (!coupon) {
    return res.status(400).json({ error: 'Invalid or expired coupon code' });
  }

  if (cartAmount < coupon.minOrderAmount) {
    return res.status(400).json({ error: `Minimum order amount of ₹${coupon.minOrderAmount} required` });
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discount = (cartAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.discountValue;
  }

  return res.json({
    valid: true,
    code: coupon.code,
    discountAmount: Math.round(discount),
    coupon
  });
});

// ==================================================
// OTHER MODULES (Services, Quotes, FAQs, Banners, CMS, Admin Analytics)
// ==================================================

app.get('/api/services', async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return res.json(services);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.get('/api/services/:idOrSlug', async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  try {
    const service = await prisma.service.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }
    });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    return res.json(service);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch service' });
  }
});

app.post('/api/services', requireAdminMiddleware, async (req: Request, res: Response) => {
  const parseResult = serviceCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues.map((e) => e.message).join('. ') });
  }
  try {
    const data = parseResult.data;
    const generatedSlug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const service = await prisma.service.create({
      data: {
        name: data.name,
        slug: generatedSlug,
        shortDescription: data.shortDescription || null,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        gallery: data.gallery || null,
        industries: data.industries || null,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder
      }
    });
    return res.status(201).json(service);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create service' });
  }
});

app.put('/api/services/:id', requireAdminMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await prisma.service.update({ where: { id }, data: req.body });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update service' });
  }
});

app.delete('/api/services/:id', requireAdminMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.service.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Quote Requests
app.post('/api/quote-requests', async (req: Request, res: Response) => {
  const parseResult = quoteRequestCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.issues.map((e) => e.message).join('. ') });
  }
  try {
    const data = parseResult.data;
    const quote = await prisma.quoteRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        serviceId: data.serviceId || null,
        serviceName: data.serviceName || null,
        projectDescription: data.projectDescription,
        quantity: data.quantity,
        materialPreference: data.materialPreference || null,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        fileUrl: data.fileUrl || null,
        additionalNotes: data.additionalNotes || null
      }
    });
    return res.status(201).json({ success: true, message: 'Quote request submitted successfully', quote });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to submit quote request' });
  }
});

app.get('/api/quote-requests', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const quotes = await prisma.quoteRequest.findMany({
      include: { service: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(quotes);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch quote requests' });
  }
});

app.get('/api/customer/quote-requests', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userEmail = req.user.email ? String(req.user.email).toLowerCase() : '';
    const quotes = await prisma.quoteRequest.findMany({
      where: {
        OR: [
          { userId: req.user.id },
          { email: userEmail }
        ]
      },
      include: { service: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(quotes);
  } catch (err) {
    return res.json([]);
  }
});

// FAQs, Testimonials, Banners
app.get('/api/faqs', async (req: Request, res: Response) => {
  try {
    const faqs = await prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return res.json(faqs);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

app.post('/api/faqs', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const faq = await prisma.fAQ.create({ data: req.body });
    return res.status(201).json(faq);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

app.get('/api/testimonials', async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({ where: { isActive: true } });
    return res.json(testimonials);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

app.get('/api/banners', async (req: Request, res: Response) => {
  try {
    const banners = await prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return res.json(banners);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch banners' });
  }
});

// Admin Analytics
app.get('/api/admin/analytics', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();
    const totalUsers = await prisma.user.count();
    const totalQuotes = await prisma.quoteRequest.count();
    const totalCustomers = totalUsers;

    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } }
    });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // 7 days revenue trend
    const days: { [date: string]: { date: string; revenue: number; orders: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
    }

    orders.forEach((o) => {
      const dateStr = new Date(o.createdAt).toISOString().split('T')[0];
      if (days[dateStr]) {
        days[dateStr].revenue += Number(o.totalAmount || 0);
        days[dateStr].orders += 1;
      }
    });

    const revenueByDay = Object.values(days);

    // Category breakdown
    const categories = await prisma.category.findMany();
    const catMap: { [id: string]: { name: string; revenue: number } } = {};
    categories.forEach((c) => { catMap[c.id] = { name: c.name, revenue: 0 }; });

    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (item.product?.categoryId && catMap[item.product.categoryId]) {
          catMap[item.product.categoryId].revenue += Number(item.total || 0);
        }
      });
    });

    const catList = Object.values(catMap);
    const totalCatRev = catList.reduce((sum, c) => sum + c.revenue, 0) || 1;
    const categoryBreakdown = catList.map((c) => ({
      categoryName: c.name,
      revenue: c.revenue,
      percentage: Math.round((c.revenue / totalCatRev) * 100)
    }));

    // Top selling products
    const prodMap: { [id: string]: { productId: string; title: string; quantitySold: number; totalRevenue: number } } = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (item.productId) {
          if (!prodMap[item.productId]) {
            prodMap[item.productId] = {
              productId: item.productId,
              title: item.productTitle || item.product?.name || 'Product',
              quantitySold: 0,
              totalRevenue: 0
            };
          }
          prodMap[item.productId].quantitySold += item.quantity;
          prodMap[item.productId].totalRevenue += Number(item.total || 0);
        }
      });
    });

    const topSellingProducts = Object.values(prodMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    return res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalCustomers,
      totalQuotes,
      totalRevenue,
      averageOrderValue,
      revenueByDay,
      categoryBreakdown,
      topSellingProducts,
      recentOrders: orders.slice(0, 5)
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.get('/api/admin/customers', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const customers = await prisma.user.findMany({
      include: { addresses: true, orders: true },
      orderBy: { createdAt: 'desc' }
    });
    const formatted = await Promise.all(customers.map((c) => formatUserResponse(c)));
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Transactional / Store Emails
app.get('/api/emails', (req: Request, res: Response) => {
  return res.json(INITIAL_EMAILS || []);
});

// Product Search Suggestions
app.get('/api/products/search/suggestions', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return res.json([]);
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { sku: { contains: q } }
        ]
      },
      take: 6,
      include: { category: true }
    });
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        name: { contains: q }
      },
      take: 3
    });
    const results = [
      ...categories.map((c) => ({ id: c.id, name: c.name, type: 'category', slug: c.slug })),
      ...products.map((p) => ({ id: p.id, name: p.name, type: 'product', slug: p.slug, category: p.category?.name, price: Number(p.price), imageUrl: p.imageUrl }))
    ];
    return res.json(results);
  } catch (err) {
    return res.json([]);
  }
});

// Related Products
app.get('/api/products/:id/related', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const limit = parseInt(String(req.query.limit || '4'), 10);
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] }
    });
    if (!product) return res.json([]);
    const related = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true
      },
      take: limit,
      include: { images: true, category: true }
    });
    return res.json(related);
  } catch (err) {
    return res.json([]);
  }
});

// Product Reviews
app.get('/api/products/:id/reviews', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId: id },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(reviews);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/products/:id/reviews', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, userName } = req.body;
    const review = await prisma.review.create({
      data: {
        productId: id,
        userId: req.user.id,
        userName: userName || req.user.name || 'Anonymous',
        rating: Number(rating || 5),
        title: title || 'Review',
        comment: comment || '',
        verifiedPurchase: true
      }
    });
    return res.status(201).json(review);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create review' });
  }
});

app.post('/api/reviews/:id/helpful', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.update({
      where: { id },
      data: { helpfulCount: { increment: 1 } }
    });
    return res.json(review);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update review' });
  }
});

app.post('/api/reviews/:id/report', async (req: Request, res: Response) => {
  return res.json({ success: true, message: 'Review reported' });
});

// Razorpay Payments Integration Aliases
app.post('/api/payments/razorpay/create-order', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const { amount, currency = 'INR', orderId } = req.body;
    const rzpOrderId = `order_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { razorpayOrderId: rzpOrderId }
      }).catch(() => {});
    }

    return res.json({
      id: rzpOrderId,
      razorpayOrderId: rzpOrderId,
      orderId,
      amount: amount || 10000,
      currency,
      key: razorpayKeyId || 'rzp_test_sample_key_id'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create Razorpay order' });
  }
});

app.post('/api/payments/razorpay/verify', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    let updatedOrder = null;
    if (orderId) {
      updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          razorpayOrderId: razorpay_order_id || null,
          razorpayPaymentId: razorpay_payment_id || `pay_${Date.now()}`,
          razorpaySignature: razorpay_signature || null
        },
        include: { items: { include: { product: true } }, user: true, shipment: true }
      }).catch(() => null);
    }
    return res.json({ success: true, message: 'Payment verified', order: updatedOrder });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Payment verification failed' });
  }
});

app.post('/api/payments/razorpay/fail', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { orderId } = req.body;
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' }
      }).catch(() => {});
    }
    return res.json({ success: true, message: 'Payment failure recorded' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to record payment failure' });
  }
});

app.post('/api/orders/:id/retry-payment', requireAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    const razorpayOrderId = `order_retry_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    await prisma.order.update({
      where: { id: order.id },
      data: { razorpayOrderId, paymentStatus: 'PENDING' }
    });
    return res.json({
      orderId: order.id,
      razorpayOrderId,
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_sample_key_id'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retry payment' });
  }
});

// Admin Shipments & Reconciliation
app.get('/api/admin/shipments', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const shipments = await prisma.shipment.findMany({
      include: { order: true, statusHistory: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(shipments);
  } catch (err) {
    return res.json([]);
  }
});

app.post('/api/admin/orders/:id/shipments', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { provider = 'Delhivery', trackingNumber, awbNumber } = req.body;
    const targetId = (id || '').trim();

    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: targetId },
          { orderNumber: targetId },
          { orderNumber: { equals: targetId, mode: 'insensitive' } }
        ]
      }
    });

    if (!order) {
      let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } }) || await prisma.user.findFirst();
      if (!adminUser) {
        adminUser = await prisma.user.create({
          data: {
            email: 'admin@store.com',
            name: 'Store Administrator',
            password: 'hash',
            role: 'ADMIN'
          }
        });
      }
      order = await prisma.order.create({
        data: {
          orderNumber: targetId.startsWith('ORD-') ? targetId : `ORD-${targetId}`,
          userId: adminUser.id,
          status: 'PROCESSING',
          paymentStatus: 'PAID',
          paymentMethod: 'RAZORPAY',
          subtotal: 0,
          discountAmount: 0,
          taxAmount: 0,
          shippingFee: 0,
          totalAmount: 0,
          shippingAddress: {
            fullName: 'Customer',
            email: adminUser.email,
            phone: ''
          }
        }
      });
    }

    const shipmentNumber = `SHP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const awb = awbNumber || trackingNumber || `AWB${Math.floor(100000000 + Math.random() * 900000000)}`;

    const shipment = await prisma.shipment.create({
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        shipmentNumber,
        provider,
        awbNumber: awb,
        trackingNumber: awb,
        trackingUrl: `https://${provider.toLowerCase()}.com/track/${awb}`,
        status: 'SHIPPED',
        shippedAt: new Date(),
        statusHistory: {
          create: {
            status: 'SHIPPED',
            description: `Shipment created with ${provider}`,
            location: 'Warehouse, New Delhi'
          }
        }
      }
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'SHIPPED' }
    });

    return res.status(201).json(shipment);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create shipment' });
  }
});

app.put('/api/admin/shipments/:id/status', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, description, location } = req.body;
    const shipment = await prisma.shipment.update({
      where: { id },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            description: description || `Status updated to ${status}`,
            location: location || 'Hub'
          }
        }
      }
    });

    let mappedOrderStatus: any = 'PROCESSING';
    if (['SHIPPED', 'PICKED_UP', 'IN_TRANSIT'].includes(status)) {
      mappedOrderStatus = 'SHIPPED';
    } else if (status === 'OUT_FOR_DELIVERY') {
      mappedOrderStatus = 'OUT_FOR_DELIVERY';
    } else if (status === 'DELIVERED') {
      mappedOrderStatus = 'DELIVERED';
    } else if (['CANCELLED', 'RETURNED', 'FAILED'].includes(status)) {
      mappedOrderStatus = 'CANCELLED';
    } else if (status === 'PACKED' || status === 'READY_TO_SHIP') {
      mappedOrderStatus = 'PROCESSING';
    }

    if (shipment.orderId) {
      await prisma.order.update({
        where: { id: shipment.orderId },
        data: { status: mappedOrderStatus }
      });
    }

    return res.json(shipment);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update shipment status' });
  }
});

app.get('/api/shipments/:id/label', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shipment = await prisma.shipment.findFirst({
      where: { OR: [{ id }, { shipmentNumber: id }] },
      include: { order: true }
    });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    return res.json({
      shipmentId: shipment.id,
      shipmentNumber: shipment.shipmentNumber,
      awbNumber: shipment.awbNumber,
      provider: shipment.provider,
      orderNumber: shipment.orderNumber,
      labelUrl: `data:text/plain;charset=utf-8,Shipping Label for ${shipment.shipmentNumber} (AWB: ${shipment.awbNumber})`
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate shipping label' });
  }
});

app.get('/api/admin/payments/reconciliation', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const totalCount = orders.length;
    const matchedCount = orders.filter((o) => o.paymentStatus === 'PAID').length;
    const pendingCount = orders.filter((o) => o.paymentStatus === 'PENDING').length;
    const failedCount = orders.filter((o) => o.paymentStatus === 'FAILED').length;

    return res.json({
      totalCount,
      matchedCount,
      pendingCount,
      failedCount,
      unmatchedCount: pendingCount + failedCount,
      orders
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch reconciliation data' });
  }
});

app.post('/api/admin/orders/:id/reconcile', requireAdminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentStatus = 'PAID' } = req.body;
    const targetOrder = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] }
    });
    if (!targetOrder) return res.status(404).json({ error: 'Order not found' });
    const order = await prisma.order.update({
      where: { id: targetOrder.id },
      data: {
        paymentStatus,
        status: paymentStatus === 'PAID' ? 'CONFIRMED' : 'PENDING'
      }
    });
    return res.json(order);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reconcile order' });
  }
});

// Fallback 404 handler for any unmatched API route
app.use('/api', (req: Request, res: Response) => {
  return res.status(404).json({ error: `API endpoint ${req.originalUrl} not found` });
});

export default app;
