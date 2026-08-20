import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (password === 'hsrprath2026') {
      const response = NextResponse.json({ success: true });
      
      // Set secure session cookie
      response.cookies.set('fastpace_session', 'authenticated', {
        httpOnly: false, // Set false to make client checks/logout easy
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
