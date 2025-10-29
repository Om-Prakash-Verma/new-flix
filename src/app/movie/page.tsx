
import { fetchDiscoverMedia } from "@/actions/discover";
import { MediaGrid } from "@/components/MediaGrid";

export const runtime = 'edge';

export default async function MoviesPage() {
  const initialMovies = await fetchDiscoverMedia({ type: 'movie', page: 1, filters: { sort: 'popularity.desc' }});

  return (
    <div className="py-12 px-4 sm:px-8">
        <h1 className="text-4xl font-bold mb-8">Browse Movies</h1>
        <MediaGrid
            initialItems={initialMovies.results}
            type="movie"
            initialPage={1}
            totalPages={initialMovies.total_pages}
        />
    </div>
  );
}
