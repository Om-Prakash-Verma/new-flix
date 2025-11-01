
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCompanyDetails } from '@/lib/tmdb';
import { MediaListSkeleton } from '@/components/media';
import { Skeleton } from '@/components/ui/skeleton';
import { extractIdFromSlug, getPosterImage } from '@/lib/utils';
import { siteConfig } from '@/config/site';
import { fetchMediaByCompany } from '@/lib/actions';
import { CompanyPageContent, CompanyPageSkeleton } from './company-page-client';

export const runtime = 'edge';

type CompanyPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
    const companyId = extractIdFromSlug(params.slug);
    if (!companyId) {
        return { title: 'Company not found' };
    }
    const companyDetails = await getCompanyDetails(companyId);

    if (!companyDetails) {
        return { title: 'Company not found' };
    }
    
    const title = `Movies & TV Shows by ${companyDetails.name}`;
    const description = `Browse all movies and TV shows produced by ${companyDetails.name}. Discover their full filmography and find your next watch.`;
    const canonicalUrl = `/company/${params.slug}`;

    return {
        title,
        description,
        keywords: [companyDetails.name, 'production company', 'filmography', 'movies', 'tv shows'],
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            images: companyDetails.logo_path ? [
                {
                    url: getPosterImage(companyDetails.logo_path, 'w500'),
                    alt: `Logo for ${companyDetails.name}`,
                }
            ] : [],
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}


export default async function CompanyPage({ params }: CompanyPageProps) {
    const { slug } = params;
    const companyId = extractIdFromSlug(slug);
    
    const [initialData, companyDetails] = await Promise.all([
        companyId ? fetchMediaByCompany({ companyId, page: 1 }) : Promise.resolve({ results: [], total_pages: 0 }),
        companyId ? getCompanyDetails(companyId) : Promise.resolve(null),
    ]);

    return (
        <Suspense fallback={<CompanyPageSkeleton />}>
            <CompanyPageContent 
                companyId={companyId}
                companyName={companyDetails?.name}
                initialData={initialData.results}
                totalPages={initialData.total_pages}
            />
        </Suspense>
    )
}
