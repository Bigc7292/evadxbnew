'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Card, CardContent } from '@/lib/components/ui/card';
import { ErrorBoundary, MapErrorFallback as ErrorBoundaryMapErrorFallback } from './ErrorBoundary';
import { cn } from '@/lib/utils';

interface MapBaseProps {
  latitude: number;
  longitude: number;
  title: string;
}

interface MapErrorFallbackProps {
  message?: string;
  onRetry?: () => void;
  latitude?: number;
  longitude?: number;
}

const DUBAI_CENTER = { lat: 25.2048, lng: 55.2708 };

function loadMaplibreCSS() {
  if (!document.querySelector('link[href*="maplibre-gl"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
    document.head.appendChild(link);
  }
}

export function MapErrorFallback({ message = 'Map could not be loaded', onRetry, latitude, longitude }: MapErrorFallbackProps) {
  return (
    <Card className="w-full h-[500px] flex flex-col items-center justify-center bg-muted/30 border-border/50">
      <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="font-heading text-lg font-semibold mb-2">Map Unavailable</h3>
        <p className="text-muted-foreground mb-4 max-w-sm">{message}</p>
        <div className="flex gap-3">
          {onRetry && (
            <Button variant="luxury" size="sm" onClick={onRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank')}>
            <MapPin className="w-4 h-4 mr-2" />
            Open in Google Maps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// MapLibre-based map component
function MapLibreInner({ latitude, longitude, title, mapType = 'satellite' }: MapBaseProps & { mapType?: 'street' | 'satellite' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lib, setLib] = useState<any>(null);

  useEffect(() => {
    loadMaplibreCSS();
    import('maplibre-gl').then((m) => setLib(m.default || m)).catch((e) => setError('Failed to load MapLibre GL'));
  }, []);

  const initMap = useCallback(() => {
    if (!lib || !containerRef.current || mapRef.current) return;

    try {
      const map = new lib.Map({
        container: containerRef.current,
        style: mapType === 'satellite'
          ? `https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_key`
          : `https://api.maptiler.com/maps/streets-v2/style.json?key=get_your_own_key`,
        center: [longitude, latitude],
        zoom: mapType === 'satellite' ? 16 : 14,
        pitch: mapType === 'satellite' ? 45 : 0,
        bearing: 0,
        antialias: true,
        attributionControl: true,
      });

      map.on('load', () => {
        if (mapType === 'satellite') {
          try {
            map.addSource('mapbox-dem', {
              type: 'raster-dem',
              url: 'https://api.maptiler.com/tiles/v3/tiles.json?key=get_your_own_key',
              tileSize: 512,
              maxzoom: 14,
            });
            map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
          } catch (e) {
            // terrain may fail, map still works
          }
        }

        new lib.Marker({ color: '#C5A059' })
          .setLngLat([longitude, latitude])
          .setPopup(new lib.Popup().setHTML(`<strong>${title}</strong>`))
          .addTo(map);

        setIsLoaded(true);
      });

      map.on('error', (e: any) => {
        if (e?.error?.status === 401) {
          // API key missing, fallback to OpenFreeMap
          map.setStyle('https://tiles.openfreemap.org/styles/liberty');
        }
      });

      mapRef.current = map;
    } catch (err) {
      setError('Failed to initialize map');
    }
  }, [lib, latitude, longitude, title, mapType]);

  useEffect(() => {
    if (lib && !mapRef.current) {
      initMap();
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lib, initMap]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/30 rounded-xl">
        <MapErrorFallback message={error} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full rounded-xl relative">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 rounded-xl z-10">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Fallback map centered on Dubai when coordinates are missing
function DubaiCenteredMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lib, setLib] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMaplibreCSS();
    import('maplibre-gl').then((m) => setLib(m.default || m)).catch((e) => setError('Failed to load MapLibre GL'));
  }, []);

  useEffect(() => {
    if (!lib || !containerRef.current || mapRef.current) return;

    try {
      const map = new lib.Map({
        container: containerRef.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [DUBAI_CENTER.lng, DUBAI_CENTER.lat],
        zoom: 10,
        attributionControl: true,
      });

      map.on('load', () => {
        new lib.Marker({ color: '#C5A059' })
          .setLngLat([DUBAI_CENTER.lng, DUBAI_CENTER.lat])
          .setPopup(new lib.Popup().setHTML('<strong>Dubai, UAE</strong>'))
          .addTo(map);
        setIsLoaded(true);
      });

      mapRef.current = map;
    } catch (err) {
      setError('Failed to initialize map');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lib]);

  if (error) {
    return <MapErrorFallback message={error} />;
  }

  return (
    <div ref={containerRef} className="w-full h-[500px] rounded-xl relative">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 rounded-xl z-10">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Main exported components
export function StreetViewMap({ latitude, longitude, title }: MapBaseProps) {
  const hasCoords = latitude && longitude;

  if (!hasCoords) {
    return <MapErrorFallback message="Coordinates not available. Showing Dubai overview." latitude={DUBAI_CENTER.lat} longitude={DUBAI_CENTER.lng} />;
  }

  return (
    <ErrorBoundary fallback={<DubaiCenteredMap />}>
      <MapLibreInner latitude={latitude} longitude={longitude} title={title} mapType="street" />
    </ErrorBoundary>
  );
}

export function BirdseyeMap({ latitude, longitude, title }: MapBaseProps) {
  const hasCoords = latitude && longitude;

  if (!hasCoords) {
    return <MapErrorFallback message="Coordinates not available. Showing Dubai overview." latitude={DUBAI_CENTER.lat} longitude={DUBAI_CENTER.lng} />;
  }

  return (
    <ErrorBoundary fallback={<DubaiCenteredMap />}>
      <MapLibreInner latitude={latitude} longitude={longitude} title={title} mapType="satellite" />
    </ErrorBoundary>
  );
}
