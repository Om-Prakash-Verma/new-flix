
'use server';

import { discoverMovies, discoverTVShows } from "@/lib/tmdb";
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
