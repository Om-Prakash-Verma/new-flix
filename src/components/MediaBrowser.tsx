
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { fetchDiscoverMedia } from "@/actions/discover";
import { MediaGrid } from "@/components/MediaGrid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Movie, TVShow } from '@/lib/tmdb-schemas';

type SortOption = 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc' | 'first_air_date.desc';

type MediaBrowserProps = {
  title: string;
  type: 'movie' | 'tv';
  genres: Record<number, string>;
};

export function MediaBrowser({ title, type, genres }: MediaBrowserProps) {
  const [filters, setFilters] = useState({
    genre: 'all',
    year: 'all',
    sort: 'popularity.desc' as SortOption
  });

  const [items, setItems] = useState<(Movie | TVShow)[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

  const loadInitialItems = useCallback((currentFilters: typeof filters) => {
    setIsInitialLoading(true);
    startTransition(async () => {
      try {
        const data = await fetchDiscoverMedia({
          type,
          page: 1,
          filters: currentFilters
        });
        setItems(data.results);
        setPage(1);
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error("Failed to fetch initial items", error);
      } finally {
        setIsInitialLoading(false);
      }
    });
  }, [type]);

  useEffect(() => {
    // Load initial items when the component mounts
    loadInitialItems(filters);
  }, [loadInitialItems]);


  const handleFilterChange = <K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    loadInitialItems(newFilters);
  };
  
  const fetcher = useCallback(async (nextPage: number) => {
      const data = await fetchDiscoverMedia({
        type,
        page: nextPage,
        filters,
      });
      return data.results;
  }, [type, filters]);

  const sortOptions = type === 'movie' ? [
    { value: 'popularity.desc', label: 'Popularity' },
    { value: 'vote_average.desc', label: 'Rating' },
    { value: 'primary_release_date.desc', label: 'Release Date' }
  ] : [
    { value: 'popularity.desc', label: 'Popularity' },
    { value: 'vote_average.desc', label: 'Rating' },
    { value: 'first_air_date.desc', label: 'Release Date' }
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold">{title}</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="grid w-full gap-1.5">
                <Label htmlFor="sort-by" className="text-muted-foreground">Sort By</Label>
                <Select value={filters.sort} onValueChange={(value) => handleFilterChange('sort', value as SortOption)}>
                    <SelectTrigger className="w-full md:w-[180px] bg-secondary border-border" id="sort-by">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        {sortOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="grid w-full gap-1.5">
                <Label htmlFor="genre" className="text-muted-foreground">Genre</Label>
                <Select value={filters.genre} onValueChange={(value) => handleFilterChange('genre', value)}>
                    <SelectTrigger className="w-full md:w-[180px] bg-secondary border-border" id="genre">
                        <SelectValue placeholder="All Genres" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Genres</SelectItem>
                        {Object.entries(genres).map(([id, name]) => (
                            <SelectItem key={id} value={id}>{name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="grid w-full gap-1.5">
                <Label htmlFor="year" className="text-muted-foreground">Year</Label>
                <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                    <SelectTrigger className="w-full md:w-[180px] bg-secondary border-border" id="year">
                        <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {years.map(year => (
                            <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>
      
      <MediaGrid 
          initialItems={items} 
          type={type}
          initialLoading={isInitialLoading || isPending}
          imageSize="w342"
          fetcher={fetcher}
          initialPage={page}
          totalPages={totalPages}
      />
    </>
  );
}
