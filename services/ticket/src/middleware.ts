// import createLocaleMiddleware from '@telus/next-locale-middleware'
import { NextRequest, NextResponse } from 'next/server';

/*
 * For details on cookies, redirects, and config options see here:
 * https://github.com/telus/platform-web/tree/main/packages/next-locale-middleware#readme
 */
// const localMiddleware = createLocaleMiddleware()

// Create a middleware to inject a fake jwt header when in development
const middleware = (req: NextRequest) => {
  const requestHeaders = new Headers(req.headers);

  if (process.env.APP_ENV === 'development') {
    requestHeaders.set('x-id-token', process.env.FAKE_ID_TOKEN!);
  }

  return NextResponse.next({
    request: {
      // New request headers
      headers: requestHeaders,
    },
  });
};

export default middleware;
