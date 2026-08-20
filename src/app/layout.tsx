import type { Metadata } from 'next';
import './globals.css';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { TopBar } from '@/components/layout/TopBar';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Fast Pace — Local Business Lead Generation & Sales OS',
  description: 'Local Business Discovery, Business Intelligence, Digital Audits, Opportunity Detection & Sales CRM for Full-Stack Developers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen antialiased flex">
        <ThemeProvider>
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 min-h-screen">
            <TopBar />
            <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
