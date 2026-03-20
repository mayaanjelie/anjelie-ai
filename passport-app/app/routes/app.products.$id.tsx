import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
import {
  Badge,
  Banner,
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Divider,
  InlineStack,
  Page,
  RangeSlider,
  Select,
  Text,
  TextField,
  Thumbnail,
} from "@shopify/polaris";
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import { authenticate } from "../shopify.server";
import {
  getOrCreateShop,
  getPassportByProductId,
  upsertPassport,
  type FiberEntry,
} from "../supabase.server";
import {
  calcComplianceScore,
  CERTIFICATIONS,
  COUNTRIES,
  getComplianceBadge,
} from "../utils/compliance";

const PRODUCT_QUERY = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      productType
      featuredImage { url altText }
    }
  }
`;

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = await getOrCreateShop(session.shop);

  const shopifyProductId = `gid://shopify/Product/${params.id}`;
  const response = await admin.graphql(PRODUCT_QUERY, {
    variables: { id: shopifyProductId },
  });
  const { data } = await response.json();
  if (!data?.product) throw new Response("Product not found", { status: 404 });

  const passport = await getPassportByProductId(shop.id, shopifyProductId);

  const passportUrl = passport
    ? `${process.env.SHOPIFY_APP_URL}/passport/${passport.id}`
    : null;

  return json({ product: data.product, passport, passportUrl, shopId: shop.id });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await getOrCreateShop(session.shop);

  const formData = await request.formData();
  const shopifyProductId = `gid://shopify/Product/${params.id}`;
  const productTitle = String(formData.get("product_title") || "");
  const countryOfManufacture = String(formData.get("country_of_manufacture") || "") || null;
  const carbonFootprint = formData.get("carbon_footprint")
    ? Number(formData.get("carbon_footprint"))
    : null;
  const careInstructions = String(formData.get("care_instructions") || "") || null;
  const recyclingInstructions = String(formData.get("recycling_instructions") || "") || null;
  const repairabilityScore = formData.get("repairability_score")
    ? Number(formData.get("repairability_score"))
    : null;
  const supplierName = String(formData.get("supplier_name") || "") || null;
  const supplierCountry = String(formData.get("supplier_country") || "") || null;

  // Parse fiber composition
  const fiberMaterials = formData.getAll("fiber_material[]") as string[];
  const fiberPercentages = formData.getAll("fiber_percentage[]") as string[];
  const fiberComposition: FiberEntry[] = fiberMaterials
    .map((mat, i) => ({ material: mat, percentage: Number(fiberPercentages[i]) }))
    .filter((f) => f.material && f.percentage > 0);

  // Parse certifications
  const certifications = CERTIFICATIONS.filter(
    (cert) => formData.get(`cert_${cert}`) === "on"
  );

  const passportDraft = {
    fiber_composition: fiberComposition,
    country_of_manufacture: countryOfManufacture,
    carbon_footprint: carbonFootprint,
    care_instructions: careInstructions,
    recycling_instructions: recyclingInstructions,
    repairability_score: repairabilityScore,
    certifications,
  };
  const complianceScore = calcComplianceScore(passportDraft);

  // Upsert to get the ID first
  const saved = await upsertPassport({
    shop_id: shop.id,
    shopify_product_id: shopifyProductId,
    product_title: productTitle,
    ...passportDraft,
    supplier_name: supplierName,
    supplier_country: supplierCountry,
    compliance_score: complianceScore,
    qr_code_base64: null,
  });

  // Generate QR code now that we have the ID
  const passportUrl = `${process.env.SHOPIFY_APP_URL}/passport/${saved.id}`;
  const qrBase64 = await QRCode.toDataURL(passportUrl, {
    width: 300,
    margin: 2,
    color: { dark: "#111827", light: "#ffffff" },
  });

  await upsertPassport({ ...saved, qr_code_base64: qrBase64 });

  return json({ success: true, passportId: saved.id });
};

export default function ProductPassportForm() {
  const { product, passport, passportUrl, shopId } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const aiFetcher = useFetcher<{
    fiber_composition?: FiberEntry[];
    carbon_footprint?: number;
    care_instructions?: string;
    recycling_instructions?: string;
    repairability_score?: number;
  }>();

  const isSaving = navigation.state === "submitting";
  const isAiLoading = aiFetcher.state === "submitting";

  // ── Form state ──────────────────────────────────────────────────────────────
  const [fibers, setFibers] = useState<FiberEntry[]>(
    passport?.fiber_composition?.length
      ? passport.fiber_composition
      : [{ material: "", percentage: 0 }]
  );
  const [countryOfManufacture, setCountryOfManufacture] = useState(
    passport?.country_of_manufacture ?? ""
  );
  const [carbonFootprint, setCarbonFootprint] = useState(
    String(passport?.carbon_footprint ?? "")
  );
  const [careInstructions, setCareInstructions] = useState(
    passport?.care_instructions ?? ""
  );
  const [recyclingInstructions, setRecyclingInstructions] = useState(
    passport?.recycling_instructions ?? ""
  );
  const [repairabilityScore, setRepairabilityScore] = useState(
    passport?.repairability_score ?? 3
  );
  const [certifications, setCertifications] = useState<string[]>(
    passport?.certifications ?? []
  );
  const [supplierName, setSupplierName] = useState(passport?.supplier_name ?? "");
  const [supplierCountry, setSupplierCountry] = useState(
    passport?.supplier_country ?? ""
  );

  // ── Accept AI suggestions ────────────────────────────────────────────────────
  useEffect(() => {
    if (aiFetcher.data) {
      const d = aiFetcher.data;
      if (d.fiber_composition?.length) setFibers(d.fiber_composition);
      if (d.carbon_footprint != null) setCarbonFootprint(String(d.carbon_footprint));
      if (d.care_instructions) setCareInstructions(d.care_instructions);
      if (d.recycling_instructions) setRecyclingInstructions(d.recycling_instructions);
      if (d.repairability_score) setRepairabilityScore(d.repairability_score);
    }
  }, [aiFetcher.data]);

  const handleRequestAI = () => {
    aiFetcher.submit(
      {
        productTitle: product.title,
        productType: product.productType ?? "",
      },
      { method: "POST", action: "/api/ai-suggest" }
    );
  };

  const addFiberRow = () => setFibers([...fibers, { material: "", percentage: 0 }]);
  const removeFiberRow = (i: number) => setFibers(fibers.filter((_, idx) => idx !== i));
  const updateFiber = useCallback(
    (i: number, field: keyof FiberEntry, value: string | number) => {
      setFibers((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, [field]: value } : f))
      );
    },
    []
  );

  const toggleCert = (cert: string) => {
    setCertifications((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  // Live compliance preview
  const liveScore = calcComplianceScore({
    fiber_composition: fibers.filter((f) => f.material),
    country_of_manufacture: countryOfManufacture || null,
    carbon_footprint: carbonFootprint ? Number(carbonFootprint) : null,
    care_instructions: careInstructions || null,
    recycling_instructions: recyclingInstructions || null,
    repairability_score: repairabilityScore || null,
    certifications,
  });
  const badge = getComplianceBadge(liveScore);

  const numericId = product.id.replace("gid://shopify/Product/", "");

  return (
    <Page
      backAction={{ content: "Products", url: "/app" }}
      title={product.title}
      subtitle="Digital Product Passport"
      titleMetadata={<Badge tone={badge.tone}>{badge.label}</Badge>}
    >
      {actionData?.success && (
        <div style={{ marginBottom: "16px" }}>
          <Banner
            title="Passport saved successfully!"
            tone="success"
            action={
              passportUrl
                ? { content: "View public passport", url: passportUrl, target: "_blank" }
                : undefined
            }
            onDismiss={() => {}}
          />
        </div>
      )}

      {isAiLoading && (
        <div style={{ marginBottom: "16px" }}>
          <Banner title="Claude is estimating values for your product..." tone="info" />
        </div>
      )}

      <Form method="post">
        <input type="hidden" name="product_title" value={product.title} />
        {/* Pass fiber rows as array fields */}
        {fibers.map((f, i) => (
          <input key={`fm-${i}`} type="hidden" name="fiber_material[]" value={f.material} />
        ))}
        {fibers.map((f, i) => (
          <input key={`fp-${i}`} type="hidden" name="fiber_percentage[]" value={f.percentage} />
        ))}
        {certifications.map((cert) => (
          <input key={cert} type="hidden" name={`cert_${cert}`} value="on" />
        ))}
        <input type="hidden" name="country_of_manufacture" value={countryOfManufacture} />
        <input type="hidden" name="carbon_footprint" value={carbonFootprint} />
        <input type="hidden" name="care_instructions" value={careInstructions} />
        <input type="hidden" name="recycling_instructions" value={recyclingInstructions} />
        <input type="hidden" name="repairability_score" value={repairabilityScore} />
        <input type="hidden" name="supplier_name" value={supplierName} />
        <input type="hidden" name="supplier_country" value={supplierCountry} />

        <BlockStack gap="500">
          {/* Product info + AI button */}
          <Card>
            <InlineStack gap="400" align="start">
              <Thumbnail
                source={product.featuredImage?.url ?? ""}
                alt={product.title}
                size="large"
              />
              <BlockStack gap="200">
                <Text variant="headingMd" as="h2">{product.title}</Text>
                <Text variant="bodyMd" as="p" tone="subdued">{product.productType}</Text>
                <Button
                  onClick={handleRequestAI}
                  loading={isAiLoading}
                  variant="secondary"
                  size="slim"
                >
                  ✨ Auto-fill with AI
                </Button>
              </BlockStack>
            </InlineStack>
          </Card>

          {/* Fiber composition */}
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Fiber Composition</Text>
              <Text variant="bodyMd" as="p" tone="subdued">
                Total must equal 100%. Required by EU DPP regulation.
              </Text>
              {fibers.map((fiber, i) => (
                <InlineStack key={i} gap="300" align="start">
                  <div style={{ flex: 1 }}>
                    <TextField
                      label={i === 0 ? "Material" : ""}
                      placeholder="e.g. Cotton, Polyester"
                      value={fiber.material}
                      onChange={(v) => updateFiber(i, "material", v)}
                      autoComplete="off"
                    />
                  </div>
                  <div style={{ width: "100px" }}>
                    <TextField
                      label={i === 0 ? "%" : ""}
                      type="number"
                      value={String(fiber.percentage)}
                      onChange={(v) => updateFiber(i, "percentage", Number(v))}
                      suffix="%"
                      autoComplete="off"
                    />
                  </div>
                  {fibers.length > 1 && (
                    <div style={{ paddingTop: i === 0 ? "24px" : "0" }}>
                      <Button
                        size="slim"
                        tone="critical"
                        onClick={() => removeFiberRow(i)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </InlineStack>
              ))}
              <Button size="slim" onClick={addFiberRow}>+ Add fiber</Button>
              <Text variant="bodySm" as="p" tone="subdued">
                Total: {fibers.reduce((s, f) => s + Number(f.percentage || 0), 0)}%
              </Text>
            </BlockStack>
          </Card>

          {/* Manufacturing */}
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Manufacturing</Text>
              <Select
                label="Country of manufacture"
                options={[
                  { value: "", label: "Select country..." },
                  ...COUNTRIES,
                ]}
                value={countryOfManufacture}
                onChange={setCountryOfManufacture}
              />
              <InlineStack gap="300" align="end">
                <div style={{ flex: 1 }}>
                  <TextField
                    label="Carbon footprint (kg CO₂e per unit)"
                    type="number"
                    value={carbonFootprint}
                    onChange={setCarbonFootprint}
                    placeholder="e.g. 12.5"
                    autoComplete="off"
                    helpText="Estimated lifecycle carbon emissions per garment"
                  />
                </div>
                <div style={{ paddingTop: "24px" }}>
                  <Button size="slim" onClick={handleRequestAI} loading={isAiLoading}>
                    Estimate for me
                  </Button>
                </div>
              </InlineStack>
            </BlockStack>
          </Card>

          {/* Care & Recycling */}
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Care & End of Life</Text>
              <TextField
                label="Care instructions"
                multiline={3}
                value={careInstructions}
                onChange={setCareInstructions}
                placeholder="e.g. Machine wash cold 30°C, do not bleach, tumble dry low..."
                autoComplete="off"
              />
              <TextField
                label="Recycling instructions"
                multiline={3}
                value={recyclingInstructions}
                onChange={setRecyclingInstructions}
                placeholder="e.g. Remove all trims before recycling. Take to textile collection point..."
                autoComplete="off"
              />
              <div>
                <Text variant="bodyMd" as="p">
                  Repairability score: <strong>{repairabilityScore} / 5</strong>
                </Text>
                <RangeSlider
                  label="Repairability score"
                  labelHidden
                  min={1}
                  max={5}
                  step={1}
                  value={repairabilityScore}
                  onChange={(v) => setRepairabilityScore(Number(v))}
                  output
                />
                <Text variant="bodySm" as="p" tone="subdued">
                  1 = Very difficult to repair · 5 = Easily repairable
                </Text>
              </div>
            </BlockStack>
          </Card>

          {/* Certifications */}
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Certifications</Text>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "8px",
                }}
              >
                {CERTIFICATIONS.map((cert) => (
                  <Checkbox
                    key={cert}
                    label={cert}
                    checked={certifications.includes(cert)}
                    onChange={() => toggleCert(cert)}
                  />
                ))}
              </div>
            </BlockStack>
          </Card>

          {/* Supplier (optional) */}
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">Supplier (optional)</Text>
              <TextField
                label="Supplier name"
                value={supplierName}
                onChange={setSupplierName}
                autoComplete="off"
              />
              <Select
                label="Supplier country"
                options={[{ value: "", label: "Select country..." }, ...COUNTRIES]}
                value={supplierCountry}
                onChange={setSupplierCountry}
              />
            </BlockStack>
          </Card>

          {/* QR Code preview */}
          {passport?.qr_code_base64 && (
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">QR Code</Text>
                <Text variant="bodyMd" as="p" tone="subdued">
                  This QR code links to the public product passport page. It is
                  automatically embedded on your Shopify product page via the
                  PassPort theme extension.
                </Text>
                <InlineStack gap="400" align="start">
                  <img
                    src={passport.qr_code_base64}
                    alt="Passport QR code"
                    width={150}
                    height={150}
                    style={{ border: "1px solid #e1e3e5", borderRadius: "8px" }}
                  />
                  <BlockStack gap="200">
                    {passportUrl && (
                      <Text variant="bodySm" as="p" tone="subdued">
                        URL: {passportUrl}
                      </Text>
                    )}
                    {passportUrl && (
                      <Button size="slim" url={passportUrl} target="_blank">
                        View public passport →
                      </Button>
                    )}
                  </BlockStack>
                </InlineStack>
              </BlockStack>
            </Card>
          )}

          <Divider />

          <InlineStack align="end" gap="300">
            <Button onClick={() => navigate("/app")}>Cancel</Button>
            <Button variant="primary" submit loading={isSaving}>
              Save Passport
            </Button>
          </InlineStack>
        </BlockStack>
      </Form>
    </Page>
  );
}
