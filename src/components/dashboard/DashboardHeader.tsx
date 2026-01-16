'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Bell, 
  Plus, 
  Filter,
  Calendar,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MobileNav } from './MobileNav';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useCreateSession } from '@/hooks/use-content-sessions';
import { SidebarTrigger } from '../ui/sidebar';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const createSession = useCreateSession();

  const handleNewContent = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      const newSession = await createSession.mutateAsync({
        title: 'Untitled Content',
        prompt: '',
      });
      router.push(`/content/${newSession.id}`);
    } catch (error) {
      console.error('Failed to create content session:', error);
      setIsCreating(false);
    }
  };


  return (
    <div className="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between p-6">
        {/* Mobile Navigation */}
        <MobileNav />

        {/* Title Section */}
        <div className="flex-1 md:ml-0 ml-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1 text-sm md:text-base">{subtitle}</p>
            )}
          </motion.div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-muted/50 border-0 focus:bg-background"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>

            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Calendar className="w-4 h-4 mr-2" />
              Date
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle />

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

              <Button 
                onClick={handleNewContent}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Content
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
}