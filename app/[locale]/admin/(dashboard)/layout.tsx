'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { 
  LayoutDashboard, 
  Home, 
  Building2, 
  Users, 
  FileText, 
  Mail, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/lib/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/lib/components/ui/dropdown-menu';
import { Separator } from '@/lib/components/ui/separator';
import { Badge } from '@/lib/components/ui/badge';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Properties', href: '/admin/properties', icon: Building2 },
  { name: 'Agents', href: '/admin/agents', icon: Users },
  { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
  { name: 'Leads', href: '/admin/leads', icon: Mail },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminSidebarOpen');
      if (saved !== null) {
        setSidebarOpen(saved === 'true');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('adminSidebarOpen', sidebarOpen.toString());
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ width: sidebarOpen ? 260 : 72 }}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-card border-r border-border transition-all duration-300",
          "flex flex-col overflow-hidden"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link href={`/${locale}/admin`} className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src="/eva-logo.jpg"
                alt="EVA Real Estate"
                width={32}
                height={32}
                priority
                className="object-cover w-full h-full"
              />
            </div>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                className="font-heading text-xl font-semibold text-foreground whitespace-nowrap"
              >
                Admin
              </motion.span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto" aria-label="Admin navigation">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.name}>
                  <Link
                    href={`${locale}${item.href}`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                      "group relative overflow-hidden",
                      isActive
                        ? "bg-accent/50 text-primary shadow-sm shadow-primary/10"
                        : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <motion.div
                      layoutId={isActive ? 'active-tab' : undefined}
                      className="absolute left-0 top-0 h-full w-1 bg-primary"
                      transition={{ duration: 0.3 }}
                    />
                    <item.icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive && "text-primary")} />
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="font-medium text-sm"
                      >
                        {t(`admin.${item.name.toLowerCase().replace(' ', '')}`) || item.name}
                      </motion.span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="w-9 h-9">
              <AvatarImage src="/avatar-placeholder.jpg" alt="Admin" />
              <AvatarFallback className="text-xs font-bold gradient-gold">AD</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">Admin User</p>
                <p className="text-xs text-muted-foreground">Super Administrator</p>
              </div>
            )}
          </div>
          <div className="px-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 px-3 py-2" size="sm">
                  <LogOut className="w-4 h-4" />
                  {sidebarOpen && <span className="text-sm font-medium">{t('admin.logout')}</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('admin.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 lg:ml-64",
        sidebarOpen ? "lg:ml-[260px]" : "lg:ml-[72px]"
      )}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <LayoutDashboard className="w-5 h-5" />
              </Button>
              
              <div className="hidden sm:flex items-center gap-2">
                <Link href={`/${locale}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('admin.viewSite')}
                </Link>
                <Separator className="h-4" orientation="vertical" />
                <span className="text-sm text-muted-foreground">{t('admin.dashboard')}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t('admin.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-muted/50 border-border"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Filter className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">3</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}