
import { Suspense } from 'react';
import type { Metadata } from 'next';
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { fetchMediaByYear } from '@/lib/actions';
import { siteConfig } from '@/config/site';
import { YearPageContent, YearPageSkeleton } from './year-page-client';

export const runtime = 'edge';

type YearPageProps = {
    params: {
        year: string;
    };
};

export async function generateMetadata({ params }: YearPageProps): Promise<Metadata> {
    const { year } = params;

    if (!year || !/^\d{4}$/.test(year)) {
        return { title: 'Invalid Year' };
    }
    
    const title = `Watch Movies & TV Shows from ${year}`;
    const description = `Discover and stream the best movies and TV shows released in ${year}. Browse a full list of ${year} content available to watch for free.`;
    const canonicalUrl = `/year/${year}`;

    return {
        title,
        description,
        keywords: [year, 'movies', 'tv shows', 'free streaming', 'films from ' + year],
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


export default async function YearPage({ params }: YearPageProps) {
    const { year } = params;
    const initialData = await fetchMediaByYear({ year, page: 1 });
    
    return (
        <Suspense fallback={<YearPageSkeleton />}>
            <YearPageContent 
                year={year}
                initialData={initialData.results}
                totalPages={initialData.total_pages}
            />
        </Suspense>
    )
}
