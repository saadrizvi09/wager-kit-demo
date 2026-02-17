'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="page-gradient flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-wk-muted text-lg">Loading...</div>
    </div>
  );
}
