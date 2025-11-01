

import type { Metadata } from 'next';
import { HeroSlideshow } from '@/components/Hero';
import {
  fetchAllHomepageData,
  getGenres,
} from '@/lib/tmdb';
import { PosterCard } from '@/components/media';
import { Carousel } from '@/components/ui/carousel';
import { RecentlyReleased } from '@/components/RecentlyReleased';
import { FeaturedCollections } from '@/components/FeaturedCollections';
import type { Movie, TVShow } from '@/lib/tmdb-schemas';
import { BackgroundImage } from '@/components/media/details';
import { getPosterImage, getBackdropImage, jsonLd } from '@/lib/utils';
import type { WebSite } from 'schema-dts';
import { siteConfig } from '@/config/site';

export const runtime = 'edge';

export const metadata: Metadata = {
    title: 'Watch Movies & TV Shows Online for Free | '+ siteConfig.name,
    alternates: {
        canonical: '/',
    },
};

// Function to shuffle content for the hero slideshow
function shuffleContent(items: (Movie | TVShow)[]) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

async function HomePage() {
  const [
    homepageData,
    movieGenresMap,
    tvGenresMap,
  ] = await Promise.all([
    fetchAllHomepageData(),
    getGenres('movie'),
    getGenres('tv'),
  ]);

  const {
    popularMovies,
    topRatedMovies,
    trendingMovies,
    popularTVShows,
    topRatedTVShows,
    trendingTVShows,
  } = homepageData;

  const allGenresMap = { ...movieGenresMap, ...tvGenresMap };

  // Use a mix of popular movies and tv shows for the hero
  const heroSourceItems = [...popularMovies, ...popularTVShows];

  const heroItemsSource = shuffleContent(heroSourceItems.slice(0, 10)).map(item => {
    // The popular endpoints have a clear media type in the schema, but we can be defensive
    const media_type = 'title' in item ? 'movie' : 'tv';
    const genreNames = item.genre_ids?.map(id => allGenresMap[id]).filter(Boolean) || [];
    return { ...item, genreNames, media_type };
  });

  const backgroundItem = heroItemsSource[0];
  const slideshowItems = heroItemsSource.length > 1 ? heroItemsSource.slice(1, 6) : []; // Limit to 5 for the slideshow

  const backgroundPosterUrl = backgroundItem ? getPosterImage(backgroundItem.poster_path) : '';
  const backgroundBackdropUrl = backgroundItem ? getBackdropImage(backgroundItem.backdrop_path) : '';

  const carousels = [
    { title: "Popular Movies", items: popularMovies, type: 'movie' as const },
    { title: "Top Rated Movies", items: topRatedMovies, type: 'movie' as const },
    { title: "Trending Movies This Week", items: trendingMovies, type: 'movie' as const },
    { title: "Popular TV Shows", items: popularTVShows, type: 'tv' as const },
    { title: "Top Rated TV Shows", items: topRatedTVShows, type: 'tv' as const },
    { title: "Trending TV Shows This Week", items: trendingTVShows, type: 'tv' as const },
  ].filter(c => c.items && c.items.length > 0);

  const websiteSchema: WebSite = {
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(websiteSchema)}
      />
      <div className="flex flex-col">
        <BackgroundImage posterUrl={backgroundPosterUrl} backdropUrl={backgroundBackdropUrl} />
        {slideshowItems.length > 0 && <HeroSlideshow items={slideshowItems} />}
        <div className="flex flex-col space-y-12 py-12">

          <FeaturedCollections />

          <RecentlyReleased />

          {carousels.map(carousel => (
            <section key={carousel.title}>
              <h2 className="text-2xl font-bold mb-4 uppercase tracking-wider px-4 sm:px-8">{carousel.title}</h2>
              <Carousel>
                {carousel.items.map((item) => {
                  const itemType = 'title' in item ? 'movie' : 'tv';
                  return <PosterCard key={item.id} item={item} type={itemType as 'movie' | 'tv'} />;
                })}
              </Carousel>
            </section>
          ))}

        </div>
      </div>
    </>
  );
}

export default HomePage;
