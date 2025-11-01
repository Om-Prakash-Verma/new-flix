
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { fetchMediaByCountry as fetcher } from '@/lib/actions';
import { MediaListItem, MediaListItemSkeleton, MediaListSkeleton } from '@/components/media';
import { Skeleton } from '@/components/ui/skeleton';

type MediaItem = Movie | TVShow;

type CountryPageContentProps = {
    countryCode: string;
    countryName: string | null;
    initialData: MediaItem[];
    totalPages: number;
}

export function CountryPageContent({ countryCode, countryName, initialData, totalPages: initialTotalPages }: CountryPageContentProps) {

  return (
    <div className="py-8 px-4 sm:px-8">
      {countryCode ? (
        <>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">
              Movies & TV Shows from <span className="text-primary">{countryName || <Skeleton className="inline-block h-9 w-32" />}</span>
            </h1>
            <CountryResults 
                countryCode={countryCode} 
                initialData={initialData}
                initialTotalPages={initialTotalPages}
            />
          </div>
        </>
      ) : (
        <div className="py-12 text-center min-h-[60vh] flex flex-col justify-center px-4 sm:px-8">
            <h1 className="text-3xl font-bold">Invalid Country</h1>
            <p className="text-muted-foreground mt-2">Please provide a valid country code to browse content.</p>
        </div>
      )}
    </div>
  );
}

export function CountryPageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8">
             <Skeleton className="h-10 w-1/2 mb-8" />
             <MediaListSkeleton />
        </div>
    )
}

function CountryResults({ countryCode, initialData, initialTotalPages }: { countryCode: string, initialData: MediaItem[], initialTotalPages: number }) {
  const [items, setItems] = useState<MediaItem[]>(initialData);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  const hasMore = page < totalPages;
  const isInitialLoading = false;

  const loadItems = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;

    try {
      const data = await fetcher({ countryCode, page: nextPage });
      setItems(prev => {
        const newItems = data.results.filter(
          (newItem) => !prev.some(existingItem => existingItem.id === newItem.id)
        );
        return [...prev, ...newItems];
      });
      setPage(nextPage);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Failed to fetch country results", error);
    } finally {
      setIsLoading(false);
    }
  }, [countryCode, isLoading, hasMore, page]);

  useEffect(() => {
    if (inView && !isLoading) {
      loadItems();
    }
  }, [inView, isLoading, loadItems]);
  
  useEffect(() => {
    setItems(initialData);
    setPage(1);
    setTotalPages(initialTotalPages);
  }, [initialData, initialTotalPages]);

  if (isInitialLoading) {
    return <MediaListSkeleton />;
  }

  if (items.length === 0 && !isLoading) {
    return <p className="text-muted-foreground">No movies or TV shows found for this country.</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const type = 'title' in item ? 'movie' : 'tv';
          return <MediaListItem key={`${type}-${item.id}`} item={item} type={type} />;
        })}
        {(isLoading && hasMore) && (
          <>
            <MediaListItemSkeleton />
            <MediaListItemSkeleton />
          </>
        )}
      </div>
      <div ref={loadMoreRef} className="h-10" />
    </>
  );
}
