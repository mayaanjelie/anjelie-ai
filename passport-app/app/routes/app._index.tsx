import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  IndexTable,
  Page,
  Text,
  Thumbnail,
  useIndexResourceState,
} from "@shopify/polaris";
import { authenticate, PLAN_LIMITS } from "../shopify.server";
import {
  countPassportsByShop,
  getAllPassportsByShop,
  getOrCreateShop,
} from "../supabase.server";
import { getComplianceBadge } from "../utils/compliance";

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $cursor: String) {
    products(first: $first, after: $cursor) {
      edges {
        node {
          id
          title
          handle
          status
          featuredImage {
            url
            altText
          }
          productType
        }
        cursor
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = await getOrCreateShop(session.shop);

  // Fetch products from Shopify
  const response = await admin.graphql(PRODUCTS_QUERY, {
    variables: { first: 50 },
  });
  const { data } = await response.json();
  const products = (data?.products?.edges ?? []).map(
    (e: { node: Record<string, unknown> }) => e.node
  );

  // Fetch passports for this shop
  const passports = await getAllPassportsByShop(shop.id);
  const passportMap = Object.fromEntries(
    passports.map((p) => [p.shopify_product_id, p])
  );

  const passportCount = await countPassportsByShop(shop.id);
  const planLimit = PLAN_LIMITS[shop.plan] ?? 5;

  return json({
    products,
    passportMap,
    passportCount,
    planLimit,
    shopPlan: shop.plan,
  });
};

export default function Index() {
  const { products, passportMap, passportCount, planLimit, shopPlan } =
    useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const resourceName = { singular: "product", plural: "products" };
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products);

  const atLimit = planLimit !== -1 && passportCount >= planLimit;

  return (
    <Page
      title="PassPort Dashboard"
      subtitle="Generate EU Digital Product Passports for your products"
      primaryAction={{
        content: "Upgrade Plan",
        onAction: () => navigate("/app/billing"),
        disabled: shopPlan === "Brand",
      }}
    >
      {atLimit && (
        <div style={{ marginBottom: "16px" }}>
          <Banner
            title={`You've reached your ${shopPlan} plan limit (${planLimit} passports)`}
            tone="warning"
            action={{
              content: "Upgrade now",
              onAction: () => navigate("/app/billing"),
            }}
          >
            <p>Upgrade to add passports for more products.</p>
          </Banner>
        </div>
      )}

      <Card>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e1e3e5" }}>
          <Text variant="headingSm" as="h2">
            {passportCount} / {planLimit === Infinity ? "∞" : planLimit} passports used
            <span style={{ marginLeft: "8px", color: "#6b7280", fontWeight: 400 }}>
              ({shopPlan} plan)
            </span>
          </Text>
        </div>

        {products.length === 0 ? (
          <EmptyState
            heading="No products found"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Add products to your Shopify store to create Digital Product Passports.</p>
          </EmptyState>
        ) : (
          <IndexTable
            resourceName={resourceName}
            itemCount={products.length}
            selectedItemsCount={
              allResourcesSelected ? "All" : selectedResources.length
            }
            onSelectionChange={handleSelectionChange}
            headings={[
              { title: "Product" },
              { title: "Type" },
              { title: "Passport" },
              { title: "Action" },
            ]}
          >
            {products.map(
              (
                product: {
                  id: string;
                  title: string;
                  productType: string;
                  featuredImage?: { url: string; altText?: string };
                },
                index: number
              ) => {
                const numericId = product.id.replace("gid://shopify/Product/", "");
                const passport = passportMap[product.id];
                const badge = passport
                  ? getComplianceBadge(passport.compliance_score)
                  : null;

                return (
                  <IndexTable.Row
                    id={product.id}
                    key={product.id}
                    selected={selectedResources.includes(product.id)}
                    position={index}
                  >
                    <IndexTable.Cell>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Thumbnail
                          source={product.featuredImage?.url ?? ""}
                          alt={product.featuredImage?.altText ?? product.title}
                          size="small"
                        />
                        <Text variant="bodyMd" fontWeight="bold" as="span">
                          {product.title}
                        </Text>
                      </div>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Text variant="bodyMd" as="span" tone="subdued">
                        {product.productType || "—"}
                      </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      {badge ? (
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                      ) : (
                        <Badge tone="info">No passport</Badge>
                      )}
                    </IndexTable.Cell>
                    <IndexTable.Cell>
                      <Button
                        size="slim"
                        onClick={() => navigate(`/app/products/${numericId}`)}
                        disabled={atLimit && !passport}
                      >
                        {passport ? "Edit Passport" : "Create Passport"}
                      </Button>
                    </IndexTable.Cell>
                  </IndexTable.Row>
                );
              }
            )}
          </IndexTable>
        )}
      </Card>
    </Page>
  );
}
