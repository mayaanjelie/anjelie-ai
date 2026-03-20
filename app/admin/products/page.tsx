'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Thumbnail,
  Button,
  EmptyState,
  Banner,
  SkeletonBodyText,
  InlineStack,
  BlockStack,
  Box,
  Filters,
} from '@shopify/polaris';
import Link from 'next/link';
import { getComplianceLevel, getComplianceLabel, COMPLIANCE_COLORS } from '@/lib/compliance';
import { PLAN_LIMITS } from '@/lib/supabase';

type Product = {
  id: string;
  title: string;
  image: string | null;
  product_type: string;
  vendor: string;
  passport: {
    compliance_score: number;
    passport_slug: string;
    updated_at: string;
  } | null;
};

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const shop = searchParams.get('shop') ?? '';
  const [products, setProducts] = useState<Product[]>([]);
  const [plan, setPlan] = useState('free');
  const [passportCount, setPassportCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!shop) return;
    fetch(`/api/products?shop=${shop}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setProducts(data.products);
          setPlan(data.plan);
          setPassportCount(data.passportCount);
        }
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
  }, [shop]);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );

  const limit = PLAN_LIMITS[plan];
  const atLimit = passportCount >= limit;

  return (
    <Page
      title="Products"
      subtitle="Add EU Digital Product Passports to your products"
      backAction={{ content: 'Dashboard', url: `/admin?shop=${shop}` }}
    >
      <Layout>
        {atLimit && (
          <Layout.Section>
            <Banner
              tone="warning"
              title="Plan limit reached"
              action={{ content: 'Upgrade Plan', url: `/admin/billing?shop=${shop}` }}
            >
              <p>
                You&apos;ve reached the {limit === Infinity ? 'unlimited' : limit} passport limit on your{' '}
                {plan} plan. Upgrade to add more passports.
              </p>
            </Banner>
          </Layout.Section>
        )}

        {error && (
          <Layout.Section>
            <Banner tone="critical" title="Error">{error}</Banner>
          </Layout.Section>
        )}

        <Layout.Section>
          <Card padding="0">
            {loading ? (
              <Box padding="400">
                <SkeletonBodyText lines={6} />
              </Box>
            ) : filtered.length === 0 && !query ? (
              <EmptyState
                heading="No products found"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Your Shopify store has no products yet. Add products in Shopify admin first.</p>
              </EmptyState>
            ) : (
              <ResourceList
                filterControl={
                  <Filters
                    queryValue={query}
                    filters={[]}
                    onQueryChange={setQuery}
                    onQueryClear={() => setQuery('')}
                    onClearAll={() => setQuery('')}
                    queryPlaceholder="Search products..."
                  />
                }
                resourceName={{ singular: 'product', plural: 'products' }}
                items={filtered}
                renderItem={(product) => {
                  const level = product.passport
                    ? getComplianceLevel(product.passport.compliance_score)
                    : null;
                  const colors = level ? COMPLIANCE_COLORS[level] : null;

                  return (
                    <ResourceItem
                      id={product.id}
                      media={
                        <Thumbnail
                          source={product.image ?? 'https://cdn.shopify.com/s/assets/admin/no-image-2048-5e88c1b20e087fb7bbe9a3771824e743c244f437e4f8ba93bbf7b11b53f7824c.gif'}
                          alt={product.title}
                          size="medium"
                        />
                      }
                      accessibilityLabel={`Edit passport for ${product.title}`}
                      url={`/admin/products/${product.id}?shop=${shop}&title=${encodeURIComponent(product.title)}&type=${encodeURIComponent(product.product_type)}&vendor=${encodeURIComponent(product.vendor)}&image=${encodeURIComponent(product.image ?? '')}`}
                    >
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <Text as="p" fontWeight="semibold" variant="bodyMd">
                            {product.title}
                          </Text>
                          <Text as="p" tone="subdued" variant="bodySm">
                            {product.product_type || 'No category'} · {product.vendor}
                          </Text>
                        </BlockStack>
                        <InlineStack gap="200" blockAlign="center">
                          {product.passport ? (
                            <>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '2px 10px',
                                  borderRadius: 20,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  border: `1px solid`,
                                }}
                                className={`${colors?.bg} ${colors?.text} ${colors?.border}`}
                              >
                                <span
                                  style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                  }}
                                  className={colors?.dot}
                                />
                                {getComplianceLabel(product.passport.compliance_score)} ({product.passport.compliance_score}%)
                              </span>
                              <Badge tone="success">Passport</Badge>
                            </>
                          ) : (
                            <Badge>No Passport</Badge>
                          )}
                          <Button size="micro" variant="primary">
                            {product.passport ? 'Edit' : 'Create'}
                          </Button>
                        </InlineStack>
                      </InlineStack>
                    </ResourceItem>
                  );
                }}
              />
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageInner />
    </Suspense>
  );
}
