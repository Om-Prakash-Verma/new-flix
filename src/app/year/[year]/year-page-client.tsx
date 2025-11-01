
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { fetchMediaByYear as fetcher } from '@/lib/actions';
import { MediaListItem, MediaListItemSkeleton, MediaListSkeleton } from '@/components/media';
import { Skeleton } from '@/components/ui/skeleton';

type MediaItem = Movie | TVShow;

type YearPageContentProps = {
    year: string;
    initialData: MediaItem[];
    totalPages: number;
}

export function YearPageContent({ year, initialData, totalPages: initialTotalPages }: YearPageContentProps) {

  return (
    <div className="py-8 px-4 sm:px-8">
      {year && /^\d{4}$/.test(year) ? (
        <>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">
              Movies & TV Shows from <span className="text-primary">{year}</span>
            </h1>
            <YearResults 
                year={year} 
                initialData={initialData}
                initialTotalPages={initialTotalPages}
            />
          </div>
        </>
      ) : (
        <div className="py-12 text-center min-h-[60vh] flex flex-col justify-center px-4 sm:px-8">
            <h1 className="text-3xl font-bold">Invalid Year</h1>
            <p className="text-muted-foreground mt-2">Please provide a valid year to browse content.</p>
        </div>
      )}
    </div>
  );
}

export function YearPageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8">
             <Skeleton className="h-10 w-1/2 mb-8" />
             <MediaListSkeleton />
        </div>
    )
}

function YearResults({ year, initialData, initialTotalPages }: { year: string, initialData: MediaItem[], initialTotalPages: number }) {
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
      const data = await fetcher({ year, page: nextPage });
      setItems(prev => {
        const newItems = data.results.filter(
          (newItem) => !prev.some(existingItem => existingItem.id === newItem.id)
        );
        return [...prev, ...newItems];
      });
      setPage(nextPage);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Failed to fetch year results", error);
    } finally {
      setIsLoading(false);
    }
  }, [year, isLoading, hasMore, page]);

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
    return <p className="text-muted-foreground">No movies or TV shows found for {year}.</p>;
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
