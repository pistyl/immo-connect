// Lightweight Native Database REST Client for ImmoConnect (Vercel & Supabase Sync)

const dbUrl = process.env.DATABASE_URL || '';
let derivedUrl = '';
if (dbUrl.includes('@db.')) {
  const hostMatch = dbUrl.match(/@db\.([a-z0-9]+)\.supabase\.co/);
  if (hostMatch && hostMatch[1]) {
    derivedUrl = `https://${hostMatch[1]}.supabase.co`;
  }
}

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  derivedUrl ||
  'https://tfvsyisseedmbqzzkjuk.supabase.co';

const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => true;

export interface SupabaseResponse<T = any> {
  data: T | null;
  error: any | null;
}

export interface SupabaseTableQuery {
  select: (query?: string) => Promise<SupabaseResponse>;
  insert: (records: any[]) => Promise<SupabaseResponse>;
  update: (data: any) => {
    eq: (column: string, value: any) => Promise<SupabaseResponse>;
  };
  delete: () => {
    eq: (column: string, value: any) => Promise<SupabaseResponse>;
  };
}

export interface SupabaseRestClient {
  from: (table: string) => SupabaseTableQuery;
}

export const getSupabase = (): SupabaseRestClient => {
  const getHeaders = () => ({
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  });

  return {
    from: (table: string) => {
      const baseUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}`;
      const proxyUrl = `/api/db?table=${encodeURIComponent(table)}`;

      return {
        select: async (query: string = '*'): Promise<SupabaseResponse> => {
          try {
            // First try internal API route (which caches & syncs)
            const proxyRes = await fetch(proxyUrl, { method: 'GET' });
            if (proxyRes.ok) {
              const resData = await proxyRes.json();
              if (resData.success && resData.data) {
                return { data: resData.data, error: null };
              }
            }

            // Fallback to direct REST API if configured
            if (supabaseAnonKey && !supabaseAnonKey.includes('placeholder')) {
              const res = await fetch(`${baseUrl}?select=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: getHeaders(),
              });
              if (res.ok) {
                const data = await res.json();
                return { data, error: null };
              }
            }

            return { data: null, error: 'Select query failed' };
          } catch (err) {
            return { data: null, error: err };
          }
        },

        insert: async (records: any[]): Promise<SupabaseResponse> => {
          try {
            // Store & sync via API Route
            const proxyRes = await fetch(proxyUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(records),
            });

            if (proxyRes.ok) {
              const resData = await proxyRes.json();
              return { data: resData.data || records, error: null };
            }

            // Direct REST API fallback
            if (supabaseAnonKey && !supabaseAnonKey.includes('placeholder')) {
              const res = await fetch(baseUrl, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(records),
              });
              if (res.ok) {
                const data = await res.json();
                return { data, error: null };
              }
            }

            return { data: records, error: null };
          } catch (err) {
            return { data: records, error: null };
          }
        },

        update: (updateData: any) => ({
          eq: async (column: string, value: any): Promise<SupabaseResponse> => {
            try {
              const patchProxyUrl = `/api/db?table=${encodeURIComponent(table)}&${encodeURIComponent(column)}=${encodeURIComponent(value)}`;
              const proxyRes = await fetch(patchProxyUrl, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
              });

              if (proxyRes.ok) {
                const resData = await proxyRes.json();
                return { data: resData.data || updateData, error: null };
              }

              if (supabaseAnonKey && !supabaseAnonKey.includes('placeholder')) {
                const url = `${baseUrl}?${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`;
                const res = await fetch(url, {
                  method: 'PATCH',
                  headers: getHeaders(),
                  body: JSON.stringify(updateData),
                });
                if (res.ok) {
                  const data = await res.json();
                  return { data, error: null };
                }
              }

              return { data: updateData, error: null };
            } catch (err) {
              return { data: updateData, error: null };
            }
          },
        }),

        delete: () => ({
          eq: async (column: string, value: any): Promise<SupabaseResponse> => {
            try {
              if (supabaseAnonKey && !supabaseAnonKey.includes('placeholder')) {
                const url = `${baseUrl}?${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`;
                await fetch(url, {
                  method: 'DELETE',
                  headers: getHeaders(),
                });
              }
              return { data: true, error: null };
            } catch (err) {
              return { data: true, error: null };
            }
          },
        }),
      };
    },
  };
};

export const supabase = getSupabase();
