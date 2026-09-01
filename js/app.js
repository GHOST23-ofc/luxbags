// Controlador Principal de la Aplicación (SNEAKER WORLD MLS Cali - Bastion AI)

document.addEventListener("DOMContentLoaded", () => {
  const db = new ShoesStoreManager();

  // Estado reactivo de la aplicación
  let currentView = "storefront"; // storefront | store-admin | supplier | directory
  let activeBrandFilter = "all";
  let activeSizeFilter = "all";
  let activeCategoryFilter = "all";
  let activeSortOrder = "default";
  let searchQuery = "";
  let selectedModalProduct = null;
  let selectedModalSize = null;
  let selectedColorway = null;

  // Estado del Carrito Multi-Par
  let cartItems = [];
  let cartTimerInterval = null;
  let cartSecondsRemaining = 1200; // 20 minutos

  // Elementos DOM principales
  const roleTabs = document.querySelectorAll(".role-tab-btn");
  const viewPanels = document.querySelectorAll(".view-panel");
  const hudStoreSelect = document.getElementById("hud-store-select");
  const toastContainer = document.getElementById("toast-container");

  // =========================================================================
  // INICIALIZACIÓN
  // =========================================================================
  function initApp() {
    populateStoreDropdown();
    setupRoleSwitcher();
    setupFilters();
    setupModals();
    setupForms();
    setupRoiCalculator();
    renderCurrentView();
  }

  // =========================================================================
  // NAVEGACIÓN Y CAMBIO DE VISTAS (MULTI-ROL)
  // =========================================================================
  function setupRoleSwitcher() {
    roleTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const targetView = tab.dataset.view;
        switchView(targetView);
      });
    });

    document.getElementById("btn-reset-demo")?.addEventListener("click", () => {
      if (confirm("¿Deseas restaurar los 18 modelos maestros y tiendas a sus valores iniciales?")) {
        db.resetDemo();
        cartItems = [];
        renderCartUI();
        populateStoreDropdown();
        renderCurrentView();
        showToast("↺ Plataforma restaurada al estado original.");
      }
    });
  }

  function switchView(viewName) {
    currentView = viewName;
    roleTabs.forEach(t => t.classList.toggle("active", t.dataset.view === viewName));
    viewPanels.forEach(p => {
      p.style.display = (p.id === `view-${viewName}`) ? "block" : "none";
    });

    // Controlar visibilidad del selector de tiendas
    const storeSelectorBox = document.getElementById("store-selector-box");
    if (storeSelectorBox) {
      storeSelectorBox.style.display = (viewName === "supplier" || viewName === "directory") ? "none" : "flex";
    }

    renderCurrentView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function populateStoreDropdown() {
    const stores = db.getStores();
    const currentStore = db.getCurrentStore();
    hudStoreSelect.innerHTML = stores.map(st => `
      <option value="${st.id}" ${st.id === currentStore.id ? 'selected' : ''}>
        ${st.name} ${st.isSupplierStore ? '👑 (Bodega Matriz)' : ''}
      </option>
    `).join("");

    hudStoreSelect.onchange = (e) => {
      db.setCurrentStoreId(e.target.value);
      renderCurrentView();
    };
  }

  function renderCurrentView() {
    const currentStore = db.getCurrentStore();
    if (currentView === "storefront") {
      renderStorefront(currentStore);
    } else if (currentView === "store-admin") {
      renderStoreAdmin(currentStore);
    } else if (currentView === "supplier") {
      renderSupplierView();
    } else if (currentView === "directory") {
      renderDirectoryView();
    }
  }

  // =========================================================================
  // RENDER: VITRINA PÚBLICA (STOREFRONT)
  // =========================================================================
  function renderStorefront(store) {
    // 1. Header de la Tienda
    document.getElementById("storefront-name").innerHTML = `
      ${store.name} 
      <span class="badge-verified" id="storefront-badge">${store.isSupplierStore ? 'Bodega Matriz Verificada' : 'Tienda Aliada Verificada'}</span>
    `;
    document.getElementById("storefront-tagline").textContent = store.tagline || "Especialistas en calzado urbano de alta gama.";
    document.getElementById("storefront-location").textContent = store.neighborhood || "Cali, Colombia (⚡ Domicilios Hoy)";
    document.getElementById("storefront-avatar").textContent = store.name.substring(0, 2).toUpperCase();

    // 2. Botón de WhatsApp Directo en el Header
    const waDirect = document.getElementById("storefront-wa-direct");
    const cleanPhone = (store.phone || "573155551234").replace(/[^0-9]/g, "");
    const greetingMsg = encodeURIComponent(`👋 ¡Hola ${store.name}! Vi su vitrina digital y me gustaría recibir asesoría sobre modelos y tallas disponibles.`);
    waDirect.href = `https://wa.me/${cleanPhone}?text=${greetingMsg}`;

    // 3. Obtener Productos y Aplicar Filtros
    const products = db.getStorefrontProducts(store);

    let displayProducts = products.filter(p => {
      // Filtro de Marca
      if (activeBrandFilter !== "all") {
        const brandLower = p.name.toLowerCase();
        if (activeBrandFilter === "nike" && !brandLower.includes("nike") && !brandLower.includes("jordan") && !brandLower.includes("dunk")) return false;
        if (activeBrandFilter === "adidas" && !brandLower.includes("adidas") && !brandLower.includes("samba") && !brandLower.includes("superstar") && !brandLower.includes("supernova") && !brandLower.includes("response")) return false;
        if (activeBrandFilter === "on" && !brandLower.includes("on cloud")) return false;
        if (activeBrandFilter === "nb" && !brandLower.includes("new balance") && !brandLower.includes("9060")) return false;
        if (activeBrandFilter === "luxury" && !brandLower.includes("vuitton") && !brandLower.includes("boss") && !brandLower.includes("lv")) return false;
        if (activeBrandFilter === "skechers" && !brandLower.includes("skechers")) return false;
      }

      // Filtro de Talla
      if (activeSizeFilter !== "all") {
        const sizeNum = parseInt(activeSizeFilter, 10);
        if (!p.storeAvailableSizes.includes(sizeNum)) return false;
      }

      // Filtro de Categoría
      if (activeCategoryFilter !== "all" && p.category !== activeCategoryFilter) {
        return false;
      }

      // Filtro de Búsqueda por Texto
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        const matchesDesc = (p.description || "").toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesCat && !matchesDesc) return false;
      }

      return true;
    });

    // Ordenamiento
    if (activeSortOrder === "price-asc") {
      displayProducts.sort((a, b) => a.storeRetailPrice - b.storeRetailPrice);
    } else if (activeSortOrder === "price-desc") {
      displayProducts.sort((a, b) => b.storeRetailPrice - a.storeRetailPrice);
    } else if (activeSortOrder === "name-asc") {
      displayProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Actualizar badge de conteo
    document.getElementById("storefront-count-badge").textContent = `${displayProducts.length} modelos disponibles`;

    // Renderizar Grid de Tarjetas
    const grid = document.getElementById("storefront-products-grid");
    if (displayProducts.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <div style="font-size: 38px; margin-bottom: 12px;">👟</div>
          <h3 style="font-size: 18px; font-weight: 700; color: #ffffff;">No encontramos modelos con los filtros seleccionados</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 6px;">Prueba seleccionando otra talla o limpiando el buscador.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = displayProducts.map(p => {
      const formattedPrice = db.formatCOP(p.storeRetailPrice);
      const sizesChips = p.storeAvailableSizes.map(s => {
        const isMatch = activeSizeFilter !== "all" && parseInt(activeSizeFilter, 10) === s;
        return `<span class="size-mini-badge ${isMatch ? 'highlight' : ''}">${s}</span>`;
      }).join("");

      const colorwayCountBadge = (p.colorways && p.colorways.length > 1) 
        ? `<span class="category-tag" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.4); color: var(--accent-blue);">🎨 ${p.colorways.length} Colores</span>`
        : "";

      return `
        <div class="product-card" data-product-id="${p.id}" style="cursor: pointer;">
          <div class="product-image-box">
            <img src="${p.image}" alt="${p.name}" class="product-image" loading="lazy">
            <div class="product-badges">
              <span class="category-tag">${p.category}</span>
              ${colorwayCountBadge || `<span class="sku-tag">${p.sku}</span>`}
            </div>
          </div>
          <div class="product-body">
            <h3 class="product-name">${p.name}</h3>
            <p class="product-desc">${p.description}</p>
            
            <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">Tallas en stock:</div>
            <div class="product-sizes-chips">
              ${sizesChips}
            </div>

            <div class="product-footer">
              <div class="price-box">
                <span class="price-label">Precio Tienda</span>
                <span class="price-val">${formattedPrice}</span>
              </div>
              <button type="button" class="btn-card-wa btn-open-product-modal" data-product-id="${p.id}">
                <span>💬 Pedir</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Event listeners para abrir modal de producto al hacer clic en tarjeta o botón
    grid.querySelectorAll(".product-card").forEach(card => {
      card.addEventListener("click", (e) => {
        const prodId = card.dataset.productId;
        const prod = displayProducts.find(p => p.id === prodId);
        if (prod) openProductModal(store, prod);
      });
    });
  }

  // =========================================================================
  // RENDER: PANEL DE LA TIENDA (STORE ADMIN)
  // =========================================================================
  function renderStoreAdmin(store) {
    document.getElementById("admin-store-title").textContent = store.name;
    document.getElementById("stat-phone-preview").textContent = `+${store.phone}`;

    const masterProds = db.getMasterProducts();
    const activeCount = store.products.filter(p => p.active).length;
    document.getElementById("stat-active-prods").textContent = activeCount;

    // Calcular margen promedio
    let totalMargin = 0;
    let marginCount = 0;
    masterProds.forEach(mp => {
      const sp = store.products.find(p => p.productId === mp.id);
      if (sp && sp.active) {
        const price = sp.customPrice || mp.suggestedRetailPrice;
        totalMargin += (price - mp.wholesalePrice);
        marginCount++;
      }
    });

    const avgMargin = marginCount > 0 ? totalMargin / marginCount : 0;
    document.getElementById("stat-avg-margin").textContent = db.formatCOP(avgMargin);

    // Renderizar Tabla de Gestión
    const tbody = document.getElementById("store-admin-products-table");
    tbody.innerHTML = masterProds.map(mp => {
      const sp = store.products.find(p => p.productId === mp.id) || {
        active: false,
        customPrice: mp.suggestedRetailPrice,
        availableSizes: [...mp.sizes]
      };

      const margin = (sp.customPrice || mp.suggestedRetailPrice) - mp.wholesalePrice;
      const marginClass = margin >= 50000 ? "margin-high" : "margin-normal";

      return `
        <tr>
          <td>
            <div class="td-product-cell">
              <img src="${mp.image}" alt="${mp.name}" class="td-product-thumb">
              <div>
                <div class="td-product-name">${mp.name}</div>
                <div class="td-product-sku">SKU: ${mp.sku} · ${mp.category}</div>
              </div>
            </div>
          </td>
          <td><strong>${db.formatCOP(mp.wholesalePrice)}</strong></td>
          <td>
            <div style="display: flex; align-items: center; gap: 4px;">
              <span style="font-size: 11px; color: var(--text-muted);">$</span>
              <input type="number" class="table-input-price input-store-price" 
                data-prod-id="${mp.id}" 
                value="${sp.customPrice || mp.suggestedRetailPrice}" 
                step="5000" min="${mp.wholesalePrice}">
            </div>
          </td>
          <td>
            <span class="margin-badge ${marginClass}">+${db.formatCOP(margin)}</span>
          </td>
          <td>
            <div class="table-sizes-list">
              ${mp.sizes.map(s => {
                const isActive = (sp.availableSizes || []).includes(s);
                return `
                  <span class="table-size-tag ${isActive ? 'active' : 'inactive'} btn-toggle-size" 
                    data-prod-id="${mp.id}" data-size="${s}">
                    ${s}
                  </span>
                `;
              }).join("")}
            </div>
          </td>
          <td>
            <label class="switch-toggle">
              <input type="checkbox" class="input-toggle-active" data-prod-id="${mp.id}" ${sp.active ? 'checked' : ''}>
              <span class="slider-round"></span>
            </label>
          </td>
          <td>
            <button class="btn-action-sm btn-open-restock" data-prod-id="${mp.id}">
              📦 Pedir a Bodega
            </button>
          </td>
        </tr>
      `;
    }).join("");

    // Eventos de la tabla
    tbody.querySelectorAll(".input-store-price").forEach(input => {
      input.addEventListener("change", (e) => {
        const prodId = e.target.dataset.prodId;
        const newPrice = e.target.value;
        db.updateStorePrice(store.id, prodId, newPrice);
        showToast("💾 Precio de venta actualizado.");
        renderStoreAdmin(db.getCurrentStore());
      });
    });

    tbody.querySelectorAll(".input-toggle-active").forEach(toggle => {
      toggle.addEventListener("change", (e) => {
        const prodId = e.target.dataset.prodId;
        db.toggleProductActive(store.id, prodId);
        showToast("✨ Estado en vitrina modificado.");
        renderStoreAdmin(db.getCurrentStore());
      });
    });

    tbody.querySelectorAll(".btn-toggle-size").forEach(btn => {
      btn.addEventListener("click", () => {
        const prodId = btn.dataset.prodId;
        const sizeNum = parseInt(btn.dataset.size, 10);
        const sp = store.products.find(p => p.productId === prodId);
        if (sp) {
          let currentSizes = sp.availableSizes || [];
          if (currentSizes.includes(sizeNum)) {
            currentSizes = currentSizes.filter(s => s !== sizeNum);
          } else {
            currentSizes.push(sizeNum);
          }
          db.updateStoreSizes(store.id, prodId, currentSizes);
          renderStoreAdmin(db.getCurrentStore());
        }
      });
    });

    tbody.querySelectorAll(".btn-open-restock").forEach(btn => {
      btn.addEventListener("click", () => {
        const prodId = btn.dataset.prodId;
        const mp = db.getMasterProducts().find(p => p.id === prodId);
        if (mp) openRestockModal(store, mp);
      });
    });
  }

  // =========================================================================
  // RENDER: PANEL DEL PROVEEDOR / BODEGA CENTRAL (SUPPLIER)
  // =========================================================================
  function renderSupplierView() {
    const masterProds = db.getMasterProducts();
    const stores = db.getStores();

    document.getElementById("supplier-stat-refs").textContent = masterProds.length;
    document.getElementById("supplier-stat-stores").textContent = stores.length;

    const tbody = document.getElementById("supplier-products-table");
    tbody.innerHTML = masterProds.map(mp => {
      const colorwaysCount = (mp.colorways && mp.colorways.length > 0) ? mp.colorways.length : 1;
      return `
        <tr>
          <td>
            <div class="td-product-cell">
              <img src="${mp.image}" alt="${mp.name}" class="td-product-thumb">
              <div>
                <div class="td-product-name">${mp.name}</div>
                <div class="td-product-sku">Creado: ${mp.createdAt || '2026-09-01'}</div>
              </div>
            </div>
          </td>
          <td><span class="sku-tag">${mp.sku}</span></td>
          <td><span class="category-tag">${mp.category}</span></td>
          <td><strong style="color: #ffffff;">${db.formatCOP(mp.wholesalePrice)}</strong></td>
          <td><strong style="color: var(--accent-emerald);">${db.formatCOP(mp.suggestedRetailPrice)}</strong></td>
          <td>
            <div class="table-sizes-list">
              ${mp.sizes.map(s => `<span class="table-size-tag active">${s}</span>`).join("")}
            </div>
          </td>
          <td>
            <span class="category-tag" style="background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.4); color: var(--accent-blue);">
              🎨 ${colorwaysCount} colorway(s)
            </span>
          </td>
        </tr>
      `;
    }).join("");
  }

  // =========================================================================
  // RENDER: DIRECTORIO DE TIENDAS & CALCULADORA ROI
  // =========================================================================
  function renderDirectoryView() {
    const stores = db.getStores();
    const grid = document.getElementById("directory-stores-grid");

    grid.innerHTML = stores.map(st => {
      const activeCount = st.products.filter(p => p.active).length;
      return `
        <div class="store-directory-card">
          <div class="store-card-header">
            <div class="store-card-avatar">${st.name.substring(0, 2).toUpperCase()}</div>
            <div>
              <div class="store-card-title">${st.name}</div>
              <div class="store-card-location">📍 ${st.neighborhood || 'Cali, Colombia'}</div>
            </div>
          </div>
          <p class="store-card-body">${st.tagline || 'Especialistas en calzado urbano de alta gama.'}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 14px; border-top: 1px solid var(--border-subtle);">
            <span style="font-size: 12px; color: var(--primary-gold); font-weight: 600;">${activeCount} modelos en vitrina</span>
            <button class="btn-primary btn-visit-store" data-store-id="${st.id}" style="padding: 6px 14px; font-size: 12px;">
              Ver Vitrina →
            </button>
          </div>
        </div>
      `;
    }).join("");

    grid.querySelectorAll(".btn-visit-store").forEach(btn => {
      btn.addEventListener("click", () => {
        const storeId = btn.dataset.storeId;
        db.setCurrentStoreId(storeId);
        populateStoreDropdown();
        switchView("storefront");
      });
    });
  }

  function setupRoiCalculator() {
    const sliderPairs = document.getElementById("roi-slider-pairs");
    const sliderMargin = document.getElementById("roi-slider-margin");
    const pairsLabel = document.getElementById("roi-pairs-label");
    const marginLabel = document.getElementById("roi-margin-label");
    const totalProfit = document.getElementById("roi-total-profit");

    if (!sliderPairs || !sliderMargin) return;

    const updateCalc = () => {
      const pairs = parseInt(sliderPairs.value, 10);
      const margin = parseInt(sliderMargin.value, 10);
      const profit = pairs * margin;

      pairsLabel.textContent = `${pairs} pares`;
      marginLabel.textContent = `${db.formatCOP(margin)} COP`;
      totalProfit.textContent = `${db.formatCOP(profit)} COP`;
    };

    sliderPairs.addEventListener("input", updateCalc);
    sliderMargin.addEventListener("input", updateCalc);
    updateCalc();
  }

  // =========================================================================
  // MOTOR DE CARRITO FLOTANTE Y PEDIDO MULTI-PAR (CALI CONSOLIDADO)
  // =========================================================================
  function initCartNeighborhoods() {
    const select = document.getElementById("cart-neighborhood-select");
    if (!select) return;

    select.innerHTML = CALI_NEIGHBORHOODS.map((n, idx) => `
      <option value="${idx}" data-fee="${n.fee}">${n.name} — ${db.formatCOP(n.fee)} (${n.time})</option>
    `).join("");

    select.addEventListener("change", () => {
      renderCartUI();
    });

    const radSecured = document.querySelector('input[name="cart-dispatch-mode"][value="secured"]');
    const radCod = document.querySelector('input[name="cart-dispatch-mode"][value="cod"]');
    const labelSecured = document.getElementById("label-dispatch-secured");
    const labelCod = document.getElementById("label-dispatch-cod");

    radSecured?.addEventListener("change", () => {
      labelSecured?.classList.add("selected");
      labelCod?.classList.remove("selected");
      renderCartUI();
    });

    radCod?.addEventListener("change", () => {
      labelCod?.classList.add("selected");
      labelSecured?.classList.remove("selected");
      renderCartUI();
    });
  }

  function getSelectedShippingInfo() {
    const select = document.getElementById("cart-neighborhood-select");
    const idx = select ? parseInt(select.value, 10) : 0;
    const neighborhood = CALI_NEIGHBORHOODS[idx] || CALI_NEIGHBORHOODS[0];
    const isSecured = document.querySelector('input[name="cart-dispatch-mode"]:checked')?.value === "secured";
    return {
      neighborhood: neighborhood.name,
      zone: neighborhood.zone,
      fee: neighborhood.fee,
      time: neighborhood.time,
      isSecured: isSecured
    };
  }

  function addToCart(product, size, colorway = null) {
    if (!size) {
      showToast("⚠️ Por favor selecciona una talla antes de agregar al pedido.", "warning");
      return false;
    }

    const price = product.storeRetailPrice || product.suggestedRetailPrice;
    const colorName = colorway ? colorway.name : "Estándar Original";
    const image = colorway ? colorway.image : product.image;
    const sku = colorway ? colorway.sku : product.sku;

    const existingIndex = cartItems.findIndex(item => 
      item.productId === product.id && item.size === size && item.colorwayName === colorName
    );

    if (existingIndex > -1) {
      cartItems[existingIndex].quantity += 1;
    } else {
      cartItems.push({
        id: "cart-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
        productId: product.id,
        name: product.name,
        category: product.category,
        sku: sku,
        image: image,
        size: size,
        sizeCm: db.getSizeCm(size),
        colorwayName: colorName,
        price: price,
        quantity: 1
      });
    }

    renderCartUI();
    showToast(`✅ ${product.name} (Talla ${size}) agregado a tu pedido.`);
    return true;
  }

  function removeFromCart(index) {
    if (cartItems[index]) {
      const removed = cartItems.splice(index, 1);
      renderCartUI();
      showToast(`🗑️ ${removed[0].name} removido del pedido.`);
    }
  }

  function updateCartQuantity(index, delta) {
    if (cartItems[index]) {
      cartItems[index].quantity += delta;
      if (cartItems[index].quantity <= 0) {
        removeFromCart(index);
      } else {
        renderCartUI();
      }
    }
  }

  function renderCartUI() {
    const totalPairs = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalShoesPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingInfo = getSelectedShippingInfo();
    const grandTotal = totalShoesPrice + (totalPairs > 0 ? shippingInfo.fee : 0);

    const floatingBar = document.getElementById("floating-cart-bar");
    const floatingCount = document.getElementById("floating-cart-count");
    const floatingTotal = document.getElementById("floating-cart-total");

    if (floatingBar && floatingCount && floatingTotal) {
      floatingCount.textContent = totalPairs;
      floatingTotal.textContent = db.formatCOP(grandTotal);
      if (totalPairs > 0) {
        floatingBar.classList.add("visible");
      } else {
        floatingBar.classList.remove("visible");
      }
    }

    const drawerCount = document.getElementById("cart-drawer-count");
    const drawerItems = document.getElementById("cart-drawer-items");
    const summaryQty = document.getElementById("cart-summary-qty");
    const summaryShoes = document.getElementById("cart-summary-shoes");
    const summaryShipping = document.getElementById("cart-summary-shipping");
    const summaryTotal = document.getElementById("cart-summary-total");
    const fletePreview = document.getElementById("cart-flete-preview");

    if (drawerCount) drawerCount.textContent = totalPairs;
    if (summaryQty) summaryQty.textContent = totalPairs;
    if (summaryShoes) summaryShoes.textContent = db.formatCOP(totalShoesPrice);
    if (summaryShipping) summaryShipping.textContent = db.formatCOP(shippingInfo.fee);
    if (summaryTotal) summaryTotal.textContent = db.formatCOP(grandTotal);
    if (fletePreview) fletePreview.textContent = db.formatCOP(shippingInfo.fee);

    if (drawerItems) {
      if (cartItems.length === 0) {
        drawerItems.innerHTML = `
          <div style="text-align: center; padding: 30px 10px; color: var(--text-muted);">
            <div style="font-size: 32px; margin-bottom: 8px;">🛒</div>
            <div style="font-size: 14px; font-weight: 700; color: #fff;">Tu bolsa de pedido está vacía</div>
            <div style="font-size: 12px; margin-top: 4px;">Selecciona tus modelos favoritos y tallas en el catálogo.</div>
          </div>
        `;
      } else {
        drawerItems.innerHTML = cartItems.map((item, idx) => `
          <div class="cart-item-row">
            <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
            <div class="cart-item-info">
              <div class="cart-item-title">${item.name}</div>
              <div class="cart-item-meta">
                <span>📏 Talla: <strong>${item.size}</strong> (${item.sizeCm})</span>
                ${item.colorwayName !== 'Estándar Original' ? ` · <span>🎨 ${item.colorwayName}</span>` : ''}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                <div class="cart-item-price">${db.formatCOP(item.price * item.quantity)}</div>
                <div style="display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.5); border-radius: var(--radius-full); padding: 2px 8px;">
                  <button type="button" class="btn-cart-qty" data-idx="${idx}" data-delta="-1" style="background:none; border:none; color:#fff; font-size:14px; cursor:pointer; padding:0 4px;">-</button>
                  <span style="font-size: 12px; font-weight: 800; color: #fff; min-width: 14px; text-align: center;">${item.quantity}</span>
                  <button type="button" class="btn-cart-qty" data-idx="${idx}" data-delta="1" style="background:none; border:none; color:#fff; font-size:14px; cursor:pointer; padding:0 4px;">+</button>
                </div>
              </div>
            </div>
            <button type="button" class="cart-item-remove btn-cart-remove" data-idx="${idx}" title="Eliminar par">✕</button>
          </div>
        `).join("");

        drawerItems.querySelectorAll(".btn-cart-qty").forEach(btn => {
          btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.idx, 10);
            const delta = parseInt(btn.dataset.delta, 10);
            updateCartQuantity(idx, delta);
          });
        });

        drawerItems.querySelectorAll(".btn-cart-remove").forEach(btn => {
          btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.idx, 10);
            removeFromCart(idx);
          });
        });
      }
    }
  }

  function startCartTimer() {
    if (cartTimerInterval) clearInterval(cartTimerInterval);
    cartSecondsRemaining = 1200; // 20 min

    const timerEl = document.getElementById("cart-timer-countdown");
    const updateDisplay = () => {
      if (!timerEl) return;
      const mins = Math.floor(cartSecondsRemaining / 60);
      const secs = cartSecondsRemaining % 60;
      timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      if (cartSecondsRemaining <= 0) {
        clearInterval(cartTimerInterval);
        timerEl.textContent = "00:00 (Expirado)";
      } else {
        cartSecondsRemaining--;
      }
    };

    updateDisplay();
    cartTimerInterval = setInterval(updateDisplay, 1000);
  }

  function sendCartWhatsAppOrder(store) {
    if (cartItems.length === 0) {
      showToast("⚠️ Tu pedido está vacío. Agrega al menos 1 par.", "warning");
      return;
    }

    const clientName = document.getElementById("cart-client-name")?.value.trim() || "Cliente";
    const clientAddress = document.getElementById("cart-client-address")?.value.trim() || "Dirección por coordinar";
    const shippingInfo = getSelectedShippingInfo();
    const cleanPhone = (store.phone || "573155551234").replace(/[^0-9]/g, "");
    const orderId = "#VC-" + Math.floor(1000 + Math.random() * 9000);

    const totalPairs = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalShoesPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const grandTotal = totalShoesPrice + shippingInfo.fee;

    let itemsListText = cartItems.map((item, idx) => {
      const colorText = item.colorwayName !== 'Estándar Original' ? ` | 🎨 Color: ${item.colorwayName}` : "";
      return `👟 *ITEM ${idx + 1}:* ${item.name}\n` +
             `📏 *Talla:* ${item.size} (Plantilla: ${item.sizeCm})${colorText}\n` +
             `🔢 *Cantidad:* ${item.quantity} par(es) · *Subtotal:* ${db.formatCOP(item.price * item.quantity)}`;
    }).join("\n\n");

    let message = "";
    if (shippingInfo.isSecured) {
      message = `👋 ¡Hola ${store.name}! Acabo de armar mi pedido de ${totalPairs} par(es) en la vitrina digital:\n\n` +
        itemsListText + `\n\n` +
        `📍 *Destino en Cali:* ${shippingInfo.neighborhood}\n` +
        `📌 *Dirección:* ${clientAddress}\n` +
        `👤 *Destinatario:* ${clientName}\n\n` +
        `💳 *Liquidación del Pedido:* \n` +
        `• Calzado (${totalPairs} pares): ${db.formatCOP(totalShoesPrice)}\n` +
        `• Domicilio Motorizado (${shippingInfo.time}): ${db.formatCOP(shippingInfo.fee)}\n` +
        `• Modalidad: *Despacho Asegurado* (Flete adelantado por Nequi/Daviplata)\n` +
        `📎 Adjunto comprobante del flete (${db.formatCOP(shippingInfo.fee)}).\n\n` +
        `💵 *Total a cancelar al recibir en puerta:* ${db.formatCOP(totalShoesPrice)}\n` +
        `🆔 *Referencia de Reserva:* ${orderId}\n` +
        `Quedo atento a la confirmación de la ruta. ¡Muchas gracias!`;
    } else {
      message = `👋 ¡Hola ${store.name}! Acabo de solicitar mi pedido de ${totalPairs} par(es) contraentrega en la vitrina digital:\n\n` +
        itemsListText + `\n\n` +
        `📍 *Destino en Cali:* ${shippingInfo.neighborhood}\n` +
        `📌 *Dirección:* ${clientAddress}\n` +
        `👤 *Destinatario:* ${clientName}\n\n` +
        `💳 *Liquidación del Pedido:* \n` +
        `• Calzado (${totalPairs} pares): ${db.formatCOP(totalShoesPrice)}\n` +
        `• Domicilio Motorizado (${shippingInfo.time}): ${db.formatCOP(shippingInfo.fee)}\n` +
        `💵 *Total a pagar al mensajero al recibir:* ${db.formatCOP(grandTotal)}\n` +
        `🆔 *Referencia de Reserva:* ${orderId}\n` +
        `Quedo atento a la llamada de confirmación para despacho hoy.`;
    }

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(waUrl, "_blank");

    showToast("🎉 ¡Pedido enviado a WhatsApp! Tu asesora te atenderá en segundos.");
    document.getElementById("modal-cart-drawer").classList.remove("open");
  }

  // =========================================================================
  // MODALES & FORMULARIOS
  // =========================================================================
  function setupModals() {
    document.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.close;
        const modal = document.getElementById(targetId);
        if (modal) modal.classList.remove("open");
      });
    });

    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) backdrop.classList.remove("open");
      });
    });

    // Cerrar modal con tecla Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-backdrop.open").forEach(m => m.classList.remove("open"));
      }
    });

    document.getElementById("btn-open-new-product-modal")?.addEventListener("click", () => {
      document.getElementById("modal-new-product").classList.add("open");
    });

    document.getElementById("btn-open-store-settings")?.addEventListener("click", () => {
      const store = db.getCurrentStore();
      document.getElementById("setting-store-name").value = store.name;
      document.getElementById("setting-store-tagline").value = store.tagline || "";
      document.getElementById("setting-store-phone").value = store.phone || "";
      document.getElementById("setting-store-location").value = store.neighborhood || "";
      document.getElementById("modal-store-settings").classList.add("open");
    });

    document.getElementById("floating-cart-bar")?.addEventListener("click", () => {
      renderCartUI();
      startCartTimer();
      document.getElementById("modal-cart-drawer").classList.add("open");
    });

    document.getElementById("cart-btn-send-whatsapp")?.addEventListener("click", () => {
      sendCartWhatsAppOrder(db.getCurrentStore());
    });

    initCartNeighborhoods();

    document.querySelectorAll(".btn-curve-preset").forEach(btn => {
      btn.addEventListener("click", () => {
        const curve = btn.dataset.curve;
        const checkboxes = document.querySelectorAll("#new-prod-sizes-group input[type='checkbox']");
        
        let activeSizes = [];
        if (curve === "dama") activeSizes = [35, 36, 37, 38, 39];
        else if (curve === "caballero") activeSizes = [38, 39, 40, 41, 42, 43, 44];
        else if (curve === "unisex") activeSizes = [36, 37, 38, 39, 40, 41, 42, 43];

        checkboxes.forEach(cb => {
          cb.checked = activeSizes.includes(parseInt(cb.value, 10));
        });
      });
    });
  }

  function openProductModal(store, product) {
    selectedModalProduct = product;
    selectedModalSize = (activeSizeFilter !== "all" && product.storeAvailableSizes.includes(parseInt(activeSizeFilter, 10)))
      ? parseInt(activeSizeFilter, 10)
      : product.storeAvailableSizes[0];

    selectedColorway = (product.colorways && product.colorways.length > 0) ? product.colorways[0] : null;

    document.getElementById("modal-prod-img").src = selectedColorway ? selectedColorway.image : product.image;
    document.getElementById("modal-prod-name").textContent = product.name;
    document.getElementById("modal-prod-sku").textContent = `SKU: ${selectedColorway ? selectedColorway.sku : product.sku} · ${product.category}`;
    document.getElementById("modal-prod-desc").textContent = product.description;
    document.getElementById("modal-prod-cat").textContent = product.category;
    document.getElementById("modal-prod-price").textContent = db.formatCOP(product.storeRetailPrice);
    document.getElementById("modal-size-error").style.display = "none";
    document.getElementById("modal-size-cm-badge").textContent = `📏 Plantilla: ${db.getSizeCm(selectedModalSize)}`;

    // 1. Variantes de Color
    const colorGroup = document.getElementById("modal-colorway-group");
    const colorSelector = document.getElementById("modal-colorway-selector");

    if (product.colorways && product.colorways.length > 1) {
      colorGroup.style.display = "block";
      colorSelector.innerHTML = product.colorways.map((cw, idx) => `
        <button type="button" class="colorway-badge-chip modal-cw-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
          <span class="colorway-dot"></span>
          <span>${cw.name}</span>
        </button>
      `).join("");

      colorSelector.querySelectorAll(".modal-cw-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          colorSelector.querySelectorAll(".modal-cw-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const idx = parseInt(btn.dataset.idx, 10);
          selectedColorway = product.colorways[idx];
          
          const img = document.getElementById("modal-prod-img");
          img.style.opacity = "0.4";
          setTimeout(() => {
            img.src = selectedColorway.image;
            img.style.opacity = "1";
          }, 150);

          document.getElementById("modal-prod-sku").textContent = `SKU: ${selectedColorway.sku} · ${product.category}`;
          updateModalWhatsAppLink(store, product);
        });
      });
    } else {
      colorGroup.style.display = "none";
    }

    // 2. Selector de tallas
    const sizesContainer = document.getElementById("modal-size-selector");
    sizesContainer.innerHTML = product.storeAvailableSizes.map(s => `
      <button type="button" class="size-pill-btn modal-size-btn ${selectedModalSize === s ? 'active' : ''}" data-size="${s}">
        ${s}
      </button>
    `).join("");

    updateModalWhatsAppLink(store, product);

    sizesContainer.querySelectorAll(".modal-size-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        sizesContainer.querySelectorAll(".modal-size-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        selectedModalSize = parseInt(btn.dataset.size, 10);
        document.getElementById("modal-size-error").style.display = "none";
        document.getElementById("modal-size-cm-badge").textContent = `📏 Plantilla: ${db.getSizeCm(selectedModalSize)}`;
        updateModalWhatsAppLink(store, product);
      });
    });

    const btnAddCart = document.getElementById("modal-btn-add-cart");
    if (btnAddCart) {
      btnAddCart.onclick = () => {
        const added = addToCart(product, selectedModalSize, selectedColorway);
        if (added) {
          document.getElementById("modal-product-detail").classList.remove("open");
        }
      };
    }

    document.getElementById("modal-btn-wa-order").onclick = (e) => {
      if (!selectedModalSize) {
        e.preventDefault();
        document.getElementById("modal-size-error").style.display = "block";
      }
    };

    document.getElementById("modal-product-detail").classList.add("open");
  }

  function updateModalWhatsAppLink(store, product) {
    const waBtn = document.getElementById("modal-btn-wa-order");
    const colorName = selectedColorway ? selectedColorway.name : null;
    waBtn.href = db.generateWhatsAppLink(store, product, {
      size: selectedModalSize,
      colorwayName: colorName,
      phone: store.phone
    });
  }

  function openRestockModal(store, product) {
    document.getElementById("restock-prod-id").value = product.id;
    document.getElementById("restock-prod-title").textContent = `${product.name} (SKU: ${product.sku})`;
    document.getElementById("restock-supplier-name").textContent = `Bodega: ${product.supplierName}`;
    document.getElementById("restock-wholesale-price").textContent = `Costo Mayorista: ${db.formatCOP(product.wholesalePrice)} COP / par`;

    const sizeSelect = document.getElementById("restock-size-select");
    sizeSelect.innerHTML = product.sizes.map(s => `<option value="${s}">Talla ${s}</option>`).join("");

    const unitsInput = document.getElementById("restock-units-input");
    const calcTotal = () => {
      const units = Number(unitsInput.value) || 1;
      document.getElementById("restock-total-calc").textContent = db.formatCOP(product.wholesalePrice * units);
    };

    unitsInput.oninput = calcTotal;
    calcTotal();

    document.getElementById("modal-restock").classList.add("open");
  }

  // =========================================================================
  // FILTROS Y EVENTOS
  // =========================================================================
  function setupFilters() {
    const brandBar = document.getElementById("brand-filter-bar");
    if (brandBar) {
      brandBar.querySelectorAll(".brand-chip-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          brandBar.querySelectorAll(".brand-chip-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          activeBrandFilter = btn.dataset.brand;
          renderStorefront(db.getCurrentStore());
        });
      });
    }

    const sizePillsContainer = document.getElementById("storefront-size-pills");
    sizePillsContainer.querySelectorAll(".size-pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        sizePillsContainer.querySelectorAll(".size-pill-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeSizeFilter = btn.dataset.size;
        renderStorefront(db.getCurrentStore());
      });
    });

    document.getElementById("storefront-search-input").addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderStorefront(db.getCurrentStore());
    });

    document.getElementById("storefront-category-select").addEventListener("change", (e) => {
      activeCategoryFilter = e.target.value;
      renderStorefront(db.getCurrentStore());
    });

    document.getElementById("storefront-sort-select").addEventListener("change", (e) => {
      activeSortOrder = e.target.value;
      renderStorefront(db.getCurrentStore());
    });
  }

  function setupForms() {
    document.getElementById("form-new-master-product").addEventListener("submit", (e) => {
      e.preventDefault();
      const sizesGroup = document.getElementById("new-prod-sizes-group");
      const selectedSizes = Array.from(sizesGroup.querySelectorAll("input:checked")).map(cb => parseInt(cb.value, 10));

      const newProd = db.addMasterProduct({
        name: document.getElementById("new-prod-name").value,
        sku: document.getElementById("new-prod-sku").value,
        category: document.getElementById("new-prod-category").value,
        image: document.getElementById("new-prod-image").value,
        wholesalePrice: Number(document.getElementById("new-prod-wholesale").value),
        suggestedRetailPrice: Number(document.getElementById("new-prod-suggested").value),
        description: document.getElementById("new-prod-desc").value,
        sizes: selectedSizes.length > 0 ? selectedSizes : [37, 38, 39, 40, 41, 42]
      });

      document.getElementById("modal-new-product").classList.remove("open");
      e.target.reset();
      showToast(`✨ ¡Referencia "${newProd.name}" publicada al Catálogo Maestro!`);
      renderCurrentView();
    });

    document.getElementById("form-store-settings").addEventListener("submit", (e) => {
      e.preventDefault();
      const currentStore = db.getCurrentStore();
      db.updateStoreProfile(currentStore.id, {
        name: document.getElementById("setting-store-name").value,
        tagline: document.getElementById("setting-store-tagline").value,
        phone: document.getElementById("setting-store-phone").value,
        neighborhood: document.getElementById("setting-store-location").value
      });

      document.getElementById("modal-store-settings").classList.remove("open");
      populateStoreDropdown();
      showToast("✅ Configuración de tienda guardada exitosamente");
      renderCurrentView();
    });

    document.getElementById("form-restock-order").addEventListener("submit", (e) => {
      e.preventDefault();
      const store = db.getCurrentStore();
      const prodId = document.getElementById("restock-prod-id").value;
      const mp = db.getMasterProducts().find(p => p.id === prodId);
      const size = parseInt(document.getElementById("restock-size-select").value, 10);
      const units = Number(document.getElementById("restock-units-input").value) || 1;

      if (mp) {
        db.createB2BOrder({
          storeName: store.name,
          productName: mp.name,
          size: size,
          units: units,
          totalWholesale: mp.wholesalePrice * units,
          supplierName: mp.supplierName
        });

        document.getElementById("modal-restock").classList.remove("open");
        showToast(`📦 Pedido de ${units} pares generado para ${mp.supplierName}`);
        
        const restockUrl = db.generateSupplierRestockWhatsApp("573155551234", store.name, mp, size, units);
        window.open(restockUrl, "_blank");
      }
    });
  }

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>${type === 'warning' ? '⚠️' : '✨'}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Arrancar Aplicación
  initApp();
});
