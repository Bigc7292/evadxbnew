import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { Providers } from './providers';
import { CustomCursor } from '@/lib/components/CustomCursor';
import { Navigation } from '@/lib/components/Navigation';
import { Footer } from '@/lib/components/Footer';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <>
      <CustomCursor />
      <Navigation locale={locale} />
      <NextIntlClientProvider messages={messages} locale={locale}>
        <Providers>{children}</Providers>
        <Footer />
      </NextIntlClientProvider>
    </>
  );
}
