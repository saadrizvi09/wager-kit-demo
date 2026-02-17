import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // No authentication required for demo
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/market/:path*'],
};
