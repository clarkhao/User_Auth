// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = new URL(request.url);
  /** 
  * 部分优化
  */
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  /** 
  * CORS
  */
  response.headers.set('Access-Control-Allow-Origin', url.origin);
  response.headers.set('Access-Control-Allow-Method', '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  /** 
  * for security 除了swagger doc页面
  */
  if (!request.nextUrl.pathname.startsWith('/docs')) {
    /* develop mode closed these headers
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('Content-Security-Policy', `script-src 'self'`);
    */
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    /** 
    * auth api不设缓存
    */
    if (request.nextUrl.pathname.startsWith('/api/v0/user')) {
      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '-1');
    } else {
      response.headers.set('Cache-Control', 'public, max-age=604800');
    }
  }
  return response;
}
