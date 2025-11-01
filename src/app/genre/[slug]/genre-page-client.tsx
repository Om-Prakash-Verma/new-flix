
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { fetchMediaByGenre as fetcher } from '@/lib/actions';
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { MediaListItem, MediaListItemSkeleton, MediaListSkeleton } from '@/components/media';
import { Skeleton } from '@/components/ui/skeleton';

type MediaItem = Movie | TVShow;

type GenrePageContentProps = {
    genreId: string;
    genreName: string;
    initialData: MediaItem[];
    totalPages: number;
}

export function GenrePageContent({ genreId, genreName, initialData, totalPages: initialTotalPages }: GenrePageContentProps) {
  return (
    <div className="py-8 px-4 sm:px-8">
      {genreId ? (
        <>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">
              <span className="text-primary">{genreName}</span> Movies & TV Shows
            </h1>
            <GenreResults 
                genreId={genreId} 
                initialData={initialData}
                initialTotalPages={initialTotalPages}
            />
          </div>
        </>
      ) : (
        <div className="py-12 text-center min-h-[60vh] flex flex-col justify-center px-4 sm:px-8">
            <h1 className="text-3xl font-bold">Genre Not Found</h1>
            <p className="text-muted-foreground mt-2">Could not find movies or TV shows for this genre.</p>
        </div>
      )}
    </div>
  );
}

export function GenrePageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8">
             <Skeleton className="h-10 w-1/2 mb-8" />
             <div className="flex flex-col gap-4">
                {[...Array(8)].map((_, i) => <Skeleton key={`skel-${i}`} className="h-[182px] w-full" />)}
            </div>
        </div>
    )
}

function GenreResults({ genreId, initialData, initialTotalPages }: { genreId: string, initialData: MediaItem[], initialTotalPages: number }) {
  const [items, setItems] = useState<MediaItem[]>(initialData);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  const hasMore = page < totalPages;
  const isInitialLoading = false; // Data is pre-fetched

  const loadItems = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = page + 1;

    try {
      const data = await fetcher({ genreId, page: nextPage });
      setItems(prev => {
        const newItems = data.results.filter(
          (newItem) => !prev.some(existingItem => existingItem.id === newItem.id)
        );
        return [...prev, ...newItems];
      });
      setPage(nextPage);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Failed to fetch genre results", error);
    } finally {
      setIsLoading(false);
    }
  }, [genreId, isLoading, hasMore, page]);

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
    return <p className="text-muted-foreground">No movies or TV shows found for this genre.</p>;
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
