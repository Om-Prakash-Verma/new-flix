'use server';

import { getSeasonDetails as getSeasonDetailsFromApi, getExternalIds as getExternalIdsFromApi, getMovieRecommendations, getTvRecommendations, getMovieReviews, getTvReviews } from '@/lib/tmdb';

export async function getSeasonDetails(tvId: string | number, seasonNumber: number) {
  return getSeasonDetailsFromApi(tvId, seasonNumber);
}

export async function getExternalIds(mediaType: 'movie' | 'tv', tmdbId: string | number) {
  return getExternalIdsFromApi(mediaType, tmdbId);
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
