
'use server';

import { Badge } from './ui/badge';
import { getGenres } from '@/lib/tmdb-api';

type GenrePillsProps = {
  genreIds: number[];
  type: 'movie' | 'tv';
};

export async function GenrePills({ genreIds, type }: GenrePillsProps) {
  const genresMap = await getGenres(type);
  const selectedGenres = genreIds.map(id => genresMap[id]).filter(Boolean).slice(0, 4);

  return (
    <div className="flex flex-wrap gap-2">
      {selectedGenres.map((genreName) => (
        <Badge key={genreName} variant="outline" className="bg-black/20 backdrop-blur-sm border-white/20 text-white">
          {genreName}
        </Badge>
      ))}
    </div>
  );
}
