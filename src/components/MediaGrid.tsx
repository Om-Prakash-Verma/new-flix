
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Movie, TVShow } from "@/lib/tmdb-schemas";
import { PosterCard, PosterCardSkeleton } from "./PosterCard";
import { Loader2 } from "lucide-react";
import { useInView } from 'react-intersection-observer';
import { fetchDiscoverMedia } from '@/actions/discover';

type MediaGridProps = {
    initialItems: (Movie | TVShow)[];
    type: 'movie' | 'tv';
    imageSize?: 'w185' | 'w342';
    initialLoading?: boolean;
    fetcher: (page: number) => Promise<(Movie | TVShow)[]>;
    initialPage?: number;
    totalPages?: number;
};

export function MediaGrid({ 
    initialItems = [], 
    type, 
    imageSize,
    initialLoading = false,
    fetcher,
    initialPage = 1,
    totalPages: initialTotalPages = 1
}: MediaGridProps) {
    
    const [items, setItems] = useState(initialItems);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [isLoading, setIsLoading] = useState(false);
    const hasMore = page < totalPages;

    const { ref, inView } = useInView({
        threshold: 0.5,
        triggerOnce: false,
    });

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore || !fetcher) return;
        setIsLoading(true);
        const nextPage = page + 1;
        try {
            const newItems = await fetcher(nextPage);
            setItems(prev => [...prev, ...newItems]);
            setPage(nextPage);
        } catch (error) {
            console.error("Failed to fetch more items", error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, page, fetcher]);

    useEffect(() => {
        if (inView) {
            loadMore();
        }
    }, [inView, loadMore]);
    
    // Reset state when initial items change (e.g. from a filter in MediaBrowser)
    useEffect(() => {
        setItems(initialItems);
        setPage(initialPage);
        setTotalPages(initialTotalPages);
    }, [initialItems, initialPage, initialTotalPages]);

    if (initialLoading) {
        return <MediaGridSkeleton />;
    }

    if (items.length === 0 && !isLoading) {
        return <p className="text-muted-foreground text-center col-span-full">No items found.</p>;
    }

    return (
        <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-6 gap-y-8">
                {items.map((item, index) => (
                    <PosterCard key={`${item.id}-${index}`} item={item} type={type} imageSize={imageSize} />
                ))}
                {/* Skeletons are shown while loading more items */}
                {isLoading && !initialLoading && [...Array(6)].map((_, i) => <PosterCardSkeleton key={`loading-${i}`} />)}
            </div>

            <div ref={ref} className="h-10 flex justify-center items-center mt-8">
                {isLoading && !initialLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : !hasMore && items.length > 0 ? (
                    <p className="text-muted-foreground">You've reached the end.</p>
                ) : null}
            </div>
        </>
    );
}

export function MediaGridSkeleton({ count = 18 }: { count?: number }) {
    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-6 gap-y-8">
            {[...Array(count)].map((_, i) => <PosterCardSkeleton key={i} />)}
        </div>
    );
}
