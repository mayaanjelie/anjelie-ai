import { NextRequest, NextResponse } from 'next/server';
import { shopify } from '@/lib/shopify';
import { supabase } from '@/lib/supabase';
import { sessionStorage } from '@/lib/session';

export async function POST(req: NextRequest) {
  const topic = req.headers.get('x-shopify-topic') ?? '';
  const shop = req.headers.get('x-shopify-shop-domain') ?? '';
  const hmac = req.headers.get('x-shopify-hmac-sha256') ?? '';

  const rawBody = await req.text();

  // Verify webhook authenticity
  const isValid = await shopify.webhooks.validate({
    rawBody,
    rawRequest: req,
  });

  if (!isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  switch (topic) {
    case 'app/uninstalled': {
      // Delete shop data
      const { data: shopData } = await supabase
        .from('shops')
        .select('id')
        .eq('shopify_domain', shop)
        .single();

      if (shopData) {
        await supabase.from('product_passports').delete().eq('shop_id', shopData.id);
        await supabase.from('shops').delete().eq('id', shopData.id);
      }

      // Delete sessions
      const sessions = await sessionStorage.findSessionsByShop(shop);
      await sessionStorage.deleteSessions(sessions.map((s) => s.id));
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ ok: true });
}
