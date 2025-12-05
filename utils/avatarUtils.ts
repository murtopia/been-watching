/**
 * Avatar Utilities
 * 
 * Provides consistent avatar handling with initials fallback
 * when users haven't uploaded a profile photo.
 * 
 * Best practices:
 * - Consistent colors based on user ID (same user always gets same color)
 * - Good contrast for readability
 * - Circular design matching existing avatars
 */

/**
 * Generate initials from a name
 * @param name Display name or username
 * @returns 1-2 uppercase letters
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  
  // Split by spaces and get first letter of each word
  const parts = name.trim().split(/\s+/)
  
  if (parts.length === 0) return '?'
  if (parts.length === 1) {
    // Single word: use first 2 letters if available
    return parts[0].substring(0, 2).toUpperCase()
  }
  
  // Multiple words: use first letter of first two words
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/**
 * Generate a consistent color for a user based on their ID
 * Uses a hash function to ensure same user always gets same color
 * @param userId User ID or username (for consistency)
 * @returns CSS color string (hex or rgba)
 */
export function getUserColor(userId: string | null | undefined): string {
  if (!userId) return '#8B5CF6' // Default purple
  
  // Simple hash function
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Use hash to pick from a curated palette of vibrant colors
  // These colors have good contrast with white text
  const colors = [
    '#E94D88', // Pink
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Rose
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#6366F1', // Indigo
    '#14B8A6', // Teal
    '#EF4444', // Red
    '#A855F7', // Violet
  ]
  
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

/**
 * Generate a gradient background for initials avatar
 * Creates a subtle gradient for visual interest
 * @param baseColor Base color (from getUserColor)
 * @returns CSS gradient string
 */
export function getAvatarGradient(baseColor: string): string {
  // Create a slightly darker variant for gradient
  // This is a simple approach - could be enhanced with color manipulation
  const gradients: Record<string, string> = {
    '#E94D88': 'linear-gradient(135deg, #E94D88 0%, #C2185B 100%)',
    '#3B82F6': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    '#10B981': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    '#F59E0B': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    '#8B5CF6': 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    '#EC4899': 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
    '#06B6D4': 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    '#F97316': 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
    '#6366F1': 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    '#14B8A6': 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
    '#EF4444': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    '#A855F7': 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)',
  }
  
  return gradients[baseColor] || `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}dd 100%)`
}

/**
 * Avatar component props for rendering
 */
export interface AvatarProps {
  src?: string | null
  alt: string
  name?: string | null
  userId?: string | null
  size?: number
  className?: string
  style?: React.CSSProperties
}

/**
 * Get avatar props for rendering
 * Returns either image src or initials data
 */
export function getAvatarProps(
  avatarUrl: string | null | undefined,
  name: string | null | undefined,
  userId: string | null | undefined
): {
  hasImage: boolean
  imageSrc?: string
  initials?: string
  backgroundColor?: string
  backgroundGradient?: string
} {
  // Check if avatarUrl is a valid, non-empty string
  // Also filter out common placeholder/default URLs that might be broken
  const isValidUrl = avatarUrl && 
    avatarUrl.trim() !== '' && 
    avatarUrl !== '/images/default-avatar.png' &&
    (avatarUrl.startsWith('data:') || avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://') || avatarUrl.startsWith('/'))
  
  if (isValidUrl) {
    return {
      hasImage: true,
      imageSrc: avatarUrl,
    }
  }
  
  const initials = getInitials(name || userId || '?')
  const color = getUserColor(userId || name || undefined)
  const gradient = getAvatarGradient(color)
  
  return {
    hasImage: false,
    initials,
    backgroundColor: color,
    backgroundGradient: gradient,
  }
}

