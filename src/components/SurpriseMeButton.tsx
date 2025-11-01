
'use client';

import { useState } from 'react';
import { Dices, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/dialogs';
import { surpriseMeAction } from '@/lib/tmdb';

export function SurpriseMeButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await surpriseMeAction();
      // The redirect happens on the server, so we might not even see the loading state reset.
    } catch (error) {
      console.error('Surprise me failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
            <form action={handleClick}>
                <Button variant="ghost" size="icon" type="submit" disabled={isLoading} aria-label="Surprise Me">
                    {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                    <Dices className="h-6 w-6" />
                    )}
                </Button>
            </form>
        </TooltipTrigger>
        <TooltipContent>
          <p>Surprise Me!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
