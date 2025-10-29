
'use server';

import { discoverMoviesByGenre, discoverTVByGenre, discoverMoviesByYear, discoverTVByYear, discoverMoviesByCountry, discoverTVByCountry } from "@/lib/tmdb";
import type { Movie, TVShow } from '@/lib/tmdb-schemas';

type SortOption = 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc' | 'first_air_date.desc';

type FetchDiscoverMediaParams = {
    type: 'movie' | 'tv';
    page: number;
    filters: {
        genre?: string;
        year?: string;
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

type FetchMediaByGenreParams = {
    genreId: string;
    page: number;
}

export async function fetchMediaByGenre({ genreId, page }: FetchMediaByGenreParams): Promise<{ results: (Movie | TVShow)[], total_pages: number }> {
    const [movieData, tvData] = await Promise.all([
        discoverMoviesByGenre(genreId, page),
        discoverTVByGenre(genreId, page)
    ]);

    const results = [
        ...movieData.results,
        ...tvData.results
    ];
    
    const total_pages = Math.max(movieData.total_pages, tvData.total_pages);

    return { results, total_pages };
}

type FetchMediaByYearParams = {
    year: string;
    page: number;
}

export async function fetchMediaByYear({ year, page }: FetchMediaByYearParams): Promise<{ results: (Movie | TVShow)[], total_pages: number }> {
    const [movieData, tvData] = await Promise.all([
        discoverMoviesByYear(year, page),
        discoverTVByYear(year, page)
    ]);

    const results = [
        ...movieData.results,
        ...tvData.results
    ];
    
    const total_pages = Math.max(movieData.total_pages, tvData.total_pages);

    return { results, total_pages };
}

type FetchMediaByCountryParams = {
    countryCode: string;
    page: number;
}

export async function fetchMediaByCountry({ countryCode, page }: FetchMediaByCountryParams): Promise<{ results: (Movie | TVShow)[], total_pages: number }> {
    const [movieData, tvData] = await Promise.all([
        discoverMoviesByCountry(countryCode, page),
        discoverTVByCountry(countryCode, page)
    ]);

    const results = [
        ...movieData.results,
        ...tvData.results
    ];
    
    const total_pages = Math.max(movieData.total_pages, tvData.total_pages);

    return { results, total_pages };
}
