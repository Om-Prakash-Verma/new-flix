'use server';

import { discoverMovies, discoverTVShows, discoverMoviesByGenre, discoverTVByGenre, discoverMoviesByYear, discoverTVByYear, discoverMoviesByCountry, discoverTVByCountry } from "@/lib/tmdb";
import type { Movie, TVShow } from '@/lib/tmdb-schemas';

type SortOption = 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc' | 'first_air_date.desc';

type FetchDiscoverMediaParams = {
    type: 'movie' | 'tv';
    page: number;
    filters: {
        genre: string;
        year: string;
        sort: SortOption;
    }
};

type FetchMediaParams = {
    discoveryType: 'genre' | 'year' | 'country';
    id: string;
    page: number;
};

export async function fetchDiscoverMedia({ type, page, filters }: FetchDiscoverMediaParams): Promise<{ results: (Movie | TVShow)[], total_pages: number }> {
    const params: Record<string, string | number> = {
        page: page,
        sort_by: filters.sort,
    };
    if (filters.genre && filters.genre !== 'all') {
        params.with_genres = filters.genre;
    }
    if (filters.year && filters.year !== 'all') {
        if (type === 'movie') {
            params.primary_release_year = filters.year;
        } else {
            params.first_air_date_year = filters.year;
        }
    }

    if (type === 'movie') {
        const data = await discoverMovies(params);
        return { results: data.results, total_pages: data.total_pages };
    } else {
        const data = await discoverTVShows(params);
        return { results: data.results, total_pages: data.total_pages };
    }
}


export async function fetchCombinedMedia({discoveryType, id, page}: FetchMediaParams): Promise<{ results: (Movie | TVShow)[], total_pages: number }> {
    const moviePage = Math.floor(page / 2) + 1;
    const tvPage = Math.floor((page + 1) / 2);

    const [movieData, tvData] = await Promise.all([
        (async () => {
            switch (discoveryType) {
                case 'genre': return discoverMoviesByGenre(id, moviePage);
                case 'year': return discoverMoviesByYear(id, moviePage);
                case 'country': return discoverMoviesByCountry(id, moviePage);
                default: return { results: [], total_pages: 0, page: 1, total_results: 0 };
            }
        })(),
        (async () => {
            switch (discoveryType) {
                case 'genre': return discoverTVByGenre(id, tvPage);
                case 'year': return discoverTVByYear(id, tvPage);
                case 'country': return discoverTVByCountry(id, tvPage);
                default: return { results: [], total_pages: 0, page: 1, total_results: 0 };
            }
        })()
    ]);
    
    const combinedResults = [
        ...movieData.results.map(item => ({ ...item, media_type: 'movie' as const })),
        ...tvData.results.map(item => ({ ...item, media_type: 'tv' as const }))
    ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return { 
        results: combinedResults,
        total_pages: Math.max(movieData.total_pages, tvData.total_pages) * 2
    };
}