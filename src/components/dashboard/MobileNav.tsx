'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu,
  LayoutDashboard, 
  FileText, 
  MessageSquare, 
  Settings, 
  User, 
  LogOut,
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
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Profile', href: '/profile', icon: User },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { session } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    setOpen(false);
  };

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-linear-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  AI Writing
                </span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-6 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.name} href={item.href} onClick={() => setOpen(false)}>
                    <div
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-linear-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                          : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile & Logout */}
            <div className="p-6 border-t border-border space-y-4">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-10 h-10 bg-linear-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
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
                onClick={handleLogout}
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}