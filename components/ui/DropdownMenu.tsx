'use client'

import { useState, useRef, useEffect } from 'react'
import { useThemeColors } from '@/hooks/useThemeColors'
import { MoreVertical } from 'lucide-react'

export interface MenuItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  danger?: boolean
  show?: boolean
}

interface DropdownMenuProps {
  items: MenuItem[]
  size?: number
}

export default function DropdownMenu({ items, size = 20 }: DropdownMenuProps) {
  const colors = useThemeColors()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Filter out items with show: false
  const visibleItems = items.filter(item => item.show !== false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (visibleItems.length === 0) return null

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="dropdown-menu-button"
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
          transition: 'all 0.2s'
        }}
      >
        <MoreVertical size={size} />
        <style jsx>{`
          .dropdown-menu-button:hover {
            background: ${colors.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} !important;
            color: ${colors.textPrimary} !important;
          }
        `}</style>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.25rem',
            background: colors.cardBg,
            backdropFilter: 'blur(20px)',
            border: colors.cardBorder,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            minWidth: '180px',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          {visibleItems.map((item, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                item.onClick()
                setIsOpen(false)
              }}
              className={`dropdown-menu-item ${item.danger ? 'danger' : ''}`}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'none',
                border: 'none',
                borderBottom: index < visibleItems.length - 1 ? colors.cardBorder : 'none',
                color: item.danger ? '#EF4444' : colors.textPrimary,
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'background 0.2s',
                textAlign: 'left'
              }}
            >
              {item.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
          <style jsx>{`
            .dropdown-menu-item:hover {
              background: ${colors.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'} !important;
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
