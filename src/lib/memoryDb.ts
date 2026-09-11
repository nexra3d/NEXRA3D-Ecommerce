import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SERVICES,
  INITIAL_FAQS,
  INITIAL_TESTIMONIALS,
  INITIAL_BANNERS
} from '../data/mockData.js';

function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

class MemoryStore {
  collections: Record<string, any[]> = {
    user: [],
    emailVerificationOTP: [],
    address: [],
    category: [],
    product: [],
    productImage: [],
    productVariant: [],
    cart: [],
    cartItem: [],
    wishlist: [],
    wishlistItem: [],
    order: [],
    orderItem: [],
    review: [],
    service: [],
    quoteRequest: [],
    cMSPage: [],
    testimonial: [],
    fAQ: [],
    banner: [],
    siteSetting: [],
    shipment: [],
    shipmentStatusHistory: [],
    productLampOption: [],
    cartItemCustomizationImage: [],
    orderItemCustomizationImage: [],
    consentRecord: [],
    customerUpload: [],
    privacyRequest: [],
    securityEvent: [],
    customOrder: [],
    customOrderReview: []
  };

  private snapshotFilePath: string = path.resolve('.data_store/memory_db_snapshot.json');

  constructor() {
    this.seed();
    this.loadFromSnapshot();
  }

  loadFromSnapshot() {
    try {
      if (fs.existsSync(this.snapshotFilePath)) {
        const raw = fs.readFileSync(this.snapshotFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          for (const [key, val] of Object.entries(parsed)) {
            if (Array.isArray(val) && val.length > 0) {
              this.collections[key] = val;
            }
          }
        }
      }
    } catch (err) {
      console.warn('[MemoryDB] Notice: snapshot load deferred:', err);
    }
  }

  persistToSnapshot() {
    try {
      const dirPath = path.dirname(this.snapshotFilePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(this.snapshotFilePath, JSON.stringify(this.collections, null, 2), 'utf8');
    } catch (err) {
      console.warn('[MemoryDB] Notice: snapshot persist deferred:', err);
    }
  }

  seed() {
    const defaultPasswordHash = bcrypt.hashSync('password123', 10);
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);

    this.collections.user = [
      {
        id: 'usr-admin',
        name: 'Admin User',
        email: 'admin@3dprints.com',
        password: adminPasswordHash,
        role: 'ADMIN',
        emailVerified: true,
        phone: '9876543210',
        company: '3D Printing Solutions',
        gst: '29ABCDE1234F1Z5',
        avatar: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'usr-demo',
        name: 'Varun Manurani',
        email: 'varunmanurani@gmail.com',
        password: defaultPasswordHash,
        role: 'CUSTOMER',
        emailVerified: true,
        phone: '9876543210',
        company: 'Personal',
        gst: '',
        avatar: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.collections.address = [
      {
        id: 'addr-demo-1',
        userId: 'usr-demo',
        fullName: 'Varun Manurani',
        phone: '9876543210',
        streetAddress: 'Plot no 484, TNGOs Colony, Gachibowli',
        apartment: 'TNGOs Colony',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500032',
        country: 'India',
        isDefault: true,
        type: 'HOME',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    if (INITIAL_CATEGORIES && INITIAL_CATEGORIES.length > 0) {
      this.collections.category = INITIAL_CATEGORIES.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug || c.id,
        description: c.description || '',
        imageUrl: c.imageUrl || '',
        isActive: true,
        displayOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }

    if (INITIAL_PRODUCTS && INITIAL_PRODUCTS.length > 0) {
      this.collections.product = INITIAL_PRODUCTS.map((p: any) => ({
        id: p.id,
        name: p.title || p.name,
        slug: p.slug || p.id,
        sku: p.sku || `SKU-${p.id}`,
        shortDescription: p.shortDescription || p.description?.substring(0, 100) || '',
        description: p.description || '',
        price: p.price || 0,
        mrp: p.mrp || p.price || 0,
        discountPercentage: p.mrp && p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0,
        stockQuantity: p.stock ?? p.stockQuantity ?? 10,
        lowStockThreshold: 5,
        imageUrl: p.images?.[0] || p.imageUrl || '',
        isActive: true,
        isFeatured: p.isFeatured ?? false,
        isNewArrival: p.isNewArrival ?? false,
        isBestSeller: p.isBestSeller ?? false,
        categoryId: p.categoryId || 'cat-lamps',
        requiresCustomization: Boolean(p.requiresCustomization),
        requiresImageUpload: Boolean(p.requiresImageUpload),
        minimumImageUploads: p.minimumImageUploads !== undefined && p.minimumImageUploads !== null ? Number(p.minimumImageUploads) : 1,
        maximumImageUploads: p.maximumImageUploads !== undefined && p.maximumImageUploads !== null ? Number(p.maximumImageUploads) : 5,
        weight: p.weight ?? (p.specifications?.weight ? Number(p.specifications.weight) : 0.25),
        length: p.length ?? (p.specifications?.length ? Number(p.specifications.length) : 10),
        width: p.width ?? (p.specifications?.width ? Number(p.specifications.width) : 10),
        height: p.height ?? (p.specifications?.height ? Number(p.specifications.height) : 12),
        specifications: {
          ...(p.specifications || {}),
          length: p.length ?? p.specifications?.length ?? 10,
          width: p.width ?? p.specifications?.width ?? 10,
          height: p.height ?? p.specifications?.height ?? 12
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }

    if (INITIAL_SERVICES && INITIAL_SERVICES.length > 0) {
      this.collections.service = INITIAL_SERVICES.map((s: any) => ({
        ...s,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }

    if (INITIAL_FAQS && INITIAL_FAQS.length > 0) {
      this.collections.fAQ = INITIAL_FAQS.map((f: any) => ({
        ...f,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }

    if (INITIAL_TESTIMONIALS && INITIAL_TESTIMONIALS.length > 0) {
      this.collections.testimonial = INITIAL_TESTIMONIALS.map((t: any) => ({
        ...t,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }

    if (INITIAL_BANNERS && INITIAL_BANNERS.length > 0) {
      this.collections.banner = INITIAL_BANNERS.map((b: any) => ({
        ...b,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
    }

    this.collections.productLampOption = [
      // Lamp A: Parametric Spiral LED Table Lamp
      {
        id: 'opt-spiral-col-1',
        productId: 'prod-spiral-ambient-lamp',
        optionType: 'COLOUR',
        optionValue: 'Warm White',
        priceDelta: 0,
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'opt-spiral-col-2',
        productId: 'prod-spiral-ambient-lamp',
        optionType: 'COLOUR',
        optionValue: 'Cool White',
        priceDelta: 0,
        sortOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'opt-spiral-wat-1',
        productId: 'prod-spiral-ambient-lamp',
        optionType: 'WATTAGE',
        optionValue: '5W',
        priceDelta: 0,
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'opt-spiral-wat-2',
        productId: 'prod-spiral-ambient-lamp',
        optionType: 'WATTAGE',
        optionValue: '7W',
        priceDelta: 100,
        sortOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'opt-spiral-wat-3',
        productId: 'prod-spiral-ambient-lamp',
        optionType: 'WATTAGE',
        optionValue: '9W',
        priceDelta: 150,
        sortOrder: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'opt-spiral-wat-4',
        productId: 'prod-spiral-ambient-lamp',
        optionType: 'WATTAGE',
        optionValue: '12W',
        priceDelta: 200,
        sortOrder: 4,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Lamp B: Personalized 3D Printed Photo Lithophane Moon Lamp
      {
        id: 'opt-moon-col-1',
        productId: 'prod-lithophane-moon-lamp',
        optionType: 'COLOUR',
        optionValue: 'Warm White',
        priceDelta: 0,
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'opt-moon-col-2',
        productId: 'prod-lithophane-moon-lamp',
        optionType: 'COLOUR',
        optionValue: 'Neutral White',
        priceDelta: 0,
        sortOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'opt-moon-wat-1',
        productId: 'prod-lithophane-moon-lamp',
        optionType: 'WATTAGE',
        optionValue: '2W',
        priceDelta: 0,
        sortOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'opt-moon-wat-2',
        productId: 'prod-lithophane-moon-lamp',
        optionType: 'WATTAGE',
        optionValue: '4W',
        priceDelta: 30,
        sortOrder: 2,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'opt-moon-wat-3',
        productId: 'prod-lithophane-moon-lamp',
        optionType: 'WATTAGE',
        optionValue: '6W',
        priceDelta: 80,
        sortOrder: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.collections.customOrder = [
      {
        id: 'N3D-CO-0004-10092026',
        customerName: 'Shrikha',
        phone: '9876543210',
        email: 'shrikha@example.com',
        description: 'Custom personalized 3D keychain with dual-tone lettering and reinforced ring loop',
        customOrderName: 'Custom Key Chain',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        isPublic: false,
        amount: 450.00,
        deliveryType: 'STORE_PICKUP',
        notes: 'Red and white matte finish',
        paymentStatus: 'AWAITING_PAYMENT',
        razorpayOrderId: 'order_co_0004',
        razorpayQrId: 'qr_co_0004',
        qrImageUrl: '',
        paymentLink: 'upi://pay?pa=nexra3d@icici&pn=NEXRA%203D&am=450.00&cu=INR',
        isSimulated: true,
        expiresAt: new Date(Date.now() + 86400000 * 30),
        paidAt: null,
        createdAt: new Date(Date.now() - 3600000 * 2),
        updatedAt: new Date(Date.now() - 3600000 * 2)
      },
      {
        id: 'N3D-CO-0005-10092026',
        customerName: 'Karan Verma',
        phone: '9811223344',
        email: 'karan.verma@example.com',
        description: 'Classical Greek architectural column pillar miniature replica with pedestal',
        customOrderName: 'Custom Pillar',
        imageUrl: 'https://images.unsplash.com/photo-1544642899-f0d4504f479b?auto=format&fit=crop&w=800&q=80',
        isPublic: false,
        amount: 850.00,
        deliveryType: 'STORE_PICKUP',
        notes: 'White marble filament texture',
        paymentStatus: 'AWAITING_PAYMENT',
        razorpayOrderId: 'order_co_0005',
        razorpayQrId: 'qr_co_0005',
        qrImageUrl: '',
        paymentLink: 'upi://pay?pa=nexra3d@icici&pn=NEXRA%203D&am=850.00&cu=INR',
        isSimulated: true,
        expiresAt: new Date(Date.now() + 86400000 * 30),
        paidAt: null,
        createdAt: new Date(Date.now() - 3600000 * 4),
        updatedAt: new Date(Date.now() - 3600000 * 4)
      },
      {
        id: 'N3D-CO-0003-10092026',
        customerName: 'Siddharth Rao',
        phone: '9845012399',
        email: 'siddharth.rao@example.com',
        description: 'Aerodynamic action camera chin mount tailored for motorcycle helmet visor contour',
        customOrderName: 'Ghost Rider Motorcycle Helmet Mount',
        imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
        isPublic: false,
        amount: 1200.00,
        deliveryType: 'HOME_DELIVERY',
        notes: 'High temp PETG filament required',
        paymentStatus: 'PAID',
        razorpayOrderId: 'order_co_0003',
        razorpayQrId: 'qr_co_0003',
        qrImageUrl: '',
        paymentLink: 'upi://pay?pa=nexra3d@icici&pn=NEXRA%203D&am=1200.00&cu=INR',
        isSimulated: true,
        expiresAt: new Date(Date.now() + 86400000 * 30),
        paidAt: new Date(Date.now() - 86400000 * 1),
        createdAt: new Date(Date.now() - 86400000 * 1),
        updatedAt: new Date(Date.now() - 86400000 * 1)
      },
      {
        id: 'N3D-CO-0002-10092026',
        customerName: 'Megha Kapoor',
        phone: '9920145678',
        email: 'megha.k@creatorstudio.in',
        description: 'Heavy duty C-clamp desk bracket with cable guide slots for studio boom arm',
        customOrderName: 'Content Creator Studio Mic Boom Arm Clamp',
        imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
        isPublic: false,
        amount: 950.00,
        deliveryType: 'HOME_DELIVERY',
        notes: 'Matte black finish, rubber pad recess',
        paymentStatus: 'PAID',
        razorpayOrderId: 'order_co_0002',
        razorpayQrId: 'qr_co_0002',
        qrImageUrl: '',
        paymentLink: 'upi://pay?pa=nexra3d@icici&pn=NEXRA%203D&am=950.00&cu=INR',
        isSimulated: true,
        expiresAt: new Date(Date.now() + 86400000 * 30),
        paidAt: new Date(Date.now() - 86400000 * 2),
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000 * 2)
      },
      {
        id: 'N3D-CO-0001-10092026',
        customerName: 'Rahul Sen',
        phone: '9717012345',
        email: 'rahul.sen@gmail.com',
        description: 'Precision mechanical prototype casing with snap clips and ventilation grills',
        customOrderName: 'Custom 3D Print',
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        isPublic: false,
        amount: 650.00,
        deliveryType: 'STORE_PICKUP',
        notes: '0.16mm layer height',
        paymentStatus: 'PAID',
        razorpayOrderId: 'order_co_0001',
        razorpayQrId: 'qr_co_0001',
        qrImageUrl: '',
        paymentLink: 'upi://pay?pa=nexra3d@icici&pn=NEXRA%203D&am=650.00&cu=INR',
        isSimulated: true,
        expiresAt: new Date(Date.now() + 86400000 * 30),
        paidAt: new Date(Date.now() - 86400000 * 3),
        createdAt: new Date(Date.now() - 86400000 * 3),
        updatedAt: new Date(Date.now() - 86400000 * 3)
      },
      {
        id: 'co-sample-101',
        customerName: 'Kavitha Reddy',
        phone: '9848012345',
        email: 'kavitha.reddy@gmail.com',
        description: 'Bespoke cylindrical lithophane lamp with warm LED timber base, featuring family portrait',
        customOrderName: 'Golden Anniversary Lithophane Lamp',
        imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
        isPublic: true,
        amount: 2450.00,
        deliveryType: 'HOME_DELIVERY',
        notes: 'Requested expedited assembly and gift wrapping',
        paymentStatus: 'PAID',
        razorpayOrderId: 'order_samp_98231',
        razorpayQrId: 'qr_samp_98231',
        qrImageUrl: '',
        paymentLink: 'upi://pay?pa=nexra3d@icici&pn=NEXRA%203D&am=2450.00&cu=INR',
        isSimulated: true,
        expiresAt: new Date(Date.now() + 86400000 * 30),
        paidAt: new Date(Date.now() - 86400000 * 3),
        createdAt: new Date(Date.now() - 86400000 * 4),
        updatedAt: new Date(Date.now() - 86400000 * 3)
      },
      {
        id: 'co-sample-102',
        customerName: 'Vikram Malhotra',
        phone: '9885123456',
        email: 'v.malhotra@aerotech.in',
        description: 'High-tensile carbon fiber infused nylon quadcopter arm bracket & gimbal mount',
        customOrderName: 'Carbon Fiber Quadcopter Drone Bracket',
        imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80',
        isPublic: true,
        amount: 4800.00,
        deliveryType: 'STORE_PICKUP',
        notes: '0.12mm layer height, 100% infill for flight stress tolerance',
        paymentStatus: 'PAID',
        razorpayOrderId: 'order_samp_98232',
        razorpayQrId: 'qr_samp_98232',
        qrImageUrl: '',
        paymentLink: 'upi://pay?pa=nexra3d@icici&pn=NEXRA%203D&am=4800.00&cu=INR',
        isSimulated: true,
        expiresAt: new Date(Date.now() + 86400000 * 30),
        paidAt: new Date(Date.now() - 86400000 * 2),
        createdAt: new Date(Date.now() - 86400000 * 3),
        updatedAt: new Date(Date.now() - 86400000 * 2)
      },
      {
        id: 'co-sample-103',
        customerName: 'Ananya Sharma',
        phone: '9949098765',
        email: 'ananya.sharma@outlook.com',
        description: 'Lord Venkateswara Balaji 18cm idol with intricate jewelry in metallic antique copper finish',
        customOrderName: 'Tirupati Balaji Antique Copper Idol',
        imageUrl: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80',
        isPublic: true,
        amount: 1850.00,
        deliveryType: 'HOME_DELIVERY',
        notes: 'Please ensure bubble wrapped packaging with fragile stickers',
        paymentStatus: 'AWAITING_PAYMENT',
        razorpayOrderId: 'order_samp_98233',
        razorpayQrId: 'qr_samp_98233',
        qrImageUrl: '',
        paymentLink: 'upi://pay?pa=nexra3d@icici&pn=NEXRA%203D&am=1850.00&cu=INR',
        isSimulated: true,
        expiresAt: new Date(Date.now() + 3600000 * 2), // 2 hours from now
        paidAt: null,
        createdAt: new Date(Date.now() - 1800000), // 30 mins ago
        updatedAt: new Date(Date.now() - 1800000)
      },
      {
        id: 'co-sample-104',
        customerName: 'Rajesh Naidu',
        phone: '8886149998',
        email: 'rajesh.naidu@gmail.com',
        description: 'Architectural scale model (1:200) of gated community luxury villa layout',
        customOrderName: 'Gated Villa Architectural Model (1:200)',
        imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
        isPublic: true,
        amount: 7200.00,
        deliveryType: 'STORE_PICKUP',
        notes: 'Multi-part snap fit assembly with acrylic display case',
        paymentStatus: 'PAID',
        razorpayOrderId: 'order_samp_98234',
        razorpayQrId: 'qr_samp_98234',
        qrImageUrl: '',
        paymentLink: 'upi://pay?pa=nexra3d@icici&pn=NEXRA%203D&am=7200.00&cu=INR',
        isSimulated: true,
        expiresAt: new Date(Date.now() + 86400000 * 30),
        paidAt: new Date(Date.now() - 86400000 * 1),
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date(Date.now() - 86400000 * 1)
      }
    ];

    this.collections.customOrderReview = [
      {
        id: 'cor-sample-201',
        customOrderId: 'co-sample-101',
        userId: null,
        userName: 'Srinivas R.',
        reviewerName: 'Srinivas R.',
        rating: 5,
        title: 'Breathtaking Anniversary Gift!',
        comment: 'The lithophane resolution is unbelievably clear when backlit. My parents were completely moved by the detail. Thank you NEXRA 3D!',
        isApproved: true,
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 86400000 * 2)
      },
      {
        id: 'cor-sample-202',
        customOrderId: 'co-sample-102',
        userId: null,
        userName: 'Vikram M.',
        reviewerName: 'Vikram M.',
        rating: 5,
        title: 'Outstanding Mechanical Rigidity',
        comment: 'Printed in carbon-filled nylon with flawless dimensional accuracy. Fits our drone arms with zero play. Highly recommended.',
        isApproved: true,
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 86400000 * 1)
      },
      {
        id: 'cor-sample-203',
        customOrderId: 'co-sample-104',
        userId: null,
        userName: 'Priya K.',
        reviewerName: 'Priya K.',
        rating: 5,
        title: 'Perfect Architectural Detailing',
        comment: 'The villa model scale was spot on for our client presentation. Every balcony and window frame was crisp.',
        isApproved: true,
        status: 'APPROVED',
        createdAt: new Date(Date.now() - 43200000)
      }
    ];
  }

  snapshot(): string {
    return JSON.stringify(this.collections);
  }

  restore(snapshotStr: string) {
    try {
      this.collections = JSON.parse(snapshotStr);
    } catch (e) {
      console.error('Failed to restore memoryStore snapshot:', e);
    }
  }

  getStore(model: string): any[] {
    if (!model || typeof model !== 'string') {
      return [];
    }
    const key = model.toLowerCase();
    const storeKey = Object.keys(this.collections).find((k) => k.toLowerCase() === key);
    if (!storeKey) {
      this.collections[model] = this.collections[model] || [];
      return this.collections[model];
    }
    return this.collections[storeKey];
  }

  matchWhere(item: any, where: any): boolean {
    if (!where || Object.keys(where).length === 0) return true;

    for (const [key, val] of Object.entries(where)) {
      if (key === 'OR' && Array.isArray(val)) {
        const matchesOr = val.some((subWhere) => this.matchWhere(item, subWhere));
        if (!matchesOr) return false;
        continue;
      }
      if (key === 'AND' && Array.isArray(val)) {
        const matchesAnd = val.every((subWhere) => this.matchWhere(item, subWhere));
        if (!matchesAnd) return false;
        continue;
      }

      const itemVal = item[key];

      if (val === undefined) continue;

      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        if ('equals' in val) {
          if (itemVal !== val.equals) return false;
        } else if ('in' in val && Array.isArray(val.in)) {
          if (!val.in.includes(itemVal)) return false;
        } else if ('not' in val) {
          if (itemVal === val.not) return false;
        } else if ('notIn' in val && Array.isArray(val.notIn)) {
          if (val.notIn.includes(itemVal)) return false;
        } else if ('contains' in val) {
          const strVal = String(itemVal || '').toLowerCase();
          const target = String(val.contains || '').toLowerCase();
          if (!strVal.includes(target)) return false;
        } else if ('mode' in val) {
          // ignore
        } else {
          if (!this.matchWhere(itemVal || {}, val)) return false;
        }
      } else if (itemVal !== val) {
        if (
          typeof itemVal === 'string' &&
          typeof val === 'string' &&
          itemVal.trim().toLowerCase() === val.trim().toLowerCase()
        ) {
          continue;
        }
        return false;
      }
    }
    return true;
  }

  attachIncludes(item: any, model: string, include: any): any {
    if (!item || !include) return item;
    const cloned = { ...item };
    const modelLower = typeof model === 'string' ? model.toLowerCase() : '';

    if (include.addresses) {
      cloned.addresses = this.getStore('address').filter((a) => a.userId === item.id);
    }
    if (include.orders) {
      const rawOrders = this.getStore('order').filter((o) => o.userId === item.id);
      const orderIncludes = typeof include.orders === 'object' ? include.orders.include : null;
      cloned.orders = rawOrders.map((o) => this.attachIncludes(o, 'order', orderIncludes));
    }
    if (include.cart) {
      const c = this.getStore('cart').find((c) => c.userId === item.id) || null;
      const cartIncludes = typeof include.cart === 'object' ? include.cart.include : null;
      cloned.cart = c ? this.attachIncludes(c, 'cart', cartIncludes) : null;
    }
    if (include.wishlist) {
      const w = this.getStore('wishlist').find((w) => w.userId === item.id) || null;
      const wishlistIncludes = typeof include.wishlist === 'object' ? include.wishlist.include : null;
      cloned.wishlist = w ? this.attachIncludes(w, 'wishlist', wishlistIncludes) : null;
    }
    if (include.reviews) {
      cloned.reviews = this.getStore('review').filter((r) => r.userId === item.id);
    }
    if (include.consentRecords) {
      cloned.consentRecords = this.getStore('consentRecord').filter((c) => c.userId === item.id || (item.email && c.email === item.email));
    }
    if (include.customerUploads) {
      cloned.customerUploads = this.getStore('customerUpload').filter((u) => u.userId === item.id);
    }
    if (include.privacyRequests) {
      cloned.privacyRequests = this.getStore('privacyRequest').filter((p) => p.userId === item.id || (item.email && p.email === item.email));
    }
    if (include.category && item.categoryId) {
      const cat = this.getStore('category').find((c) => c.id === item.categoryId) || null;
      cloned.category = cat;
    }
    if (include.images) {
      cloned.images = this.getStore('productImage').filter((i) => i.productId === item.id);
    }
    if (include.variants) {
      cloned.variants = this.getStore('productVariant').filter((v) => v.productId === item.id);
    }
    if (include.customizationImages) {
      if (modelLower === 'cartitem') {
        cloned.customizationImages = this.getStore('cartItemCustomizationImage').filter((ci) => ci.cartItemId === item.id);
      } else if (modelLower === 'orderitem') {
        cloned.customizationImages = this.getStore('orderItemCustomizationImage').filter((oi) => oi.orderItemId === item.id);
      }
    }
    if (include.items) {
      let rawItems: any[] = [];
      if (modelLower === 'cart') {
        rawItems = this.getStore('cartItem').filter((ci) => ci.cartId === item.id);
      } else if (modelLower === 'wishlist') {
        rawItems = this.getStore('wishlistItem').filter((wi) => wi.wishlistId === item.id);
      } else if (modelLower === 'order') {
        rawItems = this.getStore('orderItem').filter((oi) => oi.orderId === item.id);
      }

      const itemIncludes = typeof include.items === 'object' ? (include.items.include || { product: true, variant: true }) : { product: true, variant: true };
      const modelChildType = modelLower === 'cart' ? 'cartItem' : (modelLower === 'wishlist' ? 'wishlistItem' : 'orderItem');
      cloned.items = rawItems.map((child) => this.attachIncludes(child, modelChildType, itemIncludes));
    }
    if (include.product || modelLower === 'cartitem' || modelLower === 'wishlistitem' || modelLower === 'orderitem') {
      if (item.productId && !cloned.product) {
        const prod = this.getStore('product').find((p) => p.id === item.productId) || null;
        if (prod) {
          const prodIncludes = typeof include.product === 'object' ? (include.product.include || { images: true, category: true }) : { images: true, category: true };
          cloned.product = this.attachIncludes(prod, 'product', prodIncludes);
        } else {
          cloned.product = null;
        }
      }
    }
    if (include.variant || modelLower === 'cartitem' || modelLower === 'orderitem') {
      if (item.variantId && !cloned.variant) {
        cloned.variant = this.getStore('productVariant').find((v) => v.id === item.variantId) || null;
      }
    }
    if (include.payment) {
      if (modelLower === 'order') {
        cloned.payment = this.getStore('payment').find((p) => p.orderId === item.id) || null;
      } else {
        cloned.payments = this.getStore('payment').filter((p) => p.userId === item.id);
      }
    }
    if (include.shipment && modelLower === 'order') {
      const shp = this.getStore('shipment').find((s) => s.orderId === item.id) || null;
      if (shp) {
        cloned.shipment = this.attachIncludes(shp, 'shipment', { statusHistory: true });
      } else {
        cloned.shipment = null;
      }
    }
    if (include.statusHistory && modelLower === 'shipment') {
      cloned.statusHistory = this.getStore('shipmentStatusHistory').filter((sh) => sh.shipmentId === item.id);
    }
    if (include.user && item.userId) {
      cloned.user = this.getStore('user').find((u) => u.id === item.userId) || null;
    }

    return cloned;
  }

  private processDataRelations(data: any) {
    if (!data || typeof data !== 'object') return data;
    const processed = { ...data };
    for (const key of Object.keys(processed)) {
      const val = processed[key];
      if (val && typeof val === 'object' && val.connect && typeof val.connect === 'object') {
        const connectId = val.connect.id || val.connect.slug;
        if (connectId) {
          const foreignKeyField = key + 'Id';
          processed[foreignKeyField] = connectId;
        }
        delete processed[key];
      }
    }
    return processed;
  }

  createModelHandler(modelName: string) {
    const store = this.getStore(modelName);

    return {
      findUnique: async (args: any = {}) => {
        let item = store.find((i) => this.matchWhere(i, args.where));
        if (!item && args.where?.id) {
          const targetId = String(args.where.id).trim().toLowerCase();
          item = store.find((i) => String(i.id || '').trim().toLowerCase() === targetId);
        }
        return item ? this.attachIncludes(item, modelName, args.include) : null;
      },

      findFirst: async (args: any = {}) => {
        let results = store.filter((i) => this.matchWhere(i, args.where));
        if (results.length === 0 && args.where?.id) {
          const targetId = String(args.where.id).trim().toLowerCase();
          const fallback = store.find((i) => String(i.id || '').trim().toLowerCase() === targetId);
          if (fallback) results = [fallback];
        }
        if (args.orderBy) {
          results = this.sortResults(results, args.orderBy);
        }
        const item = results[0];
        return item ? this.attachIncludes(item, modelName, args.include) : null;
      },

      findMany: async (args: any = {}) => {
        let results = store.filter((i) => this.matchWhere(i, args.where));
        if (args.orderBy) {
          results = this.sortResults(results, args.orderBy);
        }
        if (args.skip) {
          results = results.slice(args.skip);
        }
        if (args.take) {
          results = results.slice(0, args.take);
        }
        return results.map((item) => this.attachIncludes(item, modelName, args.include));
      },

      count: async (args: any = {}) => {
        return store.filter((i) => this.matchWhere(i, args.where)).length;
      },

      create: async (args: any = {}) => {
        const data = this.processDataRelations(args.data || {});
        const id = data.id || generateId(modelName.toLowerCase());

        let nestedItemsToCreate: any[] = [];
        if (data.items && typeof data.items === 'object' && data.items.create) {
          nestedItemsToCreate = Array.isArray(data.items.create) ? data.items.create : [data.items.create];
          delete data.items;
        }

        let nestedStatusHistory: any[] = [];
        if (data.statusHistory && typeof data.statusHistory === 'object' && data.statusHistory.create) {
          nestedStatusHistory = Array.isArray(data.statusHistory.create) ? data.statusHistory.create : [data.statusHistory.create];
          delete data.statusHistory;
        }

        let nestedPaymentToCreate: any = null;
        if (data.payment && typeof data.payment === 'object' && data.payment.create) {
          nestedPaymentToCreate = data.payment.create;
          delete data.payment;
        }

        const newItem = {
          id,
          ...data,
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date()
        };
        store.push(newItem);

        if (nestedPaymentToCreate && modelName.toLowerCase() === 'order') {
          const paymentStore = this.getStore('payment');
          const paymentItem = {
            id: nestedPaymentToCreate.id || generateId('payment'),
            orderId: id,
            ...nestedPaymentToCreate,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          paymentStore.push(paymentItem);
        }

        if (nestedItemsToCreate.length > 0 && modelName.toLowerCase() === 'order') {
          const orderItemStore = this.getStore('orderItem');
          for (const itemData of nestedItemsToCreate) {
            const orderItem = {
              id: itemData.id || generateId('orderitem'),
              orderId: id,
              ...itemData,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            orderItemStore.push(orderItem);
          }
        }

        if (nestedStatusHistory.length > 0 && modelName.toLowerCase() === 'shipment') {
          const shpHistoryStore = this.getStore('shipmentStatusHistory');
          for (const shData of nestedStatusHistory) {
            const shItem = {
              id: shData.id || generateId('shphistory'),
              shipmentId: id,
              ...shData,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            shpHistoryStore.push(shItem);
          }
        }

        this.persistToSnapshot();
        return this.attachIncludes(newItem, modelName, args.include);
      },

      createMany: async (args: any = {}) => {
        const items = Array.isArray(args.data) ? args.data : [args.data];
        let count = 0;
        for (const itemData of items) {
          const id = itemData.id || generateId(modelName.toLowerCase());
          const newItem = {
            id,
            ...itemData,
            createdAt: itemData.createdAt || new Date(),
            updatedAt: itemData.updatedAt || new Date()
          };
          store.push(newItem);
          count++;
        }
        this.persistToSnapshot();
        return { count };
      },

      update: async (args: any = {}) => {
        let itemIndex = store.findIndex((i) => this.matchWhere(i, args.where));
        if (itemIndex === -1 && args.where?.id) {
          const targetId = String(args.where.id).trim().toLowerCase();
          itemIndex = store.findIndex((i) => String(i.id || '').trim().toLowerCase() === targetId);
        }
        if (itemIndex === -1) {
          console.warn(`[MemoryDB ${modelName}] Record not found for update, creating resilient upsert for:`, args.where);
          const updateData = this.processDataRelations(args.data || {});
          const newItem = {
            id: args.where?.id || generateId(modelName.toLowerCase()),
            ...args.where,
            ...updateData,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          store.unshift(newItem);
          this.persistToSnapshot();
          return this.attachIncludes(newItem, modelName, args.include);
        }
        const current = store[itemIndex];
        const updateData = this.processDataRelations(args.data || {});
        const updated = {
          ...current,
          ...updateData,
          updatedAt: new Date()
        };
        store[itemIndex] = updated;
        this.persistToSnapshot();
        return this.attachIncludes(updated, modelName, args.include);
      },

      updateMany: async (args: any = {}) => {
        let count = 0;
        const updateData = this.processDataRelations(args.data || {});
        store.forEach((item, idx) => {
          if (this.matchWhere(item, args.where)) {
            store[idx] = { ...item, ...updateData, updatedAt: new Date() };
            count++;
          }
        });
        this.persistToSnapshot();
        return { count };
      },

      upsert: async (args: any = {}) => {
        let existingIndex = store.findIndex((i) => this.matchWhere(i, args.where));
        if (existingIndex === -1 && args.where?.id) {
          const targetId = String(args.where.id).trim().toLowerCase();
          existingIndex = store.findIndex((i) => String(i.id || '').trim().toLowerCase() === targetId);
        }
        if (existingIndex !== -1) {
          const updateData = this.processDataRelations(args.update || {});
          const updated = { ...store[existingIndex], ...updateData, updatedAt: new Date() };
          store[existingIndex] = updated;
          this.persistToSnapshot();
          return this.attachIncludes(updated, modelName, args.include);
        } else {
          const createData = this.processDataRelations(args.create || {});
          const newItem = {
            id: args.create?.id || args.where?.id || generateId(modelName.toLowerCase()),
            ...createData,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          store.unshift(newItem);
          this.persistToSnapshot();
          return this.attachIncludes(newItem, modelName, args.include);
        }
      },

      delete: async (args: any = {}) => {
        let itemIndex = store.findIndex((i) => this.matchWhere(i, args.where));
        if (itemIndex === -1 && args.where?.id) {
          const targetId = String(args.where.id).trim().toLowerCase();
          itemIndex = store.findIndex((i) => String(i.id || '').trim().toLowerCase() === targetId);
        }
        if (itemIndex === -1) {
          return null;
        }
        const [removed] = store.splice(itemIndex, 1);
        this.persistToSnapshot();
        return removed;
      },

      deleteMany: async (args: any = {}) => {
        let count = 0;
        for (let i = store.length - 1; i >= 0; i--) {
          if (this.matchWhere(store[i], args.where)) {
            store.splice(i, 1);
            count++;
          }
        }
        this.persistToSnapshot();
        return { count };
      },

      aggregate: async (args: any = {}) => {
        const items = store.filter((i) => this.matchWhere(i, args.where));
        const _sum: any = {};
        const _count: any = { _all: items.length };
        const _avg: any = {};

        if (args._sum) {
          for (const key of Object.keys(args._sum)) {
            _sum[key] = items.reduce((acc, curr) => acc + (Number(curr[key]) || 0), 0);
          }
        }
        return { _sum, _count, _avg };
      }
    };
  }

  private sortResults(results: any[], orderBy: any) {
    const sorted = [...results];
    const orderKey = Object.keys(orderBy)[0];
    if (!orderKey) return sorted;
    const direction = orderBy[orderKey] === 'desc' ? -1 : 1;

    sorted.sort((a, b) => {
      const valA = a[orderKey];
      const valB = b[orderKey];
      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;
    });
    return sorted;
  }
}

export const memoryStore = new MemoryStore();
