import { NextResponse } from 'next/server';

const UNITECHPAY_API_KEY =
  process.env.UNITECHPAY_API_KEY ||
  process.env.NEXT_PUBLIC_UNITECHPAY_API_KEY ||
  '4c53ad12e1e4bcaa5d65576fadfef7618dfa7fd495124f7d8093968d5d0e505c';

const BASE_URL = 'https://api.unitech.sn/api.php';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'create_wave_payment';
    const body = await request.json();

    const targetUrl = `${BASE_URL}?action=${action}`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${UNITECHPAY_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('UnitechPay Proxy Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la communication avec l\'API UnitechPay',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'balance';

    const targetUrl = `${BASE_URL}?action=${action}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${UNITECHPAY_API_KEY}`,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('UnitechPay GET Proxy Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Erreur lors de la consultation du solde UnitechPay',
      },
      { status: 500 }
    );
  }
}
