
'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { MovieDetails, TVShowDetails } from '@/lib/tmdb-schemas';
import { slugify, formatRuntime } from '@/lib/utils';
import { StarRating } from '@/components/StarRating';
import { Badge } from '@/components/ui/badge';
import { PlayButton } from '@/components/PlayButton';
import { ProductionCompanies } from '@/components/ProductionCompanies';

type MediaHeroProps = {
    item: MovieDetails | TVShowDetails;
    type: 'movie' | 'tv';
};

export function MediaHero({ item, type }: MediaHeroProps) {

    const isMovie = (item: MovieDetails | TVShowDetails): item is MovieDetails => type === 'movie';

    const title = isMovie(item) ? item.title : item.name;
    const releaseDate = isMovie(item) ? item.release_date : item.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
    const runtime = isMovie(item) ? item.runtime : (item.episode_run_time && item.episode_run_time.length > 0 ? item.episode_run_time[0] : null);
    const uniqueCountries = [...new Set(item.production_companies.map(c => c.origin_country).filter(Boolean))];

    const playButtonProps = useMemo(() => {
        if (isMovie(item)) {
            return { mediaType: 'movie' as const, tmdbId: item.id, title: item.title };
        } else {
            const firstSeason = item.seasons.find(s => s.season_number > 0)?.season_number || 1;
            return {
                mediaType: 'tv' as const,
                tmdbId: item.id,
                season: firstSeason,
                episode: 1,
                title: `${item.name} - S${firstSeason}E1`,
            };
        }
    }, [item, isMovie, type]);

    return (
        <div className="relative h-auto min-h-[50vh] md:min-h-0 w-full pt-8 md:pt-0">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />

            <div className="relative z-10 flex h-full items-end py-8 md:py-12 px-4 sm:px-8">
            <div className="w-full max-w-4xl text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-3 text-shadow-lg">
                {title}
                </h1>
                {isMovie(item) && item.tagline && (
                    <p className="text-lg italic text-muted-foreground mb-4 text-shadow">{item.tagline}</p>
                )}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 mb-4 text-shadow">
                    <StarRating rating={item.vote_average} />
                    {year && (
                        <Link href={`/year/${year}`} className="text-sm hover:underline" prefetch={false}>{year}</Link>
                    )}
                    {runtime && <span className="text-sm text-muted-foreground">•</span>}
                    {runtime && <span className="text-sm">{formatRuntime(runtime)}</span>}
                </div>
                <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
                {item.genres.map(genre => (
                    <Link key={genre.id} href={`/genre/${slugify(genre.name)}-${genre.id}`} prefetch={false}>
                        <Badge 
                            variant="outline" 
                            className="bg-black/20 backdrop-blur-sm border-white/20 text-white rounded-full hover:bg-white/30 transition-colors">
                            {genre.name}
                        </Badge>
                    </Link>
                ))}
                </div>
                {uniqueCountries.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
                        {uniqueCountries.map(countryCode => (
                            <Link key={countryCode} href={`/country/${countryCode}`} prefetch={false}>
                                <Badge 
                                    variant="outline" 
                                    className="bg-black/20 backdrop-blur-sm border-white/20 text-white rounded-full hover:bg-white/30 transition-colors">
                                    {countryCode}
                                </Badge>
                            </Link>
                        ))}
                    </div>
                )}

                <div className="my-6">
                  <ProductionCompanies companies={item.production_companies} />
                </div>

                <p className="text-sm md:text-base text-foreground/80 line-clamp-3 mb-8 max-w-2xl text-shadow mx-auto md:mx-0">
                {item.overview}
                </p>
                <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                    <PlayButton {...playButtonProps} />
                </div>
            </div>
            </div>
        </div>
    );
}
