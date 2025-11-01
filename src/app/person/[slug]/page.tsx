
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getPersonDetails } from '@/lib/tmdb';
import { extractIdFromSlug, getProfileImage, jsonLd } from '@/lib/utils';
import { PosterCard } from '@/components/media';
import { Carousel } from '@/components/ui/carousel';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { Filmography } from '@/components/media/details';
import type { Person } from 'schema-dts';

type PersonPageProps = {
  params: {
    slug: string;
  };
};

export const runtime = 'edge';

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
    const personId = extractIdFromSlug(params.slug);
    if (!personId) {
        return { title: 'Person not found' };
    }
    const person = await getPersonDetails(personId);

    if (!person) {
        return {
            title: 'Person not found',
        };
    }

    const title = `${person.name} - Filmography`;
    const description = `Explore the full filmography of ${person.name}. Discover all their movies and TV shows, read their biography, and find where to watch their work for free. Known for their role in ${person.known_for_department}.`;
    const canonicalUrl = `/person/${params.slug}`;

    return {
        title,
        description,
        keywords: [person.name, 'filmography', 'actor', 'movies', 'tv shows', person.known_for_department],
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            images: [
                {
                    url: getProfileImage(person.profile_path, 'h632'),
                    width: 632,
                    height: 948,
                    alt: person.name,
                }
            ]
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true,
              'max-video-preview': -1,
              'max-image-preview': 'large',
              'max-snippet': -1,
            },
        },
    };
}


export default async function PersonPage({ params }: PersonPageProps) {
    const personId = extractIdFromSlug(params.slug);
    if (!personId) {
        notFound();
    }

    const person = await getPersonDetails(personId);
    
    if (!person) {
        notFound();
    }
  
  const knownFor = (person.combined_credits?.cast || [])
    .filter(item => item.poster_path)
    .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))
    .slice(0, 10);
    
  const allCredits = (person.combined_credits?.cast || [])
    .filter(item => item.poster_path || item.backdrop_path)
    .sort((a, b) => {
        const dateA = 'release_date' in a ? a.release_date : a.first_air_date;
        const dateB = 'release_date' in b ? b.release_date : b.first_air_date;
        if (!dateA) return 1;
        if (!dateB) return -1;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  const personSchema: Person = {
    '@type': 'Person',
    name: person.name,
    description: person.biography,
    image: getProfileImage(person.profile_path, 'original'),
    birthDate: person.birthday || undefined,
    birthPlace: person.place_of_birth ? { '@type': 'Place', name: person.place_of_birth } : undefined,
  };


  return (
    <>
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(personSchema)}
      />
      <div className="py-12 px-4 sm:px-8">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
            <div className="aspect-[2/3] relative rounded-poster overflow-hidden shadow-2xl">
              <Image
                src={getProfileImage(person.profile_path, 'h632')}
                alt={`Portrait of ${person.name}`}
                title={`Portrait of ${person.name}`}
                fill
                className="object-cover rounded-poster"
                priority
                sizes="(max-width: 768px) 50vw, 33vw"
                data-ai-hint="person portrait"
              />
            </div>
          </div>
          <div className="w-full md:w-2/3 lg:w-3/4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">{person.name}</h1>
            <p className="text-muted-foreground mb-6">{person.known_for_department}</p>
            
            <h2 className="text-xl font-bold border-b pb-2 mb-4">Biography</h2>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed md:max-h-60 overflow-y-auto">
              {person.biography || `No biography available for ${person.name}.`}
            </p>

            {(person.birthday || person.place_of_birth) && (
              <div className="mt-6 space-y-2 text-sm">
                {person.birthday && (
                  <p><strong>Born:</strong> {new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                )}
                {person.place_of_birth && (
                  <p><strong>Place of Birth:</strong> {person.place_of_birth}</p>
                )}
              </div>
            )}

          </div>
        </div>
        
        {knownFor.length > 0 && (
          <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Known For</h2>
              <Carousel>
                {knownFor.map(item => (
                  <PosterCard key={`${item.id}-${item.credit_id}`} item={item} type={item.media_type} />
                ))}
              </Carousel>
          </div>
        )}

        {allCredits.length > 0 && (
          <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Filmography</h2>
              <Filmography allCredits={allCredits} />
          </div>
        )}
      </div>
    </>
  );
}
