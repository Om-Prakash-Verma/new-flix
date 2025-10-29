
'use client';

import { Suspense, useCallback, useState, useEffect, useRef } from 'react';
import { notFound } from 'next/navigation';
import { getGenres, getCountryName, fetchCombinedMedia } from "@/lib/tmdb";
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { MediaListItem, MediaListItemSkeleton } from '@/components/MediaListItem';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';
import { extractIdFromSlug } from '@/lib/utils';

export const runtime = 'edge';

type DiscoverPageProps = {
    params: {
        type: 'genre' | 'year' | 'country';
        slug: string;
    };
};

type PageData = {
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


function DiscoverPageContent({ params }: DiscoverPageProps) {
    const { type, slug } = params;
    const [pageData, setPageData] = useState<PageData | null>(null);
    const [items, setItems] = useState<(Movie | TVShow)[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState(false);

    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.5,
        triggerOnce: false,
    });

    const hasMore = page < totalPages;

    const loadPageData = useCallback(async () => {
        const data = await getPageData(type, slug);
        if (!data) {
            setError(true);
            return;
        }
        setPageData(data);
    }, [type, slug]);

    useEffect(() => {
        loadPageData();
    }, [loadPageData]);


    const loadItems = useCallback(async (isNewQuery = false) => {
        if (isLoading || (!hasMore && !isNewQuery) || !pageData) return;

        setIsLoading(true);
        if (isNewQuery) {
            setItems([]);
            setPage(0);
        }
        const nextPage = isNewQuery ? 1 : page + 1;

        try {
            const data = await fetchCombinedMedia({ discoveryType: type, id: pageData.id, page: nextPage });
            setItems(prev => {
                const newItems = data.results.filter(
                    (newItem) => !prev.some(existingItem => existingItem.id === newItem.id)
                );
                return isNewQuery ? data.results : [...prev, ...newItems];
            });
            setPage(nextPage);
            setTotalPages(data.total_pages);
        } catch (error) {
            console.error("Failed to fetch discovery results", error);
        } finally {
            setIsLoading(false);
            if (isNewQuery) setIsInitialLoading(false);
        }
    }, [isLoading, hasMore, page, pageData, type]);

    const loadItemsRef = useRef(loadItems);
    loadItemsRef.current = loadItems;

    useEffect(() => {
        if (pageData) {
            setIsInitialLoading(true);
            loadItemsRef.current(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pageData]);

    useEffect(() => {
        if (inView && !isLoading) {
            loadItemsRef.current();
        }
    }, [inView, isLoading]);

    if (error) {
        notFound();
    }

    if (isInitialLoading || !pageData) {
        return (
            <div className="py-12 px-4 sm:px-8">
                <div className="max-w-4xl mx-auto">
                    <Skeleton className="h-10 w-1/2 mb-8" />
                    <div className="flex flex-col gap-4">
                        {[...Array(8)].map((_, i) => <MediaListItemSkeleton key={`skel-${i}`} />)}
                    </div>
                </div>
            </div>
        )
    }

    const noResults = items.length === 0 && !isLoading;

    return (
        <div className="py-12 px-4 sm:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-8">
                    <span className="text-muted-foreground capitalize">{type}:</span> {pageData.name}
                </h1>

                {noResults && <p className="text-muted-foreground">No results found.</p>}

                <div className="flex flex-col gap-4">
                    {items.map((item) => (
                        <MediaListItem key={`${item.id}`} item={item} type={'title' in item ? 'movie' : 'tv'} prefetch={false} />
                    ))}
                    {(isLoading && hasMore) && (
                        <>
                            <MediaListItemSkeleton />
                            <MediaListItemSkeleton />
                        </>
                    )}
                </div>
                <div ref={loadMoreRef} className="h-10" />
            </div>
        </div>
    );
}

export default function DiscoverPage({ params }: DiscoverPageProps) {
    return (
        <Suspense fallback={<div className="py-12 px-4 sm:px-8 max-w-4xl mx-auto"><Skeleton className="h-10 w-1/2 mb-8" /></div>}>
            <DiscoverPageContent params={params} />
        </Suspense>
    )
}
