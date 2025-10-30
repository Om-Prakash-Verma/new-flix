
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import type { Season, SeasonDetails, Episode } from '@/lib/tmdb-schemas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { PlayButton } from './PlayButton';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { getSeasonDetails } from '@/lib/tmdb';
import { StarRating } from './StarRating';
import { getBackdropImage } from '@/lib/tmdb-images';
import { Button } from './ui/button';
import { PlayCircle } from 'lucide-react';

type SeasonsDisplayProps = {
  seasons: Season[];
  showId: number;
  showName: string;
  initialData: SeasonDetails | null;
};

export function SeasonsDisplay({ seasons, showId, showName, initialData }: SeasonsDisplayProps) {
  const filteredSeasons = useMemo(() => seasons.filter(s => s.season_number > 0 && s.episode_count && s.episode_count > 0), [seasons]);

  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(
    (initialData?.season_number || filteredSeasons[0]?.season_number)?.toString()
  );
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(initialData);
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
