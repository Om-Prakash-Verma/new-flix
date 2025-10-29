
import {
  movieSchema,
  tvSchema,
  pagedResponseSchema,
  searchResultSchema,
  type Movie,
  type TVShow,
} from './tmdb-schemas';
import { z } from 'zod';

// Client-side fetch function that calls our proxy
async function fetchFromProxyAPI<T>(path: string, params: Record<string, string | number> = {}, schema: z.ZodSchema<T>): Promise<T> {
  const url = new URL(`/api/tmdb/${path}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Failed to fetch from proxy API: ${res.statusText}`);
  }
  const data = await res.json();
  const parsed = schema.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }
  throw new Error(`Failed to parse proxy API response: ${parsed.error}`);
}


// Common function for paged responses from proxy
async function fetchPagedDataFromProxy<T extends z.ZodTypeAny>(path: string, params: Record<string, string | number>, itemSchema: T) {
  const schema = pagedResponseSchema(itemSchema);
  const data = await fetchFromProxyAPI(path, params, schema);
  return data;
}

// --- Paged Functions (Client-Side using Proxy) ---
const discoverMoviesFromProxy = (params: Record<string, string | number>) => fetchPagedDataFromProxy('discover/movie', params, movieSchema);
const discoverTVShowsFromProxy = (params: Record<string, string | number>) => fetchPagedDataFromProxy('discover/tv', params, tvSchema);

export const discoverMoviesByGenreFromProxy = (genreId: number | string, page = 1) => discoverMoviesFromProxy({ with_genres: String(genreId), page: String(page) });
export const discoverTVByGenreFromProxy = (genreId: number | string, page = 1) => discoverTVShowsFromProxy({ with_genres: String(genreId), page: String(page) });

export const discoverMoviesByCountryFromProxy = (countryCode: string, page = 1) => discoverMoviesFromProxy({ with_origin_country: countryCode, page: String(page) });
export const discoverTVByCountryFromProxy = (countryCode: string, page = 1) => discoverTVShowsFromProxy({ with_origin_country: countryCode, page: String(page) });

export const discoverMoviesByYearFromProxy = (year: string, page = 1) => discoverMoviesFromProxy({ primary_release_year: year, page: String(page) });
export const discoverTVByYearFromProxy = (year: string, page = 1) => discoverTVShowsFromProxy({ first_air_date_year: year, page: String(page) });

export async function searchMulti(query: string, page: number = 1) {
  const data = await fetchPagedDataFromProxy('search/multi', { query, page: String(page) }, searchResultSchema);
  // Filter out people from the results, we only want movies and tv shows
  data.results = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  return data;
}

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
        const data = await discoverMoviesFromProxy(params);
        return { results: data.results, total_pages: data.total_pages };
    } else {
        const data = await discoverTVShowsFromProxy(params);
        return { results: data.results, total_pages: data.total_pages };
    }
}


type FetchCombinedMediaParams = {
    discoveryType: 'genre' | 'year' | 'country';
    id: string;
    page: number;
};
export async function fetchCombinedMedia({discoveryType, id, page}: FetchCombinedMediaParams): Promise<{ results: (Movie | TVShow)[], total_pages: number }> {
    const moviePage = page > 1 ? Math.ceil(page / 2) : 1;
    const tvPage = page > 1 ? Math.floor(page / 2) : 1;

    const fetchMovies = async () => {
        if (page > 1 && page % 2 !== 0) return { results: [], total_pages: 0, page: 1, total_results: 0 };
        switch (discoveryType) {
            case 'genre': return discoverMoviesByGenreFromProxy(id, moviePage);
            case 'year': return discoverMoviesByYearFromProxy(id, moviePage);
            case 'country': return discoverMoviesByCountryFromProxy(id, moviePage);
            default: return { results: [], total_pages: 0, page: 1, total_results: 0 };
        }
    };
    
    const fetchTV = async () => {
        if (page > 1 && page % 2 === 0) return { results: [], total_pages: 0, page: 1, total_results: 0 };
        switch (discoveryType) {
            case 'genre': return discoverTVByGenreFromProxy(id, tvPage);
            case 'year': return discoverTVByYearFromProxy(id, tvPage);
            case 'country': return discoverTVByCountryFromProxy(id, tvPage);
            default: return { results: [], total_pages: 0, page: 1, total_results: 0 };
        }
    };

    const [movieData, tvData] = await Promise.all([ fetchMovies(), fetchTV() ]);
    
    const combinedResults = [
        ...movieData.results.map(item => ({ ...item, media_type: 'movie' as const })),
        ...tvData.results.map(item => ({ ...item, media_type: 'tv' as const }))
    ].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    return { 
        results: combinedResults,
        total_pages: Math.max(movieData.total_pages, tvData.total_pages) * 2
    };
}

export const discoverMoviesByCompany = (companyId: string | number, page = 1) => fetchPagedDataFromProxy('discover/movie', { with_companies: String(companyId), page: String(page) }, movieSchema);
export const discoverTVByCompany = (companyId: string | number, page = 1) => fetchPagedDataFromProxy('discover/tv', { with_companies: String(companyId), page: String(page) }, tvSchema);
