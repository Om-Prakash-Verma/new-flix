
'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { CastMember } from '@/lib/tmdb-schemas';
import { getProfileImage } from '@/lib/tmdb-images';
import { slugify } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type CreditsCarouselProps = {
  credits: CastMember[];
  title: string;
};

export function CreditsCarousel({ credits, title }: CreditsCarouselProps) {
  const filteredCredits = credits.filter(c => c.profile_path);

  if (filteredCredits.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="relative">
        <Carousel
          opts={{
            align: 'start',
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 px-4 sm:px-8">
            {filteredCredits.slice(0, 20).map((person) => (
              <CarouselItem
                key={person.id}
                className="pl-4 basis-[140px] flex-grow-0 flex-shrink-0"
              >
                <div className="group">
                   <Link href={`/person/${slugify(person.name)}-${person.id}`}>
                    <div className="aspect-[2/3] relative bg-muted transition-transform duration-300 ease-in-out group-hover:scale-105 shadow-md rounded-poster overflow-hidden">
                      <Image
                        src={getProfileImage(person.profile_path)}
                        alt={`Photo of ${person.name}`}
                        title={`Photo of ${person.name}`}
                        fill
                        loading="lazy"
                        className="object-cover rounded-poster"
                        sizes="(max-width: 768px) 30vw, 15vw"
                        data-ai-hint="person portrait"
                      />
                    </div>
                  </Link>
                  <div className="mt-2 text-sm text-center">
                    <Link href={`/person/${slugify(person.name)}-${person.id}`}>
                      <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">
                        {person.name}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground line-clamp-1">
                      {person.character || person.job}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
           <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/50 backdrop-blur-sm hover:bg-background/80 border-2 border-primary/50 text-primary hover:border-primary transition-all duration-300 disabled:opacity-0 disabled:scale-90" >
            <ChevronLeft className="h-6 w-6" />
          </CarouselPrevious>
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/50 backdrop-blur-sm hover:bg-background/80 border-2 border-primary/50 text-primary hover:border-primary transition-all duration-300 disabled:opacity-0 disabled:scale-90" >
            <ChevronRight className="h-6 w-6" />
          </CarouselNext>
        </Carousel>
      </div>
    </section>
  );
}
