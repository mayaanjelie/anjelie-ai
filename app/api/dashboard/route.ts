import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get('shop');
  if (!shop) return NextResponse.json({ error: 'Missing shop' }, { status: 400 });

  const { data: shopData, error: shopError } = await supabase
    .from('shops')
    .select('id, plan')
    .eq('shopify_domain', shop)
    .single();

  if (shopError || !shopData) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }

  const { data: passports } = await supabase
    .from('product_passports')
    .select('compliance_score')
    .eq('shop_id', shopData.id);

  const totalPassports = passports?.length ?? 0;
  const compliantPassports = passports?.filter((p) => p.compliance_score >= 75).length ?? 0;

  return NextResponse.json({
    totalPassports,
    compliantPassports,
    plan: shopData.plan,
  });
}
