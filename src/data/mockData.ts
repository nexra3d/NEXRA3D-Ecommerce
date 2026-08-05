import { Category, Product, Coupon, User, Address, Order, EmailNotification, Service, FAQ, Testimonial, Banner } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-lamps',
    name: 'Lamps',
    slug: 'lamps',
    description: 'Custom 3D printed lithophane, ambient LED, night lamps, and personalized tabletop lamps',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { id: 'sub-lithophane-lamps', categoryId: 'cat-lamps', name: 'Lithophane Lamps', slug: 'lithophane-lamps' },
      { id: 'sub-led-lamps', categoryId: 'cat-lamps', name: 'LED Lamps', slug: 'led-lamps' },
      { id: 'sub-night-lamps', categoryId: 'cat-lamps', name: 'Night Lamps', slug: 'night-lamps' },
      { id: 'sub-table-lamps', categoryId: 'cat-lamps', name: 'Table Lamps', slug: 'table-lamps' },
      { id: 'sub-custom-lamps', categoryId: 'cat-lamps', name: 'Custom Lamps', slug: 'custom-lamps' }
    ]
  },
  {
    id: 'cat-key-chains',
    name: 'Key Chains',
    slug: 'key-chains',
    description: 'Personalized 3D printed name keychains, superhero characters, corporate logos, and custom tags',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { id: 'sub-name-key-chains', categoryId: 'cat-key-chains', name: 'Name Key Chains', slug: 'name-key-chains' },
      { id: 'sub-character-key-chains', categoryId: 'cat-key-chains', name: 'Character Key Chains', slug: 'character-key-chains' },
      { id: 'sub-logo-key-chains', categoryId: 'cat-key-chains', name: 'Logo Key Chains', slug: 'logo-key-chains' },
      { id: 'sub-custom-key-chains', categoryId: 'cat-key-chains', name: 'Custom Key Chains', slug: 'custom-key-chains' }
    ]
  },
  {
    id: 'cat-idols',
    name: 'Idols',
    slug: 'idols',
    description: 'High-detail 3D printed spiritual Hindu idols, Buddha statues, and decorative divine sculptures',
    imageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { id: 'sub-hindu-idols', categoryId: 'cat-idols', name: 'Hindu Idols', slug: 'hindu-idols' },
      { id: 'sub-buddha-idols', categoryId: 'cat-idols', name: 'Buddha Idols', slug: 'buddha-idols' },
      { id: 'sub-decorative-idols', categoryId: 'cat-idols', name: 'Decorative Idols', slug: 'decorative-idols' },
      { id: 'sub-custom-idols', categoryId: 'cat-idols', name: 'Custom Idols', slug: 'custom-idols' }
    ]
  },
  {
    id: 'cat-home-decor',
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Modern geometric wall decor, showpieces, self-watering planters, parametric vases, and desk art',
    imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { id: 'sub-wall-decor', categoryId: 'cat-home-decor', name: 'Wall Decor', slug: 'wall-decor' },
      { id: 'sub-showpieces', categoryId: 'cat-home-decor', name: 'Showpieces', slug: 'showpieces' },
      { id: 'sub-planters', categoryId: 'cat-home-decor', name: 'Planters', slug: 'planters' },
      { id: 'sub-vases', categoryId: 'cat-home-decor', name: 'Vases', slug: 'vases' },
      { id: 'sub-desk-decor', categoryId: 'cat-home-decor', name: 'Desk Decor', slug: 'desk-decor' }
    ]
  },
  {
    id: 'cat-anime-figures',
    name: 'Anime Figures',
    slug: 'anime-figures',
    description: 'Hand-finished, high-resolution 4K SLA printed anime collectibles from One Piece, Naruto, and Dragon Ball',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { id: 'sub-one-piece', categoryId: 'cat-anime-figures', name: 'One Piece', slug: 'one-piece' },
      { id: 'sub-naruto', categoryId: 'cat-anime-figures', name: 'Naruto', slug: 'naruto' },
      { id: 'sub-dragon-ball', categoryId: 'cat-anime-figures', name: 'Dragon Ball', slug: 'dragon-ball' },
      { id: 'sub-demon-slayer', categoryId: 'cat-anime-figures', name: 'Demon Slayer', slug: 'demon-slayer' },
      { id: 'sub-other-anime', categoryId: 'cat-anime-figures', name: 'Other Anime', slug: 'other-anime' }
    ]
  },
  {
    id: 'cat-clocks',
    name: 'Clocks',
    slug: 'clocks',
    description: 'Unique gear-driven wall clocks, kinetic tabletop clocks, and custom 3D printed timepieces',
    imageUrl: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { id: 'sub-wall-clocks', categoryId: 'cat-clocks', name: 'Wall Clocks', slug: 'wall-clocks' },
      { id: 'sub-table-clocks', categoryId: 'cat-clocks', name: 'Table Clocks', slug: 'table-clocks' },
      { id: 'sub-custom-clocks', categoryId: 'cat-clocks', name: 'Custom Clocks', slug: 'custom-clocks' },
      { id: 'sub-3d-printed-clocks', categoryId: 'cat-clocks', name: '3D Printed Clocks', slug: '3d-printed-clocks' }
    ]
  },
  {
    id: 'cat-customized',
    name: 'Customized',
    slug: 'customized',
    description: 'Personalized gifts, custom photo lithophanes, name plates, 3D portraits, and corporate awards',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { id: 'sub-customized-gifts', categoryId: 'cat-customized', name: 'Customized Gifts', slug: 'customized-gifts' },
      { id: 'sub-name-plates', categoryId: 'cat-customized', name: 'Name Plates', slug: 'name-plates' },
      { id: 'sub-photo-lithophanes', categoryId: 'cat-customized', name: 'Photo Lithophanes', slug: 'photo-lithophanes' },
      { id: 'sub-custom-figures', categoryId: 'cat-customized', name: 'Custom Figures', slug: 'custom-figures' },
      { id: 'sub-corporate-gifts', categoryId: 'cat-customized', name: 'Corporate Gifts', slug: 'corporate-gifts' }
    ]
  },
export const INITIAL_PRODUCTS: Product[] = [
    {
    id: 'prod-lithophane-moon-lamp',
    title: 'Personalized 3D Printed Photo Lithophane Moon Lamp',
    slug: 'personalized-3d-photo-lithophane-moon-lamp',
    sku: 'NX-LMP-MOON',
    description: 'Custom 3D printed spherical moon lamp featuring your high-resolution custom photo turned into a stunning translucent 3D lithophane with warm LED wooden base.',
    price: 1499,
    mrp: 2199,
    salePrice: 1499,
    categoryId: 'cat-lamps',
    subcategoryId: 'sub-lithophane-lamps',
    stock: 25,
    stockQuantity: 25,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 4.9,
    reviewCount: 148,
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    specifications: {
      'Diameter': '15 cm (6 inches)',
      'Light Source': 'Dual Warm/White LED with Dimmer',
      'Power Source': 'Rechargeable USB-C Lith-Ion Battery',
      'Customization': '1 to 3 HD Photos + Custom Text'
    },
    tags: ['lamp', 'lithophane', 'customized', 'moon-lamp', 'gift'],
    createdAt: '2026-03-02'
  },
  {
    id: 'prod-spiral-ambient-lamp',
    title: 'Parametric Spiral LED Table Lamp',
    slug: 'parametric-spiral-led-table-lamp',
    sku: 'NX-LMP-SPRL',
    description: 'Modern geometric table lamp 3D printed with silk dual-color polymer. Emits soft ambient diffused LED illumination perfect for contemporary living spaces and modern desks.',
    price: 1899,
    mrp: 2499,
    salePrice: 1899,
    categoryId: 'cat-lamps',
    subcategoryId: 'sub-led-lamps',
    stock: 15,
    stockQuantity: 15,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 4.8,
    reviewCount: 42,
    isFeatured: true,
    isTrending: false,
    specifications: {
      'Height': '28 cm',
      'Material': 'Silk Dual-Color PLA+',
      'Illumination': '12W Warm White LED Strip',
      'Plug Type': 'Standard Indian 2-Pin Adapter Included'
    },
    tags: ['lamp', 'led', 'home-decor', 'parametric'],
    createdAt: '2026-03-03'
  },
  {
    id: 'prod-custom-name-keychain',
    title: 'Customized 3D Printed Name Keychain (Pack of 2)',
    slug: 'customized-3d-printed-name-keychain',
    sku: 'NX-KEY-NAME',
    description: 'Personalized dual-layer 3D printed name tag keychain made from ultra-durable PETG polymer. Choose custom name, font style, and dual accent color combination.',
    price: 299,
    mrp: 499,
    salePrice: 299,
    categoryId: 'cat-key-chains',
    subcategoryId: 'sub-name-key-chains',
    stock: 120,
    stockQuantity: 120,
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 4.9,
    reviewCount: 310,
    isFeatured: false,
    isTrending: true,
    isBestSeller: true,
    specifications: {
      'Dimensions': 'Approx 70 x 25 x 6 mm',
      'Material': 'High-Impact Tough PETG',
      'Ring Type': 'Stainless Steel Heavy-Duty Split Ring'
    },
    tags: ['keychain', 'customized', 'name', 'personalized'],
    createdAt: '2026-03-04'
  },
  {
    id: 'prod-ganesha-idol-3d',
    title: '3D Printed Lord Ganesha Divine Statue (Gold Finish)',
    slug: '3d-printed-lord-ganesha-divine-statue',
    sku: 'NX-IDL-GAN',
    description: 'Exquisitely crafted 3D printed Lord Ganesha idol created using 4K resin SLA printing and hand-painted in antique metallic gold polish. Ideal for puja altars and home sanctums.',
    price: 1299,
    mrp: 1899,
    salePrice: 1299,
    categoryId: 'cat-idols',
    subcategoryId: 'sub-hindu-idols',
    stock: 35,
    stockQuantity: 35,
    images: [
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 5.0,
    reviewCount: 96,
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    specifications: {
      'Height': '18 cm (7 inches)',
      'Material': 'Precision SLA Photopolymer Resin',
      'Finish': 'Hand-Polished Antique Gold Polish'
    },
    tags: ['idol', 'ganesha', 'hindu', 'devotional', 'statue'],
    createdAt: '2026-03-05'
  },
  {
    id: 'prod-geometric-planter',
    title: 'Modern Geometric Self-Watering Planter',
    slug: 'modern-geometric-self-watering-planter',
    sku: 'NX-DEC-PLNT',
    description: 'Architectural self-watering planter 3D printed with eco-friendly recycled stone polymer composite. Features inner reservoir pot and drainage wick for indoor succulents.',
    price: 799,
    mrp: 1199,
    salePrice: 799,
    categoryId: 'cat-home-decor',
    subcategoryId: 'sub-planters',
    stock: 45,
    stockQuantity: 45,
    images: [
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 4.8,
    reviewCount: 64,
    isFeatured: false,
    isTrending: true,
    specifications: {
      'Dimensions': '12 x 12 x 11 cm',
      'Material': 'Eco Stone Composite PLA',
      'Features': 'Self-Watering Reservoir + Removable Cup'
    },
    tags: ['home-decor', 'planter', 'succulent', 'geometric'],
    createdAt: '2026-03-06'
  },
  {
    id: 'prod-luffy-gear5-figure',
    title: 'Luffy Gear 5 4K SLA Hand-Finished Anime Figure (22cm)',
    slug: 'luffy-gear-5-4k-sla-anime-figure',
    sku: 'NX-ANM-LUF5',
    description: 'High-detail 4K SLA resin printed anime collectible figure capturing Monkey D. Luffy Gear 5 with smoke aura effect, hand-painted by master sculptors.',
    price: 2999,
    mrp: 4499,
    salePrice: 2999,
    categoryId: 'cat-anime-figures',
    subcategoryId: 'sub-one-piece',
    stock: 20,
    stockQuantity: 20,
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 4.9,
    reviewCount: 88,
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    specifications: {
      'Scale / Height': '22 cm (1/8 Scale)',
      'Material': 'Ultra-Clear High Toughness SLA Resin',
      'Finish': 'Custom Acrylic Airbrush Hand-Paint'
    },
    tags: ['anime', 'one-piece', 'figure', 'luffy', 'collectible'],
    createdAt: '2026-03-07'
  },
  {
    id: 'prod-gear-wall-clock',
    title: '3D Printed Kinetic Gear Wall Clock (30cm)',
    slug: '3d-printed-kinetic-gear-wall-clock',
    sku: 'NX-CLK-GEAR',
    description: 'Functional 3D printed mechanical clock with visible moving gears driven by a silent quartz sweep movement. Matte black frame with metallic bronze spur gears.',
    price: 2499,
    mrp: 3499,
    salePrice: 2499,
    categoryId: 'cat-clocks',
    subcategoryId: 'sub-wall-clocks',
    stock: 18,
    stockQuantity: 18,
    images: [
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 4.9,
    reviewCount: 37,
    isFeatured: true,
    isTrending: false,
    specifications: {
      'Diameter': '30 cm (12 inches)',
      'Movement': 'Silent Sweep Quartz Movement (1x AA Battery)',
      'Gears': 'Interactive Moving Spur & Bevel Gears'
    },
    tags: ['clock', 'wall-clock', 'mechanical', 'gears'],
    createdAt: '2026-03-08'
  },
  {
    id: 'prod-custom-photo-lithophane',
    title: 'Personalized 3D Photo Lithophane Frame with Warm LED',
    slug: 'personalized-3d-photo-lithophane-frame',
    sku: 'NX-CST-LITHO',
    description: 'Transform your precious family memories, wedding portraits, or pet photos into a 3D translucent lithophane panel housed inside a premium solid wood LED lightbox.',
    price: 1699,
    mrp: 2499,
    salePrice: 1699,
    categoryId: 'cat-customized',
    subcategoryId: 'sub-photo-lithophanes',
    stock: 40,
    stockQuantity: 40,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 5.0,
    reviewCount: 204,
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    specifications: {
      'Frame Size': 'A5 Size (21 x 15 cm)',
      'Frame Material': 'Solid Teak Finish Hardwood',
      'Power': 'USB Powered with Inline Dimmer Switch'
    },
    tags: ['customized', 'lithophane', 'photo-frame', 'personalized-gift'],
    createdAt: '2026-03-09'
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-precision-prototyping',
    name: 'Precision Rapid Prototyping',
    slug: 'precision-prototyping',
    shortDescription: 'Ultra-high precision SLA & SLS functional prototypes with 0.02mm layer resolution for concept validation.',
    description: 'NEXRA 3D offers state-of-the-art precision rapid prototyping services utilizing industrial SLA, SLS, and PolyJet 3D printing technologies. Whether validating visual aesthetics, functional fit, or fluid dynamics, our high-precision equipment delivers tight dimensional tolerances, smooth surface finishes, and rapid 24-hour turnaround times for complex geometries.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
    ],
    industries: ['Aerospace', 'Automotive', 'Consumer Electronics', 'Industrial Automation', 'Precision Tooling'],
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    seoTitle: 'Precision Rapid Prototyping Services | NEXRA 3D',
    seoDescription: 'High precision industrial SLA & SLS prototyping with 0.02mm layer accuracy and 24-hour delivery.'
  },
  {
    id: 'srv-engineering-parts',
    name: 'Industrial Engineering Parts',
    slug: 'engineering-parts',
    shortDescription: 'End-use functional components, carbon-fiber reinforced jigs, and durable custom housings.',
    description: 'Transition seamlessly from prototype to short-run end-use manufacturing. Our industrial engineering parts service produces mechanical components in carbon-fiber filled Nylon, high-temp tough resins, and stainless steel DMLS metals. Rigorously tested for tensile strength, thermal resistance, and chemical durability.',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
    ],
    industries: ['Automotive', 'Robotics', 'Heavy Machinery', 'Defence', 'Oil & Gas'],
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
    seoTitle: 'Industrial Engineering Parts Manufacturing | NEXRA 3D',
    seoDescription: 'Custom 3D printed engineering components in PEEK, Carbon Fiber, and Stainless Steel.'
  },
  {
    id: 'srv-architectural-models',
    name: 'Architectural & Topographical Models',
    slug: 'architectural-models',
    shortDescription: 'High-detail scaled physical masterplans, complex building facades, and terrain models.',
    description: 'Transform CAD masterplans, BIM files, and GIS terrain data into stunning physical architectural models. NEXRA 3D combines multi-material 3D printing with precision laser finishing to render intricate facade louvers, structural columns, interior layouts, and landscape topography with crisp architectural fidelity.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800'
    ],
    industries: ['Architecture & Urban Design', 'Real Estate Development', 'Civil Infrastructure'],
    isActive: true,
    isFeatured: true,
    sortOrder: 3,
    seoTitle: 'Architectural & Scale Models 3D Printing | NEXRA 3D',
    seoDescription: 'High fidelity scaled architectural, masterplan, and topographical 3D printed physical models.'
  },
  {
    id: 'srv-jewelry-fashion',
    name: 'Jewelry & Fashion Casting Models',
    slug: 'jewelry-fashion',
    shortDescription: 'High-wax direct castable resin models with zero ash residue for intricate fine jewelry.',
    description: 'Achieve zero ash residue and razor-sharp gemstone bezel details with NEXRA 3D castable resins. Designed specifically for precious metal direct investment casting (gold, platinum, silver) and high-fashion accessories, our micron-accurate prints eliminate manual carving while accelerating production.',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800'
    ],
    industries: ['Fine Jewelry Manufacturing', 'Luxury Fashion & Accessories', 'Horology'],
    isActive: true,
    isFeatured: false,
    sortOrder: 5,
    seoTitle: 'Jewelry 3D Printing & Direct Castable Models | NEXRA 3D',
    seoDescription: 'Direct castable 3D printed resin models with zero ash residue for gold and platinum jewelry casting.'
  },
  {
    id: 'srv-custom-tooling',
    name: 'Custom Tooling & Mold Inserts',
    slug: 'custom-tooling',
    shortDescription: 'Conformal cooling channel mold inserts, soft silicone tooling, and rapid thermoforming dies.',
    description: 'Compress tooling lead times from months to days. NEXRA 3D manufactures 3D printed injection mold inserts with complex conformal cooling channels, silicone vacuum casting patterns, assembly fixtures, and thermoforming dies that withstand high compression loads.',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800'
    ],
    industries: ['Injection Molding', 'Packaging', 'Plastic Component Manufacturing'],
    isActive: true,
    isFeatured: false,
    sortOrder: 6,
    seoTitle: 'Custom Tooling & 3D Mold Inserts | NEXRA 3D',
    seoDescription: 'Conformal cooling mold inserts, rapid soft tooling, and thermoforming dies.'
  }
];

export const INITIAL_FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: 'What CAD file formats do you accept for custom service quotes?',
    answer: 'We accept STL, STEP (.stp), IGES (.igs), OBJ, 3MF, SolidWorks (.sldprt), and Parasolid (.x_t) files up to 100MB directly through our Quote Request form.',
    category: 'Quotation & Orders',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'faq-2',
    question: 'How fast will I receive a formal quote after uploading CAD files?',
    answer: 'Our experienced engineering team evaluates all CAD geometries, checks wall thicknesses and draft angles, and provides a formal price quotation with turnaround time within 2 to 4 business hours.',
    category: 'Quotation & Orders',
    sortOrder: 2,
    isActive: true
  },
  {
    id: 'faq-3',
    question: 'What is the maximum build volume available for 3D printing services?',
    answer: 'Our large-format industrial SLA printers feature single-piece build volumes up to 800 x 800 x 600 mm. Larger master plans or assemblies are precision segmented and keyed for seamless post-assembly.',
    category: 'Technical Specifications',
    sortOrder: 3,
    isActive: true
  },
  {
    id: 'faq-4',
    question: 'Can I purchase hardware and materials directly online?',
    answer: 'Yes! All standard 3D printers, engineering resins, carbon filaments, and spare parts can be ordered directly through our e-commerce catalog with standard cart checkout.',
    category: 'E-Commerce Store',
    sortOrder: 4,
    isActive: true
  },
  {
    id: 'faq-5',
    question: 'Do you sign Non-Disclosure Agreements (NDAs) for proprietary projects?',
    answer: 'Absolute client confidentiality is paramount. You can request a mutual NDA before uploading sensitive CAD models, and all files are stored on secure encrypted servers.',
    category: 'Confidentiality & Privacy',
    sortOrder: 5,
    isActive: true
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    clientName: 'Suresh Rao',
    company: 'AeroDynamics Technologies',
    designation: 'Head of Additive R&D',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    content: 'NEXRA 3D provided carbon-fiber composite aerospace ducting and brackets with 100% dimensional accuracy. Their 24-hour turnaround saved critical time during our flight testing validation.',
    isActive: true
  },
  {
    id: 'test-2',
    clientName: 'Vikram Shah',
    company: 'AutoTech Engineering Solutions',
    designation: 'VP Product Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    content: 'The dimensional consistency and thermal resistance of NEXRA 3D’s carbon-fiber filled component parts allowed us to complete rigorous vehicle track fitments in record time.',
    isActive: true
  },
  {
    id: 'test-3',
    clientName: 'Ananya Sharma',
    company: 'Studio Urbanum Design',
    designation: 'Lead Urban Architect',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    content: 'NEXRA 3D produced an astonishing 1:200 masterplan model with delicate facade louvers and textured topography. Their team translated our BIM data effortlessly.',
    isActive: true
  }
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-1',
    title: 'Industrial 3D Printing & Additive Manufacturing',
    subtitle: 'From CAD Concept to Precision Production Parts with NEXRA 3D',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1600',
    linkUrl: '/services',
    ctaText: 'Explore Industrial Services',
    sortOrder: 1,
    isActive: true
  },
  {
    id: 'ban-2',
    title: 'Precision Rapid Prototyping & Custom Tooling',
    subtitle: 'Upload CAD files & receive formal engineering quotes within hours',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1600',
    linkUrl: '/quote',
    ctaText: 'Request a Quote',
    sortOrder: 2,
    isActive: true
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'NEXRA10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderAmount: 2000,
    maxDiscount: 5000,
    expiryDate: '2026-12-31',
    usageLimit: 500,
    usedCount: 42,
    isActive: true
  },
  {
    id: 'coup-2',
    code: 'WELCOME3D',
    discountType: 'FIXED',
    discountValue: 1000,
    minOrderAmount: 5000,
    expiryDate: '2026-12-31',
    usageLimit: 200,
    usedCount: 19,
    isActive: true
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'NEXRA Administrator',
    email: 'admin@vltypecertservices.com',
    phone: '+91 (080) 4567-8900',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr-admin-2',
    name: 'Store Admin',
    email: 'admin@store.com',
    phone: '+91 98765 00000',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr-admin-3',
    name: 'NEXRA 3D Owner',
    email: 'nexra3d@gmail.com',
    phone: '+91 98765 43210',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr-admin-4',
    name: 'Varun Manurani',
    email: 'varunmanurani@gmail.com',
    phone: '+91 98765 43210',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr-admin-4b',
    name: 'Varun Manurani',
    email: 'varunmanu@gmail.com',
    phone: '+91 98765 43210',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr-admin-5',
    name: 'NEXRA Support Admin',
    email: 'admin@nexra3d.com',
    phone: '+91 98765 43210',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr-customer-1',
    name: 'Rahul Sharma',
    email: 'customer@example.com',
    phone: '+91 98765 43210',
    role: 'CUSTOMER',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-01-15T00:00:00Z'
  },
  {
    id: 'usr-customer-2',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '+91 98765 12345',
    role: 'CUSTOMER',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    createdAt: '2026-01-15T00:00:00Z'
  }
];

export const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    userId: 'usr-customer-1',
    fullName: 'Rahul Sharma',
    phone: '+91 98765 43210',
    streetAddress: 'Plot no 484, TNGOs Colony, Gachibowli',
    apartment: 'TNGOs Colony',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '500046',
    country: 'India',
    isDefault: true,
    type: 'WORK'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'N3D-882910 25072026',
    userId: 'usr-customer-1',
    customerName: 'Rahul Sharma',
    customerEmail: 'customer@example.com',
    customerPhone: '+91 98765 43210',
    items: [
      {
        id: 'oi-1',
        productId: 'prod-nx-res-eng',
        productTitle: 'NEXRA High-Temp Tough Engineering Resin (1kg)',
        productImage: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800',
        price: 4800,
        quantity: 2,
        totalPrice: 9600
      }
    ],
    shippingAddress: INITIAL_ADDRESSES[0],
    subtotal: 9600,
    tax: 1728,
    shippingFee: 0,
    discountAmount: 1000,
    couponCode: 'WELCOME3D',
    totalAmount: 10328,
    orderStatus: 'OUT_FOR_DELIVERY',
    paymentStatus: 'SUCCESS',
    paymentMethod: 'RAZORPAY',
    paymentId: 'pay_NEXRA99128',
    razorpayOrderId: 'order_NEXRA77182',
    courierName: 'Blue Dart Industrial Express',
    trackingNumber: 'BD992817261',
    createdAt: '2026-07-25T14:30:00Z',
    estimatedDeliveryDate: '2026-07-29',
    trackingEvents: [
      {
        status: 'PENDING',
        title: 'Order Confirmed',
        description: 'Order confirmed and verified via NEXRA payment gateway.',
        timestamp: '2026-07-25 14:30'
      },
      {
        status: 'PROCESSING',
        title: 'Packed at Central Warehouse',
        description: 'Quality checked and packed in ESD anti-static packaging.',
        timestamp: '2026-07-26 10:15'
      },
      {
        status: 'OUT_FOR_DELIVERY',
        title: 'Out for Delivery',
        description: 'Delivery executive en route to Industrial Zone.',
        timestamp: '2026-07-29 09:00',
        location: 'Bengaluru Tech Park Hub'
      }
    ]
  }
];

export const INITIAL_EMAILS: EmailNotification[] = [
  {
    id: 'eml-101',
    toEmail: 'customer@example.com',
    subject: 'Order Confirmed - NX-ORD-882910 | NEXRA 3D',
    type: 'ORDER_CONFIRMATION',
    content: 'Thank you for your order! Your payment of ₹10,328 was successful. Items: NEXRA High-Temp Tough Engineering Resin (1kg) x2.',
    sentAt: '2026-07-25T14:31:00Z',
    status: 'DELIVERED'
  }
];
