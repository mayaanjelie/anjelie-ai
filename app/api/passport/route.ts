import { NextRequest, NextResponse } from 'next/server';
import { supabase, PLAN_LIMITS } from '@/lib/supabase';
import { calculateComplianceScore } from '@/lib/compliance';

// GET /api/passport?shop=&productId=
export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get('shop');
  const productId = req.nextUrl.searchParams.get('productId');

  if (!shop || !productId) {
    return NextResponse.json({ error: 'Missing shop or productId' }, { status: 400 });
  }

  const { data: shopData } = await supabase
    .from('shops')
    .select('id')
    .eq('shopify_domain', shop)
    .single();

  if (!shopData) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

  const { data: passport } = await supabase
    .from('product_passports')
    .select('*')
    .eq('shop_id', shopData.id)
    .eq('shopify_product_id', productId)
    .single();

  return NextResponse.json({ passport: passport ?? null });
}

// POST /api/passport — create or update
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { shop, productId, productTitle, productImage, data } = body;

  if (!shop || !productId) {
    return NextResponse.json({ error: 'Missing shop or productId' }, { status: 400 });
  }

  const { data: shopData } = await supabase
    .from('shops')
    .select('id, plan')
    .eq('shopify_domain', shop)
    .single();

  if (!shopData) return NextResponse.json({ error: 'Shop not found' }, { status: 404 });

  // Check plan limits
  const { count } = await supabase
    .from('product_passports')
    .select('id', { count: 'exact', head: true })
    .eq('shop_id', shopData.id);

  const limit = PLAN_LIMITS[shopData.plan];
  const existing = await supabase
    .from('product_passports')
    .select('id')
    .eq('shop_id', shopData.id)
    .eq('shopify_product_id', productId)
    .single();

  // Only enforce limit for NEW passports
  if (!existing.data && (count ?? 0) >= limit) {
    return NextResponse.json(
      { error: `Plan limit reached. Upgrade to add more passports.`, code: 'PLAN_LIMIT' },
      { status: 403 }
    );
  }

  const complianceScore = calculateComplianceScore(data);

  const passportData = {
    shop_id: shopData.id,
    shopify_product_id: productId,
    product_title: productTitle,
    product_image: productImage,
    fiber_composition: data.fiber_composition ?? [],
    country_of_manufacture: data.country_of_manufacture ?? null,
    carbon_footprint: data.carbon_footprint ?? null,
    care_instructions: data.care_instructions ?? null,
    recycling_instructions: data.recycling_instructions ?? null,
    repairability_score: data.repairability_score ?? null,
    certifications: data.certifications ?? [],
    supplier_name: data.supplier_name ?? null,
    supplier_country: data.supplier_country ?? null,
    compliance_score: complianceScore,
  };

  const { data: upserted, error } = await supabase
    .from('product_passports')
    .upsert(passportData, { onConflict: 'shop_id,shopify_product_id' })
    .select()
    .single();

  if (error) {
    console.error('Passport upsert error:', error);
    return NextResponse.json({ error: 'Failed to save passport' }, { status: 500 });
  }

  return NextResponse.json({ passport: upserted });
}
