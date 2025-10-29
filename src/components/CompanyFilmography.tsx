
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { discoverMoviesByCompany, discoverTVByCompany } from '@/lib/tmdb-client';
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { MediaGrid, MediaGridSkeleton } from '@/components/MediaGrid';
import { Loader2 } from 'lucide-react';

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

  const hasMore = hasMoreMovies || hasMoreTv;

  if (items.length === 0 && isLoading) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-4">Filmography</h2>
        <MediaGridSkeleton />
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
      <MediaGrid
        initialItems={items}
        type="movie"
      />
      <div ref={ref} className="h-10 flex justify-center items-center mt-8">
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : !hasMore && items.length > 0 ? (
          <p className="text-muted-foreground">You've reached the end.</p>
        ) : null}
      </div>
    </section>
  );
}
