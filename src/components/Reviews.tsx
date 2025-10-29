'use client';

import { useState, useCallback, useTransition } from 'react';
import { fetchReviews } from '@/actions/tmdb';
import type { Review } from '@/lib/tmdb-schemas';
import { ReviewCard } from './ReviewCard';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

type ReviewsProps = {
  id: number;
  type: 'movie' | 'tv';
  initialData: {
    results: Review[];
    total_pages: number;
    page: number;
  } | null;
};

export function Reviews({ id, type, initialData }: ReviewsProps) {
  const [reviews, setReviews] = useState(initialData?.results || []);
  const [page, setPage] = useState(initialData?.page || 1);
  const [totalPages, setTotalPages] = useState(initialData?.total_pages || 1);
  const [isPending, startTransition] = useTransition();

  const hasMore = page < totalPages;

  const loadMoreReviews = useCallback(async () => {
    if (isPending || !hasMore) return;
    
    startTransition(async () => {
        const nextPage = page + 1;
        try {
        const data = await fetchReviews(type, id, nextPage);
        setReviews(prev => [...prev, ...data.results]);
        setPage(nextPage);
        setTotalPages(data.total_pages);
        } catch (error) {
        console.error('Failed to fetch more reviews:', error);
        }
    });
  }, [type, id, page, isPending, hasMore]);

  if (!initialData) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </section>
    );
  }
  
  if (reviews.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          <p>No reviews available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      <div className="space-y-6">
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-8">
            <Button onClick={loadMoreReviews} disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Load More
            </Button>
        </div>
      )}

      {!isPending && !hasMore && reviews.length > 0 && (
          <div className="h-10 flex justify-center items-center mt-8">
            <p className="text-muted-foreground">You've reached the end.</p>
          </div>
      )}
    </section>
  );
}
