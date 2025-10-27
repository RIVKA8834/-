'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [status, router, pathname]);

  if (pathname === '/admin/login') {
    return children;
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">טוען...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold">פאנל ניהול</h1>
              <nav className="flex gap-4">
                <Link href="/admin/catalog">
                  <Button
                    variant={pathname === '/admin/catalog' ? 'default' : 'ghost'}
                  >
                    קטלוג
                  </Button>
                </Link>
                <Link href="/admin/orders">
                  <Button
                    variant={pathname === '/admin/orders' ? 'default' : 'ghost'}
                  >
                    הזמנות
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button
                    variant={pathname === '/admin/settings' ? 'default' : 'ghost'}
                  >
                    הגדרות
                  </Button>
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user?.email}</span>
              <Button variant="outline" onClick={() => signOut()}>
                התנתק
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-4">{children}</main>
    </div>
  );
}
