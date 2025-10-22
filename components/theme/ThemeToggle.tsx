'use client'

import { useTheme } from '@/contexts/ThemeContext'

export default function ThemeToggle() {
  const { themeMode, cycleTheme, resolvedTheme } = useTheme()

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'auto':
        return '💻'
      case 'light':
        return '☀️'
      case 'dark':
        return '🌙'
    }
  }

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'auto':
        return 'Auto'
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
    }
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={cycleTheme}
      aria-label="Toggle theme"
      style={{
        padding: '0.5rem 1rem',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s ease',
        background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        color: isDark ? '#ffffff' : '#1a1a1a'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <span>{getThemeIcon()}</span>
      <span>{getThemeLabel()}</span>
    </button>
  )
}
