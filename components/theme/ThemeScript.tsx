'use client'

import { useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

/**
 * Client component that updates the data-theme attribute on the HTML element
 * Must be placed inside ThemeProvider in the layout
 */
export default function ThemeScript() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  return null
}
