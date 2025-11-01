
'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { searchMulti } from '@/lib/actions';
import type { SearchResult } from '@/lib/tmdb-schemas';
import { MediaListItem, MediaListItemSkeleton } from '@/components/media';
import { PersonListItem, PersonListItemSkeleton } from '@/components/PersonListItem';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchInput } from '@/components/SearchInput';

export const runtime = 'edge';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="py-8 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <SearchInput initialQuery={query} />
        </div>

        {query ? (
          <>
            <h1 className="text-3xl font-bold mb-8">
              Results for <span className="text-primary">&quot;{query}&quot;</span>
            </h1>
            <SearchResults query={query} />
          </>
        ) : (
          <div className="py-12 text-center min-h-[60vh] flex flex-col justify-center px-4 sm:px-8">
            <h1 className="text-3xl font-bold">Search for Movies, TV Shows, and People</h1>
            <p className="text-muted-foreground mt-2">Find your next favorite thing to watch.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageContent />
    </Suspense>
  )
}


function SearchResults({ query }: { query: string }) {
  const [items, setItems] = useState<SearchResult[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  const hasMore = page < totalPages;
  const currentQuery = useRef(query);

  const loadItems = useCallback(async (isNewQuery = false) => {
    if (isLoading || (!hasMore && !isNewQuery)) return;

    setIsLoading(true);
    if (isNewQuery) {
      setIsInitialLoading(true);
      setItems([]);
      setPage(1);
      currentQuery.current = query;
    }
    const nextPage = isNewQuery ? 1 : page + 1;

    try {
      const data = await searchMulti({ query: currentQuery.current, page: nextPage });
      setItems(prev => {
        const newItems = data.results.filter(
          (newItem) => !prev.some(existingItem => existingItem.id === newItem.id)
        );
        return isNewQuery ? newItems : [...prev, ...newItems];
      });
      setPage(nextPage);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Failed to fetch search results", error);
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  }, [query, isLoading, hasMore, page]);

  const loadItemsRef = useRef(loadItems);
  loadItemsRef.current = loadItems;

  useEffect(() => {
    loadItemsRef.current(true);
  }, [query]);

  useEffect(() => {
    if (inView && !isLoading) {
      loadItemsRef.current();
    }
  }, [inView, isLoading]);

  if (isInitialLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(3)].map((_, i) => <MediaListItemSkeleton key={i} />)}
      </div>
    );
  }

  if (items.length === 0 && !isLoading) {
    return <p className="text-muted-foreground">No results found for &quot;{query}&quot;.</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          if (item.media_type === 'movie') {
            return <MediaListItem key={`${item.media_type}-${item.id}`} item={item} type="movie" />;
          }
          if (item.media_type === 'tv') {
            return <MediaListItem key={`${item.media_type}-${item.id}`} item={item} type="tv" />;
          }
          if (item.media_type === 'person') {
            return <PersonListItem key={`${item.media_type}-${item.id}`} person={item} />;
          }
          return null;
        })}
        {(isLoading && hasMore) && (
          <>
            <MediaListItemSkeleton />
            <PersonListItemSkeleton />
            <MediaListItemSkeleton />
          </>
        )}
      </div>
      <div ref={loadMoreRef} className="h-10" />
    </>
  );
}


function SearchPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8">
      <Skeleton className="h-12 w-full mb-8" />
      <Skeleton className="h-10 w-1/2 mb-8" />
      <div className="flex flex-col gap-4">
        <MediaListItemSkeleton />
        <MediaListItemSkeleton />
        <MediaListItemSkeleton />
      </div>
    </div>
  )
}