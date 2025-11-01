

'use client'

import React, { useState, useEffect, useCallback, useMemo, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { getSeasonDetails, fetchRecommendations, fetchReviews } from '@/lib/tmdb';
import type { CastMember, MovieDetails, TVShowDetails, Season, SeasonDetails as SeasonDetailsType, Episode, Video, WatchProviders as WatchProvidersType, ProductionCompany, PersonCombinedCreditsCast, Movie, TVShow, Review } from '@/lib/tmdb-schemas';
import { slugify, formatRuntime, getBackdropImage, getPosterImage, getProfileImage } from '@/lib/utils';
import { StarRating, PosterCard } from '@/components/media';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, ScrollArea, AspectRatio, Avatar, AvatarFallback, AvatarImage, CardContent, CardFooter, CardHeader } from '@/components/ui/layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/forms';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayButton } from '@/components/PlayerModal';
import { Carousel, ShadcnCarousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialogs';
import { ChevronLeft, ChevronRight, PlayCircle, Loader2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


//================================================================//
// 1. MEDIA HERO
//================================================================//

type MediaHeroProps = {
  item: MovieDetails | TVShowDetails;
  type: 'movie' | 'tv';
};

export function MediaHero({ item, type }: MediaHeroProps) {

  const isMovie = (item: MovieDetails | TVShowDetails): item is MovieDetails => type === 'movie';

  const title = isMovie(item) ? item.title : item.name;
  const releaseDate = isMovie(item) ? item.release_date : item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const runtime = isMovie(item) ? item.runtime : (item.episode_run_time && item.episode_run_time.length > 0 ? item.episode_run_time[0] : null);
  const uniqueCountries = [...new Set(item.production_companies.map(c => c.origin_country).filter(Boolean))];

  return (
    <div className="relative h-auto min-h-[50vh] md:min-h-0 w-full pt-8 md:pt-0">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />

      <div className="relative z-10 flex h-full items-end py-8 md:py-12 px-4 sm:px-8">
        <div className="w-full max-w-4xl text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-3 text-shadow-lg">
            {title}
          </h1>
          {isMovie(item) && item.tagline && (
            <p className="text-lg italic text-muted-foreground mb-4 text-shadow">{item.tagline}</p>
          )}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 mb-4 text-shadow">
            <StarRating rating={item.vote_average} />
            {year && (
              <Link href={`/year/${year}`} className="text-sm hover:underline" prefetch={false}>{year}</Link>
            )}
            {runtime && <span className="text-sm text-muted-foreground">•</span>}
            {runtime && <span className="text-sm">{formatRuntime(runtime)}</span>}
          </div>
          <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
            {item.genres.map(genre => (
              <Link key={genre.id} href={`/genre/${slugify(genre.name)}-${genre.id}`} prefetch={false}>
                <Badge
                  variant="outline"
                  className="bg-black/20 backdrop-blur-sm border-white/20 text-white rounded-full hover:bg-white/30 transition-colors">
                  {genre.name}
                </Badge>
              </Link>
            ))}
          </div>
          {uniqueCountries.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
              {uniqueCountries.map(countryCode => (
                <Link key={countryCode} href={`/country/${countryCode}`} prefetch={false}>
                  <Badge
                    variant="outline"
                    className="bg-black/20 backdrop-blur-sm border-white/20 text-white rounded-full hover:bg-white/30 transition-colors">
                    {countryCode}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          <p className="text-sm md:text-base text-foreground/80 line-clamp-3 mb-8 max-w-2xl text-shadow mx-auto md:mx-0">
            {item.overview}
          </p>

          <div className="flex flex-col gap-8 items-center md:items-start justify-center md:justify-start">
            <div className="md:hidden">
              <ProductionCompanies companies={item.production_companies} />
            </div>
            <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
              {isMovie(item) ? (
                <PlayButton
                  mediaType="movie"
                  tmdbId={item.id}
                  title={item.title}
                />
              ) : (
                <PlayButton
                  mediaType="tv"
                  tmdbId={item.id}
                  season={item.seasons.find(s => s.season_number > 0)?.season_number || 1}
                  episode={1}
                  title={`${item.name} - S${item.seasons.find(s => s.season_number > 0)?.season_number || 1}E1`}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block absolute md:top-8 md:right-8 md:z-20">
        <ProductionCompanies companies={item.production_companies} />
      </div>
    </div>
  );
}

//================================================================//
// 2. BACKGROUND IMAGE (From src/components/BackgroundImage.tsx)
//================================================================//

type BackgroundImageProps = {
  posterUrl: string;
  backdropUrl: string;
};

export function BackgroundImage({ posterUrl, backdropUrl }: BackgroundImageProps) {

  const backgroundStyles: React.CSSProperties = {
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
    filter: 'blur(4px)',
  };

  return (
    <>
      <div
        className='fixed inset-0 z-[-1] bg-background md:hidden'
        style={{
          backgroundImage: `url(${posterUrl})`,
          ...backgroundStyles,
        }}
      />
      <div
        className='fixed inset-0 z-[-1] bg-background hidden md:block'
        style={{
          backgroundImage: `url(${backdropUrl})`,
          ...backgroundStyles,
        }}
      />
    </>
  );
}

//================================================================//
// 3. CREDITS CAROUSEL
//================================================================//

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
      <Carousel>
        {filteredCredits.slice(0, 20).map((person) => (
          <div key={person.id} className="w-[140px]">
            <div className="group">
              <Link href={`/person/${slugify(person.name)}-${person.id}`} prefetch={false}>
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
                <Link href={`/person/${slugify(person.name)}-${person.id}`} prefetch={false}>
                  <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">
                    {person.name}
                  </h3>
                </Link>
                <p className="text-muted-foreground line-clamp-1">
                  {person.character || person.job}
                </p>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  );
}

//================================================================//
// 4. SEASONS DISPLAY
//================================================================//

type SeasonsDisplayProps = {
  seasons: Season[];
  showId: number;
  showName: string;
  initialData: SeasonDetailsType | null;
};

export function SeasonsDisplay({ seasons, showId, showName, initialData }: SeasonsDisplayProps) {
  const filteredSeasons = useMemo(() => seasons.filter(s => s.season_number > 0 && s.episode_count && s.episode_count > 0), [seasons]);

  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(
    (initialData?.season_number || filteredSeasons[0]?.season_number)?.toString()
  );
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetailsType | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSeasonDetails = useCallback(async (seasonNumber: string) => {
    if (initialData?.season_number === parseInt(seasonNumber)) {
      setSeasonDetails(initialData);
      return;
    }
    setIsLoading(true);
    const details = await getSeasonDetails(showId, parseInt(seasonNumber));
    setSeasonDetails(details);
    setIsLoading(false);
  }, [showId, initialData]);

  useEffect(() => {
    if (!selectedSeasonNumber) return;
    if (initialData?.season_number?.toString() !== selectedSeasonNumber) {
      fetchSeasonDetails(selectedSeasonNumber);
    } else {
      setSeasonDetails(initialData);
    }
  }, [selectedSeasonNumber, fetchSeasonDetails, initialData]);

  const handleSeasonChange = (seasonNumber: string) => {
    setSelectedSeasonNumber(seasonNumber);
  };

  const selectedSeasonInfo = filteredSeasons.find(
    s => s.season_number.toString() === selectedSeasonNumber
  );

  if (filteredSeasons.length === 0) {
    return <p>No season information available.</p>;
  }

  return (
    <section>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Seasons</h2>
        <Select value={selectedSeasonNumber} onValueChange={handleSeasonChange}>
          <SelectTrigger className="w-[180px] bg-secondary border-border">
            <SelectValue placeholder="Select a season" />
          </SelectTrigger>
          <SelectContent>
            {filteredSeasons.map(season => (
              <SelectItem key={season.id} value={season.season_number.toString()}>
                {season.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSeasonInfo && (
        <div className="space-y-2 mb-8">
          {selectedSeasonInfo.air_date && (
            <div className="text-muted-foreground text-sm">
              {selectedSeasonInfo.episode_count} Episodes &bull; Premiered {new Date(selectedSeasonInfo.air_date).getFullYear()}
            </div>
          )}
          <p className="text-sm max-w-2xl text-foreground/80">{selectedSeasonInfo.overview}</p>
        </div>
      )}

      <ScrollArea className="h-[450px] pr-4 -mr-4">
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: selectedSeasonInfo?.episode_count || 10 }).map((_, i) => <EpisodeSkeleton key={i} />)
          ) : (
            seasonDetails?.episodes.map(episode => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                showId={showId}
                showName={showName}
                seasonNumber={seasonDetails.season_number}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </section>
  );
}

function EpisodeCard({ episode, showId, showName, seasonNumber }: { episode: Episode; showId: number; showName: string, seasonNumber: number }) {
  const episodeTitle = `${showName} season ${seasonNumber} episode ${episode.episode_number}: ${episode.name}`;
  const stillImageUrl = getBackdropImage(episode.still_path, 'w780');

  return (
    <Card className="bg-card/80 rounded-lg overflow-hidden">
      <div className="md:flex md:items-start md:gap-4 p-3">
        <div className="w-full md:w-48 flex-shrink-0 mb-3 md:mb-0">
          <div className="aspect-video relative rounded-md bg-muted/50 overflow-hidden">
            <Image
              src={stillImageUrl}
              alt={`Still image for ${episodeTitle}`}
              title={`Still image for ${episodeTitle}`}
              fill
              loading="lazy"
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 192px"
              data-ai-hint="tv episode still"
            />
          </div>
        </div>
        <div className="flex-grow space-y-2">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-semibold line-clamp-2 text-sm md:text-base flex-1">
              {episode.episode_number}. {episode.name}
            </h4>
            <div className="md:hidden flex-shrink-0">
              <PlayButton
                mediaType="tv"
                tmdbId={showId}
                season={seasonNumber}
                episode={episode.episode_number}
                title={`${showName} - S${seasonNumber}E${episode.episode_number} - ${episode.name}`}
              >
                <Button size="icon" className="h-9 w-9 rounded-full">
                  <PlayCircle className="h-5 w-5" />
                </Button>
              </PlayButton>
            </div>
          </div>
          {episode.vote_count > 0 && <StarRating rating={episode.vote_average} />}
          <p className="text-xs text-muted-foreground line-clamp-2">{episode.overview}</p>
        </div>
        <div className="self-center ml-auto pl-4 hidden md:block">
          <PlayButton
            mediaType="tv"
            tmdbId={showId}
            season={seasonNumber}
            episode={episode.episode_number}
            title={`${showName} - S${seasonNumber}E${episode.episode_number} - ${episode.name}`}
          />
        </div>
      </div>
    </Card>
  );
}

function EpisodeSkeleton() {
  return (
    <Card className="flex items-start p-3 gap-3 bg-card/80 rounded-lg">
      <div className="w-28 md:w-48 flex-shrink-0">
        <Skeleton className="aspect-video rounded-md" />
      </div>
      <div className="flex-grow space-y-2 self-center w-full">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-8 w-full hidden sm:block" />
      </div>
      <div className="self-center ml-auto pl-2">
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </Card>
  );
}


//================================================================//
// 5. TRAILERS CAROUSEL
//================================================================//

type TrailersCarouselProps = {
  videos: Video[];
};

export function TrailersCarousel({ videos }: TrailersCarouselProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const officialTrailers = videos.filter(v => v.site === 'YouTube' && v.official && v.type === 'Trailer');
  const otherVideos = videos.filter(v => v.site === 'YouTube' && !officialTrailers.includes(v));
  const displayVideos = [...officialTrailers, ...otherVideos].slice(0, 10);

  if (displayVideos.length === 0) return null;

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Trailers & Videos</h2>
      <ShadcnCarousel
        opts={{
          align: 'start',
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4 px-4 sm:px-8 items-start">
          {displayVideos.map(video => (
            <CarouselItem key={video.id} className="pl-4 basis-full sm:basis-1/2 md:basis-auto md:w-[320px]">
              <div
                className="group relative cursor-pointer rounded-poster overflow-hidden shadow-lg"
                onClick={() => handleVideoClick(video)}
              >
                <Image
                  src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                  alt={`Thumbnail for video: ${video.name}`}
                  title={`Thumbnail for video: ${video.name}`}
                  width={320}
                  height={180}
                  loading="lazy"
                  className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-poster"
                  sizes="(max-width: 640px) 100vw, 320px"
                  data-ai-hint="video trailer"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="w-16 h-16 text-white/80 drop-shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                </div>
                <div className="absolute bottom-0 left-0 p-3 w-full">
                  <p className="text-white text-sm font-bold line-clamp-1 text-shadow">
                    {video.name}
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
      </ShadcnCarousel>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedVideo && (
          <DialogContent className="bg-black/80 border-neutral-800 p-0 max-w-screen-lg w-full flex flex-col gap-0 rounded-lg overflow-hidden backdrop-blur-xl">
            <DialogHeader className="p-4 flex-row justify-between items-center border-b border-neutral-700/80 space-y-0">
              <DialogTitle className="text-lg line-clamp-1">{selectedVideo.name}</DialogTitle>
            </DialogHeader>
            <AspectRatio ratio={16 / 9} className="bg-black w-full">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.key}?autoplay=1&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </AspectRatio>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}


//================================================================//
// 6. WATCH PROVIDERS
//================================================================//

type WatchProvidersProps = {
  providers: WatchProvidersType['results'][string];
};

export function WatchProviders({ providers }: WatchProvidersProps) {
  const freeProviders = providers.free || [];

  if (freeProviders.length === 0) return null;

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


//================================================================//
// 7. PRODUCTION COMPANIES
//================================================================//

type ProductionCompaniesProps = {
  companies: ProductionCompany[];
};

export function ProductionCompanies({ companies }: ProductionCompaniesProps) {
  const companiesWithLogos = companies.filter(c => c.logo_path);

  if (companiesWithLogos.length === 0) return null;

  return (
    <div className="flex flex-col items-center md:items-end gap-4">
      <h2 className="text-sm font-bold text-white text-shadow uppercase tracking-wider">Production</h2>
      <div className="flex flex-row md:flex-col flex-wrap items-center justify-center md:items-end gap-4">
        {companiesWithLogos.slice(0, 3).map(company => (
          <Link
            key={company.id}
            href={`/company/${slugify(company.name)}-${company.id}`}
            className="group"
            prefetch={false}
          >
            <div className="bg-white p-2 h-14 w-28 flex items-center justify-center transition-colors group-hover:bg-gray-200 rounded-lg overflow-hidden">
              <div className="relative w-full h-full">
                <Image
                  src={getPosterImage(company.logo_path, 'w185')}
                  alt={`Logo for ${company.name}`}
                  title={`Logo for ${company.name}`}
                  fill
                  className="object-contain"
                  sizes="112px"
                  data-ai-hint="company logo"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


//================================================================//
// 8. RECOMMENDATIONS (From src/components/Recommendations.tsx)
//================================================================//

type RecommendationsProps = {
  id: number;
  type: 'movie' | 'tv';
  initialData: {
    results: (Movie | TVShow)[];
  } | null;
};

export function Recommendations({ type, initialData }: RecommendationsProps) {

  if (!initialData || initialData.results.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">More Like This</h2>
      <Carousel>
        {initialData.results.map(item => (
          <PosterCard key={item.id} item={item} type={type} />
        ))}
      </Carousel>
    </section>
  );
}


//================================================================//
// 9. FILMOGRAPHY
//================================================================//

type FilmographyProps = {
  allCredits: PersonCombinedCreditsCast[];
};

export function Filmography({ allCredits }: FilmographyProps) {

  return (
    <Card className="bg-card/80 rounded-lg">
      <ScrollArea className="h-[500px]">
        <div className="p-4 space-y-4">
          {allCredits.map((item) => (
            <CreditRow key={`${item.id}-${item.credit_id}`} item={item} />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

function CreditRow({ item }: { item: PersonCombinedCreditsCast }) {
  const title = 'title' in item ? item.title : item.name;
  const releaseDate = 'release_date' in item ? item.release_date : item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '----';
  const href = `/${item.media_type}/${slugify(title)}-${item.id}`;

  return (
    <div className="flex items-center gap-4 text-sm hover:bg-muted/50 p-2 rounded-md -mx-2">
      <span className="font-bold w-12 text-center">{year}</span>
      <div className="flex-grow">
        <Link href={href} className="font-semibold hover:text-primary transition-colors" prefetch={false}>{title}</Link>
        {item.character && <p className="text-xs text-muted-foreground">as {item.character}</p>}
      </div>
    </div>
  );
}

//================================================================//
// 10. REVIEWS (From src/components/Reviews.tsx)
//================================================================//

type ReviewsProps = {
  id: number;
  type: 'movie' | 'tv';
  initialData: {
    results: Review[];
    total_pages: number;
    page: number;
  } | null;
};

export function Reviews({ id, type, initialData }: ReviewsProps) {
  const [reviews, setReviews] = useState(initialData?.results || []);
  const [page, setPage] = useState(initialData?.page || 1);
  const [totalPages, setTotalPages] = useState(initialData?.total_pages || 1);
  const [isPending, startTransition] = useTransition();

  const hasMore = page < totalPages;

  const loadMoreReviews = useCallback(async () => {
    if (isPending || !hasMore) return;

    startTransition(async () => {
      const nextPage = page + 1;
      try {
        const data = await fetchReviews(type, id, nextPage);
        setReviews(prev => [...prev, ...data.results]);
        setPage(nextPage);
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error('Failed to fetch more reviews:', error);
      }
    });
  }, [type, id, page, isPending, hasMore]);

  if (!initialData) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          <p>No reviews available yet.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      <div className="space-y-6">
        {reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button onClick={loadMoreReviews} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Load More
          </Button>
        </div>
      )}

      {!isPending && !hasMore && reviews.length > 0 && (
        <div className="h-10 flex justify-center items-center mt-8">
          <p className="text-muted-foreground">You've reached the end.</p>
        </div>
      )}
    </section>
  );
}

//================================================================//
// 11. REVIEW CARD
//================================================================//

type ReviewCardProps = {
  review: Review;
};

export function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');

  const author = review.author_details;

  useEffect(() => {
    if (review.created_at) {
      setFormattedDate(format(new Date(review.created_at), 'MMMM d, yyyy'));
    }
  }, [review.created_at]);

  const avatarUrl = author.avatar_path
    ? getProfileImage(author.avatar_path, 'w185')
    : null;

  // TMDB review content can contain markdown-like syntax. This is a simple conversion.
  const formatContent = (content: string) => {
    return content.replace(/\r\n/g, '<br />');
  };

  const hasLongContent = review.content.length > 500;

  return (
    <Card className="bg-card/80 rounded-lg">
      <CardHeader className="flex-row items-center gap-4">
        <Avatar className="rounded-full overflow-hidden">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={`Avatar of ${author.username}`} loading="lazy" />}
          <AvatarFallback>{author.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{author.name || author.username}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {author.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{author.rating}/10</span>
              </div>
            )}
            <p>{formattedDate}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn("text-sm text-foreground/80 leading-relaxed relative", {
            'max-h-48 overflow-hidden': hasLongContent && !isExpanded,
          })}
        >
          <p dangerouslySetInnerHTML={{ __html: formatContent(review.content) }} />
          {hasLongContent && !isExpanded && (
            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-card/80 to-transparent" />
          )}
        </div>
      </CardContent>
      {hasLongContent && (
        <CardFooter>
          <Button variant="link" className="p-0 h-auto" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Read less' : 'Read more'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

