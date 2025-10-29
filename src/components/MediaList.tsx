
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Movie, TVShow, SearchResult } from "@/lib/tmdb-schemas";
import { MediaListItem, MediaListItemSkeleton } from "./MediaListItem";
import { Loader2 } from "lucide-react";
import { useInView } from 'react-intersection-observer';

type MediaListProps = {
    initialItems: (Movie | TVShow | SearchResult)[];
    type?: 'movie' | 'tv';
    initialLoading?: boolean;
    fetcher?: (page: number) => Promise<{ results: (Movie | TVShow | SearchResult)[]; total_pages: number; }>;
    initialPage?: number;
    initialTotalPages?: number;
};

export function MediaList({ 
    initialItems = [], 
    type, 
    initialLoading = false,
    fetcher,
    initialPage = 1,
    initialTotalPages = 1
}: MediaListProps) {
    
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
            const data = await fetcher(nextPage);
            setItems(prev => {
                const all = [...prev, ...data.results];
                // Prevent duplicates
                return all.filter((item, index, self) => 
                    index === self.findIndex(t => t.id === item.id && ('media_type' in t ? t.media_type === (item as SearchResult).media_type : true))
                );
            });
            setPage(nextPage);
            setTotalPages(data.total_pages);
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
        return <MediaListSkeleton />;
    }

    if (items.length === 0 && !isLoading) {
        return <p className="text-muted-foreground text-center col-span-full">No items found.</p>;
    }

    return (
        <>
            <div className="flex flex-col gap-4">
                {items.map((item, index) => {
                    const itemType = type || ('title' in item ? 'movie' : 'tv');
                    return <MediaListItem key={`${item.id}-${index}`} item={item} type={itemType as 'movie' | 'tv'} />;
                })}
                {isLoading && !initialLoading && (
                    <>
                        <MediaListItemSkeleton />
                        <MediaListItemSkeleton />
                    </>
                )}
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

export function MediaListSkeleton({ count = 10 }: { count?: number }) {
    return (
        <div className="flex flex-col gap-4">
            {[...Array(count)].map((_, i) => <MediaListItemSkeleton key={`skel-${i}`} />)}
        </div>
    );
}
