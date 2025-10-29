
'use client';

import { PlayerModal } from './PlayerModal';
import { Button } from './ui/button';
import { PlayCircle } from 'lucide-react';
import type { PlayerModalInfo } from './PlayerModal';

type PlayButtonProps = {
  title: string;
  mediaType: 'movie' | 'tv';
  tmdbId: number;
  season?: number;
  episode?: number;
  children?: React.ReactNode;
};

export function PlayButton({ title, mediaType, tmdbId, season, episode, children }: PlayButtonProps) {
  
  const playerInfo: PlayerModalInfo = {
    tmdbId: String(tmdbId),
    title,
    type: mediaType,
    ...(season && { season }),
    ...(episode && { episode }),
  };

  const triggerContent = children || (
    <Button size="lg" className="font-bold text-base transition-all duration-300 hover:scale-105">
        <PlayCircle className="mr-2 h-6 w-6" />
        Play
    </Button>
  );

  return (
    <PlayerModal title={title} playerInfo={playerInfo}>
      {triggerContent}
    </PlayerModal>
  );
}
