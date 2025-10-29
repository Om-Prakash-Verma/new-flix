
'use client';

import Link from 'next/link';
import { Film, Menu, Search, Dices } from 'lucide-react';
import { SearchInput } from './SearchInput';
import { siteConfig } from '@/config/site';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SurpriseMeButton } from './SurpriseMeButton';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-black/80 backdrop-blur-sm">
      <div className="flex h-20 items-center px-4 sm:px-8">
        <div className="flex items-center">
          <MobileNav />
          <Link href="/" className="mr-8 flex items-center space-x-2" prefetch={false}>
            <Film className="h-8 w-8 text-primary" />
            <span className="font-black text-2xl sm:inline-block tracking-tighter">{siteConfig.name}</span>
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
          <div className="hidden md:block w-full max-w-sm">
            <SearchInput />
          </div>
          <MobileSearch />
          <SurpriseMeButton />
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden mr-2">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-background/90 backdrop-blur-lg">
        <SheetHeader className="sr-only">
          <SheetTitle>Main Navigation</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full p-4">
          <Link href="/" className="mb-8 flex items-center space-x-2" prefetch={false}>
             <Film className="h-8 w-8 text-primary" />
             <span className="font-black text-2xl tracking-tighter">{siteConfig.name}</span>
          </Link>
          <nav className="flex flex-col gap-4">
            {siteConfig.mainNav.map((item) => (
              <SheetClose key={item.href} asChild>
                <Link
                  href={item.href}
                  className="text-lg font-semibold text-foreground/80 hover:text-primary transition-colors"
                  prefetch={false}
                >
                  {item.title}
                </Link>
              </SheetClose>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}


function MobileSearch() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-6 w-6" />
          <span className="sr-only">Open Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="top-0 translate-y-0 h-[50vh] max-h-[300px] bg-background/90 backdrop-blur-lg border-b border-border data-[state=closed]:slide-out-to-top-full data-[state=open]:slide-in-from-top-full rounded-t-none">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Search {siteConfig.name}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center h-full">
            <SearchInput />
        </div>
      </DialogContent>
    </Dialog>
  );
}
