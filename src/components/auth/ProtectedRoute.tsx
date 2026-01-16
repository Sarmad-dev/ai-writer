import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export async function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.session.id) {
    return redirect(redirectTo)
  }

  return <>{children}</>;
}
