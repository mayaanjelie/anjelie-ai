'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import {
  Page,
  Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  Button,
  Banner,
  Toast,
  Frame,
  Text,
  InlineStack,
  BlockStack,
  Divider,
  Tag,
  Spinner,
  Badge,
  Box,
  Checkbox,
} from '@shopify/polaris';
import { calculateComplianceScore, getComplianceLevel, getComplianceLabel, COMPLIANCE_COLORS } from '@/lib/compliance';
import type { FiberItem } from '@/lib/supabase';
import QRCodeDisplay from '@/components/passport/QRCodeDisplay';

const CERTIFICATIONS = ['GOTS', 'Fair Trade', 'OEKO-TEX Standard 100', 'Bluesign', 'Cradle to Cradle', 'B Corp', 'Ecolabel EU', 'Recycled Content (GRS)'];

const COUNTRIES = [
  'Bangladesh', 'Cambodia', 'China', 'Ethiopia', 'France', 'Germany', 'India', 'Indonesia',
  'Italy', 'Japan', 'Morocco', 'Myanmar', 'Pakistan', 'Portugal', 'Spain', 'Sri Lanka',
  'Thailand', 'Turkey', 'United Kingdom', 'United States', 'Vietnam',
];

function PassportFormPageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.id as string;
  const shop = searchParams.get('shop') ?? '';
  const productTitle = searchParams.get('title') ?? '';
  const productType = searchParams.get('type') ?? '';
  const vendor = searchParams.get('vendor') ?? '';
  const productImage = searchParams.get('image') ?? '';

  // Form state
  const [fibers, setFibers] = useState<FiberItem[]>([{ material: '', percentage: 100 }]);
  const [country, setCountry] = useState('');
  const [carbon, setCarbon] = useState('');
  const [care, setCare] = useState('');
  const [recycling, setRecycling] = useState('');
  const [repairability, setRepairability] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [supplierName, setSupplierName] = useState('');
  const [supplierCountry, setSupplierCountry] = useState('');
  const [passportSlug, setPassportSlug] = useState('');

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; error?: boolean } | null>(null);
  const [aiNotes, setAiNotes] = useState('');

  const formData = {
    fiber_composition: fibers.filter((f) => f.material),
    country_of_manufacture: country,
    carbon_footprint: carbon ? parseFloat(carbon) : undefined,
    care_instructions: care,
    recycling_instructions: recycling,
    repairability_score: repairability ? parseInt(repairability) : undefined,
    certifications,
    supplier_name: supplierName,
    supplier_country: supplierCountry,
  };

  const score = calculateComplianceScore(formData);
  const level = getComplianceLevel(score);
  const colors = COMPLIANCE_COLORS[level];

  // Load existing passport data
  useEffect(() => {
    if (!shop || !productId) return;
    fetch(`/api/passport?shop=${shop}&productId=${productId}`)
      .then((r) => r.json())
      .then(({ passport }) => {
        if (passport) {
          setFibers(passport.fiber_composition?.length ? passport.fiber_composition : [{ material: '', percentage: 100 }]);
          setCountry(passport.country_of_manufacture ?? '');
          setCarbon(passport.carbon_footprint?.toString() ?? '');
          setCare(passport.care_instructions ?? '');
          setRecycling(passport.recycling_instructions ?? '');
          setRepairability(passport.repairability_score?.toString() ?? '');
          setCertifications(passport.certifications ?? []);
          setSupplierName(passport.supplier_name ?? '');
          setSupplierCountry(passport.supplier_country ?? '');
          setPassportSlug(passport.passport_slug ?? '');
        }
      })
      .finally(() => setLoading(false));
  }, [shop, productId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/passport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop,
          productId,
          productTitle,
          productImage,
          data: formData,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setToast({ message: json.error || 'Save failed', error: true });
      } else {
        setPassportSlug(json.passport.passport_slug);
        setToast({ message: 'Passport saved successfully!' });
      }
    } catch {
      setToast({ message: 'Network error. Please try again.', error: true });
    } finally {
      setSaving(false);
    }
  };

  const handleAiSuggest = async () => {
    setAiLoading(true);
    setAiNotes('');
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productTitle, productType, vendor }),
      });
      const { suggestions, error } = await res.json();
      if (error) {
        setToast({ message: error, error: true });
        return;
      }
      // Apply suggestions only to empty fields
      if (suggestions.fiber_composition?.length && fibers.every((f) => !f.material)) {
        setFibers(suggestions.fiber_composition);
      }
      if (!country && suggestions.country_of_manufacture) setCountry(suggestions.country_of_manufacture);
      if (!carbon && suggestions.carbon_footprint) setCarbon(String(suggestions.carbon_footprint));
      if (!care && suggestions.care_instructions) setCare(suggestions.care_instructions);
      if (!recycling && suggestions.recycling_instructions) setRecycling(suggestions.recycling_instructions);
      if (!repairability && suggestions.repairability_score) setRepairability(String(suggestions.repairability_score));
      if (!certifications.length && suggestions.certifications?.length) setCertifications(suggestions.certifications);
      if (!supplierCountry && suggestions.supplier_country) setSupplierCountry(suggestions.supplier_country);
      if (suggestions.confidence_notes) setAiNotes(suggestions.confidence_notes);
      setToast({ message: 'AI suggestions applied! Review and edit as needed.' });
    } catch {
      setToast({ message: 'AI request failed. Please try again.', error: true });
    } finally {
      setAiLoading(false);
    }
  };

  const toggleCert = (cert: string) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const updateFiber = (idx: number, field: keyof FiberItem, value: string) => {
    setFibers((prev) => prev.map((f, i) => i === idx ? { ...f, [field]: field === 'percentage' ? parseInt(value) || 0 : value } : f));
  };

  const addFiber = () => setFibers((prev) => [...prev, { material: '', percentage: 0 }]);
  const removeFiber = (idx: number) => setFibers((prev) => prev.filter((_, i) => i !== idx));

  if (loading) {
    return (
      <Page title={productTitle} backAction={{ content: 'Products', url: `/admin/products?shop=${shop}` }}>
        <Layout>
          <Layout.Section>
            <Card>
              <InlineStack align="center"><Spinner /></InlineStack>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Frame>
      <Page
        title={productTitle || 'Product Passport'}
        subtitle={`${productType || 'Product'} · ${vendor || ''}`}
        backAction={{ content: 'Products', url: `/admin/products?shop=${shop}` }}
        primaryAction={
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Save Passport
          </Button>
        }
        secondaryActions={[
          {
            content: aiLoading ? 'Estimating...' : '✨ Estimate with AI',
            onAction: handleAiSuggest,
            disabled: aiLoading,
          },
        ]}
      >
        <Layout>
          {/* Compliance Score */}
          <Layout.Section>
            <Card>
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="h3" variant="headingMd">Compliance Score</Text>
                  <Text as="p" tone="subdued" variant="bodySm">
                    Based on how many DPP fields are completed
                  </Text>
                </BlockStack>
                <InlineStack gap="300" blockAlign="center">
                  <div style={{ width: 100, height: 8, background: '#e2e8f0', borderRadius: 4 }}>
                    <div
                      style={{
                        width: `${score}%`,
                        height: 8,
                        background: level === 'green' ? '#16a34a' : level === 'yellow' ? '#f59e0b' : '#ef4444',
                        borderRadius: 4,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 700,
                      background: level === 'green' ? '#f0fdf4' : level === 'yellow' ? '#fffbeb' : '#fef2f2',
                      color: level === 'green' ? '#16a34a' : level === 'yellow' ? '#d97706' : '#dc2626',
                    }}
                  >
                    {score}% — {getComplianceLabel(score)}
                  </span>
                </InlineStack>
              </InlineStack>
            </Card>
          </Layout.Section>

          {aiNotes && (
            <Layout.Section>
              <Banner tone="info" title="AI Estimation Notes" onDismiss={() => setAiNotes('')}>
                <p>{aiNotes}</p>
                <p><strong>Please review all suggestions carefully before saving.</strong></p>
              </Banner>
            </Layout.Section>
          )}

          {/* Material Composition */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingMd">Material Composition</Text>
                  <Badge tone={fibers.some((f) => f.material) ? 'success' : undefined}>{`${fibers.filter((f) => f.material).reduce((sum, f) => sum + (f.percentage || 0), 0)}% total`}</Badge>
                </InlineStack>
                <Text as="p" tone="subdued" variant="bodySm">
                  List all fibers/materials and their percentage breakdown. Must total 100%.
                </Text>
                {fibers.map((fiber, idx) => (
                  <InlineStack key={idx} gap="200" blockAlign="end">
                    <Box minWidth="0" width="100%">
                      <TextField
                        label={idx === 0 ? 'Material' : ''}
                        value={fiber.material}
                        onChange={(v) => updateFiber(idx, 'material', v)}
                        placeholder="e.g. Cotton, Polyester, Wool"
                        autoComplete="off"
                      />
                    </Box>
                    <Box minWidth="80px">
                      <TextField
                        label={idx === 0 ? 'Percentage' : ''}
                        value={String(fiber.percentage)}
                        onChange={(v) => updateFiber(idx, 'percentage', v)}
                        suffix="%"
                        type="number"
                        autoComplete="off"
                      />
                    </Box>
                    {fibers.length > 1 && (
                      <Button
                        tone="critical"
                        variant="plain"
                        onClick={() => removeFiber(idx)}
                      >
                        Remove
                      </Button>
                    )}
                  </InlineStack>
                ))}
                <Button onClick={addFiber} variant="plain">+ Add material</Button>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Manufacturing */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">Manufacturing & Traceability</Text>
                <FormLayout>
                  <Select
                    label="Country of Manufacture"
                    options={[
                      { label: 'Select country...', value: '' },
                      ...COUNTRIES.map((c) => ({ label: c, value: c })),
                    ]}
                    value={country}
                    onChange={setCountry}
                  />
                  <TextField
                    label="Carbon Footprint (kg CO2e per unit)"
                    value={carbon}
                    onChange={setCarbon}
                    type="number"
                    placeholder="e.g. 12.5"
                    helpText="Estimated greenhouse gas emissions per item produced and shipped."
                    autoComplete="off"
                    connectedRight={
                      <Button
                        onClick={handleAiSuggest}
                        loading={aiLoading}
                        size="slim"
                        variant="plain"
                      >
                        Estimate with AI
                      </Button>
                    }
                  />
                  <Divider />
                  <TextField
                    label="Supplier Name (optional)"
                    value={supplierName}
                    onChange={setSupplierName}
                    placeholder="e.g. Textile Factory Ltd."
                    autoComplete="off"
                  />
                  <Select
                    label="Supplier Country (optional)"
                    options={[
                      { label: 'Select country...', value: '' },
                      ...COUNTRIES.map((c) => ({ label: c, value: c })),
                    ]}
                    value={supplierCountry}
                    onChange={setSupplierCountry}
                  />
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Care & Recycling */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">Care & End of Life</Text>
                <FormLayout>
                  <TextField
                    label="Care Instructions"
                    value={care}
                    onChange={setCare}
                    multiline={3}
                    placeholder="e.g. Machine wash cold (30°C), do not bleach, tumble dry low, cool iron, do not dry clean."
                    autoComplete="off"
                  />
                  <TextField
                    label="Recycling Instructions"
                    value={recycling}
                    onChange={setRecycling}
                    multiline={3}
                    placeholder="e.g. Take to a textile recycling point. Do not place in household recycling. The outer shell can be recycled separately from the lining."
                    autoComplete="off"
                  />
                  <Select
                    label="Repairability Score (1–5)"
                    options={[
                      { label: 'Not assessed', value: '' },
                      { label: '1 — Very difficult to repair', value: '1' },
                      { label: '2 — Difficult to repair', value: '2' },
                      { label: '3 — Moderately repairable', value: '3' },
                      { label: '4 — Easy to repair', value: '4' },
                      { label: '5 — Highly repairable', value: '5' },
                    ]}
                    value={repairability}
                    onChange={setRepairability}
                    helpText="EU DPP requires a repairability score to encourage circular design."
                  />
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Certifications */}
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">Certifications & Standards</Text>
                <Text as="p" tone="subdued" variant="bodySm">
                  Select all certifications that apply to this product.
                </Text>
                <InlineStack gap="200" wrap>
                  {CERTIFICATIONS.map((cert) => (
                    <div
                      key={cert}
                      onClick={() => toggleCert(cert)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        border: `2px solid ${certifications.includes(cert) ? '#16a34a' : '#e2e8f0'}`,
                        background: certifications.includes(cert) ? '#f0fdf4' : '#fff',
                        color: certifications.includes(cert) ? '#16a34a' : '#64748b',
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        userSelect: 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {certifications.includes(cert) ? '✓ ' : ''}{cert}
                    </div>
                  ))}
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* QR Code Preview */}
          {passportSlug && (
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">Passport QR Code</Text>
                  <Text as="p" tone="subdued" variant="bodySm">
                    This QR code links to your product&apos;s public Digital Product Passport page.
                    Embed it on your storefront using the PassPort theme widget.
                  </Text>
                  <QRCodeDisplay slug={passportSlug} />
                </BlockStack>
              </Card>
            </Layout.Section>
          )}
        </Layout>
      </Page>

      {toast && (
        <Toast
          content={toast.message}
          error={toast.error}
          onDismiss={() => setToast(null)}
        />
      )}
    </Frame>
  );
}

export default function PassportFormPage() {
  return (
    <Suspense fallback={null}>
      <PassportFormPageInner />
    </Suspense>
  );
}
