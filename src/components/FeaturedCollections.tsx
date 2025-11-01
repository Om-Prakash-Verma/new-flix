
'use server';

import { getCollectionDetails } from '@/lib/tmdb';
import { ShadcnCarousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import Link from 'next/link';
import { getBackdropImage, slugify } from '@/lib/utils';
import type { CollectionDetails } from '@/lib/tmdb-schemas';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Hand-picked collection IDs from TMDB
const featuredCollectionIds = [
  10,   // Star Wars Collection
  86311,// The Avengers Collection
  295,  // Pirates of the Caribbean Collection
  1241, // Harry Potter Collection
  119,  // The Lord of the Rings Collection
  263,  // The Dark Knight Trilogy
];

export async function FeaturedCollections() {
  const collections = await Promise.all(
    featuredCollectionIds.map(id => getCollectionDetails(id))
  );

  const validCollections = collections.filter(Boolean) as CollectionDetails[];

  if (validCollections.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider px-4 sm:px-8">
        Featured Collections
      </h2>
      <div className="overflow-hidden">
        <ShadcnCarousel
          opts={{
            align: 'start',
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 px-4 sm:px-8">
            {validCollections.map((collection) => (
              <CarouselItem key={collection.id} className="pl-4 basis-4/5 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <InternalCollectionCard collection={collection} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/50 backdrop-blur-sm hover:bg-background/80 border-2 border-primary/50 text-primary hover:border-primary transition-all duration-300 disabled:opacity-0 disabled:scale-90" >
            <ChevronLeft className="h-6 w-6" />
          </CarouselPrevious>
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/50 backdrop-blur-sm hover:bg-background/80 border-2 border-primary/50 text-primary hover:border-primary transition-all duration-300 disabled:opacity-0 disabled:scale-90" >
            <ChevronRight className="h-6 w-6" />
          </CarouselNext>
        </ShadcnCarousel>
      </div>
    </section>
  );
}


function InternalCollectionCard({ collection }: { collection: CollectionDetails }) {
  const href = `/collection/${slugify(collection.name)}-${collection.id}`;
  const movieCount = collection.parts.length;

  return (
    <Link href={href} className="block group" prefetch={false}>
      <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-primary/30">
        <Image
          src={getBackdropImage(collection.backdrop_path)}
          alt={`Backdrop for the ${collection.name} collection`}
          title={`Backdrop for the ${collection.name} collection`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 80vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          data-ai-hint="movie collection"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white text-shadow-lg">
          <h3 className="text-lg md:text-xl font-bold tracking-tight">{collection.name}</h3>
          <p className="text-sm text-muted-foreground font-semibold">{movieCount} Movies</p>
        </div>
      </div>
    </Link>
  );
}