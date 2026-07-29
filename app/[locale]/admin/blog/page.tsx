'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, MapPin, Star, Trash2, Edit, Eye, UserPlus, UserCheck, UserX, Mail as MailIcon, Phone as PhoneIcon, MapPin as MapPinIcon, Star as StarIcon, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { Badge } from '@/lib/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/lib/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/lib/components/ui/avatar';
import { cn, formatPrice } from '@/lib/utils';
import { useState } from 'react';

const mockPosts = [
  {
    id: '1',
    slug: 'abu-dhabi-attractive-real-estate-for-investment',
    title: 'Abu Dhabi: Attractive Real Estate for Investment',
    excerpt: 'Stable Economy and Growth: Abu Dhabi is renowned for its diverse and dynamically evolving economic sectors...',
    category: 'Market Insights',
    author: 'Elvira Sharshenalieva',
    tags: ['Abu Dhabi', 'Investment', 'Market Analysis'],
    is_published: true,
    is_featured: true,
    published_at: '2023-09-01T00:00:00Z',
    featured_image: '/abu-dhabi-city-guide-feature.jpg',
  },
  {
    id: '2',
    slug: 'why-investors-choose-dubai-attractiveness-and-advantages',
    title: 'Why Investors Choose Dubai: Attractiveness and Advantages',
    excerpt: 'One such attractive hub of global investments is Dubai, a metropolis that has transformed into a true haven for business and investment over the past decades.',
    category: 'Market Insights',
    author: 'EVA Research Team',
    tags: ['Dubai', 'Investment', 'Advantages'],
    is_published: true,
    is_featured: false,
    published_at: '2023-08-30T00:00:00Z',
    featured_image: '/shutterstock_355722602.jpg',
  },
  {
    id: '3',
    slug: 'sobha-hartland-ii-a-new-neighborhood-by-sobha-realty-in-dubai',
    title: 'Sobha Hartland II – a new neighborhood by Sobha Realty in Dubai',
    excerpt: 'Among the many emerging neighborhoods, one of the most attractive is Sobha Hartland II – a new residential complex created by the magnificent developer, Sobha Realty.',
    category: 'New Projects',
    author: 'Maria Cristina Campagna',
    tags: ['Sobha', 'New Projects', 'Dubai'],
    is_published: true,
    is_featured: false,
    published_at: '2023-07-31T00:00:00Z',
    featured_image: '/320-riverside-crescente-opp-doc.jpg',
  },
];

export default function AdminBlogPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const statusOptions = [
    { value: 'all', label: t('admin.allStatus') },
    { value: 'published', label: t('admin.published') },
    { value: 'draft', label: t('admin.draft') },
  ];

  const categoryOptions = [
    { value: 'all', label: t('admin.allCategories') },
    { value: 'Market Insights', label: 'Market Insights' },
    { value: 'New Projects', label: 'New Projects' },
    { value: 'Investment Guide', label: 'Investment Guide' },
    { value: 'Legal & Finance', label: 'Legal & Finance' },
    { value: 'Lifestyle', label: 'Lifestyle' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-3xl font-bold gradient-gold">{t('admin.blogPosts')}</h1>
          <p className="text-muted-foreground mt-1">{t('admin.blogPostsDesc')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            {t('admin.filters')}
          </Button>
          <Button variant="luxury" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.addPost')}
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
                  <SelectValue placeholder={t('admin.status')} />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.category')} />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); }}>
                <X className="w-4 h-4 mr-2" />
                {t('admin.clearFilters')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="w-20 text-center">Image</TableHead>
                <TableHead>{t('admin.post')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('admin.category')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('admin.author')}</TableHead>
                <TableHead className="hidden xl:table-cell">{t('admin.published')}</TableHead>
                <TableHead className="w-32 text-center">{t('admin.status')}</TableHead>
                <TableHead className="w-48 text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPosts.map((post, index) => (
                <motion.tr
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-muted/50 transition-colors border-b border-border/50"
                >
                  <TableCell className="w-20 text-center">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted mx-auto">
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium max-w-xs truncate">{post.title}</p>
                      <p className="text-sm text-muted-foreground max-w-xs truncate">{post.excerpt}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                        ))}
                        {post.is_featured && <Badge variant="luxury" className="text-xs ml-2">✨ Featured</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="text-xs">{post.category}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">{post.author}</span>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </TableCell>
                  <TableCell className="w-32 text-center">
                    <Badge variant={post.is_published ? 'success' : 'outline'}>
                      {post.is_published ? t('admin.published') : t('admin.draft')}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-48 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          {t('admin.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          {t('admin.view')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          {t('admin.viewOnSite')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('admin.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
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
          Showing 1 to 3 of 23 results
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">1</Button>
          <Button variant="luxury" size="sm">2</Button>
          <Button variant="outline" size="sm">3</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </motion.div>
    </div>
  );
}