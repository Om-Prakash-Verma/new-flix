
'use client';

import { useRef } from 'react';
import { ArrowLeft, ExternalLink, Loader2, Check } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import type { Server as ServerType } from '@/lib/serverList';
import Link from 'next/link';
import Draggable from 'react-draggable';
import { cn } from '@/lib/utils';

type PlayerUIProps = {
    title: string;
    tmdbId: string;
    mediaType: 'movie' | 'tv';
    onClose: () => void;
    currentServer: ServerType;
    serverList: ServerType[];
    onServerChange: (serverName: string) => void;
    isLoading: boolean;
};

export function PlayerUI({
    title,
    tmdbId,
    mediaType,
    onClose,
    currentServer,
    serverList,
    onServerChange,
    isLoading,
}: PlayerUIProps) {
    const nodeRef = useRef(null);
    return (
        <>
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 hover:text-white">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-lg md:text-xl font-bold text-white text-shadow-lg line-clamp-1">{title}</h1>
                </div>
            </div>

            <Draggable nodeRef={nodeRef} handle=".handle">
                <div ref={nodeRef} className="absolute top-4 right-4 z-10 md:opacity-0 group-hover/player:opacity-100 transition-opacity duration-300 handle cursor-move">
                    <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md p-2 rounded-lg border border-white/10">
                        <Link href={`https://www.themoviedb.org/${mediaType}/${tmdbId}`} target="_blank" rel="noopener noreferrer" prefetch={false}>
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                <span className="hidden md:inline">TMDB</span>
                            </Button>
                        </Link>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    title="Try another source"
                                    className="inline-flex items-center justify-center text-white hover:text-accent-foreground"
                                >
                                    {isLoading ? <Loader2 className="h-9 w-9 animate-spin" /> : (
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '36px', height: '36px' }}>
                                            <path d="M17.4776 10.0001C17.485 10 17.4925 10 17.5 10C19.9853 10 22 12.0147 22 14.5C22 16.9853 19.9853 19 17.5 19H7C4.23858 19 2 16.7614 2 14C2 11.4003 3.98398 9.26407 6.52042 9.0227M17.4776 10.0001C17.4924 9.83536 17.5 9.66856 17.5 9.5C17.5 6.46243 15.0376 4 12 4C9.12324 4 6.76233 6.20862 6.52042 9.0227M17.4776 10.0001C17.3753 11.1345 16.9286 12.1696 16.2428 13M6.52042 9.0227C6.67826 9.00768 6.83823 9 7 9C8.12582 9 9.16474 9.37209 10.0005 10"></path>
                                        </svg>
                                    )}
                                    <span className="sr-only">Try another source</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 bg-background/80 border-border backdrop-blur-md mb-2 mr-2 p-2 space-y-1">
                                <DropdownMenuRadioGroup value={currentServer.name} onValueChange={onServerChange}>
                                {serverList.map((server) => (
                                    <DropdownMenuRadioItem 
                                        key={server.id} 
                                        value={server.name} 
                                        className={cn(
                                            "flex justify-between items-center cursor-pointer p-2 rounded-md border border-transparent transition-all",
                                            "focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent/50",
                                            "hover:border-primary/50",
                                            currentServer.name === server.name && "border-primary"
                                        )}
                                    >
                                        <span>{server.name}</span>
                                        {currentServer.name === server.name && <Check className="h-4 w-4 text-primary" />}
                                    </DropdownMenuRadioItem>
                                ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </Draggable>
        </>
    );
}
