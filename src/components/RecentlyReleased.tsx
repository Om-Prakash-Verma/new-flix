'use client';

import { useState, useEffect } from 'react';
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { getCountries, getRecentlyReleased } from '@/lib/tmdb';
import { Carousel } from '@/components/Carousel';
import { PosterCard, PosterCardSkeleton } from '@/components/PosterCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function RecentlyReleased() {
    const [items, setItems] = useState<(Movie | TVShow)[]>([]);
    const [countries, setCountries] = useState<Record<string, string>>({});
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchInitialData() {
            const [initialItems, countryList] = await Promise.all([
                getRecentlyReleased(),
                getCountries(),
            ]);
            setItems(initialItems);
            setCountries(countryList);
            setIsLoading(false);
        }
        fetchInitialData();
    }, []);

    useEffect(() => {
        async function fetchFilteredData() {
            setIsLoading(true);
            const filteredItems = await getRecentlyReleased(selectedCountry);
            setItems(filteredItems);
            setIsLoading(false);
        }
        // Don't fetch on initial render, let the first useEffect handle that
        if (!isLoading) {
            fetchFilteredData();
        }
    }, [selectedCountry]);

    return (
        <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 px-4 sm:px-8 gap-4">
                <h2 className="text-2xl font-bold uppercase tracking-wider">Recently Released</h2>
                <div className="grid w-full sm:w-auto gap-1.5">
                    <Label htmlFor="country-filter" className="text-muted-foreground">Filter by Country</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry} disabled={isLoading}>
                        <SelectTrigger className="w-full sm:w-[200px] bg-secondary border-border" id="country-filter">
                            <SelectValue placeholder="All Countries" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {Object.entries(countries).map(([code, name]) => (
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
