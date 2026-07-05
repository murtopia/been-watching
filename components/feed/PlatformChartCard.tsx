'use client'

/**
 * Platform Chart Card - "Top on Netflix This Week"
 *
 * Bored Room-inspired ranked chart: horizontal bars whose length reflects the
 * metric, circular poster on the left, title + metric on the bar, NEW badge
 * for new entries, and stacked friend avatars on shows your friends track.
 */

import React, { useState } from 'react'
import type { PlatformChart, ChartEntry } from '@/lib/feed/types'
import { getAvatarProps } from '@/utils/avatarUtils'
import { ShareButton } from '@/components/sharing/ShareButton'

const PLATFORM_COLORS: Record<string, { bar: string; barEnd: string; accent: string }> = {
  netflix: { bar: '#B1060F', barEnd: '#E50914', accent: '#E50914' },
  max: { bar: '#0026B3', barEnd: '#002BE7', accent: '#3B5BFF' },
  disney: { bar: '#0E2A6D', barEnd: '#1A44B8', accent: '#4A7CFF' },
  prime: { bar: '#00546B', barEnd: '#00A8E1', accent: '#00A8E1' },
  paramount: { bar: '#0037C5', barEnd: '#0064FF', accent: '#0064FF' },
  hulu: { bar: '#11862F', barEnd: '#1CE783', accent: '#1CE783' },
  apple: { bar: '#3A3A3C', barEnd: '#6E6E73', accent: '#A1A1A6' },
  peacock: { bar: '#42307A', barEnd: '#6A4FBF', accent: '#8B6FE8' }
}

function formatMetric(label: string | null, value: number | null): string | null {
  if (!value || !label) return null
  if (label === 'hours viewed' || label === 'views') {
    const suffix = label === 'hours viewed' ? ' hrs' : ' views'
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B${suffix}`
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M${suffix}`
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K${suffix}`
    return `${value}${suffix}`
  }
  return null // popularity/chart-points are arbitrary units - hide
}

function formatDateRange(chart: PlatformChart): string {
  const d = new Date(chart.chartDate + 'T00:00:00')
  if (chart.period === 'week') {
    const end = new Date(d.getTime() + 6 * 24 * 60 * 60 * 1000)
    const fmt = (x: Date) => x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${fmt(d)} – ${fmt(end)}`
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface PlatformChartCardProps {
  charts: PlatformChart[]
  onShowClick?: (entry: ChartEntry, chart: PlatformChart, chartType: 'tv' | 'movie') => void
}

export default function PlatformChartCard({ charts, onShowClick }: PlatformChartCardProps) {
  const [platformIdx, setPlatformIdx] = useState(0)
  const [tab, setTab] = useState<'tv' | 'movie'>('tv')

  if (charts.length === 0) return null
  const chart = charts[Math.min(platformIdx, charts.length - 1)]
  const entries = (tab === 'tv' ? chart.tv : chart.movies).slice(0, 5)
  const colorsFor = PLATFORM_COLORS[chart.platform] || PLATFORM_COLORS.apple
  const maxMetric = Math.max(...entries.map(e => e.metricValue || 0), 1)

  return (
    <div className="chart-card">
      <style jsx>{`
        .chart-card {
          width: 100%;
          max-width: 398px;
          border-radius: 24px;
          border: 1px solid #FFC125;
          background: linear-gradient(180deg, #16161c 0%, #0c0c10 100%);
          overflow: hidden;
          color: white;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }

        .chart-header {
          padding: 20px 20px 12px;
        }

        .chart-title {
          font-size: 22px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.3px;
          margin: 0;
          text-transform: uppercase;
        }

        .chart-subtitle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.55);
        }

        .platform-pills {
          display: flex;
          gap: 6px;
          padding: 4px 20px 12px;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .platform-pills::-webkit-scrollbar { display: none; }

        .platform-pill {
          flex-shrink: 0;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.75);
          transition: all 0.15s ease;
        }
        .platform-pill.active {
          background: rgba(255, 193, 37, 0.18);
          border-color: #FFC125;
          color: #FFC125;
        }

        .type-tabs {
          display: flex;
          gap: 14px;
          padding: 0 20px 6px;
        }
        .type-tab {
          background: none;
          border: none;
          padding: 4px 0;
          font-size: 13px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.45);
          cursor: pointer;
          border-bottom: 2px solid transparent;
        }
        .type-tab.active {
          color: white;
          border-bottom-color: #FFC125;
        }

        .chart-rows {
          padding: 8px 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chart-row {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .chart-rank {
          width: 22px;
          font-size: 16px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.85);
          text-align: right;
          flex-shrink: 0;
        }

        .chart-poster-wrap {
          position: relative;
          width: 52px;
          height: 52px;
          flex-shrink: 0;
          z-index: 2;
        }

        .chart-poster {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          object-fit: cover;
          border: 2.5px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          background: #222;
        }

        .friend-stack {
          position: absolute;
          bottom: -4px;
          right: -6px;
          display: flex;
        }

        .friend-stack :global(img), .friend-stack :global(.friend-initials) {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1.5px solid #0c0c10;
          margin-left: -7px;
          object-fit: cover;
        }

        .friend-initials {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 700;
          color: white;
        }

        .chart-bar-track {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
        }

        .chart-bar {
          position: relative;
          margin-left: -26px;
          padding: 8px 12px 8px 34px;
          border-radius: 10px;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 1px;
          min-height: 44px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
        }

        .chart-bar-title {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.2px;
          line-height: 1.15;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .chart-bar-metric {
          font-size: 11px;
          font-weight: 700;
          opacity: 0.9;
        }

        .new-badge {
          position: absolute;
          top: -6px;
          right: 8px;
          background: #FFC125;
          color: #000;
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 0.5px;
          padding: 2px 6px;
          border-radius: 6px;
        }

        .chart-footer {
          padding: 0 20px 16px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.35);
          text-align: right;
        }
      `}</style>

      <div className="chart-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <h2 className="chart-title">Top on {chart.platformLabel}</h2>
          <ShareButton
            variant="icon"
            size="sm"
            data={{
              contentType: 'list',
              contentId: `chart-${chart.platform}-${chart.chartDate}`,
              title: `Top on ${chart.platformLabel} (${formatDateRange(chart)})`,
              items: entries.map(e => ({
                id: e.dbMediaId || `chart-${e.rank}`,
                title: e.title,
                posterUrl: e.posterPath ? `https://image.tmdb.org/t/p/w342${e.posterPath}` : ''
              }))
            }}
          />
        </div>
        <div className="chart-subtitle">
          <span>{formatDateRange(chart)}</span>
          <span>{chart.period === 'week' ? 'This Week' : 'Today'}</span>
        </div>
      </div>

      {charts.length > 1 && (
        <div className="platform-pills">
          {charts.map((c, idx) => (
            <button
              key={c.platform}
              className={`platform-pill ${idx === platformIdx ? 'active' : ''}`}
              onClick={() => setPlatformIdx(idx)}
            >
              {c.platformLabel}
            </button>
          ))}
        </div>
      )}

      <div className="type-tabs">
        <button className={`type-tab ${tab === 'tv' ? 'active' : ''}`} onClick={() => setTab('tv')}>
          TV Shows
        </button>
        <button className={`type-tab ${tab === 'movie' ? 'active' : ''}`} onClick={() => setTab('movie')}>
          Movies
        </button>
      </div>

      <div className="chart-rows">
        {entries.map((entry) => {
          const metricText = formatMetric(entry.metricLabel, entry.metricValue)
          // Bar length scales with metric; falls back to rank-based taper
          const ratio = entry.metricValue
            ? Math.max(0.45, entry.metricValue / maxMetric)
            : Math.max(0.45, 1 - (entry.rank - 1) * 0.12)

          return (
            <div
              key={`${entry.rank}-${entry.title}`}
              className="chart-row"
              onClick={() => onShowClick?.(entry, chart, tab)}
            >
              <div className="chart-rank">{entry.rank}.</div>
              <div className="chart-poster-wrap">
                {entry.posterPath ? (
                  <img
                    className="chart-poster"
                    src={`https://image.tmdb.org/t/p/w185${entry.posterPath}`}
                    alt={entry.title}
                  />
                ) : (
                  <div className="chart-poster" />
                )}
                {entry.friends.length > 0 && (
                  <div className="friend-stack">
                    {entry.friends.slice(0, 3).map(f => {
                      const avatarProps = getAvatarProps(f.avatar, f.name, f.id)
                      return avatarProps.hasImage ? (
                        <img key={f.id} src={avatarProps.imageSrc} alt={f.name} title={f.name} />
                      ) : (
                        <span
                          key={f.id}
                          className="friend-initials"
                          title={f.name}
                          style={{ background: avatarProps.backgroundGradient || avatarProps.backgroundColor }}
                        >
                          {avatarProps.initials}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="chart-bar-track">
                <div
                  className="chart-bar"
                  style={{
                    width: `${ratio * 100}%`,
                    background: `linear-gradient(90deg, ${colorsFor.bar}, ${colorsFor.barEnd})`
                  }}
                >
                  {entry.isNew && <span className="new-badge">NEW</span>}
                  <span className="chart-bar-title">{entry.title}</span>
                  {metricText && <span className="chart-bar-metric">{metricText}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="chart-footer">via {chart.sourceLabel}</div>
    </div>
  )
}
