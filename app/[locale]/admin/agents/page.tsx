'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Star,
  Trash2,
  Edit,
  Eye,
  UserPlus,
  UserCheck,
  UserX,
  X,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Star as StarIcon,
} from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { Badge } from '@/lib/components/ui/badge';
import { Card, CardContent } from '@/lib/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/lib/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/lib/components/ui/avatar';
import { cn, formatPrice } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { getAgents, type Agent } from '@/lib/supabase/queries';

export default function AdminAgentsPage() {
  const t = useTranslations();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const data = await getAgents({ limit: 200 });
        setAgents(data);
      } catch (error) {
        console.error('Failed to load agents:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAgents();
  }, []);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = !searchQuery ||
      `${agent.first_name} ${agent.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.email ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? agent.is_active : !agent.is_active);
    const matchesRole = roleFilter === 'all' || (roleFilter === 'leader' ? agent.is_leader : !agent.is_leader);
    return matchesSearch && matchesStatus && matchesRole;
  });

  const statusOptions = [
    { value: 'all', label: t('admin.allStatus') },
    { value: 'active', label: t('admin.active') },
    { value: 'inactive', label: t('admin.inactive') },
  ];

  const roleOptions = [
    { value: 'all', label: t('admin.allRoles') },
    { value: 'leader', label: t('admin.teamLeader') },
    { value: 'advisor', label: t('admin.advisor') },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-3xl font-bold gradient-gold">{t('admin.agents')}</h1>
          <p className="text-muted-foreground mt-1">{t('admin.agentsDesc')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            {t('admin.filters')}
          </Button>
          <Button variant="luxury" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            {t('admin.addAgent')}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { name: 'Total Agents', value: String(agents.length), icon: '👥', color: 'text-primary' },
          { name: 'Team Leaders', value: String(agents.filter(a => a.is_leader).length), icon: '⭐', color: 'text-accent' },
          { name: 'Active This Month', value: String(agents.filter(a => a.is_active).length), icon: '✅', color: 'text-green-500' },
          {
            name: 'Avg. Experience',
            value: agents.length ? `${(agents.reduce((sum, a) => sum + (a.years_experience || 0), 0) / agents.length).toFixed(1)} yrs` : '0 yrs',
            icon: '📅',
            color: 'text-blue-500',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="group"
          >
            <Card className="hover:border-accent/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{stat.name}</p>
                    <p className="font-heading text-3xl font-bold gradient-gold">{stat.value}</p>
                  </div>
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center bg-muted', stat.color)}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

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
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.role')} />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); setRoleFilter('all'); }}>
                <X className="w-4 h-4 mr-2" />
                {t('admin.clearFilters')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                <TableHead className="w-16">Avatar</TableHead>
                <TableHead>{t('admin.agentLabel')}</TableHead>
                <TableHead className="hidden md:table-cell">{t('admin.position')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('admin.contact')}</TableHead>
                <TableHead className="hidden lg:table-cell">{t('admin.languages')}</TableHead>
                <TableHead className="hidden xl:table-cell">{t('admin.experience')}</TableHead>
                <TableHead className="hidden xl:table-cell">{t('admin.salesVolume')}</TableHead>
                <TableHead className="hidden xl:table-cell">{t('admin.propertiesSold')}</TableHead>
                <TableHead className="w-32 text-center">{t('admin.status')}</TableHead>
                <TableHead className="w-48 text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    {t('admin.loading')}
                  </TableCell>
                </TableRow>
              ) : filteredAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                    {t('admin.noData')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgents.map((agent, index) => (
                  <motion.tr
                    key={agent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="w-16">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={agent.profile_image_url ?? ''} alt={`${agent.first_name} ${agent.last_name}`} />
                        <AvatarFallback className="bg-gradient-luxury text-primary-foreground text-xs">
                          {agent.first_name[0]}
                          {agent.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {agent.first_name} {agent.last_name}
                        </p>
                         {agent.is_leader && (
                          <Badge variant="luxury" className="mt-1 text-xs">
                            {t('admin.teamLeader')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{agent.position}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col gap-1 text-sm">
                        <a href={`mailto:${agent.email}`} className="text-muted-foreground hover:text-primary flex items-center gap-1">
                          <MailIcon className="w-3 h-3" />
                          {agent.email}
                        </a>
                        <a href={`tel:${agent.phone}`} className="text-muted-foreground hover:text-primary flex items-center gap-1">
                          <PhoneIcon className="w-3 h-3" />
                          {agent.phone}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {agent.languages.map((lang, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-sm">{agent.years_experience} yrs</span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-sm font-medium gradient-gold">
                        {agent.total_sales_volume ? `${formatPrice(agent.total_sales_volume / 1000000, 'AED')}M` : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-sm">{agent.properties_sold}</span>
                    </TableCell>
                    <TableCell className="w-32 text-center">
                      <Badge variant={agent.is_active ? 'success' : 'destructive'}>
                        {agent.is_active ? t('admin.active') : t('admin.inactive')}
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
                            <Eye className="w-4 h-4 mr-2" />
                            {t('admin.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            {t('admin.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <UserCheck className="w-4 h-4 mr-2" />
                            {t('admin.makeLeader')}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <UserX className="w-4 h-4 mr-2" />
                            {t('admin.deactivate')}
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

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between"
      >
        <p className="text-sm text-muted-foreground">
          {loading ? '...' : `Showing 1 to ${filteredAgents.length} of ${filteredAgents.length} results`}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="luxury" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
