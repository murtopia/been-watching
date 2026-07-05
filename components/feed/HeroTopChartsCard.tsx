'use client'

/**
 * Hero Top Charts Card - "This Week's #1s"
 *
 * Pinned to the top of the feed: the #1 show on each major platform in one
 * card. Rows reuse the platform chart visual language, with a small platform
 * logo badge on each circular poster (friend avatars take that spot when
 * friends track the show, and the logo moves onto the bar).
 */

import React, { useState } from 'react'
import type { PlatformChart, ChartEntry } from '@/lib/feed/types'
import { getAvatarProps } from '@/utils/avatarUtils'
import Icon from '@/components/ui/Icon'
import { ShareModal } from '@/components/sharing/ShareModal'

const PLATFORM_ORDER = ['netflix', 'max', 'disney', 'prime', 'apple', 'hulu', 'paramount', 'peacock']

const PLATFORM_COLORS: Record<string, { bar: string; barEnd: string }> = {
  netflix: { bar: '#B1060F', barEnd: '#E50914' },
  max: { bar: '#0026B3', barEnd: '#002BE7' },
  disney: { bar: '#0E2A6D', barEnd: '#1A44B8' },
  prime: { bar: '#00546B', barEnd: '#00A8E1' },
  paramount: { bar: '#0037C5', barEnd: '#0064FF' },
  hulu: { bar: '#11862F', barEnd: '#1CE783' },
  apple: { bar: '#3A3A3C', barEnd: '#6E6E73' },
  peacock: { bar: '#42307A', barEnd: '#6A4FBF' }
}

interface HeroRow {
  chart: PlatformChart
  entry: ChartEntry
  chartType: 'tv' | 'movie'
}

interface HeroTopChartsCardProps {
  charts: PlatformChart[]
  onShowClick?: (entry: ChartEntry, chart: PlatformChart, chartType: 'tv' | 'movie') => void
}

export default function HeroTopChartsCard({ charts, onShowClick }: HeroTopChartsCardProps) {
  const [shareOpen, setShareOpen] = useState(false)

  const rows: HeroRow[] = []
  for (const platform of PLATFORM_ORDER) {
    const chart = charts.find(c => c.platform === platform && c.category === 'overall')
    if (!chart) continue
    if (chart.tv[0]) rows.push({ chart, entry: chart.tv[0], chartType: 'tv' })
    else if (chart.movies[0]) rows.push({ chart, entry: chart.movies[0], chartType: 'movie' })
    if (rows.length >= 6) break
  }
  if (rows.length < 3) return null

  const dateLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="hero-card">
      <style jsx>{`
        .hero-card {
          width: 100%;
          max-width: 398px;
          border-radius: 24px;
          border: 1px solid #FFC125;
          background: linear-gradient(180deg, #1c160a 0%, #0c0c10 55%);
          overflow: hidden;
          color: white;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }

        .hero-header {
          padding: 20px 20px 14px;
        }

        .hero-kicker {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          color: #FFC125;
          margin-bottom: 4px;
        }

        .hero-title {
          font-size: 24px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.3px;
          margin: 0;
          text-transform: uppercase;
        }

        .hero-subtitle {
          margin-top: 8px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.6px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.55);
        }

        .hero-rows {
          padding: 8px 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hero-row {
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .hero-poster-wrap {
          position: relative;
          width: 52px;
          height: 52px;
          flex-shrink: 0;
          z-index: 2;
        }

        .hero-poster {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          object-fit: cover;
          border: 2.5px solid white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          background: #222;
        }

        .poster-badge {
          position: absolute;
          bottom: -4px;
          right: -6px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 1.5px solid #0c0c10;
          object-fit: cover;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
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

        .hero-bar-track {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
        }

        .hero-bar {
          position: relative;
          margin-left: -26px;
          padding: 8px 12px 8px 34px;
          border-radius: 10px;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 44px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
          width: 100%;
        }

        .bar-logo {
          width: 18px;
          height: 18px;
          border-radius: 5px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .hero-bar-text {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .hero-bar-title {
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

        .hero-bar-platform {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          opacity: 0.85;
        }

        .hero-footer {
          padding: 0 16px 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .hero-source {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.35);
        }

        .hero-share-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .hero-share-btn:active {
          transform: scale(0.94);
        }
      `}</style>

      <div className="hero-header">
        <div className="hero-kicker">Across Streaming</div>
        <h2 className="hero-title">This Week's #1s</h2>
        <div className="hero-subtitle">{dateLabel} • The top show on every network</div>
      </div>

      <div className="hero-rows">
        {rows.map(({ chart, entry, chartType }) => {
          const colors = PLATFORM_COLORS[chart.platform] || PLATFORM_COLORS.apple
          const hasFriends = entry.friends.length > 0

          return (
            <div
              key={chart.platform}
              className="hero-row"
              onClick={() => onShowClick?.(entry, chart, chartType)}
            >
              <div className="hero-poster-wrap">
                {entry.posterPath ? (
                  <img
                    className="hero-poster"
                    src={`https://image.tmdb.org/t/p/w185${entry.posterPath}`}
                    alt={entry.title}
                  />
                ) : (
                  <div className="hero-poster" />
                )}
                {hasFriends ? (
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
                ) : (
                  chart.platformLogoUrl && (
                    <img className="poster-badge" src={chart.platformLogoUrl} alt={chart.platformLabel} />
                  )
                )}
              </div>
              <div className="hero-bar-track">
                <div
                  className="hero-bar"
                  style={{ background: `linear-gradient(90deg, ${colors.bar}, ${colors.barEnd})` }}
                >
                  {hasFriends && chart.platformLogoUrl && (
                    <img className="bar-logo" src={chart.platformLogoUrl} alt={chart.platformLabel} />
                  )}
                  <div className="hero-bar-text">
                    <span className="hero-bar-title">{entry.title}</span>
                    <span className="hero-bar-platform">#1 on {chart.platformLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="hero-footer">
        <span className="hero-source">via FlixPatrol / Netflix Top 10</span>
        <button
          className="hero-share-btn"
          onClick={() => setShareOpen(true)}
          aria-label="Share"
        >
          <Icon name="share" state="default" size={18} color="white" />
        </button>
      </div>

      {shareOpen && (
        <ShareModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          data={{
            contentType: 'list',
            contentId: `hero-number-ones-${new Date().toISOString().split('T')[0]}`,
            title: `This Week's #1s Across Streaming (${dateLabel})`,
            items: rows.map(({ chart, entry }) => ({
              id: entry.dbMediaId || `hero-${chart.platform}`,
              title: `${entry.title} (#1 on ${chart.platformLabel})`,
              posterUrl: entry.posterPath ? `https://image.tmdb.org/t/p/w342${entry.posterPath}` : ''
            }))
          }}
        />
      )}
    </div>
  )
}
