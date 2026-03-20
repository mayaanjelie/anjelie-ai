import { shopifyApi, ApiVersion, LogSeverity } from '@shopify/shopify-api';
import { restResources } from '@shopify/shopify-api/rest/admin/2024-01';

let _shopify: ReturnType<typeof shopifyApi> | null = null;

export function getShopify() {
  if (!_shopify) {
    _shopify = shopifyApi({
      apiKey: process.env.SHOPIFY_API_KEY ?? 'placeholder',
      apiSecretKey: process.env.SHOPIFY_API_SECRET ?? 'placeholder',
      scopes: [
        'read_products',
        'write_products',
        'read_themes',
        'write_themes',
        'read_script_tags',
        'write_script_tags',
      ],
      hostName: (process.env.HOST ?? 'localhost:3000').replace(/https?:\/\//, ''),
      apiVersion: ApiVersion.January24,
      isEmbeddedApp: true,
      restResources,
      logger: {
        level: process.env.NODE_ENV === 'development' ? LogSeverity.Debug : LogSeverity.Error,
      },
    });
  }
  return _shopify;
}

// Keep named export for convenience
export const shopify = { get auth() { return getShopify().auth; }, get utils() { return getShopify().utils; }, get webhooks() { return getShopify().webhooks; } };

export type ShopifySession = {
  id: string;
  shop: string;
  state: string;
  isOnline: boolean;
  accessToken?: string;
  scope?: string;
};
