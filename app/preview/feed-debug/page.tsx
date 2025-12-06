'use client'

import React, { useEffect, useState, useRef, useMemo } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserActivityCard, FeedCard, BADGE_PRESETS, FeedCardData } from '@/components/feed/UserActivityCard'
import { FollowSuggestionsCard } from '@/components/feed/FollowSuggestionsCard'
import { 
  activityToUserActivityCardData, 
  APIActivity,
  APIFriendsActivity,
  APIShowComment,
  APIComment
} from '@/utils/feedDataTransformers'

// Simplified card types for debugging
type CardType = 'activity' | 'because_you_liked' | 'friends_loved' | 'coming_soon' | 'now_streaming' | 'you_might_like' | 'follow_suggestions'

interface FeedItem {
  type: CardType
  id: string
  data: any
  loadTime?: number // Track how long each card took to load
}

interface CardTypeStats {
  type: CardType
  count: number
  avgLoadTime: number
}

export default function FeedDebugPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadTime, setLoadTime] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [showOverlay, setShowOverlay] = useState(true)
  
  const supabase = createClient()
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLogs(prev => [...prev.slice(-50), `[${timestamp}] ${message}`])
    console.log(`[DEBUG] ${message}`)
  }

  // Calculate card type stats
  const cardStats = useMemo(() => {
    const stats: Record<CardType, { count: number; totalLoadTime: number }> = {
      activity: { count: 0, totalLoadTime: 0 },
      because_you_liked: { count: 0, totalLoadTime: 0 },
      friends_loved: { count: 0, totalLoadTime: 0 },
      coming_soon: { count: 0, totalLoadTime: 0 },
      now_streaming: { count: 0, totalLoadTime: 0 },
      you_might_like: { count: 0, totalLoadTime: 0 },
      follow_suggestions: { count: 0, totalLoadTime: 0 },
    }
    
    feedItems.forEach(item => {
      if (stats[item.type]) {
        stats[item.type].count++
        stats[item.type].totalLoadTime += item.loadTime || 0
      }
    })
    
    return Object.entries(stats).map(([type, data]) => ({
      type: type as CardType,
      count: data.count,
      avgLoadTime: data.count > 0 ? Math.round(data.totalLoadTime / data.count) : 0
    }))
  }, [feedItems])

  useEffect(() => {
    loadFeed()
  }, [])

  const loadFeed = async () => {
    const startTime = Date.now()
    addLog('Starting feed load...')
    
    try {
      setLoading(true)
      
      // Get user
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        addLog('No user found')
        setError('Not logged in')
        return
      }
      setUser(authUser)
      addLog(`User: ${authUser.id}`)
      
      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()
      setProfile(profileData)
      
      const items: FeedItem[] = []
      
      // 1. Fetch activities (simplified for debug)
      addLog('Fetching activities...')
      const actStart = Date.now()
      const { data: activities } = await supabase
        .from('activities')
        .select(`
          id, user_id, media_id, activity_type, activity_data, created_at,
          profiles:user_id (id, username, display_name, avatar_url),
          media:media_id (id, title, poster_path, overview, media_type, tmdb_data)
        `)
        .neq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      const actTime = Date.now() - actStart
      addLog(`Activities: ${activities?.length || 0} in ${actTime}ms`)
      
      activities?.forEach(act => {
        items.push({
          type: 'activity',
          id: act.id,
          data: act,
          loadTime: actTime / (activities?.length || 1)
        })
      })
      
      // 2. Fetch "Because You Liked" (with timing)
      addLog('Fetching Because You Liked...')
      const bylStart = Date.now()
      const { data: userRatings } = await supabase
        .from('ratings')
        .select('media_id, rating, media:media_id(id, title, media_type, tmdb_data)')
        .eq('user_id', authUser.id)
        .in('rating', ['like', 'love'])
        .limit(3)
      
      const bylTime = Date.now() - bylStart
      addLog(`User ratings: ${userRatings?.length || 0} in ${bylTime}ms`)
      
      // Skip the expensive TMDB calls for now - just note what we would fetch
      userRatings?.forEach(rating => {
        const media = rating.media as any
        if (media) {
          addLog(`Would fetch similar to: ${media.title}`)
        }
      })
      
      // 3. Check for Coming Soon
      addLog('Checking Coming Soon...')
      const csStart = Date.now()
      const { data: watchStatus } = await supabase
        .from('watch_status')
        .select('media_id, media:media_id(id, title, media_type, tmdb_data)')
        .eq('user_id', authUser.id)
        .like('media_id', 'tv-%')
        .limit(5)
      
      const csTime = Date.now() - csStart
      addLog(`TV shows in watchlist: ${watchStatus?.length || 0} in ${csTime}ms`)
      
      // 4. Check for Friends Loved
      addLog('Checking Friends Loved...')
      const flStart = Date.now()
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', authUser.id)
      
      const flTime = Date.now() - flStart
      addLog(`Following: ${follows?.length || 0} in ${flTime}ms`)
      
      // 5. Check for user suggestions
      addLog('Checking user suggestions...')
      const usStart = Date.now()
      const { data: suggestions } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .neq('id', authUser.id)
        .limit(5)
      
      const usTime = Date.now() - usStart
      addLog(`User suggestions: ${suggestions?.length || 0} in ${usTime}ms`)
      
      if (suggestions && suggestions.length > 0) {
        items.push({
          type: 'follow_suggestions',
          id: 'follow-suggestions-1',
          data: { suggestions },
          loadTime: usTime
        })
      }
      
      setFeedItems(items)
      
      const totalTime = Date.now() - startTime
      setLoadTime(totalTime)
      addLog(`Total load time: ${totalTime}ms`)
      
    } catch (err: any) {
      addLog(`Error: ${err.message}`)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getCardTypeColor = (type: CardType): string => {
    const colors: Record<CardType, string> = {
      activity: '#4ade80',
      because_you_liked: '#a78bfa',
      friends_loved: '#f472b6',
      coming_soon: '#facc15',
      now_streaming: '#38bdf8',
      you_might_like: '#60a5fa',
      follow_suggestions: '#c084fc',
    }
    return colors[type] || '#888'
  }

  const getCardTypeLabel = (type: CardType): string => {
    const labels: Record<CardType, string> = {
      activity: '1️⃣ Activity',
      because_you_liked: '2️⃣ Because You Liked',
      friends_loved: '3️⃣ Friends Loved',
      coming_soon: '4️⃣ Coming Soon',
      now_streaming: '5️⃣ Now Streaming',
      you_might_like: '8️⃣ You Might Like',
      follow_suggestions: '7️⃣ Find Friends',
    }
    return labels[type] || type
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      color: 'white',
      paddingTop: '60px'
    }}>
      {/* Debug Overlay */}
      {showOverlay && (
        <div style={{
          position: 'fixed',
          top: 10,
          right: 10,
          width: 320,
          background: 'rgba(0, 0, 0, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 12,
          padding: 16,
          zIndex: 9999,
          fontSize: 13,
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>🔍 Feed Debug</h3>
            <button 
              onClick={() => setShowOverlay(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
          
          {/* Load time */}
          <div style={{ 
            padding: '8px 12px', 
            background: loadTime > 5000 ? 'rgba(255,0,0,0.3)' : loadTime > 2000 ? 'rgba(255,165,0,0.3)' : 'rgba(0,255,0,0.2)',
            borderRadius: 8,
            marginBottom: 12
          }}>
            ⏱️ Load time: <strong>{loadTime}ms</strong> ({(loadTime / 1000).toFixed(1)}s)
          </div>
          
          {/* Card counts */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>📊 Card Types:</div>
            {cardStats.map(stat => (
              <div key={stat.type} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                padding: '4px 8px',
                background: stat.count > 0 ? `${getCardTypeColor(stat.type)}22` : 'rgba(255,255,255,0.05)',
                borderLeft: `3px solid ${getCardTypeColor(stat.type)}`,
                marginBottom: 4,
                borderRadius: '0 4px 4px 0'
              }}>
                <span>{getCardTypeLabel(stat.type)}</span>
                <span style={{ 
                  fontWeight: 600,
                  color: stat.count > 0 ? getCardTypeColor(stat.type) : '#666'
                }}>
                  {stat.count}
                </span>
              </div>
            ))}
            <div style={{ 
              marginTop: 8, 
              padding: '6px 8px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: 4,
              fontWeight: 600 
            }}>
              Total cards: {feedItems.length}
            </div>
          </div>
          
          {/* Debug logs */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>📝 Logs:</div>
            <div style={{ 
              maxHeight: 200, 
              overflow: 'auto', 
              fontSize: 11, 
              fontFamily: 'monospace',
              background: 'rgba(0,0,0,0.5)',
              padding: 8,
              borderRadius: 4
            }}>
              {debugLogs.map((log, i) => (
                <div key={i} style={{ marginBottom: 2, color: log.includes('Error') ? '#ff6b6b' : '#aaa' }}>
                  {log}
                </div>
              ))}
            </div>
          </div>
          
          {/* Reload button */}
          <button
            onClick={loadFeed}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 12,
              padding: '10px',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              border: 'none',
              borderRadius: 8,
              color: 'white',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? '⏳ Loading...' : '🔄 Reload Feed'}
          </button>
        </div>
      )}
      
      {/* Toggle button when overlay is hidden */}
      {!showOverlay && (
        <button
          onClick={() => setShowOverlay(true)}
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            padding: '8px 16px',
            background: 'rgba(0,0,0,0.8)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            color: 'white',
            cursor: 'pointer',
            zIndex: 9999
          }}
        >
          🔍 Debug
        </button>
      )}
      
      {/* Main content */}
      <div style={{ 
        maxWidth: 420, 
        margin: '0 auto', 
        padding: '0 16px 100px' 
      }}>
        <h1 style={{ fontSize: 24, marginBottom: 20 }}>Feed Debug Mode</h1>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div>
            <div>Loading feed...</div>
          </div>
        )}
        
        {error && (
          <div style={{ 
            padding: 20, 
            background: 'rgba(255,0,0,0.2)', 
            border: '1px solid red',
            borderRadius: 8 
          }}>
            Error: {error}
          </div>
        )}
        
        {!loading && feedItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
            No feed items found
          </div>
        )}
        
        {/* Feed items with type labels */}
        {feedItems.map((item, index) => (
          <div key={item.id} style={{ marginBottom: 16 }}>
            {/* Card type label */}
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              background: getCardTypeColor(item.type),
              color: '#000',
              fontWeight: 600,
              fontSize: 12,
              borderRadius: '8px 8px 0 0',
              marginBottom: -1
            }}>
              {getCardTypeLabel(item.type)} • #{index + 1}
            </div>
            
            {/* Card preview */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: `2px solid ${getCardTypeColor(item.type)}`,
              borderRadius: '0 8px 8px 8px',
              padding: 16
            }}>
              <div style={{ fontSize: 14, marginBottom: 8 }}>
                <strong>ID:</strong> {item.id.substring(0, 20)}...
              </div>
              {item.type === 'activity' && item.data?.media && (
                <div>
                  <strong>Media:</strong> {(item.data.media as any)?.title || 'Unknown'}
                </div>
              )}
              {item.type === 'follow_suggestions' && (
                <div>
                  <strong>Suggestions:</strong> {item.data?.suggestions?.length || 0} users
                </div>
              )}
              {item.loadTime && (
                <div style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
                  Load time: {Math.round(item.loadTime)}ms
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

