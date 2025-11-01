
export interface Server {
  id: number;
  name: string;
  movieLink: (id: string) => string;
  episodeLink: (id: string, season: number, episode: number) => string;
  useImdb?: boolean;
}

export const serverList: Server[] = [
  // Ads Free Servers (Reordered)
  {
    id: 1,
    name: "Best Server ",
    movieLink: (tmdbId: string) => `https://rivestream.net/embed?type=movie&id=${tmdbId}`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://rivestream.net/embed?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`,
  },
  {
    id: 2,
    name: "VidJoy ",
    movieLink: (tmdbId: string) => `https://vidjoy.pro/embed/movie/${tmdbId}`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://vidjoy.pro/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 3,
    name: "Portugues ",
    movieLink: (tmdbId: string) => `https://embed.warezcdn.link/filme/${tmdbId}`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://embed.warezcdn.link/serie/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 4,
    name: "Russian ",
    movieLink: (imdbId: string) => `https://api.insertunit.ws/embed/imdb/${imdbId}`,
    episodeLink: (imdbId: string, season: number, episode: number) => `https://api.insertunit.ws/embed/imdb/${imdbId}?season=${season}&episode=${episode}`,
    useImdb: true,
  },
  {
    id: 5,
    name: "French ",
    movieLink: (tmdbId: string) => `https://frembed.icu/api/film.php?id=${tmdbId}`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://frembed.live/api/serie.php?id=${tmdbId}&sa=${season}&epi=${episode}`,
  },
  {
    id: 6,
    name: "Videasy ",
    movieLink: (tmdbId: string) => `https://player.videasy.net/movie/${tmdbId}`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://player.videasy.net/tv/${tmdbId}/${season}/${episode}?nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&color=8B5CF6`,
  },
  {
    id: 7,
    name: "Vidzee ",
    movieLink: (tmdbId: string) => `https://player.vidzee.wtf/embed/movie/${tmdbId}?server=1`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://player.vidzee.wtf/embed/tv/${tmdbId}/${season}/${episode}?server=1`,
  },
  {
    id: 8,
    name: "Vidsrc Rip ",
    movieLink: (tmdbId: string) => `https://vidsrc.rip/embed/movie/${tmdbId}`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://vidsrc.rip/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 9,
    name: "Vidpro ",
    movieLink: (tmdbId: string) => `https://player.vidpro.top/embed/movie/${tmdbId}`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://player.vidsrc.co/embed/tv/${tmdbId}/${season}/${episode}`,
  },

  
  // Regular Servers (Ads)
  {
    id: 10,
    name: "Hindi ",
    movieLink: (tmdbId: string) => `https://player.vidify.top/embed/movie/${tmdbId}?server=hindi`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://vidify.top/embed/tv/${tmdbId}/${season}/${episode}?server=multi`,
  },
  {
    id: 11,
    name: "VidLink",
    movieLink: (tmdbId: string) => `https://vidlink.pro/movie/${tmdbId}`,
    episodeLink: (tmdbId: string, season: number, episode: number) =>
      `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}?primaryColor=63b8bc&secondaryColor=a2a2a2&iconColor=eefdec&icons=default&player=default&title=true&poster=true&autoplay=true&nextbutton=true`,
  },
  {
    id: 12,
    name: "EmbedSU",
    movieLink: (tmdbId: string) => `https://embed.su/embed/movie/${tmdbId}`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 13,
    name: "SuperEmbed",
    movieLink: (tmdbId: string) => `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://vidbinge.dev/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 14,
    name: "111Movies",
    movieLink: (tmdbId: string) => `https://111movies.com/movie/${tmdbId}`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://111movies.com/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 15,
    name: "Vidfast",
    movieLink: (tmdbId: string) => `https://vidfast.pro/movie/${tmdbId}`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}?nextButton=true&autoNext=true`,
  },
  {
    id: 16,
    name: "VidSrc",
    movieLink: (tmdbId: string) => `https://vidsrc.xyz/embed/movie/${tmdbId}`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: 17,
    name: "FilmKu",
    movieLink: (tmdbId: string) => `https://filmku.stream/embed/movie?tmdb=${tmdbId}`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://filmku.stream/embed/series?tmdb=${tmdbId}&sea=${season}&epi=${episode}`,
  },
  {
    id: 18,
    name: "Nontongo",
    movieLink: (tmdbId: string) => `https://nontongo.win/embed/movie/${tmdbId}`,
    episodeLink: (tmdbId: string, season: number, episode: number) => `https://nontongo.win/embed/tv/${tmdbId}/${season}/${episode}`,
  },
];
