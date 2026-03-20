'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  Banner,
  Badge,
  BlockStack,
  InlineStack,
  Box,
  Divider,
} from '@shopify/polaris';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    limit: '5 products',
    features: ['5 product passports', 'QR code generation', 'Public passport pages', 'AI auto-fill (5 uses/mo)'],
    cta: 'Current plan',
    highlight: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    limit: '50 products',
    features: ['50 product passports', 'All Free features', 'Unlimited AI auto-fill', 'Custom widget colors', '7-day free trial'],
    cta: 'Start free trial',
    highlight: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 79,
    limit: '500 products',
    features: ['500 product passports', 'All Starter features', 'Priority support', 'Bulk import (CSV)', '7-day free trial'],
    cta: 'Start free trial',
    highlight: true,
  },
  {
    id: 'brand',
    name: 'Brand',
    price: 149,
    limit: 'Unlimited',
    features: ['Unlimited passports', 'All Growth features', 'Custom branding on passport', 'API access', 'Dedicated support', '7-day free trial'],
    cta: 'Start free trial',
    highlight: false,
  },
];

function BillingPageInner() {
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop') ?? '';
  const status = searchParams.get('status');
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!shop) return;
    fetch(`/api/billing?shop=${shop}`)
      .then((r) => r.json())
      .then((d) => setCurrentPlan(d.plan ?? 'free'));
  }, [shop]);

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free' || planId === currentPlan) return;
    setLoading(planId);
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop, plan: planId }),
      });
      const { confirmationUrl, error } = await res.json();
      if (error) {
        alert(error);
        return;
      }
      window.top ? (window.top.location.href = confirmationUrl) : (window.location.href = confirmationUrl);
    } catch {
      alert('Failed to initiate upgrade. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Page
      title="Plans & Billing"
      subtitle="Choose the right plan for your brand's passport volume"
      backAction={{ content: 'Dashboard', url: `/admin?shop=${shop}` }}
    >
      <Layout>
        {status === 'success' && (
          <Layout.Section>
            <Banner tone="success" title="Upgrade successful! Your plan has been activated." />
          </Layout.Section>
        )}
        {status === 'declined' && (
          <Layout.Section>
            <Banner tone="warning" title="Upgrade cancelled. You remain on your current plan." />
          </Layout.Section>
        )}

        <Layout.Section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {PLANS.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              return (
                <div
                  key={plan.id}
                  style={{
                    background: '#fff',
                    border: `2px solid ${plan.highlight ? '#16a34a' : isCurrent ? '#0ea5e9' : '#f1f5f9'}`,
                    borderRadius: 16,
                    padding: 24,
                    position: 'relative',
                  }}
                >
                  {plan.highlight && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#16a34a',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 12px',
                        borderRadius: 20,
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      Most Popular
                    </div>
                  )}
                  <BlockStack gap="300">
                    <InlineStack align="space-between">
                      <Text as="h3" variant="headingLg" fontWeight="bold">{plan.name}</Text>
                      {isCurrent && <Badge tone="info">Current</Badge>}
                    </InlineStack>
                    <div>
                      <span style={{ fontSize: 36, fontWeight: 800, color: '#0f172a' }}>
                        {plan.price === 0 ? 'Free' : `$${plan.price}`}
                      </span>
                      {plan.price > 0 && (
                        <span style={{ fontSize: 14, color: '#94a3b8', marginLeft: 4 }}>/month</span>
                      )}
                    </div>
                    <Text as="p" tone="subdued" variant="bodySm">{plan.limit} · DPP passports</Text>
                    <Divider />
                    <BlockStack gap="150">
                      {plan.features.map((f) => (
                        <Text key={f} as="p" variant="bodySm">
                          <span style={{ color: '#16a34a', marginRight: 6 }}>✓</span>{f}
                        </Text>
                      ))}
                    </BlockStack>
                    <Button
                      variant={plan.highlight ? 'primary' : 'secondary'}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrent || plan.id === 'free'}
                      loading={loading === plan.id}
                      fullWidth
                    >
                      {isCurrent ? 'Current plan' : plan.cta}
                    </Button>
                  </BlockStack>
                </div>
              );
            })}
          </div>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">Billing FAQ</Text>
              <Text as="p" variant="bodySm" tone="subdued">
                <strong>Do I need a credit card for the free trial?</strong><br />
                No. Your free trial is activated through your Shopify account — no separate payment info needed.
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                <strong>Can I downgrade?</strong><br />
                Yes. Downgrading takes effect at the end of your current billing cycle.
                Passports over your new limit will remain visible but not editable.
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                <strong>Is billing handled by Shopify?</strong><br />
                Yes. All charges appear on your Shopify invoice — we use Shopify&apos;s native Billing API.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingPageInner />
    </Suspense>
  );
}
