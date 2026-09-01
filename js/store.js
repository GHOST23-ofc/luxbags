// =========================================================================
// BAGS WORLD MLS COLOMBIA - GESTOR DE ESTADO & CATÁLOGO MAESTRO (Bastion AI)
// =========================================================================

const DB_KEYS = {
  MASTER_PRODUCTS: "bagsworld_master_products_v10",
  STORES: "bagsworld_stores_v10",
  CURRENT_STORE_ID: "bagsworld_current_store_id_v10",
  ORDERS: "bagsworld_orders_v10",
  CART_ITEMS: "bagsworld_cart_items_v10"
};

class BagsWorldStoreManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(DB_KEYS.MASTER_PRODUCTS)) {
      localStorage.setItem(DB_KEYS.MASTER_PRODUCTS, JSON.stringify(INITIAL_MASTER_PRODUCTS));
    }
    if (!localStorage.getItem(DB_KEYS.STORES)) {
      localStorage.setItem(DB_KEYS.STORES, JSON.stringify(INITIAL_STORES));
    }
    if (!localStorage.getItem(DB_KEYS.ORDERS)) {
      localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(DB_KEYS.CURRENT_STORE_ID)) {
      localStorage.setItem(DB_KEYS.CURRENT_STORE_ID, "store-001");
    }
  }

  resetDemo() {
    localStorage.setItem(DB_KEYS.MASTER_PRODUCTS, JSON.stringify(INITIAL_MASTER_PRODUCTS));
    localStorage.setItem(DB_KEYS.STORES, JSON.stringify(INITIAL_STORES));
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(DB_KEYS.CURRENT_STORE_ID, "store-001");
    localStorage.removeItem(DB_KEYS.CART_ITEMS);
  }

  getMasterProducts() {
    try {
      const raw = localStorage.getItem(DB_KEYS.MASTER_PRODUCTS);
      const parsed = raw ? JSON.parse(raw) : INITIAL_MASTER_PRODUCTS;
      if (!Array.isArray(parsed) || parsed.length < 8 || !parsed[0].sku.startsWith("BW-")) {
        localStorage.setItem(DB_KEYS.MASTER_PRODUCTS, JSON.stringify(INITIAL_MASTER_PRODUCTS));
        return INITIAL_MASTER_PRODUCTS;
      }
      return parsed;
    } catch (e) {
      return INITIAL_MASTER_PRODUCTS;
    }
  }

  saveMasterProducts(products) {
    localStorage.setItem(DB_KEYS.MASTER_PRODUCTS, JSON.stringify(products));
  }

  getStores() {
    try {
      const raw = localStorage.getItem(DB_KEYS.STORES);
      const parsed = raw ? JSON.parse(raw) : INITIAL_STORES;
      if (!Array.isArray(parsed) || parsed.length === 0 || !parsed[0].name.includes("BAGS WORLD")) {
        localStorage.setItem(DB_KEYS.STORES, JSON.stringify(INITIAL_STORES));
        return INITIAL_STORES;
      }
      return parsed;
    } catch (e) {
      return INITIAL_STORES;
    }
  }

  saveStores(stores) {
    localStorage.setItem(DB_KEYS.STORES, JSON.stringify(stores));
  }

  getCurrentStoreId() {
    return localStorage.getItem(DB_KEYS.CURRENT_STORE_ID) || "store-001";
  }

  setCurrentStoreId(storeId) {
    localStorage.setItem(DB_KEYS.CURRENT_STORE_ID, storeId);
  }

  getCurrentStore() {
    const stores = this.getStores();
    const currentId = this.getCurrentStoreId();
    return stores.find(s => s.id === currentId) || stores[0];
  }

  getOrders() {
    try {
      const raw = localStorage.getItem(DB_KEYS.ORDERS);
      return raw ? JSON.parse(raw) : INITIAL_ORDERS;
    } catch (e) {
      return INITIAL_ORDERS;
    }
  }

  saveOrders(orders) {
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
  }

  getStorefrontProducts(store) {
    const master = this.getMasterProducts();
    const storeProducts = store && Array.isArray(store.products) ? store.products : [];

    return master.map(mp => {
      const sp = storeProducts.find(p => p.productId === mp.id);
      const isActive = sp ? sp.active !== false : true;
      const customPrice = sp && sp.customPrice ? sp.customPrice : mp.suggestedRetailPrice;

      return {
        ...mp,
        storeRetailPrice: customPrice,
        isActiveInStore: isActive
      };
    }).filter(p => p.isActiveInStore !== false);
  }

  updateStorePrice(storeId, productId, newPrice) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (!store) return false;

    if (!store.products) store.products = [];
    const prodConfig = store.products.find(p => p.productId === productId);

    if (prodConfig) {
      prodConfig.customPrice = parseInt(newPrice, 10);
    } else {
      store.products.push({
        productId,
        customPrice: parseInt(newPrice, 10),
        active: true
      });
    }

    this.saveStores(stores);
    return true;
  }

  toggleProductActive(storeId, productId) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (!store) return false;

    if (!store.products) store.products = [];
    const prodConfig = store.products.find(p => p.productId === productId);

    if (prodConfig) {
      prodConfig.active = !prodConfig.active;
    } else {
      store.products.push({
        productId,
        customPrice: 120000,
        active: false
      });
    }

    this.saveStores(stores);
    return prodConfig ? prodConfig.active : false;
  }

  updateStoreProfile(storeId, { name, tagline, phone, neighborhood }) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (!store) return false;

    if (name) store.name = name;
    if (tagline) store.tagline = tagline;
    if (phone) store.phone = phone.replace(/[^0-9]/g, "");
    if (neighborhood) store.neighborhood = neighborhood;

    this.saveStores(stores);
    return true;
  }

  addMasterProduct(newProduct) {
    const master = this.getMasterProducts();
    const product = {
      id: "prod-lux-" + Date.now().toString(36),
      sku: newProduct.sku || `BW-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newProduct.name || "Nuevo Bolso Importado",
      category: newProduct.category || "Totes & Handbags",
      tagline: newProduct.tagline || "Bolso importado calidad superior.",
      description: newProduct.description || "Confección de alta calidad con herrajes metálicos reforzados.",
      image: newProduct.image || "assets/images/bags/tote_horse_charm_cream.jpg",
      dimensions: newProduct.dimensions || "18 cm (Alto) x 22 cm (Ancho) x 8 cm (Prof.)",
      sizeCategory: newProduct.sizeCategory || "Mediano (20-28cm)",
      colorways: newProduct.colorways || [
        { name: "Negro Ónix", image: newProduct.image || "assets/images/bags/tote_horse_charm_cream.jpg", sku: "BW-BLK" }
      ],
      wholesalePrice: parseInt(newProduct.wholesalePrice || "68000", 10),
      suggestedRetailPrice: parseInt(newProduct.suggestedRetailPrice || "125000", 10),
      supplierId: "sup-001",
      supplierName: "BAGS WORLD Colombia (Bodega Matriz)",
      createdAt: new Date().toISOString().slice(0, 10)
    };

    master.unshift(product);
    this.saveMasterProducts(master);
    return product;
  }

  parseWhatsAppWholesaleText(rawText) {
    if (!rawText || rawText.trim() === "") return null;

    const priceMatch = rawText.match(/\$?([0-9]{2,3})[.,]([0-9]{3})/);
    let wholesalePrice = 68000;
    if (priceMatch) {
      wholesalePrice = parseInt(priceMatch[1] + priceMatch[2], 10);
    }

    const marginPVP = Math.round(wholesalePrice * 1.8 / 1000) * 1000;

    let dimensions = "18 cm (Alto) x 22 cm (Ancho) x 8 cm (Profundidad)";
    const dimMatch = rawText.match(/medidas?:?\s*([0-9xX\s\w]+)/i);
    if (dimMatch) {
      dimensions = dimMatch[1].trim();
    }

    const lines = rawText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const titleLine = lines.find(l => l.toUpperCase().includes("BOLSO") || l.toUpperCase().includes("COLECCIÓN") || l.toUpperCase().includes("TOTE")) || lines[0] || "Nuevo Bolso Importado BAGS WORLD";

    let colorCount = 1;
    const colorMatch = rawText.match(/([0-9]+)\s*colores/i);
    if (colorMatch) {
      colorCount = parseInt(colorMatch[1], 10);
    }

    return {
      name: titleLine.replace(/[$0-9.,]/g, "").replace(/[🔝🤯🖤✨]/g, "").trim(),
      sku: `BW-${Math.floor(1000 + Math.random() * 9000)}`,
      category: "Totes & Handbags",
      tagline: "Importado calidad superior detectado desde WhatsApp.",
      description: rawText.substring(0, 220),
      image: "assets/images/bags/tote_horse_charm_cream.jpg",
      dimensions,
      wholesalePrice,
      suggestedRetailPrice: marginPVP,
      colorways: Array.from({ length: Math.min(colorCount, 6) }).map((_, i) => ({
        name: `Tono #${i + 1}`,
        image: "assets/images/bags/tote_horse_charm_cream.jpg",
        sku: `BW-TONO-${i + 1}`
      }))
    };
  }

  createB2BOrder({ storeName, productName, colorway, units, totalWholesale, supplierName }) {
    const orders = this.getOrders();
    const newOrder = {
      id: "ord-" + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      storeName,
      productName,
      colorway,
      type: "B2B Restock (Reposición)",
      units,
      totalWholesale,
      status: "En Alistamiento",
      supplierName
    };
    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }

  buildSingleProductWhatsAppUrl(store, product, selectedColorway) {
    const cleanPhone = (store.phone || "573155551234").replace(/[^0-9]/g, "");
    const colorName = selectedColorway ? selectedColorway.name : "Color Original";
    const formattedPrice = this.formatCOP(product.storeRetailPrice);

    const message = `✨ *SOLICITUD DE PEDIDO - BAGS WORLD COLOMBIA* ✨
------------------------------------------
🏪 *Boutique:* ${store.name}
📍 *Ubicación:* ${store.neighborhood}

👜 *Bolso:* ${product.name}
🎨 *Colorway:* ${colorName}
🏷️ *SKU:* ${product.sku}
📐 *Medidas:* ${product.dimensions || 'Estándar'}
💰 *Valor Unitario:* ${formattedPrice} COP

🛵 *Modalidad:* Despacho Contraentrega Nacional
------------------------------------------
👋 ¡Hola! Quiero pedir este bolso en color *${colorName}*. ¿Tienen disponibilidad para despacho hoy?`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  buildConsolidatedCartWhatsAppUrl(store, cartItems, customerData, selectedZone, dispatchMode) {
    const cleanPhone = (store.phone || "573155551234").replace(/[^0-9]/g, "");
    const totalBags = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = selectedZone ? selectedZone.fee : 12000;
    const grandTotal = totalBags + shippingFee;

    const itemsSummary = cartItems.map((item, idx) => {
      return `${idx + 1}. 👜 *${item.name}* (${item.quantity} und)
   • Color: ${item.colorway}
   • Subtotal: ${this.formatCOP(item.price * item.quantity)}`;
    }).join("\n\n");

    const modeText = dispatchMode === "secured"
      ? `🛡️ *Despacho Asegurado:* Abono flete (${this.formatCOP(shippingFee)}) por Nequi/Daviplata y bolsos contraentrega.`
      : `🛵 *100% Contraentrega:* Pago totalidad al recibir en puerta.`;

    const message = `✨ *PEDIDO CONSOLIDADO DE BOLSOS - BAGS WORLD* ✨
==========================================
🏪 *Boutique:* ${store.name}

👤 *Cliente:* ${customerData.name || 'Cliente Directo'}
📱 *WhatsApp:* ${customerData.phone || 'No especificado'}
📍 *Dirección:* ${customerData.address || 'No especificada'}
🏙️ *Destino:* ${selectedZone ? selectedZone.name : 'Colombia'}

🛍️ *BOLSOS SOLICITADOS:*
------------------------------------------
${itemsSummary}

------------------------------------------
💰 *Subtotal Bolsos:* ${this.formatCOP(totalBags)}
🛵 *Flete Estimado:* ${this.formatCOP(shippingFee)} (${selectedZone ? selectedZone.time : 'Hoy'})
💳 *GRAN TOTAL A PAGAR:* ${this.formatCOP(grandTotal)} COP

📦 *MODALIDAD DE DESPACHO:*
${modeText}
==========================================
⚡ *Reserva de Bodega Activa:* Solicitud enviada para confirmación de inventario y despacho inmediato.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  formatCOP(value) {
    return "$" + parseInt(value || 0, 10).toLocaleString("es-CO");
  }
}

const db = new BagsWorldStoreManager();

if (typeof module !== "undefined" && module.exports) {
  module.exports = { BagsWorldStoreManager, db };
}
