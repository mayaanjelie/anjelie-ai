import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get('shop');
  if (!shop) return NextResponse.json({ error: 'Missing shop' }, { status: 400 });

  // Get shop's access token
  const { data: shopData, error } = await supabase
    .from('shops')
    .select('id, access_token, plan')
    .eq('shopify_domain', shop)
    .single();

  if (error || !shopData) {
    return NextResponse.json({ error: 'Shop not authenticated' }, { status: 401 });
  }

  // Fetch products from Shopify Admin API
  const shopifyRes = await fetch(
    `https://${shop}/admin/api/2024-01/products.json?limit=250&fields=id,title,image,product_type,vendor`,
    {
      headers: {
        'X-Shopify-Access-Token': shopData.access_token,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!shopifyRes.ok) {
    return NextResponse.json({ error: 'Failed to fetch products from Shopify' }, { status: 502 });
  }

  const { products } = await shopifyRes.json();

  // Fetch existing passports for this shop
  const { data: passports } = await supabase
    .from('product_passports')
    .select('shopify_product_id, compliance_score, passport_slug, updated_at')
    .eq('shop_id', shopData.id);

  const passportMap = new Map(
    (passports ?? []).map((p) => [p.shopify_product_id, p])
  );

  // Merge Shopify products with passport data
  const enriched = (products ?? []).map((product: ShopifyProduct) => ({
    id: String(product.id),
    title: product.title,
    image: product.image?.src ?? null,
    product_type: product.product_type,
    vendor: product.vendor,
    passport: passportMap.get(String(product.id)) ?? null,
  }));

  return NextResponse.json({
    products: enriched,
    plan: shopData.plan,
    passportCount: passports?.length ?? 0,
  });
}

type ShopifyProduct = {
  id: number;
  title: string;
  image: { src: string } | null;
  product_type: string;
  vendor: string;
};
