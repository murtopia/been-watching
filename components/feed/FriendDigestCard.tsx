'use client'

/**
 * Friend Digest Card - "What Todd's been watching this week"
 *
 * Consolidates a friend's activity for the period into one card instead of
 * one card per activity. Tapping a show opens the show detail card.
 */

import React from 'react'
import type { FriendDigest, DigestShowItem } from '@/lib/feed/types'
import { getAvatarProps } from '@/utils/avatarUtils'
import Icon from '@/components/ui/Icon'

const ACTION_CONFIG: Record<DigestShowItem['action'], { label: string; icon: string; color: string; border: string }> = {
  loved: { label: 'Loved', icon: 'heart', color: 'rgba(255, 59, 92, 0.25)', border: 'rgba(255, 59, 92, 0.6)' },
  liked: { label: 'Liked', icon: 'thumbs-up', color: 'rgba(59, 130, 246, 0.25)', border: 'rgba(59, 130, 246, 0.6)' },
  meh: { label: 'Meh', icon: 'meh-face', color: 'rgba(142, 142, 147, 0.25)', border: 'rgba(142, 142, 147, 0.6)' },
  watching: { label: 'Watching', icon: 'play', color: 'rgba(59, 130, 246, 0.25)', border: 'rgba(59, 130, 246, 0.6)' },
  want: { label: 'Wants to Watch', icon: 'bookmark', color: 'rgba(168, 85, 247, 0.25)', border: 'rgba(168, 85, 247, 0.6)' },
  watched: { label: 'Finished', icon: 'check', color: 'rgba(52, 211, 153, 0.25)', border: 'rgba(52, 211, 153, 0.6)' }
}

interface FriendDigestCardProps {
  digest: FriendDigest
  onShowClick?: (item: DigestShowItem, digest: FriendDigest) => void
  onUserClick?: (userId: string, username: string) => void
}

export default function FriendDigestCard({ digest, onShowClick, onUserClick }: FriendDigestCardProps) {
  const firstName = (digest.user.display_name || digest.user.username || 'Friend').split(' ')[0]
  const avatarProps = getAvatarProps(digest.user.avatar_url, digest.user.display_name, digest.user.id)
  const heroItems = digest.items.slice(0, 3)
  const showCount = digest.items.length

  return (
    <div className="digest-card">
      <style jsx>{`
        .digest-card {
          width: 100%;
          max-width: 398px;
          border-radius: 24px;
          border: 1px solid #FFC125;
          background: linear-gradient(180deg, #16161c 0%, #0c0c10 100%);
          overflow: hidden;
          color: white;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }

        .digest-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px 14px;
          cursor: pointer;
        }

        .digest-avatar, .digest-avatar-initials {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #FFC125;
          flex-shrink: 0;
        }

        .digest-avatar-initials {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          font-weight: 700;
        }

        .digest-heading {
          min-width: 0;
        }

        .digest-title {
          font-size: 17px;
          font-weight: 800;
          margin: 0;
          line-height: 1.2;
        }

        .digest-sub {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.55);
          margin-top: 2px;
          font-weight: 600;
        }

        .digest-hero {
          display: flex;
          gap: 8px;
          padding: 0 20px 14px;
        }

        .digest-hero-poster {
          flex: 1;
          aspect-ratio: 2 / 3;
          border-radius: 12px;
          object-fit: cover;
          background: #222;
          cursor: pointer;
          min-width: 0;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
        }

        .digest-list {
          padding: 0 14px 16px;
          display: flex;
          flex-direction: column;
        }

        .digest-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 6px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .digest-row:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .digest-row + .digest-row {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .digest-row-poster {
          width: 38px;
          height: 57px;
          border-radius: 6px;
          object-fit: cover;
          background: #222;
          flex-shrink: 0;
        }

        .digest-row-info {
          flex: 1;
          min-width: 0;
        }

        .digest-row-title {
          font-size: 14px;
          font-weight: 700;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .digest-row-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }

        .digest-action-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 10.5px;
          font-weight: 700;
          white-space: nowrap;
          border: 1px solid;
          flex-shrink: 0;
        }

        .digest-comment-chip {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10.5px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.55);
        }

        .digest-season {
          font-size: 12px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.45);
          margin-left: 6px;
        }
      `}</style>

      <div
        className="digest-header"
        onClick={() => onUserClick?.(digest.user.id, digest.user.username)}
      >
        {avatarProps.hasImage ? (
          <img className="digest-avatar" src={avatarProps.imageSrc} alt={digest.user.display_name} />
        ) : (
          <div
            className="digest-avatar-initials"
            style={{ background: avatarProps.backgroundGradient || avatarProps.backgroundColor }}
          >
            {avatarProps.initials}
          </div>
        )}
        <div className="digest-heading">
          <h2 className="digest-title">What {firstName}'s been watching</h2>
          <div className="digest-sub">
            {digest.periodLabel} · {showCount} {showCount === 1 ? 'show' : 'shows'}
          </div>
        </div>
      </div>

      {heroItems.length > 0 && (
        <div className="digest-hero">
          {heroItems.map(item => (
            item.posterPath ? (
              <img
                key={item.mediaId}
                className="digest-hero-poster"
                src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                alt={item.title}
                onClick={() => onShowClick?.(item, digest)}
              />
            ) : (
              <div key={item.mediaId} className="digest-hero-poster" onClick={() => onShowClick?.(item, digest)} />
            )
          ))}
        </div>
      )}

      <div className="digest-list">
        {digest.items.map(item => {
          const action = ACTION_CONFIG[item.action]
          const displayTitle = (item.title || '').replace(/\s*-\s*Season\s+\d+$/i, '')
          return (
            <div key={item.mediaId} className="digest-row" onClick={() => onShowClick?.(item, digest)}>
              {item.posterPath ? (
                <img
                  className="digest-row-poster"
                  src={`https://image.tmdb.org/t/p/w154${item.posterPath}`}
                  alt={item.title}
                />
              ) : (
                <div className="digest-row-poster" />
              )}
              <div className="digest-row-info">
                <div className="digest-row-title">
                  {displayTitle}
                  {item.season && <span className="digest-season">S{item.season}</span>}
                </div>
                <div className="digest-row-meta">
                  <span
                    className="digest-action-pill"
                    style={{ background: action.color, borderColor: action.border }}
                  >
                    <Icon name={action.icon} size={10} color="white" />
                    {action.label}
                  </span>
                  {item.commentCount > 0 && (
                    <span className="digest-comment-chip">
                      <Icon name="comment" size={11} color="rgba(255,255,255,0.55)" />
                      {item.commentCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
