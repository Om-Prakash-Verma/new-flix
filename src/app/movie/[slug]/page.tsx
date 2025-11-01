

import { notFound } from 'next/navigation';
import { getMovieDetails, getMovieRecommendations, getMovieReviews } from '@/lib/tmdb';
import { extractIdFromSlug, getBackdropImage, getPosterImage, jsonLd } from '@/lib/utils';
import { CreditsCarousel, BackgroundImage, MediaHero, TrailersCarousel, WatchProviders, Recommendations, Reviews } from '@/components/media/details';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import type { Movie } from 'schema-dts';

type MoviePageProps = {
  params: {
    slug: string;
  };
};

export const runtime = 'edge';

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const movieId = extractIdFromSlug(params.slug);
  if (!movieId) {
    return { title: 'Movie not found' };
  }
  const movie = await getMovieDetails(movieId);

  if (!movie) {
    return {
      title: 'Movie not found',
    };
  }

  const title = `Watch ${movie.title} (4K) Online Free`;
  const description = `Stream ${movie.title} in stunning 4K quality for free. Dive into the full movie experience with reviews, cast details, and more. No ads, no sign-ups.`;
  const keywords = [
    movie.title,
    ...movie.genres.map(g => g.name),
    'watch online',
    'free streaming',
    '4K movie',
    'HD streaming',
  ];

  const canonicalUrl = `/movie/${params.slug}`;

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
        type: 'video.movie',
        url: canonicalUrl,
        images: [
          {
            url: getPosterImage(movie.poster_path, 'w500'),
            width: 500,
            height: 750,
            alt: movie.title,
          },
          {
            url: getBackdropImage(movie.backdrop_path, 'w1280'),
            width: 1280,
            height: 720,
            alt: `Backdrop for ${movie.title}`,
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

export default async function MoviePage({ params }: MoviePageProps) {
  const movieId = extractIdFromSlug(params.slug);
  if (!movieId) {
    notFound();
  }
  const movie = await getMovieDetails(movieId);

  if (!movie) {
    notFound();
  }

  const [recommendations, reviews] = await Promise.all([
    getMovieRecommendations(movieId),
    getMovieReviews(movieId)
  ]);

  const watchProviders = movie['watch/providers']?.results.US;

  const director = movie.credits.crew.find(
    (person) => person.job === 'Director'
  );

  const movieSchema: Movie = {
    '@type': 'Movie',
    name: movie.title,
    description: movie.overview,
    image: getPosterImage(movie.poster_path, 'original'),
    datePublished: movie.release_date,
    director: director ? { '@type': 'Person', name: director.name } : undefined,
    actor: movie.credits.cast.slice(0, 10).map(person => ({
        '@type': 'Person',
        name: person.name,
    })),
    aggregateRating: movie.vote_count > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: movie.vote_average,
        bestRating: 10,
        ratingCount: movie.vote_count,
    } : undefined,
    trailer: movie.videos?.results.find(v => v.type === 'Trailer' && v.official) ? {
        '@type': 'VideoObject',
        name: movie.videos.results.find(v => v.type === 'Trailer' && v.official)!.name,
        embedUrl: `https://www.youtube.com/watch?v=${movie.videos.results.find(v => v.type === 'Trailer' && v.official)!.key}`,
        thumbnailUrl: `https://img.youtube.com/vi/${movie.videos.results.find(v => v.type === 'Trailer' && v.official)!.key}/hqdefault.jpg`,
    } : undefined,
  };

  return (
    <>
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(movieSchema)}
      />
      <div className="flex flex-col">
        <BackgroundImage posterUrl={getPosterImage(movie.poster_path)} backdropUrl={getBackdropImage(movie.backdrop_path)} />
        
        <div className="relative z-10">
          <MediaHero item={movie} type="movie" />
        </div>

        <div className="py-12 space-y-12 px-4 sm:px-8">
          
          {watchProviders && <WatchProviders providers={watchProviders} />}
          
          <TrailersCarousel videos={movie.videos?.results || []} />
          
          <CreditsCarousel credits={movie.credits.cast} title="Cast" />

          <Recommendations id={movie.id} type="movie" initialData={recommendations} />

          <Reviews id={movie.id} type="movie" initialData={reviews} />

        </div>
      </div>
    </>
  );
}
