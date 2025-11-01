
import { MediaBrowser } from "@/components/media";
import { getGenres, getCountries } from "@/lib/tmdb";

export const runtime = 'edge';

export default async function TvShowsPage() {
    const [genres, countries] = await Promise.all([
      getGenres('tv'),
      getCountries()
    ]);

  return (
    <div className="py-12 px-4 sm:px-8">
        <MediaBrowser 
            title="Browse TV Shows"
            type="tv"
            genres={genres}
            countries={countries}
        />
    </div>
  );
}
