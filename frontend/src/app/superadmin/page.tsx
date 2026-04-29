'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSuperAdminStore } from '@/lib/superadmin-store';

export default function SuperAdminIndex() {
  const router = useRouter();
  const { isAuthenticated } = useSuperAdminStore();
  useEffect(() => {
    router.replace(isAuthenticated ? '/superadmin/dashboard' : '/superadmin/login');
  }, [isAuthenticated, router]);
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
    </div>
  );
}
