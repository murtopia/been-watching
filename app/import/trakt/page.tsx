'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { createClient } from '@/utils/supabase/client'

export default function TraktImportPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [targetUserId, setTargetUserId] = useState('')
  const [watchedShowsFile, setWatchedShowsFile] = useState<File | null>(null)
  const [watchedMoviesFile, setWatchedMoviesFile] = useState<File | null>(null)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const isDark = resolvedTheme === 'dark'

  // Theme colors
  const bgPrimary = isDark ? '#0a0a0a' : '#ffffff'
  const bgSecondary = isDark ? '#1a1a1a' : '#f5f5f5'
  const textPrimary = isDark ? '#ffffff' : '#000000'
  const textSecondary = isDark ? 'rgba(255, 255, 255, 0.6)' : '#666666'
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  useEffect(() => {
    checkAdminAccess()
  }, [])

  async function checkAdminAccess() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        router.push('/')
        return
      }

      setIsAdmin(true)
      setTargetUserId(user.id) // Default to current user
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  async function handleImport() {
    if (!watchedShowsFile && !watchedMoviesFile) {
      setError('Please select at least one file to import')
      return
    }

    if (!targetUserId) {
      setError('Please enter a target user ID')
      return
    }

    setImporting(true)
    setError(null)
    setResults(null)

    try {
      let watchedShows = null
      let watchedMovies = null

      // Read files
      if (watchedShowsFile) {
        const showsText = await watchedShowsFile.text()
        watchedShows = JSON.parse(showsText)
      }

      if (watchedMoviesFile) {
        const moviesText = await watchedMoviesFile.text()
        watchedMovies = JSON.parse(moviesText)
      }

      // Send to API
      const response = await fetch('/api/import/trakt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          watchedShows,
          watchedMovies
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setResults(data.results)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setImporting(false)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: bgPrimary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: textPrimary
      }}>
        <div style={{ fontSize: '1.125rem' }}>Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: bgPrimary,
      padding: '2rem',
      color: textPrimary
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '0.5rem'
          }}>
            Import from Trakt.tv
          </h1>
          <p style={{ color: textSecondary, fontSize: '0.9375rem' }}>
            Import watch history from Trakt.tv export files
          </p>
        </div>

        {/* Instructions */}
        <div style={{
          background: bgSecondary,
          border: `1px solid ${borderColor}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            How to Import from Trakt.tv
          </h2>
          <ol style={{
            paddingLeft: '1.5rem',
            color: textSecondary,
            fontSize: '0.9375rem',
            lineHeight: '1.6'
          }}>
            <li style={{ marginBottom: '0.5rem' }}>
              Go to <a href="https://trakt.tv/settings/data" target="_blank" rel="noopener noreferrer" style={{ color: '#e94d88', textDecoration: 'none' }}>Trakt.tv Settings → Data</a>
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Click "Export trakt data" and wait for the email (usually arrives within a few minutes)
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              Download and extract the ZIP file you receive
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              You'll see many files, but you only need two: <code style={{ background: isDark ? '#000' : '#e5e5e5', padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.875rem' }}>watched-shows.json</code> and <code style={{ background: isDark ? '#000' : '#e5e5e5', padding: '0.125rem 0.375rem', borderRadius: '4px', fontSize: '0.875rem' }}>watched-movies.json</code>
            </li>
            <li>
              Upload those two files below and we'll import your complete watch history!
            </li>
          </ol>

          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: isDark ? 'rgba(233, 77, 136, 0.1)' : 'rgba(233, 77, 136, 0.05)',
            border: `1px solid ${isDark ? 'rgba(233, 77, 136, 0.2)' : 'rgba(233, 77, 136, 0.15)'}`,
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: textSecondary
          }}>
            <strong style={{ color: '#e94d88' }}>Note:</strong> Your Trakt export will include many history files (history-1.json, history-2.json, etc.) - you can ignore those! We only need the two watched files mentioned above.
          </div>
        </div>

        {/* Import Form */}
        <div style={{
          background: bgSecondary,
          border: `1px solid ${borderColor}`,
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          {/* Target User ID */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Target User ID
            </label>
            <input
              type="text"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="User ID to import data for"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: bgPrimary,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                color: textPrimary,
                fontSize: '0.9375rem'
              }}
            />
          </div>

          {/* Watched Shows File */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Watched Shows File
            </label>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setWatchedShowsFile(e.target.files?.[0] || null)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: bgPrimary,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                color: textPrimary,
                fontSize: '0.9375rem'
              }}
            />
            {watchedShowsFile && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: textSecondary }}>
                Selected: {watchedShowsFile.name}
              </div>
            )}
          </div>

          {/* Watched Movies File */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem'
            }}>
              Watched Movies File
            </label>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setWatchedMoviesFile(e.target.files?.[0] || null)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: bgPrimary,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                color: textPrimary,
                fontSize: '0.9375rem'
              }}
            />
            {watchedMoviesFile && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: textSecondary }}>
                Selected: {watchedMoviesFile.name}
              </div>
            )}
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={importing || (!watchedShowsFile && !watchedMoviesFile) || !targetUserId}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: importing ? textSecondary : 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: importing ? 'not-allowed' : 'pointer',
              opacity: (!watchedShowsFile && !watchedMoviesFile) || !targetUserId ? 0.5 : 1
            }}
          >
            {importing ? 'Importing... This may take a while' : 'Start Import'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ef4444'
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            background: bgSecondary,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              Import Complete!
            </h3>

            {results.shows && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  TV Shows
                </div>
                <div style={{ fontSize: '0.9375rem', color: textSecondary }}>
                  Processed: {results.shows.processed} | Imported: {results.shows.imported} | Skipped: {results.shows.skipped} | Errors: {results.shows.errors}
                </div>
              </div>
            )}

            {results.movies && (
              <div>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Movies
                </div>
                <div style={{ fontSize: '0.9375rem', color: textSecondary }}>
                  Processed: {results.movies.processed} | Imported: {results.movies.imported} | Skipped: {results.movies.skipped} | Errors: {results.movies.errors}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
