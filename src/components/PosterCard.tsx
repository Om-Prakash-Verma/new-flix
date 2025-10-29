
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Movie, TVShow, PersonCombinedCreditsCast, SearchResult } from '@/lib/tmdb-schemas';
import { getPosterImage } from '@/lib/tmdb-images';
import { slugify } from '@/lib/utils';
import { Star, PlayCircle } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';

type PosterCardProps = {
  item: SearchResult | Movie | TVShow | PersonCombinedCreditsCast;
  type: 'movie' | 'tv';
  imageSize?: 'w185' | 'w342';
};

export function PosterCard({ item, type, imageSize = 'w342' }: PosterCardProps) {
  const title = 'title' in item ? item.title : item.name;
  if (!title) {
    return <PosterCardSkeleton />;
  }
  const itemSlug = slugify(title);

  return (
    <Link href={`/${type}/${itemSlug}-${item.id}`} className="block group">
        <div className="aspect-[2/3] relative bg-muted/50 transition-transform duration-300 ease-in-out group-hover:scale-105 shadow-md rounded-poster overflow-hidden">
            <Image
            src={getPosterImage(item.poster_path, imageSize)}
            alt={`Poster for ${title}`}
            title={`Poster for ${title}`}
            fill
            loading="lazy"
            className="object-cover rounded-poster"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 15vw"
            data-ai-hint="movie poster"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <PlayCircle className="w-16 h-16 text-white/80 drop-shadow-lg" />
            </div>
            <Badge className="absolute top-2 left-2 text-xs" variant="secondary">{type === 'movie' ? 'Movie' : 'TV'}</Badge>
        </div>
        <div className="mt-2">
            <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                <span>{item.vote_average.toFixed(1)}</span>
            </div>
        </div>
    </Link>
  );
}

export function PosterCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="aspect-[2/3] rounded-poster bg-muted/50" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
