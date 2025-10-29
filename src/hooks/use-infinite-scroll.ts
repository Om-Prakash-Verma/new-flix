
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type FetcherFunction<T> = (page: number) => Promise<{ results: T[], total_pages: number }>;

export function useInfiniteScroll<T>(fetcher: FetcherFunction<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const hasMore = page < totalPages;

  const loadMore = useCallback(async (isInitial = false) => {
    if (isLoading || (!isInitial && !hasMore)) {
        return;
    }

    setIsLoading(true);
    if (isInitial) {
        setIsInitialLoading(true);
    }
    const nextPage = isInitial ? 1 : page + 1;
    try {
      const { results: newItems, total_pages } = await fetcherRef.current(nextPage);
      setItems(prevItems => isInitial ? newItems : [...prevItems, ...newItems]);
      setPage(nextPage);
      setTotalPages(total_pages);
    } catch(error) {
        console.error("Failed to fetch more items", error);
    } finally {
      setIsLoading(false);
      if (isInitial) {
        setIsInitialLoading(false);
      }
    }
  }, [isLoading, hasMore, page]);

  // Effect for intersection observer
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasMore) return;
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      // Trigger fetch when user is within 1.5 screen heights from the bottom
      if (scrollTop + clientHeight >= scrollHeight - (1.5 * clientHeight)) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, isLoading, hasMore]);

  // Initial load effect, runs only when the fetcher function identity changes
  useEffect(() => {
    setItems([]);
    setPage(0);
    setTotalPages(1);
    setIsInitialLoading(true);
    setIsLoading(false); // Reset loading state
    loadMore(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher]);


  return { items, isLoading, hasMore, isInitialLoading };
}
