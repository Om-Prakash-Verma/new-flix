
'use client';

import Link from 'next/link';
import { Film, Menu, Search, Dices, Compass, Clapperboard, Tv, FileText, ArrowLeft, type LucideIcon } from 'lucide-react';
import { SearchInput } from './SearchInput';
import { siteConfig } from '@/config/site';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle, Separator } from '@/components/ui/layout';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialogs';
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
  const iconMap: Record<string, LucideIcon> = {
    compass: Compass,
    clapperboard: Clapperboard,
    tv: Tv,
    file: FileText,
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden mr-2">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-[hsl(var(--sidebar-background))] border-none p-0 w-full max-w-[280px]">
        <SheetHeader className="p-4 border-b border-white/10 flex-row justify-between items-center">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <Link href="/" className="flex items-center space-x-2" prefetch={false}>
             <Film className="h-7 w-7 text-primary" />
             <span className="font-bold text-xl tracking-tighter">{siteConfig.name}</span>
          </Link>
          <SheetClose>
              <ArrowLeft className="h-6 w-6 text-white" />
              <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>
        <div className="flex flex-col h-full">
            <div className="flex-1 p-4 space-y-6">
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground px-2 mb-2">MENU</h3>
                    <nav className="flex flex-col gap-1">
                    {siteConfig.mainNav.map((item) => {
                        const Icon = item.icon ? iconMap[item.icon] : null;
                        return (
                        <SheetClose key={item.href} asChild>
                            <Link
                            href={item.href}
                            className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-semibold text-foreground/80 hover:bg-white/5 hover:text-primary transition-colors"
                            prefetch={false}
                            >
                            {Icon && <Icon className="h-5 w-5" />}
                            <span>{item.title}</span>
                            </Link>
                        </SheetClose>
                        )
                    })}
                    </nav>
                </div>

                <Separator className="bg-white/10" />

                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground px-2 mb-2">LEGAL</h3>
                    <nav className="flex flex-col gap-1">
                    {siteConfig.footerNav.map((item) => {
                        const Icon = item.icon ? iconMap[item.icon] : null;
                        return (
                        <SheetClose key={item.href} asChild>
                            <Link
                            href={item.href}
                            className="flex items-center gap-3 rounded-md px-3 py-2 text-base font-semibold text-foreground/80 hover:bg-white/5 hover:text-primary transition-colors"
                            prefetch={false}
                            >
                            {Icon && <Icon className="h-5 w-5" />}
                            <span>{item.title}</span>
                            </Link>
                        </SheetClose>
                        )
                    })}
                    </nav>
                </div>
            </div>
            <div className="p-4 border-t border-white/10 mt-auto">
                <p className="text-xs text-center text-muted-foreground">&copy; {new Date().getFullYear()} {siteConfig.name}. All Rights Reserved.</p>
            </div>
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
