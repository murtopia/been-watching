'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/utils/supabase/client'

type ThemeMode = 'auto' | 'light' | 'dark'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  themeMode: ThemeMode
  resolvedTheme: ResolvedTheme
  setThemeMode: (mode: ThemeMode) => void
  cycleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'been-watching-theme'

// Safe localStorage helpers (handles private browsing, etc.)
const getStoredTheme = (): ThemeMode | null => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored && ['auto', 'light', 'dark'].includes(stored)) {
        return stored as ThemeMode
      }
    }
  } catch (e) {
    // localStorage not available (private browsing, etc.)
  }
  return null
}

const setStoredTheme = (mode: ThemeMode) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, mode)
    }
  } catch (e) {
    // localStorage not available
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark') // Will be updated by useEffect
  const [userId, setUserId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const supabase = createClient()

  // Load theme preference - check localStorage first, then database for logged-in users
  useEffect(() => {
    const loadTheme = async () => {
      // First, check localStorage for a saved preference (works for all users)
      const savedTheme = getStoredTheme()
      if (savedTheme) {
        setThemeModeState(savedTheme)
      }

      // Then check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)

        // Get theme preference from profile (database takes precedence)
        const { data: profile } = await supabase
          .from('profiles')
          .select('theme_preference')
          .eq('id', user.id)
          .single()

        if (profile?.theme_preference) {
          setThemeModeState(profile.theme_preference as ThemeMode)
          // Sync localStorage with database preference
          setStoredTheme(profile.theme_preference as ThemeMode)
        } else if (savedTheme) {
          // User has no DB preference but has localStorage - sync to DB
          await supabase
            .from('profiles')
            .update({ theme_preference: savedTheme })
            .eq('id', user.id)
        }
      }

      setIsInitialized(true)
    }

    loadTheme()
  }, [])

  // Resolve theme based on mode and system preference
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (themeMode === 'auto') {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
        setResolvedTheme(darkModeQuery.matches ? 'dark' : 'light')
      } else {
        setResolvedTheme(themeMode)
      }
    }

    updateResolvedTheme()

    // Listen for system preference changes when in auto mode
    if (themeMode === 'auto') {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? 'dark' : 'light')
      }
      darkModeQuery.addEventListener('change', handler)
      return () => darkModeQuery.removeEventListener('change', handler)
    }
  }, [themeMode])

  // Save theme preference to localStorage and database (if logged in)
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode)

    // Always save to localStorage (works for all users, including pre-login)
    setStoredTheme(mode)

    // Also save to database if user is logged in
    if (userId) {
      await supabase
        .from('profiles')
        .update({ theme_preference: mode })
        .eq('id', userId)
    }
  }

  // Cycle through themes: auto -> light -> dark -> auto
  const cycleTheme = () => {
    const cycle: ThemeMode[] = ['auto', 'light', 'dark']
    const currentIndex = cycle.indexOf(themeMode)
    const nextIndex = (currentIndex + 1) % cycle.length
    setThemeMode(cycle[nextIndex])
  }

  return (
    <ThemeContext.Provider value={{ themeMode, resolvedTheme, setThemeMode, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
