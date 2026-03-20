import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPassportById } from "../supabase.server";
import { COUNTRY_FLAGS, COUNTRIES } from "../utils/compliance";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.passport) {
    return [{ title: "Passport not found | PassPort" }];
  }
  return [
    { title: `${data.passport.product_title} | Digital Product Passport` },
    {
      name: "description",
      content: `EU Digital Product Passport for ${data.passport.product_title}. View sustainability data, fiber composition, and care instructions.`,
    },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const passport = await getPassportById(params.passportId!);
  if (!passport) throw new Response("Passport not found", { status: 404 });
  return json({ passport });
};

function ComplianceDot({ score }: { score: number }) {
  const color = score >= 80 ? "#16a34a" : score >= 40 ? "#ca8a04" : "#dc2626";
  const label = score >= 80 ? "High compliance" : score >= 40 ? "Partial compliance" : "Low compliance";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
      <span style={{ fontSize: "14px", color: "#374151" }}>{label} ({score}%)</span>
    </div>
  );
}

function StarRating({ score }: { score: number }) {
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            fontSize: "20px",
            color: i <= score ? "#16a34a" : "#d1d5db",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function FiberBar({ material, percentage }: { material: string; percentage: number }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontSize: "14px", color: "#374151", fontWeight: 500 }}>{material}</span>
        <span style={{ fontSize: "14px", color: "#6b7280" }}>{percentage}%</span>
      </div>
      <div
        style={{
          height: "8px",
          backgroundColor: "#f0fdf4",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            backgroundColor: "#16a34a",
            borderRadius: "4px",
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function PassportPage() {
  const { passport } = useLoaderData<typeof loader>();

  const countryLabel =
    COUNTRIES.find((c) => c.value === passport.country_of_manufacture)?.label ??
    passport.country_of_manufacture;
  const flag = passport.country_of_manufacture
    ? COUNTRY_FLAGS[passport.country_of_manufacture]
    : "";

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        color: "#111827",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid #f0fdf4",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "#16a34a",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            P
          </div>
          <span style={{ fontWeight: 600, fontSize: "16px" }}>PassPort</span>
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#6b7280",
            backgroundColor: "#f0fdf4",
            padding: "4px 10px",
            borderRadius: "20px",
            border: "1px solid #bbf7d0",
          }}
        >
          EU Digital Product Passport
        </div>
      </header>

      <main style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 24px 64px" }}>
        {/* Product title */}
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "8px",
              lineHeight: 1.2,
            }}
          >
            {passport.product_title}
          </h1>
          <ComplianceDot score={passport.compliance_score} />
        </div>

        {/* Fiber composition */}
        {passport.fiber_composition?.length > 0 && (
          <section style={{ marginBottom: "32px" }}>
            <SectionHeader icon="🧵" title="Material Composition" />
            <div
              style={{
                backgroundColor: "#fafafa",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              {passport.fiber_composition.map((fiber, i) => (
                <FiberBar key={i} material={fiber.material} percentage={fiber.percentage} />
              ))}
            </div>
          </section>
        )}

        {/* Manufacturing */}
        {(countryLabel || passport.carbon_footprint != null) && (
          <section style={{ marginBottom: "32px" }}>
            <SectionHeader icon="🌍" title="Manufacturing" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {countryLabel && (
                <DataCard
                  label="Made in"
                  value={`${flag} ${countryLabel}`}
                />
              )}
              {passport.carbon_footprint != null && (
                <DataCard
                  label="Carbon footprint"
                  value={`${passport.carbon_footprint} kg CO₂e`}
                  subtext="per unit"
                />
              )}
            </div>
          </section>
        )}

        {/* Care instructions */}
        {passport.care_instructions && (
          <section style={{ marginBottom: "32px" }}>
            <SectionHeader icon="🫧" title="Care Instructions" />
            <div
              style={{
                backgroundColor: "#fafafa",
                borderRadius: "12px",
                padding: "20px",
                fontSize: "15px",
                lineHeight: 1.6,
                color: "#374151",
              }}
            >
              {passport.care_instructions}
            </div>
          </section>
        )}

        {/* Recycling */}
        {passport.recycling_instructions && (
          <section style={{ marginBottom: "32px" }}>
            <SectionHeader icon="♻️" title="Recycling & End of Life" />
            <div
              style={{
                backgroundColor: "#fafafa",
                borderRadius: "12px",
                padding: "20px",
                fontSize: "15px",
                lineHeight: 1.6,
                color: "#374151",
              }}
            >
              {passport.recycling_instructions}
            </div>
          </section>
        )}

        {/* Repairability */}
        {passport.repairability_score != null && (
          <section style={{ marginBottom: "32px" }}>
            <SectionHeader icon="🔧" title="Repairability" />
            <div
              style={{
                backgroundColor: "#fafafa",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <StarRating score={passport.repairability_score} />
              <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}>
                {passport.repairability_score <= 2
                  ? "Difficult to repair — take to a specialist"
                  : passport.repairability_score === 3
                  ? "Moderately repairable with basic tools"
                  : "Easily repairable at home or local tailor"}
              </p>
            </div>
          </section>
        )}

        {/* Certifications */}
        {passport.certifications?.length > 0 && (
          <section style={{ marginBottom: "32px" }}>
            <SectionHeader icon="✅" title="Certifications" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {passport.certifications.map((cert) => (
                <span
                  key={cert}
                  style={{
                    backgroundColor: "#f0fdf4",
                    color: "#15803d",
                    border: "1px solid #bbf7d0",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {cert}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Supplier */}
        {(passport.supplier_name || passport.supplier_country) && (
          <section style={{ marginBottom: "32px" }}>
            <SectionHeader icon="🏭" title="Supplier" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {passport.supplier_name && (
                <DataCard label="Supplier" value={passport.supplier_name} />
              )}
              {passport.supplier_country && (
                <DataCard
                  label="Supplier country"
                  value={`${COUNTRY_FLAGS[passport.supplier_country] ?? ""} ${
                    COUNTRIES.find((c) => c.value === passport.supplier_country)?.label ??
                    passport.supplier_country
                  }`}
                />
              )}
            </div>
          </section>
        )}

        {/* Passport metadata */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "24px",
            marginTop: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "2px" }}>
              Passport ID
            </p>
            <p style={{ fontSize: "12px", color: "#6b7280", fontFamily: "monospace" }}>
              {passport.id}
            </p>
          </div>
          <p style={{ fontSize: "12px", color: "#9ca3af" }}>
            Updated {new Date(passport.updated_at).toLocaleDateString("en-GB")}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          borderTop: "1px solid #f0fdf4",
          backgroundColor: "#fafafa",
        }}
      >
        <p style={{ fontSize: "12px", color: "#9ca3af" }}>
          Powered by{" "}
          <strong style={{ color: "#16a34a" }}>PassPort</strong> — EU Digital Product
          Passport compliance for fashion brands
        </p>
      </footer>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 }}>
        {title}
      </h2>
    </div>
  );
}

function DataCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: "#fafafa",
        borderRadius: "12px",
        padding: "16px 20px",
      }}
    >
      <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>{value}</p>
      {subtext && (
        <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{subtext}</p>
      )}
    </div>
  );
}
