
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Server, serverList } from '@/lib/serverList';
import type { PlayerModalInfo } from './PlayerModal';
import { PlayerModal } from './PlayerModal';
import { Button } from './ui/button';
import { ShieldCheck } from 'lucide-react';

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
