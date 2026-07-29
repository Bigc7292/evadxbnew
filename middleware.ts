import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ar', 'ru', 'zh', 'fr', 'de', 'es', 'hi', 'pt', 'tr'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
