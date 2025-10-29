
import { serverList } from './serverList';

const defaultServer = serverList[0];

/**
 * Builds an embed URL for a movie.
 * @param tmdbId - The TMDB ID of the movie.
 * @returns The embed URL string.
 */
export function buildMovieEmbedUrl(tmdbId: string | number): string {
  return defaultServer.movieLink(String(tmdbId));
}

/**
 * Builds an embed URL for a TV show episode.
 * @param tmdbId - The TMDB ID of the TV show.
 * @param season - The season number.
 * @param episode - The episode number.
 * @returns The embed URL string.
 */
export function buildTvEmbedUrl(tmdbId: string | number, season: number, episode: number): string {
  return defaultServer.episodeLink(String(tmdbId), season, episode);
}
