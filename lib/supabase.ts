// Lightweight Native REST Client for Supabase (Zero External Dependencies)

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://tfvsyisseedmbqzzkjuk.supabase.co';

const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://')
  );
};

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

export const getSupabase = (): SupabaseRestClient | null => {
  if (!isSupabaseConfigured()) return null;

  const getHeaders = () => ({
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  });

  return {
    from: (table: string) => {
      const baseUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}`;

      return {
        select: async (query: string = '*'): Promise<SupabaseResponse> => {
          try {
            const res = await fetch(`${baseUrl}?select=${encodeURIComponent(query)}`, {
              method: 'GET',
              headers: getHeaders(),
            });
            if (!res.ok) {
              const errText = await res.text();
              return { data: null, error: errText };
            }
            const data = await res.json();
            return { data, error: null };
          } catch (err) {
            return { data: null, error: err };
          }
        },

        insert: async (records: any[]): Promise<SupabaseResponse> => {
          try {
            const res = await fetch(baseUrl, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify(records),
            });
            if (!res.ok) {
              const errText = await res.text();
              return { data: null, error: errText };
            }
            const data = await res.json();
            return { data, error: null };
          } catch (err) {
            return { data: null, error: err };
          }
        },

        update: (updateData: any) => ({
          eq: async (column: string, value: any): Promise<SupabaseResponse> => {
            try {
              const url = `${baseUrl}?${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`;
              const res = await fetch(url, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(updateData),
              });
              if (!res.ok) {
                const errText = await res.text();
                return { data: null, error: errText };
              }
              const data = await res.json();
              return { data, error: null };
            } catch (err) {
              return { data: null, error: err };
            }
          },
        }),

        delete: () => ({
          eq: async (column: string, value: any): Promise<SupabaseResponse> => {
            try {
              const url = `${baseUrl}?${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`;
              const res = await fetch(url, {
                method: 'DELETE',
                headers: getHeaders(),
              });
              if (!res.ok) {
                const errText = await res.text();
                return { data: null, error: errText };
              }
              return { data: true, error: null };
            } catch (err) {
              return { data: null, error: err };
            }
          },
        }),
      };
    },
  };
};

export const supabase = getSupabase();
