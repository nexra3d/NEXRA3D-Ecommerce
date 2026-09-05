import bcrypt from 'bcryptjs';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SERVICES,
  INITIAL_FAQS,
  INITIAL_TESTIMONIALS,
  INITIAL_BANNERS,
  INITIAL_ORDERS
} from '../data/mockData.js';

function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

class MemoryStore {
  collections: Record<string, any[]> = {
    user: [],
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
    customOrder: []
  };

  constructor() {
    this.seed();
  }

  seed() {
    const adminPasswordHash = bcrypt.hashSync('Admin@Nexra2026!', 10);
    const demoPasswordHash = bcrypt.hashSync('Varun@Nexra2026!', 10);

    this.collections.user = [
      {
        id: 'usr-admin',
        name: 'Admin User',
        email: 'admin@nexra3d.in',
        password: adminPasswordHash,
        role: 'ADMIN',
        isEmailVerified: true,
        phone: '9876543210',
        company: 'NEXRA 3D Technologies',
        gst: '36ABCDE1234F1Z5',
        avatar: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'usr-demo',
        name: 'Varun Manurani',
        email: 'varunmanurani@gmail.com',
        password: demoPasswordHash,
        role: 'CUSTOMER',
        isEmailVerified: true,
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
        postalCode: '500046',
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

    if (INITIAL_ORDERS && INITIAL_ORDERS.length > 0) {
      this.collections.order = INITIAL_ORDERS.map((o: any) => {
        const orderId = o.id || `ord-${Math.random().toString(36).substring(2, 7)}`;
        const orderItems = (o.items || []).map((it: any) => ({
          id: it.id || `oi-${Math.random().toString(36).substring(2, 7)}`,
          orderId,
          productId: it.productId,
          variantId: it.variantId || null,
          productTitle: it.productTitle || 'Product',
          price: it.price || 0,
          quantity: it.quantity || 1,
          total: it.totalPrice || (it.price * it.quantity) || 0,
          totalPrice: it.totalPrice || (it.price * it.quantity) || 0,
          imageUrl: it.productImage || it.imageUrl || '',
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        this.collections.orderItem.push(...orderItems);

        return {
          id: orderId,
          orderNumber: o.orderNumber,
          userId: o.userId || 'usr-demo',
          status: o.orderStatus || o.status || 'PENDING',
          paymentStatus: o.paymentStatus || 'PAID',
          paymentMethod: o.paymentMethod || 'RAZORPAY',
          subtotal: o.subtotal || 0,
          discountAmount: o.discountAmount || 0,
          taxAmount: o.tax || o.taxAmount || 0,
          shippingFee: o.shippingFee || 0,
          totalAmount: o.totalAmount || 0,
          shippingProvider: o.shippingProvider || (o.fulfillmentMethod === 'STORE_PICKUP' ? 'NEXRA Store' : 'Delhivery'),
          couponCode: o.couponCode || null,
          shippingAddress: o.shippingAddress || {},
          awbNumber: o.awbNumber || null,
          trackingNumber: o.trackingNumber || null,
          courierName: o.courierName || null,
          createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
          updatedAt: new Date()
        };
      });
    }

    this.collections.customOrder = [
      {
        id: 'co-sample-101',
        customerName: 'Aditya Sharma',
        phone: '9848022338',
        email: 'aditya.sharma@aerotech.in',
        description: 'Bespoke Carbon-Fiber Drone Arm Mounting Brackets (Set of 4), 100% Infill, Matte Black',
        amount: 3450,
        deliveryType: 'STORE_PICKUP',
        notes: 'Customer will collect from Gachibowli store counter Saturday morning',
        razorpayOrderId: 'order_CO_Sample101',
        razorpayQrId: 'qr_CO_Sample101',
        qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3Dnexra3d%40icici%26pn%3DNEXRA%25203D%26am%3D3450.00%26cu%3DINR%26tn%3DCustom%2520Order%2520101',
        paymentLink: 'upi://pay?pa=nexra3d@icici&pn=NEXRA%203D&am=3450.00&cu=INR&tn=Custom%20Order%20101',
        paymentStatus: 'PAID',
        createdAt: new Date(Date.now() - 3600000 * 5),
        paidAt: new Date(Date.now() - 3600000 * 4),
        expiresAt: new Date(Date.now() + 3600000 * 24),
        updatedAt: new Date()
      },
      {
        id: 'co-sample-102',
        customerName: 'Kavita Reddy',
        phone: '9123456789',
        email: 'kavita.r@biomed.org',
        description: 'High-Precision SLA Resin Dental Casting Prosthetic Mold, Clear Bio-Resin',
        amount: 1850,
        deliveryType: 'HOME_DELIVERY',
        notes: 'Requires dispatch via express courier with fragile packaging tag',
        razorpayOrderId: 'order_CO_Sample102',
        razorpayQrId: 'qr_CO_Sample102',
        qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3Dnexra3d%40icici%26pn%3DNEXRA%25203D%26am%3D1850.00%26cu%3DINR%26tn%3DCustom%2520Order%2520102',
        paymentLink: 'upi://pay?pa=nexra3d@icici&pn=NEXRA%203D&am=1850.00&cu=INR&tn=Custom%20Order%20102',
        paymentStatus: 'AWAITING_PAYMENT',
        createdAt: new Date(Date.now() - 600000),
        paidAt: null,
        expiresAt: new Date(Date.now() + 15 * 60000),
        updatedAt: new Date()
      }
    ];
  }

  getStore(model: string): any[] {
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
        if (typeof itemVal === 'string' && typeof val === 'string' && itemVal.toLowerCase() === val.toLowerCase()) {
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
    const modelLower = model.toLowerCase();

    if (include.addresses) {
      cloned.addresses = this.getStore('address').filter((a) => a.userId === item.id);
    }
    if (include.orders) {
      cloned.orders = this.getStore('order').filter((o) => o.userId === item.id);
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

  createModelHandler(modelName: string) {
    const store = this.getStore(modelName);

    return {
      findUnique: async (args: any = {}) => {
        const item = store.find((i) => this.matchWhere(i, args.where));
        return item ? this.attachIncludes(item, modelName, args.include) : null;
      },

      findFirst: async (args: any = {}) => {
        let results = store.filter((i) => this.matchWhere(i, args.where));
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
        const data = { ...(args.data || {}) };
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

        const newItem = {
          id,
          ...data,
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date()
        };
        store.push(newItem);

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

        return this.attachIncludes(newItem, modelName, args.include);
      },

      update: async (args: any = {}) => {
        const itemIndex = store.findIndex((i) => this.matchWhere(i, args.where));
        if (itemIndex === -1) {
          throw new Error(`Record to update not found in memory db (${modelName})`);
        }
        const current = store[itemIndex];
        const updated = {
          ...current,
          ...args.data,
          updatedAt: new Date()
        };
        store[itemIndex] = updated;
        return this.attachIncludes(updated, modelName, args.include);
      },

      updateMany: async (args: any = {}) => {
        let count = 0;
        store.forEach((item, idx) => {
          if (this.matchWhere(item, args.where)) {
            store[idx] = { ...item, ...args.data, updatedAt: new Date() };
            count++;
          }
        });
        return { count };
      },

      upsert: async (args: any = {}) => {
        const existingIndex = store.findIndex((i) => this.matchWhere(i, args.where));
        if (existingIndex !== -1) {
          const updated = { ...store[existingIndex], ...args.update, updatedAt: new Date() };
          store[existingIndex] = updated;
          return this.attachIncludes(updated, modelName, args.include);
        } else {
          const newItem = {
            id: args.create?.id || generateId(modelName.toLowerCase()),
            ...args.create,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          store.push(newItem);
          return this.attachIncludes(newItem, modelName, args.include);
        }
      },

      delete: async (args: any = {}) => {
        const itemIndex = store.findIndex((i) => this.matchWhere(i, args.where));
        if (itemIndex === -1) {
          throw new Error(`Record to delete not found in memory db (${modelName})`);
        }
        const [removed] = store.splice(itemIndex, 1);
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
