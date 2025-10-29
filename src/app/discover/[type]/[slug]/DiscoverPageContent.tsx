
'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { fetchCombinedMedia as fetchCombinedMediaClient } from "@/lib/tmdb-client";
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { MediaListItem, MediaListItemSkeleton } from '@/components/MediaListItem';
import { useInView } from 'react-intersection-observer';
import type { PageData } from './page';

type DiscoverPageContentProps = {
    params: {
        type: 'genre' | 'year' | 'country';
        slug: string;
    };
    pageData: PageData;
    initialItems: { results: (Movie | TVShow)[]; total_pages: number; };
};

export function DiscoverPageContent({ params, pageData, initialItems }: DiscoverPageContentProps) {
  const { type, slug } = params;
  
  const [items, setItems] = useState<(Movie | TVShow)[]>(initialItems.results);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialItems.total_pages);
  const [isLoading, setIsLoading] = useState(false);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  const isFetching = useRef(false);
  const hasMore = page < totalPages;
  
  const loadMoreItems = useCallback(async () => {
    if (isFetching.current || !hasMore) return;

    isFetching.current = true;
    setIsLoading(true);
    const nextPage = page + 1;
    
    try {
        const data = await fetchCombinedMediaClient({ discoveryType: type, id: pageData.id, page: nextPage });
        setItems(prev => {
            const newItems = data.results.filter(
                (newItem) => !prev.some(existingItem => existingItem.id === newItem.id)
            );
            return [...prev, ...newItems];
        });
        setPage(nextPage);
        setTotalPages(data.total_pages);
    } catch (error) {
        console.error("Failed to fetch discovery results", error);
    } finally {
        setIsLoading(false);
        isFetching.current = false;
    }
  }, [page, hasMore, type, pageData.id]);


  useEffect(() => {
    if (inView && !isLoading) {
        loadMoreItems();
    }
  }, [inView, isLoading, loadMoreItems]);
  
  const noResults = items.length === 0 && !isLoading;

  return (
    <div className="py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">
                <span className="text-muted-foreground capitalize">{type}:</span> {pageData.name}
            </h1>

            {noResults && <p className="text-muted-foreground">No results found.</p>}

            <div className="flex flex-col gap-4">
                {items.map((item) => (
                     <MediaListItem key={`${item.id}`} item={item} type={'title' in item ? 'movie' : 'tv'} prefetch={false} />
                ))}
                {(isLoading && hasMore) && (
                    <>
                        <MediaListItemSkeleton />
                        <MediaListItemSkeleton />
                    </>
                )}
            </div>
            <div ref={loadMoreRef} className="h-10" />
        </div>
    </div>
  );
}
