import { Session } from '@shopify/shopify-api';
import { supabase } from './supabase';

// Custom session storage backed by Supabase
export const sessionStorage = {
  async storeSession(session: Session): Promise<boolean> {
    const { error } = await supabase.from('shopify_sessions').upsert({
      id: session.id,
      shop: session.shop,
      state: session.state,
      is_online: session.isOnline,
      access_token: session.accessToken,
      scope: session.scope,
      expires: session.expires?.toISOString(),
      online_access_info: session.onlineAccessInfo
        ? JSON.stringify(session.onlineAccessInfo)
        : null,
    });
    return !error;
  },

  async loadSession(id: string): Promise<Session | undefined> {
    const { data, error } = await supabase
      .from('shopify_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    const session = new Session({
      id: data.id,
      shop: data.shop,
      state: data.state,
      isOnline: data.is_online,
    });

    session.accessToken = data.access_token;
    session.scope = data.scope;
    if (data.expires) session.expires = new Date(data.expires);
    if (data.online_access_info) {
      session.onlineAccessInfo = JSON.parse(data.online_access_info);
    }

    return session;
  },

  async deleteSession(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('shopify_sessions')
      .delete()
      .eq('id', id);
    return !error;
  },

  async deleteSessions(ids: string[]): Promise<boolean> {
    const { error } = await supabase
      .from('shopify_sessions')
      .delete()
      .in('id', ids);
    return !error;
  },

  async findSessionsByShop(shop: string): Promise<Session[]> {
    const { data, error } = await supabase
      .from('shopify_sessions')
      .select('*')
      .eq('shop', shop);

    if (error || !data) return [];

    return data.map((row) => {
      const session = new Session({
        id: row.id,
        shop: row.shop,
        state: row.state,
        isOnline: row.is_online,
      });
      session.accessToken = row.access_token;
      session.scope = row.scope;
      if (row.expires) session.expires = new Date(row.expires);
      return session;
    });
  },
};

// Get offline session for a shop (used for background tasks)
export async function getOfflineSession(shop: string) {
  const sessions = await sessionStorage.findSessionsByShop(shop);
  return sessions.find((s) => !s.isOnline);
}
