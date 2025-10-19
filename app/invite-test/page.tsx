'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface MasterCode {
  code: string
  type: string
  max_uses: number | null
  current_uses: number
  is_active: boolean
}

interface WaitlistEntry {
  email: string
  name: string | null
  position: number
  created_at: string
}

export default function InviteTestPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [masterCodes, setMasterCodes] = useState<MasterCode[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [testCode, setTestCode] = useState('BOOZEHOUND')
  const [validationResult, setValidationResult] = useState<string>('')
  const [testEmail, setTestEmail] = useState('')
  const [testName, setTestName] = useState('')
  const [waitlistResult, setWaitlistResult] = useState<string>('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // Check system preference on mount
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDarkMode(darkModeQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches)
    darkModeQuery.addEventListener('change', handler)
    return () => darkModeQuery.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth')
      return
    }

    // Get user profile to check admin status
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData?.is_admin) {
      router.push('/')
      return
    }

    setUser(user)
    setProfile(profileData)
    setLoading(false)
    loadData()
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
    } else {
      router.push('/auth')
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'AD'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD'
  }

  const loadData = async () => {
    // Load master codes
    const { data: codes } = await supabase
      .from('master_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (codes) {
      setMasterCodes(codes)
    }

    // Load waitlist
    const { data: waitlistData } = await supabase
      .from('waitlist')
      .select('*')
      .order('position', { ascending: true })

    if (waitlistData) {
      setWaitlist(waitlistData)
    }
  }

  const testCodeValidation = async () => {
    setValidationResult('Testing...')
    const { data, error } = await supabase.rpc('is_master_code_valid', {
      master_code: testCode.toUpperCase()
    })

    if (error) {
      setValidationResult(`❌ Error: ${error.message}`)
    } else if (data === true) {
      setValidationResult('✅ Code is valid and can be used!')
    } else {
      setValidationResult('❌ Code is invalid or maxed out')
    }
  }

  const addToWaitlist = async () => {
    if (!testEmail) {
      setWaitlistResult('❌ Email is required')
      return
    }

    setWaitlistResult('Adding...')
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ email: testEmail, name: testName || null }])
      .select()

    if (error) {
      setWaitlistResult(`❌ Error: ${error.message}`)
    } else if (data && data.length > 0) {
      setWaitlistResult(`✅ Added! Position: #${data[0].position}`)
      setTestEmail('')
      setTestName('')
      loadData() // Refresh
    }
  }

  const generateBWAlphaCode = async () => {
    const { data, error } = await supabase.rpc('create_bwalpha_code')
    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert(`New code created: ${data}`)
      loadData() // Refresh
    }
  }

  const bgGradient = isDarkMode
    ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
  const cardBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)'
  const cardBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  const textPrimary = isDarkMode ? '#ffffff' : '#1a1a1a'
  const textSecondary = isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'
  const inputBg = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
  const inputBorder = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: bgGradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255, 255, 255, 0.1)',
            borderTopColor: '#e94d88',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: textSecondary }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: bgGradient,
        padding: '2rem',
        color: textPrimary,
      }}
    >
      {/* User Profile Section - Top Right */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '1rem', paddingBottom: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem' }}>
        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            padding: '0.5rem 1rem',
            background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            border: `1px solid ${cardBorder}`,
            borderRadius: '8px',
            color: textPrimary,
            fontSize: '1rem',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          {isDarkMode ? '🌙' : '☀️'}
        </button>

        {/* User Info Card */}
        {profile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.5rem 1rem',
            background: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            border: `1px solid ${cardBorder}`,
            borderRadius: '8px',
            backdropFilter: 'blur(10px)'
          }}>
            {/* Avatar or initials */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                {getInitials(profile.display_name)}
              </div>
            )}

            {/* Username */}
            <span style={{
              color: textPrimary,
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              {profile.username}
            </span>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                padding: '0.375rem 0.75rem',
                background: 'linear-gradient(135deg, #e94d88 0%, #f27121 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Log Out
            </button>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Invite System Test Page
        </h1>
        <p style={{ color: textSecondary, marginBottom: '2rem' }}>
          Test the invite code validation, waitlist, and view all codes
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Code Validation Test */}
          <div
            style={{
              background: cardBg,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
              padding: '1.5rem',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
              Test Code Validation
            </h2>
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              placeholder="Enter code to test"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
                color: textPrimary,
                fontSize: '1rem',
              }}
            />
            <button
              onClick={testCodeValidation}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
            >
              Validate Code
            </button>
            {validationResult && (
              <div
                style={{
                  padding: '1rem',
                  background: inputBg,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                }}
              >
                {validationResult}
              </div>
            )}
          </div>

          {/* Waitlist Test */}
          <div
            style={{
              background: cardBg,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${cardBorder}`,
              borderRadius: '16px',
              padding: '1.5rem',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
              Test Waitlist
            </h2>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Email"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '0.75rem',
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
                color: textPrimary,
                fontSize: '1rem',
              }}
            />
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Name (optional)"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                borderRadius: '8px',
                color: textPrimary,
                fontSize: '1rem',
              }}
            />
            <button
              onClick={addToWaitlist}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
            >
              Add to Waitlist
            </button>
            {waitlistResult && (
              <div
                style={{
                  padding: '1rem',
                  background: inputBg,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                }}
              >
                {waitlistResult}
              </div>
            )}
          </div>
        </div>

        {/* Master Codes List */}
        <div
          style={{
            background: cardBg,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Master Codes</h2>
            <button
              onClick={generateBWAlphaCode}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Generate BWALPHA Code
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600 }}>Code</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600 }}>Max Uses</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600 }}>Current Uses</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {masterCodes.map((code) => (
                  <tr key={code.code} style={{ borderBottom: `1px solid ${cardBorder}` }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, fontFamily: 'monospace' }}>{code.code}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{code.type}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{code.max_uses || 'Unlimited'}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{code.current_uses}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      <span
                        style={{
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          background: code.is_active ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                          color: code.is_active ? '#0f0' : '#f00',
                          fontSize: '0.75rem',
                        }}
                      >
                        {code.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Waitlist */}
        <div
          style={{
            background: cardBg,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${cardBorder}`,
            borderRadius: '16px',
            padding: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
            Waitlist ({waitlist.length})
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600 }}>Position</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600 }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {waitlist.map((entry) => (
                  <tr key={entry.email} style={{ borderBottom: `1px solid ${cardBorder}` }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>#{entry.position}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{entry.email}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{entry.name || '-'}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {waitlist.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: textSecondary }}>
                      No waitlist entries yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <a
            href="/auth"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Go to Auth Page
          </a>
          <a
            href="/waitlist"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Go to Waitlist Page
          </a>
          <a
            href="/admin"
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Go to Admin Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
