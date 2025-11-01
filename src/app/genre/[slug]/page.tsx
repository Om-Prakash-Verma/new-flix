
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getGenres } from '@/lib/tmdb';
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { extractIdFromSlug } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { fetchMediaByGenre } from '@/lib/actions';
import { GenrePageContent, GenrePageSkeleton } from './genre-page-client';

export const runtime = 'edge';

type GenrePageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
    const { slug } = params;
    const genreId = extractIdFromSlug(slug);
    const movieGenres = await getGenres('movie');
    const tvGenres = await getGenres('tv');
    const allGenres = { ...movieGenres, ...tvGenres };
    const genreName = allGenres[Number(genreId)] || slug.split('-').slice(0, -1).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    if (!genreId || !genreName) {
        return { title: 'Genre not found' };
    }
    
    const title = `Watch ${genreName} Movies & TV Shows Online`;
    const description = `Discover and stream the best ${genreName} movies and TV shows. Browse a full list of ${genreName} content available to watch for free.`;
    const canonicalUrl = `/genre/${slug}`;

    return {
        title,
        description,
        keywords: [genreName, 'movies', 'tv shows', 'free streaming'],
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default async function GenrePage({ params }: GenrePageProps) {
    const { slug } = params;
    const genreId = extractIdFromSlug(slug);
    const initialData = await fetchMediaByGenre({ genreId, page: 1 });

    const genreName = slug.split('-').slice(0, -1).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    return (
        <Suspense fallback={<GenrePageSkeleton />}>
            <GenrePageContent 
                genreId={genreId}
                genreName={genreName}
                initialData={initialData.results}
                totalPages={initialData.total_pages}
            />
        </Suspense>
    )
}
