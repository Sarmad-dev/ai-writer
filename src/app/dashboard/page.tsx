'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { signOut } from '@/lib/auth/auth-client';
import { Button } from '@/components/ui/button';
import { LogOut, User, MessageSquare, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NewContentButton } from '@/components/dashboard/NewContentButton';
import { ContentSessionList } from '@/components/dashboard/ContentSessionList';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { session } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">AI Content Writer</h1>
            </div>
            
            {/* Navigation & User Menu */}
            <div className="flex items-center gap-4">
              <Link href="/chat">
                <Button variant="ghost" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Content
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm border-l pl-4">
                <User className="h-4 w-4" />
                <span>{session?.user?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Your Content Sessions</h2>
          <p className="text-muted-foreground">
            Manage and create AI-generated content
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex justify-start">
            <NewContentButton />
          </div>
          <ContentSessionList />
        </div>
      </main>
    </div>
  );
}
