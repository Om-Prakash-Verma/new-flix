'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { extractIdFromSlug } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { GenreResults } from '@/components/GenreResults';
import { siteConfig } from '@/config/site';

function GenrePageContent() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const genreId = extractIdFromSlug(slug);
  const genreName = slug.split('-').slice(0, -1).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="py-8 px-4 sm:px-8">
      {genreId ? (
        <>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">
              <span className="text-primary">{genreName}</span> Movies & TV Shows
            </h1>
            <GenreResults genreId={genreId} />
          </div>
        </>
      ) : (
        <div className="py-12 text-center min-h-[60vh] flex flex-col justify-center px-4 sm:px-8">
            <h1 className="text-3xl font-bold">Genre Not Found</h1>
            <p className="text-muted-foreground mt-2">Could not find movies or TV shows for this genre.</p>
        </div>
      )}
    </div>
  );
}

export default function GenrePage() {
    return (
        <Suspense fallback={<GenrePageSkeleton />}>
            <GenrePageContent />
        </Suspense>
    )
}

function GenrePageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-8">
             <Skeleton className="h-10 w-1/2 mb-8" />
             <div className="flex flex-col gap-4">
                {[...Array(8)].map((_, i) => <Skeleton key={`skel-${i}`} className="h-[182px] w-full" />)}
            </div>
        </div>
    )
}
