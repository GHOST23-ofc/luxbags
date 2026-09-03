# 📖 BAGS WORLD MLS — Cómo Funciona Todo (Para Dummies)

---

## ¿Qué es esto en una frase?

**Un catálogo mayorista compartido de bolsos.** Una bodega central (tú) sube las referencias reales de bolsos, y múltiples boutiques clientes las publican en sus propias vitrinas con sus propios precios. Los pedidos salen por WhatsApp. No hay carrito de pagos online — es contraentrega colombiana.

---

## Los 3 Roles del Sistema

```
┌─────────────────────────────────────────────────────┐
│                  TÚ (Super Admin)                   │
│          BAGS WORLD Colombia - Bodega Matriz         │
│  admin@bagsworld.com / BastionSaaS2026*             │
├─────────────────────────────────────────────────────┤
│                                                     │
│    ┌──────────────┐       ┌──────────────────┐      │
│    │  BolsosCOL   │       │ Calibolsos 2026  │      │
│    │  (Bogotá)    │       │    (Cali)        │      │
│    │  Dueña de    │       │  Dueña de        │      │
│    │  boutique    │       │  boutique        │      │
│    └──────┬───────┘       └───────┬──────────┘      │
│           │                       │                  │
│     Sus clientes            Sus clientes             │
│     finales ven             finales ven              │
│     SU vitrina              SU vitrina               │
└─────────────────────────────────────────────────────┘
```

### Rol 1: 👜 **Tu Tienda** (Vitrina Pública)
- Es lo que ve el **cliente final** de cada boutique.
- Muestra las tarjetas de bolsos con fotos reales, selector de colores, precio personalizado por la boutique y botón de WhatsApp.
- Tiene filtros por categoría (Totes, Crossbody, Satchel, Morrales, Billeteras), por tamaño (Compacto / Mediano / Maxi), por color, y buscador de texto.
- El carrito consolida pedidos múltiples y genera un mensaje de WhatsApp con todos los bolsos, dirección del cliente, zona de despacho y flete calculado.

### Rol 2: 🏪 **Panel de Mi Tienda** (Store Admin)
- Es el panel privado de cada boutique (BolsosCOL o Calibolsos).
- Aquí la dueña de boutique:
  - Ve todas las referencias de bodega con su **costo mayorista**.
  - Ajusta su **precio de venta (PVP)** — el sistema calcula el margen automáticamente.
  - Activa/desactiva bolsos de su vitrina (toggle on/off).
  - Modifica su perfil: nombre, tagline, WhatsApp, ubicación.
  - Cambia su correo y contraseña desde el panel de privacidad.
  - Descarga un respaldo (backup) JSON de su catálogo y pedidos.

### Rol 3: 📦 **Panel Bodega / Mayorista** (Super Admin — Tú)
- Solo visible para la cuenta `admin@bagsworld.com`.
- Aquí tú:
  - Ves el **Catálogo Maestro** (las 8 referencias reales de bodega con SKU, costo, PVP sugerido, medidas y variantes de color).
  - **Cargas nuevas referencias** manualmente o con el **Importador de WhatsApp** (pegas el texto del grupo mayorista y se auto-detecta nombre, precio, medidas y colores).
  - Ves la **tabla de clientes** con correo, contraseña, WhatsApp y ubicación de cada boutique.
  - **Restableces contraseñas** si un cliente la olvida (1 clic).
  - **Exportas un backup maestro** de todo el SaaS (productos, tiendas, pedidos).

### Rol 4: 📍 **Directorio de Boutiques**
- Muestra las boutiques activas en la red (como un marketplace de mayoristas).
- Incluye la **Calculadora ROI**: un slider donde ajustas "bolsos vendidos al mes" y "margen promedio" y te calcula la utilidad neta estimada.

---

## ¿Cómo funciona la Autenticación?

```
┌─────────────────────────────────────────────┐
│           MODAL DE LOGIN (🔐)               │
├─────────────────────────────────────────────┤
│                                             │
│  Opción A: Login con Correo + Contraseña    │
│  ────────────────────────────────────────   │
│  contacto@bolsoscol.com + BolsosCOL2026*    │
│  ventas@calibolsos.com  + Cali2026*         │
│  admin@bagsworld.com    + BastionSaaS2026*  │
│                                             │
│  Opción B: Acceso Demo Rápido (1 clic)      │
│  ────────────────────────────────────────   │
│  Botones para entrar directo a cada demo    │
│                                             │
└─────────────────────────────────────────────┘
```

- **Login real**: Busca correo + contraseña en `localStorage`. Si coincide → guarda sesión y carga la vitrina de esa tienda.
- **Quick Login**: Entra directo a cualquier tienda demo sin pedir credenciales (para demostración).
- **Logout**: Borra la sesión y regresa a BolsosCOL por defecto.
- **Privacidad**: Cada boutique puede cambiar su correo y contraseña. Si la olvida, tú (Super Admin) la reseteas desde el Panel Bodega.

---

## ¿Cómo fluye un Pedido?

```
1. Cliente final ve la VITRINA de BolsosCOL
2. Elige un bolso → selecciona color → toca "Pedir por WhatsApp"
   (o agrega al carrito y consolida varios bolsos)
3. Se abre WhatsApp con un mensaje PRE-ARMADO:
   - Nombre del bolso, color, SKU, medidas, precio
   - Datos del cliente (nombre, teléfono, dirección)
   - Zona de despacho + flete calculado
   - Modalidad: Contraentrega o Asegurado (abono de flete)
4. La dueña de BolsosCOL recibe el WhatsApp y confirma disponibilidad
5. BAGS WORLD (bodega) despacha por contraentrega nacional
```

> **No hay pasarela de pagos.** Todo se cierra por WhatsApp + contraentrega. Esto es coherente con el modelo mayorista colombiano real.

---

## ¿Dónde vive la Data?

| Dato | Clave localStorage | Reset automático |
|---|---|---|
| Catálogo de 8 bolsos | `bagsworld_master_products_v11` | Si se corrompe o tiene < 8 productos |
| 3 tiendas (2 clientes + admin) | `bagsworld_stores_v11` | Si falta `store-bolsoscol` |
| Pedidos demo | `bagsworld_orders_v11` | Si se corrompe |
| Sesión activa | `bagsworld_auth_session_v11` | Al hacer logout |
| Carrito | `bagsworld_cart_items_v11` | Al hacer reset demo |

> **Importante**: Todo vive en `localStorage` del navegador. Si el usuario borra datos del navegador, se pierden. El botón "Reset Demo" restaura todo a los valores iniciales.

---

## Zonas de Despacho y Fletes

| Zona | Tarifa | Tiempo |
|---|---|---|
| Bogotá D.C. | $14,000 | 24-48h |
| Cali Urbano | $12,000 | Mismo día (2-4h) |
| Jamundí/Palmira/Yumbo | $16,000 | Mismo día / 24h |
| Medellín Urbano | $14,000 | Mismo día / 24h |
| Barranquilla | $16,000 | 24-48h |
| Bucaramanga | $15,000 | 24-48h |
| Eje Cafetero | $15,000 | 24-48h |
| Nacional (otras) | $18,000 | 2-3 días |

---

## Archivos del Proyecto

| Archivo | Qué hace |
|---|---|
| [`index.html`](file:///Users/davidrip/Documents/SHOES/index.html) | Las 4 vistas + modales (login, privacidad, carrito, nuevo producto, configurar tienda) |
| [`css/style.css`](file:///Users/davidrip/Documents/SHOES/css/style.css) | Tema oscuro completo + grid de puntos dorados de fondo |
| [`js/mockData.js`](file:///Users/davidrip/Documents/SHOES/js/mockData.js) | Los 8 productos reales, 3 tiendas demo, zonas de envío, pedidos iniciales |
| [`js/store.js`](file:///Users/davidrip/Documents/SHOES/js/store.js) | Clase `BagsWorldStoreManager` — auth, CRUD, backups, WhatsApp URLs, parser |
| [`js/app.js`](file:///Users/davidrip/Documents/SHOES/js/app.js) | Renderizado de vistas, eventos, filtros, carrito, modales, canvas de fondo |
| [`js/canvasBackground.js`](file:///Users/davidrip/Documents/SHOES/js/canvasBackground.js) | Animación de partículas del canvas de fondo |

---

## ✅ Validación de Coherencia

### Lo que SÍ es coherente:
- **Modelo MLS (Multiple Listing Service)**: Correcto. Un catálogo maestro compartido donde cada boutique pone su precio. Así funcionan las bolsas mayoristas en Colombia realmente.
- **WhatsApp como canal de cierre**: Correcto para Colombia. No tiene sentido meter Stripe/MercadoPago en un modelo B2B mayorista de contraentrega.
- **Auth con correo + contraseña en localStorage**: Coherente para un **demo/MVP**. No necesitas Firebase ni Supabase auth para 2-3 clientes demo.
- **Importador de WhatsApp**: Coherente. Los mayoristas comparten catálogos por grupos de WhatsApp con texto plano. El parser auto-detecta nombre, precio y medidas.
- **Backups JSON descargables**: Coherente como red de seguridad para un sistema localStorage.
- **Fletes por zona**: Coherente con las tarifas reales de Coordinadora, Servientrega, etc.

### ⚠️ Puntos que necesitan atención si escala:

| Punto | Estado actual | Si escala a 10+ clientes |
|---|---|---|
| Data en localStorage | Perfecto para demo | Migrar a Supabase/Firebase |
| Contraseñas en texto plano | OK en demo local | Hashear con bcrypt en backend |
| Imágenes de bolsos | Rutas locales `assets/images/bags/` | Subir a CDN (Cloudinary, Vercel Blob) |
| Sin stock real | No hay conteo de unidades | Agregar campo `stock` por variante |
| Sin notificaciones | Todo es manual por WhatsApp | Agregar webhooks o Twilio para confirmar pedidos |

> [!TIP]
> **Para el estado actual (demo de cierre con 2 clientes)**, el sistema es coherente y funcional. Los puntos de arriba son para cuando quieras escalar a producción real con 10+ boutiques.

---

## Resumen en 30 Segundos

1. Tú subes los bolsos reales a la bodega central
2. Tus clientas (BolsosCOL, Calibolsos) ven el catálogo y ponen SU precio
3. Los clientes finales de cada boutique ven UNA vitrina limpia con botón de WhatsApp
4. El pedido sale formateado por WhatsApp → tú despachas por contraentrega
5. Cada clienta controla su propia clave y datos; si la pierde, tú la reseteas
6. Todo corre en el navegador, cero servidores, cero costos mensuales
