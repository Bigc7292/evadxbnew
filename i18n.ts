import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ar', 'ru', 'zh', 'fr', 'de', 'es', 'hi', 'pt', 'tr'] as const;
export const defaultLocale = 'en';

export default getRequestConfig(async ({ locale }) => {
  const resolved = (locales as readonly string[]).includes(locale ?? '') ? locale! : defaultLocale;

  let messages;
  try {
    messages = (await import(`./messages/${resolved}.json`)).default;
  } catch {
    messages = (await import(`./messages/en.json`)).default;
  }

  return { locale: resolved, messages };
});

export async function getMessages(locale: string): Promise<Record<string, any>> {
  try {
    return (await import(`./messages/${locale}.json`)).default;
  } catch {
    return (await import(`./messages/en.json`)).default;
  }
}