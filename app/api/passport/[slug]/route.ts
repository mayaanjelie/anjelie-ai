import { NextRequest, NextResponse } from 'next/server';
import { supabasePublic } from '@/lib/supabase';

// Public endpoint — no auth required (used by public passport page)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { data: passport, error } = await supabasePublic
    .from('product_passports')
    .select(`
      *,
      shops (
        shopify_domain,
        widget_primary_color
      )
    `)
    .eq('passport_slug', slug)
    .single();

  if (error || !passport) {
    return NextResponse.json({ error: 'Passport not found' }, { status: 404 });
  }

  return NextResponse.json({ passport });
}
