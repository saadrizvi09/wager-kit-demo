'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [user] = useState({ username: 'demo' });

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Markets', href: '/dashboard' },
    { label: 'Alerts', href: '#' },
    { label: 'Metrics', href: '#' },
    { label: 'Paper Mode', href: '#' },
    { label: 'API', href: '#' },
  ];

  return (
    <nav className="border-b border-wk-border bg-wk-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              className="text-wk-accent"
            >
              <path
                d="M16 2L4 8v16l12 6 12-6V8L16 2z"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M16 10l-6 3v6l6 3 6-3v-6l-6-3z"
                fill="currentColor"
                opacity="0.6"
              />
            </svg>
            <span className="text-xl font-bold text-white">WagerKit</span>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  pathname === item.href
                    ? 'text-white bg-white/10'
                    : 'text-wk-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-wk-accent to-wk-blue flex items-center justify-center text-sm font-bold text-white">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-wk-muted hidden sm:block">
                  {user.username}
                </span>
              </div>
            )}
            <button
              onClick={() => {}}
              className="text-wk-muted hover:text-white transition-colors"
              title="Settings"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
}
