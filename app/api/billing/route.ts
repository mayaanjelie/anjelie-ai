import { NextRequest, NextResponse } from 'next/server';
import { supabase, PLAN_PRICES } from '@/lib/supabase';

const PLAN_NAMES: Record<string, string> = {
  starter: 'PassPort Starter',
  growth: 'PassPort Growth',
  brand: 'PassPort Brand',
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
  starter: 'Up to 50 product passports with full DPP features',
  growth: 'Up to 500 product passports — ideal for growing brands',
  brand: 'Unlimited passports — for established fashion brands',
};

export async function POST(req: NextRequest) {
  const { shop, plan } = await req.json();

  if (!shop || !plan) {
    return NextResponse.json({ error: 'Missing shop or plan' }, { status: 400 });
  }

  if (plan === 'free') {
    // Downgrade to free
    await supabase
      .from('shops')
      .update({ plan: 'free', billing_charge_id: null })
      .eq('shopify_domain', shop);
    return NextResponse.json({ ok: true });
  }

  const { data: shopData } = await supabase
    .from('shops')
    .select('access_token')
    .eq('shopify_domain', shop)
    .single();

  if (!shopData) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }

  // Create Shopify recurring charge
  const chargeRes = await fetch(
    `https://${shop}/admin/api/2024-01/recurring_application_charges.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': shopData.access_token,
      },
      body: JSON.stringify({
        recurring_application_charge: {
          name: PLAN_NAMES[plan],
          price: PLAN_PRICES[plan],
          return_url: `${process.env.HOST}/api/billing/callback?shop=${shop}&plan=${plan}`,
          test: process.env.NODE_ENV !== 'production',
          trial_days: 7,
          terms: PLAN_DESCRIPTIONS[plan],
        },
      }),
    }
  );

  if (!chargeRes.ok) {
    const err = await chargeRes.json();
    console.error('Shopify billing error:', err);
    return NextResponse.json({ error: 'Failed to create billing charge' }, { status: 502 });
  }

  const { recurring_application_charge } = await chargeRes.json();

  return NextResponse.json({
    confirmationUrl: recurring_application_charge.confirmation_url,
    chargeId: recurring_application_charge.id,
  });
}

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get('shop');
  if (!shop) return NextResponse.json({ error: 'Missing shop' }, { status: 400 });

  const { data } = await supabase
    .from('shops')
    .select('plan, billing_charge_id, billing_activated_on')
    .eq('shopify_domain', shop)
    .single();

  return NextResponse.json(data ?? { plan: 'free' });
}
