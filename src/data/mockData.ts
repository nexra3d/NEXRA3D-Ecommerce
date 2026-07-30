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
  {
    id: 'cat-3d-printers',
    name: '3D Printers & Hardware',
    slug: '3d-printers-hardware',
    description: 'Industrial SLA, SLS, FDM, and Bambu Lab High-Speed 3D Printers for high-precision manufacturing',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { id: 'sub-bambu', categoryId: 'cat-3d-printers', name: 'Bambu Lab High-Speed Printers', slug: 'bambu-lab-printers' },
      { id: 'sub-sla', categoryId: 'cat-3d-printers', name: 'Industrial SLA Printers', slug: 'sla-printers' },
      { id: 'sub-fdm', categoryId: 'cat-3d-printers', name: 'High-Temp FDM Printers', slug: 'fdm-printers' },
      { id: 'sub-sls', categoryId: 'cat-3d-printers', name: 'SLS Powder Printers', slug: 'sls-printers' }
    ]
  },
  {
    id: 'cat-resins-materials',
    name: '3D Printing Resins & Filaments',
    slug: 'resins-materials',
    description: 'Engineering resins, biocompatible dental resins, tough polymers, and carbon fiber filaments',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { id: 'sub-resins', categoryId: 'cat-resins-materials', name: 'Engineering Resins', slug: 'engineering-resins' },
      { id: 'sub-filaments', categoryId: 'cat-resins-materials', name: 'High-Performance Filaments', slug: 'filaments' },
      { id: 'sub-dental-resins', categoryId: 'cat-resins-materials', name: 'Dental & Medical Resins', slug: 'dental-resins' }
    ]
  },
  {
    id: 'cat-post-processing',
    name: 'Post-Processing & UV Equipment',
    slug: 'post-processing-equipment',
    description: 'Automated UV curing chambers, ultrasonic washing stations, and surface finishing equipment',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { id: 'sub-wash-cure', categoryId: 'cat-post-processing', name: 'UV Wash & Cure Units', slug: 'wash-cure' },
      { id: 'sub-surface-finish', categoryId: 'cat-post-processing', name: 'Surface Finishers', slug: 'surface-finishers' }
    ]
  },
  {
    id: 'cat-spares-components',
    name: 'Spares & Consumables',
    slug: 'spares-components',
    description: 'High-precision nozzles, FEP films, build plates, optics, and replacement tanks',
    imageUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { id: 'sub-vats-fep', categoryId: 'cat-spares-components', name: 'Resin Vats & FEP Films', slug: 'resin-vats-fep' },
      { id: 'sub-nozzles-extruders', categoryId: 'cat-spares-components', name: 'Nozzles & Extruders', slug: 'nozzles-extruders' }
    ]
  },
  {
    id: 'cat-aerospace-drones',
    name: 'Aerospace / Drones',
    slug: 'aerospace-drones',
    description: 'Carbon fiber UAV drone frames, aerospace jigs, nacelles, propellers & custom avionics enclosures',
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { id: 'sub-drone-frames', categoryId: 'cat-aerospace-drones', name: 'Drone Frames & Arms', slug: 'drone-frames' },
      { id: 'sub-uav-components', categoryId: 'cat-aerospace-drones', name: 'UAV Custom Components', slug: 'uav-components' },
      { id: 'sub-aerospace-jigs', categoryId: 'cat-aerospace-drones', name: 'Aerospace Carbon Fiber Jigs', slug: 'aerospace-jigs' },
      { id: 'sub-avionics-housing', categoryId: 'cat-aerospace-drones', name: 'Avionics Housings & Mounts', slug: 'avionics-housings' }
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-bambu-x1c',
    title: 'Bambu Lab X1-Carbon Combo High-Speed 3D Printer',
    slug: 'bambu-lab-x1-carbon-combo',
    sku: 'BL-X1C-COMBO',
    description: 'Flagship Bambu Lab X1-Carbon 3D Printer Combo with Automatic Material System (AMS). Features AI lidar inspection, 500 mm/s print speed, active chamber vibration compensation, carbon fiber reinforced printing, and dual auto bed leveling.',
    price: 145000,
    mrp: 165000,
    salePrice: 145000,
    categoryId: 'cat-3d-printers',
    subcategoryId: 'sub-bambu',
    stock: 15,
    stockQuantity: 15,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'Bambu Lab',
    rating: 5.0,
    reviewCount: 98,
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    specifications: {
      'Build Volume': '256 x 256 x 256 mm',
      'Max Print Speed': '500 mm/s',
      'Max Hotend Temp': '300 °C (Hardened Steel)',
      'Multi-Color AMS': '4-Color Included (Expandable to 16)',
      'AI Lidar & Camera': 'Micro Lidar + First Layer Inspection Camera',
      'Supported Filaments': 'PA-CF, PET-CF, PC, ABS, TPU, PLA, PETG'
    },
    tags: ['bambu-lab', 'x1-carbon', '3d-printer', 'ams', 'high-speed', 'carbon-fiber'],
    createdAt: '2026-02-01'
  },
  {
    id: 'prod-nx-sla4k',
    title: 'NEXRA Pro-SLA 4K Industrial Resin 3D Printer',
    slug: 'nexra-pro-sla-4k-printer',
    sku: 'NX-SLA-4K',
    description: 'Ultra-high precision industrial SLA 3D printer featuring 4K mono-LCD optics, 0.02mm Z-axis repeatability, 219 x 123 x 250 mm build volume, and dynamic UV intensity control for engineering-grade SLA prototyping.',
    price: 249000,
    mrp: 280000,
    salePrice: 249000,
    categoryId: 'cat-3d-printers',
    subcategoryId: 'sub-sla',
    stock: 8,
    stockQuantity: 8,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 4.9,
    reviewCount: 42,
    isFeatured: true,
    isTrending: true,
    isBestSeller: true,
    specifications: {
      'Build Volume': '219 x 123 x 250 mm',
      'XY Resolution': '35 Microns (4K Mono)',
      'Layer Thickness': '0.01 - 0.15 mm',
      'Light Source': '405nm Parallel Matrix UV Light Engine',
      'Warranty': '2 Years Industrial Warranty'
    },
    tags: ['sla', '3d-printer', 'industrial', '4k', 'precision'],
    createdAt: '2026-01-10'
  },
  {
    id: 'prod-nx-fdmx3',
    title: 'NEXRA High-Temp Dual-Extruder FDM Printer X3',
    slug: 'nexra-high-temp-fdm-x3',
    sku: 'NX-FDM-X3',
    description: 'Industrial dual-extruder FDM 3D printer with actively heated chamber up to 90°C and nozzle temperature up to 350°C. Engineered for Carbon Fiber, PEEK, Nylon, and ABS components.',
    price: 185000,
    mrp: 210000,
    salePrice: 185000,
    categoryId: 'cat-3d-printers',
    subcategoryId: 'sub-fdm',
    stock: 12,
    stockQuantity: 12,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 4.8,
    reviewCount: 29,
    isFeatured: true,
    isTrending: false,
    specifications: {
      'Build Volume': '300 x 300 x 400 mm',
      'Max Nozzle Temp': '350°C Dual Extrusions',
      'Chamber Temp': 'Active Heated 90°C',
      'Filament Compatibility': 'Carbon Fiber, PEEK, Nylon, ABS, TPU, PLA'
    },
    tags: ['fdm', '3d-printer', 'dual-extruder', 'high-temp', 'carbon-fiber'],
    createdAt: '2026-01-20'
  },
  {
    id: 'prod-nx-res-eng',
    title: 'NEXRA High-Temp Tough Engineering Resin (1kg)',
    slug: 'nexra-high-temp-tough-resin-1kg',
    sku: 'NX-RES-ENG',
    description: 'Engineering-grade liquid photopolymer resin with 82D Shore hardness and high heat deflection temperature (HDT 120°C). Perfect for functional snap-fit components, enclosures, and automotive prototypes.',
    price: 4800,
    mrp: 5500,
    salePrice: 4800,
    categoryId: 'cat-resins-materials',
    subcategoryId: 'sub-resins',
    stock: 85,
    stockQuantity: 85,
    images: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 4.9,
    reviewCount: 110,
    isFeatured: true,
    isTrending: true,
    specifications: {
      'Viscosity': '250 mPa.s at 25°C',
      'Tensile Strength': '65 MPa',
      'Heat Deflection Temp': '120°C',
      'UV Wavelength': '385nm - 405nm'
    },
    tags: ['resin', 'tough', 'engineering', 'high-temp', 'sla'],
    createdAt: '2026-02-01'
  },
  {
    id: 'prod-nx-res-dent',
    title: 'NEXRA Dental Precision Clear Biocompatible Resin (1kg)',
    slug: 'nexra-dental-precision-clear-resin',
    sku: 'NX-RES-DENT',
    description: 'Class IIa certified biocompatible SLA resin specifically formulated for surgical guides, clear dental splints, aligner models, and orthodontic study models.',
    price: 6500,
    mrp: 7500,
    salePrice: 6500,
    categoryId: 'cat-resins-materials',
    subcategoryId: 'sub-dental-resins',
    stock: 40,
    stockQuantity: 40,
    images: [
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 5.0,
    reviewCount: 38,
    isFeatured: true,
    isTrending: true,
    specifications: {
      'Certification': 'Biocompatible Class IIa Medical',
      'Transparency': '99.2% Optical Clarity',
      'Flexural Strength': '95 MPa',
      'Application': 'Surgical Guides & Aligners'
    },
    tags: ['dental', 'medical', 'resin', 'biocompatible', 'clear'],
    createdAt: '2026-02-05'
  },
  {
    id: 'prod-nx-fil-cf',
    title: 'NEXRA Carbon Fiber Reinforced Filament 1.75mm (1kg)',
    slug: 'nexra-carbon-fiber-filament-1kg',
    sku: 'NX-FIL-CF175',
    description: 'High-modulus carbon fiber filled Nylon 12 filament offering extreme tensile stiffness, low warp, and high impact resistance for structural end-use components.',
    price: 5200,
    mrp: 6000,
    salePrice: 5200,
    categoryId: 'cat-resins-materials',
    subcategoryId: 'sub-filaments',
    stock: 60,
    stockQuantity: 60,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 4.8,
    reviewCount: 54,
    isFeatured: false,
    isTrending: true,
    specifications: {
      'Filament Diameter': '1.75mm ±0.02mm',
      'Carbon Fiber Content': '20% Chop Carbon Fiber',
      'Print Temperature': '260°C - 290°C',
      'Bed Temperature': '80°C - 100°C'
    },
    tags: ['filament', 'carbon-fiber', 'nylon', 'fdm', 'high-strength'],
    createdAt: '2026-02-12'
  },
  {
    id: 'prod-nx-cure-pro',
    title: 'NEXRA Smart Cure & Wash Pro Station',
    slug: 'nexra-smart-cure-wash-pro-station',
    sku: 'NX-CURE-PRO',
    description: 'Dual-function automated post-processing system with 360° rotating UV curing platform (405nm LEDs), heated alcohol washing bath, and automated digital timer preset.',
    price: 35000,
    mrp: 40000,
    salePrice: 35000,
    categoryId: 'cat-post-processing',
    subcategoryId: 'sub-wash-cure',
    stock: 18,
    stockQuantity: 18,
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 4.9,
    reviewCount: 22,
    isFeatured: false,
    isTrending: false,
    specifications: {
      'Max Wash Size': '200 x 120 x 220 mm',
      'UV Array': '18 High Power 405nm UV Matrix',
      'Curing Chamber Temp': 'Controlled up to 60°C',
      'Timer Modes': '1 to 60 Minutes Touch Controls'
    },
    tags: ['uv-cure', 'wash-station', 'post-processing', 'sla-cleaner'],
    createdAt: '2026-02-20'
  },
  {
    id: 'prod-nx-vat-fep',
    title: 'NEXRA High-Precision Aluminum SLA Tank & FEP 2.0 Kit',
    slug: 'nexra-aluminum-sla-tank-fep-kit',
    sku: 'NX-ACC-VAT',
    description: 'CNC machined anodized aluminum resin vat equipped with ultra-clear non-stick nFEP 2.0 film pre-installed for effortless print release and crisp feature definition.',
    price: 3800,
    mrp: 4500,
    salePrice: 3800,
    categoryId: 'cat-spares-components',
    subcategoryId: 'sub-vats-fep',
    stock: 50,
    stockQuantity: 50,
    images: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800'
    ],
    brand: 'NEXRA 3D',
    rating: 4.7,
    reviewCount: 31,
    isFeatured: false,
    isTrending: false,
    specifications: {
      'Material': 'Anodized 6061 Aluminum + nFEP 2.0 Film',
      'Film Thickness': '0.15mm Non-Stick High-Tension',
      'Compatibility': 'NEXRA Pro-SLA Series',
      'Includes': 'Vat Cover + Silicone Scraper'
    },
    tags: ['vat', 'fep-film', 'spare-part', 'sla-accessory'],
    createdAt: '2026-03-01'
  },
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
    industries: ['Aerospace', 'Automotive', 'Consumer Electronics', 'Industrial Automation', 'Medical Devices'],
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
    id: 'srv-medical-dental',
    name: 'Medical & Dental 3D Solutions',
    slug: 'medical-dental',
    shortDescription: 'Class IIa biocompatible surgical guides, dental aligner models, and anatomical pre-op models.',
    description: 'Precision healthcare manufacturing powered by Class IIa certified biocompatible resins. NEXRA 3D partners with surgeons, dental labs, and medical device innovators to produce patient-specific anatomical models for pre-surgical simulation, custom surgical drill guides, clear aligner thermoforming models, and prosthetic prototypes.',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=800'
    ],
    industries: ['Healthcare & Hospitals', 'Dental Clinics & Labs', 'Biomedical Engineering'],
    isActive: true,
    isFeatured: true,
    sortOrder: 4,
    seoTitle: 'Medical & Dental 3D Printing Solutions | NEXRA 3D',
    seoDescription: 'Biocompatible surgical guides, patient anatomical models, and dental clear aligners.'
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
    clientName: 'Dr. Rajesh Varma',
    company: 'Apex Healthcare System',
    designation: 'Chief Biomedical Engineer',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    rating: 5,
    content: 'NEXRA 3D provided patient-specific 3D printed surgical guides with 100% anatomical accuracy. Their 24-hour turnaround saved critical pre-operative preparation time for a complex cardiac procedure.',
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
    streetAddress: 'Plot 42, Advanced Tech Zone',
    apartment: 'Industrial Estate Phase 2',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560066',
    country: 'India',
    isDefault: true,
    type: 'WORK'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'NX-ORD-882910',
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
