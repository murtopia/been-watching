import { useTheme } from '@/contexts/ThemeContext'

/**
 * Centralized theme colors hook
 *
 * This hook provides all design tokens in one place.
 * Change colors here and they update across the entire site.
 *
 * Usage:
 *   const colors = useThemeColors()
 *   <div style={{ color: colors.textPrimary }}>
 */
export function useThemeColors() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return {
    // Background Colors
    background: isDark
      ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)'
      : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
    bgGradient: isDark
      ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)'
      : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
    cardBg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
    cardBgHover: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f8f9fa',
    surfaceBg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    glassBg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)',

    // Border Colors
    cardBorder: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #f0f0f0',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0',
    dividerColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0',

    // Text Colors
    textPrimary: isDark ? '#ffffff' : '#1a1a1a',
    textSecondary: isDark ? 'rgba(255, 255, 255, 0.6)' : '#666666',
    textTertiary: isDark ? 'rgba(255, 255, 255, 0.4)' : '#999999',
    textDisabled: isDark ? 'rgba(255, 255, 255, 0.3)' : '#cccccc',

    // Brand Colors (Instagram Blue chosen)
    brandPink: '#e94d88',
    brandOrange: '#f27121',
    brandGradient: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
    brandBlue: '#0095f6',  // Instagram blue - our standard

    // Semantic Colors (for ratings)
    love: '#FF2D55',
    like: '#007AFF',
    meh: '#8E8E93',

    // Status Colors
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',

    // Input Colors
    inputBg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    inputBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e0e0e0',
    inputBorderFocus: isDark ? 'rgba(233, 77, 136, 0.5)' : '#e94d88',
    inputPlaceholder: isDark ? 'rgba(255, 255, 255, 0.4)' : '#999999',

    // Button Colors
    buttonBg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'white',
    buttonBgHover: isDark ? 'rgba(255, 255, 255, 0.15)' : '#f8f9fa',
    buttonBgActive: isDark ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0',
    buttonBorder: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #dddddd',
    buttonBorderHover: isDark ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid #999999',

    // Badge Colors
    badgeBg: isDark ? 'rgba(255, 255, 255, 0.15)' : '#e0e0e0',
    badgeText: isDark ? '#ffffff' : '#1a1a1a',

    // Interactive Overlays
    hoverOverlay: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    activeOverlay: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',

    // Effects
    backdropBlur: isDark ? 'blur(20px)' : 'none',
    backdropBlurStrong: 'blur(20px)',  // Always blur for glassmorphic effect

    // Shadows
    shadowSm: isDark
      ? '0 2px 8px rgba(0, 0, 0, 0.2)'
      : '0 2px 8px rgba(0, 0, 0, 0.1)',
    shadowMd: isDark
      ? '0 4px 12px rgba(0, 0, 0, 0.3)'
      : '0 4px 12px rgba(0, 0, 0, 0.1)',
    shadowLg: isDark
      ? '0 20px 60px rgba(0, 0, 0, 0.5)'
      : '0 20px 60px rgba(0, 0, 0, 0.08)',

    // Navigation Colors (for BottomNav)
    navContainer: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.6)',
    navButton: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.06)',
    navButtonActive: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
    navText: isDark ? 'rgba(255, 255, 255, 0.9)' : '#000000',
    navTextActive: isDark ? '#ffffff' : '#0095f6',

    // Helper
    isDark,

    // Utility functions for common patterns
    getButtonStyle: (isActive = false) => ({
      background: isActive
        ? (isDark ? 'rgba(255, 255, 255, 0.2)' : '#e0e0e0')
        : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'white'),
      border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #dddddd',
      color: isDark ? '#ffffff' : '#1a1a1a'
    }),

    getCardStyle: () => ({
      background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #f0f0f0',
      borderRadius: '12px',
      backdropFilter: isDark ? 'blur(20px)' : 'none'
    })
  }
}
