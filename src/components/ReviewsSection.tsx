
'use client';

import type { Review } from '@/lib/tmdb-schemas';
import { ReviewCard } from './ReviewCard';

type ReviewsSectionProps = {
  reviews: Review[];
};

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  if (reviews.length === 0) {
    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                <p>No reviews available yet.</p>
            </div>
        </section>
    )
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      <div className="space-y-6">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
