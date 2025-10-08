import type { Metadata } from 'next';
import { Alegreya_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/app/app-sidebar';
import { cn } from '@/lib/utils';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const alegreya = Alegreya_Sans({ 
  subsets: ['latin'], 
  display: 'swap',
  variable: '--font-alegreya',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Precifica Céu',
  description: 'An intuitive online application for pricing confectionery products.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans', alegreya.variable)}>
        <FirebaseClientProvider>
          <SidebarProvider>
            <Sidebar>
              <AppSidebar />
            </Sidebar>
            <SidebarInset>
              <main className="p-4 md:p:8">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
