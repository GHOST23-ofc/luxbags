// =========================================================================
// LUXBAGS MLS COLOMBIA - APLICACIÓN PRINCIPAL (Bastion AI)
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Estado Global de la Interfaz
  let currentView = "storefront";
  let activeBrandFilter = "all";
  let activeSizeFilter = "all";
  let activeColorFilter = "all";
  let activeCategoryFilter = "all";
  let searchQuery = "";
  let activeSortOrder = "default";

  // Estado del Carrito Multi-Bolso
  let cartItems = [];
  try {
    const savedCart = localStorage.getItem("luxbags_cart_items_v9");
    if (savedCart) cartItems = JSON.parse(savedCart);
  } catch (e) {
    cartItems = [];
  }

  // Estado del Modal de Producto Activo
  let selectedModalProduct = null;
  let selectedModalColorway = null;
  let selectedModalQty = 1;

  // Temporizador de Reserva (20:00 min)
  let reservationTimeLeft = 20 * 60;
  let timerInterval = null;

  // =========================================================================
  // INICIALIZACIÓN DE LA APLICACIÓN
  // =========================================================================
  function initApp() {
    setupRoleSwitcher();
    setupStoreSelector();
    setupFilters();
    setupModals();
    setupCartDrawer();
    setupSupplierFastImporter();
    setupROISimulator();
    startReservationTimer();
    initBlackHoleCanvas();

    // Renderizar vista inicial
    renderCurrentView();
    updateFloatingCartBar();
  }

  // =========================================================================
  // CANVAS BACKGROUND INTERACTIVO (MODO OSCURO COSMIC LUXURY)
  // =========================================================================
  function initBlackHoleCanvas() {
    const canvas = document.getElementById("black-hole-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 55;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        color: Math.random() > 0.5 ? "rgba(227, 194, 116, 0.4)" : "rgba(244, 114, 182, 0.3)"
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Subtle center glow
      const grad = ctx.createRadialGradient(width / 2, height * 0.3, 20, width / 2, height * 0.3, width * 0.7);
      grad.addColorStop(0, "rgba(227, 194, 116, 0.04)");
      grad.addColorStop(0.5, "rgba(230, 25, 46, 0.02)");
      grad.addColorStop(1, "rgba(8, 9, 13, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }
    animate();
  }

  // =========================================================================
  // NAVEGACIÓN ENTRE ROLES (HUD TABS)
  // =========================================================================
  function setupRoleSwitcher() {
    const tabButtons = document.querySelectorAll(".role-tab-btn");
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const targetView = btn.dataset.view;
        currentView = targetView;

        // Ocultar todos los paneles principales
        document.querySelectorAll(".view-panel").forEach(panel => {
          panel.style.display = "none";
        });

        // Mostrar el panel correspondiente
        const activePanel = document.getElementById(`view-${targetView}`);
        if (activePanel) {
          activePanel.style.display = "block";
          window.scrollTo({ top: 0, behavior: "smooth" });
        }

        renderCurrentView();
      });
    });
  }

  // =========================================================================
  // SELECTOR DE TIENDA / VITRINA EN HUD
  // =========================================================================
  function setupStoreSelector() {
    const hudStoreSelect = document.getElementById("hud-store-select");
    const stores = db.getStores();
    const currentStore = db.getCurrentStore();

    hudStoreSelect.innerHTML = stores.map(s => {
      return `<option value="${s.id}" ${s.id === currentStore.id ? 'selected' : ''}>${s.name} (${s.isSupplierStore ? 'Bodega' : 'Boutique'})</option>`;
    }).join("");

    hudStoreSelect.onchange = (e) => {
      db.setCurrentStoreId(e.target.value);
      renderCurrentView();
    };

    // Botón de reset de datos de ejemplo
    document.getElementById("btn-reset-demo")?.addEventListener("click", () => {
      if (confirm("¿Restaurar el catálogo oficial de LUXBAGS Colombia a los valores iniciales?")) {
        db.resetDemo();
        cartItems = [];
        localStorage.removeItem("luxbags_cart_items_v9");
        setupStoreSelector();
        renderCurrentView();
        updateFloatingCartBar();
        showToast("↺ Datos oficiales de LUXBAGS restaurados.");
      }
    });
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
      <span class="badge-verified" id="storefront-badge">${store.isSupplierStore ? 'Bodega Matriz Verificada' : 'Boutique Aliada Verificada'}</span>
    `;
    document.getElementById("storefront-tagline").textContent = store.tagline || "Bolsos, Carteras y Accesorios Importados con Envíos Contraentrega.";
    document.getElementById("storefront-location").textContent = store.neighborhood || "Colombia (⚡ Domicilios y Envíos Hoy)";

    // 2. Botón de WhatsApp Directo en el Header
    const waDirect = document.getElementById("storefront-wa-direct");
    const cleanPhone = (store.phone || "573155551234").replace(/[^0-9]/g, "");
    const greetingMsg = encodeURIComponent(`👋 ¡Hola ${store.name}! Vi su vitrina de bolsos y carteras y me gustaría recibir asesoría sobre referencias y colores disponibles.`);
    waDirect.href = `https://wa.me/${cleanPhone}?text=${greetingMsg}`;

    // 3. Obtener Productos y Aplicar Filtros
    const products = db.getStorefrontProducts(store);

    let displayProducts = products.filter(p => {
      // Filtro de Categoría / Drop
      if (activeBrandFilter !== "all") {
        const cat = p.category.toLowerCase();
        const name = p.name.toLowerCase();
        if (activeBrandFilter === "amor" && !name.includes("amor") && !name.includes("horse") && !name.includes("charm")) return false;
        if (activeBrandFilter === "totes" && !cat.includes("tote")) return false;
        if (activeBrandFilter === "crossbody" && !cat.includes("crossbody") && !cat.includes("flap")) return false;
        if (activeBrandFilter === "satchel" && !cat.includes("satchel") && !cat.includes("padlock")) return false;
        if (activeBrandFilter === "morrales" && !cat.includes("morral") && !cat.includes("mochila")) return false;
        if (activeBrandFilter === "billeteras" && !cat.includes("billetera") && !cat.includes("clutch")) return false;
      }

      // Filtro por Tamaño / Capacidad
      if (activeSizeFilter !== "all") {
        const sizeCat = (p.sizeCategory || "").toLowerCase();
        if (activeSizeFilter === "compacto" && !sizeCat.includes("compacto")) return false;
        if (activeSizeFilter === "mediano" && !sizeCat.includes("mediano")) return false;
        if (activeSizeFilter === "maxi" && !sizeCat.includes("maxi")) return false;
      }

      // Filtro por Colorway
      if (activeColorFilter !== "all") {
        const colors = (p.colorways || []).map(c => c.name.toLowerCase()).join(" ");
        if (activeColorFilter === "negro" && !colors.includes("negro") && !colors.includes("noir") && !colors.includes("black")) return false;
        if (activeColorFilter === "crema" && !colors.includes("crema") && !colors.includes("hueso") && !colors.includes("bicolor") && !colors.includes("blanco") && !colors.includes("beige")) return false;
        if (activeColorFilter === "camel" && !colors.includes("camel") && !colors.includes("miel")) return false;
        if (activeColorFilter === "rosa" && !colors.includes("rosa") && !colors.includes("blush")) return false;
        if (activeColorFilter === "oliva" && !colors.includes("oliva") && !colors.includes("verde")) return false;
        if (activeColorFilter === "rojo" && !colors.includes("rojo") && !colors.includes("red") && !colors.includes("scarlet")) return false;
        if (activeColorFilter === "chocolate" && !colors.includes("chocolate") && !colors.includes("café") && !colors.includes("marrón")) return false;
      }

      // Filtro de Categoría Dropdown
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
    document.getElementById("storefront-count-badge").textContent = `${displayProducts.length} referencias disponibles`;

    // Renderizar Grid de Tarjetas
    const grid = document.getElementById("storefront-products-grid");
    if (displayProducts.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <div style="font-size: 42px; margin-bottom: 12px;">👜</div>
          <h3 style="font-size: 18px; font-weight: 800; color: #ffffff;">No encontramos bolsos con los filtros seleccionados</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 6px;">Prueba seleccionando otro color, tamaño o limpiando el buscador.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = displayProducts.map(p => {
      const formattedPrice = db.formatCOP(p.storeRetailPrice);
      const colorCount = p.colorways ? p.colorways.length : 1;
      const colorwayBadge = colorCount > 1 
        ? `<span class="category-tag" style="background: rgba(227, 194, 116, 0.15); border-color: rgba(227, 194, 116, 0.4); color: var(--primary-gold);">🎨 ${colorCount} Colores</span>`
        : `<span class="category-tag" style="background: rgba(56, 189, 248, 0.15); color: var(--accent-blue);">✨ Edición Exclusiva</span>`;

      return `
        <div class="product-card" data-product-id="${p.id}" style="cursor: pointer;">
          <div class="product-image-box">
            <img src="${p.image}" alt="${p.name}" class="product-image" loading="lazy">
            <div class="product-badges">
              <span class="category-tag">${p.category}</span>
              ${colorwayBadge}
            </div>
          </div>
          <div class="product-body">
            <h3 class="product-name">${p.name}</h3>
            <p class="product-desc">${p.description}</p>
            
            <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--primary-gold); margin-bottom: 14px; background: rgba(227, 194, 116, 0.08); padding: 4px 8px; border-radius: var(--radius-sm); border: 1px solid rgba(227, 194, 116, 0.2);">
              <span>📐</span>
              <span><strong>Medidas:</strong> ${p.dimensions || 'Estándar'}</span>
            </div>

            <div class="product-footer">
              <div class="price-box">
                <span class="price-label">Precio al Público</span>
                <span class="price-val">${formattedPrice}</span>
              </div>
              <button type="button" class="btn-card-wa btn-open-product-modal" data-product-id="${p.id}">
                <span>🛍️ Pedir / Colores</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Event listeners para abrir modal de producto al hacer clic en tarjeta o botón
    grid.querySelectorAll(".product-card").forEach(card => {
      card.addEventListener("click", () => {
        const prodId = card.dataset.productId;
        const prod = displayProducts.find(p => p.id === prodId);
        if (prod) openProductModal(store, prod);
      });
    });
  }

  // =========================================================================
  // MODAL DE DETALLE DE BOLSO & SELECTOR DE COLORWAYS
  // =========================================================================
  function openProductModal(store, product) {
    selectedModalProduct = product;
    selectedModalColorway = (product.colorways && product.colorways.length > 0) ? product.colorways[0] : null;
    selectedModalQty = 1;

    document.getElementById("modal-prod-title").textContent = product.name;
    document.getElementById("modal-prod-name").textContent = product.name;
    document.getElementById("modal-prod-cat").textContent = product.category;
    document.getElementById("modal-prod-sku").textContent = `SKU: ${product.sku}`;
    document.getElementById("modal-prod-desc").textContent = product.description;
    document.getElementById("modal-prod-dim").textContent = product.dimensions || "Estándar de Bodega";
    document.getElementById("modal-prod-price").textContent = db.formatCOP(product.storeRetailPrice);
    document.getElementById("modal-prod-img").src = selectedModalColorway ? selectedModalColorway.image : product.image;
    document.getElementById("modal-qty-val").textContent = selectedModalQty;

    // Renderizar Selector de Colorways
    const colorwaySelector = document.getElementById("modal-colorway-selector");
    if (product.colorways && product.colorways.length > 0) {
      colorwaySelector.innerHTML = product.colorways.map((cw, idx) => {
        const isActive = idx === 0;
        return `
          <button type="button" class="colorway-badge-chip ${isActive ? 'active' : ''}" data-color-idx="${idx}">
            <span class="colorway-dot"></span>
            <span>${cw.name}</span>
          </button>
        `;
      }).join("");

      colorwaySelector.querySelectorAll(".colorway-badge-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          colorwaySelector.querySelectorAll(".colorway-badge-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          const idx = parseInt(chip.dataset.colorIdx, 10);
          selectedModalColorway = product.colorways[idx];

          // Actualizar imagen con suave transición
          const modalImg = document.getElementById("modal-prod-img");
          modalImg.style.opacity = "0.4";
          setTimeout(() => {
            modalImg.src = selectedModalColorway.image;
            modalImg.style.opacity = "1";
          }, 150);

          // Actualizar enlace de WhatsApp individual
          updateModalDirectWhatsAppUrl(store, product, selectedModalColorway);
        });
      });
    } else {
      colorwaySelector.innerHTML = `<span style="font-size: 12px; color: var(--text-muted);">Color Único de Referencia</span>`;
    }

    updateModalDirectWhatsAppUrl(store, product, selectedModalColorway);

    // Abrir Modal
    document.getElementById("modal-product-detail").classList.add("open");
  }

  function updateModalDirectWhatsAppUrl(store, product, colorway) {
    const btnDirectWa = document.getElementById("modal-btn-wa-order");
    btnDirectWa.href = db.buildSingleProductWhatsAppUrl(store, product, colorway);
  }

  // =========================================================================
  // CARRITO MULTI-BOLSO CONSOLIDADO
  // =========================================================================
  function setupCartDrawer() {
    // Abrir drawer desde barra flotante
    document.getElementById("floating-cart-bar")?.addEventListener("click", () => {
      openCartDrawer();
    });

    // Selector de cantidad en modal de producto
    document.getElementById("modal-qty-minus")?.addEventListener("click", () => {
      if (selectedModalQty > 1) {
        selectedModalQty--;
        document.getElementById("modal-qty-val").textContent = selectedModalQty;
      }
    });

    document.getElementById("modal-qty-plus")?.addEventListener("click", () => {
      if (selectedModalQty < 20) {
        selectedModalQty++;
        document.getElementById("modal-qty-val").textContent = selectedModalQty;
      }
    });

    // Agregar al Carrito desde modal de producto
    document.getElementById("modal-btn-add-cart")?.addEventListener("click", () => {
      if (!selectedModalProduct) return;

      const colorName = selectedModalColorway ? selectedModalColorway.name : "Color Original";
      const colorImg = selectedModalColorway ? selectedModalColorway.image : selectedModalProduct.image;

      // Verificar si ya existe en el carrito
      const existingItem = cartItems.find(item => 
        item.productId === selectedModalProduct.id && item.colorway === colorName
      );

      if (existingItem) {
        existingItem.quantity += selectedModalQty;
      } else {
        cartItems.push({
          id: "item-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          productId: selectedModalProduct.id,
          name: selectedModalProduct.name,
          colorway: colorName,
          price: selectedModalProduct.storeRetailPrice,
          image: colorImg,
          quantity: selectedModalQty,
          dimensions: selectedModalProduct.dimensions || ""
        });
      }

      saveCart();
      updateFloatingCartBar();
      showToast(`🛍️ Se agregó ${selectedModalQty} bolso(s) a tu pedido.`);

      // Cerrar modal de producto
      document.getElementById("modal-product-detail").classList.remove("open");
    });

    // Selector de zonas de despacho en el carrito
    const neighborhoodSelect = document.getElementById("cart-neighborhood-select");
    if (neighborhoodSelect) {
      neighborhoodSelect.innerHTML = COLOMBIAN_SHIPPING_ZONES.map((zone, idx) => {
        return `<option value="${idx}">${zone.name} — ${db.formatCOP(zone.fee)} (${zone.time})</option>`;
      }).join("");

      neighborhoodSelect.addEventListener("change", () => {
        updateCartSummary();
      });
    }

    // Modalidad de despacho (Radio buttons)
    document.querySelectorAll("input[name='cart-dispatch-mode']").forEach(radio => {
      radio.addEventListener("change", (e) => {
        document.querySelectorAll(".dispatch-radio-card").forEach(c => c.classList.remove("selected"));
        e.target.closest(".dispatch-radio-card")?.classList.add("selected");
      });
    });

    // Botón de Enviar Pedido Completo a WhatsApp
    document.getElementById("cart-btn-send-whatsapp")?.addEventListener("click", () => {
      if (cartItems.length === 0) {
        alert("Tu carrito está vacío. Agrega al menos un bolso antes de continuar.");
        return;
      }

      const clientName = document.getElementById("cart-client-name")?.value.trim() || "";
      const clientPhone = document.getElementById("cart-client-phone")?.value.trim() || "";
      const clientAddress = document.getElementById("cart-client-address")?.value.trim() || "";

      if (clientName === "") {
        alert("Por favor ingresa tu nombre completo para el despacho.");
        document.getElementById("cart-client-name")?.focus();
        return;
      }

      const zoneIdx = parseInt(document.getElementById("cart-neighborhood-select")?.value || "0", 10);
      const selectedZone = COLOMBIAN_SHIPPING_ZONES[zoneIdx] || COLOMBIAN_SHIPPING_ZONES[0];
      const dispatchMode = document.querySelector("input[name='cart-dispatch-mode']:checked")?.value || "secured";
      const currentStore = db.getCurrentStore();

      const waUrl = db.buildConsolidatedCartWhatsAppUrl(
        currentStore,
        cartItems,
        { name: clientName, phone: clientPhone, address: clientAddress },
        selectedZone,
        dispatchMode
      );

      // Abrir WhatsApp en nueva pestaña
      window.open(waUrl, "_blank");

      // Limpiar carrito tras generar pedido
      cartItems = [];
      saveCart();
      updateFloatingCartBar();
      document.getElementById("modal-cart-drawer")?.classList.remove("open");
      showToast("🚀 ¡Pedido consolidado enviado a la asesora de WhatsApp!");
    });
  }

  function openCartDrawer() {
    renderCartDrawerItems();
    updateCartSummary();
    document.getElementById("modal-cart-drawer")?.classList.add("open");
  }

  function renderCartDrawerItems() {
    const container = document.getElementById("cart-drawer-items");
    document.getElementById("cart-drawer-count").textContent = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    if (cartItems.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px 10px; color: var(--text-muted);">
          <div style="font-size: 32px; margin-bottom: 8px;">🛍️</div>
          <div>No tienes bolsos en tu pedido.</div>
          <div style="font-size: 12px; margin-top: 4px;">Explora la vitrina y agrega tus modelos favoritos.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = cartItems.map((item, idx) => {
      return `
        <div class="cart-item-row" data-item-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-meta">Color: <strong>${item.colorway}</strong></div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <div style="display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 4px;">
                <button type="button" class="btn-qty-cart" data-action="minus" data-idx="${idx}" style="background: none; border: none; color: #fff; cursor: pointer; font-weight: 800;">-</button>
                <span style="font-size: 12px; font-weight: 800; min-width: 14px; text-align: center;">${item.quantity}</span>
                <button type="button" class="btn-qty-cart" data-action="plus" data-idx="${idx}" style="background: none; border: none; color: #fff; cursor: pointer; font-weight: 800;">+</button>
              </div>
              <span class="cart-item-price">${db.formatCOP(item.price * item.quantity)}</span>
            </div>
          </div>
          <button type="button" class="cart-item-remove" data-idx="${idx}" title="Eliminar bolso">&times;</button>
        </div>
      `;
    }).join("");

    // Event listeners para modificar cantidad o eliminar
    container.querySelectorAll(".btn-qty-cart").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        const action = btn.dataset.action;
        if (action === "minus") {
          if (cartItems[idx].quantity > 1) {
            cartItems[idx].quantity--;
          } else {
            cartItems.splice(idx, 1);
          }
        } else if (action === "plus") {
          cartItems[idx].quantity++;
        }
        saveCart();
        renderCartDrawerItems();
        updateCartSummary();
        updateFloatingCartBar();
      });
    });

    container.querySelectorAll(".cart-item-remove").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.idx, 10);
        cartItems.splice(idx, 1);
        saveCart();
        renderCartDrawerItems();
        updateCartSummary();
        updateFloatingCartBar();
      });
    });
  }

  function updateCartSummary() {
    const totalUnits = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalBags = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    const zoneIdx = parseInt(document.getElementById("cart-neighborhood-select")?.value || "0", 10);
    const selectedZone = COLOMBIAN_SHIPPING_ZONES[zoneIdx] || COLOMBIAN_SHIPPING_ZONES[0];
    const shippingFee = cartItems.length > 0 ? selectedZone.fee : 0;
    const grandTotal = totalBags + shippingFee;

    document.getElementById("cart-summary-qty").textContent = totalUnits;
    document.getElementById("cart-summary-shoes").textContent = db.formatCOP(totalBags);
    document.getElementById("cart-summary-shipping").textContent = db.formatCOP(shippingFee);
    document.getElementById("cart-summary-total").textContent = db.formatCOP(grandTotal);
    document.getElementById("cart-flete-preview").textContent = db.formatCOP(shippingFee);
  }

  function updateFloatingCartBar() {
    const totalUnits = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalBags = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const floatingBar = document.getElementById("floating-cart-bar");

    if (totalUnits > 0) {
      document.getElementById("floating-cart-count").textContent = totalUnits;
      document.getElementById("floating-cart-total").textContent = db.formatCOP(totalBags);
      floatingBar?.classList.add("visible");
    } else {
      floatingBar?.classList.remove("visible");
    }
  }

  function saveCart() {
    localStorage.setItem("luxbags_cart_items_v9", JSON.stringify(cartItems));
  }

  // =========================================================================
  // TEMPORIZADOR DE RESERVA DE BODEGA (20:00 MIN)
  // =========================================================================
  function startReservationTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (reservationTimeLeft > 0) {
        reservationTimeLeft--;
        const mins = Math.floor(reservationTimeLeft / 60);
        const secs = reservationTimeLeft % 60;
        const display = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
        const timerEl = document.getElementById("cart-timer-countdown");
        if (timerEl) timerEl.textContent = display;
      }
    }, 1000);
  }

  // =========================================================================
  // CONFIGURACIÓN DE FILTROS EN TIEMPO REAL
  // =========================================================================
  function setupFilters() {
    // Chips de Categoría / Drop
    document.querySelectorAll(".brand-chip-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".brand-chip-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeBrandFilter = btn.dataset.brand;
        renderStorefront(db.getCurrentStore());
      });
    });

    // Pills de Tamaño / Capacidad
    document.querySelectorAll("#storefront-size-pills .size-pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#storefront-size-pills .size-pill-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeSizeFilter = btn.dataset.size;
        renderStorefront(db.getCurrentStore());
      });
    });

    // Pills de Colorways
    document.querySelectorAll("#storefront-color-pills .size-pill-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#storefront-color-pills .size-pill-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeColorFilter = btn.dataset.color;
        renderStorefront(db.getCurrentStore());
      });
    });

    // Buscador por Texto
    document.getElementById("storefront-search-input")?.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderStorefront(db.getCurrentStore());
    });

    // Selectores Dropdown
    document.getElementById("storefront-category-select")?.addEventListener("change", (e) => {
      activeCategoryFilter = e.target.value;
      renderStorefront(db.getCurrentStore());
    });

    document.getElementById("storefront-sort-select")?.addEventListener("change", (e) => {
      activeSortOrder = e.target.value;
      renderStorefront(db.getCurrentStore());
    });
  }

  // =========================================================================
  // RENDER: PANEL DE LA BOUTIQUE (STORE ADMIN)
  // =========================================================================
  function renderStoreAdmin(store) {
    document.getElementById("admin-store-title").textContent = `Panel de Control — ${store.name}`;
    document.getElementById("stat-phone-preview").textContent = store.phone || "---";

    const masterProducts = db.getMasterProducts();
    const storeProducts = store.products || [];

    const activeCount = storeProducts.filter(p => p.active).length;
    document.getElementById("stat-active-prods").textContent = activeCount;

    // Calcular margen promedio
    let totalMargin = 0;
    let countedProds = 0;
    masterProducts.forEach(mp => {
      const sp = storeProducts.find(p => p.productId === mp.id);
      const retail = sp ? sp.customPrice : mp.suggestedRetailPrice;
      const margin = retail - mp.wholesalePrice;
      totalMargin += margin;
      countedProds++;
    });
    const avgMargin = countedProds > 0 ? Math.round(totalMargin / countedProds) : 55000;
    document.getElementById("stat-avg-margin").textContent = db.formatCOP(avgMargin);

    // Tabla de Productos para la Tienda
    const tbody = document.getElementById("store-admin-products-table");
    tbody.innerHTML = masterProducts.map(mp => {
      const sp = storeProducts.find(p => p.productId === mp.id);
      const isChecked = sp ? sp.active : true;
      const retailPrice = sp ? sp.customPrice : mp.suggestedRetailPrice;
      const margin = retailPrice - mp.wholesalePrice;

      return `
        <tr>
          <td>
            <div class="td-product-cell">
              <img src="${mp.image}" alt="${mp.name}" class="td-product-thumb">
              <div>
                <div class="td-product-name">${mp.name}</div>
                <div class="td-product-sku">SKU: ${mp.sku} • ${mp.category}</div>
              </div>
            </div>
          </td>
          <td><strong style="color: #ffffff;">${db.formatCOP(mp.wholesalePrice)}</strong></td>
          <td>
            <input type="number" class="table-input-price input-store-price" 
              data-product-id="${mp.id}" 
              value="${retailPrice}" 
              step="1000">
          </td>
          <td>
            <span class="margin-badge ${margin >= 50000 ? 'margin-high' : 'margin-normal'}">
              +${db.formatCOP(margin)}
            </span>
          </td>
          <td style="font-size: 11px; color: var(--text-muted);">${mp.dimensions || 'Estándar'}</td>
          <td>
            <label class="switch-toggle">
              <input type="checkbox" class="toggle-product-active" data-product-id="${mp.id}" ${isChecked ? 'checked' : ''}>
              <span class="slider-round"></span>
            </label>
          </td>
          <td>
            <button type="button" class="btn-action-sm btn-open-restock-modal" data-product-id="${mp.id}">
              📦 Pedir Reposición
            </button>
          </td>
        </tr>
      `;
    }).join("");

    // Event listeners para editar precio
    tbody.querySelectorAll(".input-store-price").forEach(input => {
      input.addEventListener("change", (e) => {
        const prodId = e.target.dataset.productId;
        const newPrice = e.target.value;
        db.updateStorePrice(store.id, prodId, newPrice);
        showToast("✓ Precio de venta actualizado en tu vitrina.");
        renderStoreAdmin(db.getCurrentStore());
      });
    });

    // Event listeners para activar/desactivar en vitrina
    tbody.querySelectorAll(".toggle-product-active").forEach(toggle => {
      toggle.addEventListener("change", (e) => {
        const prodId = e.target.dataset.productId;
        const active = db.toggleProductActive(store.id, prodId);
        showToast(active ? "✓ Bolso activado en vitrina pública." : "⏸ Bolso pausado de tu vitrina.");
        renderStoreAdmin(db.getCurrentStore());
      });
    });

    // Event listeners para reposición B2B
    tbody.querySelectorAll(".btn-open-restock-modal").forEach(btn => {
      btn.addEventListener("click", () => {
        const prodId = btn.dataset.productId;
        const prod = masterProducts.find(p => p.id === prodId);
        if (prod) openRestockModal(store, prod);
      });
    });
  }

  // =========================================================================
  // RENDER: PANEL DEL PROVEEDOR / BODEGA MATRIZ (SUPPLIER)
  // =========================================================================
  function renderSupplierView() {
    const masterProducts = db.getMasterProducts();
    const stores = db.getStores();
    const orders = db.getOrders();

    document.getElementById("supplier-stat-refs").textContent = masterProducts.length;
    document.getElementById("supplier-stat-stores").textContent = stores.length;

    const tbody = document.getElementById("supplier-products-table");
    tbody.innerHTML = masterProducts.map(mp => {
      const colorCount = mp.colorways ? mp.colorways.length : 1;
      return `
        <tr>
          <td>
            <div class="td-product-cell">
              <img src="${mp.image}" alt="${mp.name}" class="td-product-thumb">
              <div>
                <div class="td-product-name">${mp.name}</div>
                <div class="td-product-sku">${mp.tagline}</div>
              </div>
            </div>
          </td>
          <td><code>${mp.sku}</code></td>
          <td><span class="category-tag">${mp.category}</span></td>
          <td><strong style="color: var(--primary-gold);">${db.formatCOP(mp.wholesalePrice)}</strong></td>
          <td><strong style="color: #ffffff;">${db.formatCOP(mp.suggestedRetailPrice)}</strong></td>
          <td style="font-size: 11px; color: var(--text-secondary);">${mp.dimensions || 'Estándar'}</td>
          <td><span style="font-size: 12px; color: var(--accent-blue); font-weight: 700;">🎨 ${colorCount} Tonos</span></td>
        </tr>
      `;
    }).join("");
  }

  // Importador Rápido de Texto de WhatsApp
  function setupSupplierFastImporter() {
    document.getElementById("btn-parse-wa-text")?.addEventListener("click", () => {
      const textarea = document.getElementById("wa-import-textarea");
      const text = textarea?.value.trim() || "";

      if (text === "") {
        alert("Por favor pega el texto del grupo de WhatsApp mayorista.");
        return;
      }

      const parsed = db.parseWhatsAppWholesaleText(text);
      if (parsed) {
        db.addMasterProduct(parsed);
        textarea.value = "";
        showToast("✨ ¡Bolso detectado y publicado exitosamente al catálogo maestro!");
        renderSupplierView();
      }
    });
  }

  // =========================================================================
  // RENDER: DIRECTORIO & SIMULADOR ROI DE GANANCIAS
  // =========================================================================
  function renderDirectoryView() {
    const stores = db.getStores();
    const grid = document.getElementById("directory-stores-grid");

    grid.innerHTML = stores.map(st => {
      const prodsCount = (st.products || []).filter(p => p.active).length;
      return `
        <div class="store-directory-card">
          <div class="store-card-header">
            <div class="store-card-avatar">👜</div>
            <div>
              <div class="store-card-title">${st.name}</div>
              <div class="store-card-location">📍 ${st.neighborhood}</div>
            </div>
          </div>
          <p class="store-card-body">${st.tagline}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-subtle);">
            <span style="font-size: 12px; color: var(--primary-gold); font-weight: 700;">${prodsCount} Bolsos Activos</span>
            <button type="button" class="btn-action-sm btn-switch-to-store" data-store-id="${st.id}">
              Visitar Vitrina →
            </button>
          </div>
        </div>
      `;
    }).join("");

    grid.querySelectorAll(".btn-switch-to-store").forEach(btn => {
      btn.addEventListener("click", () => {
        const storeId = btn.dataset.storeId;
        db.setCurrentStoreId(storeId);
        setupStoreSelector();
        document.getElementById("tab-storefront")?.click();
      });
    });
  }

  function setupROISimulator() {
    const sliderPairs = document.getElementById("roi-slider-pairs");
    const sliderMargin = document.getElementById("roi-slider-margin");
    const labelPairs = document.getElementById("roi-pairs-label");
    const labelMargin = document.getElementById("roi-margin-label");
    const labelTotal = document.getElementById("roi-total-profit");

    function updateROI() {
      const pairs = parseInt(sliderPairs?.value || "45", 10);
      const margin = parseInt(sliderMargin?.value || "57000", 10);
      const total = pairs * margin;

      if (labelPairs) labelPairs.textContent = `${pairs} bolsos`;
      if (labelMargin) labelMargin.textContent = db.formatCOP(margin);
      if (labelTotal) labelTotal.textContent = `${db.formatCOP(total)} COP`;
    }

    sliderPairs?.addEventListener("input", updateROI);
    sliderMargin?.addEventListener("input", updateROI);
  }

  // =========================================================================
  // GESTIÓN DE MODALES
  // =========================================================================
  function setupModals() {
    // Cerrar modales con botones de clase data-close
    document.querySelectorAll("[data-close]").forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.dataset.close;
        document.getElementById(modalId)?.classList.remove("open");
      });
    });

    // Cerrar al hacer clic en el backdrop
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          backdrop.classList.remove("open");
        }
      });
    });

    // Abrir Modal de Carga Manual (Proveedor)
    document.getElementById("btn-open-new-product-modal")?.addEventListener("click", () => {
      document.getElementById("modal-new-product")?.classList.add("open");
    });

    // Formulario de Carga Manual de Producto
    document.getElementById("form-new-master-product")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("new-prod-name").value.trim();
      const sku = document.getElementById("new-prod-sku").value.trim();
      const category = document.getElementById("new-prod-category").value;
      const image = document.getElementById("new-prod-image").value;
      const wholesale = document.getElementById("new-prod-wholesale").value;
      const suggested = document.getElementById("new-prod-suggested").value;
      const dimensions = document.getElementById("new-prod-dim").value.trim();
      const desc = document.getElementById("new-prod-desc").value.trim();

      db.addMasterProduct({
        name,
        sku,
        category,
        image,
        wholesalePrice: wholesale,
        suggestedRetailPrice: suggested,
        dimensions,
        description: desc
      });

      document.getElementById("modal-new-product")?.classList.remove("open");
      document.getElementById("form-new-master-product")?.reset();
      showToast("✓ Nueva referencia agregada a toda la red LUXBAGS.");
      renderSupplierView();
    });

    // Modal de Configuración de Boutique
    document.getElementById("btn-open-store-settings")?.addEventListener("click", () => {
      const store = db.getCurrentStore();
      document.getElementById("setting-store-name").value = store.name || "";
      document.getElementById("setting-store-tagline").value = store.tagline || "";
      document.getElementById("setting-store-phone").value = store.phone || "";
      document.getElementById("setting-store-location").value = store.neighborhood || "";
      document.getElementById("modal-store-settings")?.classList.add("open");
    });

    document.getElementById("form-store-settings")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const store = db.getCurrentStore();
      const name = document.getElementById("setting-store-name").value.trim();
      const tagline = document.getElementById("setting-store-tagline").value.trim();
      const phone = document.getElementById("setting-store-phone").value.trim();
      const neighborhood = document.getElementById("setting-store-location").value.trim();

      db.updateStoreProfile(store.id, { name, tagline, phone, neighborhood });
      document.getElementById("modal-store-settings")?.classList.remove("open");
      showToast("✓ Configuración de tu boutique actualizada.");
      setupStoreSelector();
      renderCurrentView();
    });

    // Formulario de Reposición B2B
    document.getElementById("form-restock-order")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const prodId = document.getElementById("restock-prod-id").value;
      const master = db.getMasterProducts();
      const prod = master.find(p => p.id === prodId);
      const currentStore = db.getCurrentStore();
      const units = parseInt(document.getElementById("restock-units-input").value, 10);
      const colorway = document.getElementById("restock-size-select").value;

      if (prod) {
        db.createB2BOrder({
          storeName: currentStore.name,
          productName: prod.name,
          colorway,
          units,
          totalWholesale: prod.wholesalePrice * units,
          supplierName: prod.supplierName
        });

        document.getElementById("modal-restock")?.classList.remove("open");
        showToast("🚀 Orden de reposición enviada a la bodega central.");
      }
    });
  }

  function openRestockModal(store, product) {
    document.getElementById("restock-prod-id").value = product.id;
    document.getElementById("restock-prod-title").textContent = product.name;
    document.getElementById("restock-supplier-name").textContent = product.supplierName || "Bodega Matriz LUXBAGS";
    document.getElementById("restock-wholesale-price").textContent = `Costo Mayorista: ${db.formatCOP(product.wholesalePrice)}`;

    const sizeSelect = document.getElementById("restock-size-select");
    if (product.colorways && product.colorways.length > 0) {
      sizeSelect.innerHTML = product.colorways.map(cw => `<option value="${cw.name}">${cw.name}</option>`).join("");
    } else {
      sizeSelect.innerHTML = `<option value="Tono Estándar">Tono Estándar de Bodega</option>`;
    }

    const unitsInput = document.getElementById("restock-units-input");
    const totalCalc = document.getElementById("restock-total-calc");
    unitsInput.value = 6;
    totalCalc.textContent = db.formatCOP(product.wholesalePrice * 6);

    unitsInput.oninput = () => {
      const u = parseInt(unitsInput.value || "1", 10);
      totalCalc.textContent = db.formatCOP(product.wholesalePrice * u);
    };

    document.getElementById("modal-restock")?.classList.add("open");
  }

  // =========================================================================
  // TOAST NOTIFICATIONS
  // =========================================================================
  function showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>✨</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Arrancar la app
  initApp();
});
