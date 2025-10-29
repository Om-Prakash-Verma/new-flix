
import { getGenres } from "@/lib/tmdb";
import { MediaBrowser } from "@/components/MediaBrowser";

export const runtime = 'edge';

export default async function TvShowsPage() {
  const tvGenres = await getGenres('tv');

  return (
    <div className="py-12 px-4 sm:px-8">
      <MediaBrowser
        title="Browse TV Shows"
        type="tv"
        genres={tvGenres}
      />
    </div>
  );
}
