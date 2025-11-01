
import { notFound } from 'next/navigation';
import { getCollectionDetails } from '@/lib/tmdb';
import { extractIdFromSlug, getPosterImage, getBackdropImage } from '@/lib/utils';
import { BackgroundImage } from '@/components/media/details';
import { PosterCard } from '@/components/media';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

type CollectionPageProps = {
  params: {
    slug: string;
  };
};

export const runtime = 'edge';

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const collectionId = extractIdFromSlug(params.slug);
  if (!collectionId) {
    return { title: 'Collection not found' };
  }
  const collection = await getCollectionDetails(collectionId);

  if (!collection) {
    return {
      title: 'Collection not found',
    };
  }

  const title = `Watch the ${collection.name} Collection`;
  const description = `Browse all ${collection.parts.length} movies from the ${collection.name} collection in order. ${collection.overview}`;
  const canonicalUrl = `/collection/${params.slug}`;

  return {
    title,
    description,
    keywords: [collection.name, 'movie collection', 'saga', 'series'],
    alternates: {
        canonical: canonicalUrl,
    },
    openGraph: {
        title,
        description,
        type: 'website',
        url: canonicalUrl,
        images: [
          {
            url: getPosterImage(collection.poster_path, 'w500'),
            width: 500,
            height: 750,
            alt: `Poster for ${collection.name}`,
          },
          {
            url: getBackdropImage(collection.backdrop_path, 'w1280'),
            width: 1280,
            height: 720,
            alt: `Backdrop for ${collection.name}`,
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

export default async function CollectionPage({ params }: CollectionPageProps) {
  const collectionId = extractIdFromSlug(params.slug);
  if (!collectionId) {
    notFound();
  }
  const collection = await getCollectionDetails(collectionId);

  if (!collection) {
    notFound();
  }
  
  // Sort movies by release date
  const sortedParts = collection.parts.sort((a, b) => {
    const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
    const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
    return dateA - dateB;
  });

  return (
    <div className="flex flex-col">
      <BackgroundImage posterUrl={getPosterImage(collection.poster_path)} backdropUrl={getBackdropImage(collection.backdrop_path)} />
      
      <div className="relative z-10 py-12 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-shadow-lg">
                {collection.name}
            </h1>
            <p className="text-base md:text-lg text-foreground/80 max-w-3xl mx-auto text-shadow">
                {collection.overview}
            </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-6 gap-y-8">
            {sortedParts.map(movie => (
                <PosterCard key={movie.id} item={movie} type="movie" />
            ))}
        </div>
      </div>
    </div>
  );
}
