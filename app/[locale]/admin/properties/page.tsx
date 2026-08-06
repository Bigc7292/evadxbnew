'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Plus, Search, Filter, MoreHorizontal, Building2, Edit, Trash2, Eye, ExternalLink, Star, MapPin, Bed, Bath, Maximize, DollarSign, Tag, X } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { Badge } from '@/lib/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/lib/components/ui/dropdown-menu';
import { cn, formatPrice } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface Property {
  id: string;
  slug: string;
  title: string;
  property_type: string;
  price_min: number | null;
  price_max: number | null;
  price_currency: string;
  area_name: string | null;
  developer: string;
  status: string;
  is_featured: boolean;
  is_promoted: boolean;
  created_at: string;
}

export default function AdminPropertiesPage() {
  const t = useTranslations();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);

  const statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'off_plan', label: 'Off-Plan' },
    { value: 'ready', label: 'Secondary / Ready' },
  ];

  const typeOptions = [
    { value: 'all', label: t('properties.filters.allTypes') },
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'penthouse', label: 'Penthouse' },
    { value: 'studio', label: 'Studio' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'land', label: 'Land' },
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('limit', '50');
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (typeFilter !== 'all') params.set('property_type', typeFilter);
        if (searchQuery) params.set('search', searchQuery);

        const res = await fetch(`/api/admin/properties?${params.toString()}`);
        const json = await res.json();
        if (json.data) {
          setProperties(json.data);
          setTotal(json.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Failed to load properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [statusFilter, typeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-3xl font-bold gradient-gold">{t('admin.properties')}</h1>
          <p className="text-muted-foreground mt-1">{t('admin.propertiesDesc')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            {t('admin.filters')}
          </Button>
          <Button variant="luxury" size="sm" onClick={() => window.location.href = '/admin/properties/new'}>
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.addProperty')}
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: showFilters ? 1 : 0, height: showFilters ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('properties.filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('properties.filters.propertyType')} />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); setTypeFilter('all'); }}>
                <X className="w-4 h-4 mr-2" />
                {t('admin.clearFilters')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Properties Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="w-12 text-center">Image</TableHead>
                <TableHead>{t('admin.propertyLabel')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('common.location')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('common.developer')}</TableHead>
                <TableHead className="text-right">{t('common.price')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('common.type')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('common.status')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('common.featured')}</TableHead>
                <TableHead className="w-48 text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    {t('admin.loading')}
                  </TableCell>
                </TableRow>
              ) : properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    {t('admin.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((property, index) => (
                  <motion.tr
                    key={property.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="w-12 text-center">
                      <div className="w-14 h-10 rounded-lg bg-muted relative overflow-hidden flex mx-auto">
                        <span className="text-xs font-medium gradient-gold">??</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium truncate max-w-[300px]">{property.title}</p>
                          <p className="text-sm text-muted-foreground">{property.price_min ? `${formatPrice(property.price_min, property.price_currency)}` : 'Price on request'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{property.area_name || '-'}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{property.developer || '-'}</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold gradient-gold">
                      {formatPrice(property.price_min || 0, property.price_currency)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {property.property_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={property.status === 'ready' ? 'success' : property.status === 'off_plan' ? 'warning' : 'destructive'}>
                        {property.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-center">
                      <div className="flex items-center justify-center gap-1">
                        {property.is_featured && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                        {property.is_promoted && <Tag className="w-4 h-4 text-red-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="w-48 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => window.location.href = `/admin/properties/${property.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            {t('admin.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.location.href = `/admin/properties/${property.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('admin.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => window.open(`/properties/${property.slug}`, '_blank')}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t('admin.viewOnSite')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => { if(confirm('Delete this property?')) { /* delete logic */ } }}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('admin.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-muted-foreground">
          {loading ? '...' : `Showing 1 to ${properties.length} of ${total} results`}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="luxury" size="sm">1</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </motion.div>
    </div>
  );
}
