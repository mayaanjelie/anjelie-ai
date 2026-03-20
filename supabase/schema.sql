-- PassPort App - Supabase Schema
-- Run this in your Supabase SQL editor

-- ============================================================
-- SHOPIFY SESSIONS (for OAuth session storage)
-- ============================================================
CREATE TABLE IF NOT EXISTS shopify_sessions (
  id TEXT PRIMARY KEY,
  shop TEXT NOT NULL,
  state TEXT NOT NULL,
  is_online BOOLEAN DEFAULT false,
  access_token TEXT,
  scope TEXT,
  expires TIMESTAMPTZ,
  online_access_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_shop ON shopify_sessions(shop);

-- ============================================================
-- SHOPS
-- ============================================================
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_domain TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'growth', 'brand')),
  billing_charge_id TEXT,
  billing_activated_on TIMESTAMPTZ,
  widget_primary_color TEXT DEFAULT '#16a34a',
  widget_bg_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCT PASSPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS product_passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  shopify_product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  product_image TEXT,

  -- Material composition: [{ material: "Cotton", percentage: 80 }, ...]
  fiber_composition JSONB DEFAULT '[]',

  country_of_manufacture TEXT,
  carbon_footprint DECIMAL(10, 2), -- kg CO2e per unit

  care_instructions TEXT,
  recycling_instructions TEXT,
  repairability_score SMALLINT CHECK (repairability_score BETWEEN 1 AND 5),

  -- Certifications: ["GOTS", "Fair Trade", "OEKO-TEX"]
  certifications JSONB DEFAULT '[]',

  supplier_name TEXT,
  supplier_country TEXT,

  compliance_score SMALLINT DEFAULT 0 CHECK (compliance_score BETWEEN 0 AND 100),

  -- Unique public URL identifier (short UUID)
  passport_slug TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(shop_id, shopify_product_id)
);

CREATE INDEX IF NOT EXISTS idx_passports_shop_id ON product_passports(shop_id);
CREATE INDEX IF NOT EXISTS idx_passports_slug ON product_passports(passport_slug);
CREATE INDEX IF NOT EXISTS idx_passports_product_id ON product_passports(shopify_product_id);

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shops_updated_at
  BEFORE UPDATE ON shops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER passports_updated_at
  BEFORE UPDATE ON product_passports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Note: We use service role key on server, so RLS is
-- primarily for extra safety. Public passport page reads
-- via anon key should only see published passports.
-- ============================================================
ALTER TABLE product_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Allow public reads on passports (for QR scan landing pages)
CREATE POLICY "Public can read passports"
  ON product_passports FOR SELECT
  USING (true);

-- Service role has full access (enforced by key, not policy)
