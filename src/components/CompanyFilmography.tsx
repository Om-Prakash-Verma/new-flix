
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { discoverMoviesByCompany, discoverTVByCompany } from '@/lib/tmdb';
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { MediaListItem, MediaListItemSkeleton } from '@/components/MediaListItem';
import { Loader2 } from 'lucide-react';
import { MediaList, MediaListSkeleton } from './MediaList';

type CompanyFilmographyProps = {
  companyId: number;
};

type MediaItem = (Movie & { media_type: 'movie' }) | (TVShow & { media_type: 'tv' });

export function CompanyFilmography({ companyId }: CompanyFilmographyProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [moviePage, setMoviePage] = useState(1);
  const [tvPage, setTvPage] = useState(1);
  const [hasMoreMovies, setHasMoreMovies] = useState(true);
  const [hasMoreTv, setHasMoreTv] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const { ref, inView } = useInView({ threshold: 0.5 });
  const isFetching = useRef(false);

  const fetcher = useCallback(async (page: number) => {
    // This fetcher is a bit different as it fetches from two sources (movies and tv)
    // We'll use the page to alternate between fetching movies and tv shows
    const moviePageToFetch = Math.floor(page / 2) + 1;
    const tvPageToFetch = Math.floor((page + 1) / 2);

    const [movieData, tvData] = await Promise.all([
      discoverMoviesByCompany(companyId, moviePageToFetch),
      discoverTVByCompany(companyId, tvPageToFetch),
    ]);

    const combinedResults = [
      ...movieData.results.map(item => ({ ...item, media_type: 'movie' as const })),
      ...tvData.results.map(item => ({ ...item, media_type: 'tv' as const }))
    ];

    return {
      results: combinedResults,
      total_pages: Math.max(movieData.total_pages, tvData.total_pages) * 2
    };

  }, [companyId]);

  const loadMore = useCallback(async () => {
    if (isFetching.current || (!hasMoreMovies && !hasMoreTv)) return;

    isFetching.current = true;
    setIsLoading(true);

    try {
      const [movieData, tvData] = await Promise.all([
        hasMoreMovies ? discoverMoviesByCompany(companyId, moviePage) : Promise.resolve(null),
        hasMoreTv ? discoverTVByCompany(companyId, tvPage) : Promise.resolve(null),
      ]);

      let newItems: MediaItem[] = [];
      let newHasMoreMovies = hasMoreMovies;
      let newHasMoreTv = hasMoreTv;
      let nextMoviePage = moviePage;
      let nextTvPage = tvPage;

      if (movieData && movieData.results.length > 0) {
        newItems.push(...movieData.results.map(m => ({ ...m, media_type: 'movie' as const })));
        nextMoviePage = moviePage + 1;
        newHasMoreMovies = moviePage < movieData.total_pages;
      } else {
        newHasMoreMovies = false;
      }

      if (tvData && tvData.results.length > 0) {
        newItems.push(...tvData.results.map(t => ({ ...t, media_type: 'tv' as const })));
        nextTvPage = tvPage + 1;
        newHasMoreTv = tvPage < tvData.total_pages;
      } else {
        newHasMoreTv = false;
      }

      if (newItems.length > 0) {
        setItems(prev => {
          const all = [...prev, ...newItems];
          const unique = all.filter((item, index, self) =>
            index === self.findIndex(t => t.id === item.id && t.media_type === item.media_type)
          );
          return unique.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        });
      }

      setMoviePage(nextMoviePage);
      setTvPage(nextTvPage);
      setHasMoreMovies(newHasMoreMovies);
      setHasMoreTv(newHasMoreTv);

    } catch (error) {
      console.error("Failed to fetch company filmography", error);
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [companyId, moviePage, tvPage, hasMoreMovies, hasMoreTv]);

  // Use a ref to hold the loadMore function to avoid re-triggering the effect
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;

  useEffect(() => {
    loadMoreRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial load

  useEffect(() => {
    if (inView && !isLoading) {
      loadMoreRef.current();
    }
  }, [inView, isLoading]);

  if (items.length === 0 && isLoading) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-4">Filmography</h2>
        <div className="max-w-4xl mx-auto">
          <MediaListSkeleton />
        </div>
      </section>
    );
  }

  if (items.length === 0 && !isLoading) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-4">Filmography</h2>
        <p className="text-muted-foreground text-center">No movies or TV shows found for this company.</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Filmography</h2>
      <div className="max-w-4xl mx-auto">
        <MediaList
          initialItems={items}
        />
      </div>
    </section>
  );
}