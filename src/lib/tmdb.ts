

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
    // We can't use Next.js fetch cache in client components, but this function is used by server too.
    // When called from the client, it will behave like a normal fetch.
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

// Client-side fetch function that calls our proxy
async function fetchFromProxyAPI<T>(path: string, params: Record<string, string | number> = {}, schema: z.ZodSchema<T>): Promise<T> {
  const url = new URL(`/api/tmdb/${path}`, window.location.origin);
  
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


// Common function for paged responses
async function fetchPagedData<T extends z.ZodTypeAny>(path: string, params: Record<string, string | number>, itemSchema: T) {
  const schema = pagedResponseSchema(itemSchema);
  const data = await fetchTMDB(path, params, schema);
  return data ?? { results: [], total_pages: 0, page: 1, total_results: 0 };
}

// Common function for paged responses from proxy
async function fetchPagedDataFromProxy<T extends z.ZodTypeAny>(path: string, params: Record<string, string | number>, itemSchema: T) {
  const schema = pagedResponseSchema(itemSchema);
  const data = await fetchFromProxyAPI(path, params, schema);
  return data;
}

// --- Server and Client Functions ---

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

// --- Client-Side Paged Functions (using proxy) ---

export async function searchMulti(query: string, page: number = 1) {
  const data = await fetchPagedDataFromProxy('search/multi', { query, page: String(page) }, searchResultSchema);
  // Filter out people from the results, we only want movies and tv shows
  data.results = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  return data;
}

export const discoverMovies = (params: Record<string, string | number>) => fetchPagedDataFromProxy('discover/movie', params, movieSchema);
export const discoverTVShows = (params: Record<string, string | number>) => fetchPagedDataFromProxy('discover/tv', params, tvSchema);

type FetchCombinedMediaParams = {
    discoveryType: 'genre' | 'year' | 'country';
    id: string;
    page: number;
};
export async function fetchCombinedMedia({discoveryType, id, page}: FetchCombinedMediaParams): Promise<{ results: (Movie | TVShow)[], total_pages: number }> {
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


// --- Paged Functions ---
export const searchMovies = (query: string, page: number = 1) => fetchPagedData('search/movie', { query, page: String(page) }, movieSchema);
export const searchTV = (query: string, page: number = 1) => fetchPagedData('search/tv', { query, page: String(page) }, tvSchema);


export const discoverMoviesByCompany = (companyId: string | number, page = 1) => fetchPagedData('discover/movie', { with_companies: String(companyId), page: String(page) }, movieSchema);
export const discoverTVByCompany = (companyId: string | number, page = 1) => fetchPagedData('discover/tv', { with_companies: String(companyId), page: String(page) }, tvSchema);

export const discoverMoviesByGenre = (genreId: number | string, page = 1) => fetchPagedDataFromProxy('discover/movie', { with_genres: String(genreId), page: String(page) }, movieSchema);
export const discoverTVByGenre = (genreId: number | string, page = 1) => fetchPagedDataFromProxy('discover/tv', { with_genres: String(genreId), page: String(page) }, tvSchema);

export const discoverMoviesByCountry = (countryCode: string, page = 1) => fetchPagedDataFromProxy('discover/movie', { with_origin_country: countryCode, page: String(page) }, movieSchema);
export const discoverTVByCountry = (countryCode: string, page = 1) => fetchPagedDataFromProxy('discover/tv', { with_origin_country: countryCode, page: String(page) }, tvSchema);

export const discoverMoviesByYear = (year: string, page = 1, otherParams: Record<string, string> = {}) => fetchPagedDataFromProxy('discover/movie', { primary_release_year: year, page: String(page), ...otherParams }, movieSchema);
export const discoverTVByYear = (year: string, page = 1, otherParams: Record<string, string> = {}) => fetchPagedDataFromProxy('discover/tv', { first_air_date_year: year, page: String(page), ...otherParams }, tvSchema);

export const getMovieRecommendations = (movieId: number | string, page = 1) => fetchPagedData(`movie/${movieId}/recommendations`, { page: String(page) }, movieSchema);
export const getTvRecommendations = (tvId: number | string, page = 1) => fetchPagedData(`tv/${tvId}/recommendations`, { page: String(page) }, tvSchema);

export const getMovieReviews = (movieId: number | string, page = 1) => fetchPagedData(`movie/${movieId}/reviews`, { page: String(page) }, reviewSchema);
export const getTvReviews = (tvId: number | string, page = 1) => fetchPagedData(`tv/${tvId}/reviews`, { page: String(page) }, reviewSchema);


// --- Simple Array Functions ---

export async function getTrending(media_type: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week') {
  const schema = media_type === 'all' ? searchResultSchema : (media_type === 'movie' ? movieSchema : tvSchema);
  const data = await fetchPagedData(`trending/${media_type}/${timeWindow}`, {}, schema);
  return data.results;
}

export async function getPopularMovies() {
  const data = await fetchPagedData('movie/popular', {}, movieSchema);
  return data.results;
}

export async function getTopRatedMovies() {
  const data = await fetchPagedData('movie/top_rated', {}, movieSchema);
  return data.results;
}

export async function getPopularTVShows() {
  const data = await fetchPagedData('tv/popular', {}, tvSchema);
  return data.results;
}

export async function getTopRatedTVShows() {
  const data = await fetchPagedData('tv/top_rated', {}, tvSchema);
  return data.results;
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
