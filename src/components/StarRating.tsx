
import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  rating: number; // Rating out of 10
  className?: string;
};

export const StarRating = React.memo(function StarRating({ rating, className }: StarRatingProps) {
  if (rating === 0) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Star className="w-4 h-4 text-yellow-400 fill-current" />
      <span className="text-sm font-bold text-foreground">{rating.toFixed(1)}</span>
    </div>
  );
});
