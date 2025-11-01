
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCountryName } from '@/lib/tmdb';
import { fetchMediaByCountry } from '@/lib/actions';
import { siteConfig } from '@/config/site';
import { CountryPageContent, CountryPageSkeleton } from './country-page-client';

export const runtime = 'edge';

type CountryPageProps = {
    params: {
        country: string;
    };
};

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
    const countryCode = params.country;
    const countryName = await getCountryName(countryCode);

    if (!countryName) {
        return { title: 'Country not found' };
    }
    
    const title = `Watch Movies & TV from ${countryName}`;
    const description = `Discover and stream the best movies and TV shows from ${countryName}. Browse a full list of content from ${countryName} available to watch for free.`;
    const canonicalUrl = `/country/${countryCode}`;

    return {
        title,
        description,
        keywords: [countryName, 'movies', 'tv shows', 'international film', countryCode],
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


export default async function CountryPage({ params }: CountryPageProps) {
    const { country } = params;
    const initialData = await fetchMediaByCountry({ countryCode: country, page: 1 });
    const countryName = await getCountryName(country);

    return (
        <Suspense fallback={<CountryPageSkeleton />}>
            <CountryPageContent 
                countryCode={country}
                countryName={countryName}
                initialData={initialData.results}
                totalPages={initialData.total_pages}
            />
        </Suspense>
    )
}
