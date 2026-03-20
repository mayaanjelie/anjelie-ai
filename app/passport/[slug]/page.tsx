import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PassportView from '@/components/passport/PassportView';
import { supabasePublic } from '@/lib/supabase';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await supabasePublic
    .from('product_passports')
    .select('product_title')
    .eq('passport_slug', slug)
    .single();

  return {
    title: data ? `${data.product_title} — Product Passport` : 'Product Passport',
    description: 'EU Digital Product Passport — sustainability and material data for this product.',
  };
}

export default async function PassportPage({ params }: Props) {
  const { slug } = await params;
  const { data: passport, error } = await supabasePublic
    .from('product_passports')
    .select(`*, shops ( shopify_domain, widget_primary_color )`)
    .eq('passport_slug', slug)
    .single();

  if (error || !passport) notFound();

  return <PassportView passport={passport} />;
}
