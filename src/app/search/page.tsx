
'use client';

import { Suspense, useCallback, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchMulti } from '@/lib/tmdb';
import type { SearchResult } from '@/lib/tmdb-schemas';
import { MediaListItem, MediaListItemSkeleton } from '@/components/media';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';
import { siteConfig } from '@/config/site';

// Note: This page remains a client component because it relies heavily on the `useSearchParams` hook,
// which must be used in a client component. The data fetching itself is optimized.

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="py-8 px-4 sm:px-8">
      {query ? (
        <>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">
              Search Results for <span className="text-primary">"{query}"</span>
            </h1>
            <SearchResults query={query} />
          </div>
        </>
      ) : (
        <div className="py-12 text-center min-h-[60vh] flex flex-col justify-center px-4 sm:px-8">
            <h1 className="text-3xl font-bold">Search {siteConfig.name}</h1>
            <p className="text-muted-foreground mt-2">Find your next favorite movie or TV show.</p>
        </div>
      )}
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

function SearchPageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8">
             <Skeleton className="h-10 w-1/2 mb-8" />
             <SearchResultsSkeleton />
        </div>
    )
}

function SearchResults({ query }: { query: string }) {
  const [items, setItems] = useState<SearchResult[]>([]);
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
        setPage(0); // This will be incremented to 1 for the first fetch
    }
    const nextPage = isNewQuery ? 1 : page + 1;
    
    try {
        const data = await searchMulti(query, nextPage);
        setItems(prev => {
            const newItems = data.results.filter(
                (newItem) => !prev.some(existingItem => existingItem.id === newItem.id && existingItem.media_type === newItem.media_type)
            );
            return isNewQuery ? data.results : [...prev, ...newItems];
        });
        setPage(nextPage);
        setTotalPages(data.total_pages);
    } catch (error) {
        console.error("Failed to fetch search results", error);
    } finally {
        setIsLoading(false);
        if (isNewQuery) setIsInitialLoading(false);
    }
  }, [query, isLoading, hasMore, page]);

  const loadItemsRef = useRef(loadItems);
  loadItemsRef.current = loadItems;

  useEffect(() => {
    // Reset and fetch for new query
    setIsInitialLoading(true);
    loadItemsRef.current(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (inView && !isLoading) {
        loadItemsRef.current();
    }
  }, [inView, isLoading]);
  
  if (isInitialLoading) {
    return <SearchResultsSkeleton />;
  }
  
  const noResults = items.length === 0 && !isLoading;

  if (noResults) {
    return <p className="text-muted-foreground">No results found for "{query}".</p>;
  }

  return (
    <>
        <div className="flex flex-col gap-4">
            {items.map((item) => (
                <MediaListItem key={`${item.media_type}-${item.id}`} item={item} type={item.media_type as 'movie' | 'tv'} />
            ))}
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

function SearchResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
        {[...Array(8)].map((_, i) => <MediaListItemSkeleton key={`skel-${i}`} />)}
    </div>
  );
}
