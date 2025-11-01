

'use client';

import React, { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import {
  Carousel as ShadcnCarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { Movie, TVShow, SearchResult, PersonCombinedCreditsCast, CollectionDetails } from '@/lib/tmdb-schemas';
import { slugify, getPosterImage, getBackdropImage } from '@/lib/utils';
import { Star, PlayCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/forms';
import { Card } from '@/components/ui/layout';
import { fetchDiscoverMedia } from '@/lib/actions';
import { cn } from '@/lib/utils';


//================================================================//
// 1. POSTER CARD
//================================================================//

type PosterCardProps = {
  item: SearchResult | Movie | TVShow | PersonCombinedCreditsCast;
  type: 'movie' | 'tv';
  imageSize?: 'w185' | 'w342';
};

export function PosterCard({ item, type, imageSize = 'w342' }: PosterCardProps) {
  const title = 'title' in item ? item.title : item.name;
  if (!title) {
    return <PosterCardSkeleton />;
  }
  const itemSlug = slugify(title);

  return (
    <Link href={`/${type}/${itemSlug}-${item.id}`} className="block group" prefetch={false}>
      <div className="relative rounded-poster p-[1.5px] overflow-hidden animated-border-card">
        <div className="aspect-[2/3] relative bg-muted/50 shadow-md rounded-[10.5px] overflow-hidden">
            <Image
            src={getPosterImage(item.poster_path, imageSize)}
            alt={`Poster for ${title}`}
            title={`Poster for ${title}`}
            fill
            loading="lazy"
            className="object-cover rounded-[10.5px]"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 15vw"
            data-ai-hint="movie poster"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <PlayCircle className="w-16 h-16 text-white/80 drop-shadow-lg" />
            </div>
            <Badge className="absolute top-2 left-2 text-xs" variant="secondary">{type === 'movie' ? 'Movie' : 'TV'}</Badge>
        </div>
      </div>
        <div className="mt-2">
            <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                <span>{item.vote_average.toFixed(1)}</span>
            </div>
        </div>
    </Link>
  );
}

export function PosterCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-[2/3] rounded-poster bg-muted/50" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}


//================================================================//
// 2. MEDIA LIST ITEM
//================================================================//

type MediaListItemProps = {
  item: Movie | TVShow | SearchResult;
  type: 'movie' | 'tv';
};

export function MediaListItem({ item, type }: MediaListItemProps) {
  const title = 'title' in item ? item.title : item.name;
  if (!title) return null;
  
  const releaseDate = 'release_date' in item ? item.release_date : ('first_air_date' in item ? item.first_air_date : undefined);
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const itemSlug = slugify(title);

  return (
    <Link href={`/${type}/${itemSlug}-${item.id}`} className="block group" prefetch={false}>
      <Card className="flex items-start gap-4 p-3 bg-card/80 hover:bg-muted/50 transition-all duration-300 rounded-lg h-full">
        <div className="w-24 md:w-28 flex-shrink-0">
          <div className="aspect-[2/3] relative rounded-md overflow-hidden bg-muted/50">
            <Image
              src={getPosterImage(item.poster_path, 'w185')}
              alt={`Poster for ${title}`}
              title={`Poster for ${title}`}
              fill
              loading="lazy"
              className="object-cover rounded-lg"
              sizes="112px"
              data-ai-hint="movie poster"
            />
            <Badge className="absolute top-1 left-1 text-[10px] leading-tight px-1.5 py-0.5" variant="secondary">{type === 'movie' ? 'Movie' : 'TV'}</Badge>
          </div>
        </div>
        <div className="flex-grow overflow-hidden flex flex-col justify-between h-full gap-1.5 py-1">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span>{year}</span>
              {item.vote_average > 0 && (
                <>
                  <span className="text-xs">•</span>
                  <StarRating rating={item.vote_average} />
                </>
              )}
            </div>
            <h3 className="font-semibold text-base md:text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
          </div>
          <p className="text-xs text-foreground/70 line-clamp-2">
              {item.overview}
          </p>
        </div>
      </Card>
    </Link>
  );
}

export function MediaListItemSkeleton() {
  return (
    <Card className="flex items-start gap-4 p-3 bg-card/80 rounded-lg h-[158px] md:h-[182px]">
        <div className="w-24 md:w-28 flex-shrink-0">
            <Skeleton className="aspect-[2/3] rounded-md" />
        </div>
        <div className="flex-grow space-y-2 mt-1 w-full">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-10 w-full mt-4" />
        </div>
    </Card>
  );
}

export function MediaListSkeleton({ count = 10 }: { count?: number }) {
    return (
        <div className="flex flex-col gap-4">
            {[...Array(count)].map((_, i) => <MediaListItemSkeleton key={`skel-${i}`} />)}
        </div>
    );
}


//================================================================//
// 3. MEDIA BROWSER (for /movie and /tv pages)
//================================================================//

type SortOption = 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc' | 'first_air_date.desc';

type MediaBrowserProps = {
  title: string;
  type: 'movie' | 'tv';
  genres: Record<number, string>;
  countries: Record<string, string>;
};

export function MediaBrowser({ title, type, genres, countries }: MediaBrowserProps) {

  const [filters, setFilters] = useState({
    genre: 'all',
    year: 'all',
    country: 'all',
    sort: 'popularity.desc' as SortOption
  });

  const [items, setItems] = useState<(Movie | TVShow)[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

  const loadInitialItems = useCallback((currentFilters: typeof filters) => {
    setIsInitialLoading(true);
    startTransition(async () => {
      try {
        const data = await fetchDiscoverMedia({
          type,
          page: 1,
          filters: currentFilters
        });
        setItems(data.results);
        setPage(1);
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error("Failed to fetch initial items", error);
      } finally {
        setIsInitialLoading(false);
      }
    });
  }, [type]);

  useEffect(() => {
    loadInitialItems(filters);
  }, [loadInitialItems]);


  const handleFilterChange = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    loadInitialItems(newFilters);
  };
  
  const fetcher = useCallback(async (nextPage: number) => {
      const data = await fetchDiscoverMedia({
        type,
        page: nextPage,
        filters,
      });
      return data.results;
  }, [type, filters]);

  const sortOptions = type === 'movie' ? [
    { value: 'popularity.desc', label: 'Popularity' },
    { value: 'vote_average.desc', label: 'Rating' },
    { value: 'primary_release_date.desc', label: 'Release Date' }
  ] : [
    { value: 'popularity.desc', label: 'Popularity' },
    { value: 'vote_average.desc', label: 'Rating' },
    { value: 'first_air_date.desc', label: 'Release Date' }
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">{title}</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="grid w-full gap-1.5">
                <Label htmlFor="sort-by" className="text-muted-foreground">Sort By</Label>
                <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value as SortOption)}>
                    <SelectTrigger className="w-full md:w-[180px] bg-secondary border-border" id="sort-by">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="grid w-full gap-1.5">
                <Label htmlFor="genre" className="text-muted-foreground">Genre</Label>
                <Select value={filters.genre} onValueChange={(value) => handleFilterChange('genre', value)}>
                    <SelectTrigger className="w-full md:w-[180px] bg-secondary border-border" id="genre">
                        <SelectValue placeholder="All Genres" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Genres</SelectItem>
                        {Object.entries(genres).map(([id, name]) => (
                            <SelectItem key={id} value={id}>{name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="grid w-full gap-1.5">
                <Label htmlFor="year" className="text-muted-foreground">Year</Label>
                <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                    <SelectTrigger className="w-full md:w-[180px] bg-secondary border-border" id="year">
                        <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {years.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="country" className="text-muted-foreground">Country</Label>
              <Select value={filters.country} onValueChange={(value) => handleFilterChange('country', value)}>
                  <SelectTrigger className="w-full md:w-[180px] bg-secondary border-border" id="country">
                      <SelectValue placeholder="All Countries" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {Object.entries(countries).map(([code, name]) => (
                          <SelectItem key={code} value={code}>{name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
        </div>
      </div>
      
      <MediaGrid 
          initialItems={items} 
          type={type}
          initialLoading={isInitialLoading || isPending}
          imageSize="w342"
          fetcher={fetcher}
          initialPage={page}
          totalPages={totalPages}
      />
    </>
  );
}


//================================================================//
// 4. MEDIA GRID
//================================================================//

type MediaGridProps = {
    initialItems: (Movie | TVShow)[];
    type: 'movie' | 'tv';
    imageSize?: 'w185' | 'w342';
    initialLoading?: boolean;
    fetcher: (page: number) => Promise<(Movie | TVShow)[]>;
    initialPage?: number;
    totalPages?: number;
};

export function MediaGrid({ 
    initialItems = [], 
    type, 
    imageSize,
    initialLoading = false,
    fetcher,
    initialPage = 1,
    totalPages: initialTotalPages = 1
}: MediaGridProps) {
    
    const [items, setItems] = useState(initialItems);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [isLoading, setIsLoading] = useState(false);
    const hasMore = page < totalPages;

    const { ref, inView } = useInView({
        threshold: 0.5,
        triggerOnce: false,
    });

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore || !fetcher) return;
        setIsLoading(true);
        const nextPage = page + 1;
        try {
            const newItems = await fetcher(nextPage);
            setItems(prev => [...prev, ...newItems]);
            setPage(nextPage);
        } catch (error) {
            console.error("Failed to fetch more items", error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, page, fetcher]);

    useEffect(() => {
        if (inView) {
            loadMore();
        }
    }, [inView, loadMore]);
    
    useEffect(() => {
        setItems(initialItems);
        setPage(initialPage);
        setTotalPages(initialTotalPages);
    }, [initialItems, initialPage, initialTotalPages]);

    if (initialLoading) {
        return <MediaGridSkeleton />;
    }

    if (items.length === 0 && !isLoading) {
        return <p className="text-muted-foreground text-center col-span-full">No items found.</p>;
    }

    return (
        <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-6 gap-y-8">
                {items.map((item, index) => (
                    <PosterCard key={`${item.id}-${index}`} item={item} type={type} imageSize={imageSize} />
                ))}
                {isLoading && !initialLoading && [...Array(6)].map((_, i) => <PosterCardSkeleton key={`loading-${i}`} />)}
            </div>

            <div ref={ref} className="h-10 flex justify-center items-center mt-8">
                {isLoading && !initialLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : !hasMore && items.length > 0 ? (
                    <p className="text-muted-foreground">You've reached the end.</p>
                ) : null}
            </div>
        </>
    );
}

export function MediaGridSkeleton({ count = 18 }: { count?: number }) {
    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-6 gap-y-8">
            {[...Array(count)].map((_, i) => <PosterCardSkeleton key={i} />)}
        </div>
    );
}


//================================================================//
// 5. STAR RATING (From src/components/StarRating.tsx)
//================================================================//

type StarRatingProps = {
  rating: number; // Rating out of 10
  className?: string;
};

export const StarRating = React.memo(function StarRating({ rating, className }: StarRatingProps) {
  if (rating === 0) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Star className="w-4 h-4 text-yellow-400 fill-current" />
      <span className="text-sm font-bold text-foreground">{rating.toFixed(1)}</span>
    </div>
  );
});
