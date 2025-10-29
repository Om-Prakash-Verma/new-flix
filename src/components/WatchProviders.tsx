
'use client';

import type { WatchProviders } from '@/lib/tmdb-schemas';
import Image from 'next/image';
import Link from 'next/link';

type WatchProvidersProps = {
  providers: WatchProviders['results'][string];
};

export function WatchProviders({ providers }: WatchProvidersProps) {
  const freeProviders = providers.free || [];
  
  if (freeProviders.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Available For Free On</h2>
      <div className="flex flex-wrap gap-4">
        {freeProviders.map(provider => (
          <Link href={providers.link} key={provider.provider_id} target="_blank" rel="noopener noreferrer" className="group" prefetch={false}>
            <div className="relative w-16 h-16 rounded-poster overflow-hidden transition-transform duration-300 group-hover:scale-110">
              <Image
                src={`https://image.tmdb.org/t/p/w185${provider.logo_path}`}
                alt={`Logo for ${provider.provider_name}`}
                title={`Logo for ${provider.provider_name}`}
                fill
                className="object-cover"
                sizes="10vw"
                data-ai-hint="streaming service logo"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
