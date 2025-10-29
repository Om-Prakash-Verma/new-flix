'use client';

import type { PersonCombinedCreditsCast } from '@/lib/tmdb-schemas';
import { CreditRow } from '@/components/CreditRow';
import { Card } from '@/components/ui/card';

type FilmographyProps = {
  allCredits: PersonCombinedCreditsCast[];
};

export function Filmography({ allCredits }: FilmographyProps) {

  return (
    <Card className="bg-card/80 rounded-lg">
      <div className="p-4 space-y-4">
        {allCredits.map((item) => (
          <CreditRow key={`${item.id}-${item.credit_id}`} item={item} />
        ))}
      </div>
    </Card>
  );
}
