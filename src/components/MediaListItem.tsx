
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Movie, TVShow, SearchResult } from '@/lib/tmdb-schemas';
import { getPosterImage } from '@/lib/tmdb-images';
import { slugify } from '@/lib/utils';
import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import { StarRating } from './StarRating';

type MediaListItemProps = {
  item: Movie | TVShow | SearchResult;
  type: 'movie' | 'tv';
};

export function MediaListItem({ item, type }: MediaListItemProps) {
  const title = 'title' in item ? item.title : item.name;
  if (!title) return null;
  
  const releaseDate = 'release_date' in item ? item.release_date : ('first_air_date' in item ? item.first_air_date : undefined);
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
  const itemSlug = slugify(title);

  return (
    <Link href={`/${type}/${itemSlug}-${item.id}`} className="block group">
      <Card className="flex items-start gap-4 p-3 bg-card/80 hover:bg-muted/50 transition-all duration-300 rounded-lg h-full">
        <div className="w-24 md:w-28 flex-shrink-0">
          <div className="aspect-[2/3] relative rounded-md overflow-hidden bg-muted/50">
            <Image
              src={getPosterImage(item.poster_path, 'w185')}
              alt={`Poster for ${title}`}
              title={`Poster for ${title}`}
              fill
              loading="lazy"
              className="object-cover rounded-lg"
              sizes="112px"
              data-ai-hint="movie poster"
            />
            <Badge className="absolute top-1 left-1 text-[10px] leading-tight px-1.5 py-0.5" variant="secondary">{type === 'movie' ? 'Movie' : 'TV'}</Badge>
          </div>
        </div>
        <div className="flex-grow overflow-hidden flex flex-col justify-between h-full gap-1.5 py-1">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span>{year}</span>
              {item.vote_average > 0 && (
                <>
                  <span className="text-xs">•</span>
                  <StarRating rating={item.vote_average} />
                </>
              )}
            </div>
            <h3 className="font-semibold text-base md:text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
          </div>
          <p className="text-xs text-foreground/70 line-clamp-2">
              {item.overview}
          </p>
        </div>
      </Card>
    </Link>
  );
}

export function MediaListItemSkeleton() {
  return (
    <Card className="flex items-start gap-4 p-3 bg-card/80 rounded-lg h-[158px] md:h-[182px]">
        <div className="w-24 md:w-28 flex-shrink-0">
            <Skeleton className="aspect-[2/3] rounded-md" />
        </div>
        <div className="flex-grow space-y-2 mt-1 w-full">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-10 w-full mt-4" />
        </div>
    </Card>
  );
}
