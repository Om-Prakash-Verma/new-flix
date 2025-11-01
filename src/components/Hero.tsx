

'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { type Movie, type TVShow, type SearchResult } from '@/lib/tmdb-schemas';
import { slugify, getBackdropImage, getPosterImage } from '@/lib/utils';
import { Info, PlayCircle } from 'lucide-react';
import { StarRating } from './media';
import { Badge } from './ui/badge';
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
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
      </div>

      <div className="relative z-10 flex h-full items-end md:items-center px-4 sm:px-8 pb-12 md:pb-0">
        <div className="w-full flex flex-col md:flex-row items-center gap-8 max-w-6xl mx-auto">
          <div className="w-full max-w-[200px] md:w-1/4 flex-shrink-0">
            <Image
              src={getPosterImage(item.poster_path, 'w500')}
              alt={`Poster for ${title}`}
              width={500}
              height={750}
              className="rounded-poster shadow-2xl hidden md:block"
              priority
              data-ai-hint="movie poster"
            />
          </div>
          <div className="w-full md:w-3/4 text-center md:text-left">
            <p className="text-primary font-bold tracking-widest uppercase text-sm mb-2 text-shadow">{media_type === "movie" ? "Movie" : "TV Show"}</p>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter mb-4 text-shadow-lg">
              {title}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4 text-shadow">
              <StarRating rating={item.vote_average} />
              <span className="text-lg font-semibold">{year}</span>
            </div>
            {item.genreNames && (
              <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
                {item.genreNames.slice(0, 4).map((genreName) => (
                  <Badge key={genreName} variant="outline" className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
                    {genreName}
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-sm md:text-base text-foreground/80 line-clamp-3 mb-8 max-w-2xl text-shadow mx-auto md:mx-0">
              {item.overview}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <ServerSelectionModal playerInfo={playerInfo}>
                <Button size="lg" className="font-bold text-lg w-full sm:w-auto transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30">
                  <PlayCircle className="mr-2 h-7 w-7" />
                  Play
                </Button>
              </ServerSelectionModal>
              <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white font-bold text-lg w-full sm:w-auto transition-all duration-300 hover:scale-105">
                <Link href={`/${media_type}/${itemSlug}-${item.id}`} prefetch={false}>
                  <Info className="mr-2 h-5 w-5" />
                  More Info
                </Link>
              </Button>
            </div>
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

  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  if (!items || items.length === 0) {
    return null;
  }

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
    </div>
  );
}