

'use client';

import { useState, useEffect } from 'react';
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { getRecentlyReleased } from '@/lib/tmdb';
import { Carousel } from '@/components/ui/carousel';
import { PosterCard, PosterCardSkeleton } from '@/components/media';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Label } from "@/components/ui/forms";

const topCountries: Record<string, string> = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'IN': 'India',
    'CA': 'Canada',
    'JP': 'Japan',
    'FR': 'France',
    'DE': 'Germany',
    'KR': 'South Korea',
    'ES': 'Spain',
    'AU': 'Australia',
};


export function RecentlyReleased() {
    const [items, setItems] = useState<(Movie | TVShow)[]>([]);
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            const newItems = await getRecentlyReleased(selectedCountry);
            setItems(newItems);
            setIsLoading(false);
        }
        fetchData();
    }, [selectedCountry]);

    return (
        <section>
            <div className="flex flex-row justify-between items-center mb-4 px-4 sm:px-8 gap-4">
                <h2 className="text-2xl font-bold uppercase tracking-wider flex-shrink-0">Recently Released</h2>
                <div className="grid w-auto max-w-[200px] sm:max-w-xs flex-grow gap-1.5">
                    <Label htmlFor="country-filter" className="text-muted-foreground sr-only">Filter by Country</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry} disabled={isLoading}>
                        <SelectTrigger className="w-full bg-secondary border-border" id="country-filter">
                            <SelectValue placeholder="All Countries" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {Object.entries(topCountries).map(([code, name]) => (
                                <SelectItem key={code} value={code}>{name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <Carousel>
                {isLoading ? (
                    [...Array(10)].map((_, i) => <PosterCardSkeleton key={i} />)
                ) : (
                    items.map((item) => {
                        const itemType = 'title' in item ? 'movie' : 'tv';
                        return <PosterCard key={item.id} item={item} type={itemType as 'movie' | 'tv'} />;
                    })
                )}
            </Carousel>
            {!isLoading && items.length === 0 && (
                <div className="px-4 sm:px-8 text-muted-foreground">
                    No recently released titles found for the selected country.
                </div>
            )}
        </section>
    );
}
