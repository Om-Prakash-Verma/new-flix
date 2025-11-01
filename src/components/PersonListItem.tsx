
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Person } from '@/lib/tmdb-schemas';
import { slugify, getProfileImage } from '@/lib/utils';
import { Card } from '@/components/ui/layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type PersonListItemProps = {
  person: Person;
};

export function PersonListItem({ person }: PersonListItemProps) {
  const itemSlug = slugify(person.name);

  return (
    <Link href={`/person/${itemSlug}-${person.id}`} className="block group" prefetch={false}>
      <Card className="flex items-center gap-4 p-3 bg-card/80 hover:bg-muted/50 transition-all duration-300 rounded-lg h-full">
        <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
          <div className="aspect-square relative rounded-full overflow-hidden bg-muted/50">
            <Image
              src={getProfileImage(person.profile_path, 'w185')}
              alt={`Photo of ${person.name}`}
              title={`Photo of ${person.name}`}
              fill
              loading="lazy"
              className="object-cover"
              sizes="80px"
              data-ai-hint="person portrait"
            />
          </div>
        </div>
        <div className="flex-grow overflow-hidden">
          <h3 className="font-semibold text-base md:text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">{person.name}</h3>
          <Badge variant="secondary" className="mt-1 text-xs">Person</Badge>
        </div>
      </Card>
    </Link>
  );
}

export function PersonListItemSkeleton() {
  return (
    <Card className="flex items-center gap-4 p-3 bg-card/80 rounded-lg h-[92px] md:h-[112px]">
      <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
        <Skeleton className="aspect-square rounded-full" />
      </div>
      <div className="flex-grow space-y-2 mt-1 w-full">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </Card>
  );
}