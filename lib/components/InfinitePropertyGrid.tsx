'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PropertyCard } from '@/lib/components/PropertyCard';
import type { Property } from '@/lib/supabase/queries';
import { Search } from 'lucide-react';

const PAGE_SIZE = 24;

interface InfinitePropertyGridProps {
  initialProperties: Property[];
  locale: string;
  totalCount: number;
  filters?: Record<string, string | undefined>;
}

export function InfinitePropertyGrid({ initialProperties, locale, totalCount, filters }: InfinitePropertyGridProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialProperties.length >= PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('status', 'off_plan');
      params.set('limit', String(PAGE_SIZE));
      params.set('offset', String(page * PAGE_SIZE));
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });
      }

      const response = await fetch(`/api/properties/off-plan?${params.toString()}`);
      const data = await response.json();
      if (data.properties.length === 0) {
        setHasMore(false);
      } else {
        setProperties((prev) => [...prev, ...data.properties]);
        setPage((p) => p + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, hasMore, loading, page]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="space-y-10">
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {properties.map((property, index) => (
          <PropertyCard key={property.id} property={property} locale={locale} index={index} />
        ))}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}

        {properties.length === 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="col-span-full text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-heading text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters to find more properties.</p>
          </motion.div>
        )}
      </motion.div>

      <div ref={sentinelRef} className="h-2" />

      {!hasMore && properties.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Showing all {properties.length} properties
        </p>
      )}
    </div>
  );
}
