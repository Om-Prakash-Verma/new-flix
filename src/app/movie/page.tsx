
import { MediaBrowser } from "@/components/media";
import { getGenres, getCountries } from "@/lib/tmdb";

export const runtime = 'edge';

export default async function MoviesPage() {
  const [genres, countries] = await Promise.all([
    getGenres('movie'),
    getCountries()
  ]);

  return (
    <div className="py-12 px-4 sm:px-8">
        <MediaBrowser 
            title="Browse Movies"
            type="movie"
            genres={genres}
            countries={countries}
        />
    </div>
  );
}
