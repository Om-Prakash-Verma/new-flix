
'use server';

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
import { redirect } from 'next/navigation';
import { slugify } from '@/lib/utils';
import { serverList } from './serverList';


// =========================================================================
// API CONFIGURATION
// =========================================================================
const API_KEY = process.env.TMDB_API_KEY || '67f72af3decc8346e0493120f89e5988';
const API_BASE_URL = 'https://api.themoviedb.org/3';

if (!API_KEY) {
  console.warn('TMDB_API_KEY is not defined in environment variables. The application will not be able to fetch data from TMDB.');
}

// =========================================================================
// CORE FETCHING LOGIC
// =========================================================================

export async function fetchTMDB<T>(path: string, params: Record<string, string | number> = {}, schema: z.ZodSchema<T>): Promise<T | null> {
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
export async function fetchPagedData<T extends z.ZodTypeAny>(path: string, params: Record<string, string | number>, itemSchema: T) {
  const schema = pagedResponseSchema(itemSchema);
  const data = await fetchTMDB(path, params, schema);
  return data ?? { results: [], total_pages: 0, page: 1, total_results: 0 };
}


// =========================================================================
// PUBLIC API FUNCTIONS (Used in Server Components & other Server Actions)
// =========================================================================

// --- Detail Fetchers ---
export async function getMovieDetails(id: string | number): Promise<MovieDetails | null> {
  return fetchTMDB(`movie/${id}`, { append_to_response: 'credits,external_ids,videos,watch/providers' }, movieDetailsSchema);
}

export async function getTVShowDetails(id: string | number): Promise<TVShowDetails | null> {
  return fetchTMDB(`tv/${id}`, { append_to_response: 'credits,external_ids,videos,watch/providers' }, tvDetailsSchema);
}

export async function getPersonDetails(id: string | number): Promise<PersonDetails | null> {
  const data = await fetchTMDB(`person/${id}`, { append_to_response: 'combined_credits' }, personDetailsSchema);
  if (data?.combined_credits?.cast) {
    data.combined_credits.cast.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  }
  return data;
}

export async function getCollectionDetails(id: string | number): Promise<CollectionDetails | null> {
  return fetchTMDB(`collection/${id}`, {}, collectionDetailsSchema);
}

export async function getCompanyDetails(id: string | number): Promise<CompanyDetails | null> {
  return fetchTMDB(`company/${id}`, {}, companyDetailsSchema);
}


// --- Homepage Data ---
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

export async function getRecentlyReleased(country?: string) {
  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);

  const baseParams: Record<string, string | number> = {
    sort_by: 'popularity.desc',
    'vote_count.gte': 50,
  };

  if (country && country !== 'all') {
    baseParams.with_origin_country = country;
  }

  const movieParams = {
    ...baseParams,
    'primary_release_date.gte': threeMonthsAgo.toISOString().split('T')[0],
    'primary_release_date.lte': today.toISOString().split('T')[0],
  }

  const tvParams = {
    ...baseParams,
    'first_air_date.gte': threeMonthsAgo.toISOString().split('T')[0],
    'first_air_date.lte': today.toISOString().split('T')[0],
  }

  const [movies, tvShows] = await Promise.all([
    fetchPagedData('discover/movie', movieParams, movieSchema),
    fetchPagedData('discover/tv', tvParams, tvSchema),
  ]);

  const combined = [...movies.results, ...tvShows.results];

  return combined.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
}

// --- Configuration Fetchers ---
export async function getGenres(type: 'movie' | 'tv'): Promise<Record<number, string>> {
  const data = await fetchTMDB(`genre/${type}/list`, {}, z.object({ genres: z.array(genreDetailSchema) }));
  if (!data) return {};

  return data.genres.reduce((acc, genre) => {
    acc[genre.id] = genre.name;
    return acc;
  }, {} as Record<number, string>);
}

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


// =========================================================================
// SERVER ACTIONS (Callable from Client Components)
// =========================================================================

export async function getSeasonDetails(tvId: string | number, seasonNumber: number): Promise<SeasonDetails | null> {
  return fetchTMDB(`tv/${tvId}/season/${seasonNumber}`, {}, seasonDetailsSchema);
}

export async function getExternalIds(mediaType: 'movie' | 'tv', tmdbId: string | number): Promise<ExternalIds | null> {
  return fetchTMDB(`${mediaType}/${tmdbId}/external_ids`, {}, externalIdsSchema);
}

export async function getMovieRecommendations(movieId: string | number, page = 1) {
  return fetchPagedData(`movie/${movieId}/recommendations`, { page }, movieSchema);
}

export async function getTvRecommendations(tvId: string | number, page = 1) {
  return fetchPagedData(`tv/${tvId}/recommendations`, { page }, tvSchema);
}

export async function getMovieReviews(movieId: string | number, page = 1) {
  return fetchPagedData(`movie/${movieId}/reviews`, { page }, reviewSchema);
}

export async function getTvReviews(tvId: string | number, page = 1) {
  return fetchPagedData(`tv/${tvId}/reviews`, { page }, reviewSchema);
}

export async function fetchRecommendations(type: 'movie' | 'tv', id: number, page: number) {
  if (type === 'movie') {
    return getMovieRecommendations(id, page);
  }
  return getTvRecommendations(id, page);
}

export async function fetchReviews(type: 'movie' | 'tv', id: number, page: number) {
  if (type === 'movie') {
    return getMovieReviews(id, page);
  }
  return getTvReviews(id, page);
}

type FetchMediaByGenreParams = {
  genreId: string;
  page: number;
}

export async function fetchMediaByGenre({ genreId, page }: FetchMediaByGenreParams): Promise<{ results: (Movie | TVShow)[], total_pages: number }> {
  const [movieData, tvData] = await Promise.all([
    fetchPagedData('discover/movie', { with_genres: String(genreId), page: String(page) }, movieSchema),
    fetchPagedData('discover/tv', { with_genres: String(genreId), page: String(page) }, tvSchema)
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
    fetchPagedData('discover/movie', { primary_release_year: year, page: String(page) }, movieSchema),
    fetchPagedData('discover/tv', { first_air_date_year: year, page: String(page) }, tvSchema)
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
    fetchPagedData('discover/movie', { with_origin_country: countryCode, page: String(page) }, movieSchema),
    fetchPagedData('discover/tv', { with_origin_country: countryCode, page: String(page) }, tvSchema)
  ]);

  const results = [
    ...movieData.results,
    ...tvData.results
  ];

  const total_pages = Math.max(movieData.total_pages, tvData.total_pages);

  return { results, total_pages };
}

type FetchMediaByCompanyParams = {
  companyId: string;
  page: number;
}

export async function fetchMediaByCompany({ companyId, page }: FetchMediaByCompanyParams): Promise<{ results: (Movie | TVShow)[], total_pages: number }> {
  const [movieData, tvData] = await Promise.all([
    fetchPagedData('discover/movie', { with_companies: String(companyId), page: String(page) }, movieSchema),
    fetchPagedData('discover/tv', { with_companies: String(companyId), page: String(page) }, tvSchema)
  ]);

  const results = [
    ...movieData.results,
    ...tvData.results
  ];

  const total_pages = Math.max(movieData.total_pages, tvData.total_pages);

  return { results, total_pages };
}


// --- From actions/surprise-me.ts ---

async function getRandomMedia(type: 'movie' | 'tv'): Promise<Movie | TVShow | null> {
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

export async function surpriseMeAction() {
  const type = Math.random() > 0.5 ? 'movie' : 'tv';
  const media = await getRandomMedia(type);

  if (media) {
    const title = 'title' in media ? media.title : media.name;
    const slug = slugify(title);
    redirect(`/${type}/${slug}-${media.id}`);
  } else {
    // Fallback redirect if no media is found
    redirect('/');
  }
}

// --- From lib/embed-fallback.ts ---

const EmbedFallbackInputSchema = z.object({
  tmdbId: z.string().describe('The TMDB ID of the movie or TV show.'),
  imdbId: z.string().optional().describe('The IMDB ID of the movie or TV show.'),
  season: z.number().optional().describe('The season number for TV shows.'),
  episode: z.number().optional().describe('The episode number for TV shows.'),
  title: z.string().describe('The title of the movie or TV show.'),
  type: z.enum(['movie', 'tv']).describe('The type of content: movie or tv show'),
  servers: z.array(z.string()).describe('A list of available server names.'),
  currentServer: z.string().describe('The server that is currently failing.'),
});
export type EmbedFallbackInput = z.infer<typeof EmbedFallbackInputSchema>;

const EmbedFallbackOutputSchema = z.object({
  nextServer: z.string().optional().describe('The name of the next suggested server to try.'),
  reasoning: z.string().describe('The reasoning behind suggesting the next server or lack thereof.'),
  embedUrl: z.string().optional().describe('A directly generated embed URL if a high-confidence alternative is found.'),
});
export type EmbedFallbackOutput = z.infer<typeof EmbedFallbackOutputSchema>;

export async function getEmbedFallback(input: EmbedFallbackInput): Promise<EmbedFallbackOutput> {
  const currentIndex = input.servers.indexOf(input.currentServer);

  if (currentIndex >= 0 && currentIndex < input.servers.length - 1) {
    const nextServer = input.servers[currentIndex + 1];
    return {
      nextServer: nextServer,
      reasoning: `The current server, ${input.currentServer}, failed. Suggesting the next available server in the list: ${nextServer}.`
    };
  }

  return {
    reasoning: 'All available servers have been tried. No further alternatives can be suggested from the list.'
  };
}