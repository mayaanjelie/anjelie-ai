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
  SkeletonBodyText,
  SkeletonDisplayText,
  Badge,
  BlockStack,
  InlineStack,
  Box,
  Divider,
} from '@shopify/polaris';
import Link from 'next/link';

type DashboardStats = {
  totalPassports: number;
  compliantPassports: number;
  plan: string;
  passportLimit: number;
};

const PLAN_NAMES: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  growth: 'Growth',
  brand: 'Brand',
};

const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  starter: 50,
  growth: 500,
  brand: Infinity,
};

function AdminDashboardInner() {
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop') ?? '';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shop) return;
    fetch(`/api/dashboard?shop=${shop}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [shop]);

  const planLimit = stats ? PLAN_LIMITS[stats.plan] : 5;
  const usagePercent = stats
    ? Math.min((stats.totalPassports / planLimit) * 100, 100)
    : 0;

  return (
    <Page
      title="PassPort Dashboard"
      subtitle="EU Digital Product Passports for your fashion brand"
      primaryAction={
        <Link href={`/admin/products?shop=${shop}`}>
          <Button variant="primary" size="large">
            Manage Products
          </Button>
        </Link>
      }
    >
      <Layout>
        {error && (
          <Layout.Section>
            <Banner tone="critical" title="Error loading dashboard">
              <p>{error}</p>
            </Banner>
          </Layout.Section>
        )}

        {loading ? (
          <Layout.Section>
            <Card>
              <SkeletonDisplayText size="small" />
              <SkeletonBodyText lines={3} />
            </Card>
          </Layout.Section>
        ) : stats ? (
          <>
            {/* Stats Row */}
            <Layout.Section>
              <InlineStack gap="400" wrap={false}>
                <Box minWidth="0" width="100%">
                  <Card>
                    <BlockStack gap="200">
                      <Text as="p" tone="subdued" variant="bodySm">Total Passports</Text>
                      <Text as="p" variant="heading2xl" fontWeight="bold">
                        {stats.totalPassports}
                      </Text>
                      <Text as="p" tone="subdued" variant="bodySm">
                        of {planLimit === Infinity ? 'unlimited' : planLimit} on {PLAN_NAMES[stats.plan]} plan
                      </Text>
                    </BlockStack>
                  </Card>
                </Box>
                <Box minWidth="0" width="100%">
                  <Card>
                    <BlockStack gap="200">
                      <Text as="p" tone="subdued" variant="bodySm">Compliant Products</Text>
                      <Text as="p" variant="heading2xl" fontWeight="bold">
                        {stats.compliantPassports}
                      </Text>
                      <Text as="p" tone="subdued" variant="bodySm">
                        score ≥ 75 (EU DPP ready)
                      </Text>
                    </BlockStack>
                  </Card>
                </Box>
                <Box minWidth="0" width="100%">
                  <Card>
                    <BlockStack gap="200">
                      <Text as="p" tone="subdued" variant="bodySm">Current Plan</Text>
                      <InlineStack gap="200" blockAlign="center">
                        <Text as="p" variant="heading2xl" fontWeight="bold">
                          {PLAN_NAMES[stats.plan]}
                        </Text>
                        <Badge tone={stats.plan === 'free' ? 'info' : 'success'}>
                          {stats.plan === 'free' ? 'Free' : 'Paid'}
                        </Badge>
                      </InlineStack>
                      {stats.plan === 'free' && (
                        <Link href={`/admin/billing?shop=${shop}`}>
                          <Button size="micro" variant="plain">Upgrade →</Button>
                        </Link>
                      )}
                    </BlockStack>
                  </Card>
                </Box>
              </InlineStack>
            </Layout.Section>

            {/* Plan usage bar */}
            {planLimit !== Infinity && (
              <Layout.Section>
                <Card>
                  <BlockStack gap="300">
                    <Text as="h3" variant="headingMd">Plan Usage</Text>
                    <div style={{ width: '100%', background: '#f1f5f9', borderRadius: 8, height: 10 }}>
                      <div
                        style={{
                          width: `${usagePercent}%`,
                          background: usagePercent > 90 ? '#ef4444' : '#16a34a',
                          borderRadius: 8,
                          height: 10,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                    <Text as="p" tone="subdued" variant="bodySm">
                      {stats.totalPassports} of {planLimit} passports used
                      {usagePercent >= 80 && (
                        <span style={{ color: '#ef4444', marginLeft: 8 }}>
                          — Consider upgrading your plan
                        </span>
                      )}
                    </Text>
                  </BlockStack>
                </Card>
              </Layout.Section>
            )}

            {/* Quick start guide */}
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">Quick Start Guide</Text>
                  <Divider />
                  {[
                    {
                      step: '1',
                      title: 'Select a product',
                      desc: 'Go to Products and choose which items need a Digital Product Passport.',
                      done: stats.totalPassports > 0,
                    },
                    {
                      step: '2',
                      title: 'Fill in sustainability data',
                      desc: 'Add fiber composition, carbon footprint, care instructions, and more.',
                      done: stats.totalPassports > 0,
                    },
                    {
                      step: '3',
                      title: 'Use AI to estimate missing fields',
                      desc: 'Click "Estimate for me" to let Claude AI suggest values based on your product type.',
                      done: false,
                    },
                    {
                      step: '4',
                      title: 'Activate QR code on storefront',
                      desc: 'Enable the PassPort widget in your Shopify theme to show QR codes on product pages.',
                      done: false,
                    },
                  ].map((item) => (
                    <InlineStack key={item.step} gap="300" blockAlign="start">
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: item.done ? '#16a34a' : '#e2e8f0',
                          color: item.done ? '#fff' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 13,
                          flexShrink: 0,
                        }}
                      >
                        {item.done ? '✓' : item.step}
                      </div>
                      <BlockStack gap="050">
                        <Text as="p" fontWeight="semibold" variant="bodyMd">{item.title}</Text>
                        <Text as="p" tone="subdued" variant="bodySm">{item.desc}</Text>
                      </BlockStack>
                    </InlineStack>
                  ))}
                </BlockStack>
              </Card>
            </Layout.Section>
          </>
        ) : null}
      </Layout>
    </Page>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={null}>
      <AdminDashboardInner />
    </Suspense>
  );
}
