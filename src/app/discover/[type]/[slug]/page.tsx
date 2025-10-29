
import { notFound } from 'next/navigation';
import { getGenres, getCountryName, fetchCombinedMedia } from "@/lib/tmdb";
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { extractIdFromSlug } from '@/lib/utils';
import { DiscoverPageContent } from './DiscoverPageContent';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

export const runtime = 'edge';

type DiscoverPageProps = {
    params: {
        type: 'genre' | 'year' | 'country';
        slug: string;
    };
};

export type PageData = {
    id: string;
    name: string;
    title: string;
};

// We keep this server-side to generate metadata and fetch initial page data props
async function getPageData(type: string, slug: string): Promise<PageData | null> {
    switch (type) {
        case 'genre': {
            const genreId = extractIdFromSlug(slug);
            if (!genreId) return null;
            const [movieGenres, tvGenres] = await Promise.all([getGenres('movie'), getGenres('tv')]);
            const allGenres = { ...movieGenres, ...tvGenres };
            const name = allGenres[parseInt(genreId)];
            if (!name) return null;
            return { id: genreId, name, title: `${name}` };
        }
        case 'year': {
            const year = slug;
            if (isNaN(parseInt(year))) return null;
            return { id: year, name: year, title: `Content from ${year}` };
        }
        case 'country': {
            const countryCode = slug;
            const name = await getCountryName(countryCode.toUpperCase());
            if (!name) return null;
            return { id: countryCode, name, title: `Content from ${name}` };
        }
        default:
            return null;
    }
}

export async function generateMetadata({ params }: DiscoverPageProps): Promise<Metadata> {
  const pageData = await getPageData(params.type, params.slug);
  
  if (!pageData) {
    return {
      title: 'Not Found',
      description: 'The page you are looking for does not exist.',
    };
  }

  const title = `${pageData.name} | ${siteConfig.name}`;
  const description = `Discover the best movies and TV shows for ${pageData.name}.`;
  const canonicalUrl = `/discover/${params.type}/${params.slug}`;

  return {
    title,
    description,
    alternates: {
        canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonicalUrl,
    },
  };
}


export default async function DiscoverPage({ params }: DiscoverPageProps) {
    const { type, slug } = params;
    const pageData = await getPageData(type, slug);

    if (!pageData) {
        notFound();
    }

    // Fetch the first page on the server
    const initialItems = await fetchCombinedMedia({ discoveryType: type, id: pageData.id, page: 1 });

    return (
        <DiscoverPageContent
            params={params}
            pageData={pageData}
            initialItems={initialItems}
        />
    );
}

    