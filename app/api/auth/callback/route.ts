import { NextRequest, NextResponse } from 'next/server';
import { shopify } from '@/lib/shopify';
import { sessionStorage } from '@/lib/session';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { session, headers } = await shopify.auth.callback({
      rawRequest: req,
    });

    // Persist session
    await sessionStorage.storeSession(session);

    // Upsert shop record in Supabase
    await supabase.from('shops').upsert({
      shopify_domain: session.shop,
      access_token: session.accessToken,
      plan: 'free',
    }, { onConflict: 'shopify_domain' });

    // Register mandatory webhooks
    await registerWebhooks(session.shop, session.accessToken!);

    const host = req.nextUrl.searchParams.get('host');
    const redirectUrl = host
      ? `${process.env.HOST}/admin?shop=${session.shop}&host=${host}`
      : `${process.env.HOST}/admin?shop=${session.shop}`;

    const response = NextResponse.redirect(redirectUrl);
    headers.forEach((value: string, key: string) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

async function registerWebhooks(shop: string, accessToken: string) {
  const webhooks = [
    { topic: 'APP_UNINSTALLED', address: `${process.env.HOST}/api/webhooks` },
    { topic: 'SHOP_UPDATE', address: `${process.env.HOST}/api/webhooks` },
  ];

  for (const webhook of webhooks) {
    try {
      await fetch(`https://${shop}/admin/api/2024-01/webhooks.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ webhook }),
      });
    } catch (e) {
      console.error(`Failed to register webhook ${webhook.topic}:`, e);
    }
  }
}
