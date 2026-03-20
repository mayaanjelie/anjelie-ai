'use client';

import { QRCodeSVG } from 'qrcode.react';
import type { ProductPassport, FiberItem } from '@/lib/supabase';
import { getComplianceLevel } from '@/lib/compliance';

type PassportWithShop = ProductPassport & {
  shops: { shopify_domain: string; widget_primary_color: string };
};

const SCORE_LABELS: Record<number, string> = { 1: 'Poor', 2: 'Fair', 3: 'Moderate', 4: 'Good', 5: 'Excellent' };

export default function PassportView({ passport }: { passport: PassportWithShop }) {
  const accentColor = passport.shops?.widget_primary_color ?? '#16a34a';
  const level = getComplianceLevel(passport.compliance_score);
  const passportUrl = `${process.env.NEXT_PUBLIC_HOST}/passport/${passport.passport_slug}`;

  const totalFiber = passport.fiber_composition?.reduce((sum: number, f: FiberItem) => sum + f.percentage, 0) ?? 0;

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', background: '#fafafa', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '16px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: accentColor, textTransform: 'uppercase' }}>
              PassPort
            </span>
            <span style={{ fontSize: 13, color: '#94a3b8', marginLeft: 8 }}>· EU Digital Product Passport</span>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 20,
              background: level === 'green' ? '#f0fdf4' : level === 'yellow' ? '#fffbeb' : '#fef2f2',
              color: level === 'green' ? '#16a34a' : level === 'yellow' ? '#d97706' : '#dc2626',
              border: `1px solid ${level === 'green' ? '#bbf7d0' : level === 'yellow' ? '#fde68a' : '#fecaca'}`,
            }}
          >
            {level === 'green' ? '✓ DPP Compliant' : level === 'yellow' ? '◐ Partial' : '✗ Incomplete'} · {passport.compliance_score}%
          </span>
        </div>
      </header>

      {/* Product Hero */}
      <div style={{ background: '#fff', padding: '40px 24px 32px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          {passport.product_image && (
            <img
              src={passport.product_image}
              alt={passport.product_title}
              style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, flexShrink: 0, border: '1px solid #f1f5f9' }}
            />
          )}
          <div>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
              {passport.shops?.shopify_domain?.replace('.myshopify.com', '')}
            </p>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', color: '#0f172a', lineHeight: 1.2 }}>
              {passport.product_title}
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
              Digital Product Passport · Verified sustainability data
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>
        {/* Material Composition */}
        {passport.fiber_composition?.length > 0 && (
          <Section title="Material Composition" icon="🧵" accentColor={accentColor}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {passport.fiber_composition.map((fiber: FiberItem, idx: number) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{fiber.material}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: accentColor }}>{fiber.percentage}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3 }}>
                    <div
                      style={{
                        width: `${fiber.percentage}%`,
                        height: 6,
                        background: accentColor,
                        borderRadius: 3,
                        opacity: 0.7 + (idx === 0 ? 0.3 : 0),
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Carbon Footprint */}
        {passport.carbon_footprint != null && (
          <Section title="Carbon Footprint" icon="🌱" accentColor={accentColor}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 40, fontWeight: 800, color: '#0f172a' }}>
                {passport.carbon_footprint}
              </span>
              <span style={{ fontSize: 18, color: '#64748b', fontWeight: 600 }}>kg CO₂e</span>
            </div>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
              Estimated greenhouse gas emissions per unit, including production and logistics.
            </p>
          </Section>
        )}

        {/* 2-col grid for manufacturing + repairability */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {passport.country_of_manufacture && (
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                🏭 Made In
              </p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {passport.country_of_manufacture}
              </p>
            </div>
          )}
          {passport.repairability_score != null && (
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                🔧 Repairability
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <StarRating score={passport.repairability_score} color={accentColor} />
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>
                  {SCORE_LABELS[passport.repairability_score]}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Care Instructions */}
        {passport.care_instructions && (
          <Section title="Care Instructions" icon="👕" accentColor={accentColor}>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
              {passport.care_instructions}
            </p>
          </Section>
        )}

        {/* Recycling */}
        {passport.recycling_instructions && (
          <Section title="End of Life & Recycling" icon="♻️" accentColor={accentColor}>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>
              {passport.recycling_instructions}
            </p>
          </Section>
        )}

        {/* Certifications */}
        {passport.certifications?.length > 0 && (
          <Section title="Certifications" icon="🏅" accentColor={accentColor}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {passport.certifications.map((cert: string) => (
                <span
                  key={cert}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    background: '#f0fdf4',
                    color: accentColor,
                    border: `1px solid ${accentColor}33`,
                  }}
                >
                  ✓ {cert}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Supplier */}
        {(passport.supplier_name || passport.supplier_country) && (
          <Section title="Supply Chain" icon="🌍" accentColor={accentColor}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {passport.supplier_name && (
                <div>
                  <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Supplier</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{passport.supplier_name}</p>
                </div>
              )}
              {passport.supplier_country && (
                <div>
                  <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Country</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', margin: 0 }}>{passport.supplier_country}</p>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* QR + Metadata */}
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: 24, marginBottom: 20, display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ flexShrink: 0, padding: 12, background: '#fafafa', borderRadius: 12, border: '1px solid #f1f5f9' }}>
            <QRCodeSVG value={passportUrl} size={80} fgColor="#0f172a" bgColor="transparent" level="M" />
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              Passport ID
            </p>
            <p style={{ fontSize: 13, fontFamily: 'monospace', color: '#64748b', margin: '0 0 6px' }}>
              {passport.passport_slug}
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
              Last updated: {new Date(passport.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '24px', borderTop: '1px solid #f1f5f9' }}>
        <a
          href="https://passport-app.vercel.app"
          style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none', fontWeight: 600 }}
        >
          Powered by PassPort · EU Digital Product Passport Platform
        </a>
      </footer>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
  accentColor,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f8fafc' }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: -0.3 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function StarRating({ score, color }: { score: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: 14,
            borderRadius: 2,
            background: i <= score ? color : '#e2e8f0',
          }}
        />
      ))}
    </div>
  );
}
