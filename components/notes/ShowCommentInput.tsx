'use client'

import { useState, useEffect } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'

interface ShowCommentInputProps {
  mediaId: string
  userId: string
  existingComment?: {
    id: string
    comment_text: string
  } | null
  onSave: (commentText: string) => Promise<void>
  onDelete?: () => Promise<void>
  placeholder?: string
  autoFocus?: boolean
}

export default function ShowCommentInput({
  mediaId,
  userId,
  existingComment,
  onSave,
  onDelete,
  placeholder = "Add a comment... (@mention friends, share your thoughts, etc.)",
  autoFocus = false
}: ShowCommentInputProps) {
  const colors = useThemeColors()
  const [commentText, setCommentText] = useState(existingComment?.comment_text || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(!existingComment || autoFocus)

  const MAX_CHARS = 280
  const charCount = commentText.length
  const isNearLimit = charCount > 240
  const isAtLimit = charCount >= MAX_CHARS

  useEffect(() => {
    if (existingComment) {
      setCommentText(existingComment.comment_text)
    }
  }, [existingComment])

  const handleSave = async () => {
    if (commentText.trim().length === 0 || commentText.length > MAX_CHARS || isSaving) return

    setIsSaving(true)
    try {
      await onSave(commentText.trim())
      setIsEditing(false) // Close editor after save
    } catch (error) {
      console.error('Error saving comment:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || isSaving) return

    setIsSaving(true)
    try {
      await onDelete()
      setCommentText('')
      setIsEditing(false)
    } catch (error) {
      console.error('Error deleting comment:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + Enter to save
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  // Instagram-style display: Show comment content when not editing
  if (!isEditing && existingComment) {
    return (
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1rem',
        transition: 'all 0.2s'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Comment content */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.9rem',
              color: colors.textPrimary,
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {existingComment.comment_text}
            </div>
          </div>

          {/* Edit button */}
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: '0.5rem 0.75rem',
              background: colors.buttonBg,
              border: colors.buttonBorder,
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: colors.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.buttonBgHover
              e.currentTarget.style.color = colors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.buttonBg
              e.currentTarget.style.color = colors.textSecondary
            }}
          >
            Edit
          </button>
        </div>
      </div>
    )
  }

  // Show add comment prompt when no comment exists and not editing
  if (!isEditing && !existingComment) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        style={{
          padding: '1rem',
          background: colors.inputBg,
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: '12px',
          cursor: 'text',
          color: colors.inputPlaceholder,
          fontSize: '0.9rem',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = colors.brandPink
          e.currentTarget.style.background = colors.cardBg
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = colors.inputBorder
          e.currentTarget.style.background = colors.inputBg
        }}
      >
        💬 {placeholder}
      </div>
    )
  }

  return (
    <div style={{
      background: colors.cardBg,
      border: `1px solid ${colors.inputBorderFocus}`,
      borderRadius: '12px',
      padding: '1rem',
      transition: 'all 0.2s'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: colors.textPrimary
        }}>
          💬 Add a comment
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: isAtLimit ? colors.error : isNearLimit ? colors.warning : colors.textTertiary,
          fontWeight: isNearLimit ? '600' : '400'
        }}>
          {charCount}/{MAX_CHARS}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={MAX_CHARS}
        disabled={isSaving}
        className="note-input-textarea"
        style={{
          width: '100%',
          minHeight: '80px',
          padding: '0.75rem',
          background: colors.inputBg,
          border: `1px solid ${colors.inputBorder}`,
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: colors.textPrimary,
          lineHeight: '1.5',
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 0.2s'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = colors.brandPink
        }}
        onBlur={(e) => {
          e.target.style.borderColor = colors.inputBorder
        }}
      />

      {/* Footer Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: '0.75rem',
        gap: '0.5rem'
      }}>
        {/* Delete Button - Only show if existing comment */}
        {existingComment && onDelete && (
          <button
            onClick={handleDelete}
            disabled={isSaving}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: `1px solid ${colors.error}`,
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: colors.error,
              cursor: 'pointer',
              opacity: isSaving ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.background = colors.error
                e.currentTarget.style.color = 'white'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = colors.error
            }}
          >
            Delete
          </button>
        )}

        {/* Cancel Button */}
        <button
          onClick={() => {
            setIsEditing(false)
            setCommentText(existingComment?.comment_text || '')
          }}
          disabled={isSaving}
          style={{
            padding: '0.5rem 1rem',
            background: 'transparent',
            border: colors.buttonBorder,
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: colors.textSecondary,
            cursor: 'pointer',
            opacity: isSaving ? 0.5 : 1,
            transition: 'all 0.2s'
          }}
        >
          Cancel
        </button>

        {/* Save/Update Button */}
        <button
          onClick={handleSave}
          disabled={commentText.trim().length === 0 || charCount > MAX_CHARS || isSaving}
          style={{
            padding: '0.5rem 1.5rem',
            background: commentText.trim().length === 0 || charCount > MAX_CHARS ? colors.buttonBg : colors.brandGradient,
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: 'white',
            cursor: commentText.trim().length === 0 || charCount > MAX_CHARS ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1,
            transition: 'all 0.2s'
          }}
        >
          {isSaving ? 'Saving...' : existingComment ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  )
}
