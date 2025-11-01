
'use client';

import Link from 'next/link';
import { Film } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { SurpriseMeButton } from './SurpriseMeButton';
import { SearchInput } from './SearchInput';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-black/80 backdrop-blur-sm">
      <div className="flex h-20 items-center px-4 sm:px-8">
        <div className="flex items-center">
          <Link href="/" className="mr-4 sm:mr-8 flex items-center space-x-2" prefetch={false}>
            <Film className="h-8 w-8 text-primary" />
            <span className="hidden sm:inline-block font-black text-2xl tracking-tighter">{siteConfig.name}</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {siteConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors text-foreground/70 hover:text-foreground"
                prefetch={false}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="w-full max-w-xs sm:max-w-sm">
            <SearchInput />
          </div>
          <SurpriseMeButton />
        </div>
      </div>
    </header>
  );
}