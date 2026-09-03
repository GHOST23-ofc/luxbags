// =========================================================================
// BAGS WORLD MLS COLOMBIA - APLICACIÓN PRINCIPAL & CONTROLADOR (Bastion AI)
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
  let currentView = "storefront"; // storefront | store-admin | supplier | directory
  let selectedCategory = "all";
  let selectedSize = "all";
  let selectedColor = "all";
  let searchQuery = "";
  let currentSort = "default";

  // Estado del modal de producto activo
  let activeModalProduct = null;
  let activeModalColorway = null;
  let activeModalQuantity = 1;

  // Estado del Checkout Consolidado
  let cartItems = [];
  let cartSelectedZone = COLOMBIAN_SHIPPING_ZONES[0];
  let cartDispatchMode = "secured"; // secured | cod

  // Inicializar todo el sistema
  initApp();

  function initApp() {
    loadCartFromStorage();
    setupRoleSwitcher();
    setupFilters();
    setupProductModal();
    setupCartDrawer();
    setupAdminStoreActions();
    setupSupplierFastImporter();
    setupROISimulator();
    setupAuthSystem();
    setupPrivacyAndBackups();
    startReservationTimer();
    initBlackHoleCanvas();

    // Renderizar vista inicial
    renderCurrentView();
    updateFloatingCartBar();
    updateAuthHUD();
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
    const count = 50;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        color: Math.random() > 0.5 ? "rgba(227, 194, 116, 0.45)" : "rgba(230, 25, 46, 0.35)"
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

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
    const tabs = document.querySelectorAll(".role-tab-btn");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentView = tab.dataset.view;
        renderCurrentView();
      });
    });

    // Selector de Tienda en el HUD
    const hudSelect = document.getElementById("hud-store-select");
    if (hudSelect) {
      hudSelect.addEventListener("change", (e) => {
        db.setCurrentStoreId(e.target.value);
        updateAuthHUD();
        renderCurrentView();
        showToast(`Cambiado a: ${db.getCurrentStore().name}`);
      });
    }

    // Botón de Reset Demo
    const btnReset = document.getElementById("btn-reset-demo");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        if (confirm("¿Deseas restaurar los datos de demostración de BAGS WORLD MLS?")) {
          db.resetDemo();
          cartItems = [];
          saveCartToStorage();
          updateFloatingCartBar();
          updateAuthHUD();
          renderCurrentView();
          showToast("Datos restaurados correctamente.");
        }
      });
    }
  }

  function renderCurrentView() {
    document.querySelectorAll(".view-panel").forEach(p => p.style.display = "none");

    renderHudStoreSelect();

    if (currentView === "storefront") {
      document.getElementById("view-storefront").style.display = "block";
      renderStorefront();
    } else if (currentView === "store-admin") {
      document.getElementById("view-store-admin").style.display = "block";
      renderStoreAdmin();
    } else if (currentView === "supplier") {
      document.getElementById("view-supplier").style.display = "block";
      renderSupplierAdmin();
    } else if (currentView === "directory") {
      document.getElementById("view-directory").style.display = "block";
      renderDirectory();
    }
  }

  function renderHudStoreSelect() {
    const hudSelect = document.getElementById("hud-store-select");
    if (!hudSelect) return;
    const stores = db.getStores();
    const currentId = db.getCurrentStoreId();

    hudSelect.innerHTML = stores.map(s => {
      return `<option value="${s.id}" ${s.id === currentId ? 'selected' : ''}>
        ${s.name} ${s.isSupplierStore ? '(Matriz)' : ''}
      </option>`;
    }).join("");
  }

  // =========================================================================
  // SISTEMA DE AUTH & LOGIN (CRM BASTION / CRM GHOST STYLE)
  // =========================================================================
  function setupAuthSystem() {
    const btnOpenAuth = document.getElementById("btn-open-auth-modal");
    if (btnOpenAuth) {
      btnOpenAuth.addEventListener("click", () => {
        openModal("modal-auth-login");
      });
    }

    // Accesos Rápidos Demo de 1 Clic
    const quickAuthBtns = document.querySelectorAll(".quick-auth-btn");
    quickAuthBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const storeId = btn.dataset.authId;
        const loggedStore = db.quickLogin(storeId);
        if (loggedStore) {
          closeModal("modal-auth-login");
          updateAuthHUD();
          
          if (loggedStore.isSupplierStore) {
            switchRoleTab("supplier");
          } else {
            switchRoleTab("store-admin");
          }
          showToast(`✅ Sesión iniciada como: ${loggedStore.name}`);
        }
      });
    });

    // Formulario Clásico de Login
    const formLogin = document.getElementById("form-auth-login");
    if (formLogin) {
      formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("auth-input-email").value;
        const pass = document.getElementById("auth-input-password").value;

        const res = db.login(email, pass);
        if (res.success) {
          closeModal("modal-auth-login");
          updateAuthHUD();
          if (res.store.isSupplierStore) {
            switchRoleTab("supplier");
          } else {
            switchRoleTab("store-admin");
          }
          showToast(`✅ Bienvenido, ${res.store.name}`);
        } else {
          alert(res.message);
        }
      });
    }
  }

  function updateAuthHUD() {
    const currentStore = db.getCurrentStore();
    const hudName = document.getElementById("hud-user-name");
    const hudRole = document.getElementById("hud-user-role");

    if (hudName) hudName.textContent = currentStore.name;
    if (hudRole) {
      if (currentStore.isSupplierStore) {
        hudRole.textContent = "SuperAdmin";
        hudRole.style.background = "rgba(227, 194, 116, 0.2)";
        hudRole.style.color = "var(--primary-gold)";
      } else {
        hudRole.textContent = currentStore.verifiedBadge || "Boutique";
        hudRole.style.background = "rgba(230, 25, 46, 0.2)";
        hudRole.style.color = "var(--primary-red)";
      }
    }
  }

  function switchRoleTab(roleView) {
    const tabs = document.querySelectorAll(".role-tab-btn");
    tabs.forEach(t => {
      if (t.dataset.view === roleView) {
        t.classList.add("active");
      } else {
        t.classList.remove("active");
      }
    });
    currentView = roleView;
    renderCurrentView();
  }

  // =========================================================================
  // PRIVACIDAD, SEGURIDAD & GESTIÓN DE BACKUPS
  // =========================================================================
  function setupPrivacyAndBackups() {
    const btnOpenPrivacy = document.getElementById("btn-open-privacy-modal");
    if (btnOpenPrivacy) {
      btnOpenPrivacy.addEventListener("click", () => {
        const store = db.getCurrentStore();
        document.getElementById("privacy-email").value = store.email || "";
        document.getElementById("privacy-current-pass").value = "";
        document.getElementById("privacy-new-pass").value = "";
        openModal("modal-privacy-settings");
      });
    }

    const formPrivacy = document.getElementById("form-privacy-settings");
    if (formPrivacy) {
      formPrivacy.addEventListener("submit", (e) => {
        e.preventDefault();
        const store = db.getCurrentStore();
        const email = document.getElementById("privacy-email").value;
        const currentPass = document.getElementById("privacy-current-pass").value;
        const newPass = document.getElementById("privacy-new-pass").value;

        const res = db.updateStoreSecurity(store.id, {
          email,
          currentPassword: currentPass,
          newPassword: newPass
        });

        if (res.success) {
          closeModal("modal-privacy-settings");
          showToast("🔒 Privacidad y credenciales actualizadas.");
          renderCurrentView();
        } else {
          alert(res.message);
        }
      });
    }

    // Exportar Respaldo Privado de la Tienda
    const btnExportStore = document.getElementById("btn-export-store-backup");
    if (btnExportStore) {
      btnExportStore.addEventListener("click", () => {
        const store = db.getCurrentStore();
        const backup = db.exportStoreBackup(store.id);
        downloadJSON(backup, `${store.name.toLowerCase().replace(/\s+/g, '_')}_backup.json`);
        showToast("💾 Copia de respaldo descargada en tu equipo.");
      });
    }

    // Exportar Master Backup SaaS (SuperAdmin)
    const btnExportSaaS = document.getElementById("btn-export-full-saas-backup");
    if (btnExportSaaS) {
      btnExportSaaS.addEventListener("click", () => {
        const fullBackup = db.exportSaaSFullBackup();
        downloadJSON(fullBackup, `bagsworld_mls_master_backup_${new Date().toISOString().slice(0, 10)}.json`);
        showToast("📦 Master Backup del SaaS exportado exitosamente.");
      });
    }
  }

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // =========================================================================
  // VISTA 1: VITRINA PÚBLICA (STOREFRONT)
  // =========================================================================
  function renderStorefront() {
    const store = db.getCurrentStore();
    
    // Encabezado de tienda
    document.getElementById("storefront-name").innerHTML = `
      ${store.name} <span class="badge-verified">${store.verifiedBadge || 'CLIENTE VIP'}</span>
    `;
    document.getElementById("storefront-tagline").textContent = store.tagline || "";
    document.getElementById("storefront-location").textContent = store.neighborhood || "";

    const waBtn = document.getElementById("storefront-wa-direct");
    if (waBtn) {
      const cleanPhone = (store.phone || "573165558899").replace(/[^0-9]/g, "");
      waBtn.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`👋 ¡Hola ${store.name}! Quiero información sobre los bolsos disponibles para despacho inmediato.`)}`;
    }

    // Filtrar y ordenar productos
    const allProducts = db.getStorefrontProducts(store);
    let filtered = allProducts.filter(p => {
      // Filtro de marca/colección
      if (selectedCategory === "amor" && !p.name.toLowerCase().includes("amor y amistad")) return false;
      if (selectedCategory === "totes" && !p.category.includes("Totes")) return false;
      if (selectedCategory === "crossbody" && !p.category.includes("Crossbody")) return false;
      if (selectedCategory === "satchel" && !p.category.includes("Satchel")) return false;
      if (selectedCategory === "morrales" && !p.category.includes("Morrales")) return false;
      if (selectedCategory === "billeteras" && !p.category.includes("Billeteras")) return false;

      // Filtro de tamaño
      if (selectedSize === "compacto" && !p.sizeCategory.includes("Compacto")) return false;
      if (selectedSize === "mediano" && !p.sizeCategory.includes("Mediano")) return false;
      if (selectedSize === "maxi" && !p.sizeCategory.includes("Maxi")) return false;

      // Filtro de colorway
      if (selectedColor !== "all") {
        const hasColor = p.colorways && p.colorways.some(c => c.name.toLowerCase().includes(selectedColor));
        if (!hasColor) return false;
      }

      // Buscador
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchColor = p.colorways && p.colorways.some(c => c.name.toLowerCase().includes(q));
        if (!matchName && !matchCat && !matchSku && !matchDesc && !matchColor) return false;
      }

      return true;
    });

    // Ordenamiento
    if (currentSort === "price-asc") {
      filtered.sort((a, b) => a.storeRetailPrice - b.storeRetailPrice);
    } else if (currentSort === "price-desc") {
      filtered.sort((a, b) => b.storeRetailPrice - a.storeRetailPrice);
    } else if (currentSort === "name-asc") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Actualizar badge de contador
    const countBadge = document.getElementById("storefront-count-badge");
    if (countBadge) {
      countBadge.textContent = `${filtered.length} modelo(s) disponible(s)`;
    }

    // Renderizar tarjetas
    const grid = document.getElementById("storefront-products-grid");
    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <div style="font-size: 38px; margin-bottom: 10px;">👜</div>
          <h3 style="font-size: 18px; color: #fff; font-weight: 800;">No se encontraron bolsos con estos filtros</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Prueba limpiando la búsqueda o seleccionando otra categoría.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(prod => {
      const formattedPrice = db.formatCOP(prod.storeRetailPrice);
      const colorwaysCount = prod.colorways ? prod.colorways.length : 1;

      return `
        <article class="product-card" data-id="${prod.id}">
          <div class="product-image-box">
            <img src="${prod.image}" alt="${prod.name}" class="product-image" loading="lazy">
            <div class="product-badges">
              <span class="category-tag">${prod.category}</span>
              <span class="category-tag" style="background: rgba(230, 25, 46, 0.85); color: #fff; border-color: var(--primary-red);">
                🎨 ${colorwaysCount} Colores
              </span>
            </div>
          </div>
          <div class="product-body">
            <h3 class="product-name">${prod.name}</h3>
            <p class="product-desc">${prod.tagline || prod.description}</p>
            <div style="font-size: 11px; color: var(--primary-gold); margin-bottom: 12px; font-weight: 700;">
              📐 ${prod.dimensions || '18 x 22 x 8 cm'}
            </div>
            <div class="product-footer">
              <div class="price-box">
                <span class="price-label">Precio al Público</span>
                <span class="price-val">${formattedPrice}</span>
              </div>
              <button class="btn-card-wa btn-open-modal" data-id="${prod.id}">
                <span>Ver & Pedir</span> ➔
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    // Listeners para abrir modal
    grid.querySelectorAll(".btn-open-modal").forEach(btn => {
      btn.addEventListener("click", () => {
        const prodId = btn.dataset.id;
        openProductModal(prodId);
      });
    });
  }

  // =========================================================================
  // VISTA 2: PANEL DE CONTROL DE LA TIENDA / BOUTIQUE (STORE ADMIN)
  // =========================================================================
  function renderStoreAdmin() {
    const store = db.getCurrentStore();
    const adminTitle = document.getElementById("admin-store-title");
    if (adminTitle) adminTitle.textContent = `Panel de Control: ${store.name}`;

    const masterProducts = db.getMasterProducts();
    const storeProducts = store.products || [];

    let activeCount = 0;
    let totalMargin = 0;

    const tbody = document.getElementById("store-admin-products-table");
    if (!tbody) return;

    tbody.innerHTML = masterProducts.map(mp => {
      const sp = storeProducts.find(p => p.productId === mp.id);
      const isActive = sp ? sp.active : true;
      const customPrice = sp && sp.customPrice ? sp.customPrice : mp.suggestedRetailPrice;
      const margin = customPrice - mp.wholesalePrice;
      
      if (isActive) {
        activeCount++;
        totalMargin += margin;
      }

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
          <td style="font-weight: 700; color: var(--primary-gold);">${db.formatCOP(mp.wholesalePrice)}</td>
          <td>
            <input type="number" class="table-input-price store-price-input" data-id="${mp.id}" value="${customPrice}" step="1000">
          </td>
          <td>
            <span class="margin-badge ${margin >= 45000 ? 'margin-high' : 'margin-normal'}">
              +${db.formatCOP(margin)}
            </span>
          </td>
          <td style="font-size: 11px; color: var(--text-muted);">${mp.dimensions || 'Estándar'}</td>
          <td>
            <label class="switch-toggle">
              <input type="checkbox" class="store-toggle-active" data-id="${mp.id}" ${isActive ? 'checked' : ''}>
              <span class="slider-round"></span>
            </label>
          </td>
          <td>
            <button class="btn-action-sm btn-open-restock" data-id="${mp.id}">
              📦 Pedir Reposición
            </button>
          </td>
        </tr>
      `;
    }).join("");

    // Actualizar métricas
    document.getElementById("stat-active-prods").textContent = activeCount;
    const avgMargin = activeCount > 0 ? Math.round(totalMargin / activeCount) : 0;
    document.getElementById("stat-avg-margin").textContent = db.formatCOP(avgMargin);
    document.getElementById("stat-phone-preview").textContent = store.phone ? `+${store.phone}` : "No configurado";

    // Listeners de cambio de precio
    tbody.querySelectorAll(".store-price-input").forEach(input => {
      input.addEventListener("change", (e) => {
        const prodId = e.target.dataset.id;
        const newPrice = parseInt(e.target.value, 10);
        db.updateStorePrice(store.id, prodId, newPrice);
        showToast("Precio de venta actualizado");
        renderStoreAdmin();
      });
    });

    // Listeners de toggle activo
    tbody.querySelectorAll(".store-toggle-active").forEach(toggle => {
      toggle.addEventListener("change", (e) => {
        const prodId = e.target.dataset.id;
        db.toggleProductActive(store.id, prodId);
        showToast("Estado en vitrina actualizado");
        renderStoreAdmin();
      });
    });

    // Listeners para reposición
    tbody.querySelectorAll(".btn-open-restock").forEach(btn => {
      btn.addEventListener("click", () => {
        const prodId = btn.dataset.id;
        openRestockModal(prodId);
      });
    });
  }

  // =========================================================================
  // VISTA 3: PANEL DEL PROVEEDOR / SUPERADMIN BODEGA (BAGS WORLD MATRIZ)
  // =========================================================================
  function renderSupplierAdmin() {
    const masterProducts = db.getMasterProducts();
    const stores = db.getStores();

    document.getElementById("supplier-stat-refs").textContent = masterProducts.length;
    document.getElementById("supplier-stat-stores").textContent = stores.filter(s => !s.isSupplierStore).length;

    // Renderizar tabla de clientes (BolsosCOL & Calibolsos 2026) con soporte y recuperación de contraseña
    renderSaasAdminClientsTable();

    const tbody = document.getElementById("supplier-products-table");
    if (!tbody) return;

    tbody.innerHTML = masterProducts.map(mp => {
      const variantsCount = mp.colorways ? mp.colorways.length : 1;
      return `
        <tr>
          <td>
            <div class="td-product-cell">
              <img src="${mp.image}" alt="${mp.name}" class="td-product-thumb">
              <div>
                <div class="td-product-name">${mp.name}</div>
                <div class="td-product-sku">${mp.tagline || ''}</div>
              </div>
            </div>
          </td>
          <td style="font-family: monospace; font-size: 11px; color: var(--text-muted);">${mp.sku}</td>
          <td><span class="category-tag">${mp.category}</span></td>
          <td style="font-weight: 800; color: var(--primary-gold);">${db.formatCOP(mp.wholesalePrice)}</td>
          <td style="color: #fff;">${db.formatCOP(mp.suggestedRetailPrice)}</td>
          <td style="font-size: 11px; color: var(--text-muted);">${mp.dimensions || 'Estándar'}</td>
          <td>
            <span class="category-tag" style="background: rgba(56, 189, 248, 0.15); color: var(--accent-blue); border-color: rgba(56, 189, 248, 0.3);">
              🎨 ${variantsCount} Colores
            </span>
          </td>
        </tr>
      `;
    }).join("");
  }

  function renderSaasAdminClientsTable() {
    const tbody = document.getElementById("saas-admin-clients-table");
    if (!tbody) return;

    const clientStores = db.getStores().filter(s => !s.isSupplierStore);

    tbody.innerHTML = clientStores.map(store => {
      return `
        <tr>
          <td>
            <div style="font-weight: 800; color: #fff; font-size: 14px;">${store.name}</div>
            <div style="font-size: 10px; color: var(--primary-gold);">${store.verifiedBadge || 'CLIENTE VIP'}</div>
          </td>
          <td style="font-family: monospace; color: var(--accent-blue); font-size: 12px;">${store.email || 'No registrado'}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <code style="background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 4px; color: #fff; font-size: 11px;">${store.password || 'Bolsos2026*'}</code>
            </div>
          </td>
          <td style="color: #25d366; font-size: 12px; font-weight: 700;">+${store.phone}</td>
          <td style="font-size: 11px; color: var(--text-muted);">${store.neighborhood}</td>
          <td>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="btn-action-sm btn-admin-impersonate" data-store-id="${store.id}" style="background: rgba(230, 25, 46, 0.15); color: var(--primary-red); border-color: var(--primary-red);">
                🚀 Entrar a su Panel
              </button>
              <button class="btn-action-sm btn-admin-reset-pass" data-store-id="${store.id}">
                🔑 Resetear Clave
              </button>
              <button class="btn-action-sm btn-admin-backup-store" data-store-id="${store.id}">
                💾 Backup
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");

    // Impersonar tienda
    tbody.querySelectorAll(".btn-admin-impersonate").forEach(btn => {
      btn.addEventListener("click", () => {
        const sId = btn.dataset.storeId;
        db.quickLogin(sId);
        updateAuthHUD();
        switchRoleTab("store-admin");
        showToast(`🚀 Sesión cambiada a panel de: ${db.getCurrentStore().name}`);
      });
    });

    // Resetear contraseña por el Admin SaaS
    tbody.querySelectorAll(".btn-admin-reset-pass").forEach(btn => {
      btn.addEventListener("click", () => {
        const sId = btn.dataset.storeId;
        const newPass = prompt("Ingresa la nueva contraseña para este cliente:", "Bolsos2026*");
        if (newPass) {
          db.resetStorePasswordByAdmin(sId, newPass);
          showToast(`🔑 Contraseña actualizada para el cliente.`);
          renderSaasAdminClientsTable();
        }
      });
    });

    // Exportar backup de tienda individual
    tbody.querySelectorAll(".btn-admin-backup-store").forEach(btn => {
      btn.addEventListener("click", () => {
        const sId = btn.dataset.storeId;
        const backup = db.exportStoreBackup(sId);
        downloadJSON(backup, `tienda_${sId}_backup.json`);
        showToast("💾 Respaldo de tienda descargado.");
      });
    });
  }

  // =========================================================================
  // VISTA 4: DIRECTORIO DE TIENDAS & CALCULADORA ROI
  // =========================================================================
  function renderDirectory() {
    const stores = db.getStores();
    const grid = document.getElementById("directory-stores-grid");
    if (!grid) return;

    grid.innerHTML = stores.map(s => {
      return `
        <div class="store-directory-card">
          <div class="store-card-header">
            <div class="store-card-avatar">${s.isSupplierStore ? '👑' : '👜'}</div>
            <div>
              <div class="store-card-title">${s.name}</div>
              <div class="store-card-location">📍 ${s.neighborhood}</div>
            </div>
          </div>
          <p class="store-card-body">${s.tagline}</p>
          <div style="display: flex; gap: 8px; margin-top: auto;">
            <button class="btn-action-sm btn-view-directory-store" data-id="${s.id}" style="flex: 1; text-align: center;">
              Ver Vitrina →
            </button>
          </div>
        </div>
      `;
    }).join("");

    grid.querySelectorAll(".btn-view-directory-store").forEach(btn => {
      btn.addEventListener("click", () => {
        db.setCurrentStoreId(btn.dataset.id);
        updateAuthHUD();
        switchRoleTab("storefront");
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
      if (!sliderPairs || !sliderMargin) return;
      const pairs = parseInt(sliderPairs.value, 10);
      const margin = parseInt(sliderMargin.value, 10);
      const total = pairs * margin;

      if (labelPairs) labelPairs.textContent = `${pairs} bolsos`;
      if (labelMargin) labelMargin.textContent = db.formatCOP(margin);
      if (labelTotal) labelTotal.textContent = `${db.formatCOP(total)} COP`;
    }

    if (sliderPairs) sliderPairs.addEventListener("input", updateROI);
    if (sliderMargin) sliderMargin.addEventListener("input", updateROI);
    updateROI();
  }

  // =========================================================================
  // MODAL DE DETALLE DE PRODUCTO & COLORWAY SELECTOR
  // =========================================================================
  function setupProductModal() {
    // Cerrar modales con botones .btn-close-modal
    document.querySelectorAll(".btn-close-modal").forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.dataset.close;
        if (modalId) closeModal(modalId);
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

    // Control de cantidad en modal
    const qtyMinus = document.getElementById("modal-qty-minus");
    const qtyPlus = document.getElementById("modal-qty-plus");
    const qtyVal = document.getElementById("modal-qty-val");

    if (qtyMinus && qtyPlus && qtyVal) {
      qtyMinus.addEventListener("click", () => {
        if (activeModalQuantity > 1) {
          activeModalQuantity--;
          qtyVal.textContent = activeModalQuantity;
        }
      });
      qtyPlus.addEventListener("click", () => {
        activeModalQuantity++;
        qtyVal.textContent = activeModalQuantity;
      });
    }

    // Botón Agregar al Carrito
    const btnAddCart = document.getElementById("modal-btn-add-cart");
    if (btnAddCart) {
      btnAddCart.addEventListener("click", () => {
        if (!activeModalProduct) return;
        addToCart(activeModalProduct, activeModalColorway, activeModalQuantity);
        closeModal("modal-product-detail");
        openCartDrawer();
      });
    }
  }

  function openProductModal(prodId) {
    const store = db.getCurrentStore();
    const products = db.getStorefrontProducts(store);
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    activeModalProduct = prod;
    activeModalQuantity = 1;
    document.getElementById("modal-qty-val").textContent = "1";

    activeModalColorway = (prod.colorways && prod.colorways.length > 0) ? prod.colorways[0] : { name: "Color Original", image: prod.image };

    document.getElementById("modal-prod-title").textContent = prod.name;
    document.getElementById("modal-prod-name").textContent = prod.name;
    document.getElementById("modal-prod-sku").textContent = `SKU: ${prod.sku}`;
    document.getElementById("modal-prod-cat").textContent = prod.category;
    document.getElementById("modal-prod-desc").textContent = prod.description || prod.tagline;
    document.getElementById("modal-prod-dim").textContent = prod.dimensions || "18 cm (Alto) x 22 cm (Ancho) x 8 cm (Prof.)";
    document.getElementById("modal-prod-price").textContent = `${db.formatCOP(prod.storeRetailPrice)} COP`;
    document.getElementById("modal-prod-img").src = activeModalColorway.image || prod.image;

    // Renderizar chips de colorways
    const colorContainer = document.getElementById("modal-colorway-selector");
    if (colorContainer) {
      const colorways = prod.colorways || [{ name: "Tono Original", image: prod.image }];
      colorContainer.innerHTML = colorways.map((cw, idx) => {
        return `
          <button type="button" class="colorway-badge-chip ${idx === 0 ? 'active' : ''}" data-index="${idx}">
            <span class="colorway-dot"></span>
            <span>${cw.name}</span>
          </button>
        `;
      }).join("");

      colorContainer.querySelectorAll(".colorway-badge-chip").forEach(chip => {
        chip.addEventListener("click", () => {
          colorContainer.querySelectorAll(".colorway-badge-chip").forEach(c => c.classList.remove("active"));
          chip.classList.add("active");
          const idx = parseInt(chip.dataset.index, 10);
          activeModalColorway = colorways[idx];
          if (activeModalColorway.image) {
            document.getElementById("modal-prod-img").src = activeModalColorway.image;
          }
          updateSingleWhatsAppButton();
        });
      });
    }

    updateSingleWhatsAppButton();
    openModal("modal-product-detail");
  }

  function updateSingleWhatsAppButton() {
    const waBtn = document.getElementById("modal-btn-wa-order");
    if (!waBtn || !activeModalProduct) return;
    const store = db.getCurrentStore();
    waBtn.href = db.buildSingleProductWhatsAppUrl(store, activeModalProduct, activeModalColorway);
  }

  // =========================================================================
  // CARRITO MULTI-ITEM & CHECKOUT CONSOLIDADO
  // =========================================================================
  function setupCartDrawer() {
    const floatingBar = document.getElementById("floating-cart-bar");
    if (floatingBar) {
      floatingBar.addEventListener("click", openCartDrawer);
    }

    // Selector de Zonas de Envío
    const zoneSelect = document.getElementById("cart-neighborhood-select");
    if (zoneSelect) {
      zoneSelect.innerHTML = COLOMBIAN_SHIPPING_ZONES.map((z, idx) => {
        return `<option value="${idx}">${z.name} - ${db.formatCOP(z.fee)} (${z.time})</option>`;
      }).join("");

      zoneSelect.addEventListener("change", (e) => {
        cartSelectedZone = COLOMBIAN_SHIPPING_ZONES[parseInt(e.target.value, 10)];
        renderCartDrawer();
      });
    }

    // Modalidad de despacho
    const radioSecured = document.querySelector('input[name="cart-dispatch-mode"][value="secured"]');
    const radioCOD = document.querySelector('input[name="cart-dispatch-mode"][value="cod"]');
    const labelSecured = document.getElementById("label-dispatch-secured");
    const labelCOD = document.getElementById("label-dispatch-cod");

    if (radioSecured && radioCOD) {
      radioSecured.addEventListener("change", () => {
        cartDispatchMode = "secured";
        labelSecured.classList.add("selected");
        labelCOD.classList.remove("selected");
      });
      radioCOD.addEventListener("change", () => {
        cartDispatchMode = "cod";
        labelCOD.classList.add("selected");
        labelSecured.classList.remove("selected");
      });
    }

    // Botón Enviar Pedido por WhatsApp
    const btnSendWhatsApp = document.getElementById("cart-btn-send-whatsapp");
    if (btnSendWhatsApp) {
      btnSendWhatsApp.addEventListener("click", () => {
        if (cartItems.length === 0) {
          alert("Tu pedido está vacío. Agrega al menos un bolso.");
          return;
        }

        const name = document.getElementById("cart-client-name").value.trim();
        const phone = document.getElementById("cart-client-phone").value.trim();
        const address = document.getElementById("cart-client-address").value.trim();

        if (!name || !phone || !address) {
          alert("Por favor completa tu Nombre, WhatsApp y Dirección para liquidar el envío.");
          return;
        }

        const store = db.getCurrentStore();
        const customerData = { name, phone, address };
        const waUrl = db.buildConsolidatedCartWhatsAppUrl(store, cartItems, customerData, cartSelectedZone, cartDispatchMode);

        window.open(waUrl, "_blank");
        showToast("Pedido consolidado enviado a WhatsApp.");
      });
    }
  }

  function addToCart(product, colorway, quantity) {
    const colorName = colorway ? colorway.name : "Color Original";
    const existingIndex = cartItems.findIndex(i => i.productId === product.id && i.colorway === colorName);

    if (existingIndex > -1) {
      cartItems[existingIndex].quantity += quantity;
    } else {
      cartItems.push({
        productId: product.id,
        name: product.name,
        colorway: colorName,
        image: colorway && colorway.image ? colorway.image : product.image,
        price: product.storeRetailPrice,
        quantity: quantity
      });
    }

    saveCartToStorage();
    updateFloatingCartBar();
    showToast(`🛍️ ${quantity} bolso(s) agregado(s) a tu pedido.`);
  }

  function removeFromCart(index) {
    cartItems.splice(index, 1);
    saveCartToStorage();
    updateFloatingCartBar();
    renderCartDrawer();
  }

  function openCartDrawer() {
    renderCartDrawer();
    openModal("modal-cart-drawer");
  }

  function renderCartDrawer() {
    const container = document.getElementById("cart-drawer-items");
    const countLabel = document.getElementById("cart-drawer-count");
    if (!container) return;

    const totalCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
    if (countLabel) countLabel.textContent = totalCount;

    if (cartItems.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-muted);">
          <div style="font-size: 32px; margin-bottom: 6px;">🛍️</div>
          <div>No tienes bolsos en tu pedido todavía.</div>
        </div>
      `;
    } else {
      container.innerHTML = cartItems.map((item, idx) => {
        return `
          <div class="cart-item-row">
            <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
            <div class="cart-item-info">
              <div class="cart-item-title">${item.name}</div>
              <div class="cart-item-meta">Color: ${item.colorway} · Cant: ${item.quantity} und</div>
              <div class="cart-item-price">${db.formatCOP(item.price * item.quantity)}</div>
            </div>
            <button type="button" class="cart-item-remove btn-remove-item" data-index="${idx}" title="Eliminar">&times;</button>
          </div>
        `;
      }).join("");

      container.querySelectorAll(".btn-remove-item").forEach(btn => {
        btn.addEventListener("click", () => {
          removeFromCart(parseInt(btn.dataset.index, 10));
        });
      });
    }

    // Liquidación
    const subtotal = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const shipping = cartSelectedZone ? cartSelectedZone.fee : 12000;
    const total = subtotal + shipping;

    document.getElementById("cart-summary-qty").textContent = totalCount;
    document.getElementById("cart-summary-shoes").textContent = `${db.formatCOP(subtotal)} COP`;
    document.getElementById("cart-summary-shipping").textContent = `${db.formatCOP(shipping)} COP`;
    document.getElementById("cart-summary-total").textContent = `${db.formatCOP(total)} COP`;
    const fletePreview = document.getElementById("cart-flete-preview");
    if (fletePreview) fletePreview.textContent = `${db.formatCOP(shipping)} COP`;
  }

  function updateFloatingCartBar() {
    const floatingBar = document.getElementById("floating-cart-bar");
    if (!floatingBar) return;

    const totalCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
    const subtotal = cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);

    if (totalCount > 0) {
      floatingBar.classList.add("visible");
      document.getElementById("floating-cart-count").textContent = totalCount;
      document.getElementById("floating-cart-total").textContent = db.formatCOP(subtotal);
    } else {
      floatingBar.classList.remove("visible");
    }
  }

  function saveCartToStorage() {
    localStorage.setItem(DB_KEYS.CART_ITEMS, JSON.stringify(cartItems));
  }

  function loadCartFromStorage() {
    try {
      const raw = localStorage.getItem(DB_KEYS.CART_ITEMS);
      cartItems = raw ? JSON.parse(raw) : [];
    } catch (e) {
      cartItems = [];
    }
  }

  function startReservationTimer() {
    let timeLeft = 20 * 60; // 20 minutos
    const countdownEl = document.getElementById("cart-timer-countdown");

    setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        if (countdownEl) {
          countdownEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
      }
    }, 1000);
  }

  // =========================================================================
  // GESTIÓN DE MODALES DE CONFIGURACIÓN & REPOSICIÓN
  // =========================================================================
  function setupAdminStoreActions() {
    const btnOpenSettings = document.getElementById("btn-open-store-settings");
    if (btnOpenSettings) {
      btnOpenSettings.addEventListener("click", () => {
        const store = db.getCurrentStore();
        document.getElementById("setting-store-name").value = store.name;
        document.getElementById("setting-store-tagline").value = store.tagline || "";
        document.getElementById("setting-store-phone").value = store.phone || "";
        document.getElementById("setting-store-location").value = store.neighborhood || "";
        openModal("modal-store-settings");
      });
    }

    const formSettings = document.getElementById("form-store-settings");
    if (formSettings) {
      formSettings.addEventListener("submit", (e) => {
        e.preventDefault();
        const store = db.getCurrentStore();
        db.updateStoreProfile(store.id, {
          name: document.getElementById("setting-store-name").value,
          tagline: document.getElementById("setting-store-tagline").value,
          phone: document.getElementById("setting-store-phone").value,
          neighborhood: document.getElementById("setting-store-location").value
        });
        closeModal("modal-store-settings");
        updateAuthHUD();
        renderCurrentView();
        showToast("Configuración de tienda guardada exitosamente.");
      });
    }

    // Modal Cargar Producto Maestro
    const btnOpenNewProd = document.getElementById("btn-open-new-product-modal");
    if (btnOpenNewProd) {
      btnOpenNewProd.addEventListener("click", () => {
        openModal("modal-new-product");
      });
    }

    const formNewProd = document.getElementById("form-new-master-product");
    if (formNewProd) {
      formNewProd.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("new-prod-name").value;
        const sku = document.getElementById("new-prod-sku").value;
        const category = document.getElementById("new-prod-category").value;
        const image = document.getElementById("new-prod-image").value;
        const wholesale = document.getElementById("new-prod-wholesale").value;
        const suggested = document.getElementById("new-prod-suggested").value;
        const dimensions = document.getElementById("new-prod-dim").value;
        const desc = document.getElementById("new-prod-desc").value;

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

        closeModal("modal-new-product");
        formNewProd.reset();
        renderSupplierAdmin();
        showToast("✨ Nueva referencia publicada al catálogo maestro.");
      });
    }

    // Modal Reposición B2B
    const formRestock = document.getElementById("form-restock-order");
    if (formRestock) {
      formRestock.addEventListener("submit", (e) => {
        e.preventDefault();
        const store = db.getCurrentStore();
        const prodId = document.getElementById("restock-prod-id").value;
        const masterProducts = db.getMasterProducts();
        const prod = masterProducts.find(p => p.id === prodId);
        if (!prod) return;

        const sizeSelect = document.getElementById("restock-size-select");
        const selectedColorway = sizeSelect.value;
        const units = parseInt(document.getElementById("restock-units-input").value, 10);
        const total = units * prod.wholesalePrice;

        db.createB2BOrder({
          storeName: store.name,
          productName: prod.name,
          colorway: selectedColorway,
          units: units,
          totalWholesale: total,
          supplierName: prod.supplierName
        });

        closeModal("modal-restock");
        showToast(`📦 Pedido B2B de ${units} bolsos enviado a Bodega Matriz.`);
      });
    }
  }

  function openRestockModal(prodId) {
    const master = db.getMasterProducts();
    const prod = master.find(p => p.id === prodId);
    if (!prod) return;

    document.getElementById("restock-prod-id").value = prod.id;
    document.getElementById("restock-prod-title").textContent = prod.name;
    document.getElementById("restock-supplier-name").textContent = prod.supplierName;
    document.getElementById("restock-wholesale-price").textContent = `Costo Mayorista: ${db.formatCOP(prod.wholesalePrice)} COP`;

    const sizeSelect = document.getElementById("restock-size-select");
    const colorways = prod.colorways || [{ name: "Tono Estándar" }];
    sizeSelect.innerHTML = colorways.map(cw => `<option value="${cw.name}">${cw.name}</option>`).join("");

    const unitsInput = document.getElementById("restock-units-input");
    const totalCalc = document.getElementById("restock-total-calc");

    function calcRestock() {
      const units = parseInt(unitsInput.value || 1, 10);
      totalCalc.textContent = `${db.formatCOP(units * prod.wholesalePrice)} COP`;
    }

    unitsInput.oninput = calcRestock;
    calcRestock();

    openModal("modal-restock");
  }

  // =========================================================================
  // IMPORTADOR RÁPIDO DESDE WHATSAPP (BODEGA)
  // =========================================================================
  function setupSupplierFastImporter() {
    const btnParse = document.getElementById("btn-parse-wa-text");
    const textarea = document.getElementById("wa-import-textarea");

    if (btnParse && textarea) {
      btnParse.addEventListener("click", () => {
        const text = textarea.value;
        if (!text || text.trim() === "") {
          alert("Pega primero el texto del grupo de WhatsApp con la descripción y precio del bolso.");
          return;
        }

        const parsed = db.parseWhatsAppWholesaleText(text);
        if (parsed) {
          db.addMasterProduct(parsed);
          textarea.value = "";
          renderSupplierAdmin();
          showToast(`✨ Referencia detectada y publicada: ${parsed.name} (${db.formatCOP(parsed.wholesalePrice)})`);
        } else {
          alert("No se pudo interpretar el texto. Asegúrate de incluir el precio (ej: $68.000).");
        }
      });
    }
  }

  // =========================================================================
  // FILTROS & BÚSQUEDA EN STOREFRONT
  // =========================================================================
  function setupFilters() {
    // Chips de Categoría
    const brandChips = document.querySelectorAll(".brand-chip-btn");
    brandChips.forEach(chip => {
      chip.addEventListener("click", () => {
        brandChips.forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        selectedCategory = chip.dataset.brand;
        renderStorefront();
      });
    });

    // Pills de Tamaño
    const sizePills = document.querySelectorAll("#storefront-size-pills .size-pill-btn");
    sizePills.forEach(pill => {
      pill.addEventListener("click", () => {
        sizePills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        selectedSize = pill.dataset.size;
        renderStorefront();
      });
    });

    // Pills de Color
    const colorPills = document.querySelectorAll("#storefront-color-pills .size-pill-btn");
    colorPills.forEach(pill => {
      pill.addEventListener("click", () => {
        colorPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        selectedColor = pill.dataset.color;
        renderStorefront();
      });
    });

    // Input de Búsqueda
    const searchInput = document.getElementById("storefront-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderStorefront();
      });
    }

    // Select de Categoría
    const catSelect = document.getElementById("storefront-category-select");
    if (catSelect) {
      catSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val === "all") selectedCategory = "all";
        else if (val.includes("Totes")) selectedCategory = "totes";
        else if (val.includes("Crossbody")) selectedCategory = "crossbody";
        else if (val.includes("Satchel")) selectedCategory = "satchel";
        else if (val.includes("Morrales")) selectedCategory = "morrales";
        else if (val.includes("Billeteras")) selectedCategory = "billeteras";
        renderStorefront();
      });
    }

    // Select de Ordenamiento
    const sortSelect = document.getElementById("storefront-sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        currentSort = e.target.value;
        renderStorefront();
      });
    }
  }

  // =========================================================================
  // UTILIDADES GLOBALES (MODALES & TOASTS)
  // =========================================================================
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("open");
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("open");
  }

  function showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span>⚡</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
});
