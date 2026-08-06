'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, MapPin, Star, Trash2, Edit, Eye, UserPlus, UserCheck, UserX, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { Badge } from '@/lib/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/lib/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/lib/components/ui/avatar';
import { cn, formatPrice } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author_name: string | null;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
}

export default function AdminBlogPage() {
  const t = useTranslations();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);

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

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', '1');
        params.set('limit', '50');
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (categoryFilter !== 'all') params.set('category', categoryFilter);
        if (searchQuery) params.set('search', searchQuery);

        const res = await fetch(`/api/admin/blog?${params.toString()}`);
        const json = await res.json();
        if (json.data) {
          setPosts(json.data);
          setTotal(json.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Failed to load blog posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [statusFilter, categoryFilter, searchQuery]);

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    {t('admin.loading')}
                  </TableCell>
                </TableRow>
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    {t('admin.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post, index) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/50 transition-colors border-b border-border/50"
                  >
                    <TableCell className="w-20 text-center">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted mx-auto">
                        <span className="text-xs font-medium gradient-gold">??</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium max-w-xs truncate">{post.title}</p>
                        <p className="text-sm text-muted-foreground max-w-xs truncate">{post.excerpt}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.is_featured && <Badge variant="luxury" className="text-xs ml-2">? Featured</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">{post.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">{post.author_name || '-'}</span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
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
          {loading ? '...' : `Showing 1 to ${posts.length} of ${total} results`}
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
