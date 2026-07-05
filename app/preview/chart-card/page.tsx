'use client'

/** Dev preview for the per-platform chart cards (no auth required) */

import PlatformChartCard from '@/components/feed/PlatformChartCard'
import HeroTopChartsCard from '@/components/feed/HeroTopChartsCard'
import type { PlatformChart } from '@/lib/feed/types'

const mockEntries = [
  { title: 'Stranger Things 5', poster: '/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', metric: 18400000, isNew: false },
  { title: 'The Diplomat', poster: '/57w56YvXwPHkRCJqGnLxAqPPq0G.jpg', metric: 12100000, isNew: true },
  { title: 'Love Is Blind', poster: '/hTExot1sfn7dHZjGrk0Aiwpntxt.jpg', metric: 9800000, isNew: false },
  { title: 'Squid Game', poster: '/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg', metric: 7300000, isNew: false },
  { title: 'The Night Agent', poster: '/tn3GWm0Erehkpur8PUuYWTGJ64W.jpg', metric: 5100000, isNew: true }
]

function mockChart(platform: string, platformLabel: string, logoPath: string, category: string, categoryLabel: string | null): PlatformChart {
  return {
    platform,
    platformLabel,
    platformLogoUrl: `https://image.tmdb.org/t/p/w92${logoPath}`,
    category,
    categoryLabel,
    source: category === 'overall' ? 'netflix_tudum' : 'tmdb',
    sourceLabel: category === 'overall' ? 'Netflix Top 10 (official)' : 'TMDB popularity',
    period: category === 'overall' ? 'week' : 'day',
    chartDate: '2026-06-28',
    tv: mockEntries.map((e, i) => ({
      rank: i + 1,
      title: e.title,
      tmdbId: null,
      posterPath: e.poster,
      metricLabel: category === 'overall' ? 'hours viewed' : 'popularity',
      metricValue: e.metric,
      isNew: e.isNew,
      weeksOnChart: null,
      dbMediaId: null,
      friends: i === 0
        ? [
            { id: 'f1', name: 'Todd', avatar: null },
            { id: 'f2', name: 'Taylor', avatar: null }
          ]
        : []
    })),
    movies: []
  }
}

export default function ChartCardPreview() {
  const netflixTv = mockChart('netflix', 'Netflix', '/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg', 'overall', null)
  const huluReality = mockChart('hulu', 'Hulu', '/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg', 'reality', 'Reality')
  const maxCrime = mockChart('max', 'HBO Max', '/jbe4gVSfRlbPTdESXhEKpornsfu.jpg', 'crime', 'Crime')

  const heroCharts = [
    netflixTv,
    mockChart('max', 'HBO Max', '/jbe4gVSfRlbPTdESXhEKpornsfu.jpg', 'overall', null),
    mockChart('disney', 'Disney+', '/97yvRBw1GzX7fXprcF80er19ot.jpg', 'overall', null),
    mockChart('prime', 'Prime Video', '/pvske1MyAoymrs5bguRfVqYiM9a.jpg', 'overall', null),
    mockChart('apple', 'Apple TV+', '/mcbz1LgtErU9p4UdbZ0rG6RTWHX.jpg', 'overall', null),
    mockChart('hulu', 'Hulu', '/bxBlRPEPpMVDc4jMhSrTf2339DW.jpg', 'overall', null)
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#000', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
      <HeroTopChartsCard charts={heroCharts} />
      <PlatformChartCard chart={netflixTv} chartType="tv" />
      <PlatformChartCard chart={huluReality} chartType="tv" />
      <PlatformChartCard chart={maxCrime} chartType="tv" />
    </div>
  )
}
