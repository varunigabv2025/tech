'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/Card';
import LoadingState from '@/components/LoadingState';

export default function ProtectedRoute({ children, allowedRoles = ['MSME'] }) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (user && allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'FINANCIER') {
          router.replace('/unauthorized');
        } else {
          router.replace('/unauthorized');
        }
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, router]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Card className="max-w-md w-full">
          <LoadingState message="Checking your TrustFlow session..." />
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || (user && allowedRoles && !allowedRoles.includes(user.role))) {
    return null; // Return null while redirecting
  }

  return <>{children}</>;
}
