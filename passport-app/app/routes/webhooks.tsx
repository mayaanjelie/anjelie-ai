import { authenticate } from "../shopify.server";
import supabase from "../supabase.server";
import type { ActionFunctionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, payload } = await authenticate.webhook(request);

  console.log(`[Webhook] ${topic} received for ${shop}`);

  switch (topic) {
    case "APP_UNINSTALLED": {
      if (session) {
        // Remove shop data from Supabase (cascade deletes passports)
        await supabase
          .from("shops")
          .delete()
          .eq("shopify_domain", shop);
      }
      break;
    }
    case "APP_SCOPES_UPDATE": {
      // Log scope changes — handle if needed
      console.log("[Webhook] Scopes updated:", payload);
      break;
    }
    default: {
      console.warn(`[Webhook] Unhandled topic: ${topic}`);
    }
  }

  return new Response(null, { status: 200 });
};
