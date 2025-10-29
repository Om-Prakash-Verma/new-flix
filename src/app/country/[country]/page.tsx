
'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { fetchMediaByCountry } from '@/actions/discover';
import { getCountryName } from '@/lib/tmdb';
import { MediaListItem, MediaListItemSkeleton } from '@/components/MediaListItem';
import { Skeleton } from '@/components/ui/skeleton';
import { MediaListSkeleton } from '@/components/MediaList';
import { siteConfig } from '@/config/site';

type MediaItem = Movie | TVShow;

function CountryPageContent() {
  const params = useParams();
  const countryCode = Array.isArray(params.country) ? params.country[0] : params.country;
  const [countryName, setCountryName] = useState('');

  useEffect(() => {
    async function fetchCountryName() {
        if (countryCode) {
            const name = await getCountryName(countryCode);
            setCountryName(name || countryCode);
        }
    }
    fetchCountryName();
  }, [countryCode]);

  return (
    <div className="py-8 px-4 sm:px-8">
      {countryCode ? (
        <>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">
              Movies & TV Shows from <span className="text-primary">{countryName || <Skeleton className="inline-block h-9 w-32" />}</span>
            </h1>
            <CountryResults countryCode={countryCode} />
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

export default function CountryPage() {
    return (
        <Suspense fallback={<CountryPageSkeleton />}>
            <CountryPageContent />
        </Suspense>
    )
}

function CountryPageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8">
             <Skeleton className="h-10 w-1/2 mb-8" />
             <MediaListSkeleton />
        </div>
    )
}

function CountryResults({ countryCode }: { countryCode: string }) {
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
      const data = await fetchMediaByCountry({ countryCode, page: nextPage });
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
      console.error("Failed to fetch country results", error);
    } finally {
      setIsLoading(false);
      if (isNewQuery) setIsInitialLoading(false);
    }
  }, [countryCode, isLoading, hasMore, page]);

  const loadItemsRef = useRef(loadItems);
  loadItemsRef.current = loadItems;

  useEffect(() => {
    setIsInitialLoading(true);
    loadItemsRef.current(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  useEffect(() => {
    if (inView && !isLoading) {
      loadItemsRef.current();
    }
  }, [inView, isLoading]);

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
