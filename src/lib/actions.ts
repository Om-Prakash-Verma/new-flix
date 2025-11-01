
'use server';

import {
    movieSchema,
    tvSchema,
    pagedResponseSchema,
    searchResultSchema,
    type Movie,
    type TVShow,
    type SearchResult,
} from './tmdb-schemas';
import { fetchTMDB, fetchPagedData } from './tmdb';
import { z } from 'zod';

// --- From actions/discover.ts ---

type SortOption = 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc' | 'first_air_date.desc';

type FetchDiscoverMediaParams = {
    type: 'movie' | 'tv';
    page: number;
    filters: {
        genre?: string;
        year?: string;
        country?: string;
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
    if (filters.country && filters.country !== 'all') {
        params.with_origin_country = filters.country;
    }

    if (type === 'movie') {
        const data = await fetchPagedData('discover/movie', params, movieSchema);
        return { results: data.results, total_pages: data.total_pages };
    } else {
        const data = await fetchPagedData('discover/tv', params, tvSchema);
        return { results: data.results, total_pages: data.total_pages };
    }
}

// --- From actions/search.ts ---

type SearchMultiParams = {
    query: string;
    page: number;
};

export async function searchMulti({ query, page }: SearchMultiParams): Promise<{ results: SearchResult[], total_pages: number }> {
    const searchSchema = pagedResponseSchema(searchResultSchema);
    const params = {
        query,
        page,
        include_adult: 'false',
    };
    const data = await fetchTMDB('search/multi', params, searchSchema);

    if (!data) {
        return { results: [], total_pages: 0 };
    }

    // Filter out results that don't have a poster or profile path
    const filteredResults = data.results.filter(item => {
        if (item.media_type === 'person') {
            return item.profile_path;
        }
        return item.poster_path;
    });

    return { results: filteredResults, total_pages: data.total_pages };
}