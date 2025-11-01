

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DialogHeader,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialogs';
import { Skeleton } from './ui/skeleton';
import { serverList, type Server } from '@/lib/serverList';
import { getExternalIds, getEmbedFallback, type EmbedFallbackInput } from '@/lib/tmdb';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Check, ShieldCheck, PlayCircle } from 'lucide-react';
import { Button } from './ui/button';
import Draggable from 'react-draggable';
import { cn } from '@/lib/utils';
import { Switch, Label } from './ui/forms';

//================================================================//
// 1. TYPE DEFINITIONS
//================================================================//

export type PlayerModalInfo = {
  tmdbId: string;
  title: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
};

type PlayerModalProps = {
  playerInfo: PlayerModalInfo;
  initialServer: Server;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};


//================================================================//
// 2. MAIN PLAYER MODAL COMPONENT (Entry Point)
//================================================================//
export function PlayerModal({ playerInfo, initialServer, isOpen, onOpenChange }: PlayerModalProps) {
    if (!isOpen) return null;
  
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <PlayerModalContent
          playerInfo={playerInfo}
          initialServer={initialServer}
          onClose={() => onOpenChange(false)}
        />
      </Dialog>
    );
  }

//================================================================//
// 3. PLAYER MODAL CONTENT (Main Logic)
//================================================================//

type PlayerModalContentProps = {
  playerInfo: PlayerModalInfo;
  initialServer: Server;
  onClose: () => void;
};

function PlayerModalContent({ playerInfo, initialServer, onClose }: PlayerModalContentProps) {
  const [currentServer, setCurrentServer] = useState<Server>(initialServer);
  const [currentUrl, setCurrentUrl] = useState('');
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const [isSandboxed, setIsSandboxed] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  const toggleSandbox = () => {
    setIsSandboxed(prev => !prev);
    setIframeKey(prev => prev + 1); // This forces the iframe to re-render
  };
  
  const handleServerChange = (serverName: string) => {
    const newServer = serverList.find(s => s.name === serverName);
    if (newServer) {
      setCurrentServer(newServer);
    }
  };

  const handleFallback = useCallback(async () => {
    toast({
      title: 'Trying next available server...',
      description: `The current server, ${currentServer.name}, seems to be having issues.`,
    });

    const fallbackInput: EmbedFallbackInput = {
      ...playerInfo,
      servers: serverList.map(s => s.name),
      currentServer: currentServer.name,
    };

    const fallback = await getEmbedFallback(fallbackInput);

    if (fallback.nextServer) {
      handleServerChange(fallback.nextServer);
    } else if (fallback.embedUrl) {
      setCurrentUrl(fallback.embedUrl);
    } else {
      toast({
        variant: 'destructive',
        title: 'Playback Issue',
        description:
          fallback.reasoning ||
          'All servers were tried and failed to load. Please try again later.',
      });
    }
  }, [currentServer.name, playerInfo, toast]);


  useEffect(() => {
    const updateUrl = async () => {
      setIsLoading(true);
      try {
        let url = '';
        if (currentServer.useImdb) {
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
              ? currentServer.movieLink(currentImdbId)
              : currentServer.episodeLink(currentImdbId, playerInfo.season!, playerInfo.episode!);
          } else {
            console.error('IMDB ID required but not found for server:', currentServer.name);
            handleFallback();
            return;
          }
        } else {
          url = playerInfo.type === 'movie'
            ? currentServer.movieLink(playerInfo.tmdbId)
            : currentServer.episodeLink(playerInfo.tmdbId, playerInfo.season!, playerInfo.episode!);
        }
        setCurrentUrl(url);
      } catch (error) {
        console.error('Error setting server URL:', error);
        handleFallback();
      } finally {
        setIsLoading(false);
      }
    };
    updateUrl();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentServer, playerInfo, imdbId]);

  return (
    <DialogContent className="bg-black border-none p-0 max-w-full w-full h-full flex flex-col gap-0 rounded-none">
      <DialogTitle className="sr-only">{`Player for ${playerInfo.title}`}</DialogTitle>
      <div className="flex-grow bg-black relative group/player">
        {isLoading && <Skeleton className="absolute inset-0" />}
        {!isLoading && currentUrl && (
          <FullscreenVideoPlayer
            src={currentUrl}
            title={playerInfo.title}
            isSandboxed={isSandboxed}
            iframeKey={iframeKey}
          />
        )}

        <PlayerUI
          title={playerInfo.title}
          onClose={onClose}
          currentServer={currentServer}
          serverList={serverList}
          onServerChange={handleServerChange}
          isLoading={isLoading}
          isSandboxed={isSandboxed}
          onToggleSandbox={toggleSandbox}
        />
      </div>
    </DialogContent>
  );
}

//================================================================//
// 4. FULLSCREEN VIDEO PLAYER (Iframe Renderer)
//================================================================//

type FullscreenVideoPlayerProps = {
  src: string;
  title: string;
  isSandboxed: boolean;
  iframeKey: number;
};

function FullscreenVideoPlayer({ src, title, isSandboxed, iframeKey }: FullscreenVideoPlayerProps) {
  const sandboxProps = {
    // This specific sandbox configuration is required for many embed sources.
    sandbox: "allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation",
  };
  
  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <iframe
        key={iframeKey} // Force re-render on key change to apply/remove sandbox
        src={src}
        title={title}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen"
        allowFullScreen
        {...(isSandboxed ? sandboxProps : {})}
      />
    </div>
  );
}


//================================================================//
// 5. PLAYER UI (Overlay Controls)
//================================================================//

type PlayerUIProps = {
  title: string;
  onClose: () => void;
  currentServer: Server;
  serverList: Server[];
  onServerChange: (serverName: string) => void;
  isLoading: boolean;
  isSandboxed: boolean;
  onToggleSandbox: () => void;
};

function PlayerUI({
  title,
  onClose,
  currentServer,
  serverList,
  onServerChange,
  isLoading,
  isSandboxed,
  onToggleSandbox,
}: PlayerUIProps) {
  const nodeRef = useRef(null);
  return (
    <div className="absolute inset-0 pointer-events-none md:group-hover/player:pointer-events-auto">
      
      {/* Top bar - re-enable pointer events here */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent opacity-100 md:opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg md:text-xl font-bold text-white text-shadow-lg line-clamp-1">
            {title}
          </h1>
        </div>
      </div>

      {/* Draggable control panel - re-enable pointer events for the draggable area */}
      <Draggable nodeRef={nodeRef} handle=".handle" cancel="button, input, textarea, .no-drag">
        <div
          ref={nodeRef}
          className="absolute top-4 right-4 z-10 opacity-100 md:opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 pointer-events-auto"
        >
          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md p-2 rounded-lg border border-white/10 handle cursor-move">
            <div className="flex items-center gap-2 px-2 no-drag">
              <Label
                htmlFor="sandbox-switch"
                className={cn(
                  'text-xs font-bold uppercase tracking-wider cursor-pointer',
                  isSandboxed ? 'text-green-400' : 'text-red-400'
                )}
              >
                Sandbox {isSandboxed ? 'ON' : 'OFF'}
              </Label>
              <Switch
                id="sandbox-switch"
                checked={isSandboxed}
                onCheckedChange={onToggleSandbox}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  title="Try another source"
                  className="inline-flex items-center justify-center text-white hover:text-accent-foreground no-drag"
                  onClick={e => {
                    if (isLoading) e.preventDefault();
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="h-9 w-9 animate-spin" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: '36px', height: '36px' }}
                    >
                      <path d="M17.4776 10.0001C17.485 10 17.4925 10 17.5 10C19.9853 10 22 12.0147 22 14.5C22 16.9853 19.9853 19 17.5 19H7C4.23858 19 2 16.7614 2 14C2 11.4003 3.98398 9.26407 6.52042 9.0227M17.4776 10.0001C17.4924 9.83536 17.5 9.66856 17.5 9.5C17.5 6.46243 15.0376 4 12 4C9.12324 4 6.76233 6.20862 6.52042 9.0227M17.4776 10.0001C17.3753 11.1345 16.9286 12.1696 16.2428 13M6.52042 9.0227C6.67826 9.00768 6.83823 9 7 9C8.12582 9 9.16474 9.37209 10.0005 10"></path>
                    </svg>
                  )}
                  <span className="sr-only">Try another source</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-background/80 border-border backdrop-blur-md mb-2 mr-2 p-2 space-y-1">
                <DropdownMenuRadioGroup
                  value={currentServer.name}
                  onValueChange={onServerChange}
                >
                  {serverList.map(server => (
                    <DropdownMenuRadioItem
                      key={server.id}
                      value={server.name}
                      className={cn(
                        'flex justify-between items-center cursor-pointer p-2 rounded-md border border-transparent transition-all',
                        'focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent/50',
                        'hover:border-primary/50',
                        currentServer.name === server.name && 'border-primary'
                      )}
                    >
                      <span>{server.name}</span>
                      {currentServer.name === server.name && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Draggable>
    </div>
  );
}


//================================================================//
// 6. SKELETON LOADER
//================================================================//

function PlayerSkeleton() {
  return (
    <DialogContent className="bg-black/80 border-neutral-800 p-0 max-w-[90vw] h-[90vh] flex flex-col gap-0 rounded-lg overflow-hidden backdrop-blur-xl">
      <div className="p-4 flex-row justify-between items-center border-b border-neutral-700/80 space-y-0">
          <Skeleton className="h-6 w-48" />
      </div>
      <div className="flex-grow bg-black/50 relative">
        <Skeleton className="absolute inset-0" />
      </div>
    </DialogContent>
  );
}

//================================================================//
// 7. SERVER SELECTION MODAL & PLAY BUTTON
//================================================================//

type ServerSelectionModalProps = {
  playerInfo: PlayerModalInfo;
  children: React.ReactNode;
};

export function ServerSelectionModal({ playerInfo, children }: ServerSelectionModalProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);

  const handleServerSelect = (server: Server) => {
    setSelectedServer(server);
    setDialogOpen(false);
    setPlayerOpen(true);
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md bg-card/90 backdrop-blur-lg border-border">
          <DialogHeader className="text-center space-y-3">
            <DialogTitle className="text-2xl">Select a Video Source</DialogTitle>
            <DialogDescription>
              Choose a server from the list below to start playing.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 bg-green-950/50 text-green-300 border border-green-700/30 p-3 rounded-lg">
                <div className="flex items-center gap-3 text-xs">
                    <ShieldCheck className="h-8 w-8 flex-shrink-0" />
                    <div>
                        <p className="font-bold">PRO TIP: Use the 'Sandbox ON' switch in the player to block most ads.</p>
                        <p className="text-green-400/80">Only turn it OFF if the video doesn't load.</p>
                    </div>
                </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
            {serverList.map(server => (
              <Button
                key={server.id}
                variant="outline"
                className="h-auto justify-center p-3 text-sm font-semibold whitespace-normal hover:bg-primary/10 hover:border-primary/50 transition-all"
                onClick={() => handleServerSelect(server)}
              >
                {server.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {selectedServer && (
        <PlayerModal
          playerInfo={playerInfo}
          initialServer={selectedServer}
          isOpen={playerOpen}
          onOpenChange={setPlayerOpen}
        />
      )}
    </>
  );
}

export function PlayButton({ title, mediaType, tmdbId, season, episode, children }: {
  title: string;
  mediaType: 'movie' | 'tv';
  tmdbId: number;
  season?: number;
  episode?: number;
  children?: React.ReactNode;
}) {
  
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
    <ServerSelectionModal playerInfo={playerInfo}>
      {triggerContent}
    </ServerSelectionModal>
  );
}
    

    