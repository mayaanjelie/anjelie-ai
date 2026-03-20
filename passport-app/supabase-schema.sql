-- ============================================================
-- PassPort — Supabase Schema
-- Run this in your Supabase project's SQL editor.
-- ============================================================

-- shops
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_domain TEXT UNIQUE NOT NULL,
  access_token TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- product passports
CREATE TABLE IF NOT EXISTS product_passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
  shopify_product_id TEXT NOT NULL,
  product_title TEXT NOT NULL,
  fiber_composition JSONB DEFAULT '[]'::jsonb,
  country_of_manufacture TEXT,
  carbon_footprint NUMERIC,
  care_instructions TEXT,
  recycling_instructions TEXT,
  repairability_score INTEGER CHECK (repairability_score BETWEEN 1 AND 5),
  certifications JSONB DEFAULT '[]'::jsonb,
  supplier_name TEXT,
  supplier_country TEXT,
  compliance_score INTEGER DEFAULT 0,
  qr_code_base64 TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shop_id, shopify_product_id)
);

-- Auto-update updated_at on passport changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS passport_updated_at ON product_passports;
CREATE TRIGGER passport_updated_at
  BEFORE UPDATE ON product_passports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_passports_shop_id ON product_passports(shop_id);
CREATE INDEX IF NOT EXISTS idx_passports_product_id ON product_passports(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_shops_domain ON shops(shopify_domain);

-- Row Level Security (optional — service key bypasses RLS)
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_passports ENABLE ROW LEVEL SECURITY;
