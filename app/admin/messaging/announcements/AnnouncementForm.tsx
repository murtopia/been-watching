'use client'

import { useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { createClient } from '@/utils/supabase/client'
import { Send, Check, AlertCircle } from 'lucide-react'

type AnnouncementType = 'announcement' | 'feature_release' | 'maintenance'
type TargetAudience = 'all' | 'incomplete_profiles' | 'active_users'
type ActionType = 'internal' | 'external' | 'none'

export default function AnnouncementForm() {
  const colors = useThemeColors()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>('announcement')
  const [icon, setIcon] = useState('📢')
  const [hasAction, setHasAction] = useState(false)
  const [actionType, setActionType] = useState<ActionType>('internal')
  const [actionUrl, setActionUrl] = useState('')
  const [actionText, setActionText] = useState('')
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('all')
  const [sending, setSending] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; recipients?: number } | null>(null)

  const getSeasonalIcons = () => {
    const month = new Date().getMonth() // 0-11
    const baseIcons = ['📢', '🎉', '✨', '🚀', '⚡', '🔧']

    // October: Halloween
    if (month === 9) {
      return [...baseIcons, '🎃', '👻', '🦇', '🕷️', '💀', '🍂']
    }
    // November-December: Holidays
    else if (month === 10 || month === 11) {
      return [...baseIcons, '🎄', '🎅', '❄️', '⛄', '🎁', '🦃']
    }
    // January-February: Winter/Valentine's
    else if (month === 0 || month === 1) {
      return [...baseIcons, '❄️', '⛄', '💝', '💘', '🎊', '🎆']
    }
    // March-April: Spring
    else if (month === 2 || month === 3) {
      return [...baseIcons, '🌸', '🌷', '🌼', '🦋', '🐣', '☘️']
    }
    // May-June: Summer
    else if (month === 4 || month === 5) {
      return [...baseIcons, '☀️', '🌻', '🌊', '🏖️', '🍉', '🌺']
    }
    // July-August: Summer
    else if (month === 6 || month === 7) {
      return [...baseIcons, '🏖️', '🌊', '☀️', '🍦', '🎆', '🔥']
    }
    // September: Fall
    return [...baseIcons, '🍂', '🍁', '🎃', '🌾', '🍄', '🦊']
  }

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      alert('Please enter both title and message')
      return
    }

    if (hasAction && (!actionUrl.trim() || !actionText.trim())) {
      alert('Please fill in both action URL and button text')
      return
    }

    setShowConfirm(true)
  }

  const confirmSend = async () => {
    setShowConfirm(false)
    setSending(true)
    setResult(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('send_global_announcement', {
        announcement_title: title.trim(),
        announcement_message: message.trim(),
        announcement_type: announcementType,
        announcement_icon: icon,
        action_type: hasAction ? actionType : 'none',
        action_url: hasAction ? actionUrl.trim() : null,
        action_text: hasAction ? actionText.trim() : null,
        target_audience: targetAudience
      })

      if (error) throw error

      setResult({
        success: true,
        message: 'Announcement sent successfully!',
        recipients: data?.recipients || 0
      })

      // Reset form
      setTitle('')
      setMessage('')
      setHasAction(false)
      setActionUrl('')
      setActionText('')

      // Reload page after 2 seconds to show new announcement in history
      setTimeout(() => window.location.reload(), 2000)
    } catch (error: any) {
      console.error('Error sending announcement:', error)
      setResult({
        success: false,
        message: 'Error: ' + error.message
      })
    } finally {
      setSending(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    border: colors.cardBorder,
    borderRadius: '8px',
    color: colors.textPrimary,
    fontSize: '0.875rem',
    outline: 'none'
  }

  return (
    <>
      <div style={{
        background: colors.cardBg,
        border: colors.cardBorder,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          color: colors.textPrimary,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📢 Send Announcement
        </h2>

        {/* Title */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            color: colors.textSecondary,
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
            fontWeight: 600
          }}>
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Earn Invite Codes!"
            style={inputStyle}
          />
        </div>

        {/* Message */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            color: colors.textSecondary,
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
            fontWeight: 600
          }}>
            Message *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Complete your profile to unlock invite codes and invite your friends!"
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Type and Icon Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {/* Type Selector */}
          <div>
            <label style={{
              display: 'block',
              color: colors.textSecondary,
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: 600
            }}>
              Type
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setAnnouncementType('announcement')}
                style={{
                  padding: '0.5rem 1rem',
                  background: announcementType === 'announcement' ? 'rgba(59, 130, 246, 0.2)' : colors.cardBg,
                  border: `1px solid ${announcementType === 'announcement' ? '#3b82f6' : colors.cardBorder.split(' ')[2]}`,
                  borderRadius: '6px',
                  color: announcementType === 'announcement' ? '#3b82f6' : colors.textPrimary,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Announcement
              </button>
              <button
                onClick={() => setAnnouncementType('feature_release')}
                style={{
                  padding: '0.5rem 1rem',
                  background: announcementType === 'feature_release' ? 'rgba(168, 85, 247, 0.2)' : colors.cardBg,
                  border: `1px solid ${announcementType === 'feature_release' ? '#a855f7' : colors.cardBorder.split(' ')[2]}`,
                  borderRadius: '6px',
                  color: announcementType === 'feature_release' ? '#a855f7' : colors.textPrimary,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Feature
              </button>
              <button
                onClick={() => setAnnouncementType('maintenance')}
                style={{
                  padding: '0.5rem 1rem',
                  background: announcementType === 'maintenance' ? 'rgba(239, 68, 68, 0.2)' : colors.cardBg,
                  border: `1px solid ${announcementType === 'maintenance' ? '#ef4444' : colors.cardBorder.split(' ')[2]}`,
                  borderRadius: '6px',
                  color: announcementType === 'maintenance' ? '#ef4444' : colors.textPrimary,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Maintenance
              </button>
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label style={{
              display: 'block',
              color: colors.textSecondary,
              fontSize: '0.875rem',
              marginBottom: '0.5rem',
              fontWeight: 600
            }}>
              Icon
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {getSeasonalIcons().map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  style={{
                    padding: '0.5rem',
                    background: icon === emoji ? 'rgba(233, 77, 136, 0.2)' : colors.cardBg,
                    border: `1px solid ${icon === emoji ? colors.goldAccent : colors.cardBorder.split(' ')[2]}`,
                    borderRadius: '6px',
                    fontSize: '1.25rem',
                    cursor: 'pointer'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button Section */}
        <div style={{
          padding: '1rem',
          background: colors.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
          border: colors.cardBorder,
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={hasAction}
              onChange={(e) => setHasAction(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span style={{ color: colors.textPrimary, fontSize: '0.875rem', fontWeight: 600 }}>
              Add Action Button
            </span>
          </label>

          {hasAction && (
            <>
              {/* Action Type */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <button
                    onClick={() => setActionType('internal')}
                    style={{
                      padding: '0.5rem 1rem',
                      background: actionType === 'internal' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                      border: `1px solid ${actionType === 'internal' ? '#22c55e' : colors.cardBorder.split(' ')[2]}`,
                      borderRadius: '6px',
                      color: actionType === 'internal' ? '#22c55e' : colors.textPrimary,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Internal Link
                  </button>
                  <button
                    onClick={() => setActionType('external')}
                    style={{
                      padding: '0.5rem 1rem',
                      background: actionType === 'external' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                      border: `1px solid ${actionType === 'external' ? '#22c55e' : colors.cardBorder.split(' ')[2]}`,
                      borderRadius: '6px',
                      color: actionType === 'external' ? '#22c55e' : colors.textPrimary,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    External URL
                  </button>
                </div>
              </div>

              {/* Action URL */}
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{
                  display: 'block',
                  color: colors.textSecondary,
                  fontSize: '0.75rem',
                  marginBottom: '0.25rem'
                }}>
                  {actionType === 'internal' ? 'Path' : 'URL'}
                </label>
                <input
                  type="text"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder={actionType === 'internal' ? '/profile' : 'https://beenwatching.com/blog'}
                  style={{
                    ...inputStyle,
                    padding: '0.5rem',
                    fontSize: '0.75rem'
                  }}
                />
              </div>

              {/* Action Text */}
              <div>
                <label style={{
                  display: 'block',
                  color: colors.textSecondary,
                  fontSize: '0.75rem',
                  marginBottom: '0.25rem'
                }}>
                  Button Text
                </label>
                <input
                  type="text"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="Complete Profile"
                  maxLength={20}
                  style={{
                    ...inputStyle,
                    padding: '0.5rem',
                    fontSize: '0.75rem'
                  }}
                />
                <span style={{
                  fontSize: '0.625rem',
                  color: colors.textSecondary,
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  {actionText.length}/20 characters
                </span>
              </div>

              {/* Preview */}
              {actionText && (
                <div style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: colors.cardBorder
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    color: colors.textSecondary,
                    marginBottom: '0.5rem',
                    display: 'block'
                  }}>
                    Button Preview:
                  </span>
                  <button
                    style={{
                      padding: '0.5rem 1rem',
                      background: colors.goldAccent,
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {actionText} {actionType === 'external' ? '↗' : '→'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Target Audience */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            color: colors.textSecondary,
            fontSize: '0.875rem',
            marginBottom: '0.5rem',
            fontWeight: 600
          }}>
            Target Audience
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setTargetAudience('all')}
              style={{
                padding: '0.5rem 1rem',
                background: targetAudience === 'all' ? 'rgba(34, 197, 94, 0.2)' : colors.cardBg,
                border: `1px solid ${targetAudience === 'all' ? '#22c55e' : colors.cardBorder.split(' ')[2]}`,
                borderRadius: '6px',
                color: targetAudience === 'all' ? '#22c55e' : colors.textPrimary,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              All Users
            </button>
            <button
              onClick={() => setTargetAudience('incomplete_profiles')}
              style={{
                padding: '0.5rem 1rem',
                background: targetAudience === 'incomplete_profiles' ? 'rgba(251, 191, 36, 0.2)' : colors.cardBg,
                border: `1px solid ${targetAudience === 'incomplete_profiles' ? '#fbbf24' : colors.cardBorder.split(' ')[2]}`,
                borderRadius: '6px',
                color: targetAudience === 'incomplete_profiles' ? '#fbbf24' : colors.textPrimary,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Incomplete Profiles
            </button>
            <button
              onClick={() => setTargetAudience('active_users')}
              style={{
                padding: '0.5rem 1rem',
                background: targetAudience === 'active_users' ? 'rgba(59, 130, 246, 0.2)' : colors.cardBg,
                border: `1px solid ${targetAudience === 'active_users' ? '#3b82f6' : colors.cardBorder.split(' ')[2]}`,
                borderRadius: '6px',
                color: targetAudience === 'active_users' ? '#3b82f6' : colors.textPrimary,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Active Users (30d)
            </button>
          </div>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={sending || !title.trim() || !message.trim()}
          style={{
            width: '100%',
            padding: '1rem',
            background: sending || !title.trim() || !message.trim()
              ? colors.textSecondary
              : colors.goldAccent,
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: sending || !title.trim() || !message.trim() ? 'not-allowed' : 'pointer',
            opacity: sending || !title.trim() || !message.trim() ? 0.6 : 1,
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Send size={18} />
          {sending ? 'Sending...' : 'Send Announcement'}
        </button>

        {/* Result Message */}
        {result && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: result.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${result.success ? '#22c55e' : '#ef4444'}`,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {result.success ? <Check size={18} color="#22c55e" /> : <AlertCircle size={18} color="#ef4444" />}
            <div>
              <div style={{
                color: result.success ? '#22c55e' : '#ef4444',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}>
                {result.message}
              </div>
              {result.success && result.recipients && (
                <div style={{ color: colors.textSecondary, fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Sent to {result.recipients} users
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: colors.cardBg,
            border: colors.cardBorder,
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: colors.textPrimary
            }}>
              Confirm Send Announcement
            </h3>
            <p style={{ color: colors.textSecondary, marginBottom: '1.5rem' }}>
              Are you sure you want to send this announcement to <strong>{targetAudience.replace('_', ' ')}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '0.5rem 1rem',
                  background: colors.cardBg,
                  border: colors.cardBorder,
                  borderRadius: '8px',
                  color: colors.textPrimary,
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmSend}
                style={{
                  padding: '0.5rem 1rem',
                  background: colors.goldAccent,
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
