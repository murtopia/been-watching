/**
 * Platform display metadata shared by the chart ingest, feed API, and chart cards.
 */

export const PLATFORM_LABELS: Record<string, string> = {
  netflix: 'Netflix',
  max: 'HBO Max',
  disney: 'Disney+',
  prime: 'Prime Video',
  paramount: 'Paramount+',
  hulu: 'Hulu',
  apple: 'Apple TV+',
  peacock: 'Peacock'
}

/**
 * TMDB watch-provider logo paths (US region), served from TMDB's image CDN.
 * These are the same JustWatch-sourced logos TMDB shows on its own site;
 * used nominatively to identify the platform a chart describes.
 */
const PLATFORM_LOGO_PATHS: Record<string, string> = {
  netflix: '/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg',
  prime: '/pvske1MyAoymrs5bguRfVqYiM9a.jpg',
  hulu: '/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg',
  disney: '/97yvRBw1GzX7fXprcF80er19ot.jpg',
  apple: '/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg',
  peacock: '/2aGrp1xw3qhwCYvNGAJZPdjfeeX.jpg',
  paramount: '/fts6X10Jn4QT0X6ac3udKEn2tJA.jpg',
  max: '/jbe4gVSfRlbPTdESXhEKpornsfu.jpg'
}

export function getPlatformLogoUrl(platform: string): string | null {
  const path = PLATFORM_LOGO_PATHS[platform]
  return path ? `https://image.tmdb.org/t/p/w92${path}` : null
}

/** Genre subcategory charts pulled from TMDB discover per platform */
export interface ChartCategoryDef {
  id: string
  label: string
  tvGenreId: number | null
  movieGenreId: number | null
}

export const CHART_CATEGORIES: ChartCategoryDef[] = [
  { id: 'reality', label: 'Reality', tvGenreId: 10764, movieGenreId: null },
  { id: 'crime', label: 'Crime', tvGenreId: 80, movieGenreId: 80 },
  { id: 'comedy', label: 'Comedy', tvGenreId: 35, movieGenreId: 35 },
  { id: 'documentary', label: 'Documentary', tvGenreId: 99, movieGenreId: 99 },
  { id: 'family', label: 'Family', tvGenreId: 10751, movieGenreId: 10751 }
]

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CHART_CATEGORIES.map(c => [c.id, c.label])
)
