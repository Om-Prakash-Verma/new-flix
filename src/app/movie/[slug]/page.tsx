

import { notFound } from 'next/navigation';
import { getMovieDetails, getMovieRecommendations, getMovieReviews } from '@/lib/tmdb';
import { getBackdropImage, getPosterImage } from '@/lib/tmdb-images';
import { extractIdFromSlug } from '@/lib/utils';
import { CreditsCarousel } from '@/components/CreditsCarousel';
import { BackgroundImage } from '@/components/BackgroundImage';
import { MediaHero } from '@/components/MediaHero';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { TrailersCarousel } from '@/components/TrailersCarousel';
import { WatchProviders } from '@/components/WatchProviders';
import { Recommendations } from '@/components/Recommendations';
import { Reviews } from '@/components/Reviews';
import { ProductionCompanies } from '@/components/ProductionCompanies';

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

  const title = `Watch ${movie.title} (4K) Online Free | ${siteConfig.name}`;
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

  return (
    <div className="flex flex-col">
      <BackgroundImage posterUrl={getPosterImage(movie.poster_path)} backdropUrl={getBackdropImage(movie.backdrop_path)} />
      
      <MediaHero item={movie} type="movie" />

      <div className="py-12 space-y-12 px-4 sm:px-8">
        
        {watchProviders && <WatchProviders providers={watchProviders} />}
        
        <TrailersCarousel videos={movie.videos?.results || []} />
        
        <CreditsCarousel credits={movie.credits.cast} title="Cast" />

        {movie.production_companies && movie.production_companies.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Production Companies</h2>
            <ProductionCompanies companies={movie.production_companies} />
          </section>
        )}

        <Recommendations id={movie.id} type="movie" initialData={recommendations} />

        <Reviews id={movie.id} type="movie" initialData={reviews} />

      </div>
    </div>
  );
}
