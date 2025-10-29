
'use client';

import { useState, useEffect, useCallback } from 'react';
import { DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from './ui/skeleton';
import { serverList } from '@/lib/serverList';
import { getExternalIds } from '@/actions/tmdb';
import { getEmbedFallback } from '@/lib/embed-fallback';
import { useToast } from '@/hooks/use-toast';
import { PlayerUI } from './PlayerUI';


export type PlayerModalInfo = {
  tmdbId: string;
  title: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
};

type PlayerModalContentProps = {
  title: string;
  playerInfo: PlayerModalInfo;
  onClose: () => void;
};

export default function PlayerModalContent({ title, playerInfo, onClose }: PlayerModalContentProps) {
  const [currentServerIndex, setCurrentServerIndex] = useState(0);
  const [currentUrl, setCurrentUrl] = useState('');
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [isLoadingServer, setIsLoadingServer] = useState(true);
  const { toast } = useToast();
  
  const currentServer = serverList[currentServerIndex];

  const updateUrl = useCallback(async () => {
    setIsLoadingServer(true);
    setIsIframeLoading(true);
    const server = serverList[currentServerIndex];

    try {
      let url = '';
      if (server.useImdb) {
        let currentImdbId = imdbId;
        if (!currentImdbId) {
          const ids = await getExternalIds(playerInfo.type, playerInfo.tmdbId);
          currentImdbId = ids?.imdb_id || null;
          if (ids?.imdb_id) {
            setImdbId(ids.imdb_id);
          }
        }
        
        if (currentImdbId) {
            url = playerInfo.type === 'movie'
            ? server.movieLink(currentImdbId)
            : server.episodeLink(currentImdbId, playerInfo.season!, playerInfo.episode!);
        } else {
            console.error('IMDB ID required but not found for server:', server.name);
            handleFallback();
            return;
        }
      } else {
        url = playerInfo.type === 'movie'
          ? server.movieLink(playerInfo.tmdbId)
          : server.episodeLink(playerInfo.tmdbId, playerInfo.season!, playerInfo.episode!);
      }
      setCurrentUrl(url);
    } catch (error) {
      console.error('Error setting server URL:', error);
      handleFallback();
    } finally {
        setIsLoadingServer(false);
    }

  }, [currentServerIndex, imdbId, playerInfo]);


  useEffect(() => {
    updateUrl();
  }, [updateUrl]);

  const handleServerChange = (serverName: string) => {
    const newIndex = serverList.findIndex(s => s.name === serverName);
    if (newIndex !== -1) {
        setCurrentServerIndex(newIndex);
    }
  };

  const handleFallback = useCallback(async () => {
    toast({
        title: 'Trying next available server...',
        description: `The current server, ${currentServer.name}, seems to be having issues.`,
      });

    const fallback = await getEmbedFallback({
        ...playerInfo,
        servers: serverList.map(s => s.name),
        currentServer: currentServer.name,
    });
    
    if (fallback.nextServer) {
        const nextIndex = serverList.findIndex(s => s.name === fallback.nextServer);
        if (nextIndex !== -1) {
            setCurrentServerIndex(nextIndex);
        }
    } else if(fallback.embedUrl) {
        setCurrentUrl(fallback.embedUrl);
    } else {
        toast({
            variant: "destructive",
            title: 'Playback Issue',
            description: fallback.reasoning || 'All servers were tried and failed to load. Please try again later.',
        });
    }
  }, [currentServer, playerInfo, toast]);
  
  return (
      <DialogContent className="bg-black border-none p-0 max-w-full w-full h-full flex flex-col gap-0 rounded-none">
        <DialogTitle className="sr-only">{`Player for ${title}`}</DialogTitle>
        <div className="flex-grow bg-black relative group/player">
          {(isIframeLoading || isLoadingServer) && <Skeleton className="absolute inset-0" />}
          {currentUrl && !isLoadingServer && (
             <iframe
                key={currentUrl}
                src={currentUrl}
                title={title}
                className="w-full h-full border-0"
                onLoad={() => setIsIframeLoading(false)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
          )}

          <PlayerUI
            title={title}
            tmdbId={playerInfo.tmdbId}
            mediaType={playerInfo.type}
            onClose={onClose}
            currentServer={currentServer}
            serverList={serverList}
            onServerChange={handleServerChange}
            onReportBroken={handleFallback}
            isLoading={isLoadingServer}
          />
        </div>
      </DialogContent>
  );
}

