

import { notFound } from 'next/navigation';
import { getTVShowDetails, getSeasonDetails, getTvRecommendations, getTvReviews } from '@/lib/tmdb';
import { extractIdFromSlug, getBackdropImage, getPosterImage, jsonLd } from '@/lib/utils';
import { CreditsCarousel, SeasonsDisplay, BackgroundImage, MediaHero, TrailersCarousel, WatchProviders, Recommendations, Reviews } from '@/components/media/details';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import type { TVSeries } from 'schema-dts';

type TVShowPageProps = {
  params: {
    slug: string;
  };
};

export const runtime = 'edge';

export async function generateMetadata({ params }: TVShowPageProps): Promise<Metadata> {
  const showId = extractIdFromSlug(params.slug);
  if (!showId) {
    return { title: 'TV Show not found' };
  }
  const show = await getTVShowDetails(showId);

  if (!show) {
    return {
      title: 'TV Show not found',
    };
  }

  const title = `Watch ${show.name} in 4K Online | All Episodes Free`;
  const description = `Binge-watch all seasons and episodes of ${show.name} in stunning 4K for free. Get episode guides, cast details, and reviews. No subscription required.`;
  const keywords = [
    show.name,
    ...show.genres.map(g => g.name),
    'watch series online',
    'free tv shows',
    '4K series',
    'all episodes',
  ];
  const canonicalUrl = `/tv/${params.slug}`;

  return {
    title,
    description,
    keywords,
    alternates: {
        canonical: canonicalUrl,
    },
    openGraph: {
        title,
        description,
        type: 'video.tv_show',
        url: canonicalUrl,
        images: [
            {
                url: getPosterImage(show.poster_path, 'w500'),
                width: 500,
                height: 750,
                alt: show.name,
            },
            {
                url: getBackdropImage(show.backdrop_path, 'w1280'),
                width: 1280,
                height: 720,
                alt: `Backdrop for ${show.name}`,
            },
        ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function TVShowPage({ params }: TVShowPageProps) {
  const showId = extractIdFromSlug(params.slug);
  if (!showId) {
    notFound();
  }
  const show = await getTVShowDetails(showId);

  if (!show) {
    notFound();
  }
  
  const [recommendations, reviews] = await Promise.all([
    getTvRecommendations(showId),
    getTvReviews(showId)
  ]);

  const firstSeason = show.seasons.find(s => s.season_number > 0);
  const initialSeasonDetails = firstSeason
    ? await getSeasonDetails(showId, firstSeason.season_number)
    : null;

  const watchProviders = show['watch/providers']?.results.US;

  const tvSeriesSchema: TVSeries = {
    '@type': 'TVSeries',
    name: show.name,
    description: show.overview,
    image: getPosterImage(show.poster_path, 'original'),
    numberOfSeasons: show.seasons.filter(s => s.season_number > 0).length.toString(),
    aggregateRating: show.vote_count > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: show.vote_average,
        bestRating: 10,
        ratingCount: show.vote_count,
    } : undefined,
    actors: show.credits.cast.slice(0, 10).map(person => ({
        '@type': 'Person',
        name: person.name,
    })),
    trailer: show.videos?.results.find(v => v.type === 'Trailer' && v.official) ? {
        '@type': 'VideoObject',
        name: show.videos.results.find(v => v.type === 'Trailer' && v.official)!.name,
        embedUrl: `https://www.youtube.com/watch?v=${show.videos.results.find(v => v.type === 'Trailer' && v.official)!.key}`,
        thumbnailUrl: `https://img.youtube.com/vi/${show.videos.results.find(v => v.type === 'Trailer' && v.official)!.key}/hqdefault.jpg`,
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(tvSeriesSchema)}
      />
      <div className="flex flex-col">
        <BackgroundImage posterUrl={getPosterImage(show.poster_path)} backdropUrl={getBackdropImage(show.backdrop_path)} />
        
        <div className="relative z-10">
          <MediaHero item={show} type="tv" />
        </div>
        
        <div className="py-12 space-y-12 px-4 sm:px-8">

          {watchProviders && <WatchProviders providers={watchProviders} />}
          
          <TrailersCarousel videos={show.videos?.results || []} />

          <SeasonsDisplay 
            seasons={show.seasons} 
            showId={show.id} 
            showName={show.name}
            initialData={initialSeasonDetails}
          />

          <CreditsCarousel credits={show.credits.cast} title="Cast" />

          <Recommendations id={show.id} type="tv" initialData={recommendations} />

          <Reviews id={show.id} type="tv" initialData={reviews} />
          
        </div>
      </div>
    </>
  );
}
