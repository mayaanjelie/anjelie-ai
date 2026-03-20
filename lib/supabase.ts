import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _supabasePublic: SupabaseClient | null = null;

// Server-side client with service role (bypasses RLS for server operations)
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _supabase;
}

// Public client for browser-safe operations (respects RLS)
export function getSupabasePublic(): SupabaseClient {
  if (!_supabasePublic) {
    _supabasePublic = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _supabasePublic;
}

// Convenience proxies — these work at call time, not import time
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const supabasePublic = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabasePublic() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type Shop = {
  id: string;
  shopify_domain: string;
  access_token: string;
  plan: 'free' | 'starter' | 'growth' | 'brand';
  created_at: string;
};

export type ProductPassport = {
  id: string;
  shop_id: string;
  shopify_product_id: string;
  product_title: string;
  product_image?: string;
  fiber_composition: FiberItem[];
  country_of_manufacture: string;
  carbon_footprint?: number | null;
  care_instructions: string;
  recycling_instructions: string;
  repairability_score?: number | null;
  certifications: string[];
  supplier_name?: string;
  supplier_country?: string;
  compliance_score: number;
  passport_url?: string;
  passport_slug: string;
  created_at: string;
  updated_at: string;
};

export type FiberItem = {
  material: string;
  percentage: number;
};

export const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  starter: 50,
  growth: 500,
  brand: Infinity,
};

export const PLAN_PRICES: Record<string, number> = {
  free: 0,
  starter: 29,
  growth: 79,
  brand: 149,
};
