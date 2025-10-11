
'use client';

import type { Metadata } from 'next';
import { Alegreya_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app/app-sidebar';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import AuthGate from '@/components/app/auth-gate';
import { usePathname } from 'next/navigation';

const alegreya = Alegreya_Sans({ 
  subsets: ['latin'], 
  display: 'swap',
  variable: '--font-alegreya',
  weight: ['400', '700'],
});

// Metadata remains on the server, cannot use hooks.
// export const metadata: Metadata = {
//   title: 'Precifica Céu',
//   description: 'An intuitive online application for pricing confectionery products.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
          <title>Precifica Céu</title>
          <meta name="description" content="An intuitive online application for pricing confectionery products." />
      </head>
      <body className={cn('font-sans', alegreya.variable)}>
        <FirebaseClientProvider>
            {isLoginPage ? (
                <AuthGate>{children}</AuthGate>
            ) : (
                <AuthGate>
                    <SidebarProvider>
                    <Sidebar collapsible="icon">
                        <AppSidebar />
                    </Sidebar>
                    <SidebarInset>
                        <div className="flex justify-center w-full">
                        <main className="w-full max-w-7xl p-4 md:p-8">
                            {children}
                        </main>
                        </div>
                    </SidebarInset>
                    </SidebarProvider>
                </AuthGate>
            )}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
