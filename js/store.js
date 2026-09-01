// =========================================================================
// LUXBAGS MLS COLOMBIA - STATE & LOCAL STORAGE MANAGER (BASTION AI)
// Base de datos de bolsos, carteras, parser de WhatsApp y checkout multi-bolso
// =========================================================================

const DB_KEYS = {
  MASTER_PRODUCTS: "luxbags_master_products_v9",
  STORES: "luxbags_stores_v9",
  CURRENT_STORE_ID: "luxbags_current_store_id_v9",
  ORDERS: "luxbags_orders_v9",
  CART_ITEMS: "luxbags_cart_items_v9"
};

class LuxbagsStoreManager {
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
      localStorage.setItem(DB_KEYS.CURRENT_STORE_ID, INITIAL_STORES[0].id);
    }
  }

  resetDemo() {
    localStorage.removeItem(DB_KEYS.MASTER_PRODUCTS);
    localStorage.removeItem(DB_KEYS.STORES);
    localStorage.removeItem(DB_KEYS.CURRENT_STORE_ID);
    localStorage.removeItem(DB_KEYS.ORDERS);
    localStorage.removeItem(DB_KEYS.CART_ITEMS);
    this.init();
  }

  // =========================================================================
  // GESTIÓN DE PRODUCTOS MAESTROS (BOLSOS Y ACCESORIOS)
  // =========================================================================
  getMasterProducts() {
    const raw = localStorage.getItem(DB_KEYS.MASTER_PRODUCTS);
    return raw ? JSON.parse(raw) : INITIAL_MASTER_PRODUCTS;
  }

  addMasterProduct(productData) {
    const products = this.getMasterProducts();
    const newProduct = {
      id: "prod-lux-" + Date.now(),
      sku: productData.sku || "LUX-" + Math.floor(1000 + Math.random() * 9000),
      name: productData.name,
      category: productData.category || "Totes & Handbags",
      tagline: productData.tagline || "Bolso importado calidad superior.",
      description: productData.description || "",
      image: productData.image || "assets/images/bags/tote_horse_charm_cream.jpg",
      dimensions: productData.dimensions || "18 cm (Alto) x 22 cm (Ancho) x 8 cm (Profundidad)",
      sizeCategory: productData.sizeCategory || "Mediano (20-28cm)",
      wholesalePrice: Number(productData.wholesalePrice) || 68000,
      suggestedRetailPrice: Number(productData.suggestedRetailPrice) || 125000,
      colorways: productData.colorways && productData.colorways.length > 0 
        ? productData.colorways 
        : [{ name: "Tono Principal", image: productData.image || "assets/images/bags/tote_horse_charm_cream.jpg", sku: productData.sku || "LUX-01" }],
      specs: productData.specs || [
        "Importado calidad superior",
        "Un compartimento con cremallera",
        "Cierre y bolsillo interno",
        "Correa ajustable incluida"
      ],
      supplierId: "sup-001",
      supplierName: "LUXBAGS Colombia (Bodega Matriz)",
      createdAt: new Date().toISOString().split("T")[0]
    };
    products.unshift(newProduct);
    localStorage.setItem(DB_KEYS.MASTER_PRODUCTS, JSON.stringify(products));

    // Agregar a todas las tiendas de la red
    const stores = this.getStores();
    stores.forEach(st => {
      st.products.unshift({
        productId: newProduct.id,
        customPrice: newProduct.suggestedRetailPrice,
        active: true
      });
    });
    localStorage.setItem(DB_KEYS.STORES, JSON.stringify(stores));
    return newProduct;
  }

  // =========================================================================
  // GESTIÓN DE BOUTIQUES Y VITRINAS (WHITE-LABEL)
  // =========================================================================
  getStores() {
    const raw = localStorage.getItem(DB_KEYS.STORES);
    return raw ? JSON.parse(raw) : INITIAL_STORES;
  }

  getCurrentStoreId() {
    return localStorage.getItem(DB_KEYS.CURRENT_STORE_ID) || "store-001";
  }

  setCurrentStoreId(storeId) {
    localStorage.setItem(DB_KEYS.CURRENT_STORE_ID, storeId);
  }

  getCurrentStore() {
    const stores = this.getStores();
    const id = this.getCurrentStoreId();
    return stores.find(s => s.id === id) || stores[0];
  }

  updateStoreProfile(storeId, updatedFields) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (store) {
      Object.assign(store, updatedFields);
      localStorage.setItem(DB_KEYS.STORES, JSON.stringify(stores));
    }
  }

  updateStorePrice(storeId, productId, newPrice) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (store) {
      let p = store.products.find(item => item.productId === productId);
      if (p) {
        p.customPrice = Number(newPrice);
      } else {
        store.products.push({ productId, customPrice: Number(newPrice), active: true });
      }
      localStorage.setItem(DB_KEYS.STORES, JSON.stringify(stores));
    }
  }

  toggleProductActive(storeId, productId) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (store) {
      let p = store.products.find(item => item.productId === productId);
      if (p) {
        p.active = !p.active;
      } else {
        p = { productId, customPrice: 125000, active: false };
        store.products.push(p);
      }
      localStorage.setItem(DB_KEYS.STORES, JSON.stringify(stores));
      return p.active;
    }
    return false;
  }

  getStorefrontProducts(store) {
    const master = this.getMasterProducts();
    return master
      .filter(mp => {
        const sp = (store.products || []).find(p => p.productId === mp.id);
        if (store.isSupplierStore) return !sp || sp.active !== false;
        return sp && sp.active !== false;
      })
      .map(mp => {
        const sp = (store.products || []).find(p => p.productId === mp.id);
        return {
          ...mp,
          storeRetailPrice: (sp && sp.customPrice) ? sp.customPrice : mp.suggestedRetailPrice
        };
      });
  }

  // =========================================================================
  // GESTIÓN DE PEDIDOS B2B Y FLETES
  // =========================================================================
  getOrders() {
    const raw = localStorage.getItem(DB_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : INITIAL_ORDERS;
  }

  createB2BOrder(orderData) {
    const orders = this.getOrders();
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10) + " " + now.toTimeString().slice(0, 5);

    const newOrder = {
      id: "ord-" + Math.floor(1000 + Math.random() * 9000),
      date: dateStr,
      storeName: orderData.storeName,
      productName: orderData.productName,
      colorway: orderData.colorway || "Tono Estándar",
      type: "B2B Restock (Reposición)",
      units: Number(orderData.units) || 1,
      totalWholesale: Number(orderData.totalWholesale) || 0,
      status: "En Alistamiento",
      supplierName: orderData.supplierName || "LUXBAGS Colombia (Bodega Matriz)"
    };
    orders.unshift(newOrder);
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  }

  // =========================================================================
  // UTILIDADES DE FORMATO Y CONVERSIÓN
  // =========================================================================
  formatCOP(value) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  // Parser Inteligente para Copiar/Pegar mensajes de WhatsApp Mayorista
  parseWhatsAppWholesaleText(rawText) {
    if (!rawText || rawText.trim() === "") return null;

    let wholesalePrice = 68000;
    const priceMatch = rawText.match(/\$\s*([0-9.]+)/i);
    if (priceMatch && priceMatch[1]) {
      const cleanNum = parseInt(priceMatch[1].replace(/\./g, ""), 10);
      if (!isNaN(cleanNum) && cleanNum > 10000) {
        wholesalePrice = cleanNum;
      }
    }

    const suggestedRetailPrice = Math.round((wholesalePrice * 1.8) / 1000) * 1000;

    let dimensions = "18 cm (Alto) x 22 cm (Ancho) x 8 cm (Profundidad)";
    let sizeCategory = "Mediano (20-28cm)";
    const dimMatch = rawText.match(/medidas?\s*:?\s*([^\n\r]+)/i);
    if (dimMatch && dimMatch[1]) {
      dimensions = dimMatch[1].trim();
      const firstNum = parseInt(dimensions.match(/\d+/)?.[0] || "20", 10);
      if (firstNum < 20) sizeCategory = "Compacto (<20cm)";
      else if (firstNum <= 28) sizeCategory = "Mediano (20-28cm)";
      else sizeCategory = "Maxi (>28cm)";
    }

    let category = "Totes & Handbags";
    const lower = rawText.toLowerCase();
    if (lower.includes("crossbody") || lower.includes("bandolera") || lower.includes("flap")) category = "Crossbody & Flap";
    else if (lower.includes("satchel") || lower.includes("padlock") || lower.includes("candado")) category = "Satchel & Estructurados";
    else if (lower.includes("morral") || lower.includes("mochila") || lower.includes("backpack")) category = "Morrales & Mochilas";
    else if (lower.includes("billetera") || lower.includes("wallet") || lower.includes("clutch")) category = "Billeteras & Clutches";

    let colorCount = 5;
    const colorMatch = rawText.match(/(\d+)\s*colores/i);
    if (colorMatch && colorMatch[1]) {
      colorCount = parseInt(colorMatch[1], 10);
    }

    const lines = rawText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    let name = "Nuevo Bolso Importado LUXBAGS";
    for (const line of lines) {
      if (line.includes("NUEVO") || line.includes("BOLSO") || line.includes("COLECCIÓN") || line.includes("CARTERA")) {
        name = line.replace(/[$0-9.🔝🤯✨🖤❤️]/g, "").trim();
        if (name.length > 5) break;
      }
    }

    const specs = lines.filter(l => l.startsWith("🖤") || l.startsWith("•") || l.startsWith("-") || l.startsWith("✔") || l.startsWith("✨"))
      .map(l => l.replace(/^[🖤•\-✔✨\s]+/, "").trim());

    return {
      name: name || "Bolso Importado Colección Especial",
      sku: "LUX-WHATS-" + Math.floor(100 + Math.random() * 900),
      category,
      dimensions,
      sizeCategory,
      wholesalePrice,
      suggestedRetailPrice,
      colorCount,
      specs: specs.length > 0 ? specs : ["Importado calidad superior", "Cierre y bolsillo interno", "Correa ajustable incluida"]
    };
  }

  // Generador de Mensaje de WhatsApp para 1 solo Bolso
  buildSingleProductWhatsAppUrl(store, product, colorway) {
    const cleanPhone = (store.phone || "573155551234").replace(/[^0-9]/g, "");
    const formattedPrice = this.formatCOP(product.storeRetailPrice || product.suggestedRetailPrice);
    const colorName = colorway ? colorway.name : "Color del Catálogo";

    const text = `👋 *¡Hola ${store.name}!* Quiero apartar este bolso de su vitrina:

👜 *MODELO:* ${product.name}
🎨 *COLOR:* ${colorName}
📐 *MEDIDAS:* ${product.dimensions || 'Estándar'}
💰 *PRECIO:* ${formattedPrice}

📍 *Mi Ciudad / Barrio:* (Por favor indicar aquí)
🛵 *Modalidad:* Despacho Contraentrega / Asegurado

¿Me confirman disponibilidad inmediata para despacho hoy? ¡Gracias! ✨`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }

  // Generador de Mensaje de WhatsApp para Carrito Multi-Bolso Consolidado
  buildConsolidatedCartWhatsAppUrl(store, cartItems, clientData, shippingZone, dispatchMode) {
    const cleanPhone = (store.phone || "573155551234").replace(/[^0-9]/g, "");
    const totalBagsPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = shippingZone ? shippingZone.fee : 12000;
    const grandTotal = totalBagsPrice + shippingFee;
    const refCode = "LX-" + Math.floor(1000 + Math.random() * 9000);

    const itemsSummary = cartItems.map((item, i) => {
      return `${i + 1}. 👜 *${item.name}*
   • Color: ${item.colorway} | Cant: ${item.quantity} und.
   • Subtotal: ${this.formatCOP(item.price * item.quantity)}`;
    }).join("\n\n");

    const dispatchText = dispatchMode === "secured" 
      ? `🛡️ *Despacho Asegurado* (Abono de flete ${this.formatCOP(shippingFee)} por Nequi/Daviplata + saldo al recibir)`
      : `🛵 *100% Contraentrega al Recibir* (Pago total en puerta)`;

    const text = `🛍️ *¡NUEVO PEDIDO CONSOLIDADO LUXBAGS!*
*Referencia:* #${refCode}
*Tienda:* ${store.name}

👤 *DATOS DEL CLIENTE:*
• *Nombre:* ${clientData.name || 'Cliente'}
• *WhatsApp:* ${clientData.phone || 'El mismo'}
• *Destino:* ${shippingZone ? shippingZone.name : 'Cali'}
• *Dirección:* ${clientData.address || 'Pendiente por confirmar'}

📦 *DETALLE DE BOLSOS & ACCESORIOS (${cartItems.length} ref / ${cartItems.reduce((a, b) => a + b.quantity, 0)} unidades):*
${itemsSummary}

💵 *LIQUIDACIÓN DEL PEDIDO:*
• Bolsos: ${this.formatCOP(totalBagsPrice)}
• Domicilio / Flete: ${this.formatCOP(shippingFee)} (${shippingZone ? shippingZone.time : '24h'})
👉 *GRAN TOTAL: ${this.formatCOP(grandTotal)}*

🚚 *MODALIDAD DE PAGO:*
${dispatchText}

⚡ *Reserva de bodega activa:* Por favor enviar datos de transferencia o confirmación de guía. ¡Quedo atento(a)! ✨`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }
}

const db = new LuxbagsStoreManager();
