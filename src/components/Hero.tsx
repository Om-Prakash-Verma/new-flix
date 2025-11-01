

'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { type Movie, type TVShow, type SearchResult } from '@/lib/tmdb-schemas';
import { slugify, getBackdropImage, getPosterImage } from '@/lib/utils';
import { Info, PlayCircle } from 'lucide-react';
import { StarRating } from './media';
import { Badge, Progress } from './ui/badge';
import { ServerSelectionModal } from './PlayerModal';
import type { PlayerModalInfo } from './PlayerModal';
import type { EmblaCarouselType } from 'embla-carousel-react';
import {
  ShadcnCarousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';


//================================================================//
// 1. HERO COMPONENT
//================================================================//

type HeroProps = {
  item: (SearchResult | Movie | TVShow) & { genreNames?: string[] };
};

export function Hero({ item }: HeroProps) {
  const media_type = 'title' in item ? 'movie' : 'tv';
  const title = 'title' in item ? item.title : item.name;
  const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const itemSlug = slugify(title);

  let playerInfo: PlayerModalInfo;
  if (media_type === 'movie') {
    playerInfo = {
      tmdbId: String(item.id),
      title: title,
      type: 'movie',
    };
  } else {
    // For TV shows, we need season and episode. We'll default to S1E1.
    playerInfo = {
      tmdbId: String(item.id),
      title: `${title} - S1E1`,
      type: 'tv',
      season: 1,
      episode: 1,
    };
  }

  return (
    <div className="relative h-[85vh] min-h-[600px] w-full">
      <div className="absolute inset-0">
        <Image
          src={getBackdropImage(item.backdrop_path)}
          alt={`Scene from the ${media_type} ${title}`}
          title={`Scene from the ${media_type} ${title}`}
          fill
          className="object-cover object-center"
          priority
          data-ai-hint="movie scene"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex h-full items-center px-4 sm:px-8">
        <div className="w-full max-w-lg">
          <p className="text-primary font-bold tracking-widest uppercase text-sm mb-2">{media_type === "movie" ? "Movie" : "TV Show"}</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-shadow-lg">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mb-4 text-shadow">
            <StarRating rating={item.vote_average} />
            <span className="text-lg font-semibold">{year}</span>
          </div>
          {item.genreNames && (
            <div className="flex flex-wrap gap-2 mb-6">
              {item.genreNames.slice(0, 4).map((genreName) => (
                <Badge key={genreName} variant="outline" className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
                  {genreName}
                </Badge>
              ))}
            </div>
          )}
          <p className="text-base text-foreground/80 line-clamp-3 mb-8 max-w-2xl text-shadow">
            {item.overview}
          </p>
          <div className="flex flex-wrap gap-4">
            <ServerSelectionModal playerInfo={playerInfo}>
              <Button size="lg" className="font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30">
                <PlayCircle className="mr-2 h-7 w-7" />
                Play
              </Button>
            </ServerSelectionModal>
            <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white font-bold text-lg transition-all duration-300 hover:scale-105">
              <Link href={`/${media_type}/${itemSlug}-${item.id}`} prefetch={false}>
                <Info className="mr-2 h-5 w-5" />
                More Info
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


//================================================================//
// 2. HERO SLIDESHOW COMPONENT
//================================================================//

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
