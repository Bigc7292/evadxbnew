'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Menu, X, Globe, Lock } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

const socialLinks = [
  { href: 'https://www.instagram.com/evaestate.eu', label: 'Instagram', icon: '📸' },
  { href: 'https://www.facebook.com/evaestate.eu', label: 'Facebook', icon: '📘' },
  { href: 'https://www.tiktok.com/@evaestate.eu', label: 'TikTok', icon: '🎵' },
  { href: 'https://www.linkedin.com/company/evaestate.eu', label: 'LinkedIn', icon: '💼' },
];

const EVA_LOGO_URL = '/logo.jpg';
const EVA_GREEN = '#1B4644';
const EVA_GREEN_DARK = '#0B2A22';
const EVA_GOLD = '#E5CA9B';
const EVA_SURFACE = '#F8F6F0';
const EVA_DARK_SURFACE = '#030A07';

interface NavigationProps {
  locale: string;
}

type MenuTab = 'properties' | 'company' | 'socials';

export function Navigation({ locale }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MenuTab>('properties');
  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  const tabs: { key: MenuTab; label: string }[] = [
    { key: 'properties', label: 'Properties' },
    { key: 'company', label: 'Company' },
    { key: 'socials', label: 'Socials' },
  ];

  const tabContent: Record<MenuTab, { title: string; links: { href: string; label: string }[] }[]> = {
    properties: [
      {
        title: 'Properties',
        links: [
          { href: `/${locale}/properties/off-plan`, label: 'Off-Plan Properties' },
          { href: `/${locale}/properties/secondary`, label: 'Secondary Properties' },
        ],
      },
    ],
    company: [
      {
        title: 'Company',
        links: [
          { href: `/${locale}/about-us`, label: 'About Us' },
          { href: `/${locale}/ceo`, label: 'CEO' },
          { href: `/${locale}/team`, label: 'Our Team' },
          { href: `/${locale}/partners`, label: 'Partners' },
          { href: `/${locale}/rewards`, label: 'Rewards' },
        ],
      },
      {
        title: 'News',
        links: [
          { href: `/${locale}/blog`, label: 'Blog & News' },
        ],
      },
    ],
    socials: [
      {
        title: 'Follow Us',
        links: socialLinks.map((link) => ({
          href: link.href,
          label: `${link.icon} ${link.label}`,
        })),
      },
    ],
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b shadow-sm"
      style={{ backgroundColor: EVA_GREEN, borderColor: EVA_GOLD }}
    >
      <nav className="w-full" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href={`/${locale}`} className="flex items-center space-x-2 group" aria-label="EVA Real Estate Home">
              <div className="relative w-9 h-9 rounded-lg overflow-hidden shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={EVA_LOGO_URL}
                  alt="EVA Real Estate Agency"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="font-heading text-base font-semibold leading-tight" style={{ color: EVA_SURFACE }}>
                  EVA Real Estate Agency
                </span>
                <span className="text-[11px] tracking-wide" style={{ color: EVA_GOLD }}>
                  WHERE VISION MEETS VALUE
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1 ml-4">
              <Link
                href={`/${locale}/properties/off-plan`}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{ color: EVA_SURFACE }}
              >
                Off-Plan Properties
              </Link>
              <Link
                href={`/${locale}/properties`}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{ color: EVA_SURFACE }}
              >
                Secondary Properties
              </Link>
              <Link
                href={`/${locale}/contacts`}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{ color: EVA_SURFACE }}
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group block sm:block">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 transition-colors"
                style={{ color: EVA_SURFACE }}
              >
                <Globe className="w-4 h-4" />
                <span className="hidden md:inline">{currentLang.flag} {currentLang.name}</span>
              </Button>
              <div
                className="absolute right-0 mt-2 w-44 rounded-xl border shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-2 max-h-60 overflow-y-auto"
                style={{ backgroundColor: EVA_GREEN, borderColor: 'rgba(245, 245, 240, 0.2)' }}
              >
                {languages.map((lang) => (
                  <Link
                    key={lang.code}
                    href={`/${lang.code}/properties/off-plan`}
                    className="flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                    style={{ color: EVA_SURFACE }}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="gap-2 transition-colors"
              style={{ color: EVA_SURFACE }}
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div
          className="lg:hidden absolute right-4 top-16 z-40 w-72 rounded-xl border shadow-2xl overflow-hidden"
          style={{ backgroundColor: EVA_GREEN, borderColor: 'rgba(245, 245, 240, 0.2)' }}
        >
          <div className="p-2">
            <div className="flex rounded-lg overflow-hidden mb-2" style={{ backgroundColor: EVA_GREEN_DARK }}>
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors"
                  style={{
                    color: activeTab === tab.key ? EVA_SURFACE : 'rgba(245, 245, 240, 0.6)',
                    backgroundColor: activeTab === tab.key ? EVA_GREEN : 'transparent',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {tabContent[activeTab].map((category) => (
                <div key={category.title} className="space-y-0.5">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider px-2 pt-1" style={{ color: EVA_GOLD }}>
                    {category.title}
                  </h3>
                  <div className="space-y-0.5">
                    {category.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors"
                        style={{ color: EVA_SURFACE }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(245, 245, 240, 0.12)' }}>
              <div className="px-2 pb-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: EVA_GOLD }}>
                  Language
                </div>
                <div className="flex flex-wrap gap-1">
                  {languages.map((lang) => (
                    <Link
                      key={lang.code}
                      href={`/${lang.code}/properties/off-plan`}
                      className="px-2 py-1 text-[11px] font-medium rounded-md transition-colors"
                      style={{ color: EVA_SURFACE, backgroundColor: lang.code === locale ? EVA_GREEN_DARK : 'transparent' }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {lang.flag} {lang.code.toUpperCase()}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(245, 245, 240, 0.12)' }}>
              <Link
                href={`/${locale}/admin/login`}
                className="flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-md transition-colors"
                style={{ backgroundColor: EVA_GOLD, color: EVA_GREEN_DARK }}
                onClick={() => setIsMenuOpen(false)}
              >
                <Lock className="w-3 h-3" />
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
