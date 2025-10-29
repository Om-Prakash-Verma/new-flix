
import { fetchDiscoverMedia } from "@/actions/discover";
import { MediaGrid } from "@/components/MediaGrid";

export const runtime = 'edge';

export default async function TvShowsPage() {
  const initialShows = await fetchDiscoverMedia({ type: 'tv', page: 1, filters: { sort: 'popularity.desc' }});

  return (
    <div className="py-12 px-4 sm:px-8">
        <h1 className="text-4xl font-bold mb-8">Browse TV Shows</h1>
        <MediaGrid
            initialItems={initialShows.results}
            type="tv"
            initialPage={1}
            totalPages={initialShows.total_pages}
        />
    </div>
  );
}
