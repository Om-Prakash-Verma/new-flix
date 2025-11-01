
'use client';

import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { fetchMediaByGenre } from '@/lib/tmdb';
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { MediaListItem, MediaListItemSkeleton, MediaListSkeleton } from '@/components/media';
import { extractIdFromSlug } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { siteConfig } from '@/config/site';

export const runtime = 'edge';

type MediaItem = Movie | TVShow;

function GenrePageContent() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const genreId = extractIdFromSlug(slug);
  const genreName = slug.split('-').slice(0, -1).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="py-8 px-4 sm:px-8">
      {genreId ? (
        <>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">
              <span className="text-primary">{genreName}</span> Movies & TV Shows
            </h1>
            <GenreResults genreId={genreId} />
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

export default function GenrePage() {
    return (
        <Suspense fallback={<GenrePageSkeleton />}>
            <GenrePageContent />
        </Suspense>
    )
}

function GenrePageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8">
             <Skeleton className="h-10 w-1/2 mb-8" />
             <div className="flex flex-col gap-4">
                {[...Array(8)].map((_, i) => <Skeleton key={`skel-${i}`} className="h-[182px] w-full" />)}
            </div>
        </div>
    )
}

function GenreResults({ genreId }: { genreId: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  const hasMore = page < totalPages;

  const loadItems = useCallback(async (isNewQuery = false) => {
    if (isLoading || (!hasMore && !isNewQuery)) return;

    setIsLoading(true);
    if (isNewQuery) {
      setItems([]);
      setPage(0);
    }
    const nextPage = isNewQuery ? 1 : page + 1;

    try {
      const data = await fetchMediaByGenre({ genreId, page: nextPage });
      setItems(prev => {
        const newItems = data.results.filter(
          (newItem) => !prev.some(existingItem => existingItem.id === newItem.id)
        );
        const combined = isNewQuery ? data.results : [...prev, ...newItems];
        return combined.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      });
      setPage(nextPage);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Failed to fetch genre results", error);
    } finally {
      setIsLoading(false);
      if (isNewQuery) setIsInitialLoading(false);
    }
  }, [genreId, isLoading, hasMore, page]);

  const loadItemsRef = useRef(loadItems);
  loadItemsRef.current = loadItems;

  useEffect(() => {
    setIsInitialLoading(true);
    loadItemsRef.current(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genreId]);

  useEffect(() => {
    if (inView && !isLoading) {
      loadItemsRef.current();
    }
  }, [inView, isLoading]);

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
