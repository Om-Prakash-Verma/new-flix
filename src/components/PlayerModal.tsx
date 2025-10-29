
'use client';

import { useState, lazy, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from './ui/skeleton';

export type PlayerModalInfo = {
  tmdbId: string;
  title: string;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
};

type PlayerModalProps = {
  title: string;
  playerInfo: PlayerModalInfo;
  children: React.ReactNode;
};

const PlayerModalContent = lazy(() => import('./PlayerModalContent'));

export function PlayerModal({ title, playerInfo, children }: PlayerModalProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      {open && (
        <Suspense fallback={<PlayerSkeleton />}>
            <PlayerModalContent 
                title={title} 
                playerInfo={playerInfo}
                onClose={() => setOpen(false)}
            />
        </Suspense>
      )}
    </Dialog>
  );
}

function PlayerSkeleton() {
    return (
        <DialogContent className="bg-black/80 border-neutral-800 p-0 max-w-[90vw] h-[90vh] flex flex-col gap-0 rounded-lg overflow-hidden backdrop-blur-xl">
            <DialogHeader className="p-4 flex-row justify-between items-center border-b border-neutral-700/80 space-y-0">
                <DialogTitle>
                  <Skeleton className="h-6 w-48" />
                </DialogTitle>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-9 w-9" />
                </div>
            </DialogHeader>
            <div className="flex-grow bg-black/50 relative">
                <Skeleton className="absolute inset-0" />
            </div>
        </DialogContent>
    )
}
