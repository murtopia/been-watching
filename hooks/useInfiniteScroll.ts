'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  /** Threshold in pixels before the end to trigger load (default: 200) */
  threshold?: number
  /** Whether infinite scroll is enabled (default: true) */
  enabled?: boolean
  /** Root element for intersection observer (default: null = viewport) */
  root?: Element | null
}

interface UseInfiniteScrollReturn<T> {
  /** Ref to attach to the loader/trigger element */
  loaderRef: React.RefObject<HTMLDivElement | null>
  /** Whether currently loading more items */
  isLoadingMore: boolean
  /** Whether there are more items to load */
  hasMore: boolean
  /** Error message if load failed */
  error: string | null
  /** All loaded items */
  items: T[]
  /** Reset the scroll state (for refresh) */
  reset: () => void
  /** Manually trigger loading more */
  loadMore: () => Promise<void>
  /** Set items directly (for initial load) */
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  /** Set hasMore directly */
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>
  /** Set loading state */
  setIsLoadingMore: React.Dispatch<React.SetStateAction<boolean>>
  /** Set error state */
  setError: React.Dispatch<React.SetStateAction<string | null>>
}

/**
 * Custom hook for infinite scroll using Intersection Observer
 * 
 * @param fetchMore - Async function to fetch more items. Should return { items, hasMore }
 * @param options - Configuration options
 * @returns Infinite scroll state and controls
 * 
 * @example
 * ```tsx
 * const { loaderRef, items, isLoadingMore, hasMore } = useInfiniteScroll(
 *   async (cursor) => {
 *     const res = await fetch(`/api/feed?cursor=${cursor}&limit=5`)
 *     const data = await res.json()
 *     return { items: data.items, hasMore: data.hasMore, nextCursor: data.nextCursor }
 *   }
 * )
 * 
 * return (
 *   <div>
 *     {items.map(item => <Card key={item.id} {...item} />)}
 *     <div ref={loaderRef}>
 *       {isLoadingMore && <Spinner />}
 *       {!hasMore && <p>No more items</p>}
 *     </div>
 *   </div>
 * )
 * ```
 */
export function useInfiniteScroll<T>(
  fetchMore: (cursor: string | null) => Promise<{ 
    items: T[]
    hasMore: boolean
    nextCursor: string | null 
  }>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn<T> {
  const { threshold = 200, enabled = true, root = null } = options

  const [items, setItems] = useState<T[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  
  const loaderRef = useRef<HTMLDivElement>(null)
  const isLoadingRef = useRef(false) // Prevent duplicate calls

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || !enabled) return
    
    isLoadingRef.current = true
    setIsLoadingMore(true)
    setError(null)

    try {
      const result = await fetchMore(cursor)
      
      setItems(prev => [...prev, ...result.items])
      setHasMore(result.hasMore)
      setCursor(result.nextCursor)
    } catch (err) {
      console.error('Error loading more items:', err)
      setError(err instanceof Error ? err.message : 'Failed to load more items')
    } finally {
      setIsLoadingMore(false)
      isLoadingRef.current = false
    }
  }, [cursor, hasMore, enabled, fetchMore])

  const reset = useCallback(() => {
    setItems([])
    setIsLoadingMore(false)
    setHasMore(true)
    setError(null)
    setCursor(null)
    isLoadingRef.current = false
  }, [])

  // Intersection Observer setup
  useEffect(() => {
    if (!enabled) return

    const loader = loaderRef.current
    if (!loader) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !isLoadingRef.current) {
          loadMore()
        }
      },
      {
        root,
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    )

    observer.observe(loader)

    return () => {
      observer.disconnect()
    }
  }, [enabled, hasMore, loadMore, root, threshold])

  return {
    loaderRef,
    isLoadingMore,
    hasMore,
    error,
    items,
    reset,
    loadMore,
    setItems,
    setHasMore,
    setIsLoadingMore,
    setError
  }
}

export default useInfiniteScroll

