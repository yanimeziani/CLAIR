import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if maintenance mode is enabled via environment variable
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true';
  
  // Skip maintenance for the maintenance page itself and API routes needed for status
  const isMaintenancePage = request.nextUrl.pathname === '/maintenance';
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  const isStaticAsset = request.nextUrl.pathname.startsWith('/_next/') || 
                       request.nextUrl.pathname.startsWith('/favicon') ||
                       request.nextUrl.pathname.includes('.');

  // If maintenance mode is enabled and it's not an excluded path
  if (maintenanceMode && !isMaintenancePage && !isApiRoute && !isStaticAsset) {
    // Redirect to maintenance page
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // If maintenance mode is disabled and user is on maintenance page, redirect to home
  if (!maintenanceMode && isMaintenancePage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}