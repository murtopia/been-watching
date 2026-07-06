'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { FeedCard } from '@/components/feed/UserActivityCard'
import { FeedCardData } from '@/components/feed/UserActivityCard'

interface ShowDetailCardProps {
  isOpen: boolean
  onClose: () => void
  media: {
    id: string
    title: string
    posterUrl?: string
    backdropUrl?: string
    year?: string
    genres?: string[]
    rating?: number
    synopsis?: string
    creator?: string
    cast?: string[]
    network?: string
    mediaType?: 'Movie' | 'TV' | string
    season?: number
    streamingPlatforms?: string[]
    tmdb_id?: number
  }
  currentUser?: {
    id: string
    name: string
    avatar: string | null
  }
  initialRating?: 'meh' | 'like' | 'love' | null
  initialStatus?: 'want' | 'watching' | 'watched' | null
  onRate?: (mediaId: string, rating: 'meh' | 'like' | 'love' | null) => void
  onSetStatus?: (mediaId: string, status: 'want' | 'watching' | 'watched' | null) => void
}

export default function ShowDetailCard({
  isOpen,
  onClose,
  media,
  currentUser,
  initialRating,
  initialStatus,
  onRate,
  onSetStatus,
}: ShowDetailCardProps) {
  const [showComments, setShowComments] = useState<any[]>([])
  const [friendsActivity, setFriendsActivity] = useState<any>({
    watching: { count: 0, avatars: [] },
    watched: { count: 0, avatars: [] },
    wantToWatch: { count: 0, avatars: [] }
  })
  // Tracks the season the user is currently viewing (FeedCard's "Other Seasons"
  // selector can switch it) so comments/friend activity follow the right row.
  const [activeMediaId, setActiveMediaId] = useState(media.id)
  useEffect(() => {
    setActiveMediaId(media.id)
  }, [media.id])
  const supabase = createClient()

  // Fetch show comments
  const fetchShowComments = useCallback(async () => {
    if (!activeMediaId) return
    
    try {
      const { data: comments } = await supabase
        .from('show_comments')
        .select(`
          id,
          comment_text,
          created_at,
          user_id
        `)
        .eq('media_id', activeMediaId)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (comments && comments.length > 0) {
        const userIds = [...new Set(comments.map(c => c.user_id))]
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url')
          .in('id', userIds)
        
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
        
        const commentsWithUsers = comments.map(c => {
          const profile = profileMap.get(c.user_id)
          return {
            id: c.id,
            text: c.comment_text,
            timestamp: formatTimeAgo(c.created_at),
            user: {
              id: c.user_id,
              name: profile?.display_name || profile?.username || 'Unknown',
              username: profile?.username || 'unknown',
              avatar: profile?.avatar_url || null
            },
            likes: 0,
            userLiked: false
          }
        })
        
        setShowComments(commentsWithUsers)
      } else {
        // Clear stale comments when the (new) season has none
        setShowComments([])
      }
    } catch (err) {
      console.error('Error fetching show comments:', err)
    }
  }, [activeMediaId, supabase])

  // Fetch friends activity
  const fetchFriendsActivity = useCallback(async () => {
    if (!activeMediaId || !currentUser?.id) return
    
    try {
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUser.id)
        .eq('status', 'accepted')
      
      if (!following || following.length === 0) return
      
      const followingIds = following.map(f => f.following_id)
      
      const { data: statuses } = await supabase
        .from('watch_status')
        .select(`
          status,
          user_id,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('media_id', activeMediaId)
        .in('user_id', followingIds)
      
      if (statuses) {
        const watching = statuses.filter(s => s.status === 'watching')
        const watched = statuses.filter(s => s.status === 'watched')
        const want = statuses.filter(s => s.status === 'want')
        
        setFriendsActivity({
          watching: {
            count: watching.length,
            avatars: watching.map(s => (s.profiles as any)?.avatar_url).filter(Boolean)
          },
          watched: {
            count: watched.length,
            avatars: watched.map(s => (s.profiles as any)?.avatar_url).filter(Boolean)
          },
          wantToWatch: {
            count: want.length,
            avatars: want.map(s => (s.profiles as any)?.avatar_url).filter(Boolean)
          }
        })
      }
    } catch (err) {
      console.error('Error fetching friends activity:', err)
    }
  }, [activeMediaId, currentUser?.id, supabase])

  useEffect(() => {
    if (isOpen) {
      fetchShowComments()
      fetchFriendsActivity()
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, fetchShowComments, fetchFriendsActivity])

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const handleSubmitShowComment = async (mediaId: string, text: string) => {
    if (!text.trim() || !currentUser?.id) return
    
    try {
      await supabase
        .from('show_comments')
        .insert({
          media_id: mediaId,
          user_id: currentUser.id,
          comment_text: text.trim()
        })
      
      fetchShowComments()
    } catch (err) {
      console.error('Error submitting comment:', err)
    }
  }

  if (!isOpen) return null

  // Transform media data to FeedCardData format
  const feedCardData: FeedCardData = {
    id: media.id,
    media: {
      id: media.id,
      title: media.title,
      posterUrl: media.posterUrl || '',
      year: parseInt(media.year || '0') || new Date().getFullYear(),
      genres: media.genres || [],
      rating: media.rating || 0,
      synopsis: media.synopsis || '',
      network: media.network,
      creator: media.creator || '',
      cast: media.cast || [],
      mediaType: (media.mediaType === 'Movie' ? 'Movie' : 'TV') as 'TV' | 'Movie',
      season: media.season,
      streamingPlatforms: media.streamingPlatforms
    },
    friends: {
      avatars: [],
      count: 0,
      text: ''
    },
    stats: {
      likeCount: 0,
      commentCount: showComments.length,
      userLiked: false
    },
    friendsActivity: {
      watching: {
        count: friendsActivity.watching.count,
        avatars: friendsActivity.watching.avatars
      },
      watched: {
        count: friendsActivity.watched.count,
        avatars: friendsActivity.watched.avatars
      },
      wantToWatch: {
        count: friendsActivity.wantToWatch.count,
        avatars: friendsActivity.wantToWatch.avatars
      },
      ratings: {
        meh: 0,
        like: 0,
        love: 0,
        userRating: initialRating || undefined
      }
    },
    showComments: showComments,
    comments: []
  }

  return (
    <>
      <div className="show-detail-overlay" onClick={onClose}>
        <div className="show-detail-card-wrapper" onClick={e => e.stopPropagation()}>
          <button className="show-detail-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {/* Card flips freely between front and back inside the modal;
              close via the X button or the backdrop, keeping feed position. */}
          <FeedCard
            variant="b"
            data={feedCardData}
            onRate={onRate}
            onSetStatus={onSetStatus}
            onSubmitShowComment={handleSubmitShowComment}
            currentUser={currentUser ? {
              name: currentUser.name,
              avatar: currentUser.avatar || ''
            } : undefined}
            initialUserStatus={initialStatus}
            initialFlipped={true}
            onSeasonChange={(mediaRow) => {
              // FeedCard already swapped its displayed media; track the new id
              // so show comments + friend activity refetch for that season.
              if (mediaRow?.id) setActiveMediaId(mediaRow.id)
            }}
          />
        </div>
      </div>

      <style jsx>{`
        .show-detail-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .show-detail-card-wrapper {
          position: relative;
          width: 100%;
          max-width: 398px;
          height: auto;
          max-height: 90vh;
        }

        .show-detail-close {
          position: absolute;
          top: -14px;
          right: -8px;
          z-index: 20;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.35);
          background: rgba(0, 0, 0, 0.75);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }
        .show-detail-close:active {
          transform: scale(0.94);
        }
      `}</style>
    </>
  )
}
