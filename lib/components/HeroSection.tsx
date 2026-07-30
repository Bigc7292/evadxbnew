'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Search, ChevronDown, Globe, Heart, MapPin, LayoutGrid, Menu, X, Building2, ShieldCheck } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { useRouter } from 'next/navigation';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/lib/components/ui/select';
import { cn } from '@/lib/utils';

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

const trustPartners = [
  'Khaleej Times',
  'Gulf News',
  'Emaar Properties',
  'DAMAC Properties',
  'Meraas',
  'Sobha Realty',
  'Nakheel',
  'Dubai Properties',
  'Select Group',
];

const HERO_ASSETS = {
  sky: '/01_sky.png',
  burj: '/02_burj_middle.png',
  foreground: '/03_foreground.png',
};

export function HeroSection() {
  const t = useTranslations();
  const locale = useLocale();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(locale);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const corridorRef = useRef<HTMLDivElement>(null);
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });

  const tiltIntensity = 8;
  const lerpFactor = 0.05;
  const bankIntensity = 3;
  const panIntensity = 20;
  const hoverAmplitude = 6;
  const hoverFrequency = 0.002;

  useEffect(() => {
    const corridor = corridorRef.current;
    const heroTrack = heroTrackRef.current;
    if (!corridor || !heroTrack) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let rafId: number;
    const render = (time: number) => {
      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * lerpFactor;
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * lerpFactor;

      const rotateX = -currentMouseRef.current.y * tiltIntensity;
      const rotateY = currentMouseRef.current.x * tiltIntensity;
      const rotateZ = currentMouseRef.current.x * bankIntensity;
      const translateX = -currentMouseRef.current.x * panIntensity;
      const translateY = -currentMouseRef.current.y * panIntensity;
      const hoverY = Math.sin(time * hoverFrequency) * hoverAmplitude;

      corridor.style.transform = `translate3d(${translateX}px, ${translateY + hoverY}px, 0px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const heroLayers = useMemo(() => [
    { id: 'layer-sky', src: HERO_ASSETS.sky, translateZ: -250, scale: 1.55, zIndex: 1 },
    { id: 'layer-burj', src: HERO_ASSETS.burj, translateZ: 0, scale: 1, zIndex: 2 },
    { id: 'layer-foreground', src: HERO_ASSETS.foreground, translateZ: 180, scale: 0.8, zIndex: 3 },
  ], []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/${locale}/properties?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push(`/${locale}/properties`);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero scroll track provides scrollable flight distance */}
      <div ref={heroTrackRef} className="relative" style={{ height: '350vh' }}>
        {/* Sticky 3D scene that stays locked to the viewport while scrolling the track */}
        <section className="sticky top-0 h-screen w-full overflow-hidden pt-16 sm:pt-24 lg:pt-32" id="hero" style={{ zIndex: 1 }}>
          {/* 3D Parallax Scene */}
          <div className="absolute inset-0" style={{ perspective: '1200px' }}>
            <div
              ref={corridorRef}
              className="absolute inset-0"
              style={{ transformStyle: 'preserve-3d', transformOrigin: 'center center', willChange: 'transform' }}
            >
              {heroLayers.map((layer) => (
                <div
                  key={layer.id}
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url(${layer.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    transform: `translateZ(${layer.translateZ}px) scale(${layer.scale})`,
                    zIndex: layer.zIndex,
                    willChange: 'transform',
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />
          </div>

          {/* Animated Gold Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => {
              const angle = (i / 20) * Math.PI * 2;
              const radius = 0.3 + (i % 5) * 0.15;
              const x = Math.round((50 + Math.cos(angle) * radius * 40) * 10000) / 10000;
              const y = Math.round((50 + Math.sin(angle) * radius * 40) * 10000) / 10000;
              const duration = 8 + (i % 7) * 1.2;
              const delay = (i % 10) * 0.6;

              return (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-accent/60 rounded-full"
                  initial={{ x: `${x}%`, y: `${y}%`, opacity: 0 }}
                  animate={{ y: [null, -100, 100], opacity: [0, 0.8, 0] }}
                  transition={{ duration, repeat: Infinity, delay }}
                />
              );
            })}
          </div>

          {/* Hero Content */}
          <motion.div
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16"
          >
            <div className="max-w-3xl lg:max-w-4xl lg:ml-8 xl:ml-16">
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-accent/40 text-accent text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase mb-8 backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                {t('hero.badge')}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 leading-[1.05] tracking-tight"
                style={{ textShadow: '0 0 80px rgba(197, 160, 89, 0.2)' }}
              >
                {t('hero.title')}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium tracking-[0.2em] uppercase mb-8 gradient-gold"
                style={{ textShadow: '0 0 40px rgba(197, 160, 89, 0.3)' }}
              >
                {t('hero.subtitle')}
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-white/85 mb-10 max-w-2xl leading-relaxed"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
              >
                {t('hero.description')}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-4xl"
              >
                <div className="relative w-full rounded-3xl border border-accent/30 bg-black/40 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
                    <div className="flex items-center gap-3 px-5 py-4 sm:border-r border-white/10 flex-1">
                      <Search className="w-5 h-5 text-accent" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder={t('hero.searchPlaceholder')}
                        className="border-0 bg-transparent text-white placeholder:text-white/60 focus:outline-none focus:ring-0 focus:border-0 focus:ring-offset-0 p-0 h-auto shadow-none w-full"
                      />
                    </div>
                    <div className="flex items-center gap-3 px-5 py-4 sm:border-r border-white/10">
                      <MapPin className="w-5 h-5 text-accent" />
                      <Select defaultValue="all">
                        <SelectTrigger className="border-0 bg-transparent text-white hover:bg-transparent focus:outline-none focus:ring-0 focus:border-0 focus:ring-offset-0 p-0 h-auto shadow-none">
                          <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent className="mt-2 w-full bg-card/95 glass-dark border-border rounded-2xl">
                          <SelectItem value="all">All Locations</SelectItem>
                          <SelectItem value="dubai-marina">Dubai Marina</SelectItem>
                          <SelectItem value="palm-jumeirah">Palm Jumeirah</SelectItem>
                          <SelectItem value="downtown">Downtown Dubai</SelectItem>
                          <SelectItem value="business-bay">Business Bay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-4">
                      <Button
                        variant="luxury"
                        size="sm"
                        onClick={handleSearch}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-accent/30 transition-all duration-200"
                      >
                        {t('hero.search')}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <Link
                    href={`/${locale}/properties/off-plan`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-white/80 text-xs font-medium hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-200"
                  >
                    <span className="text-accent">✦</span>
                    {t('navigation.offPlan')}
                  </Link>
                  <Link
                    href={`/${locale}/properties`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-white/80 text-xs font-medium hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-200"
                  >
                    <span className="text-accent">✦</span>
                    {t('navigation.properties')}
                  </Link>
                  <Link
                    href={`/${locale}/properties?status=featured`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-white/80 text-xs font-medium hover:bg-white/10 hover:text-white hover:border-white/30 transition-all duration-200"
                  >
                    <span className="text-accent">✦</span>
                    Featured
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-4"
              >
                <Button variant="outline" size="lg" onClick={() => scrollToSection('properties')} className="rounded-2xl border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-200">
                  {t('hero.ctaPrimary')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="ghost" size="lg" onClick={() => scrollToSection('contact')} className="rounded-2xl text-white hover:bg-white/10 transition-all duration-200">
                  {t('hero.ctaSecondary')}
                </Button>
              </motion.div>
            </div>
          </motion.div>


        </section>
      </div>

      {/* Trust Bar - As Seen In */}
      <section className="relative py-16 bg-card border-y border-border overflow-hidden" id="trust">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
            <div className="text-center md:text-left">
              <h2 className="font-heading text-3xl font-bold gradient-gold">{t('hero.trustBadge')}</h2>
              <p className="text-muted-foreground mt-1">Trusted by leading media & developers</p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-heading text-3xl font-bold gradient-gold">29K+</div>
                <div className="text-muted-foreground text-xs mt-1">Clients</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="font-heading text-3xl font-bold gradient-gold">30K+</div>
                <div className="text-muted-foreground text-xs mt-1">Deals</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <div className="font-heading text-3xl font-bold gradient-gold">130+</div>
                <div className="text-muted-foreground text-xs mt-1">Partners</div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap gap-16">
              {[...trustPartners, ...trustPartners].map((partner, i) => (
                <motion.div
                  key={i}
                  className="flex-shrink-0 flex items-center gap-3 px-6 py-3"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-accent" />
                  </div>
                  <span className="font-heading text-lg font-semibold text-foreground/80 whitespace-nowrap">{partner}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 bg-background overflow-hidden" id="stats">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: '150+', label: t('about.stats.agents'), icon: '👥', delay: 0 },
              { value: '8500+', label: t('about.stats.properties'), icon: '🏠', delay: 0.1 },
              { value: '3700+', label: t('about.stats.sold'), icon: '✅', delay: 0.2 },
              { value: '20+', label: t('about.stats.weekly'), icon: '📅', delay: 0.3 },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: stat.delay, duration: 0.6 }}
                className="text-center p-8 rounded-3xl bg-card border border-border/50 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-500 group"
              >
                <motion.div
                  className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {stat.icon}
                </motion.div>
                <div className="font-heading text-4xl sm:text-5xl font-bold gradient-gold mb-3">{stat.value}</div>
                <div className="text-muted-foreground text-sm leading-relaxed">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
