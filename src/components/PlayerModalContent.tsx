
'use client';

import { useState, useEffect, useCallback } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Loader2, Server, X, AlertTriangle } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { serverList } from '@/lib/serverList';
import { getExternalIds } from '@/actions/tmdb';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getEmbedFallback } from '@/lib/embed-fallback';
import { useToast } from '@/hooks/use-toast';


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
      <DialogContent className="bg-black/80 border-neutral-800 p-0 max-w-[90vw] h-[90vh] flex flex-col gap-0 rounded-lg overflow-hidden backdrop-blur-xl">
        <DialogHeader className="p-4 flex-row justify-between items-center border-b border-neutral-700/80 space-y-0">
          <DialogTitle className="text-lg line-clamp-1">{title}</DialogTitle>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="secondary" className="hidden sm:block">{currentServer.name}</Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isLoadingServer}>
                  {isLoadingServer ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Server className="mr-2 h-4 w-4" />
                  )}
                  <span className="hidden md:inline">Change Server</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuRadioGroup value={currentServer.name} onValueChange={handleServerChange}>
                  {serverList.map((server) => (
                    <DropdownMenuRadioItem key={server.id} value={server.name} className="flex justify-between">
                      <span>{server.name}</span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={handleFallback} title="Try next server">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Report Broken</span>
            </Button>

            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onClose}>
                <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-grow bg-black/50 relative">
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
        </div>
      </DialogContent>
  );
}
