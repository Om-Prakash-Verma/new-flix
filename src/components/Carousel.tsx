
'use client';

import * as React from 'react';
import {
  Carousel as ShadcnCarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CarouselProps = {
  children: React.ReactNode;
};

export function Carousel({ children }: CarouselProps) {
  return (
    <div className="relative">
      <ShadcnCarousel
        opts={{
          align: 'start',
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4 px-4 sm:px-8 items-start">
          {React.Children.map(children, (child, index) => (
            <CarouselItem key={index} className="pl-4 basis-auto" style={{ flex: '0 0 190px' }}>
              {child}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-8 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/50 backdrop-blur-sm hover:bg-background/80 border-2 border-primary/50 text-primary hover:border-primary transition-all duration-300 disabled:opacity-0 disabled:scale-90" >
          <ChevronLeft className="h-6 w-6" />
        </CarouselPrevious>
        <CarouselNext className="absolute right-8 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/50 backdrop-blur-sm hover:bg-background/80 border-2 border-primary/50 text-primary hover:border-primary transition-all duration-300 disabled:opacity-0 disabled:scale-90" >
          <ChevronRight className="h-6 w-6" />
        </CarouselNext>
      </ShadcnCarousel>
    </div>
  );
}
