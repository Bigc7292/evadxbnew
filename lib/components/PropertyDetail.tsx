'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, MapPin, Bed, Bath, Maximize, Heart, Share2, Calendar, Phone, Mail, ChevronLeft, ChevronRight, Download, Play, Map, Layers, MoreHorizontal, X, Star, Home, Building2 } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Badge } from '@/lib/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/components/ui/tabs';
import { Separator } from '@/lib/components/ui/separator';
import { ErrorBoundary, MapErrorFallback } from './ErrorBoundary';
import { StreetViewMap, BirdseyeMap } from './MapComponents';
import { cn, formatPrice } from '@/lib/utils';
import type { Property } from '@/lib/supabase/queries';

interface PropertyDetailProps {
  property: Property;
  locale: string;
}

export function PropertyDetail({ property, locale }: PropertyDetailProps) {
  const t = useTranslations('propertyDetail');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('navigation');
  const tCard = useTranslations('properties.card');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [mapView, setMapView] = useState<'street' | 'birdseye'>('street');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const allImages = [
    property.featured_image,
    ...property.gallery_images
  ].filter((url): url is string => {
    if (!url) return false;
    if (url.toLowerCase().endsWith('.svg')) return false;
    if (/logo/i.test(url) && !/layout/i.test(url)) return false;
    return true;
  });

  const displayPrice = useMemo(() => {
    const rawPrice = property.price;
    if (rawPrice == null || rawPrice < 10000) return null;
    return rawPrice;
  }, [property.price]);

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <nav className="bg-card/80 backdrop-blur-md border-b border-border px-4 sm:px-6 lg:px-8" aria-label="Breadcrumb">
        <ol className="max-w-7xl mx-auto flex items-center space-x-2 py-4 text-sm">
          <li><Link href={`/${locale}`} className="text-muted-foreground hover:text-primary transition-colors">{tCommon('home')}</Link></li>
          <li><span className="text-muted-foreground">/</span></li>
          <li><Link href={`/${locale}/properties`} className="text-muted-foreground hover:text-primary transition-colors">{tNav('properties')}</Link></li>
          <li><span className="text-muted-foreground">/</span></li>
          <li className="text-foreground truncate max-w-xs" aria-current="page">{property.title}</li>
        </ol>
      </nav>

      {/* Hero Gallery */}
      <section className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh] overflow-hidden bg-black">
        <motion.div className="relative w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          <img src={allImages[activeImageIndex] || '/placeholder-property.svg'} alt={`${property.title} - Image ${activeImageIndex + 1}`} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
        </motion.div>

        {allImages.length > 1 && (
          <>
            <motion.button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10 border border-white/10" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Previous image">
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10 border border-white/10" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Next image">
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </>
        )}

        {allImages.length > 1 && (
          <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            {allImages.map((img, index) => (
              <motion.button key={img} onClick={() => setActiveImageIndex(index)} className={cn('relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200', index === activeImageIndex ? 'border-accent scale-105 shadow-lg shadow-accent/20' : 'border-white/20 hover:border-white/40')} whileTap={{ scale: 0.95 }}>
                <img src={img} alt={`Thumbnail ${index + 1}`} className="absolute inset-0 h-full w-full object-cover" />
              </motion.button>
            ))}
          </motion.div>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <Badge variant={property.status === 'ready' ? 'success' : property.status === 'off_plan' ? 'luxury' : 'default'} className="shadow-lg">
            {property.status === 'ready' ? tCard('available') : property.status.replace('_', ' ')}
          </Badge>
          {property.is_featured && <Badge variant="luxury" className="shadow-lg shadow-accent/20">✨ {tCard('featured')}</Badge>}
          {property.is_promoted && <Badge variant="warning" className="shadow-lg shadow-yellow-500/20">🔥 {tCard('hot')}</Badge>}
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <motion.button onClick={() => setIsWishlisted(!isWishlisted)} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
            <Heart className={cn('w-6 h-6', isWishlisted ? 'fill-accent text-accent stroke-0' : 'text-white stroke-2')} />
          </motion.button>
          <motion.button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors border border-white/10" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Share">
            <Share2 className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </section>

      {/* Property Info */}
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>{[property.location, property.area].filter(Boolean).join(', ')}</span>
                </div>
                <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-5 tracking-tight">{property.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-sm text-foreground/70">
                  {property.bedrooms != null && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/10 text-accent border border-accent/15">
                      <Bed className="w-5 h-5" />
                      <span className="font-medium">{property.bedrooms} {tCommon('bedrooms')}</span>
                    </span>
                  )}
                  {property.bathrooms != null && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/10 text-accent border border-accent/15">
                      <Bath className="w-5 h-5" />
                      <span className="font-medium">{property.bathrooms} {tCommon('bathrooms')}</span>
                    </span>
                  )}
                  {property.area_sqft != null && (
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/10 text-accent border border-accent/15">
                      <Maximize className="w-5 h-5" />
                      <span className="font-medium">{property.area_sqft.toLocaleString()} {tCommon('sqft')}</span>
                    </span>
                  )}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-8 bg-card border border-border rounded-3xl luxury-shadow">
                <div>
                  <span className="text-sm text-muted-foreground tracking-wide uppercase">{tCommon('startingFrom')}</span>
                  <div className="font-heading text-4xl sm:text-5xl font-bold gradient-gold mt-1">{displayPrice ? formatPrice(displayPrice, property.currency) : tCommon('priceOnRequest')}</div>
                  {property.payment_plan && (
                    <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                      <span>{tCommon('downPayment')}: {property.payment_plan.down_payment}%</span>
                      <span>{tCommon('duringConstruction')}: {property.payment_plan.during_construction}%</span>
                      <span>{tCommon('onHandover')}: {property.payment_plan.on_handover}%</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                  <Button variant="luxury" size="lg" className="flex-1 sm:flex-none rounded-2xl shadow-lg">{t('scheduleViewing')}<ArrowRight className="w-5 h-5 ml-2" /></Button>
                  <Button variant="outline" size="lg" className="flex-1 sm:flex-none rounded-2xl border-border/70">{t('requestCallback')}</Button>
                  <Button variant="ghost" size="lg" className="flex-1 sm:flex-none rounded-2xl"><Download className="w-5 h-5 mr-2" />{t('downloadBrochure')}</Button>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-muted rounded-2xl p-1.5">
                    <TabsTrigger value="overview" className="rounded-xl">{t('propertyDetail.overview')}</TabsTrigger>
                    <TabsTrigger value="features" className="rounded-xl">{t('propertyDetail.features')}</TabsTrigger>
                    <TabsTrigger value="amenities" className="rounded-xl">{t('propertyDetail.amenities')}</TabsTrigger>
                    <TabsTrigger value="gallery" className="rounded-xl">{t('propertyDetail.gallery')}</TabsTrigger>
                    <TabsTrigger value="floorPlans" className="rounded-xl">{t('propertyDetail.floorPlans')}</TabsTrigger>
                    <TabsTrigger value="location" className="rounded-xl">{t('propertyDetail.location')}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="prose max-w-none">
                      <h3 className="font-heading text-2xl font-semibold mb-4">{t('propertyDetail.description')}</h3>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{property.description || property.short_description || tCommon('noDescriptionAvailable')}</p>
                    </div>
                    {property.features.length > 0 && (
                      <div>
                        <h3 className="font-heading text-xl font-semibold mb-4">{t('propertyDetail.features')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {property.features.map((feature, i) => (
                            <Badge key={i} variant="outline" className="w-full justify-start gap-2 py-2 px-3 rounded-xl border-border/70">
                              <Star className="w-4 h-4 text-accent" />
                              <span>{feature}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="features" className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: t('featuresList.bedrooms'), value: property.bedrooms, icon: Bed },
                        { label: t('featuresList.bathrooms'), value: property.bathrooms, icon: Bath },
                        { label: t('featuresList.area'), value: property.area_sqft ? `${property.area_sqft.toLocaleString()} ${tCommon('sqft')}` : null, icon: Maximize },
                        { label: t('propertyDetail.propertyType'), value: property.property_type.replace('_', ' '), icon: Home },
                        { label: t('propertyDetail.listingType'), value: property.price_type, icon: Building2 },
                        { label: t('propertyDetail.developer'), value: property.developer, icon: Building2 },
                        { label: t('propertyDetail.completion'), value: property.completion_date ? `${property.completion_date}` : null, icon: Calendar },
                        { label: t('propertyDetail.status'), value: property.status, icon: Star },
                      ].map((item, i) => item.value && (
                        <Card key={i} className="p-5 rounded-2xl border-border/70 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all">
                          <div className="flex items-center gap-3 mb-2">
                            <item.icon className="w-5 h-5 text-accent" />
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                          </div>
                          <p className="font-semibold text-lg">{item.value}</p>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="amenities" className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.amenities.map((amenity, i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer group">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <Star className="w-5 h-5 text-accent" />
                          </div>
                          <span className="font-medium">{amenity}</span>
                        </motion.div>
                      ))}
                    </div>
                    {property.nearby_places.length > 0 && (
                      <div>
                        <h3 className="font-heading text-xl font-semibold mb-4">{t('propertyDetail.nearbyPlaces')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {property.nearby_places.map((place, i) => (
                            <Badge key={i} variant="outline" className="w-full justify-start gap-2 py-2 px-3 rounded-xl border-border/70">
                              <MapPin className="w-4 h-4 text-accent" />
                              <span>{place}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="gallery" className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {allImages.map((img, i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className="aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group relative border border-border/70" onClick={() => setActiveImageIndex(i)}>
                          <img src={img} alt={`${property.title} ${i + 1}`} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          {i === 0 && (
                            <div className="absolute top-2 left-2">
                              <Badge variant="luxury" className="shadow-lg shadow-accent/20">🏠 {tCommon('mainImage')}</Badge>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="floorPlans" className="space-y-6">
                    {property.floor_plans?.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {property.floor_plans.map((img, i) => {
                          const sizes = '(max-width: 768px) 100vw, 50vw';
                          return (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted border border-border/70">
                          <img src={img} alt={`Floor plan ${i + 1}`} className="absolute inset-0 h-full w-full object-contain p-4" />
                        </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <Maximize className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-heading text-xl font-semibold mb-2">{tCommon('noFloorPlans')}</h3>
                        <p className="text-muted-foreground">{tCommon('floorPlansComingSoon')}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="location" className="space-y-6">
                    <ErrorBoundary fallback={<MapErrorFallback message={t('propertyDetail.mapLoadFailed')} latitude={property.latitude ?? undefined} longitude={property.longitude ?? undefined} />}>
                      <div className="grid lg:grid-cols-2 gap-6">
                        <div className="lg:col-span-2">
                          <div className="bg-card border border-border rounded-3xl overflow-hidden luxury-shadow">
                            <div className="flex items-center justify-between p-5 border-b border-border">
                              <h3 className="font-heading text-lg font-semibold">{t('propertyDetail.streetView')}</h3>
                              <div className="flex gap-2">
                                <Button variant={mapView === 'street' ? 'luxury' : 'outline'} size="sm" onClick={() => setMapView('street')} className="rounded-xl"><Map className="w-4 h-4 mr-2" />{t('propertyDetail.streetView')}</Button>
                                <Button variant={mapView === 'birdseye' ? 'luxury' : 'outline'} size="sm" onClick={() => setMapView('birdseye')} className="rounded-xl"><Layers className="w-4 h-4 mr-2" />{t('propertyDetail.birdEyeView')}</Button>
                              </div>
                            </div>
                            <div className="aspect-video relative">
                              {mapView === 'street' ? (
                                <StreetViewMap latitude={property.latitude ?? 0} longitude={property.longitude ?? 0} title={property.title} />
                              ) : (
                                <BirdseyeMap latitude={property.latitude ?? 0} longitude={property.longitude ?? 0} title={property.title} />
                              )}
                              {property.google_maps_embed && (
                                <a href={property.google_maps_embed} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 z-10">
                                  <Button variant="outline" size="sm" className="gap-2 rounded-xl border-white/30 bg-black/40 text-white hover:bg-black/60"><Map className="w-4 h-4" />{tCommon('openInGoogleMaps')}</Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </ErrorBoundary>
                    {(!property.latitude || !property.longitude) && property.google_maps_embed && (
                      <ErrorBoundary fallback={<MapErrorFallback message={t('propertyDetail.mapLoadFailed')} />}>
                        <div className="bg-card border border-border rounded-3xl overflow-hidden">
                          <div className="aspect-video">
                            <iframe src={property.google_maps_embed} className="w-full h-full" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                          </div>
                        </div>
                      </ErrorBoundary>
                    )}
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="sticky top-24 space-y-6">
                <Card className="bg-gradient-luxury text-primary-foreground border-none shadow-2xl rounded-3xl overflow-hidden">
                  <CardContent className="p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                    <div className="relative">
                      <span className="text-sm opacity-90 tracking-wide uppercase">{tCommon('startingFrom')}</span>
                      <div className="font-heading text-4xl sm:text-5xl font-bold mt-2 mb-5">{displayPrice ? formatPrice(displayPrice, property.currency) : tCommon('priceOnRequest')}</div>
                      {property.payment_plan && (
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div className="p-4 bg-white/15 rounded-2xl border border-white/10">
                            <div className="text-2xl font-bold">{property.payment_plan.down_payment}%</div>
                            <div className="text-xs opacity-80">{tCommon('downPayment')}</div>
                          </div>
                          <div className="p-4 bg-white/15 rounded-2xl border border-white/10">
                            <div className="text-2xl font-bold">{property.payment_plan.during_construction}%</div>
                            <div className="text-xs opacity-80">{tCommon('duringConstruction')}</div>
                          </div>
                          <div className="p-4 bg-white/15 rounded-2xl border border-white/10">
                            <div className="text-2xl font-bold">{property.payment_plan.on_handover}%</div>
                            <div className="text-xs opacity-80">{tCommon('onHandover')}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/70 shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-heading text-xl">{t('requestCallback')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder={tCommon('firstName')} required className="rounded-xl border-border/70" />
                        <Input placeholder={tCommon('lastName')} required className="rounded-xl border-border/70" />
                      </div>
                      <Input type="tel" placeholder={tCommon('phone')} required className="rounded-xl border-border/70" />
                      <Input type="email" placeholder={tCommon('email')} required className="rounded-xl border-border/70" />
                      <Input placeholder={tCommon('message')} className="min-h-[100px] rounded-xl border-border/70" />
                      <Button variant="luxury" className="w-full rounded-xl shadow-lg" type="submit">
                        {tCommon('submit')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/70 shadow-sm">
                  <CardContent className="pt-7">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-border/70">
                        <img src="/eva-logo.jpg" alt="EVA Real Estate" className="object-cover w-full h-full" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">EVA Real Estate</h4>
                        <p className="text-sm text-muted-foreground">Your trusted property partner</p>
                      </div>
                    </div>
                    <Separator className="my-5" />
                    <div className="space-y-3">
                      <a href="tel:+971581025758" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group">
                        <span className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent/15 transition-colors"><Phone className="w-4 h-4" /></span>
                        <span>+971 58 102 5758</span>
                      </a>
                      <a href="mailto:info@evadxb.com" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group">
                        <span className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent/15 transition-colors"><Mail className="w-4 h-4" /></span>
                        <span>info@evadxb.com</span>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Properties */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 bg-card/80 backdrop-blur-md border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-heading text-3xl font-bold gradient-gold">{t('propertyDetail.similarProperties')}</h2>
            <Link href={`/${locale}/properties`} className="text-primary hover:text-primary/80 font-medium flex items-center gap-2">
              {tCommon('viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden hover:shadow-2xl hover:shadow-accent/10 transition-all cursor-pointer rounded-3xl border-border/70">
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-4 left-4"><Badge variant="luxury" className="shadow-lg shadow-accent/20">{tCommon('similar')}</Badge></div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-heading text-xl font-semibold mb-2">Similar Property {i}</h3>
                  <p className="text-muted-foreground text-sm mb-4">Dubai Marina, Dubai</p>
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-2xl font-bold gradient-gold">AED 2.5M</span>
                    <Button variant="ghost" size="sm" className="rounded-xl">{tCard('viewDetails')}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
