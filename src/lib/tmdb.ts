

import {
  movieSchema,
  tvSchema,
  pagedResponseSchema,
  searchResultSchema,
  movieDetailsSchema,
  seasonDetailsSchema,
  tvDetailsSchema,
  personDetailsSchema,
  genreDetailSchema,
  companyDetailsSchema,
  externalIdsSchema,
  watchProvidersSchema,
  collectionDetailsSchema,
  reviewSchema,
  type Movie,
  type TVShow,
  type MovieDetails,
  type TVShowDetails,
  type SeasonDetails,
  type PersonDetails,
  type CompanyDetails,
  type ExternalIds,
  type WatchProviders,
  type SearchResult,
  type CollectionDetails,
} from './tmdb-schemas';
import { z } from 'zod';

const API_KEY = process.env.TMDB_API_KEY || '67f72af3decc8346e0493120f89e5988';
const API_BASE_URL = 'https://api.themoviedb.org/3';

if (!API_KEY) {
  console.warn('TMDB_API_KEY is not defined in environment variables. The application will not be able to fetch data from TMDB.');
}

async function fetchTMDB<T>(path: string, params: Record<string, string | number> = {}, schema: z.ZodSchema<T>): Promise<T | null> {
  if (!API_KEY) return null; // Don't fetch if key is missing

  const url = new URL(`${API_BASE_URL}/${path}`);
  url.searchParams.append('api_key', API_KEY);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      console.error(`TMDB API error for path ${path}:`, await res.text());
      return null;
    }
    const data = await res.json();
    const parsed = schema.safeParse(data);
    if (parsed.success) {
      return parsed.data;
    }
    console.error(`Failed to parse TMDB data for path ${path}:`, parsed.error);
    return null;
  } catch (error) {
    console.error(`Network error when fetching TMDB path ${path}:`, error);
    return null;
  }
}

// Common function for paged responses
async function fetchPagedData<T extends z.ZodTypeAny>(path: string, params: Record<string, string | number>, itemSchema: T) {
  const schema = pagedResponseSchema(itemSchema);
  const data = await fetchTMDB(path, params, schema);
  return data ?? { results: [], total_pages: 0, page: 1, total_results: 0 };
}


// --- Server-Side Functions ---

export async function getGenres(type: 'movie' | 'tv'): Promise<Record<number, string>> {
  const data = await fetchTMDB(`genre/${type}/list`, {}, z.object({ genres: z.array(genreDetailSchema) }));
  if (!data) return {};

  return data.genres.reduce((acc, genre) => {
    acc[genre.id] = genre.name;
    return acc;
  }, {} as Record<number, string>);
}

export async function getMovieDetails(id: string | number): Promise<MovieDetails | null> {
  return fetchTMDB(`movie/${id}`, { append_to_response: 'credits,external_ids,videos,watch/providers' }, movieDetailsSchema);
}

export async function getTVShowDetails(id: string | number): Promise<TVShowDetails | null> {
  return fetchTMDB(`tv/${id}`, { append_to_response: 'credits,external_ids,videos,watch/providers' }, tvDetailsSchema);
}

export async function getSeasonDetails(tvId: string | number, seasonNumber: number): Promise<SeasonDetails | null> {
  return fetchTMDB(`tv/${tvId}/season/${seasonNumber}`, {}, seasonDetailsSchema);
}

export async function getPersonDetails(id: string | number): Promise<PersonDetails | null> {
  const data = await fetchTMDB(`person/${id}`, { append_to_response: 'combined_credits' }, personDetailsSchema);
  if (data?.combined_credits?.cast) {
    data.combined_credits.cast.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  }
  return data;
}

export async function getCompanyDetails(id: string | number): Promise<CompanyDetails | null> {
  return fetchTMDB(`company/${id}`, {}, companyDetailsSchema);
}

export async function getExternalIds(mediaType: 'movie' | 'tv', tmdbId: string | number): Promise<ExternalIds | null> {
  return fetchTMDB(`${mediaType}/${tmdbId}/external_ids`, {}, externalIdsSchema);
}

export async function getWatchProviders(mediaType: 'movie' | 'tv', tmdbId: string | number): Promise<WatchProviders | null> {
  const data = await fetchTMDB(`${mediaType}/${tmdbId}/watch/providers`, {}, watchProvidersSchema);
  return data;
}

export async function getCollectionDetails(id: string | number): Promise<CollectionDetails | null> {
  return fetchTMDB(`collection/${id}`, {}, collectionDetailsSchema);
}

// --- Paged Functions (Server-Side) ---
export const discoverMovies = (params: Record<string, string | number>) => fetchPagedData('discover/movie', params, movieSchema);
export const discoverTVShows = (params: Record<string, string | number>) => fetchPagedData('discover/tv', params, tvSchema);

export const discoverMoviesByGenre = (genreId: number | string, page = 1) => discoverMovies({ with_genres: String(genreId), page: String(page) });
export const discoverTVByGenre = (genreId: number | string, page = 1) => discoverTVShows({ with_genres: String(genreId), page: String(page) });

export const discoverMoviesByCountry = (countryCode: string, page = 1) => discoverMovies({ with_origin_country: countryCode, page: String(page) });
export const discoverTVByCountry = (countryCode: string, page = 1) => discoverTVShows({ with_origin_country: countryCode, page: String(page) });

export const discoverMoviesByYear = (year: string, page = 1) => discoverMovies({ primary_release_year: year, page: String(page) });
export const discoverTVByYear = (year: string, page = 1) => discoverTVShows({ first_air_date_year: year, page: String(page) });

export const getMovieRecommendations = (movieId: number | string, page = 1) => fetchPagedData(`movie/${movieId}/recommendations`, { page: String(page) }, movieSchema);
export const getTvRecommendations = (tvId: number | string, page = 1) => fetchPagedData(`tv/${tvId}/recommendations`, { page: String(page) }, tvSchema);

export const getMovieReviews = (movieId: number | string, page = 1) => fetchPagedData(`movie/${movieId}/reviews`, { page: String(page) }, reviewSchema);
export const getTvReviews = (tvId: number | string, page = 1) => fetchPagedData(`tv/${tvId}/reviews`, { page: String(page) }, reviewSchema);


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
            case 'genre': return discoverMoviesByGenre(id, moviePage);
            case 'year': return discoverMoviesByYear(id, moviePage);
            case 'country': return discoverMoviesByCountry(id, moviePage);
            default: return { results: [], total_pages: 0, page: 1, total_results: 0 };
        }
    };
    
    const fetchTV = async () => {
        if (page > 1 && page % 2 === 0) return { results: [], total_pages: 0, page: 1, total_results: 0 };
        switch (discoveryType) {
            case 'genre': return discoverTVByGenre(id, tvPage);
            case 'year': return discoverTVByYear(id, tvPage);
            case 'country': return discoverTVByCountry(id, tvPage);
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

// --- Functions that need client context ---

let countriesCache: Record<string, string> | null = null;
export async function getCountries(): Promise<Record<string, string>> {
  if (countriesCache) return countriesCache;

  const countrySchema = z.object({
    iso_3166_1: z.string(),
    english_name: z.string(),
  });
  const data = await fetchTMDB('configuration/countries', {}, z.array(countrySchema));
  if (!data) return {};

  const countriesMap = data.reduce((acc, country) => {
    acc[country.iso_3166_1] = country.english_name;
    return acc;
  }, {} as Record<string, string>);

  countriesCache = countriesMap;
  return countriesMap;
}

export async function getCountryName(countryCode: string): Promise<string | null> {
  const countries = await getCountries();
  return countries[countryCode] || null;
}

export async function getRandomMedia(type: 'movie' | 'tv'): Promise<Movie | TVShow | null> {
  const schema = type === 'movie' ? movieSchema : tvSchema;
  // Fetch a random page from the most popular items
  const randomPage = Math.floor(Math.random() * 20) + 1; // Pages 1-20
  const popularItems = await fetchPagedData(
    `${type}/popular`,
    { page: randomPage.toString(), 'vote_average.gte': '7' },
    schema
  );

  if (popularItems.results.length === 0) return null;

  // Pick a random item from that page
  const randomIndex = Math.floor(Math.random() * popularItems.results.length);
  return popularItems.results[randomIndex];
}

// --- Homepage All Data ---

export const fetchAllHomepageData = async () => {
  const [
    popularMovies,
    topRatedMovies,
    trendingMovies,
    popularTVShows,
    topRatedTVShows,
    trendingTVShows,
  ] = await Promise.all([
    fetchPagedData("movie/popular", { region: "US", language: "en-US" }, movieSchema),
    fetchPagedData("movie/top_rated", { region: "US", language: "en-US" }, movieSchema),
    fetchPagedData("trending/movie/week", { region: "US", language: "en-US" }, movieSchema),
    fetchPagedData("tv/popular", { language: "en-US" }, tvSchema),
    fetchPagedData("tv/top_rated", { language: "en-US" }, tvSchema),
    fetchPagedData("trending/tv/week", { language: "en-US" }, tvSchema),
  ]);

  return {
    popularMovies: popularMovies.results,
    topRatedMovies: topRatedMovies.results,
    trendingMovies: trendingMovies.results,
    popularTVShows: popularTVShows.results,
    topRatedTVShows: topRatedTVShows.results,
    trendingTVShows: trendingTVShows.results,
  };
};