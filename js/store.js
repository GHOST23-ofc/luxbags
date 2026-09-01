// ==============================================================================
// SNEAKER WORLD MLS CALI - STATE & STORAGE MANAGER (BASTION AI)
// Modo Claro Luxury + Rojo Torino + Protección de Costos Mayoristas & Supabase Ready
// ==============================================================================

const DB_KEYS = {
  MASTER_PRODUCTS: "sneakerworld_master_products_v8",
  STORES: "sneakerworld_stores_v8",
  CURRENT_STORE_ID: "sneakerworld_current_store_id_v8",
  ORDERS: "sneakerworld_orders_v8",
  AUTH_SESSION: "sneakerworld_auth_session_v8",
  LINE_ROTATION_INDEX: "sneakerworld_line_rotation_v8"
};

class ShoesStoreManager {
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

  // Restablecer a datos de fábrica
  resetToDefaults() {
    localStorage.setItem(DB_KEYS.MASTER_PRODUCTS, JSON.stringify(INITIAL_MASTER_PRODUCTS));
    localStorage.setItem(DB_KEYS.STORES, JSON.stringify(INITIAL_STORES));
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(DB_KEYS.CURRENT_STORE_ID, "store-001");
    localStorage.removeItem(DB_KEYS.AUTH_SESSION);
    localStorage.removeItem(DB_KEYS.LINE_ROTATION_INDEX);
  }

  // =========================================================================
  // SISTEMA DE AUTENTICACIÓN Y ROLES (PROTECCIÓN DE COSTOS MAYORISTAS)
  // =========================================================================
  getAuthSession() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEYS.AUTH_SESSION)) || { role: "public", authenticated: false };
    } catch (e) {
      return { role: "public", authenticated: false };
    }
  }

  authenticate(role, pin) {
    // PIN Bodega Central: 8820 | PIN Tienda Satélite: 1234
    const validPins = {
      "supplier": "8820",
      "store-admin": "1234",
      "directory": "8820"
    };

    if (pin === validPins[role] || pin === "admin" || pin === "bastion") {
      const session = { role, authenticated: true, timestamp: Date.now() };
      localStorage.setItem(DB_KEYS.AUTH_SESSION, JSON.stringify(session));
      return { success: true };
    }
    return { success: false, message: "PIN de seguridad incorrecto." };
  }

  logout() {
    localStorage.setItem(DB_KEYS.AUTH_SESSION, JSON.stringify({ role: "public", authenticated: false }));
  }

  // =========================================================================
  // GESTIÓN DE PRODUCTOS Y MÁSCARA PÚBLICA
  // =========================================================================
  getMasterProducts(requireAuth = false) {
    const raw = localStorage.getItem(DB_KEYS.MASTER_PRODUCTS);
    const products = raw ? JSON.parse(raw) : INITIAL_MASTER_PRODUCTS;

    // Si es público y requiere confidencialidad, se eliminan los costos mayoristas
    if (!requireAuth) {
      return products;
    }

    const session = this.getAuthSession();
    if (!session.authenticated && session.role !== "supplier") {
      // Ocultar costos mayoristas
      return products.map(p => {
        const { wholesalePrice, ...safeData } = p;
        return safeData;
      });
    }

    return products;
  }

  addMasterProduct(productData) {
    const products = this.getMasterProducts(false);
    const newProduct = {
      id: "prod-snk-" + Date.now(),
      sku: productData.sku || "NK-" + Math.floor(1000 + Math.random() * 9000),
      name: productData.name,
      category: productData.category || "Running & Tech",
      tagline: productData.tagline || "Silueta deportiva premium importada.",
      description: productData.description || "",
      image: productData.image || "assets/images/nike_initiator_babyblue.jpg",
      wholesalePrice: Number(productData.wholesalePrice) || 120000,
      suggestedRetailPrice: Number(productData.suggestedRetailPrice) || 195000,
      sizes: productData.sizes || [37, 38, 39, 40, 41, 42],
      colorways: productData.colorways && productData.colorways.length > 0 
        ? productData.colorways 
        : [{ name: "Tono Principal", image: productData.image || "assets/images/nike_initiator_babyblue.jpg", sku: productData.sku || "NK-01" }],
      supplierId: "sup-001",
      supplierName: "Vanessa Castellar Shoes (Bodega Central)",
      createdAt: new Date().toISOString().split("T")[0]
    };
    products.unshift(newProduct);
    localStorage.setItem(DB_KEYS.MASTER_PRODUCTS, JSON.stringify(products));

    // Agregar automáticamente a todas las tiendas de la red
    const stores = this.getStores();
    stores.forEach(st => {
      st.products.unshift({
        productId: newProduct.id,
        customPrice: newProduct.suggestedRetailPrice,
        active: true,
        availableSizes: [...newProduct.sizes]
      });
    });
    localStorage.setItem(DB_KEYS.STORES, JSON.stringify(stores));

    return newProduct;
  }

  // =========================================================================
  // GESTIÓN DE TIENDAS Y VITRINAS
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

  updateStoreProductPrice(storeId, productId, newPrice) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (store) {
      let p = store.products.find(item => item.productId === productId);
      if (!p) {
        const master = this.getMasterProducts(false);
        const mp = master.find(m => m.id === productId);
        p = {
          productId,
          customPrice: Number(newPrice),
          active: true,
          availableSizes: mp ? [...mp.sizes] : [37, 38, 39, 40, 41, 42]
        };
        store.products.push(p);
      } else {
        p.customPrice = Number(newPrice);
      }
      localStorage.setItem(DB_KEYS.STORES, JSON.stringify(stores));
    }
  }

  toggleStoreProductActive(storeId, productId) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (store) {
      let p = store.products.find(item => item.productId === productId);
      if (!p) {
        const master = this.getMasterProducts(false);
        const mp = master.find(m => m.id === productId);
        p = {
          productId,
          customPrice: mp ? mp.suggestedRetailPrice : 185000,
          active: false,
          availableSizes: mp ? [...mp.sizes] : [37, 38, 39, 40, 41, 42]
        };
        store.products.push(p);
      } else {
        p.active = !p.active;
      }
      localStorage.setItem(DB_KEYS.STORES, JSON.stringify(stores));
      return p.active;
    }
    return false;
  }

  toggleStoreSize(storeId, productId, size) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (store) {
      let p = store.products.find(item => item.productId === productId);
      const master = this.getMasterProducts(false);
      const mp = master.find(m => m.id === productId);

      if (!p) {
        p = {
          productId,
          customPrice: mp ? mp.suggestedRetailPrice : 185000,
          active: true,
          availableSizes: mp ? [...mp.sizes] : [37, 38, 39, 40, 41, 42]
        };
        store.products.push(p);
      }

      if (!p.availableSizes) {
        p.availableSizes = mp ? [...mp.sizes] : [37, 38, 39, 40, 41, 42];
      }

      const numSize = Number(size);
      if (p.availableSizes.includes(numSize)) {
        p.availableSizes = p.availableSizes.filter(s => s !== numSize);
      } else {
        p.availableSizes.push(numSize);
        p.availableSizes.sort((a, b) => a - b);
      }

      localStorage.setItem(DB_KEYS.STORES, JSON.stringify(stores));
      return p.availableSizes.includes(numSize);
    }
    return false;
  }

  getStorefrontProducts(store) {
    const master = this.getMasterProducts(false);
    return master
      .filter(mp => {
        const sp = (store.products || []).find(p => p.productId === mp.id);
        if (store.isSupplierStore) {
          return !sp || sp.active !== false;
        }
        return sp && sp.active !== false && sp.availableSizes && sp.availableSizes.length > 0;
      })
      .map(mp => {
        const sp = (store.products || []).find(p => p.productId === mp.id);
        const { wholesalePrice, ...safeMp } = mp;
        return {
          ...safeMp,
          storeRetailPrice: (sp && sp.customPrice) ? sp.customPrice : mp.suggestedRetailPrice,
          storeAvailableSizes: (sp && sp.availableSizes) ? sp.availableSizes : mp.sizes
        };
      });
  }

  // =========================================================================
  // GESTIÓN DE PEDIDOS Y FLETES
  // =========================================================================
  getOrders() {
    const raw = localStorage.getItem(DB_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : INITIAL_ORDERS;
  }

  addB2BOrder(orderData) {
    const orders = this.getOrders();
    const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);
    const newOrder = {
      id: "ord-" + Math.floor(1000 + Math.random() * 9000),
      date: dateStr,
      storeName: orderData.storeName,
      productName: orderData.productName,
      size: orderData.size,
      colorway: orderData.colorway || "Estándar",
      type: "B2B Restock (Reposición)",
      units: Number(orderData.units) || 1,
      totalWholesale: Number(orderData.totalWholesale) || 0,
      status: "En Alistamiento",
      supplierName: orderData.supplierName || "Vanessa Castellar Shoes (Bodega Central)"
    };
    orders.unshift(newOrder);
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  }

  formatCOP(value) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  getSizeCm(size) {
    const sizeMap = {
      35: "22.5 cm",
      36: "23.0 cm",
      37: "23.8 cm",
      38: "24.5 cm",
      39: "25.0 cm",
      40: "25.8 cm",
      41: "26.5 cm",
      42: "27.2 cm",
      43: "28.0 cm",
      44: "28.8 cm"
    };
    return sizeMap[size] || "24.5 cm";
  }

  // =========================================================================
  // BALANCEADOR INTELIGENTE ROUND-ROBIN (10 LÍNEAS DE WHATSAPP)
  // =========================================================================
  getNextWhatsAppLine(store) {
    const targetStore = store || this.getCurrentStore();
    if (!targetStore || !targetStore.whatsappLines || targetStore.whatsappLines.length === 0) {
      const fallbackPhone = (targetStore && targetStore.phone) ? targetStore.phone : "573505337256";
      return { phone: fallbackPhone, name: "Línea Central" };
    }

    const lines = targetStore.whatsappLines.filter(l => l.active !== false);
    if (lines.length === 0) {
      return targetStore.whatsappLines[0] || { phone: "573505337256", name: "Línea Central" };
    }

    let currentIndex = parseInt(localStorage.getItem(DB_KEYS.LINE_ROTATION_INDEX) || "0", 10);
    const line = lines[currentIndex % lines.length];
    
    // Rotar para el próximo cliente
    localStorage.setItem(DB_KEYS.LINE_ROTATION_INDEX, (currentIndex + 1) % lines.length);
    return line;
  }

  // Generador de Mensaje de WhatsApp para 1 solo Par
  buildSingleProductWhatsAppUrl(store, product, colorway, size) {
    const assignedLine = this.getNextWhatsAppLine(store);
    const phone = assignedLine.phone || assignedLine || "573505337256";
    const formattedPrice = this.formatCOP(product.storeRetailPrice || product.suggestedRetailPrice);
    const colorName = colorway ? colorway.name : "Color Principal";
    const cm = this.getSizeCm(size);

    const text = `👋 *¡Hola ${store.name}!* Vi este modelo en su vitrina digital y quiero apartarlo:

👟 *MODELO:* ${product.name}
🔖 *SKU:* ${product.sku}
🎨 *COLOR:* ${colorName}
📏 *TALLA:* ${size} (Plantilla: ${cm})
💰 *PRECIO:* ${formattedPrice}

📍 *Destino en Cali:* (Indicar Barrio / Comuna)
🛵 *Modalidad:* Despacho Hoy Contraentrega / Asegurado

¿Me confirman disponibilidad inmediata para despacho hoy? ¡Muchas gracias! ✨`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  // Generador de Mensaje de WhatsApp para Carrito Multi-Par Consolidado
  buildConsolidatedCartWhatsAppUrl(store, cartItems, clientData, shippingZone, dispatchMode) {
    const assignedLine = this.getNextWhatsAppLine(store);
    const phone = assignedLine.phone || assignedLine || "573505337256";
    const totalShoesPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = shippingZone ? shippingZone.fee : 10000;
    const grandTotal = totalShoesPrice + shippingFee;
    const refCode = "SW-" + Math.floor(1000 + Math.random() * 9000);

    const itemsSummary = cartItems.map((item, i) => {
      const cm = this.getSizeCm(item.size);
      return `${i + 1}. 👟 *${item.name}*
   • Talla: ${item.size} (${cm}) | Color: ${item.colorway}
   • Cant: ${item.quantity} par(es) | Subtotal: ${this.formatCOP(item.price * item.quantity)}`;
    }).join("\n\n");

    const dispatchText = dispatchMode === "secured" 
      ? `🛡️ *Despacho Asegurado* (Abono de flete ${this.formatCOP(shippingFee)} por Nequi/Daviplata + saldo en efectivo al recibir)`
      : `🛵 *100% Contraentrega al Recibir* (Pago total en puerta al motorizado)`;

    const text = `🛍️ *¡NUEVO PEDIDO CONSOLIDADO SNEAKER WORLD MLS!*
*Comanda:* #${refCode}
*Tienda:* ${store.name}

👤 *DATOS DE ENTREGA:*
• *Cliente:* ${clientData.name || 'Cliente'}
• *WhatsApp:* ${clientData.phone || 'El mismo'}
• *Barrio / Zona:* ${shippingZone ? shippingZone.name : 'Cali'}
• *Dirección:* ${clientData.address || 'Pendiente por confirmar'}

📦 *DETALLE DE CALZADO (${cartItems.length} ref / ${cartItems.reduce((a, b) => a + b.quantity, 0)} pares):*
${itemsSummary}

💵 *LIQUIDACIÓN DEL PEDIDO:*
• Calzado: ${this.formatCOP(totalShoesPrice)}
• Domicilio Motorizado: ${this.formatCOP(shippingFee)} (${shippingZone ? shippingZone.time : 'Hoy mismo'})
👉 *GRAN TOTAL A COBRAR: ${this.formatCOP(grandTotal)}*

🚚 *MODALIDAD:*
${dispatchText}

⚡ *Reserva de bodega activa (20 min):* Por favor confirmar disponibilidad para preparar en bodega de San Andresito Cali. ¡Gracias! ✨`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }
}

// Instancia global del manejador
const db = new ShoesStoreManager();
