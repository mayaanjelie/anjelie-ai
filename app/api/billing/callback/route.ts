import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const shop = req.nextUrl.searchParams.get('shop');
  const plan = req.nextUrl.searchParams.get('plan');
  const chargeId = req.nextUrl.searchParams.get('charge_id');

  if (!shop || !plan || !chargeId) {
    return NextResponse.redirect(`${process.env.HOST}/admin?shop=${shop}&billing=error`);
  }

  try {
    // Verify charge was accepted with Shopify
    const { data: shopData } = await supabase
      .from('shops')
      .select('access_token')
      .eq('shopify_domain', shop)
      .single();

    if (!shopData) throw new Error('Shop not found');

    const chargeRes = await fetch(
      `https://${shop}/admin/api/2024-01/recurring_application_charges/${chargeId}.json`,
      {
        headers: {
          'X-Shopify-Access-Token': shopData.access_token,
        },
      }
    );

    const { recurring_application_charge } = await chargeRes.json();

    if (recurring_application_charge.status !== 'accepted') {
      return NextResponse.redirect(
        `${process.env.HOST}/admin/billing?shop=${shop}&status=declined`
      );
    }

    // Activate the charge
    await fetch(
      `https://${shop}/admin/api/2024-01/recurring_application_charges/${chargeId}/activate.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': shopData.access_token,
        },
        body: JSON.stringify({ recurring_application_charge }),
      }
    );

    // Update shop plan in Supabase
    await supabase
      .from('shops')
      .update({
        plan,
        billing_charge_id: chargeId,
        billing_activated_on: new Date().toISOString(),
      })
      .eq('shopify_domain', shop);

    return NextResponse.redirect(
      `${process.env.HOST}/admin?shop=${shop}&billing=success&plan=${plan}`
    );
  } catch (error) {
    console.error('Billing callback error:', error);
    return NextResponse.redirect(
      `${process.env.HOST}/admin/billing?shop=${shop}&status=error`
    );
  }
}
