

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
  externalIdsSchema,
  watchProvidersSchema,
  collectionDetailsSchema,
  reviewSchema,
  companyDetailsSchema,
  type Movie,
  type TVShow,
  type MovieDetails,
  type TVShowDetails,
  type SeasonDetails,
  type PersonDetails,
  type ExternalIds,
  type WatchProviders,
  type SearchResult,
  type CollectionDetails,
  type CompanyDetails,
} from './tmdb-schemas';
import { z } from 'zod';
import { subMonths } from 'date-fns';

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

export async function getCompanyDetails(id: string | number): Promise<CompanyDetails | null> {
  return fetchTMDB(`company/${id}`, {}, companyDetailsSchema);
}

// --- Paged Functions ---
export async function searchMulti(query: string, page: number = 1) {
  const data = await fetchPagedData('search/multi', { query, page: String(page) }, searchResultSchema);
  // Filter out people from the results, we only want movies and tv shows
  data.results = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  return data;
}
export const searchMovies = (query: string, page: number = 1) => fetchPagedData('search/movie', { query, page: String(page) }, movieSchema);
export const searchTV = (query: string, page: number = 1) => fetchPagedData('search/tv', { query, page: String(page) }, tvSchema);

export const discoverMovies = (params: Record<string, string | number>) => fetchPagedData('discover/movie', params, movieSchema);
export const discoverTVShows = (params: Record<string, string | number>) => fetchPagedData('discover/tv', params, tvSchema);

export const discoverMoviesByGenre = (genreId: number | string, page = 1) => fetchPagedData('discover/movie', { with_genres: String(genreId), page: String(page) }, movieSchema);
export const discoverTVByGenre = (genreId: number | string, page = 1) => fetchPagedData('discover/tv', { with_genres: String(genreId), page: String(page) }, tvSchema);

export const discoverMoviesByCountry = (countryCode: string, page = 1) => fetchPagedData('discover/movie', { with_origin_country: countryCode, page: String(page) }, movieSchema);
export const discoverTVByCountry = (countryCode: string, page = 1) => fetchPagedData('discover/tv', { with_origin_country: countryCode, page: String(page) }, tvSchema);

export const discoverMoviesByCompany = (companyId: number | string, page = 1) => fetchPagedData('discover/movie', { with_companies: String(companyId), page: String(page) }, movieSchema);
export const discoverTVByCompany = (companyId: number | string, page = 1) => fetchPagedData('discover/tv', { with_companies: String(companyId), page: String(page) }, tvSchema);

export const discoverMoviesByYear = (year: string, page = 1, otherParams: Record<string, string> = {}) => fetchPagedData('discover/movie', { primary_release_year: year, page: String(page), ...otherParams }, movieSchema);
export const discoverTVByYear = (year: string, page = 1, otherParams: Record<string, string> = {}) => fetchPagedData('discover/tv', { first_air_date_year: year, page: String(page), ...otherParams }, tvSchema);

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

export async function getRecentlyReleased(country?: string) {
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);

  const params: Record<string, string | number> = {
    'primary_release_date.gte': threeMonthsAgo.toISOString().split('T')[0],
    'primary_release_date.lte': today.toISOString().split('T')[0],
    sort_by: 'popularity.desc',
    'vote_count.gte': 50,
  };

  if (country && country !== 'all') {
    params.region = country;
  }

  const [movies, tvShows] = await Promise.all([
    fetchPagedData('discover/movie', params, movieSchema),
    fetchPagedData('discover/tv', { ...params, 'first_air_date.gte': params['primary_release_date.gte'], 'first_air_date.lte': params['primary_release_date.lte'] }, tvSchema),
  ]);

  const combined = [...movies.results, ...tvShows.results];

  return combined.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
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
