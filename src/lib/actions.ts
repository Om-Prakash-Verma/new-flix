
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


export async function searchMulti(query: string, page = 1) {
    const schema = pagedResponseSchema(searchResultSchema);
    const data = await fetchTMDB('search/multi', { query, page: String(page) }, schema);
    
    if (!data) {
      return { results: [], total_pages: 0, page: 1, total_results: 0 };
    }
  
    // Filter out people from the search results, as we only want movies and TV shows
    data.results = data.results.filter(item => item.media_type !== 'person');
  
    return data;
}
