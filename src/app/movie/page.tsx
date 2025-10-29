
import { getGenres } from "@/lib/tmdb";
import { MediaBrowser } from "@/components/MediaBrowser";

export const runtime = 'edge';

export default async function MoviesPage() {
  const movieGenres = await getGenres('movie');

  return (
    <div className="py-12 px-4 sm:px-8">
      <MediaBrowser
        title="Browse Movies"
        type="movie"
        genres={movieGenres}
      />
    </div>
  );
}
