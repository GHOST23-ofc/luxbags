-- ==============================================================================
-- SNEAKER WORLD MLS - SUPABASE POSTGRESQL PRODUCTION SCHEMA WITH RLS & REALTIME
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: PROVEEDORES / BODEGAS MATRICES
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY DEFAULT 'sup-' || uuid_generate_v4(),
    name TEXT NOT NULL,
    tagline TEXT,
    location TEXT NOT NULL DEFAULT 'San Andresito de la 38, Cali',
    whatsapp_lines JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA: PRODUCTOS MAESTROS (CATÁLOGO CENTRAL DE CALZADO)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT 'prod-snk-' || uuid_generate_v4(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    image TEXT NOT NULL,
    colorways JSONB NOT NULL DEFAULT '[]'::jsonb,
    wholesale_price NUMERIC NOT NULL, -- Precio al por mayor (CONFIDENCIAL)
    suggested_retail_price NUMERIC NOT NULL,
    sizes JSONB NOT NULL DEFAULT '[37,38,39,40,41,42]'::jsonb,
    supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA: TIENDAS SATÉLITES / VITRINAS MARCA BLANCA
CREATE TABLE IF NOT EXISTS stores (
    id TEXT PRIMARY KEY DEFAULT 'store-' || uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    tagline TEXT,
    phone TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    is_supplier_store BOOLEAN NOT NULL DEFAULT false,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    theme_color TEXT DEFAULT '#e6192e',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA: ASIGNACIÓN Y PRECIOS POR TIENDA
CREATE TABLE IF NOT EXISTS store_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    custom_price NUMERIC,
    active BOOLEAN NOT NULL DEFAULT true,
    available_sizes JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(store_id, product_id)
);

-- 6. TABLA: PEDIDOS Y COMANDAS B2B/B2C
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY DEFAULT 'ord-' || floor(random() * 90000 + 10000)::text,
    store_id TEXT REFERENCES stores(id) ON DELETE SET NULL,
    store_name TEXT NOT NULL,
    items JSONB NOT NULL, -- Array de pares con talla, colorway, cantidad y precio
    customer_name TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    shipping_zone TEXT,
    shipping_fee NUMERIC DEFAULT 0,
    total_retail NUMERIC NOT NULL,
    total_wholesale NUMERIC NOT NULL,
    dispatch_mode TEXT DEFAULT 'secured', -- secured (anticipo flete) | cod (contraentrega)
    status TEXT NOT NULL DEFAULT 'En Alistamiento', -- En Alistamiento | En Ruta Moto | Entregado | Cancelado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- VISTA PÚBLICA (PROTECCIÓN DE COSTOS MAYORISTAS)
-- Oculta 'wholesale_price' a visitantes públicos y clientes finales
-- ==============================================================================
CREATE OR REPLACE VIEW public_catalog AS
SELECT 
    p.id,
    p.sku,
    p.name,
    p.category,
    p.tagline,
    p.description,
    p.image,
    p.colorways,
    p.sizes,
    p.suggested_retail_price,
    sp.store_id,
    COALESCE(sp.custom_price, p.suggested_retail_price) as store_price,
    COALESCE(sp.available_sizes, p.sizes) as store_sizes,
    sp.active as store_active
FROM products p
LEFT JOIN store_products sp ON p.id = sp.product_id
WHERE p.is_active = true AND (sp.active = true OR sp.active IS NULL);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas (Lectura anónima del catálogo público)
CREATE POLICY "Public catalog viewable by anyone" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Stores viewable by anyone" ON stores
    FOR SELECT USING (is_active = true);

CREATE POLICY "Store products viewable by anyone" ON store_products
    FOR SELECT USING (active = true);

-- Políticas para Insertar Pedidos (Cualquier cliente puede generar un pedido)
CREATE POLICY "Anyone can create an order" ON orders
    FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- HABILITAR SUPABASE REALTIME
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE store_products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
