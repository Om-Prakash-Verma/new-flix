'use server';

/**
 * @fileOverview This file contains logic for providing a functional video embed, even if the default video link is broken or unavailable.
 *
 * - `getEmbedFallback` - A function that handles the process of finding a fallback video embed.
 * - `EmbedFallbackInput` - The input type for the `getEmbedFallback` function.
 * - `EmbedFallbackOutput` - The return type for the `getEmbedFallback` function.
 */

import {z} from 'zod';

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
  // This function is designed to be easily extendable with AI in the future.
  // For now, it uses simple, deterministic logic that doesn't require an API key.

  const currentIndex = input.servers.indexOf(input.currentServer);
  
  if (currentIndex >= 0 && currentIndex < input.servers.length - 1) {
    // If the current server is not the last one, suggest the next one in the list.
    const nextServer = input.servers[currentIndex + 1];
    return {
      nextServer: nextServer,
      reasoning: `The current server, ${input.currentServer}, failed. Suggesting the next available server in the list: ${nextServer}.`
    };
  }

  // If the current server is the last one in the list, or wasn't found.
  return {
    reasoning: 'All available servers have been tried. No further alternatives can be suggested from the list.'
  };
}
