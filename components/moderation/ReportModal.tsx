'use client'

import { useState } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { X, AlertTriangle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  reportType: 'activity' | 'comment' | 'user'
  targetId: string // activity_id, comment_id, or user_id
  targetUsername?: string // for displaying context
  targetContent?: string // for displaying context
}

export default function ReportModal({
  isOpen,
  onClose,
  reportType,
  targetId,
  targetUsername,
  targetContent
}: ReportModalProps) {
  const colors = useThemeColors()
  const supabase = createClient()

  const [selectedReason, setSelectedReason] = useState('')
  const [additionalDetails, setAdditionalDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Report reasons based on type
  const getReportReasons = () => {
    const commonReasons = {
      spam: 'Spam or misleading content',
      harassment: 'Harassment or bullying',
      inappropriate: 'Inappropriate or offensive content',
      hate_speech: 'Hate speech or discrimination',
      violence: 'Violence or threats',
      other: 'Other (please specify)'
    }

    if (reportType === 'user') {
      return {
        ...commonReasons,
        fake_account: 'Fake or impersonation account',
        bot: 'Suspected bot account'
      }
    }

    return commonReasons
  }

  const reportReasons = getReportReasons()

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError('Please select a reason for reporting')
      return
    }

    if (selectedReason === 'other' && !additionalDetails.trim()) {
      setError('Please provide additional details')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to report content')
      }

      // Prepare report data
      const reportData: any = {
        reporter_id: user.id,
        report_type: selectedReason,
        reason: additionalDetails || reportReasons[selectedReason as keyof typeof reportReasons],
        status: 'pending',
        created_at: new Date().toISOString()
      }

      // Add type-specific fields
      if (reportType === 'activity') {
        reportData.content_type = 'activity'
        reportData.content_id = targetId
      } else if (reportType === 'comment') {
        reportData.content_type = 'comment'
        reportData.content_id = targetId
      } else if (reportType === 'user') {
        reportData.reported_user_id = targetId
        reportData.content_type = 'user'
      }

      // Submit report
      const { error: insertError } = await supabase
        .from('reports')
        .insert([reportData])

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => {
        onClose()
        // Reset form
        setSelectedReason('')
        setAdditionalDetails('')
        setSuccess(false)
      }, 2000)

    } catch (err: any) {
      console.error('Error submitting report:', err)
      setError(err.message || 'Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }} onClick={onClose}>
      <div
        style={{
          background: colors.cardBg,
          backdropFilter: 'blur(20px)',
          border: colors.cardBorder,
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem',
          borderBottom: colors.cardBorder
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={24} color={colors.brandPink} />
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: colors.textPrimary,
              margin: 0
            }}>
              Report {reportType === 'user' ? 'User' : 'Content'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: colors.textSecondary,
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Context */}
          {(targetUsername || targetContent) && (
            <div style={{
              padding: '1rem',
              background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: colors.cardBorder
            }}>
              {targetUsername && (
                <div style={{
                  fontSize: '0.875rem',
                  color: colors.textSecondary,
                  marginBottom: targetContent ? '0.5rem' : 0
                }}>
                  Reporting: <span style={{ color: colors.textPrimary, fontWeight: 500 }}>@{targetUsername}</span>
                </div>
              )}
              {targetContent && (
                <div style={{
                  fontSize: '0.875rem',
                  color: colors.textSecondary,
                  fontStyle: 'italic',
                  maxHeight: '4rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  "{targetContent}"
                </div>
              )}
            </div>
          )}

          {success ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: colors.textPrimary
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#4CAF50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.5rem'
              }}>
                ✓
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Report Submitted
              </div>
              <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                Thank you for helping keep the community safe
              </div>
            </div>
          ) : (
            <>
              {/* Report Reasons */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: colors.textPrimary,
                  marginBottom: '0.75rem'
                }}>
                  Reason for report *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(reportReasons).map(([key, label]) => (
                    <label
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        background: selectedReason === key
                          ? (colors.isDark ? 'rgba(233, 77, 136, 0.1)' : 'rgba(233, 77, 136, 0.08)')
                          : 'transparent',
                        border: selectedReason === key ? `1px solid ${colors.brandPink}` : colors.cardBorder,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedReason !== key) {
                          e.currentTarget.style.background = colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedReason !== key) {
                          e.currentTarget.style.background = 'transparent'
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={key}
                        checked={selectedReason === key}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: colors.brandPink
                        }}
                      />
                      <span style={{
                        fontSize: '0.875rem',
                        color: colors.textPrimary,
                        flex: 1
                      }}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: colors.textPrimary,
                  marginBottom: '0.75rem'
                }}>
                  Additional details {selectedReason === 'other' && '*'}
                </label>
                <textarea
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Provide more context about this report..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '0.75rem',
                    background: colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    border: colors.cardBorder,
                    borderRadius: '8px',
                    color: colors.textPrimary,
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#EF4444',
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem'
                }}>
                  {error}
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    border: colors.cardBorder,
                    borderRadius: '8px',
                    color: colors.textPrimary,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !selectedReason}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: (!selectedReason || isSubmitting)
                      ? colors.textSecondary
                      : colors.brandGradient,
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: (!selectedReason || isSubmitting) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: (!selectedReason || isSubmitting) ? 0.5 : 1
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
