import { NextRequest, NextResponse } from 'next/server';
import { parseSessionCookie, SESSION_COOKIE_NAME } from '@/lib/candidate-session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const cookieVal = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!cookieVal) {
    return NextResponse.json({ email: null }, { status: 401 });
  }
  const email = await parseSessionCookie(cookieVal);
  if (!email) {
    return NextResponse.json({ email: null }, { status: 401 });
  }
  return NextResponse.json({ email });
}
