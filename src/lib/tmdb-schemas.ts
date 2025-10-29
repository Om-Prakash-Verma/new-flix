

import { z } from 'zod';

// Base Schemas
export const mediaBaseSchema = z.object({
  id: z.number(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  overview: z.string(),
  vote_average: z.number(),
  genre_ids: z.array(z.number()).optional(),
  credit_id: z.string().optional(),
});

export const movieSchema = mediaBaseSchema.extend({
  title: z.string(),
  release_date: z.string(),
});
export type Movie = z.infer<typeof movieSchema>;

export const tvSchema = mediaBaseSchema.extend({
  name: z.string(),
  first_air_date: z.string(),
});
export type TVShow = z.infer<typeof tvSchema>;

export const personSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_path: z.string().nullable(),
});
export type Person = z.infer<typeof personSchema>;

export const pagedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    page: z.number(),
    results: z.array(itemSchema),
    total_pages: z.number(),
    total_results: z.number(),
  });

export const searchResultSchema = z.discriminatedUnion('media_type', [
  movieSchema.extend({ media_type: z.literal('movie') }),
  tvSchema.extend({ media_type: z.literal('tv') }),
  personSchema.extend({ media_type: z.literal('person') }),
]);
export type SearchResult = z.infer<typeof searchResultSchema>;


// Detail Schemas
export const genreDetailSchema = z.object({ id: z.number(), name: z.string() });
export const castMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_path: z.string().nullable(),
  character: z.string().optional(),
  job: z.string().optional(),
  credit_id: z.string(),
});
export type CastMember = z.infer<typeof castMemberSchema>;

export const creditsSchema = z.object({
  cast: z.array(castMemberSchema),
  crew: z.array(castMemberSchema),
});

const authorDetailsSchema = z.object({
  name: z.string(),
  username: z.string(),
  avatar_path: z.string().nullable(),
  rating: z.number().nullable(),
});

export const reviewSchema = z.object({
  id: z.string(),
  author: z.string(),
  author_details: authorDetailsSchema,
  content: z.string(),
  created_at: z.string(),
});
export type Review = z.infer<typeof reviewSchema>;

export const productionCompanySchema = z.object({
    id: z.number(),
    logo_path: z.string().nullable(),
    name: z.string(),
    origin_country: z.string(),
});
export type ProductionCompany = z.infer<typeof productionCompanySchema>;

export const companyDetailsSchema = z.object({
    id: z.number(),
    name: z.string(),
    logo_path: z.string().nullable(),
    origin_country: z.string(),
    headquarters: z.string(),
    homepage: z.string(),
    description: z.string(),
});
export type CompanyDetails = z.infer<typeof companyDetailsSchema>;

export const externalIdsSchema = z.object({
    imdb_id: z.string().nullable(),
    // Add other IDs as needed, e.g., facebook_id, instagram_id, etc.
});
export type ExternalIds = z.infer<typeof externalIdsSchema>;

export const videoSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  site: z.literal('YouTube'),
  type: z.string(), // e.g., "Trailer", "Teaser", "Featurette"
  official: z.boolean(),
});
export type Video = z.infer<typeof videoSchema>;

export const videosSchema = z.object({
  results: z.array(videoSchema),
});
export type Videos = z.infer<typeof videosSchema>;

const watchProviderSchema = z.object({
    logo_path: z.string(),
    provider_id: z.number(),
    provider_name: z.string(),
});
export type WatchProvider = z.infer<typeof watchProviderSchema>;

export const watchProvidersSchema = z.object({
    id: z.number().optional(),
    results: z.record(z.object({
        link: z.string(),
        free: z.array(watchProviderSchema).optional(),
        // We only care about free providers for now
        // flatrate: z.array(watchProviderSchema).optional(),
        // rent: z.array(watchProviderSchema).optional(),
        // buy: z.array(watchProviderSchema).optional(),
    })),
});
export type WatchProviders = z.infer<typeof watchProvidersSchema>;

export const movieDetailsSchema = movieSchema.extend({
  genres: z.array(genreDetailSchema),
  runtime: z.number().nullable(),
  credits: creditsSchema,
  recommendations: pagedResponseSchema(movieSchema).optional(),
  reviews: pagedResponseSchema(reviewSchema).optional(),
  production_companies: z.array(productionCompanySchema),
  budget: z.number(),
  revenue: z.number(),
  status: z.string(),
  tagline: z.string().nullable(),
  origin_country: z.array(z.string()).optional(),
  external_ids: externalIdsSchema.optional(),
  videos: videosSchema.optional(),
  'watch/providers': watchProvidersSchema.optional(),
});
export type MovieDetails = z.infer<typeof movieDetailsSchema>;

export const seasonSchema = z.object({
  air_date: z.string().nullable(),
  episode_count: z.number().optional(),
  id: z.number(),
  name: z.string(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  season_number: z.number(),
});
export type Season = z.infer<typeof seasonSchema>;

export const episodeSchema = z.object({
    id: z.number(),
    name: z.string(),
    overview: z.string(),
    episode_number: z.number(),
    still_path: z.string().nullable(),
    vote_average: z.number(),
    vote_count: z.number(),
});
export type Episode = z.infer<typeof episodeSchema>;

export const seasonDetailsSchema = seasonSchema.extend({
    episodes: z.array(episodeSchema),
});
export type SeasonDetails = z.infer<typeof seasonDetailsSchema>;

export const tvDetailsSchema = tvSchema.extend({
  genres: z.array(genreDetailSchema),
  episode_run_time: z.array(z.number()),
  seasons: z.array(seasonSchema),
  credits: creditsSchema,
  recommendations: pagedResponseSchema(tvSchema).optional(),
  reviews: pagedResponseSchema(reviewSchema).optional(),
  production_companies: z.array(productionCompanySchema),
  status: z.string(),
  origin_country: z.array(z.string()).optional(),
  external_ids: externalIdsSchema.optional(),
  videos: videosSchema.optional(),
  'watch/providers': watchProvidersSchema.optional(),
});
export type TVShowDetails = z.infer<typeof tvDetailsSchema>;

export const personCombinedCreditsCastSchema = z.union([
    movieSchema.extend({ media_type: z.literal('movie'), character: z.string().optional() }),
    tvSchema.extend({ media_type: z.literal('tv'), character: z.string().optional() }),
]);
export type PersonCombinedCreditsCast = z.infer<typeof personCombinedCreditsCastSchema>;
  
export const personDetailsSchema = personSchema.extend({
    biography: z.string(),
    birthday: z.string().nullable(),
    place_of_birth: z.string().nullable(),
    known_for_department: z.string(),
    combined_credits: z.object({
        cast: z.array(personCombinedCreditsCastSchema).optional(),
    }).optional(),
});
export type PersonDetails = z.infer<typeof personDetailsSchema>;

export const collectionDetailsSchema = z.object({
    id: z.number(),
    name: z.string(),
    overview: z.string(),
    poster_path: z.string().nullable(),
    backdrop_path: z.string().nullable(),
    parts: z.array(movieSchema),
});
export type CollectionDetails = z.infer<typeof collectionDetailsSchema>;
