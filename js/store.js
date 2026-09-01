// Base de Datos Local y Manejador de Estado (SNEAKER WORLD MLS Cali - Bastion AI)

const DB_KEYS = {
  MASTER_PRODUCTS: "bastion_shoes_master_products_v6",
  STORES: "bastion_shoes_stores_v6",
  CURRENT_STORE_ID: "bastion_shoes_current_store_id_v6",
  ORDERS: "bastion_shoes_orders_v6"
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
      localStorage.setItem(DB_KEYS.CURRENT_STORE_ID, INITIAL_STORES[0].id);
    }
  }

  resetDemo() {
    localStorage.removeItem(DB_KEYS.MASTER_PRODUCTS);
    localStorage.removeItem(DB_KEYS.STORES);
    localStorage.removeItem(DB_KEYS.CURRENT_STORE_ID);
    localStorage.removeItem(DB_KEYS.ORDERS);
    this.init();
  }

  getMasterProducts() {
    return JSON.parse(localStorage.getItem(DB_KEYS.MASTER_PRODUCTS) || "[]");
  }

  addMasterProduct(productData) {
    const products = this.getMasterProducts();
    const newProduct = {
      id: "prod-snk-" + Date.now(),
      sku: productData.sku || "SNK-" + Math.floor(1000 + Math.random() * 9000),
      name: productData.name,
      category: productData.category || "Urbano Retro",
      tagline: productData.tagline || "Calzado urbano de alta calidad.",
      description: productData.description || "",
      image: productData.image || "assets/images/nike_initiator_bone_mocha.jpg",
      wholesalePrice: Number(productData.wholesalePrice) || 120000,
      suggestedRetailPrice: Number(productData.suggestedRetailPrice) || 195000,
      sizes: productData.sizes || [37, 38, 39, 40, 41, 42],
      colorways: productData.colorways || [
        { name: "Original", image: productData.image || "assets/images/nike_initiator_bone_mocha.jpg", sku: productData.sku || "SNK-01" }
      ],
      supplierId: "sup-001",
      supplierName: "Vanessa Castellar Shoes (Bodega Central)",
      createdAt: new Date().toISOString().split("T")[0]
    };
    products.unshift(newProduct);
    localStorage.setItem(DB_KEYS.MASTER_PRODUCTS, JSON.stringify(products));

    // Agregar automáticamente a las tiendas
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

  getStores() {
    return JSON.parse(localStorage.getItem(DB_KEYS.STORES) || "[]");
  }

  getCurrentStore() {
    const stores = this.getStores();
    const currentId = localStorage.getItem(DB_KEYS.CURRENT_STORE_ID);
    return stores.find(s => s.id === currentId) || stores[0];
  }

  setCurrentStoreId(storeId) {
    localStorage.setItem(DB_KEYS.CURRENT_STORE_ID, storeId);
  }

  updateStoreProfile(storeId, updatedFields) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (store) {
      Object.assign(store, updatedFields);
      localStorage.setItem(DB_KEYS.STORES, JSON.stringify(stores));
    }
  }

  toggleProductActive(storeId, productId) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (store) {
      const p = store.products.find(item => item.productId === productId);
      if (p) {
        p.active = !p.active;
        localStorage.setItem(DB_KEYS.STORES, JSON.stringify(stores));
      }
    }
  }

  updateStorePrice(storeId, productId, newPrice) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (store) {
      const p = store.products.find(item => item.productId === productId);
      if (p) {
        p.customPrice = Number(newPrice);
        localStorage.setItem(DB_KEYS.STORES, JSON.stringify(stores));
      }
    }
  }

  updateStoreSizes(storeId, productId, newSizes) {
    const stores = this.getStores();
    const store = stores.find(s => s.id === storeId);
    if (store) {
      const p = store.products.find(item => item.productId === productId);
      if (p) {
        p.availableSizes = newSizes;
        localStorage.setItem(DB_KEYS.STORES, JSON.stringify(stores));
      }
    }
  }

  getStorefrontProducts(store) {
    const master = this.getMasterProducts();
    return master
      .filter(mp => {
        const sp = store.products.find(p => p.productId === mp.id);
        return sp && sp.active && sp.availableSizes && sp.availableSizes.length > 0;
      })
      .map(mp => {
        const sp = store.products.find(p => p.productId === mp.id);
        return {
          ...mp,
          storeRetailPrice: sp.customPrice || mp.suggestedRetailPrice,
          storeAvailableSizes: sp.availableSizes || mp.sizes
        };
      });
  }

  getOrders() {
    return JSON.parse(localStorage.getItem(DB_KEYS.ORDERS) || "[]");
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
      size: orderData.size,
      colorway: orderData.colorway || "Estándar",
      type: "B2B Restock (Reposición)",
      units: Number(orderData.units) || 1,
      totalWholesale: Number(orderData.totalWholesale) || 0,
      status: "Pendiente En Bodega",
      supplierName: orderData.supplierName
    };
    orders.unshift(newOrder);
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  }

  formatCOP(amount) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(amount || 0);
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

  generateWhatsAppLink(store, product, checkoutData = {}) {
    const cleanPhone = (checkoutData.phone || store.phone || "573155551234").replace(/[^0-9]/g, "");
    const formattedPrice = this.formatCOP(product.storeRetailPrice || product.suggestedRetailPrice);
    const size = checkoutData.size || (product.storeAvailableSizes ? product.storeAvailableSizes[0] : 38);
    const cmSize = this.getSizeCm(size);
    const colorText = checkoutData.colorwayName ? `\n🎨 *Color:* ${checkoutData.colorwayName}` : "";

    const message = `👋 ¡Hola ${store.name}! Vi este modelo en su vitrina digital y quiero pedirlo:\n\n` +
      `👟 *Modelo:* ${product.name}\n` +
      `🔖 *Código SKU:* ${product.sku}` +
      colorText + `\n` +
      `📏 *Talla:* ${size} (Plantilla: ${cmSize})\n` +
      `💰 *Precio:* ${formattedPrice}\n\n` +
      `📍 *Ciudad:* Cali / Valle\n` +
      `¿Tienen disponibilidad para entrega / contraentrega hoy? ¡Muchas gracias!`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }

  generateSupplierRestockWhatsApp(supplierPhone, storeName, product, size, units) {
    const cleanPhone = (supplierPhone || "573155551234").replace(/[^0-9]/g, "");
    const total = this.formatCOP(product.wholesalePrice * units);

    const message = `📦 *ORDEN DE REPOSICIÓN B2B - SNEAKER WORLD MLS*\n\n` +
      `🏪 *Tienda Solicitante:* ${storeName}\n` +
      `👟 *Producto:* ${product.name}\n` +
      `🔖 *SKU:* ${product.sku}\n` +
      `📏 *Talla:* ${size}\n` +
      `🔢 *Cantidad:* ${units} pares\n` +
      `💵 *Total Mayorista:* ${total}\n\n` +
      `Solicitamos alistar para despacho en bodega de San Andresito Cali. ¡Gracias!`;

    const encoded = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encoded}`;
  }
}
