import { NextRequest, NextResponse } from 'next/server';
import { shopify } from '@/lib/shopify';
import { sessionStorage } from '@/lib/session';

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Missing shop parameter' }, { status: 400 });
  }

  const sanitizedShop = shopify.utils.sanitizeShop(shop, true);
  if (!sanitizedShop) {
    return NextResponse.json({ error: 'Invalid shop parameter' }, { status: 400 });
  }

  const { headers, url } = await shopify.auth.begin({
    shop: sanitizedShop,
    callbackPath: '/api/auth/callback',
    isOnline: false,
    rawRequest: req,
  });

  const response = NextResponse.redirect(url);
  // Copy auth headers (nonce cookie)
  headers.forEach((value: string, key: string) => {
    response.headers.set(key, value);
  });

  return response;
}
