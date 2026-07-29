'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileText, 
  Mail, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu,
  Home,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/lib/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/lib/components/ui/dropdown-menu';
import { Separator } from '@/lib/components/ui/separator';
import { Badge } from '@/lib/components/ui/badge';
import { useTheme } from 'next-themes';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { createClient } from '@/lib/supabase/client';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Properties', href: '/admin/properties', icon: Building2 },
  { name: 'Agents', href: '/admin/agents', icon: Users },
  { name: 'Blog Posts', href: '/admin/blog', icon: FileText },
  { name: 'Leads', href: '/admin/leads', icon: Mail },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations('admin');
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);
  const [adminUser, setAdminUser] = useState<{ email?: string; full_name?: string } | null>(null);
  const { loading, isAdmin } = useAdminAuth();
  const isLoginPage = pathname.includes('/admin/login');

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    if (isAdmin) {
      const fetchUser = async () => {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setAdminUser({
            email: session.user.email || undefined,
            full_name: session.user.user_metadata?.name || undefined,
          });
        }
      };
      fetchUser();
    }
  }, [isAdmin]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `/${locale}/admin/login`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAdmin && !isLoginPage) {
    return null;
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background">
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ width: sidebarOpen ? 280 : 72 }}
        animate={{ width: sidebarOpen ? 280 : 72 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarOpen ? "w-72" : "w-18"
        )}
        style={{ width: sidebarOpen ? 280 : 72 }}
      >
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
              <span className="font-heading text-xl font-semibold text-foreground">EVA Admin</span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-accent transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Admin navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-accent/20 to-accent/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  !sidebarOpen && "justify-center"
                )}
                title={sidebarOpen ? undefined : item.name}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                {sidebarOpen && <span className="font-medium white-space-nowrap">{item.name}</span>}
                {isActive && sidebarOpen && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent to-accent/50 rounded-r-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/admin-avatar.jpg" alt="Admin" />
              <AvatarFallback className="bg-gradient-luxury text-primary-foreground">AD</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{adminUser?.full_name || 'Admin User'}</p>
                <p className="text-xs text-muted-foreground truncate">{adminUser?.email || 'superadmin@evadxb.com'}</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 mt-3 px-3">
            <Link 
              href={`/${locale}`}
              target="_blank"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
                sidebarOpen ? "justify-start" : "justify-center"
              )}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium text-sm">View Website</span>}
            </Link>
            
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors w-full",
                sidebarOpen ? "justify-start" : "justify-center"
              )}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium text-sm text-destructive">Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-0",
        sidebarOpen ? "lg:ml-72" : "lg:ml-18"
      )}>
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="font-heading text-xl font-semibold">{t(pathname.split('/').pop() || 'dashboard')}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Input
                placeholder="Search properties, agents..."
                className="w-64 pl-10 pr-4 bg-muted/50 border-border/50 focus:border-accent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              {mounted ? (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <Moon className="w-5 h-5" />}
            </button>

            <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-accent transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/admin-avatar.jpg" alt="Admin" />
                    <AvatarFallback className="bg-gradient-luxury text-primary-foreground">AD</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1 border-b border-border">
                  <p className="font-medium text-sm">{adminUser?.full_name || 'Admin User'}</p>
                  <p className="text-xs text-muted-foreground">{adminUser?.email || 'superadmin@evadxb.com'}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

import { Search, Bell, Sun, Moon, TrendingUp } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminSidebar>{children}</AdminSidebar>;
}
