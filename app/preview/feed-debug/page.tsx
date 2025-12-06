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
      
      // Get excluded media IDs (shows user has already interacted with)
      addLog('Fetching excluded media IDs...')
      const excludeStart = Date.now()
      const { data: userWatchStatus } = await supabase
        .from('watch_status')
        .select('media_id')
        .eq('user_id', authUser.id)
      const { data: userRatingsAll } = await supabase
        .from('ratings')
        .select('media_id')
        .eq('user_id', authUser.id)
      
      const excludedMediaIds = new Set<string>()
      userWatchStatus?.forEach((w: any) => excludedMediaIds.add(w.media_id))
      userRatingsAll?.forEach((r: any) => excludedMediaIds.add(r.media_id))
      addLog(`Excluded media: ${excludedMediaIds.size} in ${Date.now() - excludeStart}ms`)
      
      // 2. Fetch "Because You Liked" (ACTUALLY FETCH)
      addLog('Fetching Because You Liked...')
      const bylStart = Date.now()
      const { data: userRatings } = await supabase
        .from('ratings')
        .select('media_id, rating, media:media_id(id, title, media_type, tmdb_data)')
        .eq('user_id', authUser.id)
        .in('rating', ['like', 'love'])
        .order('created_at', { ascending: false })
        .limit(3)
      
      addLog(`User ratings: ${userRatings?.length || 0}`)
      
      if (userRatings && userRatings.length > 0) {
        // Actually fetch similar shows
        for (const rating of userRatings.slice(0, 2)) {
          const media = rating.media as any
          if (!media) continue
          
          // Extract TMDB ID
          const parts = media.id.split('-')
          const tmdbId = media.tmdb_data?.id || (parts.length >= 2 ? parseInt(parts[1]) : null)
          const mediaType = media.media_type || (media.id.startsWith('tv-') ? 'tv' : 'movie')
          
          if (!tmdbId) {
            addLog(`❌ No TMDB ID for: ${media.title}`)
            continue
          }
          
          addLog(`Fetching similar to: ${media.title} (${mediaType}-${tmdbId})`)
          
          try {
            const endpoint = mediaType === 'tv' ? `tv/${tmdbId}/similar` : `movie/${tmdbId}/similar`
            const response = await fetch(`/api/tmdb/${endpoint}`)
            
            if (!response.ok) {
              addLog(`❌ TMDB ${response.status} for ${media.title}`)
              continue
            }
            
            const data = await response.json()
            const similar = (data.results || []).slice(0, 5)
            addLog(`✅ Found ${similar.length} similar to ${media.title}`)
            
            // Add first non-excluded similar show
            for (const show of similar) {
              const showMediaId = `${mediaType}-${show.id}`
              if (!excludedMediaIds.has(showMediaId)) {
                items.push({
                  type: 'because_you_liked',
                  id: `byl-${showMediaId}`,
                  data: { media: show, sourceShowTitle: media.title },
                  loadTime: Date.now() - bylStart
                })
                addLog(`➕ Added recommendation: ${show.title || show.name}`)
                break
              }
            }
          } catch (err: any) {
            addLog(`❌ Error: ${err.message}`)
          }
        }
      }
      
      const bylTime = Date.now() - bylStart
      addLog(`Because You Liked completed in ${bylTime}ms`)
      
      // 3. Check for Coming Soon
      addLog('Checking Coming Soon...')
      const csStart = Date.now()
      const { data: watchStatus } = await supabase
        .from('watch_status')
        .select('media_id, media:media_id(id, title, media_type, tmdb_data)')
        .eq('user_id', authUser.id)
        .like('media_id', 'tv-%')
        .limit(5)
      
      addLog(`TV shows in watchlist: ${watchStatus?.length || 0}`)
      
      // Check each for upcoming seasons
      if (watchStatus && watchStatus.length > 0) {
        for (const item of watchStatus.slice(0, 3)) {
          const media = item.media as any
          if (!media) continue
          
          const parts = media.id.split('-')
          const tmdbId = media.tmdb_data?.id || (parts.length >= 2 ? parseInt(parts[1]) : null)
          
          if (!tmdbId) continue
          
          addLog(`Checking upcoming for: ${media.title} (${tmdbId})`)
          
          try {
            const response = await fetch(`/api/tmdb/tv/${tmdbId}`)
            if (!response.ok) continue
            
            const details = await response.json()
            const today = new Date().toISOString().split('T')[0]
            
            // Check for future seasons
            const futureSeason = details.seasons?.find((s: any) => 
              s.season_number > 0 && s.air_date && s.air_date > today
            )
            
            if (futureSeason) {
              addLog(`✅ Coming Soon: ${media.title} S${futureSeason.season_number} on ${futureSeason.air_date}`)
              items.push({
                type: 'coming_soon',
                id: `cs-${item.media_id}-s${futureSeason.season_number}`,
                data: { media, airDate: futureSeason.air_date, seasonNumber: futureSeason.season_number },
                loadTime: Date.now() - csStart
              })
            } else {
              addLog(`⏭️ No upcoming season for: ${media.title}`)
            }
          } catch (err: any) {
            addLog(`❌ Error: ${err.message}`)
          }
        }
      }
      
      const csTime = Date.now() - csStart
      addLog(`Coming Soon completed in ${csTime}ms`)
      
      // 4. Check for Friends Loved
      addLog('Checking Friends Loved...')
      const flStart = Date.now()
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', authUser.id)
      
      addLog(`Following: ${follows?.length || 0} users`)
      
      if (follows && follows.length >= 3) {
        const friendIds = follows.map((f: any) => f.following_id)
        
        const { data: friendLoves } = await supabase
          .from('ratings')
          .select('media_id, user_id, media:media_id(id, title, poster_path)')
          .in('user_id', friendIds)
          .eq('rating', 'love')
        
        if (friendLoves) {
          // Count loves per media
          const loveCounts = new Map<string, { media: any; count: number }>()
          friendLoves.forEach((r: any) => {
            if (!r.media) return
            if (!loveCounts.has(r.media_id)) {
              loveCounts.set(r.media_id, { media: r.media, count: 0 })
            }
            loveCounts.get(r.media_id)!.count++
          })
          
          // Find shows with 3+ loves
          for (const [mediaId, data] of loveCounts) {
            if (data.count >= 3 && !excludedMediaIds.has(mediaId)) {
              addLog(`✅ Friends Loved: ${data.media.title} (${data.count} friends)`)
              items.push({
                type: 'friends_loved',
                id: `fl-${mediaId}`,
                data: { media: data.media, friendCount: data.count },
                loadTime: Date.now() - flStart
              })
              break // Just add one for now
            }
          }
          
          if (!items.some(i => i.type === 'friends_loved')) {
            addLog(`⏭️ No shows with 3+ friend loves found`)
          }
        }
      } else {
        addLog(`⏭️ Need 3+ friends for Friends Loved`)
      }
      
      const flTime = Date.now() - flStart
      addLog(`Friends Loved completed in ${flTime}ms`)
      
      // 5. Check for You Might Like
      addLog('Checking You Might Like...')
      const ymlStart = Date.now()
      
      const { count: ratingCount } = await supabase
        .from('ratings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', authUser.id)
      
      addLog(`User has ${ratingCount || 0} ratings`)
      
      if (ratingCount && ratingCount >= 10) {
        // Find popular loved shows
        const { data: popularLoved } = await supabase
          .from('ratings')
          .select('media_id, media:media_id(id, title, poster_path)')
          .eq('rating', 'love')
          .neq('user_id', authUser.id)
        
        if (popularLoved) {
          const loveCounts = new Map<string, { media: any; count: number }>()
          popularLoved.forEach((r: any) => {
            if (!r.media) return
            if (!loveCounts.has(r.media_id)) {
              loveCounts.set(r.media_id, { media: r.media, count: 0 })
            }
            loveCounts.get(r.media_id)!.count++
          })
          
          const sorted = Array.from(loveCounts.entries())
            .filter(([mediaId]) => !excludedMediaIds.has(mediaId))
            .filter(([_, data]) => data.count >= 2)
            .sort((a, b) => b[1].count - a[1].count)
          
          if (sorted.length > 0) {
            const [mediaId, data] = sorted[0]
            addLog(`✅ You Might Like: ${data.media.title} (${data.count} users loved)`)
            items.push({
              type: 'you_might_like',
              id: `yml-${mediaId}`,
              data: { media: data.media, similarUsers: data.count },
              loadTime: Date.now() - ymlStart
            })
          } else {
            addLog(`⏭️ No eligible You Might Like shows found`)
          }
        }
      } else {
        addLog(`⏭️ Need 10+ ratings for You Might Like`)
      }
      
      const ymlTime = Date.now() - ymlStart
      addLog(`You Might Like completed in ${ymlTime}ms`)
      
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
      
      // Separate activities from recommendations
      const activityItems = items.filter(i => i.type === 'activity')
      const recommendationItems = items.filter(i => i.type !== 'activity')
      
      // Create follow suggestions card
      const followSuggestionsCard: FeedItem | null = suggestions && suggestions.length > 0 ? {
        type: 'follow_suggestions',
        id: 'follow-suggestions-1',
        data: { suggestions },
        loadTime: usTime
      } : null
      
      // ========================================
      // SMART FEED BUILDER - Same as main feed!
      // ========================================
      addLog('--- Building interleaved feed ---')
      
      const finalFeed: FeedItem[] = []
      let recIndex = 0
      let insertedFollowCard = false
      let activityCount = 0
      const activityInterval = 3 // Insert recommendation every 3 activities
      
      for (const item of activityItems) {
        finalFeed.push(item)
        activityCount++
        
        // After first 2 activities, insert follow suggestions (once)
        if (activityCount === 2 && followSuggestionsCard && !insertedFollowCard) {
          finalFeed.push(followSuggestionsCard)
          insertedFollowCard = true
          addLog(`📍 Inserted Find Friends after activity #${activityCount}`)
        }
        // Insert recommendation every 3 activities
        else if (activityCount >= activityInterval && recIndex < recommendationItems.length) {
          finalFeed.push(recommendationItems[recIndex])
          addLog(`📍 Inserted ${recommendationItems[recIndex].type} after activity #${activityCount}`)
          recIndex++
          activityCount = 0 // Reset counter
        }
      }
      
      // Add any remaining recommendations at the end
      while (recIndex < recommendationItems.length) {
        finalFeed.push(recommendationItems[recIndex])
        addLog(`📍 Appended remaining ${recommendationItems[recIndex].type}`)
        recIndex++
      }
      
      // If we didn't insert follow suggestions yet, add at end
      if (!insertedFollowCard && followSuggestionsCard) {
        finalFeed.push(followSuggestionsCard)
        addLog(`📍 Appended Find Friends at end`)
      }
      
      addLog(`Final feed: ${finalFeed.length} cards (${activityItems.length} activities + ${recommendationItems.length + (followSuggestionsCard ? 1 : 0)} other)`)
      
      setFeedItems(finalFeed)
      
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
                <strong>ID:</strong> {item.id.substring(0, 30)}...
              </div>
              
              {item.type === 'activity' && item.data?.media && (
                <div>
                  <strong>Media:</strong> {(item.data.media as any)?.title || 'Unknown'}
                  <br />
                  <strong>User:</strong> {(item.data.profiles as any)?.display_name || 'Unknown'}
                  <br />
                  <strong>Type:</strong> {item.data.activity_type}
                </div>
              )}
              
              {item.type === 'because_you_liked' && (
                <div>
                  <strong>Recommended:</strong> {item.data?.media?.title || item.data?.media?.name || 'Unknown'}
                  <br />
                  <strong>Because you liked:</strong> {item.data?.sourceShowTitle || 'Unknown'}
                </div>
              )}
              
              {item.type === 'friends_loved' && (
                <div>
                  <strong>Show:</strong> {item.data?.media?.title || 'Unknown'}
                  <br />
                  <strong>Loved by:</strong> {item.data?.friendCount || 0} friends
                </div>
              )}
              
              {item.type === 'coming_soon' && (
                <div>
                  <strong>Show:</strong> {item.data?.media?.title || 'Unknown'}
                  <br />
                  <strong>Season:</strong> {item.data?.seasonNumber}
                  <br />
                  <strong>Air Date:</strong> {item.data?.airDate}
                </div>
              )}
              
              {item.type === 'you_might_like' && (
                <div>
                  <strong>Show:</strong> {item.data?.media?.title || 'Unknown'}
                  <br />
                  <strong>Loved by:</strong> {item.data?.similarUsers || 0} users
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

