'use client'

import { useThemeColors } from '@/hooks/useThemeColors'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  subtitle?: string
  loading?: boolean
  onClick?: () => void
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  loading = false,
  onClick
}: MetricCardProps) {
  const colors = useThemeColors()

  const getTrendColor = () => {
    if (!trend) return colors.textSecondary
    if (trend.value > 0) return colors.success
    if (trend.value < 0) return colors.error
    return colors.textSecondary
  }

  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.value > 0) return <TrendingUp size={14} />
    if (trend.value < 0) return <TrendingDown size={14} />
    return <Minus size={14} />
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: colors.cardBg,
        backdropFilter: 'blur(20px)',
        border: colors.cardBorder,
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = `0 8px 20px ${colors.goldAccent}1A`
          e.currentTarget.style.borderColor = colors.goldAccent
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
          e.currentTarget.style.borderColor = colors.borderColor
        }
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{
          fontSize: '0.875rem',
          fontWeight: 500,
          color: colors.textSecondary
        }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: colors.goldGlassBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.goldAccent
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      {/* Value */}
      {loading ? (
        <div style={{
          height: '36px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            width: '100px',
            height: '24px',
            background: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        </div>
      ) : (
        <div style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: colors.textPrimary,
          lineHeight: 1
        }}>
          {value}
        </div>
      )}

      {/* Trend or Subtitle */}
      {!loading && (trend || subtitle) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem'
        }}>
          {trend && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: getTrendColor(),
              fontWeight: 600
            }}>
              {getTrendIcon()}
              <span>{Math.abs(trend.value)}%</span>
              <span style={{ color: colors.textSecondary, fontWeight: 400 }}>
                {trend.label}
              </span>
            </div>
          )}
          {subtitle && !trend && (
            <span style={{ color: colors.textSecondary }}>
              {subtitle}
            </span>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
