
import Link from 'next/link';
import { Film } from 'lucide-react';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-transparent mt-auto">
      <div className="container flex flex-col items-center justify-between gap-6 py-8 md:flex-row">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block">{siteConfig.name}</span>
          </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by an AI assistant. Not for commercial use. Movie and TV data provided by{' '}
            <Link href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4 hover:text-primary">
              TMDB
            </Link>.
          </p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-center text-sm text-muted-foreground">
          {siteConfig.footerNav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-primary hover:underline underline-offset-4">
                  {item.title}
              </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
