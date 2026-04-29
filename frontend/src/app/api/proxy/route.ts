import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const { path, method = 'POST', body, headers: customHeaders } = await request.json();

    if (!path) {
      return NextResponse.json({ error: 'Path es requerido' }, { status: 400 });
    }

    const url = `${BACKEND_URL}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Error en proxy' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path');
    const customHeaders = searchParams.get('headers') ? JSON.parse(searchParams.get('headers') || '{}') : {};

    if (!path) {
      return NextResponse.json({ error: 'Path es requerido' }, { status: 400 });
    }

    const url = `${BACKEND_URL}${path}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders,
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy GET error:', error);
    return NextResponse.json(
      { error: 'Error en proxy' },
      { status: 500 }
    );
  }
}
