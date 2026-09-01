// Base de datos oficial - Catálogo Maestro BAGS WORLD COLOMBIA (Bastion AI)
// 8 Referencias reales de bodega de bolsos, carteras y accesorios importados

const INITIAL_MASTER_PRODUCTS = [
  // 1. Bolso Tote Mini Horse Charm 'Colección Amor y Amistad'
  {
    id: "prod-lux-001",
    sku: "BW-HORS-68",
    name: "Bolso Tote Mini Horse Charm 'Colección Amor y Amistad'",
    category: "Totes & Handbags",
    tagline: "Bolso importado calidad superior con colgante de caballito y correa delgada.",
    description: "Confeccionado en cuero PU graneado con herrajes metálicos reforzados. Cuenta con un compartimento principal con cierre y bolsillo interno con cremallera, asas de mano rígidas, correa delgada ajustable e incluye accesorio decorativo de caballito.",
    image: "assets/images/bags/tote_horse_charm_cream.jpg",
    dimensions: "16 cm (Alto) x 20 cm (Ancho) x 8 cm (Profundidad)",
    sizeCategory: "Compacto (<20cm)",
    colorways: [
      { name: "Bicolor Crema / Negro", image: "assets/images/bags/tote_horse_charm_cream.jpg", sku: "BW-HORS-CRM" },
      { name: "Negro Ónix", image: "assets/images/bags/tote_horse_charm_cream.jpg", sku: "BW-HORS-BLK" },
      { name: "Camel / Miel", image: "assets/images/bags/tote_horse_charm_cream.jpg", sku: "BW-HORS-CAM" },
      { name: "Rosa Pastel", image: "assets/images/bags/tote_horse_charm_cream.jpg", sku: "BW-HORS-PNK" },
      { name: "Marrón Chocolate", image: "assets/images/bags/tote_horse_charm_cream.jpg", sku: "BW-HORS-CHO" }
    ],
    specs: [
      "Importado calidad superior",
      "Un compartimento con cremallera",
      "Cierre y bolsillo interno",
      "Trae correa delgada ajustable",
      "Incluye accesorio decorativo de caballito",
      "Medidas: 16 alto x 20 ancho x 8 profundidad cm"
    ],
    wholesalePrice: 68000,
    suggestedRetailPrice: 125000,
    supplierId: "sup-001",
    supplierName: "BAGS WORLD Colombia (Bodega Matriz)",
    createdAt: "2026-09-01"
  },

  // 2. Bolso Crossbody Acolchado TOUS Pop 'Flap Edition'
  {
    id: "prod-lux-002",
    sku: "BW-TOUS-POP",
    name: "Bolso Crossbody Acolchado TOUS Pop 'Flap Edition'",
    category: "Crossbody & Flap",
    tagline: "Textura acolchada con icónico relieve en bajo relieve y correa deportiva.",
    description: "Bolso bandolera de solapa con broche imantado, confeccionado en ecocuero de tacto ultra suave con motivos en relieve tridimensional. Interior forrado con compartimentos organizadores y correa ancha textil estampada intercambiable.",
    image: "assets/images/bags/tous_crossbody_black.jpg",
    dimensions: "18 cm (Alto) x 22 cm (Ancho) x 7 cm (Profundidad)",
    sizeCategory: "Mediano (20-28cm)",
    colorways: [
      { name: "Negro Noir", image: "assets/images/bags/tous_crossbody_black.jpg", sku: "BW-TOUS-BLK" }
    ],
    specs: [
      "Solapa frontal con broche magnético",
      "Relieve acolchado 3D de alta densidad",
      "Forro interno impermeable con cremallera",
      "Correa cruzada ajustable con mosquetones cromados",
      "Etiqueta y herrajes grabados TOUS"
    ],
    wholesalePrice: 72000,
    suggestedRetailPrice: 135000,
    supplierId: "sup-001",
    supplierName: "BAGS WORLD Colombia (Bodega Matriz)",
    createdAt: "2026-09-01"
  },

  // 3. Bolso Satchel Estructurado Padlock 'Milano Chic'
  {
    id: "prod-lux-003",
    sku: "BW-STCH-OLV",
    name: "Bolso Satchel Estructurado Padlock 'Milano Chic'",
    category: "Satchel & Estructurados",
    tagline: "Elegante silueta de mano con candado metálico plateado y panel frontal plisado.",
    description: "Diseño estructurado de alta presencia con manijas dobles reforzadas y correa de hombro ajustable. Incluye detalle de candado frontal funcional, textura acanalada de alta densidad y compartimento con triple fuelle.",
    image: "assets/images/bags/satchel_padlock_olive.jpg",
    dimensions: "21 cm (Alto) x 26 cm (Ancho) x 11 cm (Profundidad)",
    sizeCategory: "Mediano (20-28cm)",
    colorways: [
      { name: "Verde Oliva", image: "assets/images/bags/satchel_padlock_olive.jpg", sku: "BW-STCH-OLV" },
      { name: "Negro Clásico", image: "assets/images/bags/satchel_padlock_multi.jpg", sku: "BW-STCH-BLK" },
      { name: "Café Chocolate", image: "assets/images/bags/satchel_padlock_multi.jpg", sku: "BW-STCH-CHO" },
      { name: "Blanco Nieve", image: "assets/images/bags/satchel_padlock_multi.jpg", sku: "BW-STCH-WHT" },
      { name: "Rosa Palo", image: "assets/images/bags/satchel_padlock_multi.jpg", sku: "BW-STCH-PNK" },
      { name: "Camel Miel", image: "assets/images/bags/satchel_padlock_multi.jpg", sku: "BW-STCH-CAM" }
    ],
    specs: [
      "Doble manija tubular reforzada",
      "Candado metálico pulido frontal",
      "Correa larga graduable y removible",
      "Triple fuelle interior con organizadores",
      "Base rígida con topes metálicos de protección"
    ],
    wholesalePrice: 78000,
    suggestedRetailPrice: 145000,
    supplierId: "sup-001",
    supplierName: "BAGS WORLD Colombia (Bodega Matriz)",
    createdAt: "2026-09-01"
  },

  // 4. Colección Satchel Padlock 6 Tonos 'Paleta Completa'
  {
    id: "prod-lux-004",
    sku: "BW-STCH-6COL",
    name: "Colección Satchel Padlock 6 Tonos 'Paleta Completa'",
    category: "Satchel & Estructurados",
    tagline: "Edición especial en 6 variantes de color con candado plateado y herrajes de lujo.",
    description: "Paleta completa para boutique: Negro, Chocolate, Oliva, Blanco, Rosa Pastel y Camel. Estructura rígida que no pierde la forma, costuras reforzadas y acabados importados de primera línea.",
    image: "assets/images/bags/satchel_padlock_multi.jpg",
    dimensions: "21 cm (Alto) x 26 cm (Ancho) x 11 cm (Profundidad)",
    sizeCategory: "Mediano (20-28cm)",
    colorways: [
      { name: "Negro Ónix", image: "assets/images/bags/satchel_padlock_multi.jpg", sku: "BW-6COL-BLK" },
      { name: "Marrón Chocolate", image: "assets/images/bags/satchel_padlock_multi.jpg", sku: "BW-6COL-CHO" },
      { name: "Verde Oliva", image: "assets/images/bags/satchel_padlock_olive.jpg", sku: "BW-6COL-OLV" },
      { name: "Blanco Puro", image: "assets/images/bags/satchel_padlock_multi.jpg", sku: "BW-6COL-WHT" },
      { name: "Rosa Pastel", image: "assets/images/bags/satchel_padlock_multi.jpg", sku: "BW-6COL-PNK" },
      { name: "Camel Cuero", image: "assets/images/bags/satchel_padlock_multi.jpg", sku: "BW-6COL-CAM" }
    ],
    specs: [
      "6 colores disponibles listos para despacho",
      "Candado frontal plateado con grabado fino",
      "Manijas estructuradas de mano",
      "Correa larga removible incluida",
      "Material anti-rayones de fácil limpieza"
    ],
    wholesalePrice: 78000,
    suggestedRetailPrice: 145000,
    supplierId: "sup-001",
    supplierName: "BAGS WORLD Colombia (Bodega Matriz)",
    createdAt: "2026-09-01"
  },

  // 5. Mini Morral Dama 'Glitz & Glam' con Cristales Strass
  {
    id: "prod-lux-005",
    sku: "BW-MRL-STRASS",
    name: "Mini Morral Dama 'Glitz & Glam' con Cristales Strass",
    category: "Morrales & Mochilas",
    tagline: "Mochila urbana compacta con incrustaciones de cristales brillantes y cremallera frontal.",
    description: "Morral compacto en ecocuero negro y gamuza con cientos de cristales strass termofijados de alto brillo. Correas de espalda graduables, asa de mano superior y bolsillo frontal con tirador de piel.",
    image: "assets/images/bags/backpack_strass_black.jpg",
    dimensions: "24 cm (Alto) x 19 cm (Ancho) x 10 cm (Profundidad)",
    sizeCategory: "Mediano (20-28cm)",
    colorways: [
      { name: "Negro Strass Cristal", image: "assets/images/bags/backpack_strass_black.jpg", sku: "BW-MRL-BLK" }
    ],
    specs: [
      "Incrustaciones strass brillantes termofijadas",
      "Bolsillo frontal de acceso rápido con cremallera",
      "Correas de espalda reforzadas y ajustables",
      "Asa superior para llevar de mano",
      "Forro interior negro de alta resistencia"
    ],
    wholesalePrice: 65000,
    suggestedRetailPrice: 120000,
    supplierId: "sup-001",
    supplierName: "BAGS WORLD Colombia (Bodega Matriz)",
    createdAt: "2026-09-01"
  },

  // 6. Billetera Compacta GUESS Scarlet Red
  {
    id: "prod-lux-006",
    sku: "BW-GSS-RED",
    name: "Billetera Compacta GUESS Scarlet Red",
    category: "Billeteras & Clutches",
    tagline: "Billetera de 3 cuerpos en cuero graneado rojo escarlata con herraje metálico 'DGC'.",
    description: "Elegante billetera importada en tono rojo vibrante con textura Saffiano resistente a rayaduras. Incluye broche con detalle de eslabón dorado 'GUESS', monedero lateral con cremallera y 8 ranuras para tarjetas.",
    image: "assets/images/bags/guess_wallet_red.jpg",
    dimensions: "10 cm (Alto) x 14 cm (Ancho) x 3.5 cm (Profundidad)",
    sizeCategory: "Compacto (<20cm)",
    colorways: [
      { name: "Scarlet Red", image: "assets/images/bags/guess_wallet_red.jpg", sku: "BW-GSS-RED" },
      { name: "Noir Black", image: "assets/images/bags/guess_wallet_black.jpg", sku: "BW-GSS-BLK" }
    ],
    specs: [
      "Cuero texturizado estilo Saffiano",
      "Herraje de eslabón dorado con relieve GUESS",
      "Compartimento amplio para billetes",
      "8 ranuras para tarjetas y documentos",
      "Monedero lateral con cremallera dorada"
    ],
    wholesalePrice: 42000,
    suggestedRetailPrice: 79000,
    supplierId: "sup-001",
    supplierName: "BAGS WORLD Colombia (Bodega Matriz)",
    createdAt: "2026-09-01"
  },

  // 7. Billetera Compacta GUESS Noir Black
  {
    id: "prod-lux-007",
    sku: "BW-GSS-BLK",
    name: "Billetera Compacta GUESS Noir Black",
    category: "Billeteras & Clutches",
    tagline: "Billetera de lujo en negro clásico con herraje dorado y cremallera para monedas.",
    description: "La versión en negro atemporal de la billetera GUESS. Estructura compacta ideal para llevar en cualquier bolso mediano o de mano, con finos acabados dorados y cierre suave.",
    image: "assets/images/bags/guess_wallet_black.jpg",
    dimensions: "10 cm (Alto) x 14 cm (Ancho) x 3.5 cm (Profundidad)",
    sizeCategory: "Compacto (<20cm)",
    colorways: [
      { name: "Noir Black", image: "assets/images/bags/guess_wallet_black.jpg", sku: "BW-GSS-BLK" },
      { name: "Scarlet Red", image: "assets/images/bags/guess_wallet_red.jpg", sku: "BW-GSS-RED" }
    ],
    specs: [
      "Ecocuero negro graneado de alta durabilidad",
      "Letras y herraje en relieve dorado",
      "Ranuras organizadoras para tarjetas y cédula",
      "Monedero con cremallera metálica suave",
      "Broche a presión seguro"
    ],
    wholesalePrice: 42000,
    suggestedRetailPrice: 79000,
    supplierId: "sup-001",
    supplierName: "BAGS WORLD Colombia (Bodega Matriz)",
    createdAt: "2026-09-01"
  },

  // 8. Billetera / Clutch Flap Chloé Woody Lona & Cuero
  {
    id: "prod-lux-008",
    sku: "BW-CHL-WDY",
    name: "Billetera / Clutch Flap Chloé Woody Lona & Cuero",
    category: "Billeteras & Clutches",
    tagline: "Clutch billetera de solapa en lona beige con tipografía bordada y ribete en cuero negro.",
    description: "Inspirada en el estilo bohemio de lujo parisino. Confeccionada en lona de algodón natural de alto gramaje con bordado 'Chloé' en contraste, ribete de cuero genuino y presentación en caja de regalo rígida.",
    image: "assets/images/bags/chloe_wallet_canvas.jpg",
    dimensions: "11 cm (Alto) x 19 cm (Ancho) x 3 cm (Profundidad)",
    sizeCategory: "Compacto (<20cm)",
    colorways: [
      { name: "Lona Beige / Negro", image: "assets/images/bags/chloe_wallet_canvas.jpg", sku: "BW-CHL-WDY" }
    ],
    specs: [
      "Lona gruesa de algodón natural + Cuero negro",
      "Bordado frontal de alta definición",
      "Múltiples separadores internos para tarjetas y billetes",
      "Solapa con broche imantado",
      "Incluye caja rígida de presentación"
    ],
    wholesalePrice: 48000,
    suggestedRetailPrice: 89000,
    supplierId: "sup-001",
    supplierName: "BAGS WORLD Colombia (Bodega Matriz)",
    createdAt: "2026-09-01"
  }
];

// =========================================================================
// ESCENARIOS DEMO OFICIALES (EXACTAMENTE LOS 2 CLIENTES + PROVEEDOR SAAS)
// =========================================================================
const INITIAL_STORES = [
  // ESCENARIO 1: BolsosCOL (Cliente Clave para Cierre)
  {
    id: "store-bolsoscol",
    name: "BolsosCOL",
    email: "contacto@bolsoscol.com",
    password: "BolsosCOL2026*",
    role: "store_owner",
    tagline: "Boutique de Bolsos y Carteras de Alta Gama | Envíos Express y Contraentrega a Toda Colombia.",
    phone: "573165558899",
    neighborhood: "Bogotá D.C. & Cobertura Nacional",
    isSupplierStore: false,
    verifiedBadge: "CLIENTE VIP",
    products: [
      { productId: "prod-lux-001", customPrice: 129000, active: true },
      { productId: "prod-lux-002", customPrice: 139000, active: true },
      { productId: "prod-lux-003", customPrice: 149000, active: true },
      { productId: "prod-lux-004", customPrice: 149000, active: true },
      { productId: "prod-lux-005", customPrice: 125000, active: true },
      { productId: "prod-lux-006", customPrice: 82000, active: true },
      { productId: "prod-lux-007", customPrice: 82000, active: true },
      { productId: "prod-lux-008", customPrice: 92000, active: true }
    ]
  },

  // ESCENARIO 2: Calibolsos2026 (Boutique de Alto Rendimiento en Cali)
  {
    id: "store-calibolsos",
    name: "Calibolsos 2026",
    email: "ventas@calibolsos.com",
    password: "Cali2026*",
    role: "store_owner",
    tagline: "Moda en Carteras, Totes y Billeteras con Entrega el Mismo Día en Cali y Valle del Cauca.",
    phone: "573187774433",
    neighborhood: "Granada / Ciudad Jardín, Cali",
    isSupplierStore: false,
    verifiedBadge: "BOUTIQUE OFICIAL",
    products: [
      { productId: "prod-lux-001", customPrice: 125000, active: true },
      { productId: "prod-lux-002", customPrice: 135000, active: true },
      { productId: "prod-lux-003", customPrice: 145000, active: true },
      { productId: "prod-lux-004", customPrice: 145000, active: true },
      { productId: "prod-lux-005", customPrice: 120000, active: true },
      { productId: "prod-lux-006", customPrice: 79000, active: true },
      { productId: "prod-lux-007", customPrice: 79000, active: true },
      { productId: "prod-lux-008", customPrice: 89000, active: true }
    ]
  },

  // ESCENARIO MATRIZ: Dueño del SaaS / Bodega Central BAGS WORLD
  {
    id: "store-bagsworld-admin",
    name: "BAGS WORLD Colombia (Bodega Central)",
    email: "admin@bagsworld.com",
    password: "BastionSaaS2026*",
    role: "super_admin",
    tagline: "Bodega Mayorista Matriz | Centro de Despachos Nacionales y Administración de la Red MLS.",
    phone: "573155551234",
    neighborhood: "Bodega Central Mayorista · Despachos Nacionales",
    isSupplierStore: true,
    verifiedBadge: "BODEGA MATRIZ VERIFICADA",
    products: [
      { productId: "prod-lux-001", customPrice: 125000, active: true },
      { productId: "prod-lux-002", customPrice: 135000, active: true },
      { productId: "prod-lux-003", customPrice: 145000, active: true },
      { productId: "prod-lux-004", customPrice: 145000, active: true },
      { productId: "prod-lux-005", customPrice: 120000, active: true },
      { productId: "prod-lux-006", customPrice: 79000, active: true },
      { productId: "prod-lux-007", customPrice: 79000, active: true },
      { productId: "prod-lux-008", customPrice: 89000, active: true }
    ]
  }
];

// Zonas y Tarifas de Despacho en Colombia
const COLOMBIAN_SHIPPING_ZONES = [
  { zone: "Bogotá", name: "Bogotá D.C. (Urbano & Alrededores)", fee: 14000, time: "24-48 Horas" },
  { zone: "Cali", name: "Cali Urbano (Norte / Sur / Oeste)", fee: 12000, time: "Mismo Día (2-4 Horas)" },
  { zone: "Cali", name: "Jamundí / Palmira / Yumbo", fee: 16000, time: "Mismo Día / 24h" },
  { zone: "Medellín", name: "Medellín Urbano (Poblado / Laureles / Envigado)", fee: 14000, time: "Mismo Día / 24h" },
  { zone: "Barranquilla", name: "Barranquilla / Soledad", fee: 16000, time: "24-48 Horas" },
  { zone: "Bucaramanga", name: "Bucaramanga / Floridablanca", fee: 15000, time: "24-48 Horas" },
  { zone: "Eje Cafetero", name: "Pereira / Manizales / Armenia", fee: 15000, time: "24-48 Horas" },
  { zone: "Nacional", name: "Otras Ciudades y Municipios de Colombia", fee: 18000, time: "2-3 Días Hábiles" }
];

const INITIAL_ORDERS = [
  {
    id: "ord-9921",
    date: "2026-09-01 11:20",
    storeName: "BolsosCOL",
    productName: "Bolso Tote Mini Horse Charm 'Colección Amor y Amistad'",
    colorway: "Bicolor Crema / Negro",
    type: "B2B Restock (Reposición)",
    units: 6,
    totalWholesale: 408000,
    status: "En Alistamiento",
    supplierName: "BAGS WORLD Colombia (Bodega Matriz)"
  },
  {
    id: "ord-9920",
    date: "2026-09-01 09:45",
    storeName: "Calibolsos 2026",
    productName: "Bolso Satchel Estructurado Padlock 'Milano Chic'",
    colorway: "Verde Oliva",
    type: "B2B Restock (Reposición)",
    units: 4,
    totalWholesale: 312000,
    status: "Despachado en Coordinadora",
    supplierName: "BAGS WORLD Colombia (Bodega Matriz)"
  }
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    INITIAL_MASTER_PRODUCTS,
    INITIAL_STORES,
    COLOMBIAN_SHIPPING_ZONES,
    INITIAL_ORDERS
  };
}
