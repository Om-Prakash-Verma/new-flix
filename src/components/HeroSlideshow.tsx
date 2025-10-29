
'use client';

import * as React from 'react';
import type { EmblaCarouselType } from 'embla-carousel-react';
import {
  Carousel as ShadcnCarousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import type { Movie, TVShow, SearchResult } from '@/lib/tmdb-schemas';
import { Hero } from './Hero';
import { getPosterImage } from '@/lib/tmdb-images';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Progress } from './ui/progress';

type HeroSlideshowProps = {
  items: ((SearchResult | Movie | TVShow) & { genreNames?: string[] })[];
};

export function HeroSlideshow({ items }: HeroSlideshowProps) {
  const [emblaApi, setEmblaApi] = React.useState<EmblaCarouselType | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: false })
  );

  const scrollTo = React.useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );
  
  const scrollNext = React.useCallback(() => {
    if (emblaApi) {
        emblaApi.scrollNext();
        plugin.current.reset();
    }
  }, [emblaApi]);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setProgress(0);
  }, [emblaApi, setSelectedIndex]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 100 / (3000 / 100);
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 100);

    return () => {
      clearInterval(progressTimer);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!items || items.length === 0) {
    return null;
  }

  const nextIndex = (selectedIndex + 1) % items.length;
  const nextItem = items[nextIndex];
  const nextItemTitle = 'title' in nextItem ? nextItem.title : nextItem.name;

  return (
    <div className="relative">
      <ShadcnCarousel
        plugins={[plugin.current]}
        opts={{
          align: 'start',
          loop: true,
        }}
        setApi={setEmblaApi}
        className="w-full"
      >
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index}>
              <Hero item={item} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </ShadcnCarousel>

      <div 
        className="hidden md:block absolute bottom-8 right-8 z-20 w-[9vw] max-w-[90px] min-w-[60px] cursor-pointer group opacity-80 hover:opacity-100 transition-opacity"
        onClick={scrollNext}
      >
        <div className="relative aspect-[2/3] shadow-lg transition-transform duration-300 ease-in-out group-hover:scale-105 rounded-poster overflow-hidden">
           <Image
              src={getPosterImage(nextItem.poster_path)}
              alt={nextItemTitle ? `Poster for ${nextItemTitle}` : 'Next item poster'}
              title={nextItemTitle ? `Poster for ${nextItemTitle}` : 'Next item poster'}
              fill
              loading="lazy"
              className="object-cover rounded-poster"
              sizes="10vw"
              data-ai-hint="movie poster"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
        </div>
        <div className="mt-2 text-white text-shadow">
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">Next Up</p>
            <h4 className="text-sm font-semibold line-clamp-1">{nextItemTitle}</h4>
        </div>
        <Progress value={progress} className="absolute -bottom-2 left-0 right-0 h-1 bg-white/20" indicatorClassName="bg-primary" />
      </div>
    </div>
  );
}
