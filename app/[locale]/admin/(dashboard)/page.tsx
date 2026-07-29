'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { TrendingUp, Users, Building2, Mail, FileText, DollarSign, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import { Badge } from '@/lib/components/ui/badge';
import { cn, formatPrice } from '@/lib/utils';

const stats = [
  { name: 'Total Properties', value: '247', change: '+12%', trend: 'up', icon: Building2, color: 'text-primary' },
  { name: 'Active Agents', value: '156', change: '+8%', trend: 'up', icon: Users, color: 'text-accent' },
  { name: 'New Leads', value: '89', change: '+23%', trend: 'up', icon: Mail, color: 'text-green-500' },
  { name: 'Revenue (AED)', value: '2.4M', change: '+5.2%', trend: 'up', icon: DollarSign, color: 'text-yellow-500' },
];

const recentActivity = [
  { type: 'property', action: 'created', title: 'Riverside Views by DAMAC', time: '2 min ago', status: 'pending' },
  { type: 'lead', action: 'new', title: 'Ahmed Al Mansouri - Villa Inquiry', time: '15 min ago', status: 'new' },
  { type: 'agent', action: 'updated', title: 'Sarah Johnson profile updated', time: '1 hour ago', status: 'completed' },
  { type: 'blog', action: 'published', title: 'Dubai Market Report Q1 2025', time: '3 hours ago', status: 'published' },
  { type: 'property', action: 'sold', title: 'Palm Jebel Ali Villa - Unit 45', time: '5 hours ago', status: 'sold' },
];

const quickActions = [
  { name: 'Add Property', href: '/admin/properties/new', icon: Building2, color: 'bg-primary' },
  { name: 'Add Agent', href: '/admin/agents/new', icon: Users, color: 'bg-accent' },
  { name: 'Write Blog Post', href: '/admin/blog/new', icon: FileText, color: 'bg-green-500' },
  { name: 'View Leads', href: '/admin/leads', icon: Mail, color: 'bg-blue-500' },
];

export default function AdminDashboard() {
  const t = useTranslations();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="font-heading text-3xl font-bold gradient-gold">{t('admin.dashboard')}</h1>
          <p className="text-muted-foreground mt-1">{t('admin.dashboardDesc')}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <span className="mr-2">📊</span>
            Export Report
          </Button>
          <Button variant="luxury" size="sm">
            <span className="mr-2">➕</span>
            {t('admin.quickActions')}
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
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
                    <div className="flex items-center gap-2 mt-3">
                      <span className={cn(
                        "text-sm font-medium flex items-center gap-1",
                        stat.trend === 'up' ? 'text-green-500' : 
                        stat.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                      )}>
                        {stat.trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
                        {stat.trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
                        {stat.trend === 'neutral' && <Minus className="w-4 h-4" />}
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  </div>
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {quickActions.map((action, index) => (
          <motion.button
            key={action.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            onClick={() => window.location.href = action.href}
            className="relative p-5 rounded-2xl bg-card border border-border hover:border-accent/50 hover:shadow-lg transition-all duration-300 text-left group"
          >
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center mb-4", action.color)}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground">{action.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t(`admin.${action.name.toLowerCase().replace(' ', '')}Desc`) || 'Quick action'}</p>
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-accent" />
              </span>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Recent Activity & Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-heading text-xl">{t('admin.recentActivity')}</CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      activity.type === 'property' && 'bg-primary/10 text-primary',
                      activity.type === 'lead' && 'bg-accent/10 text-accent',
                      activity.type === 'agent' && 'bg-green-500/10 text-green-500',
                      activity.type === 'blog' && 'bg-blue-500/10 text-blue-500'
                    )}>
                      {activity.type === 'property' && <Building2 className="w-5 h-5" />}
                      {activity.type === 'lead' && <Mail className="w-5 h-5" />}
                      {activity.type === 'agent' && <Users className="w-5 h-5" />}
                      {activity.type === 'blog' && <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{activity.action} • {activity.time}</p>
                    </div>
                    <Badge variant={activity.status === 'new' || activity.status === 'pending' ? 'warning' : 
                                     activity.status === 'sold' || activity.status === 'published' || activity.status === 'completed' ? 'success' : 'default'}>
                      {activity.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">{t('admin.quickStats')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Listings</p>
                  <p className="font-heading text-2xl font-bold gradient-gold mt-1">247</p>
                  <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +12 this week
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Views</p>
                  <p className="font-heading text-2xl font-bold gradient-gold mt-1">45.2K</p>
                  <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +8.3%
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Inquiries</p>
                  <p className="font-heading text-2xl font-bold gradient-gold mt-1">1,234</p>
                  <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +15.2%
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Conversion</p>
                  <p className="font-heading text-2xl font-bold gradient-gold mt-1">3.2%</p>
                  <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +0.4%
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border">
                <h4 className="font-medium mb-3">{t('admin.topLocations')}</h4>
                <div className="space-y-2">
                  {['Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah', 'Business Bay', 'JVC'].map((loc, i) => (
                    <div key={loc} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{i + 1}. {loc}</span>
                      <span className="font-semibold">{(5 - i) * 15}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}