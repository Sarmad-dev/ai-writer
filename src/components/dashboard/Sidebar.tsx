'use client';

import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Settings, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  Search,
  Bookmark
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { signOut } from '@/lib/auth/auth-client';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Content', href: '/content', icon: FileText },
  { name: 'Chat', href: '/chat', icon: MessageSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  { name: 'Search', href: '/search', icon: Search },
];

const bottomNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Profile', href: '/profile', icon: User },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { session } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div
      className={`dashboard-sidebar relative h-screen bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-70'
      }`}
      style={{ width: isCollapsed ? '80px' : '280px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2 transition-opacity duration-200">
              <div className="w-8 h-8 bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                AI Writing
              </span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={isCollapsed ? 'mx-auto' : 'ml-auto'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto sidebar-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  'dashboard-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                  isActive
                    ? 'bg-linear-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium transition-opacity duration-200">
                    {item.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-border space-y-2">
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                  isActive
                    ? 'bg-accent text-foreground'
                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium transition-opacity duration-200">
                    {item.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* User Profile & Logout */}
        <div className="pt-4 border-t border-border">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session?.user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">Free Plan</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}