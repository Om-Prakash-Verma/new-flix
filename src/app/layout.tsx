
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/dialogs';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { AdScripts } from '@/components/AdScripts';
import { Inter, Roboto_Flex } from 'next/font/google';
import { Organization } from 'schema-dts';
import { jsonLd } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
});

const robotoFlex = Roboto_Flex({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});


export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'free movies',
    'free tv shows',
    'watch movies online',
    '4k streaming',
    'HD movies',
    'online streaming',
    'Flix',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const organizationSchema: Organization = {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.png`,
  };

  return (
    <html lang="en" className={cn('dark', inter.variable, robotoFlex.variable)} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(organizationSchema)}
        />
        <AdScripts />
      </head>
      <body
        className={cn(
          "font-headline bg-background text-foreground antialiased",
          "transition-all duration-500"
        )}>
        <div className="relative flex min-h-screen flex-col" data-version="1.0.2">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
