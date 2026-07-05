/** TMDB genre ID → name mapping (TV + Movie) */
export const GENRE_MAP: Record<number, string> = {
  // TV Genres
  10759: 'Action & Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648: 'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
  // Movie Genres
  28: 'Action',
  12: 'Adventure',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War'
}

export function mapGenreIds(genreIds?: number[]): string[] {
  return (genreIds || []).map(id => GENRE_MAP[id]).filter(Boolean).slice(0, 3)
}
