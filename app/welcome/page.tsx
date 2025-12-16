'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'

/**
 * /welcome page is deprecated - redirects to homepage
 * Shows a minimal loading state while redirecting to avoid flash
 */
export default function WelcomePage() {
  const router = useRouter()
  const colors = useThemeColors()

  useEffect(() => {
    // Redirect to root - /welcome is deprecated in favor of /
    router.replace('/')
  }, [router])

  // Minimal loading state while redirect happens
  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{
        width: '32px',
        height: '32px',
        border: `4px solid ${colors.goldAccent}`,
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
