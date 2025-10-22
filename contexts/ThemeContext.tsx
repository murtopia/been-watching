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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark')
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = createClient()

  // Load user and their theme preference
  useEffect(() => {
    const loadUserTheme = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)

        // Get theme preference from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('theme_preference')
          .eq('id', user.id)
          .single()

        if (profile?.theme_preference) {
          setThemeModeState(profile.theme_preference as ThemeMode)
        }
      }
    }

    loadUserTheme()
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

  // Save theme preference to database
  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode)

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
