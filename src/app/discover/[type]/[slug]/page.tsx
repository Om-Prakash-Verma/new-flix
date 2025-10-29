
import { getGenres, getCountryName } from "@/lib/tmdb";
import { extractIdFromSlug } from "@/lib/utils";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { MediaList } from "@/components/MediaList";
import { fetchCombinedMedia } from "@/actions/discover";

type DiscoverPageProps = {
    params: {
        type: 'genre' | 'year' | 'country';
        slug: string;
    };
};

export const runtime = 'edge';

async function getPageData(type: string, slug: string) {
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
    const data = await getPageData(params.type, params.slug);
    if (!data) {
        return { title: "Not Found" };
    }

    const title = `${data.title} | ${siteConfig.name}`;
    const description = `Discover movies and TV shows for: ${data.name}.`;
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
            url: canonicalUrl,
        },
    };
}

export default async function DiscoverPage({ params }: DiscoverPageProps) {
    const data = await getPageData(params.type, params.slug);
    if (!data) {
        notFound();
    }

    const initialMedia = await fetchCombinedMedia({discoveryType: params.type, id: data.id, page: 1});

    const fetcher = async (page: number) => {
        'use server';
        return fetchCombinedMedia({ discoveryType: params.type, id: data.id, page });
    };

    return (
        <div className="py-12 px-4 sm:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-8">
                    <span className="text-muted-foreground capitalize">{params.type}:</span> {data.name}
                </h1>
                
                <MediaList
                    initialItems={initialMedia.results}
                    fetcher={fetcher}
                    initialPage={1}
                    initialTotalPages={initialMedia.total_pages}
                />
            </div>
        </div>
    );
}

