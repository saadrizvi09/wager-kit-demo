'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // No authentication needed - redirect to dashboard
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="page-gradient flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-wk-muted text-lg">Redirecting...</div>
    </div>
  );
}
