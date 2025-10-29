'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { fetchMediaByGenre } from '@/actions/discover';
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { MediaListItem, MediaListItemSkeleton } from '@/components/MediaListItem';
import { MediaListSkeleton } from './MediaList';

type GenreResultsProps = {
  genreId: string;
};

type MediaItem = Movie | TVShow;

export function GenreResults({ genreId }: GenreResultsProps) {
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
