'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchRecommendations } from '@/lib/tmdb';
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { Carousel } from './Carousel';
import { PosterCard, PosterCardSkeleton } from './PosterCard';
import { Skeleton } from './ui/skeleton';

type RecommendationsProps = {
  id: number;
  type: 'movie' | 'tv';
  initialData: {
    results: (Movie | TVShow)[];
    total_pages: number;
  } | null;
};

export function Recommendations({ id, type, initialData }: RecommendationsProps) {
  
  if (!initialData || initialData.results.length === 0) {
    return null; // Don't render the section if there are no recommendations
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">More Like This</h2>
      <Carousel>
        {initialData.results.map(item => (
          <PosterCard key={item.id} item={item} type={type} />
        ))}
      </Carousel>
    </section>
  );
}
