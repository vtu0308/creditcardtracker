"use client";

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.push('/login');
      }
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (session) {
    return <>{children}</>;
  }

  return null;
}
