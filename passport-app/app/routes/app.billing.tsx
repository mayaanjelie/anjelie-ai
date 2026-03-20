import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import {
  Badge,
  BlockStack,
  Button,
  Card,
  InlineStack,
  List,
  Page,
  Text,
} from "@shopify/polaris";
import { authenticate, PLAN_LIMITS } from "../shopify.server";
import { getOrCreateShop } from "../supabase.server";

const PLANS = [
  {
    name: "free",
    displayName: "Free",
    price: 0,
    limit: 5,
    features: [
      "Up to 5 product passports",
      "QR code widget",
      "AI auto-fill (3 uses/month)",
      "Public passport page",
    ],
  },
  {
    name: "Starter",
    displayName: "Starter",
    price: 29,
    limit: 50,
    features: [
      "Up to 50 product passports",
      "QR code widget",
      "Unlimited AI auto-fill",
      "Public passport page",
      "Email support",
    ],
  },
  {
    name: "Growth",
    displayName: "Growth",
    price: 79,
    limit: 500,
    features: [
      "Up to 500 product passports",
      "QR code widget",
      "Unlimited AI auto-fill",
      "Public passport page",
      "Priority email support",
      "Custom widget colors",
    ],
  },
  {
    name: "Brand",
    displayName: "Brand",
    price: 149,
    limit: Infinity,
    features: [
      "Unlimited product passports",
      "QR code widget",
      "Unlimited AI auto-fill",
      "Public passport page",
      "Priority support",
      "Custom widget colors",
      "White-label passport page",
    ],
  },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = await getOrCreateShop(session.shop);
  return json({ currentPlan: shop.plan });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { billing } = await authenticate.admin(request);
  const formData = await request.formData();
  const planName = String(formData.get("plan") || "");

  if (planName === "free") {
    return redirect("/app");
  }

  const validPaidPlans = ["Starter", "Growth", "Brand"] as const;
  if (!validPaidPlans.includes(planName as (typeof validPaidPlans)[number])) {
    return json({ error: "Invalid plan" }, { status: 400 });
  }

  const billingCheckResponse = await billing.require({
    plans: [planName as (typeof validPaidPlans)[number]],
    isTest: process.env.NODE_ENV !== "production",
    onFailure: async () =>
      billing.request({
        plan: planName as (typeof validPaidPlans)[number],
        isTest: process.env.NODE_ENV !== "production",
        returnUrl: `${process.env.SHOPIFY_APP_URL}/app/billing`,
      }),
  });

  return redirect(billingCheckResponse as unknown as string);
};

export default function BillingPage() {
  const { currentPlan } = useLoaderData<typeof loader>();

  return (
    <Page
      title="Choose your plan"
      subtitle="Scale your PassPort usage as your brand grows"
      backAction={{ content: "Dashboard", url: "/app" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "16px",
        }}
      >
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.name;
          const limitText =
            plan.limit === Infinity ? "Unlimited" : `Up to ${plan.limit}`;

          return (
            <Card key={plan.name}>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text variant="headingMd" as="h2">
                    {plan.displayName}
                  </Text>
                  {isCurrentPlan && (
                    <Badge tone="success">Current plan</Badge>
                  )}
                </InlineStack>

                <div>
                  <Text variant="heading2xl" as="p">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </Text>
                  {plan.price > 0 && (
                    <Text variant="bodyMd" as="p" tone="subdued">
                      per month
                    </Text>
                  )}
                </div>

                <Text variant="bodyMd" as="p" fontWeight="bold">
                  {limitText} passports
                </Text>

                <List>
                  {plan.features.map((f) => (
                    <List.Item key={f}>{f}</List.Item>
                  ))}
                </List>

                <Form method="post">
                  <input type="hidden" name="plan" value={plan.name} />
                  <Button
                    variant={isCurrentPlan ? "secondary" : "primary"}
                    disabled={isCurrentPlan}
                    submit
                    fullWidth
                  >
                    {isCurrentPlan
                      ? "Current plan"
                      : plan.price === 0
                      ? "Downgrade to Free"
                      : `Upgrade to ${plan.displayName}`}
                  </Button>
                </Form>
              </BlockStack>
            </Card>
          );
        })}
      </div>
    </Page>
  );
}
