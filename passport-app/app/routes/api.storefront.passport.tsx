/**
 * Public API endpoint — no Shopify auth required.
 * Called by the Liquid QR widget via AJAX to get the QR code image + passport URL.
 * The Shopify domain is used to identify the shop.
 */
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import supabase from "../supabase.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const shopifyProductId = url.searchParams.get("shopify_product_id");
  const referer = request.headers.get("referer") ?? "";

  // Extract shop domain from Referer header
  let shopDomain: string | null = null;
  try {
    const refererUrl = new URL(referer);
    shopDomain = refererUrl.hostname; // e.g. my-store.myshopify.com
  } catch {
    return json({ error: "Invalid request" }, { status: 400 });
  }

  if (!shopifyProductId || !shopDomain) {
    return json({ error: "Missing parameters" }, { status: 400 });
  }

  // Lookup shop
  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("shopify_domain", shopDomain)
    .single();

  if (!shop) {
    return json({ error: "Shop not found" }, { status: 404 });
  }

  // Lookup passport
  const { data: passport } = await supabase
    .from("product_passports")
    .select("id, qr_code_base64")
    .eq("shop_id", shop.id)
    .eq("shopify_product_id", shopifyProductId)
    .single();

  if (!passport?.qr_code_base64) {
    return json({ error: "No passport found" }, { status: 404 });
  }

  const passportUrl = `${process.env.SHOPIFY_APP_URL}/passport/${passport.id}`;

  // CORS headers so Liquid widget can fetch cross-origin
  return json(
    { qr_code_base64: passport.qr_code_base64, passport_url: passportUrl },
    {
      headers: {
        "Access-Control-Allow-Origin": `https://${shopDomain}`,
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
};
