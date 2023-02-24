// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '../utils/logger';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
}

// config
export const config = {

}