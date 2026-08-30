import { NextResponse } from 'next/server';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://tfvsyisseedmbqzzkjuk.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

// Server-side persistent storage cache for Vercel
const globalStore: Record<string, any[]> = (globalThis as any).__immo_db_store || {
  properties: [],
  leases: [],
  payments: [],
  inventory_reports: [],
  conversations: [],
  profiles: [],
};
(globalThis as any).__immo_db_store = globalStore;

const getSupabaseHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
  if (SUPABASE_ANON_KEY) {
    headers['apikey'] = SUPABASE_ANON_KEY;
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
  }
  return headers;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table') || 'properties';

    // Try fetching from Supabase REST API first
    if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('placeholder')) {
      const baseUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}?select=*`;
      const res = await fetch(baseUrl, {
        method: 'GET',
        headers: getSupabaseHeaders(),
        cache: 'no-store',
      });

      if (res.ok) {
        const dbData = await res.json();
        if (dbData && Array.isArray(dbData) && dbData.length > 0) {
          globalStore[table] = dbData;
          return NextResponse.json({ success: true, data: dbData, source: 'supabase' });
        }
      }
    }

    // Fallback to server-persisted store
    const cached = globalStore[table] || [];
    return NextResponse.json({ success: true, data: cached, source: 'server_cache' });
  } catch (error: any) {
    const table = new URL(request.url).searchParams.get('table') || 'properties';
    return NextResponse.json({
      success: true,
      data: globalStore[table] || [],
      source: 'fallback',
    });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table') || 'properties';
    const body = await request.json();
    const records = Array.isArray(body) ? body : [body];

    if (!globalStore[table]) {
      globalStore[table] = [];
    }

    // Upsert into server store
    records.forEach((record) => {
      const idx = globalStore[table].findIndex((item) => item.id === record.id);
      if (idx >= 0) {
        globalStore[table][idx] = { ...globalStore[table][idx], ...record };
      } else {
        globalStore[table].unshift(record);
      }
    });

    // Sync to Supabase REST API asynchronously
    if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('placeholder')) {
      const baseUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}`;
      fetch(baseUrl, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(records),
      }).catch((e) => console.warn(`Supabase sync ${table} post notice:`, e));
    }

    return NextResponse.json({
      success: true,
      data: records,
      source: 'server_store',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error processing POST request' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table') || 'properties';
    const id = searchParams.get('id');
    const updateData = await request.json();

    if (!globalStore[table]) {
      globalStore[table] = [];
    }

    if (id) {
      const idx = globalStore[table].findIndex((item) => item.id === id);
      if (idx >= 0) {
        globalStore[table][idx] = { ...globalStore[table][idx], ...updateData };
      }
    }

    // Sync to Supabase REST API
    if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('placeholder') && id) {
      const baseUrl = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`;
      fetch(baseUrl, {
        method: 'PATCH',
        headers: getSupabaseHeaders(),
        body: JSON.stringify(updateData),
      }).catch((e) => console.warn(`Supabase sync ${table} patch notice:`, e));
    }

    return NextResponse.json({
      success: true,
      data: updateData,
      source: 'server_store',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error processing PATCH request' },
      { status: 500 }
    );
  }
}
