import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default supabase;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FiberEntry {
  material: string;
  percentage: number;
}

export interface ProductPassport {
  id: string;
  shop_id: string;
  shopify_product_id: string;
  product_title: string;
  fiber_composition: FiberEntry[];
  country_of_manufacture: string | null;
  carbon_footprint: number | null;
  care_instructions: string | null;
  recycling_instructions: string | null;
  repairability_score: number | null;
  certifications: string[];
  supplier_name: string | null;
  supplier_country: string | null;
  compliance_score: number;
  qr_code_base64: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shop {
  id: string;
  shopify_domain: string;
  access_token: string | null;
  plan: string;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function getOrCreateShop(domain: string): Promise<Shop> {
  const { data: existing } = await supabase
    .from("shops")
    .select("*")
    .eq("shopify_domain", domain)
    .single();

  if (existing) return existing as Shop;

  const { data, error } = await supabase
    .from("shops")
    .insert({ shopify_domain: domain })
    .select()
    .single();

  if (error) throw new Error(`Failed to create shop: ${error.message}`);
  return data as Shop;
}

export async function getPassportByProductId(
  shopId: string,
  productId: string
): Promise<ProductPassport | null> {
  const { data } = await supabase
    .from("product_passports")
    .select("*")
    .eq("shop_id", shopId)
    .eq("shopify_product_id", productId)
    .single();

  return (data as ProductPassport) ?? null;
}

export async function upsertPassport(
  passport: Omit<ProductPassport, "id" | "created_at" | "updated_at">
): Promise<ProductPassport> {
  const { data, error } = await supabase
    .from("product_passports")
    .upsert(passport, { onConflict: "shop_id,shopify_product_id" })
    .select()
    .single();

  if (error) throw new Error(`Failed to save passport: ${error.message}`);
  return data as ProductPassport;
}

export async function getAllPassportsByShop(shopId: string): Promise<ProductPassport[]> {
  const { data } = await supabase
    .from("product_passports")
    .select("*")
    .eq("shop_id", shopId)
    .order("updated_at", { ascending: false });

  return (data as ProductPassport[]) ?? [];
}

export async function getPassportById(passportId: string): Promise<ProductPassport | null> {
  const { data } = await supabase
    .from("product_passports")
    .select("*")
    .eq("id", passportId)
    .single();

  return (data as ProductPassport) ?? null;
}

export async function countPassportsByShop(shopId: string): Promise<number> {
  const { count } = await supabase
    .from("product_passports")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shopId);

  return count ?? 0;
}
