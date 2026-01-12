import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/contexts/language-context';
import { AuthProvider } from '@/contexts/auth-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getSession } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Agendamiento Innvo',
  description: 'Medical Appointment Scheduler',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const user = {
    isLoggedIn: session.isLoggedIn,
    username: session.username,
  };

  return (
    <LanguageProvider>
      <AuthProvider user={user}>
        <html lang="en" className="h-full" suppressHydrationWarning>
          <head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet"></link>
          </head>
          <body className="font-body antialiased h-full flex flex-col" suppressHydrationWarning>
            <Header />
            <main className="flex-grow w-full">
              {children}
            </main>
            <Footer />
            <Toaster />
          </body>
        </html>
      </AuthProvider>
    </LanguageProvider>
  );
}
