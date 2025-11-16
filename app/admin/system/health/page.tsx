'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useThemeColors } from '@/hooks/useThemeColors'
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, ArrowLeft, Activity, Database, Zap, Server } from 'lucide-react'

interface HealthCheck {
  name: string
  status: 'healthy' | 'warning' | 'error'
  responseTime: number
  message: string
  lastChecked: string
}

export default function HealthChecksPage() {
  const router = useRouter()
  const colors = useThemeColors()
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const runHealthChecks = async () => {
    setLoading(true)
    const checks: HealthCheck[] = []
    const now = new Date().toISOString()

    // Check 1: Database Connection
    try {
      const startTime = Date.now()
      const response = await fetch('/api/health/database')
      const responseTime = Date.now() - startTime
      const data = await response.json()

      checks.push({
        name: 'Database Connection',
        status: response.ok ? 'healthy' : 'error',
        responseTime,
        message: response.ok ? 'Connected successfully' : data.error || 'Connection failed',
        lastChecked: now
      })
    } catch (error) {
      checks.push({
        name: 'Database Connection',
        status: 'error',
        responseTime: 0,
        message: 'Health check failed',
        lastChecked: now
      })
    }

    // Check 2: API Response Time
    try {
      const startTime = Date.now()
      const response = await fetch('/api/health/ping')
      const responseTime = Date.now() - startTime

      checks.push({
        name: 'API Response Time',
        status: responseTime < 500 ? 'healthy' : responseTime < 1000 ? 'warning' : 'error',
        responseTime,
        message: responseTime < 500 ? 'Excellent' : responseTime < 1000 ? 'Acceptable' : 'Slow',
        lastChecked: now
      })
    } catch (error) {
      checks.push({
        name: 'API Response Time',
        status: 'error',
        responseTime: 0,
        message: 'API unreachable',
        lastChecked: now
      })
    }

    // Check 3: Authentication Service
    try {
      const startTime = Date.now()
      const response = await fetch('/api/health/auth')
      const responseTime = Date.now() - startTime
      const data = await response.json()

      checks.push({
        name: 'Authentication Service',
        status: response.ok ? 'healthy' : 'error',
        responseTime,
        message: response.ok ? data.message || 'Service operational' : 'Service unavailable',
        lastChecked: now
      })
    } catch (error) {
      checks.push({
        name: 'Authentication Service',
        status: 'error',
        responseTime: 0,
        message: 'Service check failed',
        lastChecked: now
      })
    }

    // Check 4: TMDB API
    try {
      const startTime = Date.now()
      const response = await fetch('/api/health/tmdb')
      const responseTime = Date.now() - startTime
      const data = await response.json()

      checks.push({
        name: 'TMDB API',
        status: response.ok ? 'healthy' : 'warning',
        responseTime,
        message: response.ok ? 'API accessible' : 'API issues detected',
        lastChecked: now
      })
    } catch (error) {
      checks.push({
        name: 'TMDB API',
        status: 'warning',
        responseTime: 0,
        message: 'External API check failed',
        lastChecked: now
      })
    }

    setHealthChecks(checks)
    setLoading(false)
  }

  useEffect(() => {
    runHealthChecks()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(runHealthChecks, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusIcon = (status: string) => {
    if (status === 'healthy') return <CheckCircle2 size={20} color="#16a34a" />
    if (status === 'warning') return <AlertCircle size={20} color="#f59e0b" />
    return <XCircle size={20} color="#dc2626" />
  }

  const getStatusColor = (status: string) => {
    if (status === 'healthy') return '#16a34a'
    if (status === 'warning') return '#f59e0b'
    return '#dc2626'
  }

  const overallStatus = healthChecks.every(c => c.status === 'healthy')
    ? 'healthy'
    : healthChecks.some(c => c.status === 'error')
    ? 'error'
    : 'warning'

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => router.push('/admin/system')}
          style={{
            background: 'none',
            border: 'none',
            color: colors.textSecondary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.5rem',
            fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} />
          Back to System Overview
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: colors.textPrimary,
              marginBottom: '0.5rem'
            }}>
              Health Checks
            </h1>
            <p style={{
              fontSize: '1rem',
              color: colors.textSecondary
            }}>
              Real-time system health monitoring
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: colors.textSecondary }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Auto-refresh (30s)
            </label>

            <button
              onClick={runHealthChecks}
              disabled={loading}
              style={{
                background: colors.buttonBg,
                border: colors.buttonBorder,
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600',
                color: colors.textPrimary,
                opacity: loading ? 0.6 : 1
              }}
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              Refresh Now
            </button>
          </div>
        </div>
      </div>

      {/* Overall Status Banner */}
      <div style={{
        background: overallStatus === 'healthy'
          ? 'rgba(22, 163, 74, 0.1)'
          : overallStatus === 'warning'
          ? 'rgba(245, 158, 11, 0.1)'
          : 'rgba(220, 38, 38, 0.1)',
        border: `1px solid ${getStatusColor(overallStatus)}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {getStatusIcon(overallStatus)}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', color: getStatusColor(overallStatus), marginBottom: '0.25rem' }}>
            System Status: {overallStatus === 'healthy' ? 'All Systems Operational' : overallStatus === 'warning' ? 'Some Issues Detected' : 'Critical Issues'}
          </div>
          <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
            Last checked: {healthChecks[0] ? formatTime(healthChecks[0].lastChecked) : 'Never'}
          </div>
        </div>
      </div>

      {/* Health Checks List */}
      <div style={{
        background: colors.cardBg,
        backdropFilter: 'blur(20px)',
        border: colors.cardBorder,
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {loading && healthChecks.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: colors.textSecondary }}>
            Running health checks...
          </div>
        ) : (
          <div>
            {healthChecks.map((check, index) => (
              <div
                key={check.name}
                style={{
                  padding: '1.5rem',
                  borderBottom: index < healthChecks.length - 1 ? colors.cardBorder : 'none',
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 120px 100px',
                  gap: '1rem',
                  alignItems: 'center'
                }}
              >
                <div>
                  {getStatusIcon(check.status)}
                </div>

                <div>
                  <div style={{ fontWeight: '600', color: colors.textPrimary, marginBottom: '0.25rem' }}>
                    {check.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                    {check.message}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                    Response Time
                  </div>
                  <div style={{
                    fontWeight: '600',
                    color: check.responseTime < 500 ? '#16a34a' : check.responseTime < 1000 ? '#f59e0b' : '#dc2626'
                  }}>
                    {check.responseTime}ms
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    background: check.status === 'healthy'
                      ? 'rgba(22, 163, 74, 0.1)'
                      : check.status === 'warning'
                      ? 'rgba(245, 158, 11, 0.1)'
                      : 'rgba(220, 38, 38, 0.1)',
                    color: getStatusColor(check.status)
                  }}>
                    {check.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}
